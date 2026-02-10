import express from 'express';
import { parse, format } from 'date-fns';
import { z } from 'zod';

function toMins(slotOrDate) {
  const str = typeof slotOrDate === 'string'
    ? slotOrDate
    : format(new Date(slotOrDate), 'HH:mm');
  const [h, m] = str.split(':').map(Number);
  return h * 60 + m;
}

const createPreferenceSchema = z.object({
  courtId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slots: z.array(z.string().regex(/^\d{2}:\d{2}$/)).min(1),
  sport: z.enum(['BEACH_TENNIS', 'VOLEI', 'FUTVOLEI'])
});

export const paymentsRouter = express.Router();

paymentsRouter.post('/payments/create-preference', (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Não autenticado' });
  }
  next();
}, async (req, res, next) => {
  try {

    const parsed = createPreferenceSchema.parse(req.body);
    const { courtId, date, slots, sport } = parsed;

    const court = await req.prisma.court.findUnique({
      where: { id: courtId }
    });
    if (!court) {
      return res.status(404).json({ message: 'Quadra não encontrada' });
    }

    const totalAmount = court.pricePerHour * slots.length;
    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'Valor inválido' });
    }

    const dayDate = parse(date, 'yyyy-MM-dd', new Date());
    const existing = await req.prisma.booking.findMany({
      where: { courtId, date: dayDate, status: 'ACTIVE' }
    });

    for (const slot of slots) {
      const sMins = toMins(slot);
      const eMins = sMins + 60;
      const conflict = existing.some((b) => {
        const bStart = toMins(b.startTime);
        const bEnd = bStart + 60;
        return sMins < bEnd && eMins > bStart;
      });
      if (conflict) {
        return res.status(409).json({ message: `Horário ${slot} já está reservado.` });
      }
    }

    const pending = await req.prisma.pendingPayment.create({
      data: {
        userId: req.user.id,
        courtId,
        date: dayDate,
        slots: JSON.stringify(slots),
        sport,
        totalAmount,
        status: 'PENDING'
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

    const preferenceBody = {
      items: [
        {
          id: `booking-${pending.id}`,
          title: `A Beach Arena - ${court.name}`,
          description: `${slots.length} hora(s) • ${sport} • ${date}`,
          quantity: 1,
          currency_id: 'BRL',
          unit_price: totalAmount
        }
      ],
      payer: {
        email: req.user.email
      },
      external_reference: String(pending.id),
      back_urls: {
        success: `${frontendUrl}/booking/success`,
        failure: `${frontendUrl}/booking/failure`,
        pending: `${frontendUrl}/booking/pending`
      },
      auto_return: 'approved',
      notification_url: `${backendUrl}/api/payments/webhook`
    };

    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
      },
      body: JSON.stringify(preferenceBody)
    });

    if (!mpRes.ok) {
      const errData = await mpRes.json().catch(() => ({}));
      console.error('Mercado Pago error:', errData);
      await req.prisma.pendingPayment.update({
        where: { id: pending.id },
        data: { status: 'REJECTED' }
      });
      return res.status(502).json({
        message: 'Erro ao criar pagamento. Verifique as credenciais do Mercado Pago.'
      });
    }

    const mpData = await mpRes.json();
    const initPoint = mpData.sandbox_init_point || mpData.init_point;

    await req.prisma.pendingPayment.update({
      where: { id: pending.id },
      data: { mpPreferenceId: mpData.id }
    });

    return res.json({ initPoint, pendingId: pending.id });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados inválidos', issues: err.issues });
    }
    next(err);
  }
});

paymentsRouter.post('/payments/webhook', async (req, res, next) => {
  try {
    const paymentId = req.body?.data?.id ?? req.query?.['data.id'];
    if (!paymentId) {
      return res.status(200).send('OK');
    }

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }
    });
    if (!paymentRes.ok) {
      return res.status(200).send('OK');
    }

    const payment = await paymentRes.json();
    if (payment.status !== 'approved') {
      return res.status(200).send('OK');
    }

    const externalRef = payment.external_reference;
    const pendingId = parseInt(externalRef, 10);
    if (Number.isNaN(pendingId)) {
      return res.status(200).send('OK');
    }

    const pending = await req.prisma.pendingPayment.findUnique({
      where: { id: pendingId },
      include: { court: true }
    });
    if (!pending || pending.status !== 'PENDING') {
      return res.status(200).send('OK');
    }

    const slots = JSON.parse(pending.slots);
    const dayDate = pending.date;

    for (const slot of slots) {
      const [h, m] = slot.split(':').map(Number);
      const start = new Date(dayDate);
      start.setHours(h, m, 0, 0);
      const end = new Date(start);
      end.setHours(h + 1, m, 0, 0);

      await req.prisma.booking.create({
        data: {
          userId: pending.userId,
          courtId: pending.courtId,
          sport: pending.sport,
          date: dayDate,
          startTime: start,
          endTime: end,
          status: 'ACTIVE'
        }
      });
    }

    await req.prisma.pendingPayment.update({
      where: { id: pendingId },
      data: { status: 'APPROVED' }
    });

    return res.status(200).send('OK');
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(200).send('OK');
  }
});

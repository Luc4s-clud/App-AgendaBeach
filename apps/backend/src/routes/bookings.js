import express from 'express';
import { parse } from 'date-fns';
import { bookingCreateSchema, bookingQuerySchema } from '@abeach/shared';
import { notifyAdminNewBookingTelegram } from '../services/telegram.js';

export const bookingsRouter = express.Router();

// Lista reservas por quadra + data OU reservas do usuário (para "Meus Agendamentos")
bookingsRouter.get('/bookings', async (req, res, next) => {
  try {
    const hasCourtAndDate = req.query.courtId && req.query.date;

    // Modo admin: lista últimas reservas independente de usuário/quadra
    if (req.query.admin === 'true' && req.user?.role === 'ADMIN') {
      const bookings = await req.prisma.booking.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          court: true
        },
        orderBy: [{ date: 'desc' }, { startTime: 'desc' }],
        take: 100
      });
      return res.json(bookings);
    }

    if (hasCourtAndDate) {
      const { courtId, date } = bookingQuerySchema.parse(req.query);

      const dayDate = parse(date, 'yyyy-MM-dd', new Date());

      const bookings = await req.prisma.booking.findMany({
        where: {
          courtId,
          date: dayDate,
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: { id: true, name: true }
          }
        },
        orderBy: { startTime: 'asc' }
      });

      return res.json(bookings);
    }

    // Se não houver filtros, retorna "meus agendamentos" (requer auth)
    if (!req.user) {
      return res
        .status(400)
        .json({ message: 'courtId e date são obrigatórios, ou use token para listar seus agendamentos.' });
    }

    const myBookings = await req.prisma.booking.findMany({
      where: {
        userId: req.user.id
      },
      include: {
        court: true
      },
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ]
    });

    return res.json(myBookings);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Parâmetros inválidos', issues: err.issues });
    }
    next(err);
  }
});

// Cria reserva
bookingsRouter.post('/bookings', async (req, res, next) => {
  try {
    const parsed = bookingCreateSchema.parse(req.body);
    const { courtId, sport, date, startTime, endTime } = parsed;

    const dayDate = parse(date, 'yyyy-MM-dd', new Date());
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());

    if (end <= start) {
      return res.status(400).json({ message: 'Horário final deve ser depois do inicial' });
    }

    const existing = await req.prisma.booking.findMany({
      where: { courtId, date: dayDate, status: 'ACTIVE' }
    });

    const toMins = (d) => d.getHours() * 60 + d.getMinutes();
    const sMins = toMins(start);
    const eMins = toMins(end);

    const overlaps = existing.some((b) => {
      const bStart = toMins(new Date(b.startTime));
      const bEnd = toMins(new Date(b.endTime));
      return sMins < bEnd && eMins > bStart;
    });

    if (overlaps) {
      return res.status(409).json({ message: 'Alguns horários já estão reservados. Tente outros horários.' });
    }

    try {
      const booking = await req.prisma.booking.create({
        data: {
          userId: req.user.id,
          courtId,
          sport,
          date: dayDate,
          startTime: start,
          endTime: end,
          status: 'ACTIVE'
        }
      });

      // Notificação assíncrona para o admin via Telegram
      req.prisma.court
        .findUnique({ where: { id: courtId } })
        .then((court) =>
          notifyAdminNewBookingTelegram({
            booking,
            user: req.user,
            court
          })
        )
        .catch((err) => {
          console.error('Erro ao buscar quadra para notificação Telegram:', err);
        });

      return res.status(201).json(booking);
    } catch (err) {
      if (err.code === 'P2002') {
        return res.status(409).json({ message: 'Horário já reservado para esta quadra e data' });
      }
      throw err;
    }
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ message: 'Dados inválidos', issues: err.issues });
    }
    next(err);
  }
});

// Cancela reserva (dono ou ADMIN)
bookingsRouter.delete('/bookings/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ message: 'ID inválido' });
    }

    const booking = await req.prisma.booking.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Reserva não encontrada' });
    }

    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Você não pode cancelar esta reserva' });
    }

    const updated = await req.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELED' }
    });

    return res.json(updated);
  } catch (err) {
    next(err);
  }
});


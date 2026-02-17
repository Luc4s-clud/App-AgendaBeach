// Envio de notificações via WhatsApp (WhatsApp Cloud API)
// Configurar no .env:
// WHATSAPP_TOKEN="EA..."
// WHATSAPP_PHONE_ID="1234567890"
// ADMIN_WHATSAPP_NUMBER="55DDDXXXXXXXX"  // sem o +

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_ID = process.env.WHATSAPP_PHONE_ID;
const ADMIN_WHATSAPP_NUMBER = process.env.ADMIN_WHATSAPP_NUMBER;
const WHATSAPP_API_VERSION = process.env.WHATSAPP_API_VERSION || 'v20.0';

export async function notifyAdminNewBooking({ booking, user, court }) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID || !ADMIN_WHATSAPP_NUMBER) {
    // Configuração ausente: não faz nada para não quebrar o fluxo
    return;
  }

  try {
    const dateStr = booking.date instanceof Date
      ? booking.date.toISOString().slice(0, 10)
      : booking.date;

    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

    const body = [
      '📅 Nova reserva na A Beach Arena',
      '',
      `Cliente: ${user?.name ?? 'Desconhecido'} (${user?.email ?? '-'})`,
      `Quadra: ${court?.name ?? booking.courtId}`,
      `Data: ${dateStr}`,
      `Horário: ${startStr} - ${endStr}`,
      '',
      'Ver no painel: /admin → Agendamentos'
    ].join('\n');

    const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_ID}/messages`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: ADMIN_WHATSAPP_NUMBER,
        type: 'text',
        text: { body }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      console.error('Erro ao enviar WhatsApp para admin:', res.status, text);
    }
  } catch (err) {
    console.error('Erro inesperado ao enviar WhatsApp para admin:', err);
  }
}


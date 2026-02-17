// Envio de notificações via Telegram para o admin
// Configurar no .env:
// TELEGRAM_BOT_TOKEN="123456789:AA..."
// TELEGRAM_CHAT_ID="123456789"   // chat_id do admin

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function notifyAdminNewBookingTelegram({ booking, user, court }) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    // Sem configuração, não faz nada.
    return;
  }

  try {
    const dateStr =
      booking.date instanceof Date
        ? booking.date.toISOString().slice(0, 10)
        : booking.date;

    const start = new Date(booking.startTime);
    const end = new Date(booking.endTime);

    const pad = (n) => String(n).padStart(2, '0');
    const startStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

    const lines = [
      '📅 *Nova reserva na A Beach Arena*',
      '',
      `*Cliente:* ${user?.name ?? 'Desconhecido'} (${user?.email ?? '-'})`,
      `*Quadra:* ${court?.name ?? booking.courtId}`,
      `*Data:* ${dateStr}`,
      `*Horário:* ${startStr} - ${endStr}`,
      '',
      'Ver no painel: `/admin` → Agendamentos'
    ];

    const text = lines.join('\n');

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      })
    });

    if (!res.ok) {
      const body = await res.text();
      console.error('Erro ao enviar Telegram para admin:', res.status, body);
    }
  } catch (err) {
    console.error('Erro inesperado ao enviar Telegram para admin:', err);
  }
}


import { format } from 'date-fns';

function generateSlots() {
  const slots = [];
  for (let hour = 6; hour < 23; hour += 1) {
    const h = hour.toString().padStart(2, '0');
    const label = `${h}:00`;
    slots.push(label);
  }
  return slots;
}

export const SLOTS = generateSlots();

export function TimeGrid({ bookings, myUserId, selectedSlots = [], onSlotClick, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-3">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div key={idx} className="h-10 rounded-xl bg-sand/60 animate-pulse" />
        ))}
      </div>
    );
  }

  const slotStatus = {};
  bookings?.forEach((booking) => {
    const startLabel = format(new Date(booking.startTime), 'HH:mm');
    slotStatus[startLabel] = booking;
  });

  function handleClick(slot) {
    const isOccupied = Boolean(slotStatus[slot]);
    if (isOccupied) return;
    onSlotClick?.(slot);
  }

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-3">
      {SLOTS.map((slot) => {
        const booking = slotStatus[slot];
        const isOccupied = Boolean(booking);
        const isMine = booking && booking.userId === myUserId;
        const isSelected = selectedSlots.includes(slot);

        const baseClasses =
          'h-10 rounded-xl text-xs font-semibold flex items-center justify-center transition border';

        if (isOccupied) {
          return (
            <div
              key={slot}
              className={`${baseClasses} bg-slate-200/80 border-slate-300 text-slateText/60 cursor-not-allowed ${
                isMine ? 'ring-2 ring-aqua ring-offset-2 ring-offset-sand' : ''
              }`}
              title={isMine ? 'Seu agendamento' : 'Horário ocupado'}
            >
              {slot}
            </div>
          );
        }

        return (
          <button
            key={slot}
            type="button"
            onClick={() => handleClick(slot)}
            className={`${baseClasses} ${
              isSelected
                ? 'bg-aqua text-white border-aqua ring-2 ring-aqua ring-offset-2 ring-offset-sand'
                : 'bg-aqua/10 text-slateText border-aqua/40 hover:bg-aqua/70 hover:text-white hover:border-aqua'
            }`}
            title={isSelected ? 'Clique para remover' : 'Clique para selecionar'}
          >
            {slot}
          </button>
        );
      })}
    </div>
  );
}


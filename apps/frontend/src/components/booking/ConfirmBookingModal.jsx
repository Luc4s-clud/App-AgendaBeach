import { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';

const SPORT_OPTIONS = [
  { value: 'BEACH_TENNIS', label: 'Beach Tennis' },
  { value: 'VOLEI', label: 'Vôlei de areia' },
  { value: 'FUTVOLEI', label: 'Futvôlei' }
];

export function ConfirmBookingModal({ open, onClose, onConfirm, court, date, selectedSlots = [], loading }) {
  const [sport, setSport] = useState(null);

  useEffect(() => {
    if (open) setSport(null);
  }, [open]);

  if (!open) return null;

  const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
  const sorted = [...selectedSlots].sort((a, b) => parseInt(a.split(':')[0], 10) - parseInt(b.split(':')[0], 10));
  const hours = sorted.length;
  const totalPrice = court?.pricePerHour != null ? court.pricePerHour * hours : 0;

  const formatSlotRange = (slot) => {
    const h = parseInt(slot.split(':')[0], 10);
    const end = `${String(h + 1).padStart(2, '0')}:00`;
    return `${slot} - ${end}`;
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm px-4">
      <div className="card max-w-sm w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-xs text-slateText/50 hover:text-slateText"
        >
          Fechar
        </button>

        <h2 className="text-base font-semibold text-slateText mb-4">Confirmar agendamento</h2>

        <div className="space-y-2 text-sm mb-5">
          <div>
            <p className="text-xs text-slateText/60">Quadra</p>
            <p className="font-semibold text-slateText">{court?.name}</p>
            <div className="mt-2">
              <p className="text-xs text-slateText/60 mb-1.5">
                Esporte (para preparar a quadra) <span className="text-ocean">*</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SPORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSport(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                      sport === opt.value
                        ? 'bg-ocean text-white'
                        : 'bg-sand/60 text-slateText/80 hover:bg-sand'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            {court?.pricePerHour != null && (
              <p className="text-xs text-ocean font-semibold mt-0.5">
                R$ {court.pricePerHour}/h × {hours} {hours > 1 ? 'horas' : 'hora'}
              </p>
            )}
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <p className="text-xs text-slateText/60">Data</p>
              <p className="font-semibold text-slateText">{format(parsedDate, 'dd/MM/yyyy')}</p>
            </div>
            <div className="w-full">
              <p className="text-xs text-slateText/60">Horários</p>
              <p className="font-semibold text-slateText">
                {sorted.map(formatSlotRange).join(' • ')}
              </p>
            </div>
          </div>
          {totalPrice > 0 && (
            <div className="pt-2 border-t border-sand/60">
              <p className="text-xs text-slateText/60">Valor total</p>
              <p className="font-semibold text-ocean text-lg">R$ {totalPrice}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={loading || selectedSlots.length === 0 || !sport}
          onClick={() => onConfirm(sport)}
          className="btn-primary w-full justify-center"
        >
          {loading ? 'Confirmando...' : 'Confirmar reserva'}
        </button>
      </div>
    </div>
  );
}


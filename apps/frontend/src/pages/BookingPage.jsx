import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { HorizontalDatePicker } from '../components/booking/HorizontalDatePicker.jsx';
import { CourtMap } from '../components/booking/CourtMap.jsx';
import { CourtSelector } from '../components/booking/CourtSelector.jsx';
import { TimeGrid } from '../components/booking/TimeGrid.jsx';
import { ConfirmBookingModal } from '../components/booking/ConfirmBookingModal.jsx';

function slotToEndTime(slot) {
  const [h, m] = slot.split(':').map(Number);
  const endH = h + 1;
  return `${String(endH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function BookingPage() {
  const [selectedDate, setSelectedDate] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [selectedCourtId, setSelectedCourtId] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();

  const courtsQuery = useQuery({
    queryKey: ['courts'],
    queryFn: async () => {
      const res = await api.get('/courts');
      return res.data;
    }
  });

  useEffect(() => {
    if (!selectedCourtId && courtsQuery.data?.length) {
      setSelectedCourtId(courtsQuery.data[0].id);
    }
  }, [courtsQuery.data, selectedCourtId]);

  useEffect(() => {
    setSelectedSlots([]);
  }, [selectedCourtId, selectedDate]);

  const bookingsQuery = useQuery({
    queryKey: ['bookings', { courtId: selectedCourtId, date: selectedDate }],
    enabled: !!selectedCourtId && !!selectedDate,
    queryFn: async () => {
      const res = await api.get('/bookings', {
        params: {
          courtId: selectedCourtId,
          date: selectedDate
        }
      });
      return res.data;
    }
  });

  const createBookingsMutation = useMutation({
    mutationFn: async ({ slots, sport }) => {
      for (const slot of slots) {
        await api.post('/bookings', {
          courtId: selectedCourtId,
          date: selectedDate,
          sport,
          startTime: slot,
          endTime: slotToEndTime(slot)
        });
      }
    },
    onSuccess: (_, { slots }) => {
      setModalOpen(false);
      setSelectedSlots([]);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success(`${slots.length} reserva(s) confirmada(s)!`);
      navigate('/booking/success');
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao confirmar reserva');
    }
  });

  function handleSlotClick(slot) {
    const idx = selectedSlots.indexOf(slot);
    if (idx >= 0) {
      setSelectedSlots((prev) => prev.filter((s) => s !== slot));
      return;
    }
    setSelectedSlots((prev) => [...prev, slot].sort((a, b) => parseInt(a.split(':')[0], 10) - parseInt(b.split(':')[0], 10)));
  }

  const selectedCourt =
    courtsQuery.data?.find((c) => c.id === selectedCourtId) ?? courtsQuery.data?.[0];

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end gap-2 md:gap-3 justify-between">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-slateText">Agendar quadra</h1>
          <p className="text-xs text-slateText/70">
            Escolha a data, a quadra e o horário para reservar seu jogo.
          </p>
        </div>
      </header>

      <section className="card p-4 md:p-5 space-y-4">
        <div>
          <p className="text-xs font-semibold text-slateText/80 mb-2">Data</p>
          <HorizontalDatePicker selectedDate={selectedDate} onChange={setSelectedDate} />
        </div>

        <div>
          <p className="text-xs font-semibold text-slateText/80 mb-2">Quadras</p>
          <div className="flex flex-col lg:flex-row gap-4 items-start">
            <div className="shrink-0 w-full lg:w-auto">
              <p className="text-[11px] text-slateText/60 mb-1.5 lg:mb-2">Clique na quadra para selecionar</p>
              <CourtMap
                courts={courtsQuery.data}
                selectedCourtId={selectedCourtId}
                onSelect={setSelectedCourtId}
                loading={courtsQuery.isLoading}
              />
            </div>
            <div className="flex-1 min-w-0 w-full lg:w-auto">
              <CourtSelector
                courts={courtsQuery.data}
                selectedCourtId={selectedCourtId}
                onSelect={setSelectedCourtId}
                loading={courtsQuery.isLoading}
              />
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
            <p className="text-xs font-semibold text-slateText/80">Horários</p>
            <p className="text-[11px] text-slateText/60">
              Clique para selecionar um ou mais horários • Cinza: ocupado • Contorno: seu agendamento
            </p>
          </div>
          <TimeGrid
            bookings={bookingsQuery.data}
            myUserId={user?.id}
            selectedSlots={selectedSlots}
            onSlotClick={handleSlotClick}
            loading={bookingsQuery.isLoading}
          />
          {selectedSlots.length > 0 && (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="mt-3 btn-primary w-full sm:w-auto"
            >
              Reservar {selectedSlots.length} hora{selectedSlots.length > 1 ? 's' : ''} selecionada{selectedSlots.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
      </section>

      <ConfirmBookingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={(sport) => sport && createBookingsMutation.mutate({ slots: selectedSlots, sport })}
        court={selectedCourt}
        date={selectedDate}
        selectedSlots={selectedSlots}
        loading={createBookingsMutation.isPending}
      />
    </div>
  );
}


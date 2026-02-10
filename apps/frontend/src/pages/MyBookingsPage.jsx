import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export function MyBookingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings');
      return res.data;
    }
  });

  const sportLabel = (sport) =>
    sport === 'BEACH_TENNIS' ? 'Beach Tennis' : sport === 'VOLEI' ? 'Vôlei de areia' : 'Futvôlei';

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/bookings/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Agendamento cancelado.');
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao cancelar agendamento');
    }
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg md:text-xl font-semibold text-slateText">Meus agendamentos</h1>
        <p className="text-xs text-slateText/70">
          Veja e cancele os seus horários reservados na A Beach Arena.
        </p>
      </header>

      <section className="card p-4 md:p-5">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-16 rounded-2xl bg-sand/60 animate-pulse" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-xs text-slateText/70">Você ainda não possui agendamentos.</p>
        ) : (
          <div className="space-y-3">
            {data.map((booking) => {
              const dateLabel = format(new Date(booking.date), 'dd/MM/yyyy');
              const startLabel = format(new Date(booking.startTime), 'HH:mm');
              const endLabel = format(new Date(booking.endTime), 'HH:mm');
              const isCanceled = booking.status === 'CANCELED';
              const canCancel = !isCanceled && (booking.userId === user.id || user.role === 'ADMIN');

              return (
                <div
                  key={booking.id}
                  className={`flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-between rounded-2xl border px-3 py-3 text-xs ${
                    isCanceled ? 'bg-slate-100/70 border-slate-200' : 'bg-sand/40 border-sand/80'
                  }`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-slateText">
                      {booking.court?.name || 'Quadra'}
                      {booking.sport && (
                        <span className="ml-1.5 text-xs font-medium text-ocean">
                          ({sportLabel(booking.sport)})
                        </span>
                      )}
                    </p>
                    <p className="text-slateText/70">
                      {dateLabel} • {startLabel} - {endLabel}
                      {booking.court?.pricePerHour != null && (
                        <span className="ml-1 text-ocean font-semibold">
                          • R$ {booking.court.pricePerHour}
                        </span>
                      )}
                    </p>
                    {isCanceled && (
                      <p className="text-[11px] text-slateText/60 mt-0.5">Status: cancelado</p>
                    )}
                  </div>
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(booking.id)}
                      disabled={cancelMutation.isPending}
                      className="self-start md:self-center inline-flex items-center justify-center rounded-full border border-slateText/15 px-3 py-1.5 text-[11px] font-semibold text-slateText/80 hover:bg-slateText/5 transition"
                    >
                      {cancelMutation.isPending ? 'Cancelando...' : 'Cancelar'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}


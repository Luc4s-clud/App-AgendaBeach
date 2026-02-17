import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export function TournamentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tournamentsQuery = useQuery({
    queryKey: ['tournaments'],
    queryFn: async () => {
      const res = await api.get('/tournaments');
      return res.data;
    }
  });

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const myRegsQuery = useQuery({
    queryKey: ['my-tournament-registrations'],
    queryFn: async () => {
      const res = await api.get('/tournaments/registrations/me');
      return res.data;
    }
  });

  const registerMutation = useMutation({
    mutationFn: async ({ tournamentId, league }) => {
      const res = await api.post(`/tournaments/${tournamentId}/register`, { league });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Inscrição realizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['my-tournament-registrations'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao realizar inscrição');
    }
  });

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg md:text-xl font-semibold text-slateText">Campeonatos</h1>
        <p className="text-xs text-slateText/70">
          Veja os campeonatos da A Beach Arena e confira quais estão com inscrições abertas.
        </p>
      </header>

      {tournamentsQuery.isLoading && (
        <section className="card p-5 text-xs text-slateText/70">
          Carregando campeonatos...
        </section>
      )}

      {!tournamentsQuery.isLoading && tournamentsQuery.data?.length === 0 && (
        <section className="card p-5 text-xs text-slateText/70">
          Nenhum campeonato cadastrado no momento.
        </section>
      )}

      {tournamentsQuery.data?.length > 0 && (
        <section className="space-y-3">
          {tournamentsQuery.data.map((t) => {
            const startDate = new Date(t.startDate);
            const endDate = t.endDate ? new Date(t.endDate) : null;
            const regEnd = t.registrationEndDate ? new Date(t.registrationEndDate) : null;
            const regEndStr = t.registrationEndDate ? t.registrationEndDate.slice(0, 10) : null;

            const myRegsForTournament =
              myRegsQuery.data?.filter((r) => r.tournamentId === t.id) ?? [];
            const leaguesAlreadyIn = myRegsForTournament.map((r) => r.league);

            const registrationsOpen =
              (t.status === 'UPCOMING' || t.status === 'ONGOING') &&
              (!regEndStr || regEndStr >= todayStr);

            const availableLeagues = [
              t.hasGold && 'GOLD',
              t.hasSilver && 'SILVER',
              t.hasBronze && 'BRONZE'
            ].filter(Boolean);

            return (
              <article
                key={t.id}
                className="card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1 text-xs md:text-sm">
                  <h2 className="text-sm md:text-base font-semibold text-slateText">{t.name}</h2>
                  <p className="text-slateText/70">{formatSport(t.sport)}</p>
                  <p className="text-slateText/60">
                    {format(startDate, 'dd/MM/yyyy')}
                    {endDate && ` até ${format(endDate, 'dd/MM/yyyy')}`}
                  </p>
                  {regEnd && (
                    <p className="text-[11px] text-slateText/60">
                      Inscrições até {format(regEnd, 'dd/MM/yyyy')}
                    </p>
                  )}
                  {(t.hasGold || t.hasSilver || t.hasBronze) && (
                    <p className="text-[11px] text-slateText/70">
                      Ligas:{' '}
                      {[
                        t.hasGold && 'Ouro',
                        t.hasSilver && 'Prata',
                        t.hasBronze && 'Bronze'
                      ]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  )}
                  {leaguesAlreadyIn.length > 0 && (
                    <p className="text-[11px] text-ocean/90">
                      Você já está inscrito: {leaguesAlreadyIn.map(formatLeague).join(' • ')}
                    </p>
                  )}
                  {t.description && (
                    <p className="text-[11px] text-slateText/70 mt-1 line-clamp-2">{t.description}</p>
                  )}
                </div>

                <div className="flex flex-col items-stretch md:items-end gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full bg-sand/70 text-[10px] font-semibold px-2 py-0.5 text-slateText/80 self-start md:self-auto">
                    {formatTournamentStatus(t.status, registrationsOpen)}
                  </span>
                  {registrationsOpen && availableLeagues.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableLeagues.map((league) => {
                        const alreadyInThisLeague = leaguesAlreadyIn.includes(league);
                        return (
                          <button
                            key={league}
                            type="button"
                            disabled={alreadyInThisLeague || registerMutation.isPending}
                            onClick={() =>
                              registerMutation.mutate({ tournamentId: t.id, league })
                            }
                            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold shadow-soft transition ${
                              alreadyInThisLeague
                                ? 'bg-sand/70 text-slateText/60 cursor-not-allowed'
                                : 'bg-ocean text-white hover:bg-ocean/90'
                            }`}
                          >
                            {alreadyInThisLeague
                              ? `${formatLeague(league)} (inscrito)`
                              : `Inscrever em ${formatLeague(league)}`}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-full text-xs font-semibold shadow-soft bg-sand/70 text-slateText/60 cursor-not-allowed"
                    >
                      Inscrições encerradas
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function formatSport(sport) {
  switch (sport) {
    case 'BEACH_TENNIS':
      return 'Beach Tennis';
    case 'VOLEI':
      return 'Vôlei de areia';
    case 'FUTVOLEI':
      return 'Futvôlei';
    default:
      return sport;
  }
}

function formatLeague(league) {
  switch (league) {
    case 'GOLD':
      return 'Ouro';
    case 'SILVER':
      return 'Prata';
    case 'BRONZE':
      return 'Bronze';
    default:
      return league;
  }
}

function formatTournamentStatus(status, registrationsOpen) {
  if (registrationsOpen) return 'Inscrições abertas';
  switch (status) {
    case 'UPCOMING':
      return 'Em breve';
    case 'ONGOING':
      return 'Em andamento';
    case 'FINISHED':
      return 'Finalizado';
    case 'CANCELED':
      return 'Cancelado';
    default:
      return status;
  }
}


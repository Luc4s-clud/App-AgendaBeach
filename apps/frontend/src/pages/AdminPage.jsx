import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { api } from '../lib/api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const SPORTS = [
  { value: 'BEACH_TENNIS', label: 'Beach Tennis' },
  { value: 'VOLEI', label: 'Vôlei de areia' },
  { value: 'FUTVOLEI', label: 'Futvôlei' }
];

export function AdminPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('bookings');

  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="card p-6 text-sm text-slateText/80">
        <h1 className="text-base md:text-lg font-semibold text-slateText mb-2">Acesso restrito</h1>
        <p>Este painel é exclusivo para administradores da A Beach Arena.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-2">
        <div>
          <h1 className="text-lg md:text-xl font-semibold text-slateText">Painel administrativo</h1>
          <p className="text-xs text-slateText/70">
            Gerencie reservas e cadastre campeonatos da A Beach Arena.
          </p>
        </div>
        <div className="inline-flex rounded-full bg-sand/70 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('bookings')}
            className={`px-3 py-1.5 rounded-full transition ${
              tab === 'bookings' ? 'bg-ocean text-white' : 'text-slateText/70'
            }`}
          >
            Agendamentos
          </button>
          <button
            type="button"
            onClick={() => setTab('tournaments')}
            className={`px-3 py-1.5 rounded-full transition ${
              tab === 'tournaments' ? 'bg-ocean text-white' : 'text-slateText/70'
            }`}
          >
            Campeonatos
          </button>
        </div>
      </header>

      {tab === 'bookings' ? (
        <AdminBookings queryClient={queryClient} />
      ) : (
        <AdminTournaments queryClient={queryClient} />
      )}
    </div>
  );
}

function AdminBookings({ queryClient }) {
  const bookingsQuery = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await api.get('/bookings', { params: { admin: 'true' } });
      return res.data;
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async (id) => {
      await api.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      toast.success('Reserva cancelada com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao cancelar reserva');
    }
  });

  return (
    <section className="card p-4 md:p-5 space-y-3">
      <h2 className="text-sm font-semibold text-slateText">Gerenciamento de agendamentos</h2>
      <p className="text-xs text-slateText/70">
        Lista das últimas reservas criadas. Você pode cancelar qualquer reserva, se necessário.
      </p>

      {bookingsQuery.isLoading && (
        <p className="text-xs text-slateText/60">Carregando reservas...</p>
      )}

      {bookingsQuery.data?.length === 0 && !bookingsQuery.isLoading && (
        <p className="text-xs text-slateText/60">Nenhuma reserva encontrada.</p>
      )}

      {bookingsQuery.data?.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="text-left text-slateText/60 border-b border-sand/60">
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Horário</th>
                <th className="py-2 pr-3">Quadra</th>
                <th className="py-2 pr-3">Esporte</th>
                <th className="py-2 pr-3">Cliente</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {bookingsQuery.data.map((b) => {
                const date = format(new Date(b.date), 'dd/MM/yyyy');
                const start = format(new Date(b.startTime), 'HH:mm');
                const end = format(new Date(b.endTime), 'HH:mm');
                return (
                  <tr key={b.id} className="border-b border-sand/40">
                    <td className="py-2 pr-3 whitespace-nowrap">{date}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">
                      {start} - {end}
                    </td>
                    <td className="py-2 pr-3">{b.court?.name}</td>
                    <td className="py-2 pr-3">{formatSport(b.sport)}</td>
                    <td className="py-2 pr-3">
                      {b.user?.name}{' '}
                      <span className="text-slateText/50">({b.user?.email})</span>
                    </td>
                    <td className="py-2 pr-3">
                      {b.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center rounded-full bg-aqua/20 text-[10px] font-semibold px-2 py-0.5 text-slateText">
                          Ativa
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-sand/60 text-[10px] font-semibold px-2 py-0.5 text-slateText/70">
                          Cancelada
                        </span>
                      )}
                    </td>
                    <td className="py-2 pl-3 text-right">
                      {b.status === 'ACTIVE' && (
                        <button
                          type="button"
                          onClick={() => cancelMutation.mutate(b.id)}
                          className="text-[11px] font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                          disabled={cancelMutation.isPending}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function AdminTournaments({ queryClient }) {
  const tournamentsQuery = useQuery({
    queryKey: ['admin-tournaments'],
    queryFn: async () => {
      const res = await api.get('/tournaments/admin');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post('/tournaments', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Campeonato criado com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['admin-tournaments'] });
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.message || 'Erro ao criar campeonato');
    }
  });

  return (
    <section className="space-y-4">
      <div className="card p-4 md:p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slateText">Cadastrar campeonato</h2>
        <TournamentForm onSubmit={(data) => createMutation.mutate(data)} loading={createMutation.isPending} />
      </div>

      <div className="card p-4 md:p-5 space-y-3">
        <h2 className="text-sm font-semibold text-slateText">Lista de campeonatos</h2>
        {tournamentsQuery.isLoading && (
          <p className="text-xs text-slateText/60">Carregando campeonatos...</p>
        )}
        {tournamentsQuery.data?.length === 0 && !tournamentsQuery.isLoading && (
          <p className="text-xs text-slateText/60">Nenhum campeonato cadastrado ainda.</p>
        )}
        {tournamentsQuery.data?.length > 0 && (
          <ul className="space-y-2 text-xs">
            {tournamentsQuery.data.map((t) => (
              <li
                key={t.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-1 border border-sand/60 rounded-xl px-3 py-2"
              >
                <div className="space-y-0.5">
                  <p className="font-semibold text-slateText text-sm">{t.name}</p>
                  <p className="text-slateText/70">{formatSport(t.sport)}</p>
                  <p className="text-slateText/60">
                    {format(new Date(t.startDate), 'dd/MM/yyyy')}
                    {t.endDate && ` até ${format(new Date(t.endDate), 'dd/MM/yyyy')}`}
                  </p>
                  {t.registrationEndDate && (
                    <p className="text-[11px] text-slateText/60">
                      Inscrições até {format(new Date(t.registrationEndDate), 'dd/MM/yyyy')}
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
                </div>
                <span className="inline-flex items-center rounded-full bg-sand/70 text-[10px] font-semibold px-2 py-0.5 text-slateText/80 self-start md:self-auto">
                  {formatTournamentStatus(t.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function TournamentForm({ onSubmit, loading }) {
  const [name, setName] = useState('');
  const [sport, setSport] = useState('BEACH_TENNIS');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [registrationEndDate, setRegistrationEndDate] = useState('');
  const [hasGold, setHasGold] = useState(true);
  const [hasSilver, setHasSilver] = useState(true);
  const [hasBronze, setHasBronze] = useState(true);
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !startDate || !registrationEndDate) {
      toast.error('Nome, data de início e data de encerramento das inscrições são obrigatórios.');
      return;
    }
    onSubmit({
      name,
      sport,
      startDate,
      endDate: endDate || null,
      registrationEndDate,
      hasGold,
      hasSilver,
      hasBronze,
      description: description || null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="block text-slateText/70">Nome do campeonato *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-sand/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ocean/60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-slateText/70">Esporte *</label>
          <div className="flex gap-1">
            {SPORTS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSport(opt.value)}
                className={`flex-1 px-2 py-1.5 rounded-full border text-[11px] font-semibold transition ${
                  sport === opt.value
                    ? 'bg-ocean text-white border-ocean'
                    : 'bg-white text-slateText/80 border-sand/70 hover:border-ocean/60'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="block text-slateText/70">Data de início *</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-sand/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ocean/60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-slateText/70">Data de término (opcional)</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-xl border border-sand/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ocean/60"
          />
        </div>
        <div className="space-y-1">
          <label className="block text-slateText/70">Encerramento das inscrições *</label>
          <input
            type="date"
            value={registrationEndDate}
            onChange={(e) => setRegistrationEndDate(e.target.value)}
            className="w-full rounded-xl border border-sand/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ocean/60"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-slateText/70">Ligas / categorias</label>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={hasGold}
              onChange={(e) => setHasGold(e.target.checked)}
            />
            <span>Ouro</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={hasSilver}
              onChange={(e) => setHasSilver(e.target.checked)}
            />
            <span>Prata</span>
          </label>
          <label className="inline-flex items-center gap-1">
            <input
              type="checkbox"
              checked={hasBronze}
              onChange={(e) => setHasBronze(e.target.checked)}
            />
            <span>Bronze</span>
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-slateText/70">Descrição (opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-sand/70 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ocean/60 resize-y"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="btn-primary text-xs px-5 py-2 disabled:opacity-60"
        >
          {loading ? 'Salvando...' : 'Criar campeonato'}
        </button>
      </div>
    </form>
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

function formatTournamentStatus(status) {
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


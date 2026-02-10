import { useNavigate } from 'react-router-dom';
import { CalendarCheck2, Trophy, Video, ArrowRight } from 'lucide-react';

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-ocean text-white shadow-soft">
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center blur-sm opacity-60"
            style={{
              backgroundImage:
                "url('https://images.pexels.com/photos/1277390/pexels-photo-1277390.jpeg?auto=compress&cs=tinysrgb&w=1200')"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ocean/80 via-ocean/80 to-aqua/70" />
        </div>
        <div className="relative px-6 py-8 md:px-10 md:py-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aqua/80">
              A Beach Arena
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold leading-snug">
              Agende sua quadra de areia em poucos cliques.
            </h1>
            <p className="text-sm md:text-base text-sand/80 max-w-xl">
              Beach Tennis, Vôlei e Futvôlei em um ambiente moderno, com estrutura pensada para
              quem ama estar na areia.
            </p>
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="btn-secondary inline-flex items-center gap-2 mt-2"
            >
              Agendar agora
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <button
          type="button"
          onClick={() => navigate('/booking')}
          className="card p-5 md:p-6 text-left hover:-translate-y-0.5 hover:shadow-xl transition"
        >
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-aqua/20 text-ocean mb-3">
            <CalendarCheck2 size={20} />
          </div>
          <h2 className="font-semibold mb-1.5 text-slateText">Agendar Quadra</h2>
          <p className="text-xs text-slateText/70">
            Escolha o dia, a quadra e o horário perfeito para sua partida.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/tournaments')}
          className="card p-5 md:p-6 text-left hover:-translate-y-0.5 hover:shadow-xl transition"
        >
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-ocean/10 text-ocean mb-3">
            <Trophy size={20} />
          </div>
          <h2 className="font-semibold mb-1.5 text-slateText">Campeonatos</h2>
          <p className="text-xs text-slateText/70">
            Em breve: organize e participe de torneios incríveis na areia.
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('/videos')}
          className="card p-5 md:p-6 text-left hover:-translate-y-0.5 hover:shadow-xl transition"
        >
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-sand text-ocean mb-3">
            <Video size={20} />
          </div>
          <h2 className="font-semibold mb-1.5 text-slateText">Jogadas & Vídeos</h2>
          <p className="text-xs text-slateText/70">
            Em breve: destaques das partidas e conteúdos para você evoluir.
          </p>
        </button>
      </section>
    </div>
  );
}


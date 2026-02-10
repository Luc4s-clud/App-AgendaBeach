export function TournamentsPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg md:text-xl font-semibold text-slateText">Campeonatos</h1>
        <p className="text-xs text-slateText/70">
          Em breve você poderá visualizar e se inscrever em campeonatos na A Beach Arena.
        </p>
      </header>

      <section className="card p-5 text-sm text-slateText/80">
        <p>
          Esta área é um <span className="font-semibold">placeholder</span> para o módulo de
          campeonatos. Aqui você terá:
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-xs">
          <li>Lista de torneios em andamento e futuros</li>
          <li>Informações de inscrição, chaves e calendário</li>
          <li>Acompanhamento de resultados e rankings</li>
        </ul>
      </section>
    </div>
  );
}


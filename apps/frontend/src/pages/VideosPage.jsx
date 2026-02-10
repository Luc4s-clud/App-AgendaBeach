export function VideosPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-lg md:text-xl font-semibold text-slateText">Jogadas &amp; Vídeos</h1>
        <p className="text-xs text-slateText/70">
          Em breve: destaques das jogadas, conteúdos de treinamento e muito mais.
        </p>
      </header>

      <section className="card p-5 text-sm text-slateText/80">
        <p>
          Esta área é um <span className="font-semibold">placeholder</span> para o módulo de
          vídeos. A ideia é trazer:
        </p>
        <ul className="mt-3 list-disc list-inside space-y-1 text-xs">
          <li>Destaques das partidas na A Beach Arena</li>
          <li>Dicas técnicas para Beach Tennis, Vôlei e Futvôlei</li>
          <li>Clipes curtos para compartilhar com os amigos</li>
        </ul>
      </section>
    </div>
  );
}


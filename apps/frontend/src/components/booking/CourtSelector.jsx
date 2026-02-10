export function CourtSelector({ courts, selectedCourtId, onSelect, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="card h-24 animate-pulse bg-sand/50" />
        ))}
      </div>
    );
  }

  const sportLabel = (sport) =>
    sport === 'BEACH_TENNIS' ? 'Beach Tennis' : sport === 'VOLEI' ? 'Vôlei' : 'Futvôlei';
  const typeLabel = (type) => (type === 'COBERTA' ? 'Coberta' : 'Descoberta');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {courts?.map((court) => {
        const isSelected = selectedCourtId === court.id;
        return (
          <button
            key={court.id}
            type="button"
            onClick={() => onSelect(court.id)}
            className={`card p-4 text-left hover:-translate-y-0.5 hover:shadow-xl transition ${
              isSelected ? 'ring-2 ring-aqua ring-offset-2 ring-offset-sand' : ''
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-wide text-slateText/60">
                {sportLabel(court.sport)} • {typeLabel(court.type)}
              </p>
              <span className="text-sm font-semibold text-ocean">R$ {court.pricePerHour}/h</span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slateText">{court.name}</p>
          </button>
        );
      })}
    </div>
  );
}


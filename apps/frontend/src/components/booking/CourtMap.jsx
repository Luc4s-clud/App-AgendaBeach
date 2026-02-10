/// Layout do mapa: linha superior = Quadras 4, 5, 6 | linha inferior = Quadra JJ, 2, 3
const LAYOUT_ORDER = ['Quadra 4', 'Quadra 5', 'Quadra 6', 'Quadra JJ', 'Quadra 2', 'Quadra 3'];

function getCourtPosition(court) {
  const idx = LAYOUT_ORDER.indexOf(court.name);
  return idx >= 0 ? idx : 0;
}

function sortCourtsByLayout(courts) {
  if (!courts?.length) return [];
  return [...courts].sort((a, b) => getCourtPosition(a) - getCourtPosition(b));
}

export function CourtMap({ courts, selectedCourtId, onSelect, loading }) {
  const ordered = sortCourtsByLayout(courts);

  if (loading) {
    return (
      <div className="w-full max-w-[280px] aspect-[3/2] rounded-2xl border-2 border-sand/80 bg-sand/20 animate-pulse" />
    );
  }

  if (!ordered.length) return null;

  return (
    <div className="w-full max-w-[280px] rounded-2xl border-2 border-slateText/20 bg-white overflow-hidden shadow-soft">
      {/* Linha superior: Quadras 4, 5, 6 */}
      <div className="grid grid-cols-3 border-b-2 border-slateText/20">
        {ordered.slice(0, 3).map((court) => {
          const isSelected = selectedCourtId === court.id;
          return (
            <button
              key={court.id}
              type="button"
              onClick={() => onSelect(court.id)}
              className={`min-h-[4rem] md:min-h-[5rem] flex items-center justify-center border-r-2 last:border-r-0 border-slateText/20 font-semibold text-slateText transition ${
                isSelected
                  ? 'bg-aqua/30 ring-2 ring-aqua ring-inset'
                  : 'bg-sand/30 hover:bg-sand/60'
              }`}
            >
              {court.name}
            </button>
          );
        })}
      </div>
      {/* Linha inferior: Quadra JJ, 2, 3 */}
      <div className="grid grid-cols-3">
        {ordered.slice(3, 6).map((court) => {
          const isSelected = selectedCourtId === court.id;
          return (
            <button
              key={court.id}
              type="button"
              onClick={() => onSelect(court.id)}
              className={`min-h-[4rem] md:min-h-[5rem] flex items-center justify-center border-r-2 last:border-r-0 border-t-2 border-slateText/20 font-semibold text-slateText transition ${
                isSelected
                  ? 'bg-aqua/30 ring-2 ring-aqua ring-inset'
                  : 'bg-sand/30 hover:bg-sand/60'
              }`}
            >
              {court.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { addDays, format } from 'date-fns';

const DAYS_TO_SHOW = 14;

export function HorizontalDatePicker({ selectedDate, onChange }) {
  const today = new Date();
  const days = Array.from({ length: DAYS_TO_SHOW }, (_, index) => addDays(today, index));

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const isSelected = selectedDate === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`min-w-[70px] flex flex-col items-center justify-center rounded-2xl border px-3 py-2 text-xs font-medium transition ${
              isSelected
                ? 'bg-ocean text-white border-ocean shadow-soft'
                : 'bg-white border-sand/80 text-slateText/80 hover:bg-sand/60'
            }`}
          >
            <span className="uppercase tracking-wide text-[10px]">
              {format(day, 'EEE').replace('.', '')}
            </span>
            <span className="text-base font-semibold">{format(day, 'dd')}</span>
            <span className="text-[10px] text-slateText/60">{format(day, 'MM')}</span>
          </button>
        );
      })}
    </div>
  );
}


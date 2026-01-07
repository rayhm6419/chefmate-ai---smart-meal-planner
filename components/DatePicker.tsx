
import React, { useMemo } from 'react';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayKey = formatLocalDate(new Date());

  const days = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, idx) => {
      const next = new Date(base);
      next.setDate(base.getDate() + idx);
      return {
        key: formatLocalDate(next),
        dayLabel: next.toLocaleDateString(undefined, { weekday: 'short' }),
        dateLabel: next.getDate().toString(),
      };
    });
  }, []);

  return (
    <div className="bg-white pt-6 pb-2 sticky top-0 z-30 shadow-sm shadow-black/[0.02]">
      <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center overflow-x-auto no-scrollbar">
        {days.map((day) => {
          const isSelected = selectedDate === day.key;
          const isToday = todayKey === day.key;
          return (
          <button
            key={day.key}
            onClick={() => onDateChange(day.key)}
            className={`flex flex-col items-center min-w-[45px] transition-all py-1 rounded-2xl ${
              isSelected || isToday ? 'bg-orange-50' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected || isToday ? 'text-orange-400' : 'text-gray-400'}`}>
              {day.dayLabel}
            </span>
            <span className={`text-sm font-black mt-1 ${isSelected || isToday ? 'text-orange-600' : 'text-gray-700'}`}>
              {day.dateLabel}
            </span>
            {isToday && (
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1 animate-pulse"></div>
            )}
          </button>
          );
        })}
      </div>
    </div>
  );
};

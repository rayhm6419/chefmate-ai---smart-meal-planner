
import React from 'react';
import { DAYS } from '../constants';

interface DatePickerProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({ selectedDate, onDateChange }) => {
  return (
    <div className="bg-white pt-6 pb-2 sticky top-0 z-30 shadow-sm shadow-black/[0.02]">
      <div className="max-w-screen-xl mx-auto px-6 flex justify-between items-center overflow-x-auto no-scrollbar">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => onDateChange(day)}
            className={`flex flex-col items-center min-w-[45px] transition-all py-1 rounded-2xl ${
              selectedDate === day ? 'bg-orange-50' : 'hover:bg-gray-50'
            }`}
          >
            <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDate === day ? 'text-orange-400' : 'text-gray-400'}`}>
              {day}
            </span>
            <span className={`text-sm font-black mt-1 ${selectedDate === day ? 'text-orange-600' : 'text-gray-700'}`}>
              {day === 'Mon' ? '12' : day === 'Tue' ? '13' : day === 'Wed' ? '14' : day === 'Thu' ? '15' : day === 'Fri' ? '16' : day === 'Sat' ? '17' : '18'}
            </span>
            {selectedDate === day && (
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1 animate-pulse"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

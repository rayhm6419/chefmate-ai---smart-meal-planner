
import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { DAYS_OF_WEEK, MealPlan, DateInfo } from '../types';
import { Utensils, CheckCircle2, X } from 'lucide-react';

interface PlannerProps {
  mealPlan: MealPlan;
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onUpdatePlan: (date: string, mealType: 'lunch' | 'dinner', value: string) => void;
}

export const Planner: React.FC<PlannerProps> = ({ mealPlan, selectedDate, onSelectDate, onUpdatePlan }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const weekDates = useMemo(() => {
    const dates: DateInfo[] = [];
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; 
    
    for (let i = 0; i < 7; i++) {
      const next = new Date(curr.getTime());
      next.setDate(first + i);
      
      const iso = next.toISOString().split('T')[0];
      const dayName = DAYS_OF_WEEK[i];
      const display = `${next.getMonth() + 1}/${next.getDate()}`;

      dates.push({ dayName, fullDate: iso, displayDate: display });
    }
    return dates;
  }, []);

  const handleDateClick = (date: string) => {
    onSelectDate(date);
    setIsModalOpen(true);
  };

  const currentDayPlan = mealPlan[selectedDate] || {};

  return (
    <div className="bg-white border-b border-slate-100 z-30 relative">
      <div className="flex overflow-x-auto px-4 py-2 gap-3 no-scrollbar snap-x">
        {weekDates.map((date) => {
          const isSelected = selectedDate === date.fullDate;
          const hasPlan = mealPlan[date.fullDate]?.dinner || mealPlan[date.fullDate]?.lunch;
          const isToday = new Date().toISOString().split('T')[0] === date.fullDate;
          
          return (
            <button
              key={date.fullDate}
              onClick={() => handleDateClick(date.fullDate)}
              className={`
                flex-shrink-0 snap-center flex flex-col items-center justify-center w-14 h-16 rounded-2xl transition-all duration-300 border
                ${isSelected 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md translate-y-[-1px]' 
                  : isToday 
                    ? 'bg-indigo-50 border-indigo-100 text-indigo-900'
                    : 'bg-white border-slate-100 text-slate-500'}
              `}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                {date.dayName}
              </span>
              <span className="text-lg font-bold leading-none mt-1">{date.displayDate.split('/')[1]}</span>
              <div className={`mt-1 w-1.5 h-1.5 rounded-full ${hasPlan ? (isSelected ? 'bg-white' : 'bg-emerald-500') : 'opacity-0'}`} />
            </button>
          );
        })}
      </div>

      {/* Edit Modal - Rendered via Portal to avoid z-index clipping */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full sm:w-[400px] bg-white rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-xl text-slate-900">
                  Plan for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
             </div>

             <div className="space-y-4 pb-safe">
               {/* Lunch */}
               <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">Lunch</span>
                 </div>
                 <textarea
                   rows={2}
                   value={currentDayPlan.lunch || ''}
                   onChange={(e) => onUpdatePlan(selectedDate, 'lunch', e.target.value)}
                   placeholder="Plan a lunch..."
                   className="w-full bg-white/50 p-3 rounded-xl text-sm font-medium text-slate-800 border-0 focus:ring-2 focus:ring-amber-400/50 placeholder:text-amber-800/30"
                 />
               </div>

               {/* Dinner */}
               <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold bg-indigo-200 text-indigo-800 px-2 py-0.5 rounded-full">Dinner</span>
                 </div>
                 <textarea
                   rows={2}
                   value={currentDayPlan.dinner || ''}
                   onChange={(e) => onUpdatePlan(selectedDate, 'dinner', e.target.value)}
                   placeholder="Plan a dinner..."
                   className="w-full bg-white/50 p-3 rounded-xl text-sm font-medium text-slate-800 border-0 focus:ring-2 focus:ring-indigo-400/50 placeholder:text-indigo-800/30"
                 />
               </div>
             </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

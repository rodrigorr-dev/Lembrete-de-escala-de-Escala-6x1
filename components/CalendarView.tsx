
import React, { useState, useMemo } from 'react';
import { TeamMember } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  teamMembers: TeamMember[];
  isOffToday: (member: TeamMember, date: Date) => boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, setCurrentDate, teamMembers, isOffToday }) => {
  const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const { month, year, firstDayOfMonth, daysInMonth } = useMemo(() => {
    const month = viewDate.getMonth();
    const year = viewDate.getFullYear();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { month, year, firstDayOfMonth, daysInMonth };
  }, [viewDate]);
  
  // Set view date when current date changes month or year
  React.useEffect(() => {
     if (currentDate.getMonth() !== viewDate.getMonth() || currentDate.getFullYear() !== viewDate.getFullYear()) {
         setViewDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));
     }
  }, [currentDate]);


  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    // Padding for days before the start of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-start-${i}`} className="p-2 border border-gray-700/50 rounded-md"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = date.toDateString() === currentDate.toDateString();
      const isToday = date.toDateString() === new Date().toDateString();

      let workingCount = 0;
      let offCount = 0;
      if (teamMembers.length > 0) {
        teamMembers.forEach(member => {
          if (isOffToday(member, date)) {
            offCount++;
          } else {
            workingCount++;
          }
        });
      }
      
      const dayClasses = `p-2 border text-left border-gray-700/50 rounded-md cursor-pointer flex flex-col items-start justify-start aspect-square transition-colors duration-200 
        ${isSelected ? 'bg-teal-500/30 border-teal-500 ring-2 ring-teal-500' : 'hover:bg-gray-700'}
        ${isToday && !isSelected ? 'bg-gray-600/50' : ''}`;

      days.push(
        <button key={day} onClick={() => setCurrentDate(date)} className={dayClasses} aria-label={`Ver escala do dia ${day}`}>
          <span className={`font-bold ${isToday ? 'text-teal-400' : ''}`}>{day}</span>
          {teamMembers.length > 0 && (
             <div className="text-xs mt-2 space-y-1 text-left w-full">
                <div className="flex items-center gap-1" title="Trabalhando">
                    <span className="text-green-400">✅</span>
                    <span className="font-mono">{workingCount}</span>
                </div>
                <div className="flex items-center gap-1" title="De Folga">
                     <span className="text-blue-400">🏖️</span>
                     <span className="font-mono">{offCount}</span>
                </div>
            </div>
          )}
        </button>
      );
    }
    
     // Padding for days after the end of the month
    const totalCells = firstDayOfMonth + daysInMonth;
    const remainingCells = (7 - (totalCells % 7)) % 7;
    for (let i = 0; i < remainingCells; i++) {
        days.push(<div key={`empty-end-${i}`} className="p-2 border border-gray-700/50 rounded-md"></div>);
    }

    return days;
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white capitalize">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(viewDate)}
        </h2>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Mês anterior">
            <ChevronLeftIcon />
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-700 transition-colors" aria-label="Próximo mês">
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center font-semibold text-gray-400 mb-2">
        {daysOfWeek.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarView;

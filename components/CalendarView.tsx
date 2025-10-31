import React, { useMemo, useState, useRef } from 'react';
import { TeamMember } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, PdfIcon } from './Icons';

// Type definitions for CDN libraries
declare global {
  interface Window {
    html2canvas: any;
    jspdf: any;
  }
}


interface CalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  teamMembers: TeamMember[];
  isOffToday: (member: TeamMember, date: Date) => boolean;
  isOnVacation: (member: TeamMember, date: Date) => boolean;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentDate,
  setCurrentDate,
  teamMembers,
  isOffToday,
  isOnVacation,
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);


  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const daysInMonth = useMemo(() => {
    const days = [];
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [year, month, lastDayOfMonth]);

  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const handleTodayClick = () => {
    setCurrentDate(new Date());
  };

  const handleDownloadPdf = async () => {
    if (!calendarRef.current) return;

    setIsGeneratingPdf(true);
    
    // Allow React to re-render with PDF-friendly styles before capturing
    await new Promise(resolve => setTimeout(resolve, 200));

    const originalBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#111827'; // Match the app's bg

    try {
        const canvas = await window.html2canvas(calendarRef.current, {
            scale: 2, // Higher scale for better quality
            backgroundColor: '#111827',
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        
        // Use A4 landscape for a standard, predictable layout
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        const pdfWidth = pdf.internal.pageSize.getWidth(); // in mm
        const pdfHeight = pdf.internal.pageSize.getHeight(); // in mm
        
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const canvasAspectRatio = canvasWidth / canvasHeight;

        // Add a small margin
        const margin = 5; // 5mm margin
        const effectivePdfWidth = pdfWidth - (margin * 2);
        const effectivePdfHeight = pdfHeight - (margin * 2);

        // Calculate the image dimensions to fit inside the PDF page with margin
        let imgWidthOnPdf = effectivePdfWidth;
        let imgHeightOnPdf = imgWidthOnPdf / canvasAspectRatio;

        // If the height is too large, scale down based on height instead
        if (imgHeightOnPdf > effectivePdfHeight) {
            imgHeightOnPdf = effectivePdfHeight;
            imgWidthOnPdf = imgHeightOnPdf * canvasAspectRatio;
        }

        // Center the image
        const xOffset = (pdfWidth - imgWidthOnPdf) / 2;
        const yOffset = (pdfHeight - imgHeightOnPdf) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthOnPdf, imgHeightOnPdf);
        
        const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);
        pdf.save(`escala_${monthYear.replace(/ de /g, '_')}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Tente novamente.");
    } finally {
        // Restore everything after PDF generation
        setIsGeneratingPdf(false);
        document.body.style.backgroundColor = originalBodyBg;
    }
  };


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6" ref={calendarRef}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white capitalize">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-wait"
              aria-label="Baixar Calendário como PDF"
            >
              {isGeneratingPdf ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <PdfIcon />
              )}
            </button>
            <button
              onClick={handleTodayClick}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors"
            >
              Hoje
            </button>
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Mês anterior"
          >
            <ChevronLeftIcon />
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
            aria-label="Próximo mês"
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
        {weekDays.map(day => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="border border-gray-700/50 rounded-md"></div>
        ))}
        {daysInMonth.map(day => {
          const isSelected = day.toDateString() === currentDate.toDateString();
          const isToday = day.toDateString() === today.toDateString();
          
          const offMembers = teamMembers.filter(member => isOffToday(member, day));
          const vacationMembers = teamMembers.filter(member => isOnVacation(member, day));

          const dayClasses = `
            p-2 ${isGeneratingPdf ? 'min-h-[8rem]' : 'h-32'} flex flex-col items-center justify-start
            ${isGeneratingPdf ? '' : 'cursor-pointer transition-colors duration-200'}
            rounded-md border
            ${isSelected ? 'bg-teal-500/30 border-teal-500' : 'bg-gray-700/50 border-gray-700'}
            ${!isSelected && !isGeneratingPdf ? 'hover:bg-gray-600/70' : ''}
          `;
          
          const dateNumberClasses = `
            flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-1
            ${isToday && !isSelected ? 'bg-teal-500 text-white' : ''}
            ${isSelected ? 'bg-teal-600 text-white' : ''}
          `;

          return (
            <div key={day.toString()} className={dayClasses} onClick={() => !isGeneratingPdf && setCurrentDate(day)}>
              <div className={dateNumberClasses}>
                {day.getDate()}
              </div>
              <div className={`w-full ${isGeneratingPdf ? '' : 'overflow-y-auto'} text-xs space-y-1 text-left`}>
                {vacationMembers.length > 0 && (
                   <div className="bg-yellow-500/20 text-yellow-300 rounded px-1 py-0.5 text-center truncate" title={`${vacationMembers.length} de férias`}>
                     ✈️ {vacationMembers.length} Férias
                   </div>
                )}
                {offMembers.map(member => (
                    <div key={member.id} className={`bg-blue-500/20 text-blue-300 rounded px-1 py-0.5 text-center ${isGeneratingPdf ? 'whitespace-normal' : 'truncate'}`} title={member.name}>
                        🏖️ {isGeneratingPdf ? member.name : member.name.split(' ')[0]}
                    </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
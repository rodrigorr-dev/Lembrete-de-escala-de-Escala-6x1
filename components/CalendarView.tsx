
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
  const [isPrintMode, setIsPrintMode] = useState(true);


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
    const element = calendarRef.current;
    
    // Injeta estilos para o modo de impressão se estiver ativado
    const styleTag = document.createElement('style');
    styleTag.id = 'print-styles';
    if (isPrintMode) {
      styleTag.innerHTML = `
        .print-mode-override.bg-gray-800, .print-mode-override .bg-gray-800,
        .print-mode-override .bg-gray-700, .print-mode-override .bg-gray-700\\/50 { background-color: #ffffff !important; }
        .print-mode-override, .print-mode-override .text-white, .print-mode-override .text-gray-100, .print-mode-override .text-gray-300, .print-mode-override .text-gray-400 { color: #000000 !important; }
        .print-mode-override .text-teal-400 { color: #0f766e !important; }
        .print-mode-override .text-blue-300 { color: #1e40af !important; }
        .print-mode-override .text-yellow-300 { color: #92400e !important; }

        /* Aumenta a fonte para melhor legibilidade */
        .print-mode-override .text-xl { font-size: 1.5rem !important; }
        .print-mode-override .text-sm { font-size: 1rem !important; }
        .print-mode-override .text-xs { font-size: 0.95rem !important; line-height: 1.3 !important; }
        .print-mode-override .w-7.h-7 { width: 2rem !important; height: 2rem !important; } /* Acomoda números de dias maiores */

        /* Escurece as bordas */
        .print-mode-override .border-gray-700, .print-mode-override .border-gray-700\\/50 { border-color: #6b7280 !important; }
        .print-mode-override .border-teal-500 { border-color: #0d9488 !important; border-width: 2px !important; }
        .print-mode-override .ring-black\\/30 { ring-color: transparent !important; }
        
        /* Ajustes de fundo e borda de elementos */
        .print-mode-override .bg-teal-500\\/30 { background-color: #ccfbf1 !important; }
        .print-mode-override .bg-teal-500, .print-mode-override .bg-teal-600 { background-color: #0d9488 !important; color: #ffffff !important; }
        .print-mode-override .bg-yellow-500\\/20 { background-color: #fefce8 !important; border: 1px solid #ca8a04 !important; padding-top: 0.2rem !important; padding-bottom: 0.2rem !important; }
        .print-mode-override .bg-blue-500\\/20 { background-color: #eff6ff !important; border: 1px solid #3b82f6 !important; padding-top: 0.2rem !important; padding-bottom: 0.2rem !important; }
        
        .print-mode-override .hover\\:bg-gray-700:hover, .print-mode-override .hover\\:bg-gray-600\\/70:hover { background-color: #ffffff !important; }
      `;
      document.head.appendChild(styleTag);
      element.classList.add('print-mode-override');
    }

    await new Promise(resolve => setTimeout(resolve, 50));

    const originalBodyBg = document.body.style.backgroundColor;
    const originalElementWidth = element.style.width;

    document.body.style.backgroundColor = isPrintMode ? '#ffffff' : '#111827';
    element.style.width = '1280px';
    
    await new Promise(resolve => setTimeout(resolve, 150));

    try {
        const canvas = await window.html2canvas(element, {
            scale: 2,
            backgroundColor: isPrintMode ? '#ffffff' : '#111827',
            useCORS: true,
            allowTaint: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasAspectRatio = canvas.width / canvas.height;
        const margin = 10;
        const effectivePdfWidth = pdfWidth - (margin * 2);
        const effectivePdfHeight = pdfHeight - (margin * 2);

        let imgWidthOnPdf = effectivePdfWidth;
        let imgHeightOnPdf = imgWidthOnPdf / canvasAspectRatio;

        if (imgHeightOnPdf > effectivePdfHeight) {
            imgHeightOnPdf = effectivePdfHeight;
            imgWidthOnPdf = imgHeightOnPdf * canvasAspectRatio;
        }

        const xOffset = (pdfWidth - imgWidthOnPdf) / 2;
        const yOffset = (pdfHeight - imgHeightOnPdf) / 2;

        pdf.addImage(imgData, 'PNG', xOffset, yOffset, imgWidthOnPdf, imgHeightOnPdf);
        
        const monthYear = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate);
        pdf.save(`escala_${monthYear.replace(/ de /g, '_').toLowerCase()}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
    } finally {
        element.style.width = originalElementWidth;
        document.body.style.backgroundColor = originalBodyBg;
        if (isPrintMode) {
          element.classList.remove('print-mode-override');
          document.getElementById('print-styles')?.remove();
        }
        setIsGeneratingPdf(false);
    }
  };


  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 ring-1 ring-inset ring-black/30" ref={calendarRef}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white capitalize">
          {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pr-2 border-r border-gray-600">
                <label htmlFor="print-mode-toggle" className="text-sm text-gray-300 select-none cursor-pointer" title="Gera um PDF com fundo branco para economizar tinta de impressora">
                    Modo Impressão
                </label>
                <input
                    id="print-mode-toggle"
                    type="checkbox"
                    checked={isPrintMode}
                    onChange={(e) => setIsPrintMode(e.target.checked)}
                    className="w-4 h-4 text-teal-600 bg-gray-700 border-gray-600 rounded focus:ring-teal-500 cursor-pointer focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800"
                />
            </div>
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

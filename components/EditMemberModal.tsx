
import React, { useState, useEffect } from 'react';
import { TeamMember, ScheduleType, Vacation } from '../types';
import { PlusIcon, TrashIcon } from './Icons';

interface EditMemberModalProps {
  member: TeamMember;
  onUpdate: (id: string, name: string, scheduleType: ScheduleType, firstDayOff?: Date, birthday?: Date, vacation?: Vacation[]) => void;
  onClose: () => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({ member, onUpdate, onClose }) => {
  const [name, setName] = useState(member.name);
  const [scheduleType, setScheduleType] = useState<ScheduleType>(member.scheduleType);
  const [firstDayOff, setFirstDayOff] = useState(
    member.firstDayOff ? new Date(member.firstDayOff).toISOString().split('T')[0] : ''
  );
  const [birthday, setBirthday] = useState(member.birthday ? new Date(member.birthday).toISOString().split('T')[0] : '');
  const [vacations, setVacations] = useState<Vacation[]>([]);
  const [newVacationStart, setNewVacationStart] = useState('');
  const [newVacationEnd, setNewVacationEnd] = useState('');


  useEffect(() => {
    setName(member.name);
    setScheduleType(member.scheduleType);
    setFirstDayOff(member.firstDayOff ? new Date(member.firstDayOff).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setBirthday(member.birthday ? new Date(member.birthday).toISOString().split('T')[0] : '');
    setVacations(JSON.parse(JSON.stringify(member.vacation || []))); // Deep copy
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      let fdoDate: Date | undefined = undefined;
      if (scheduleType === '5x1' && firstDayOff) {
        const dateParts = firstDayOff.split('-').map(Number);
        fdoDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      }
      
      let bdayDate: Date | undefined = undefined;
      if (birthday) {
        const bdayParts = birthday.split('-').map(Number);
        bdayDate = new Date(bdayParts[0], bdayParts[1] - 1, bdayParts[2]);
      }
      
      onUpdate(member.id, name, scheduleType, fdoDate, bdayDate, vacations);
    }
  };

  const handleAddVacation = () => {
    if (newVacationStart && newVacationEnd) {
        const startParts = newVacationStart.split('-').map(Number);
        const endParts = newVacationEnd.split('-').map(Number);
        const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
        const endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);

        if (endDate < startDate) {
            alert("A data final das férias não pode ser anterior à data inicial.");
            return;
        }
        setVacations([...vacations, { start: startDate, end: endDate }]);
        setNewVacationStart('');
        setNewVacationEnd('');
    }
  };

  const handleRemoveVacation = (index: number) => {
    setVacations(vacations.filter((_, i) => i !== index));
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const isSubmitDisabled = !name.trim() || (scheduleType === '5x1' && !firstDayOff);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-member-title"
    >
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-4 w-full max-w-md mx-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale">
        <h2 id="edit-member-title" className="text-2xl font-bold text-white mb-4">Editar Membro</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Membro</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
           <div>
            <label htmlFor="edit-schedule-type" className="block text-sm font-medium text-gray-300 mb-1">Tipo de Escala</label>
            <select
              id="edit-schedule-type"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value as ScheduleType)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="5x1">Escala 5x1</option>
              <option value="fixedSundayOff">Folga Fixa no Domingo</option>
            </select>
          </div>
          {scheduleType === '5x1' && (
            <div>
              <label htmlFor="edit-first-day-off" className="block text-sm font-medium text-gray-300 mb-1">Primeiro Dia de Folga</label>
              <input
                id="edit-first-day-off"
                type="date"
                value={firstDayOff}
                onChange={(e) => setFirstDayOff(e.target.value)}
                required={scheduleType === '5x1'}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}
          <div>
            <label htmlFor="edit-birthday" className="block text-sm font-medium text-gray-300 mb-1">Aniversário (Opcional)</label>
            <input
              id="edit-birthday"
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div className="border-t border-gray-600 pt-4 mt-4">
              <h3 className="text-lg font-medium text-gray-300 mb-2">Férias</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto mb-4 pr-2">
                  {vacations.map((vacation, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                          <p className="text-sm text-gray-200">
                              {new Date(vacation.start).toLocaleDateString('pt-BR')} - {new Date(vacation.end).toLocaleDateString('pt-BR')}
                          </p>
                          <button type="button" onClick={() => handleRemoveVacation(index)} className="p-1 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-colors" aria-label="Remover período de férias">
                              <TrashIcon />
                          </button>
                      </div>
                  ))}
                  {vacations.length === 0 && <p className="text-sm text-gray-400 italic text-center">Nenhum período de férias adicionado.</p>}
              </div>
              <div className="flex items-end gap-2">
                  <div className="flex-1">
                      <label htmlFor="vacation-start" className="block text-xs font-medium text-gray-300 mb-1">Início</label>
                      <input type="date" id="vacation-start" value={newVacationStart} onChange={e => setNewVacationStart(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                  </div>
                  <div className="flex-1">
                      <label htmlFor="vacation-end" className="block text-xs font-medium text-gray-300 mb-1">Fim</label>
                      <input type="date" id="vacation-end" value={newVacationEnd} onChange={e => setNewVacationEnd(e.target.value)} className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                  </div>
                  <button type="button" onClick={handleAddVacation} disabled={!newVacationStart || !newVacationEnd} className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-gray-500" aria-label="Adicionar período de férias">
                      <PlusIcon />
                  </button>
              </div>
          </div>
          <div className="flex justify-end gap-4 pt-4">
             <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500"
              disabled={isSubmitDisabled}
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
       <style>{`
        @keyframes fadeInScale {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EditMemberModal;

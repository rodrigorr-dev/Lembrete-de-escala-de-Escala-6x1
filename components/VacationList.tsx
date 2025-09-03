
import React from 'react';
import { TeamMember } from '../types';

interface VacationListProps {
  teamMembers: TeamMember[];
}

const VacationList: React.FC<VacationListProps> = ({ teamMembers }) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  const allVacations = teamMembers
    .flatMap(member => 
      (member.vacation || []).map(v => ({ ...v, memberName: member.name, id: `${member.id}-${v.start}` }))
    )
    .filter(v => new Date(v.end) >= today);

  allVacations.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const formatDateRange = (start: Date, end: Date) => {
    const startDate = new Date(start).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'});
    const endDate = new Date(end).toLocaleDateString('pt-BR', {day: '2-digit', month: '2-digit', year: 'numeric'});
    return `${startDate} - ${endDate}`;
  };

  return (
    <div className="border-t border-gray-700 pt-6 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-white">Próximas Férias</h3>
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {allVacations.length > 0 ? (
          allVacations.map(vacation => (
            <div key={vacation.id} className="bg-gray-700 p-3 rounded-md">
              <p className="font-medium text-gray-100">{vacation.memberName}</p>
              <p className="text-sm text-yellow-400">✈️ {formatDateRange(vacation.start, vacation.end)}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-400 italic text-center py-4">Nenhuma férias agendada.</p>
        )}
      </div>
    </div>
  );
};

export default VacationList;

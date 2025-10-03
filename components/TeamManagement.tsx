import React, { useState } from 'react';
import { TeamMember, ScheduleType, Vacation } from '../types';
import EditMemberModal from './EditMemberModal';
import { TrashIcon, EditIcon } from './Icons';
import { getNextDayOff } from '../utils/dateUtils';
import VacationList from './VacationList';

interface TeamManagementProps {
  teamMembers: TeamMember[];
  addMember: (name: string, scheduleType: ScheduleType, firstDayOff?: Date, birthday?: Date) => void;
  removeMember: (id: string) => void;
  updateMember: (id: string, name: string, scheduleType: ScheduleType, firstDayOff?: Date, birthday?: Date, vacation?: Vacation[]) => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ teamMembers, addMember, removeMember, updateMember }) => {
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleUpdateMember = (id: string, name: string, scheduleType: ScheduleType, firstDayOff?: Date, birthday?: Date, vacation?: Vacation[]) => {
    updateMember(id, name, scheduleType, firstDayOff, birthday, vacation);
    setEditingMember(null);
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Gerenciar Equipe</h2>
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4 text-white">Membros da Equipe ({teamMembers.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {teamMembers.length > 0 ? (
              teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between bg-gray-700 p-3 rounded-md hover:bg-gray-600 transition-colors">
                  <div className="flex flex-col">
                    <p className="font-medium text-gray-100">{member.name}</p>
                     {member.scheduleType === 'fixedSundayOff' ? (
                       <p className="text-xs text-gray-400">Folga fixa aos Domingos</p>
                    ) : (
                       <p className="text-xs text-gray-400">
                         Próxima folga: {getNextDayOff(member).toLocaleDateString('pt-BR')}
                       </p>
                    )}
                    {member.birthday && (
                      <p className="text-xs text-teal-400 mt-1">
                        🎂 {new Date(member.birthday).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingMember(member)}
                      className="p-2 rounded-full text-gray-400 hover:bg-blue-500 hover:text-white transition-colors"
                      aria-label={`Editar ${member.name}`}
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => {
                        if(confirm(`Tem certeza que deseja remover ${member.name}?`)) {
                          removeMember(member.id);
                        }
                      }}
                      className="p-2 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                      aria-label={`Remover ${member.name}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 italic text-center py-4">Nenhum membro na equipe.</p>
            )}
          </div>
        </div>
        <VacationList teamMembers={teamMembers} />
      </div>
      {editingMember && (
        <EditMemberModal
          member={editingMember}
          onUpdate={handleUpdateMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </>
  );
};

export default TeamManagement;
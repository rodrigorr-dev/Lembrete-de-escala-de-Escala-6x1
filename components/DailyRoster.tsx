
import React from 'react';
import { TeamMember } from '../types';
import MemberCard from './MemberCard';

interface DailyRosterProps {
  workingToday: TeamMember[];
  offToday: TeamMember[];
  currentDate: Date;
}

const DailyRoster: React.FC<DailyRosterProps> = ({ workingToday, offToday, currentDate }) => {
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(currentDate);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Escala do Dia</h2>
          <p className="text-teal-400 font-semibold">{formattedDate}</p>
        </div>
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <button 
              onClick={() => alert(`Simulando notificação de 5h da manhã:\n\nTrabalhando hoje: ${workingToday.length}\nDe folga: ${offToday.length}`)}
              className="relative px-4 py-2 bg-black rounded-lg leading-none flex items-center"
            >
              <span className="text-indigo-400">Simular Notificação 5h</span>
            </button>
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-green-400 border-b-2 border-green-400/30 pb-2">
            ✅ Trabalhando Hoje ({workingToday.length})
          </h3>
          {workingToday.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {workingToday.map(member => (
                <MemberCard key={member.id} name={member.name} status="working" />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Nenhum membro da equipe trabalhando hoje.</p>
          )}
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4 text-blue-400 border-b-2 border-blue-400/30 pb-2">
            🏖️ De Folga Hoje ({offToday.length})
          </h3>
          {offToday.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {offToday.map(member => (
                <MemberCard key={member.id} name={member.name} status="off" />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Ninguém está de folga hoje.</p>
          )}
        </div>
      </div>
       <div className="mt-8 p-3 bg-gray-900/50 rounded-lg text-center text-sm text-gray-400">
            <p><strong>Nota:</strong> A notificação real às 5h da manhã requer um servidor. Este botão simula como a notificação funcionaria.</p>
        </div>
    </div>
  );
};

export default DailyRoster;

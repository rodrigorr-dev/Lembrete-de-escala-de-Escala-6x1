
import React, { useState } from 'react';
import { TeamMember } from '../types';
import MemberCard from './MemberCard';
import { getNextDayOff } from '../utils/dateUtils';

interface DailyRosterProps {
  workingToday: TeamMember[];
  offToday: TeamMember[];
  currentDate: Date;
  teamMembers: TeamMember[];
}

const DailyRoster: React.FC<DailyRosterProps> = ({ workingToday, offToday, currentDate, teamMembers }) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(currentDate);

  const birthdaysToday = teamMembers.filter(member => {
     if (!member.birthday) return false;
     const bday = new Date(member.birthday);
     return bday.getDate() === currentDate.getDate() && bday.getMonth() === currentDate.getMonth();
  });

  const handleSimulateNotification = async () => {
    if (!('Notification' in window)) {
      alert('Este navegador não suporta notificações de desktop.');
      return;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'denied') {
      alert('Permissão para notificações negada. Por favor, habilite nas configurações do seu navegador.');
      return;
    }

    if (permission === 'granted') {
      setIsScheduling(true);
      alert('Notificação agendada para daqui a 10 segundos. Para testar, mantenha esta aba do navegador aberta.');

      setTimeout(() => {
        const workingNames = workingToday.map(m => m.name).join(', ') || 'Ninguém';
        const offNames = offToday.map(m => m.name).join(', ') || 'Ninguém';

        const notificationBody = `Trabalhando: ${workingNames}\nDe Folga: ${offNames}`;
        
        try {
          new Notification('📢 Lembrete de Escala 6x1', {
            body: notificationBody,
            icon: '/vite.svg',
            vibrate: [200, 100, 200],
            requireInteraction: true,
          } as any);
        } catch (e) {
          console.error('Erro ao criar notificação: ', e);
        }

        setIsScheduling(false);
      }, 10000); // 10 seconds
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Escala do Dia</h2>
          <p className="text-teal-400 font-semibold">{formattedDate}</p>
        </div>
        <div className="relative group">
          <div className={`absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 ${!isScheduling && 'group-hover:opacity-100'} transition duration-1000 group-hover:duration-200`}></div>
          <button
            onClick={handleSimulateNotification}
            disabled={isScheduling}
            className="relative px-4 py-2 bg-black rounded-lg leading-none flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="text-indigo-400 font-semibold">
              {isScheduling ? 'Notificação Agendada...' : 'Simular Notificação em 10s'}
            </span>
          </button>
        </div>
      </div>

      {birthdaysToday.length > 0 && (
        <div className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 p-4 rounded-lg mb-6 text-center">
          <p className="font-bold text-lg">🎉 Feliz Aniversário, {birthdaysToday.map(m => m.name).join(' & ')}! 🎉</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-4 text-green-400 border-b-2 border-green-400/30 pb-2">
            ✅ Trabalhando Hoje ({workingToday.length})
          </h3>
          {workingToday.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {workingToday.map(member => (
                <MemberCard 
                  key={member.id} 
                  member={member} 
                  status="working" 
                  nextDayOff={getNextDayOff(member).toLocaleDateString('pt-BR')}
                />
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
                <MemberCard key={member.id} member={member} status="off" />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic">Ninguém está de folga hoje.</p>
          )}
        </div>
      </div>
       <div className="mt-8 p-3 bg-gray-900/50 rounded-lg text-center text-sm text-gray-400">
            <p><strong>Nota:</strong> A notificação real às 5h da manhã requer um servidor. Este botão simula como a notificação funcionaria.</p>
            <p className="mt-2"><strong>Teste no Celular:</strong> Para que a notificação de teste funcione em 10 segundos, mantenha o navegador aberto e em primeiro plano. Navegadores de celular podem pausar a contagem se o aplicativo estiver em segundo plano para economizar bateria.</p>
        </div>
    </div>
  );
};

export default DailyRoster;

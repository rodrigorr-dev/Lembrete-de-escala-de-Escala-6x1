import React, { useState } from 'react';
import { TeamMember } from '../types';
import MemberCard from './MemberCard';

interface DailyRosterProps {
  workingToday: TeamMember[];
  offToday: TeamMember[];
  currentDate: Date;
}

const DailyRoster: React.FC<DailyRosterProps> = ({ workingToday, offToday, currentDate }) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const formattedDate = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(currentDate);

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
          // NOTE: For notifications to work reliably when the app is in the background (especially on mobile),
          // a Service Worker is required. This implementation uses a simple setTimeout, which may be
          // throttled or paused by the browser if the tab is inactive.
          // FIX: Cast notification options to 'any' to allow the 'vibrate' property.
          new Notification('📢 Lembrete de Escala 6x1', {
            body: notificationBody,
            icon: '/vite.svg',
            vibrate: [200, 100, 200], // Vibrate to make it more noticeable on mobile
            requireInteraction: true, // Keep notification visible until user interaction on supported platforms
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
            <p className="mt-2"><strong>Teste no Celular:</strong> Para que a notificação de teste funcione em 10 segundos, mantenha o navegador aberto e em primeiro plano. Navegadores de celular podem pausar a contagem se o aplicativo estiver em segundo plano para economizar bateria.</p>
        </div>
    </div>
  );
};

export default DailyRoster;
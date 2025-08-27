
import React, { useState, useCallback, useMemo } from 'react';
import { TeamMember } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DailyRoster from './components/DailyRoster';
import TeamManagement from './components/TeamManagement';

const App: React.FC = () => {
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('teamMembers', []);
  const [currentDate, setCurrentDate] = useState(new Date());

  const addMember = useCallback((name: string, firstDayOff: Date) => {
    if (name.trim() === '') return;
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      firstDayOff,
    };
    setTeamMembers(prev => [...prev, newMember].sort((a, b) => a.name.localeCompare(b.name)));
  }, [setTeamMembers]);

  const removeMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  }, [setTeamMembers]);
  
  const isOffToday = useCallback((member: TeamMember, date: Date): boolean => {
      const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

      const today = startOfDay(date);
      const memberFirstDayOff = startOfDay(new Date(member.firstDayOff));

      if (today < memberFirstDayOff) return false;

      const diffTime = today.getTime() - memberFirstDayOff.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays % 7 === 0;
  }, []);

  const { workingToday, offToday } = useMemo(() => {
    const working: TeamMember[] = [];
    const off: TeamMember[] = [];

    teamMembers.forEach(member => {
      if (isOffToday(member, currentDate)) {
        off.push(member);
      } else {
        working.push(member);
      }
    });
    return { workingToday: working, offToday: off };
  }, [teamMembers, currentDate, isOffToday]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
           <DailyRoster 
            workingToday={workingToday}
            offToday={offToday}
            currentDate={currentDate}
          />
        </div>
        <div className="lg:col-span-1">
          <TeamManagement 
            teamMembers={teamMembers}
            addMember={addMember}
            removeMember={removeMember}
          />
        </div>
      </main>
    </div>
  );
};

export default App;

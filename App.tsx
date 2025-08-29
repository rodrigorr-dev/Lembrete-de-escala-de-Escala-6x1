
import React, { useState, useCallback, useMemo } from 'react';
import { TeamMember } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DailyRoster from './components/DailyRoster';
import TeamManagement from './components/TeamManagement';
import CalendarView from './components/CalendarView';

const initialTeam: TeamMember[] = [
  {
    id: 'c7c2b0d8-1c3f-4e6a-9f8a-3b5d1e9c2a4f',
    name: 'Adriano',
    firstDayOff: new Date(2025, 7, 5), // August is month 7
    birthday: new Date(1900, 3, 13), // 13/abr
  },
  {
    id: 'f2a1b3e9-4d5c-6b7a-8c9d-0e1f2a3b4c5d',
    name: 'Alan',
    firstDayOff: new Date(2025, 7, 2),
    birthday: new Date(1900, 3, 13), // 13/abr
  },
  {
    id: 'b3e8c1a2-5d6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Manuel',
    firstDayOff: new Date(2025, 7, 1),
    birthday: new Date(1900, 6, 29), // 29/jul
  },
  {
    id: 'a9d8c7b6-5e4f-3d2c-1b0a-9f8e7d6c5b4a',
    name: 'Marcos',
    firstDayOff: new Date(2025, 7, 4),
    birthday: new Date(1900, 7, 2), // 02/ago
  },
  {
    id: 'a2c3b8f9-4d5e-5b7c-9c1f-0e3a9d8b5c2d',
    name: 'Mário',
    firstDayOff: new Date(2025, 7, 6),
    birthday: new Date(1900, 10, 25), // 25/nov
  },
  {
    id: 'e1d2c3b4-5a6f-7e8d-9c0b-1a2f3e4d5c6b',
    name: 'Mauro',
    firstDayOff: new Date(2025, 7, 3),
    birthday: new Date(1900, 8, 2), // 02/set
  },
  {
    id: 'd1b2a9e8-3c4f-4a6b-8b0e-9d2f8c7e4a1b',
    name: 'Valci',
    firstDayOff: new Date(2025, 7, 3),
    birthday: new Date(1900, 10, 9), // 09/nov
  },
];

const App: React.FC = () => {
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('teamMembers', initialTeam);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 24));

  const addMember = useCallback((name: string, firstDayOff: Date, birthday?: Date) => {
    if (name.trim() === '') return;
    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      firstDayOff,
      birthday,
    };
    setTeamMembers(prev => [...prev, newMember].sort((a, b) => a.name.localeCompare(b.name)));
  }, [setTeamMembers]);

  const removeMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  }, [setTeamMembers]);
  
  const updateMember = useCallback((id: string, name: string, firstDayOff: Date, birthday?: Date) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, name: name.trim(), firstDayOff, birthday } : member
      ).sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [setTeamMembers]);

  const isOffToday = useCallback((member: TeamMember, date: Date): boolean => {
      const dayInMs = 1000 * 60 * 60 * 24;

      const dateToCheckUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
      
      const firstDayOffDate = new Date(member.firstDayOff);
      const firstDayOffUTC = Date.UTC(firstDayOffDate.getFullYear(), firstDayOffDate.getMonth(), firstDayOffDate.getDate());

      if (dateToCheckUTC < firstDayOffUTC) {
        return false;
      }
      
      const diffTime = dateToCheckUTC - firstDayOffUTC;
      const diffDays = Math.round(diffTime / dayInMs);

      return diffDays % 6 === 0;
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
        <div className="lg:col-span-2 space-y-8">
           <CalendarView
            currentDate={currentDate}
            setCurrentDate={setCurrentDate}
            teamMembers={teamMembers}
            isOffToday={isOffToday}
           />
           <DailyRoster 
            workingToday={workingToday}
            offToday={offToday}
            currentDate={currentDate}
            teamMembers={teamMembers}
          />
        </div>
        <div className="lg:col-span-1">
          <TeamManagement 
            teamMembers={teamMembers}
            addMember={addMember}
            removeMember={removeMember}
            updateMember={updateMember}
          />
        </div>
      </main>
    </div>
  );
};

export default App;

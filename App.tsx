
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { TeamMember, ScheduleType } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DailyRoster from './components/DailyRoster';
import TeamManagement from './components/TeamManagement';
import CalendarView from './components/CalendarView';

const initialTeam: TeamMember[] = [
  {
    id: 'c7c2b0d8-1c3f-4e6a-9f8a-3b5d1e9c2a4f',
    name: 'Adriano',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 5), // August is month 7
    birthday: new Date(1900, 3, 13), // 13/abr
  },
  {
    id: 'f2a1b3e9-4d5c-6b7a-8c9d-0e1f2a3b4c5d',
    name: 'Alan',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 2),
    birthday: new Date(1900, 3, 13), // 13/abr
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Antonio Rodrigo',
    scheduleType: 'fixedSundayOff',
    birthday: new Date(1900, 11, 26), // 26/dez
  },
  {
    id: 'b3e8c1a2-5d6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Manuel',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 1),
    birthday: new Date(1900, 6, 29), // 29/jul
  },
  {
    id: 'a9d8c7b6-5e4f-3d2c-1b0a-9f8e7d6c5b4a',
    name: 'Marcos',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 4),
    birthday: new Date(1900, 7, 2), // 02/ago
  },
  {
    id: 'a2c3b8f9-4d5e-5b7c-9c1f-0e3a9d8b5c2d',
    name: 'Mário',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 6),
    birthday: new Date(1900, 10, 25), // 25/nov
  },
  {
    id: 'e1d2c3b4-5a6f-7e8d-9c0b-1a2f3e4d5c6b',
    name: 'Mauro',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 3),
    birthday: new Date(1900, 8, 2), // 02/set
  },
  {
    id: 'd1b2a9e8-3c4f-4a6b-8b0e-9d2f8c7e4a1b',
    name: 'Valci',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 3),
    birthday: new Date(1900, 10, 9), // 09/nov
  },
];

const App: React.FC = () => {
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('teamMembers', initialTeam);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 24));
  const dailyRosterRef = useRef<HTMLDivElement>(null);

  const addMember = useCallback((name: string, scheduleType: ScheduleType, firstDayOff?: Date, birthday?: Date) => {
    if (name.trim() === '') return;
    if (scheduleType === '5x1' && !firstDayOff) {
        alert("Para a escala 5x1, a data da primeira folga é obrigatória.");
        return;
    }

    const newMember: TeamMember = {
      id: crypto.randomUUID(),
      name: name.trim(),
      scheduleType,
      firstDayOff: scheduleType === '5x1' ? firstDayOff : undefined,
      birthday,
    };
    setTeamMembers(prev => [...prev, newMember].sort((a, b) => a.name.localeCompare(b.name)));
  }, [setTeamMembers]);

  const removeMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  }, [setTeamMembers]);
  
  const updateMember = useCallback((id: string, name: string, scheduleType: ScheduleType, firstDayOff?: Date, birthday?: Date) => {
    if (scheduleType === '5x1' && !firstDayOff) {
        alert("Para a escala 5x1, a data da primeira folga é obrigatória.");
        return;
    }
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id ? { 
            ...member, 
            name: name.trim(), 
            scheduleType, 
            firstDayOff: scheduleType === '5x1' ? firstDayOff : undefined,
            birthday 
        } : member
      ).sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [setTeamMembers]);

  const isOffToday = useCallback((member: TeamMember, date: Date): boolean => {
      if (member.scheduleType === 'fixedSundayOff') {
        return date.getDay() === 0; // 0 is Sunday
      }

      // '5x1' logic
      if (!member.firstDayOff) return false;

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

  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date);
    setTimeout(() => {
        dailyRosterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <CalendarView
            currentDate={currentDate}
            setCurrentDate={handleDateSelect}
            teamMembers={teamMembers}
            isOffToday={isOffToday}
           />
           <div ref={dailyRosterRef}>
            <DailyRoster 
              workingToday={workingToday}
              offToday={offToday}
              currentDate={currentDate}
              teamMembers={teamMembers}
            />
          </div>
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
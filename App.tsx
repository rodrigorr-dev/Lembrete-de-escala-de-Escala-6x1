
import React, { useState, useCallback, useMemo } from 'react';
import { TeamMember } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DailyRoster from './components/DailyRoster';
import TeamManagement from './components/TeamManagement';
import CalendarView from './components/CalendarView';

const initialTeam: TeamMember[] = [
  {
    id: 'd1b2a9e8-3c4f-4a6b-8b0e-9d2f8c7e4a1b',
    name: 'Jose Valci',
    firstDayOff: new Date(2025, 7, 27), // August is month 7 (0-indexed)
  },
  {
    id: 'a2c3b8f9-4d5e-5b7c-9c1f-0e3a9d8b5c2d',
    name: 'Mario',
    firstDayOff: new Date(2025, 7, 24),
  },
];

const App: React.FC = () => {
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('teamMembers', initialTeam);
  const [currentDate, setCurrentDate] = useState(new Date(2025, 7, 24));

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
  
  const updateMember = useCallback((id: string, name: string, firstDayOff: Date) => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, name: name.trim(), firstDayOff } : member
      ).sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [setTeamMembers]);

  const isOffToday = useCallback((member: TeamMember, date: Date): boolean => {
      const dayInMs = 1000 * 60 * 60 * 24;

      // Get UTC timestamp for the start of the day for the date to check.
      // `date` is a local Date object. We extract its year, month, day components
      // and use Date.UTC to get a consistent, timezone-agnostic timestamp.
      const dateToCheckUTC = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
      
      // Do the same for the member's first day off.
      // It's a Date object loaded from localStorage, representing a local date.
      const firstDayOffDate = new Date(member.firstDayOff);
      const firstDayOffUTC = Date.UTC(firstDayOffDate.getFullYear(), firstDayOffDate.getMonth(), firstDayOffDate.getDate());

      if (dateToCheckUTC < firstDayOffUTC) {
        return false;
      }
      
      const diffTime = dateToCheckUTC - firstDayOffUTC;
      // The difference will be a multiple of dayInMs, safe from DST shifts.
      const diffDays = Math.round(diffTime / dayInMs);

      // A 6-day cycle makes the day off move 1 day earlier each week.
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

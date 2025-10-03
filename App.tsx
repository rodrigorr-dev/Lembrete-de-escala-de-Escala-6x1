
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { TeamMember, ScheduleType, Vacation, Occurrence } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Header from './components/Header';
import DailyRoster from './components/DailyRoster';
import TeamManagement from './components/TeamManagement';
import CalendarView from './components/CalendarView';
import OccurrencesLog from './components/OccurrencesLog';
import { getOccurrences, addOccurrence as addOccurrenceService, removeOccurrence as removeOccurrenceService } from './services/googleSheetService';
import { SCRIPT_URL } from './config';

const initialTeam: TeamMember[] = [
  {
    id: 'c7c2b0d8-1c3f-4e6a-9f8a-3b5d1e9c2a4f',
    name: 'Adriano',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 5),
    birthday: new Date(1900, 3, 13), // 13/abr
    vacation: [{ start: new Date(2025, 9, 13), end: new Date(2025, 9, 31) }], // Outubro
  },
  {
    id: 'f2a1b3e9-4d5c-6b7a-8c9d-0e1f2a3b4c5d',
    name: 'Alan',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 2),
    birthday: new Date(1900, 7, 2), // 02/ago
    vacation: [{ start: new Date(2025, 2, 1), end: new Date(2025, 2, 31) }], // Março
  },
  {
    id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
    name: 'Antonio Rodrigo', // Mapping from Antonio Marcos in the image
    scheduleType: 'fixedSundayOff',
    birthday: new Date(1900, 11, 26), // 26/dez
  },
  {
    id: 'b3e8c1a2-5d6f-7a8b-9c0d-1e2f3a4b5c6d',
    name: 'Manuel',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 1),
    birthday: new Date(1900, 10, 25), // 25/nov
    vacation: [{ start: new Date(2025, 11, 1), end: new Date(2025, 11, 31) }], // Dezembro
  },
  {
    id: 'a9d8c7b6-5e4f-3d2c-1b0a-9f8e7d6c5b4a',
    name: 'Marcos',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 4),
    birthday: new Date(1900, 10, 9), // 09/nov
  },
  {
    id: 'a2c3b8f9-4d5e-5b7c-9c1f-0e3a9d8b5c2d',
    name: 'Mário',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 6),
    birthday: new Date(1900, 8, 2), // 02/set
    vacation: [{ start: new Date(2025, 3, 1), end: new Date(2025, 3, 30) }], // Abril
  },
  {
    id: 'e1d2c3b4-5a6f-7e8d-9c0b-1a2f3e4d5c6b',
    name: 'Mauro',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 3),
    birthday: new Date(1900, 4, 6), // 06/mai
    vacation: [{ start: new Date(2025, 5, 1), end: new Date(2025, 5, 30) }], // Junho
  },
  {
    id: '4b6d3a2c-1e9f-8d7c-6b5a-4f3e2d1c0b9a',
    name: 'Pedro Henrique',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 7),
    birthday: new Date(1900, 4, 7), // 07/mai
  },
  {
    id: 'd1b2a9e8-3c4f-4a6b-8b0e-9d2f8c7e4a1b',
    name: 'Valci',
    scheduleType: '5x1',
    firstDayOff: new Date(2025, 7, 3),
    birthday: new Date(1900, 6, 29), // 29/jul
    vacation: [{ start: new Date(2025, 10, 1), end: new Date(2025, 10, 30) }], // Novembro
  },
];

const App: React.FC = () => {
  const [teamMembers, setTeamMembers] = useLocalStorage<TeamMember[]>('teamMembers', initialTeam);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [isLoadingOccurrences, setIsLoadingOccurrences] = useState(true);
  const [errorOccurrences, setErrorOccurrences] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'schedule' | 'occurrences'>('schedule');
  const dailyRosterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'occurrences') {
      const fetchOccurrences = async () => {
        // Não busca se a URL não estiver configurada
        // FIX: Cast SCRIPT_URL to string to avoid a TypeScript error comparing two different literal types. This preserves the developer setup check.
        if ((SCRIPT_URL as string) === 'COLE_A_URL_DO_SEU_APP_DA_WEB_AQUI') {
          setErrorOccurrences('Por favor, siga o arquivo INSTRUCTIONS.md para configurar a conexão com a Planilha Google.');
          setIsLoadingOccurrences(false);
          return;
        }
        try {
          setIsLoadingOccurrences(true);
          setErrorOccurrences(null);
          const data = await getOccurrences();
          setOccurrences(data);
        } catch (err) {
          setErrorOccurrences(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido ao buscar as ocorrências.');
        } finally {
          setIsLoadingOccurrences(false);
        }
      };
      fetchOccurrences();
    }
  }, [activeTab]);

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
      vacation: [],
    };
    setTeamMembers(prev => [...prev, newMember].sort((a, b) => a.name.localeCompare(b.name)));
  }, [setTeamMembers]);

  const removeMember = useCallback((id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  }, [setTeamMembers]);
  
  const updateMember = useCallback((id: string, name: string, scheduleType: ScheduleType, firstDayOff?: Date, birthday?: Date, vacation?: Vacation[]) => {
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
            birthday,
            vacation
        } : member
      ).sort((a, b) => a.name.localeCompare(b.name))
    );
  }, [setTeamMembers]);

  const addOccurrence = useCallback(async (date: Date, description: string): Promise<void> => {
    const newOccurrence = await addOccurrenceService(date, description);
    setOccurrences(prev => [...prev, newOccurrence]);
  }, []);

  const removeOccurrence = useCallback(async (id: string): Promise<void> => {
    await removeOccurrenceService(id);
    setOccurrences(prev => prev.filter(occurrence => occurrence.id !== id));
  }, []);

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

  const isOnVacation = useCallback((member: TeamMember, date: Date): boolean => {
    if (!member.vacation || member.vacation.length === 0) return false;
    
    const checkTime = new Date(date);
    checkTime.setHours(0, 0, 0, 0);
    const checkTimeMs = checkTime.getTime();

    return member.vacation.some(v => {
        if (!v.start || !v.end) return false;
        const startTime = new Date(v.start);
        startTime.setHours(0, 0, 0, 0);
        const endTime = new Date(v.end);
        endTime.setHours(0, 0, 0, 0);
        
        return checkTimeMs >= startTime.getTime() && checkTimeMs <= endTime.getTime();
    });
  }, []);

  const { workingToday, offToday, onVacationToday } = useMemo(() => {
    const working: TeamMember[] = [];
    const off: TeamMember[] = [];
    const vacation: TeamMember[] = [];

    teamMembers.forEach(member => {
      if (isOnVacation(member, currentDate)) {
        vacation.push(member);
      } else if (isOffToday(member, currentDate)) {
        off.push(member);
      } else {
        working.push(member);
      }
    });
    return { workingToday: working, offToday: off, onVacationToday: vacation };
  }, [teamMembers, currentDate, isOffToday, isOnVacation]);

  const handleDateSelect = useCallback((date: Date) => {
    setCurrentDate(date);
    setTimeout(() => {
        dailyRosterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        {/* Tab Navigation */}
        <div className="mb-6 md:mb-8">
          <nav className="flex space-x-2 sm:space-x-4 border-b border-gray-700" aria-label="Abas principais">
            <button
              onClick={() => setActiveTab('schedule')}
              role="tab"
              aria-selected={activeTab === 'schedule'}
              className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 rounded-t-md ${
                activeTab === 'schedule'
                  ? 'border-b-2 border-teal-400 text-teal-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              Escala e Equipe
            </button>
            <button
              onClick={() => setActiveTab('occurrences')}
              role="tab"
              aria-selected={activeTab === 'occurrences'}
              className={`py-2 px-3 sm:px-4 text-sm sm:text-base font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 rounded-t-md ${
                activeTab === 'occurrences'
                  ? 'border-b-2 border-teal-400 text-teal-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              Registro de Ocorrências
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div role="tabpanel">
          {activeTab === 'schedule' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <CalendarView
                  currentDate={currentDate}
                  setCurrentDate={handleDateSelect}
                  teamMembers={teamMembers}
                  isOffToday={isOffToday}
                  isOnVacation={isOnVacation}
                />
                <div ref={dailyRosterRef}>
                  <DailyRoster
                    workingToday={workingToday}
                    offToday={offToday}
                    onVacationToday={onVacationToday}
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
            </div>
          )}

          {activeTab === 'occurrences' && (
             <div className="max-w-4xl mx-auto">
                {isLoadingOccurrences && <p className="text-center text-gray-300 py-8">Carregando ocorrências da sua Planilha Google...</p>}
                {errorOccurrences && (
                  <div className="text-center bg-red-900/50 border border-red-500 text-red-300 p-4 rounded-lg">
                    <p className="font-bold">Ocorreu um Erro</p>
                    <p className="mt-2 text-sm">{errorOccurrences}</p>
                  </div>
                )}
                {!isLoadingOccurrences && !errorOccurrences && (
                    <OccurrencesLog
                        occurrences={occurrences}
                        addOccurrence={addOccurrence}
                        removeOccurrence={removeOccurrence}
                    />
                )}
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;

export type ScheduleType = '5x1' | 'fixedSundayOff';

export interface Vacation {
  start: Date;
  end: Date;
}

export interface TeamMember {
  id: string;
  name: string;
  scheduleType: ScheduleType;
  firstDayOff?: Date;
  birthday?: Date;
  vacation?: Vacation[];
}

export interface Occurrence {
  id: string;
  date: Date;
  description: string;
}

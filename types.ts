
export type ScheduleType = '5x1' | 'fixedSundayOff';

export interface TeamMember {
  id: string;
  name: string;
  scheduleType: ScheduleType;
  firstDayOff?: Date;
  birthday?: Date;
}
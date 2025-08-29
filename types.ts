
export type ScheduleType = '6x1' | 'fixedSundayOff';

export interface TeamMember {
  id: string;
  name: string;
  scheduleType: ScheduleType;
  firstDayOff?: Date;
  birthday?: Date;
}

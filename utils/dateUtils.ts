import { TeamMember } from '../types';

export const getNextDayOff = (member: TeamMember): Date => {
  const dayInMs = 1000 * 60 * 60 * 24;
  const today = new Date();
  
  // Set hours to 0 to avoid timezone issues
  today.setHours(0, 0, 0, 0);

  const firstDayOffDate = new Date(member.firstDayOff);
  firstDayOffDate.setHours(0, 0, 0, 0);

  if (today.getTime() <= firstDayOffDate.getTime()) {
    return firstDayOffDate;
  }

  // Use UTC to calculate difference to avoid DST issues
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const firstDayOffUTC = Date.UTC(firstDayOffDate.getFullYear(), firstDayOffDate.getMonth(), firstDayOffDate.getDate());

  const diffTime = todayUTC - firstDayOffUTC;
  const diffDays = Math.round(diffTime / dayInMs);

  const remainder = diffDays % 6;
  
  // If today is a day off (remainder is 0), the next one is in 6 days.
  // Otherwise, it's 6 - remainder days away.
  const daysToAdd = remainder === 0 ? 6 : 6 - remainder;
  
  const nextDayOff = new Date(today);
  nextDayOff.setDate(today.getDate() + daysToAdd);
  
  return nextDayOff;
};

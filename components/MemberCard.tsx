import React from 'react';
import { TeamMember } from '../types';

interface MemberCardProps {
  member: TeamMember;
  status: 'working' | 'off';
  nextDayOff?: string;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, status, nextDayOff }) => {
  const baseClasses = "p-3 rounded-lg shadow-md text-center transition-all duration-300 flex flex-col justify-center min-h-[70px]";
  const statusClasses = status === 'working'
    ? "bg-green-500/10 text-green-300 border border-green-500/30"
    : "bg-blue-500/10 text-blue-300 border border-blue-500/30";

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      <p className="font-semibold">{member.name}</p>
      {status === 'working' && nextDayOff && (
        <p className="text-xs text-gray-400 mt-1">
          Próxima folga: {nextDayOff}
        </p>
      )}
    </div>
  );
};

export default MemberCard;
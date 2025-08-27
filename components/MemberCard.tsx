
import React from 'react';

interface MemberCardProps {
  name: string;
  status: 'working' | 'off';
}

const MemberCard: React.FC<MemberCardProps> = ({ name, status }) => {
  const baseClasses = "p-3 rounded-lg shadow-md text-center font-semibold transition-all duration-300";
  const statusClasses = status === 'working'
    ? "bg-green-500/10 text-green-300 border border-green-500/30"
    : "bg-blue-500/10 text-blue-300 border border-blue-500/30";

  return (
    <div className={`${baseClasses} ${statusClasses}`}>
      {name}
    </div>
  );
};

export default MemberCard;

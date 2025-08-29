
import React, { useState } from 'react';
import { PlusIcon } from './Icons';

interface AddMemberFormProps {
  addMember: (name: string, firstDayOff: Date, birthday?: Date) => void;
}

const AddMemberForm: React.FC<AddMemberFormProps> = ({ addMember }) => {
  const [name, setName] = useState('');
  const [firstDayOff, setFirstDayOff] = useState(new Date().toISOString().split('T')[0]);
  const [birthday, setBirthday] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && firstDayOff) {
      const dateParts = firstDayOff.split('-').map(Number);
      const fdoDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

      let bdayDate: Date | undefined = undefined;
      if (birthday) {
        const bdayParts = birthday.split('-').map(Number);
        bdayDate = new Date(bdayParts[0], bdayParts[1] - 1, bdayParts[2]);
      }
      
      addMember(name, fdoDate, bdayDate);
      setName('');
      setFirstDayOff(new Date().toISOString().split('T')[0]);
      setBirthday('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome do Membro</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: João da Silva"
          required
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label htmlFor="first-day-off" className="block text-sm font-medium text-gray-300 mb-1">Primeiro Dia de Folga</label>
        <input
          id="first-day-off"
          type="date"
          value={firstDayOff}
          onChange={(e) => setFirstDayOff(e.target.value)}
          required
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label htmlFor="birthday" className="block text-sm font-medium text-gray-300 mb-1">Aniversário (Opcional)</label>
        <input
          id="birthday"
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <button 
        type="submit" 
        className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500"
        disabled={!name || !firstDayOff}
      >
        <PlusIcon />
        Adicionar Membro
      </button>
    </form>
  );
};

export default AddMemberForm;

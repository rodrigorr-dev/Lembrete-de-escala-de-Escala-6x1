
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <h1 className="text-2xl md:text-3xl font-bold text-teal-400">
          Gestor de Escala 6x1
        </h1>
        <p className="text-gray-400">Sua ferramenta para organização diária da equipe.</p>
      </div>
    </header>
  );
};

export default Header;

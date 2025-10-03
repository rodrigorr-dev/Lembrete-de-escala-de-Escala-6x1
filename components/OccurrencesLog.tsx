import React, { useState, useMemo, useEffect } from 'react';
import { Occurrence } from '../types';
import { PlusIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface OccurrencesLogProps {
  occurrences: Occurrence[];
  addOccurrence: (date: Date, description: string) => Promise<void>;
  removeOccurrence: (id: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 5;

// Função auxiliar para obter a data local de hoje no formato YYYY-MM-DD, evitando problemas de fuso horário.
const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  // padStart é usado para garantir que o mês e o dia tenham dois dígitos (ex: 01, 09)
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const OccurrencesLog: React.FC<OccurrencesLogProps> = ({ occurrences, addOccurrence, removeOccurrence }) => {
  const [description, setDescription] = useState('');
  // Usa a função auxiliar para definir a data padrão como a data local de hoje.
  const [date, setDate] = useState(getTodayDateString());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() && date && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const dateParts = date.split('-').map(Number);
        // O construtor de Date com partes (ano, mês - 1, dia) usa o horário local.
        const occurrenceDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
        await addOccurrence(occurrenceDate, description.trim());
        setDescription('');
        // Redefine a data para hoje após o envio.
        setDate(getTodayDateString());
        setCurrentPage(1); // Reset to first page to show the new entry
      } catch (error) {
        console.error("Falha ao adicionar ocorrência:", error);
        alert(`Não foi possível adicionar a ocorrência. Verifique sua conexão ou a configuração da planilha.\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm('Tem certeza que deseja remover esta ocorrência? A ação não pode ser desfeita.')) {
      try {
        await removeOccurrence(id);
      } catch (error) {
        console.error("Falha ao remover ocorrência:", error);
        alert(`Não foi possível remover a ocorrência.\n\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const isSubmitDisabled = !description.trim() || !date || isSubmitting;
  
  const { paginatedOccurrences, totalPages } = useMemo(() => {
    const sorted = [...occurrences].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const total = Math.ceil(sorted.length / ITEMS_PER_PAGE);
    const paginated = sorted.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
    return { paginatedOccurrences: paginated, totalPages: total > 0 ? total : 1 };
  }, [occurrences, currentPage]);

  useEffect(() => {
    // Adjust current page if it becomes invalid after deleting an item
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-xl p-6 h-full">
      <h2 className="text-2xl font-bold text-white mb-4">Registro de Ocorrências</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label htmlFor="occurrence-date" className="block text-sm font-medium text-gray-300 mb-1">Data da Ocorrência</label>
          <input
            id="occurrence-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Parada no Elevador 15 devido a entupimento"
            required
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-300 disabled:bg-gray-500 disabled:cursor-wait"
          disabled={isSubmitDisabled}
        >
          <PlusIcon />
          {isSubmitting ? 'Adicionando...' : 'Adicionar Ocorrência'}
        </button>
      </form>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-white">Histórico ({occurrences.length})</h3>
        <div className="space-y-3 min-h-[24rem]">
          {occurrences.length > 0 ? (
            paginatedOccurrences.map(occurrence => (
              <div key={occurrence.id} className="flex items-start justify-between bg-gray-700 p-3 rounded-md hover:bg-gray-600 transition-colors">
                <div>
                  <p className="font-semibold text-teal-400">{new Date(occurrence.date).toLocaleDateString('pt-BR', { dateStyle: 'long' })}</p>
                  <p className="text-gray-200 mt-1 whitespace-pre-wrap">{occurrence.description}</p>
                </div>
                <button
                  onClick={() => handleRemove(occurrence.id)}
                  className="p-2 ml-2 flex-shrink-0 rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
                  aria-label={`Remover ocorrência de ${new Date(occurrence.date).toLocaleDateString('pt-BR')}`}
                >
                  <TrashIcon />
                </button>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 italic text-center py-4">Nenhuma ocorrência registrada na planilha.</p>
            </div>
          )}
        </div>
         {occurrences.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Página anterior"
            >
              <ChevronLeftIcon />
              Anterior
            </button>
            <span className="text-sm font-medium text-gray-400" aria-live="polite">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Próxima página"
            >
              Próxima
              <ChevronRightIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OccurrencesLog;
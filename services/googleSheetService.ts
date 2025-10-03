import { SCRIPT_URL } from '../config';
import { Occurrence } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Função para converter dados da planilha para o tipo Occurrence com Datas
const parseOccurrence = (data: any): Occurrence => ({
  id: data.id,
  date: new Date(data.date), // Converte a string de data para objeto Date
  description: data.description,
});


export const getOccurrences = async (): Promise<Occurrence[]> => {
  // FIX: Cast SCRIPT_URL to string to avoid a TypeScript error comparing two different literal types. This preserves the developer setup check.
  if ((SCRIPT_URL as string) === 'COLE_A_URL_DO_SEU_APP_DA_WEB_AQUI') {
    throw new Error('A URL do Google Apps Script não foi configurada no arquivo config.ts.');
  }
  const response = await fetch(SCRIPT_URL);
  const result: ApiResponse<any[]> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Falha ao buscar ocorrências.');
  }
  
  // Garante que o retorno seja um array e converte as datas
  return Array.isArray(result.data) ? result.data.map(parseOccurrence) : [];
};

export const addOccurrence = async (date: Date, description: string): Promise<Occurrence> => {
   // FIX: Cast SCRIPT_URL to string to avoid a TypeScript error comparing two different literal types. This preserves the developer setup check.
   if ((SCRIPT_URL as string) === 'COLE_A_URL_DO_SEU_APP_DA_WEB_AQUI') {
    throw new Error('A URL do Google Apps Script não foi configurada no arquivo config.ts.');
  }

  const formData = new FormData();
  formData.append('action', 'add');
  formData.append('payload', JSON.stringify({ date: date.toISOString(), description }));

  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: formData,
  });

  const result: ApiResponse<any> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Falha ao adicionar ocorrência.');
  }

  return parseOccurrence(result.data);
};

export const removeOccurrence = async (id: string): Promise<{ id: string }> => {
   // FIX: Cast SCRIPT_URL to string to avoid a TypeScript error comparing two different literal types. This preserves the developer setup check.
   if ((SCRIPT_URL as string) === 'COLE_A_URL_DO_SEU_APP_DA_WEB_AQUI') {
    throw new Error('A URL do Google Apps Script não foi configurada no arquivo config.ts.');
  }
  
  const formData = new FormData();
  formData.append('action', 'remove');
  formData.append('payload', JSON.stringify({ id }));

  const response = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: formData,
  });

  const result: ApiResponse<{ id: string }> = await response.json();

  if (!result.success) {
    throw new Error(result.error || 'Falha ao remover ocorrência.');
  }

  return result.data!;
};

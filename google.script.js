/**
 * Este script é o backend que conecta seu aplicativo à Planilha Google.
 * Ele deve ser colado no editor do Google Apps Script associado à sua planilha.
 */

// Define o nome da aba que será usada como banco de dados.
const SHEET_NAME = 'Ocorrencias';

// Pega a planilha ATIVA onde o script está rodando e a aba específica.
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

/**
 * Função principal para requisições GET.
 * Usada para buscar todos os dados da planilha.
 */
function doGet(e) {
  try {
    if (!sheet) {
      throw new Error(`A aba "${SHEET_NAME}" não foi encontrada na planilha.`);
    }
    const data = sheet.getDataRange().getValues();
    const headers = data.shift(); // Remove o cabeçalho
    
    const occurrences = data.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        obj[header] = row[i];
      });
      return obj;
    });

    return createJsonResponse({ success: true, data: occurrences });

  } catch (error) {
    return createJsonResponse({ success: false, error: error.message });
  }
}

/**
 * Função principal para requisições POST.
 * Usada para adicionar ou remover dados.
 */
function doPost(e) {
  try {
    // Para requisições FormData, os dados chegam em e.parameter
    const action = e.parameter.action;
    const payload = JSON.parse(e.parameter.payload);

    let result;

    if (action === 'add') {
      result = addOccurrence(payload);
    } else if (action === 'remove') {
      result = removeOccurrence(payload);
    } else {
      throw new Error('Ação inválida.');
    }
    
    return createJsonResponse({ success: true, data: result });

  } catch (error) {
     return createJsonResponse({ success: false, error: error.message });
  }
}

/**
 * Adiciona uma nova ocorrência na planilha.
 * @param {object} data - O objeto da ocorrência com 'date' e 'description'.
 * @returns {object} A nova ocorrência com um ID gerado.
 */
function addOccurrence(data) {
  const { date, description } = data;
  const id = Utilities.getUuid();
  
  // As colunas devem ser id, date, description
  sheet.appendRow([id, new Date(date).toISOString(), description]);
  
  return { id, date, description };
}

/**
 * Remove uma ocorrência pelo ID.
 * @param {object} data - O objeto contendo o 'id' da ocorrência a ser removida.
 * @returns {object} O id da ocorrência removida.
 */
function removeOccurrence(data) {
  const { id } = data;
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Procura a linha com o ID correspondente (assumindo que 'id' é a primeira coluna)
  const rowIndex = values.findIndex(row => row[0] === id);
  
  if (rowIndex > 0) { // rowIndex > 0 para não apagar o cabeçalho
    // A linha do índice é baseada em 0, mas as linhas da planilha são baseadas em 1
    sheet.deleteRow(rowIndex + 1); 
    return { id };
  } else {
    throw new Error('Ocorrência não encontrada com o ID: ' + id);
  }
}

/**
 * Cria uma resposta JSON padronizada.
 * @param {object} obj - O objeto a ser convertido para JSON.
 */
function createJsonResponse(obj) {
  // A função `.withHeaders()` não existe no ContentService do Google Apps Script.
  // Os cabeçalhos CORS necessários (como 'Access-Control-Allow-Origin') são adicionados
  // automaticamente pelo ambiente do Apps Script quando um App da Web é implantado
  // corretamente com "Executar como: Eu" e "Quem pode acessar: Qualquer pessoa".
  // A remoção da chamada de função incorreta corrige o erro de execução do script.
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

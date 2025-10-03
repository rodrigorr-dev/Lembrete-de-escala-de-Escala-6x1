# Como Conectar o App a uma Planilha Google

Siga estes passos para usar uma Planilha Google como banco de dados para o seu registro de ocorrências, permitindo que os dados sejam sincronizados entre todos os seus dispositivos.

## Passo 1: Crie a Planilha

1.  Acesse o [Google Sheets](https://sheets.new) e crie uma nova planilha em branco.
2.  Renomeie a planilha para algo como "Banco de Dados App Escala".
3.  A primeira aba (página) da planilha **deve ser renomeada** para `Ocorrencias`. É muito importante que o nome seja exatamente este, com "O" maiúsculo.
4.  Na aba `Ocorrencias`, configure a primeira linha (o cabeçalho) com os seguintes títulos, em letras minúsculas e exatamente nesta ordem:
    *   Célula A1: `id`
    *   Célula B1: `date`
    *   Célula C1: `description`

Sua planilha deve ficar assim:

| | A | B | C |
|---|---|---|---|
| 1 | id | date | description |

## Passo 2: Crie o Google Apps Script

1.  Com a planilha aberta, vá em `Extensões` > `Apps Script`. Isso abrirá o editor de scripts em uma nova aba.
2.  Apague todo o código de exemplo que aparecer no arquivo `Código.gs`.
3.  Copie **todo o conteúdo** do arquivo `google.script.js` que foi gerado e cole no editor do Apps Script.
4.  Clique no ícone de **Salvar projeto** (disquete).

## Passo 3: Implante o Script como um Aplicativo Web

1.  No canto superior direito do editor do Apps Script, clique no botão azul **Implantar** e selecione **Nova implantação**.
2.  Clique no ícone de engrenagem (`Selecionar tipo`) e escolha **App da Web**.
3.  No campo "Descrição", você pode colocar "API para App de Escala".
4.  Em "Executar como", deixe **"Eu (seu@email.com)"**.
5.  Em "Quem pode acessar", selecione **Qualquer pessoa**.
    *   **Atenção:** Isso permite que qualquer pessoa com o link possa ler e escrever na sua planilha. Para este aplicativo, é o método mais simples.
6.  Clique em **Implantar**.
7.  O Google pedirá autorização. Clique em **Autorizar acesso**, escolha sua conta Google, clique em "Avançado", e depois em "Acessar (nome do projeto) (não seguro)" e "Permitir".
8.  Após a implantação, uma janela aparecerá com a **URL do app da Web**. Copie esta URL. Ela é o endereço do seu novo "servidor".

## Passo 4: Configure o Aplicativo

1.  No código do seu aplicativo, encontre o arquivo `config.ts`.
2.  Dentro deste arquivo, você verá uma linha como esta:
    ```typescript
    export const SCRIPT_URL = 'COLE_A_URL_DO_SEU_APP_DA_WEB_AQUI';
    ```
3.  Substitua a string `'COLE_A_URL_DO_SEU_APP_DA_WEB_AQUI'` pela URL que você copiou no passo anterior.
4.  **Salve o arquivo.**

Pronto! Atualize a página do seu aplicativo. Agora, ele está conectado à Planilha Google. Todas as ocorrências adicionadas ou removidas serão sincronizadas automaticamente.
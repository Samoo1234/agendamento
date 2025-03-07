# Servidor Local para Teste de Integração WhatsApp + OpenAI

Este servidor local permite testar a integração entre o WhatsApp e a OpenAI sem depender do Firebase Functions.

## Configuração

1. Instale as dependências:
   ```
   npm install
   ```

2. Crie um arquivo `.env` com as seguintes variáveis:
   ```
   PORT=3000
   VERIFY_TOKEN=oticadavi2024
   WHATSAPP_TOKEN=seu_token_do_whatsapp
   WHATSAPP_PHONE_ID=seu_phone_id
   OPENAI_API_KEY=sua_chave_da_openai
   ```

3. Inicie o servidor:
   ```
   npm start
   ```

4. Use o Ngrok para expor seu servidor local à internet:
   ```
   ngrok http 3000
   ```

5. Configure o webhook do WhatsApp para apontar para a URL do Ngrok:
   - URL: `https://seu-dominio-ngrok.ngrok.io/webhook`
   - Token de verificação: `oticadavi2024` (ou o que você definiu no .env)

## Como funciona

1. O servidor recebe webhooks do WhatsApp na rota `/webhook`.
2. Quando uma mensagem é recebida, o servidor chama diretamente a API da OpenAI.
3. A resposta da OpenAI é enviada de volta para o usuário via WhatsApp.

## Vantagens

- Não depende do Firebase Functions
- Permite depuração local em tempo real
- Contorna possíveis restrições de firewall ou configuração do Firebase

## Instalação do Ngrok

1. Baixe o Ngrok em [https://ngrok.com/download](https://ngrok.com/download)
2. Descompacte o arquivo baixado
3. Abra um terminal e navegue até a pasta onde o Ngrok foi descompactado
4. Execute o comando `ngrok http 3000`
5. Copie a URL HTTPS fornecida pelo Ngrok (algo como `https://abcd1234.ngrok.io`)
6. Use esta URL para configurar o webhook do WhatsApp

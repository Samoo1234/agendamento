# Servidor de Webhook Python para WhatsApp + OpenAI

Este script implementa um servidor Flask que:
1. Recebe webhooks do WhatsApp/Meta
2. Processa mensagens com a OpenAI
3. Envia respostas de volta para o cliente via WhatsApp

## Requisitos

- Python 3.7+
- Flask
- Requests
- Ngrok (para expor o servidor local à internet)

## Instalação

1. Instale as dependências:
   ```
   pip install -r requirements_webhook.txt
   ```

2. Instale o Ngrok (se ainda não tiver): https://ngrok.com/download

## Uso

1. Inicie o servidor Flask:
   ```
   python webhook_server_python.py
   ```

2. Em outro terminal, inicie o Ngrok para expor o servidor:
   ```
   ngrok http 3000
   ```

3. Copie a URL HTTPS fornecida pelo Ngrok (ex: https://abcd1234.ngrok.io)

4. Configure o webhook no painel do desenvolvedor do Meta:
   - URL do Webhook: URL do Ngrok
   - Token de Verificação: 8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821
   - Eventos: messages, message_deliveries

5. Ou use o script de configuração de webhook:
   ```
   node configurar-webhook.js
   ```
   (Atualize a URL no script para a URL do Ngrok)

## Como funciona

1. O servidor recebe notificações do WhatsApp quando uma mensagem é enviada
2. Extrai o número do telefone e o texto da mensagem
3. Envia o texto para a OpenAI para processamento
4. Recebe a resposta da OpenAI
5. Envia a resposta de volta para o cliente via WhatsApp

## Logs

Os logs são salvos em `webhook_server.log` e também exibidos no console.

## Rotas

- `/` (GET): Verificação do webhook
- `/` (POST): Recebimento de mensagens
- `/status` (GET): Verificação do status do servidor

## Integração com sistema de agendamento

Para integrar com o sistema de agendamento, você pode:

1. Adicionar lógica específica na função `chamar_openai` para detectar intenções de agendamento
2. Implementar uma função para consultar e atualizar o banco de dados do sistema de agendamento
3. Modificar as respostas para incluir informações específicas de agendamento

## Segurança

- Tokens e chaves de API estão hardcoded no script para facilitar o desenvolvimento
- Em produção, use variáveis de ambiente ou um arquivo de configuração seguro
- Considere adicionar autenticação para a rota `/status`

## Suporte

Para suporte, entre em contato com Samoel Duarte.

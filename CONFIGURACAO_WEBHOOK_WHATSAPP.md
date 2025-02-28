# Configuração do Webhook do WhatsApp para Confirmação de Agendamentos

Este documento descreve como configurar o webhook do WhatsApp Business API para receber e processar respostas de confirmação de agendamentos.

## Pré-requisitos

1. Conta no WhatsApp Business API
2. Aplicativo configurado no Facebook Developer Portal
3. Número de telefone verificado
4. Cloud Functions implantadas no Firebase
5. Template "confirmacao_agendamento" já configurado no WhatsApp Business

## Passo a Passo

### 1. Implantar as Cloud Functions

Primeiro, você precisa implantar as Cloud Functions no Firebase:

```bash
cd functions
npm install
firebase deploy --only functions
```

### 2. Configurar o Webhook no Facebook Developer Portal

1. Acesse o [Facebook Developer Portal](https://developers.facebook.com/)
2. Selecione seu aplicativo
3. Vá para "WhatsApp" > "Configuração"
4. Na seção "Webhooks", clique em "Editar"
5. Configure o webhook com as seguintes informações:
   - **URL do Callback**: `https://us-central1-[SEU-PROJETO].cloudfunctions.net/processWhatsAppWebhook`
   - **Token de Verificação**: `token_secreto_para_verificacao` (ou o token que você definiu)
   - **Campos para Inscrição**: Selecione `messages`

### 3. Verificar o Template de Mensagem

O sistema está configurado para usar o template "confirmacao_agendamento" que já existe na sua conta. Certifique-se de que:

1. O template está aprovado e ativo
2. O template aceita 4 parâmetros na seguinte ordem:
   - Nome do cliente
   - Data do agendamento (formato DD/MM/YYYY)
   - Horário do agendamento
   - Cidade do agendamento
3. O template instrui o cliente a responder com "Sim" para confirmar ou "Não" para cancelar

### 4. Configurar Variáveis de Ambiente

Para maior segurança, configure as variáveis de ambiente no Firebase:

```bash
firebase functions:config:set whatsapp.token="SEU_TOKEN" whatsapp.phone_id="SEU_PHONE_ID" whatsapp.verify_token="SEU_TOKEN_SECRETO"
```

### 5. Testar o Sistema

Execute o script de teste para criar agendamentos de teste:

```bash
node testar-confirmacao.js
```

## Fluxo de Funcionamento

1. A Cloud Function `sendConfirmationRequests` é executada diariamente às 10:00
2. Ela busca todos os agendamentos para o dia seguinte com status "pendente"
3. Envia mensagens usando o template "confirmacao_agendamento" solicitando confirmação
4. Quando o cliente responde com "Sim" ou "Não", o webhook `processWhatsAppWebhook` recebe a resposta
5. O status do agendamento é atualizado para "confirmado" ou "cancelado"
6. Uma mensagem de confirmação é enviada ao cliente

## Processamento de Respostas

O sistema está configurado para entender várias formas de resposta:

- **Confirmação**: "sim", "confirmo", "confirmar"
- **Cancelamento**: "não", "cancelo", "cancelar"

Se o cliente enviar uma resposta que não seja reconhecida, o sistema enviará uma mensagem pedindo para responder com "Sim" ou "Não".

## Solução de Problemas

### Webhook não está recebendo mensagens

1. Verifique se a URL do webhook está correta
2. Confirme que o token de verificação está correto
3. Verifique os logs da Cloud Function para identificar erros

### Mensagens não estão sendo enviadas

1. Verifique se o token de acesso está válido
2. Confirme que o template está aprovado e ativo
3. Verifique os logs da Cloud Function para identificar erros

### Status não está sendo atualizado

1. Verifique se o número de telefone está no formato correto no Firestore
2. Confirme que existem agendamentos com status "pendente"
3. Verifique os logs da Cloud Function para identificar erros

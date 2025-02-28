# Configuração do Webhook do WhatsApp para Confirmação de Agendamentos

Este documento descreve como configurar o webhook do WhatsApp Business API para receber e processar respostas de confirmação de agendamentos.

## Pré-requisitos

1. Conta no WhatsApp Business API
2. Aplicativo configurado no Facebook Developer Portal
3. Número de telefone verificado
4. Cloud Functions implantadas no Firebase

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

### 3. Criar Template de Mensagem Interativa

1. Acesse o [WhatsApp Business Platform](https://business.facebook.com/wa/manage/message-templates/)
2. Clique em "Criar Template"
3. Selecione a categoria "Utilitário"
4. Configure o template com botões interativos:
   - **Nome do Template**: `template_confirmacao`
   - **Idioma**: Português (Brasil)
   - **Corpo da Mensagem**: 
     ```
     Olá {{1}}! Você tem um agendamento amanhã ({{2}}) às {{3}} em {{4}}. Por favor, confirme sua presença.
     ```
   - **Botões**: Adicione dois botões de resposta rápida:
     - Botão 1: "Confirmar"
     - Botão 2: "Cancelar"
5. Envie para aprovação

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
3. Envia mensagens interativas solicitando confirmação
4. Quando o cliente responde, o webhook `processWhatsAppWebhook` recebe a resposta
5. O status do agendamento é atualizado para "confirmado" ou "cancelado"
6. Uma mensagem de confirmação é enviada ao cliente

## Solução de Problemas

### Webhook não está recebendo mensagens

1. Verifique se a URL do webhook está correta
2. Confirme que o token de verificação está correto
3. Verifique os logs da Cloud Function para identificar erros

### Mensagens não estão sendo enviadas

1. Verifique se o token de acesso está válido
2. Confirme que o template foi aprovado
3. Verifique os logs da Cloud Function para identificar erros

### Status não está sendo atualizado

1. Verifique se o ID do agendamento está sendo extraído corretamente
2. Confirme que o documento existe no Firestore
3. Verifique os logs da Cloud Function para identificar erros

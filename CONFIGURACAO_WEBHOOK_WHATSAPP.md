# Configuração do Webhook do WhatsApp para Confirmação de Agendamentos

Este documento descreve como configurar o webhook do WhatsApp Business API para receber e processar respostas de confirmação de agendamentos.

## Situação Atual

✅ As funções do webhook foram implantadas com sucesso no Firebase e estão acessíveis via URL:
- `whatsAppWebhook`: https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook

O próximo passo é configurar o webhook no Facebook Developer Portal.

## Próximos Passos

### 1. Configurar o Webhook no Facebook Developer Portal

Agora que as funções foram implantadas, você pode configurar o webhook no Facebook Developer Portal:

1. Acesse o [Facebook Developer Portal](https://developers.facebook.com/)
2. Faça login com suas credenciais
3. Selecione seu aplicativo "agendamento" (ID: 602469032585407)
4. No menu lateral, clique em "Webhooks"
5. Clique em "Configurar Webhook"
6. Configure o webhook com as seguintes informações:
   - **URL do Callback**: `https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook`
   - **Token de Verificação**: `oticadavi2024`
   - **Campos para Inscrição**: Selecione `messages` em "WhatsApp Business Account"
7. Clique em "Verificar e Salvar"

### 2. Inscrever o Aplicativo na Conta do WhatsApp Business

Após configurar o webhook, você precisa inscrever o aplicativo na conta do WhatsApp Business:

1. No Facebook Developer Portal, vá para a página do seu aplicativo
2. No menu lateral, clique em "WhatsApp" > "Configuração"
3. Na seção "Webhooks", clique em "Inscrever-se"
4. Selecione sua conta do WhatsApp Business (ID: 2887557674896481)
5. Selecione o campo `messages`
6. Clique em "Inscrever-se"

## Informações Importantes

- **ID do Aplicativo**: 602469032585407
- **ID da Conta do WhatsApp Business**: 2887557674896481
- **ID do Número de Telefone**: 576714648854724
- **Token de Verificação do Webhook**: `oticadavi2024`
- **Versão da API**: v21.0

## Solução de Problemas

Se você estiver enfrentando problemas com o webhook ou com o processamento de mensagens, siga estas etapas:

1. **Verifique se o webhook está configurado corretamente**:
   - Confirme se a URL do webhook está correta: `https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook`
   - Confirme se o token de verificação está correto: `oticadavi2024`
   - Verifique se você está inscrito no campo `messages`

2. **Verifique os logs do Firebase**:
   - Acesse o [Console do Firebase](https://console.firebase.google.com/)
   - Vá para o projeto "oticadavi-113e0"
   - Clique em "Functions" no menu lateral
   - Clique em "Logs" para visualizar os logs da função `whatsAppWebhook`

3. **Teste o envio direto de mensagens**:
   - Execute o script `test-envio-direto.js` para testar o envio direto de mensagens
   - Execute o script `test-ia-direta.js` para testar o processamento de IA
   - Execute o script `test-webhook-detalhado.js` para testar o webhook completo

4. **Verifique o modelo da OpenAI**:
   - O sistema está configurado para usar o modelo `gpt-3.5-turbo` da OpenAI
   - Você pode verificar os modelos disponíveis executando o script `test-openai-models.js`

## Observações

- O sistema está configurado para responder automaticamente a mensagens de texto com respostas geradas pela IA
- O sistema também processa respostas de confirmação e cancelamento de agendamentos
- As respostas de confirmação e cancelamento são processadas apenas para agendamentos com status "pendente"

## Como Testar

Para testar o sistema completo:

1. Envie uma mensagem para o número do WhatsApp da Ótica Davi: +55 66 9692-5828
2. Aguarde a resposta automática gerada pela IA
3. Verifique os logs do Firebase para confirmar que a mensagem foi processada corretamente

Se você quiser testar apenas o envio de mensagens, execute o script `test-envio-direto.js`:

```bash
cd functions
node test-envio-direto.js
```

Se você quiser testar apenas o processamento de IA, execute o script `test-ia-direta.js`:

```bash
cd functions
node test-ia-direta.js
```

Se você quiser testar o webhook completo, execute o script `test-webhook-detalhado.js`:

```bash
cd functions
node test-webhook-detalhado.js

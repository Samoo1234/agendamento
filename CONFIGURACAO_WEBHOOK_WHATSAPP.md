# Configuração do Webhook do WhatsApp para Confirmação de Agendamentos

Este documento descreve como configurar o webhook do WhatsApp Business API para receber e processar respostas de confirmação de agendamentos.

## Situação Atual

✅ As funções do webhook foram implantadas com sucesso no Firebase e estão acessíveis via URL:
- `whatsappWebhookHandler`: https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsappWebhookHandler
- `whatsAppWebhook`: https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook
- `testeWebhook`: https://us-central1-oticadavi-113e0.cloudfunctions.net/testeWebhook

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
   - **Token de Verificação**: `8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821`
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
- **Token de Verificação do Webhook**: 8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821
- **Versão da API**: v22.0

## Observações

- O template "template_agendamento" está funcionando corretamente e não deve ser modificado.
- O template "confirmacao_agendamento" está configurado para enviar mensagens interativas de confirmação com botões "Sim" e "Não".
- O template "confirmacao_agendamento" requer 4 parâmetros: nome, data, horário e cidade.
- A configuração do webhook é necessária para receber respostas dos clientes às mensagens de confirmação.

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

#### Configuração Manual (Recomendada)

1. Acesse o [Facebook Developer Portal](https://developers.facebook.com/)
2. Faça login com suas credenciais
3. Selecione seu aplicativo "agendamento" (ID: 602469032585407)
4. No menu lateral, clique em "Webhooks"
5. Clique em "Configurar Webhook"
6. Configure o webhook com as seguintes informações:
   - **URL do Callback**: `https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsappWebhookHandler`
   - **Token de Verificação**: `8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821`
   - **Campos para Inscrição**: Selecione `messages` em "WhatsApp Business Account"
7. Clique em "Verificar e Salvar"

#### Verificar a Configuração do Webhook

Após configurar o webhook, você pode verificar se ele está funcionando corretamente:

1. Acesse a página do seu aplicativo no [Facebook Developer Portal](https://developers.facebook.com/)
2. No menu lateral, clique em "Webhooks"
3. Verifique se o webhook está listado e se o status está "Ativo"

### 3. Testar o Webhook

Para testar se o webhook está funcionando corretamente, você pode usar o seguinte script:

```javascript
// testar-webhook.js
const axios = require('axios');

// Configurações
const webhookUrl = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsappWebhookHandler';
const verifyToken = '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';

// Função para testar a verificação do webhook
async function testarVerificacaoWebhook() {
  try {
    console.log('Testando verificação do webhook...');
    
    // Simulando a requisição de verificação do WhatsApp
    const params = {
      'hub.mode': 'subscribe',
      'hub.verify_token': verifyToken,
      'hub.challenge': '123456789'
    };
    
    const url = `${webhookUrl}?hub.mode=${params['hub.mode']}&hub.verify_token=${params['hub.verify_token']}&hub.challenge=${params['hub.challenge']}`;
    
    console.log('URL:', url);
    
    const response = await axios.get(url);
    
    console.log('Resposta:');
    console.log('Status:', response.status);
    console.log('Dados:', response.data);
    
    if (response.status === 200 && response.data === params['hub.challenge']) {
      console.log('✅ Verificação do webhook bem-sucedida!');
    } else {
      console.log('❌ Falha na verificação do webhook');
    }
  } catch (error) {
    console.error('❌ Erro ao testar verificação do webhook:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

// Executar
testarVerificacaoWebhook();
```

Execute o script com o comando:

```bash
node testar-webhook.js
```

### 2.1 Configuração Alternativa via API (se necessário)

Se a configuração pelo painel não funcionar, você pode configurar o webhook diretamente via API:

#### Passo 1: Obter um token de acesso de aplicativo

Para obter um token de acesso de aplicativo, você precisa do ID do aplicativo e do segredo do aplicativo:

```bash
curl -X GET \
  "https://graph.facebook.com/oauth/access_token?client_id=602469032585407&client_secret=7fe868b23b66a2957eddc89212d1970a&grant_type=client_credentials"
```

Resposta:
```json
{
  "access_token": "602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c",
  "token_type": "bearer"
}
```

#### Passo 2: Configurar o webhook usando o token de acesso de aplicativo

```bash
curl -X POST \
  "https://graph.facebook.com/v22.0/602469032585407/subscriptions" \
  -H "Authorization: Bearer 602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c" \
  -H "Content-Type: application/json" \
  -d '{
    "object": "whatsapp_business_account",
    "callback_url": "https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsappWebhookHandler",
    "verify_token": "8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821",
    "fields": ["messages"]
  }'
```

### 3. Subscrever o Aplicativo à Conta do WhatsApp Business

Após configurar o webhook, você precisa subscrever seu aplicativo à conta do WhatsApp Business. Isso pode ser feito via API:

```bash
curl -X POST \
  "https://graph.facebook.com/v22.0/2887557674896481/subscribed_apps" \
  -H "Authorization: Bearer 602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c" \
  -H "Content-Type: application/json"
```

Ou você pode executar o script `configurar-webhook.js` que criamos:

```bash
node configurar-webhook.js
```

### 4. Verificar o Template de Mensagem

O sistema está configurado para usar o template "confirmacao_agendamento" que já existe na sua conta. Certifique-se de que:

1. O template está aprovado e ativo
2. O template aceita 4 parâmetros na seguinte ordem:
   - Nome do cliente
   - Data do agendamento (formato DD/MM/YYYY)
   - Horário do agendamento
   - Cidade do agendamento
3. O template inclui botões interativos "Sim" e "Não" para facilitar a resposta do cliente

O sistema está preparado para processar tanto as respostas dos botões interativos quanto respostas de texto livre.

### 5. Configurar Variáveis de Ambiente

Para maior segurança, configure as variáveis de ambiente no Firebase:

```bash
firebase functions:config:set whatsapp.token="602469032585407|sqs86QHDixBjn5BhxN-Wo3iyd8c" whatsapp.phone_id="2887557674896481" whatsapp.verify_token="8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821"
```

### 6. Testar o Sistema

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

O sistema está configurado para processar dois tipos de respostas:

### Respostas de Botões Interativos
O sistema detecta quando o cliente clica nos botões "Sim" ou "Não" do template e processa a resposta adequadamente.

### Respostas de Texto Livre
Além dos botões, o sistema também entende respostas de texto com as seguintes variações:

- **Confirmação**: "sim", "confirmo", "confirmar"
- **Cancelamento**: "não", "nao", "cancelo", "cancelar"

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

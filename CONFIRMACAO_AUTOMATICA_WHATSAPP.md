# Confirmação Automática de Agendamentos via WhatsApp

Este documento descreve a implementação da funcionalidade de confirmação automática de agendamentos via WhatsApp, onde o cliente pode confirmar ou cancelar seu agendamento respondendo a uma mensagem interativa.

## Funcionalidades Implementadas

✅ **Confirmação Automática**: Quando o cliente responde "Sim" à mensagem de confirmação, o status do agendamento é alterado automaticamente de "pendente" para "confirmado" no banco de dados.

✅ **Exclusão Automática**: Quando o cliente responde "Não" à mensagem de confirmação, o agendamento é excluído automaticamente do banco de dados (com registro em histórico).

✅ **Permanência do Status Pendente**: Se o cliente não responder à mensagem, o status permanece como "pendente", permitindo confirmação manual posterior.

## Como Funciona

1. **Envio de Mensagens**: 24 horas antes da consulta, o sistema envia automaticamente uma mensagem de WhatsApp ao cliente com botões "Sim" e "Não".

2. **Processamento de Respostas**:
   - Se o cliente clicar em "Sim", o status é alterado para "confirmado" no banco de dados
   - Se o cliente clicar em "Não", o agendamento é excluído do banco de dados
   - Se o cliente não responder, o status permanece como "pendente"

3. **Feedback ao Cliente**:
   - Após confirmar, o cliente recebe uma mensagem de agradecimento
   - Após cancelar, o cliente recebe uma mensagem informando sobre o cancelamento

## Configuração Técnica

### 1. Cloud Functions Implementadas

Foi modificada a função existente para implementar a funcionalidade de exclusão automática:

- `processWhatsAppWebhook`: Webhook para processar as respostas dos clientes (modificada para excluir agendamentos quando o cliente responde "Não")
- `sendConfirmationRequests`: Função agendada para enviar mensagens de confirmação 24h antes (já existente)

### 2. Implantação das Alterações

Para implantar as alterações feitas, execute os seguintes comandos:

```bash
cd functions
npm install
firebase deploy --only functions
```

Isso implantará as modificações no sistema de confirmação de agendamentos.

### 3. Verificação do Webhook

O webhook já está configurado corretamente no Facebook Developer Portal com as seguintes informações:
- **URL do Callback**: `https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook`
- **Token de Verificação**: `8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821`
- **Campos para Inscrição**: `messages` em "WhatsApp Business Account"

Não é necessário fazer nenhuma alteração na configuração do webhook.

## Teste da Funcionalidade

Para testar a funcionalidade, você pode:

1. **Enviar uma mensagem de confirmação manual**:

```javascript
// Exemplo de código para enviar uma mensagem de confirmação manual
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

async function enviarConfirmacaoManual(agendamentoId) {
  try {
    // Busca o agendamento
    const agendamentoRef = admin.firestore().collection('agendamentos').doc(agendamentoId);
    const agendamentoDoc = await agendamentoRef.get();
    
    if (!agendamentoDoc.exists) {
      console.error('Agendamento não encontrado');
      return;
    }
    
    const agendamento = agendamentoDoc.data();
    
    // Chama a função de envio de confirmação
    const sendConfirmation = functions.httpsCallable('sendWhatsAppConfirmationRequests');
    const result = await sendConfirmation({
      telefone: agendamento.telefone,
      nome: agendamento.nome,
      data: agendamento.data,
      horario: agendamento.horario,
      cidade: agendamento.cidade
    });
    
    console.log('Resultado:', result);
  } catch (error) {
    console.error('Erro:', error);
  }
}

// Substitua pelo ID de um agendamento real
enviarConfirmacaoManual('ID_DO_AGENDAMENTO');
```

2. **Simular uma resposta do cliente**:

Para simular uma resposta do cliente, você pode usar o seguinte script:

```javascript
// testar-resposta-webhook.js
const axios = require('axios');

async function simularRespostaCliente() {
  try {
    // URL do webhook
    const webhookUrl = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/processWhatsAppConfirmation';
    
    // Simula uma resposta de confirmação (botão "Sim")
    const payload = {
      "object": "whatsapp_business_account",
      "entry": [
        {
          "id": "2887557674896481",
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {
                  "display_phone_number": "5511999999999",
                  "phone_number_id": "576714648854724"
                },
                "contacts": [
                  {
                    "profile": {
                      "name": "Cliente Teste"
                    },
                    "wa_id": "5511999999999" // Substitua pelo número do cliente
                  }
                ],
                "messages": [
                  {
                    "from": "5511999999999", // Substitua pelo número do cliente
                    "id": "wamid.abcdefghijklmnopqrstuvwxyz",
                    "timestamp": "1677721357",
                    "type": "interactive",
                    "interactive": {
                      "type": "button_reply",
                      "button_reply": {
                        "id": "sim",
                        "title": "Sim"
                      }
                    }
                  }
                ]
              },
              "field": "messages"
            }
          ]
        }
      ]
    };
    
    // Envia a requisição
    const response = await axios.post(webhookUrl, payload);
    
    console.log('Status:', response.status);
    console.log('Resposta:', response.data);
  } catch (error) {
    console.error('Erro:', error);
  }
}

simularRespostaCliente();
```

## Atendimento por IA

Além do sistema de confirmação, agora também implementamos um atendimento automatizado por IA que é ativado quando o cliente envia qualquer mensagem que não seja uma resposta de confirmação.

### Fluxo de Funcionamento

1. Cliente envia uma mensagem para o número do WhatsApp (que não seja "Sim" ou "Não")
2. Sistema identifica que não é uma resposta de confirmação
3. Sistema processa a mensagem usando o modelo GPT-4o mini da OpenAI
4. Sistema envia uma resposta contextualizada gerada pela IA

### Recursos do Atendimento por IA

- **Contextualização**: A IA tem acesso a informações básicas do cliente e seus agendamentos ativos
- **Histórico de Conversa**: O sistema mantém o histórico da conversa para fornecer respostas contextualizadas
- **Monitoramento de Custos**: Cada interação é registrada para monitoramento de custos e uso

### Configuração

Para configurar o atendimento por IA, consulte o documento [ATENDIMENTO_IA_WHATSAPP.md](./ATENDIMENTO_IA_WHATSAPP.md).

## Observações Importantes

1. **Segurança**: O token de verificação do webhook é sensível e não deve ser compartilhado.

2. **Histórico de Cancelamentos**: Quando um agendamento é cancelado via WhatsApp, ele é excluído da coleção principal, mas um registro é mantido na coleção `agendamentos_cancelados` para histórico.

3. **Compatibilidade**: Esta implementação é compatível com o sistema existente e não afeta as funcionalidades já implementadas.

4. **Mensagens de Texto**: Além dos botões interativos, o sistema também reconhece respostas de texto como "sim", "confirmo", "não", "cancelar", etc.

## Próximos Passos

- Implementar relatórios de confirmações e cancelamentos
- Adicionar notificações para a equipe quando um agendamento é cancelado
- Melhorar a interface do usuário para exibir estatísticas de confirmação/cancelamento

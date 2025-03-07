# Atendimento por IA via WhatsApp

Este documento descreve a implementação do atendimento automatizado por IA via WhatsApp, utilizando o modelo GPT-4o mini da OpenAI.

## Visão Geral

O sistema de atendimento por IA foi integrado ao fluxo existente de confirmação de agendamentos, permitindo que os clientes possam:

1. Receber notificações de agendamento
2. Confirmar ou cancelar agendamentos via WhatsApp
3. Fazer perguntas gerais e receber respostas automáticas geradas por IA

## Fluxo de Funcionamento

1. **Agendamento**: Cliente agenda uma consulta e recebe notificação via WhatsApp
2. **Confirmação**: 24h antes da consulta, cliente recebe mensagem para confirmar
   - Se responde "Sim": Status muda para "confirmado"
   - Se responde "Não": Status muda para "cancelado"
3. **Atendimento por IA**: Se o cliente envia qualquer outra mensagem, o sistema:
   - Identifica que não é uma resposta de confirmação
   - Processa a mensagem usando o modelo GPT-4o mini
   - Envia uma resposta contextualizada

## Configuração

### 1. Configurar a Chave da API OpenAI

Existem duas formas de configurar a chave da API:

#### Opção 1: Usando arquivo .env (desenvolvimento local)

1. Crie um arquivo `.env` na pasta `functions/` baseado no exemplo `.env.example`
2. Adicione sua chave da API OpenAI:
   ```
   OPENAI_API_KEY=sk-sua-chave-aqui
   ```

#### Opção 2: Usando configurações do Firebase (produção)

1. Configure a chave como variável de ambiente no Firebase:
   ```bash
   firebase functions:config:set openai.apikey="sk-sua-chave-aqui"
   ```

2. Para usar localmente, gere um arquivo `.runtimeconfig.json`:
   ```bash
   firebase functions:config:get > .runtimeconfig.json
   ```

### 2. Implantação

Para implantar as alterações:

```bash
cd functions
npm install
firebase deploy --only functions
```

## Monitoramento e Custos

O sistema inclui monitoramento automático de custos:

1. Cada interação com a API é registrada na coleção `metricas_ia` no Firestore
2. O sistema alerta quando o custo diário ultrapassa $5 USD
3. Você pode visualizar o uso e custos no Firebase Console

## Personalização

Para personalizar o comportamento da IA:

1. Edite o arquivo `functions/src/openaiService.js`
2. Modifique a função `criarPromptParaIA()` para incluir informações específicas
3. Ajuste os parâmetros como `MAX_TOKENS` e `TEMPERATURE` conforme necessário

## Limitações

- O modelo GPT-4o mini tem um limite de contexto
- As respostas podem levar alguns segundos para serem processadas
- A IA não tem acesso a informações em tempo real (apenas o que está no prompt)

## Testando o Sistema

Para testar o sistema de atendimento por IA, siga estas etapas:

### 1. Enviar uma mensagem para o WhatsApp da Ótica Davi

Envie qualquer mensagem (que não seja "sim" ou "não") para o número do WhatsApp da Ótica Davi: +55 66 9258-2862.

Exemplos de mensagens para teste:
- "Qual o horário de funcionamento da ótica?"
- "Vocês têm lentes de contato?"
- "Como faço para agendar um exame de vista?"

### 2. Verificar a resposta

O sistema deve processar sua mensagem e responder automaticamente com uma resposta gerada pela IA. A resposta deve ser contextualizada e relevante para sua pergunta.

### 3. Solução de problemas

Se você não receber uma resposta:

1. **Verifique o formato do número**: Certifique-se de que o número está salvo com o código do país (+55 para Brasil)
2. **Verifique os logs**: Acesse o console do Firebase para verificar se há erros nos logs
3. **Teste o webhook**: Use o script `test-webhook-completo.js` para simular uma mensagem
4. **Teste o envio direto**: Use o script `test-envio-direto.js` para testar o envio de mensagens

## Próximos Passos Sugeridos

1. Criar um painel de administração para monitorar conversas
2. Implementar feedback dos clientes sobre as respostas da IA
3. Treinar a IA com perguntas frequentes específicas da ótica
4. Adicionar suporte para envio de imagens e outros tipos de mídia

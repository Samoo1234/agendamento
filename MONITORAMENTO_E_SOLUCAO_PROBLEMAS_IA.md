# Monitoramento e Solução de Problemas - IA no WhatsApp

Este documento fornece instruções detalhadas para monitorar e solucionar problemas com a integração de IA no WhatsApp.

## Monitoramento

### 1. Logs do Firebase Functions

Os logs são a principal fonte de informações para diagnosticar problemas:

1. Acesse o [Console do Firebase](https://console.firebase.google.com/)
2. Selecione o projeto `oticadavi-113e0`
3. No menu lateral, clique em "Functions"
4. Clique na aba "Logs"
5. Filtre por função: `whatsAppWebhook`

Procure por mensagens de erro como:
- "Erro ao chamar API OpenAI"
- "Erro ao processar mensagem com IA"
- "Erro ao enviar mensagem"

### 2. Monitoramento de Erros

Use o script `monitor-erros-ia.js` para verificar erros registrados no Firestore:

```bash
node monitor-erros-ia.js
```

Este script mostra:
- Erros das últimas 24 horas
- Detalhes sobre cada erro (telefone, mensagem, erro)
- Recomendações para solução

### 3. Teste de Modelos

Use o script `test-modelos-comparacao.js` para verificar qual modelo da OpenAI está funcionando melhor:

```bash
node test-modelos-comparacao.js
```

## Solução de Problemas Comuns

### 1. Mensagem "Estamos enfrentando problemas técnicos no momento"

Esta é a mensagem de erro padrão enviada aos usuários quando há problemas com a IA.

**Possíveis causas e soluções:**

#### a) Problemas com a API da OpenAI

**Sintomas:**
- Logs mostram erros como "429 Too Many Requests" ou "401 Unauthorized"

**Soluções:**
- Verifique se a chave da API está correta
- Verifique se a conta tem créditos suficientes
- Reduza a frequência de chamadas à API

```bash
# Testar a API da OpenAI diretamente
node test-openai-service.js
```

#### b) Problemas com o modelo selecionado

**Sintomas:**
- Logs mostram erro "404 Not Found" para o modelo

**Soluções:**
- Altere o modelo no arquivo `openaiService.js`
- Teste diferentes modelos com o script de comparação

```bash
# Testar diferentes modelos
node test-modelos-comparacao.js
```

#### c) Problemas de timeout

**Sintomas:**
- Logs mostram "Sem resposta do servidor OpenAI (timeout possível)"

**Soluções:**
- Aumente o valor de timeout nas chamadas axios
- Verifique a conexão de internet do servidor
- Use um modelo mais rápido (como gpt-3.5-turbo)

### 2. Webhook não recebe mensagens

**Possíveis causas e soluções:**

#### a) Configuração incorreta no painel do WhatsApp

**Soluções:**
- Verifique se a URL do webhook está correta
- Verifique se o token de verificação está correto (`oticadavi2024`)
- Verifique se os campos de notificação estão selecionados

#### b) Problemas com a função do Firebase

**Soluções:**
- Verifique se a função está implantada e ativa
- Reimplante a função com `firebase deploy --only functions:whatsAppWebhook`

### 3. Mensagens enviadas mas sem resposta

**Possíveis causas e soluções:**

#### a) Problemas com o envio de mensagens

**Soluções:**
- Verifique se o token do WhatsApp está correto
- Verifique se o ID do telefone está correto
- Teste o envio direto com o script:

```bash
node test-envio-direto.js
```

#### b) Problemas com o processamento de mensagens

**Soluções:**
- Verifique os logs para erros no processamento
- Teste o processamento direto com o script:

```bash
node test-ia-direta.js
```

## Scripts de Teste Disponíveis

| Script | Função |
|--------|--------|
| `test-webhook-detalhado.js` | Simula uma mensagem recebida pelo webhook |
| `test-envio-direto.js` | Testa o envio direto de mensagem para um número |
| `test-ia-direta.js` | Testa o processamento de IA diretamente |
| `test-openai-service.js` | Testa a conexão com a API da OpenAI |
| `test-modelos-comparacao.js` | Compara diferentes modelos da OpenAI |
| `monitor-erros-ia.js` | Monitora erros registrados no Firestore |

## Alteração do Modelo da OpenAI

Se precisar alterar o modelo usado pela IA:

1. Edite o arquivo `src/openaiService.js`
2. Altere a constante `OPENAI_MODEL` para um dos seguintes valores:
   - `gpt-4o-mini` (recomendado - mais rápido)
   - `gpt-3.5-turbo` (alternativa estável)
   - `gpt-4` (mais avançado, mas mais lento e caro)
3. Reimplante a função:

```bash
firebase deploy --only functions:whatsAppWebhook
```

## Contato para Suporte

Se os problemas persistirem após tentar as soluções acima, entre em contato com o desenvolvedor responsável.

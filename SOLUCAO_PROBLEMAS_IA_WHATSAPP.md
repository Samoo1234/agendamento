# Solução de Problemas do Agente de IA no WhatsApp

Este documento contém instruções para solucionar problemas comuns com o agente de IA integrado ao WhatsApp.

## Diagnóstico Realizado

Em 01/03/2025, foi realizado um diagnóstico completo do sistema de IA integrado ao WhatsApp. Os seguintes componentes foram verificados:

1. **API da OpenAI**: Funcionando corretamente
2. **Arquivo openaiService.js**: Configurado corretamente
3. **Arquivo confirmationSystem.js**: Configurado corretamente
4. **Configurações do Firebase**: Atualizadas com sucesso
5. **Webhook**: Funcionando corretamente

## Problemas Comuns e Soluções

### 1. Agente de IA não responde às mensagens

**Possíveis causas:**
- Chave da API da OpenAI inválida ou expirada
- Webhook não configurado corretamente
- Problemas com o processamento da mensagem

**Soluções:**
1. Verifique se a chave da API da OpenAI está válida executando:
   ```
   node test-openai-direto.js
   ```

2. Verifique se o webhook está configurado corretamente:
   - Acesse o [Facebook Developer Portal](https://developers.facebook.com/)
   - Verifique se o webhook está apontando para: `https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook`
   - Verifique se o token de verificação está definido como: `oticadavi2024`

3. Verifique os logs do Firebase para identificar erros:
   ```
   node monitorar-logs.js
   ```

### 2. Respostas incorretas ou inadequadas

**Possíveis causas:**
- Prompt do sistema inadequado
- Modelo da OpenAI desatualizado
- Contexto da conversa não sendo mantido

**Soluções:**
1. Verifique e ajuste o prompt do sistema no arquivo `openaiService.js`
2. Atualize o modelo da OpenAI para a versão mais recente
3. Verifique se o histórico de conversas está sendo armazenado corretamente

### 3. Erros de conexão com a API da OpenAI

**Possíveis causas:**
- Problemas de rede
- Limite de requisições excedido
- Timeout nas requisições

**Soluções:**
1. Verifique a conexão com a internet
2. Verifique os limites da sua conta na OpenAI
3. Aumente o timeout das requisições no arquivo `openaiService.js`

## Scripts de Diagnóstico

Foram criados os seguintes scripts para ajudar no diagnóstico e solução de problemas:

1. **test-openai-direto.js**: Testa a API da OpenAI diretamente
2. **diagnosticar-corrigir-ia.js**: Verifica e corrige problemas com o agente de IA
3. **test-ia-whatsapp.js**: Testa o agente de IA via WhatsApp
4. **monitorar-logs.js**: Monitora os logs do Firebase Functions

## Configurações Atuais

### OpenAI
- **Modelo**: gpt-4o-mini
- **API Key**: Configurada nas variáveis de ambiente do Firebase

### WhatsApp
- **Token**: Configurado nas variáveis de ambiente do Firebase
- **Phone ID**: 576714648854724
- **Verify Token**: oticadavi2024

## Próximos Passos

Se os problemas persistirem após seguir as soluções acima:

1. **Reimplante as funções**:
   ```
   firebase deploy --only functions
   ```

2. **Verifique a cota do Firebase**:
   - Acesse o [Console do Firebase](https://console.firebase.google.com/)
   - Verifique se você não atingiu o limite de uso gratuito

3. **Contate o suporte**:
   - Se os problemas persistirem, entre em contato com o suporte técnico

## Manutenção Regular

Para garantir o funcionamento adequado do agente de IA, recomenda-se:

1. **Monitoramento regular dos logs**
2. **Testes periódicos da API da OpenAI**
3. **Atualização do modelo da OpenAI quando novas versões forem lançadas**
4. **Backup regular das configurações e do código**

---

Documento criado em: 01/03/2025  
Última atualização: 01/03/2025

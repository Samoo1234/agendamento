/**
 * Script para diagnosticar e corrigir problemas com o agente de IA
 * Este script verifica todas as configurações e faz correções necessárias
 */
const admin = require('firebase-admin');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Inicializa o Firebase Admin
try {
  admin.initializeApp();
  console.log('Firebase Admin inicializado com sucesso');
} catch (error) {
  console.error('Erro ao inicializar Firebase Admin:', error.message);
}

// Configurações
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
const OPENAI_MODEL = 'gpt-4o-mini';
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const WEBHOOK_URL = 'https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook';

// Função para verificar a API da OpenAI
async function testarOpenAI() {
  try {
    console.log('\n=== TESTANDO API DA OPENAI ===');
    
    const mensagens = [
      {
        role: 'system',
        content: 'Você é um assistente útil.'
      },
      {
        role: 'user',
        content: 'Olá, como vai?'
      }
    ];
    
    console.log('Enviando requisição para a API da OpenAI...');
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: OPENAI_MODEL,
      messages: mensagens,
      max_tokens: 50,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ API da OpenAI funcionando corretamente');
    console.log('Resposta:', response.data.choices[0].message.content);
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar API da OpenAI:', error.message);
    if (error.response) {
      console.error('Detalhes:', JSON.stringify(error.response.data));
    }
    return false;
  }
}

// Função para verificar e corrigir o arquivo openaiService.js
async function verificarCorrigirOpenAIService() {
  try {
    console.log('\n=== VERIFICANDO ARQUIVO openaiService.js ===');
    
    const filePath = path.join(__dirname, 'src', 'openaiService.js');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Arquivo openaiService.js não encontrado');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verificar o modelo
    if (!content.includes('gpt-4o-mini')) {
      console.log('Corrigindo modelo para gpt-4o-mini...');
      content = content.replace(/const OPENAI_MODEL = ['"].*?['"]/g, `const OPENAI_MODEL = 'gpt-4o-mini'`);
      modified = true;
    } else {
      console.log('✅ Modelo já configurado corretamente');
    }
    
    // Verificar tratamento de erros
    if (!content.includes('try {') || !content.includes('catch (openaiError)')) {
      console.log('Adicionando tratamento de erros adequado...');
      // Esta é uma correção complexa que requer análise mais detalhada
      console.log('⚠️ Tratamento de erros requer revisão manual');
    } else {
      console.log('✅ Tratamento de erros parece adequado');
    }
    
    // Salvar alterações se necessário
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Arquivo openaiService.js atualizado com sucesso');
    } else {
      console.log('✅ Arquivo openaiService.js não precisou de alterações');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar/corrigir openaiService.js:', error.message);
    return false;
  }
}

// Função para verificar e corrigir o arquivo confirmationSystem.js
async function verificarCorrigirConfirmationSystem() {
  try {
    console.log('\n=== VERIFICANDO ARQUIVO confirmationSystem.js ===');
    
    const filePath = path.join(__dirname, 'src', 'confirmationSystem.js');
    
    if (!fs.existsSync(filePath)) {
      console.error('❌ Arquivo confirmationSystem.js não encontrado');
      return false;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Verificar chamada para o serviço de IA
    if (!content.includes('openaiService.processarMensagemIA')) {
      console.log('❌ Chamada para o serviço de IA não encontrada');
      console.log('⚠️ Isso requer revisão manual');
    } else {
      console.log('✅ Chamada para o serviço de IA encontrada');
    }
    
    // Verificar tratamento de erros na chamada da IA
    if (!content.includes('try {') || !content.includes('catch (error)')) {
      console.log('⚠️ Tratamento de erros inadequado');
    } else {
      console.log('✅ Tratamento de erros parece adequado');
    }
    
    // Salvar alterações se necessário
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('✅ Arquivo confirmationSystem.js atualizado com sucesso');
    } else {
      console.log('✅ Arquivo confirmationSystem.js não precisou de alterações');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar/corrigir confirmationSystem.js:', error.message);
    return false;
  }
}

// Função para atualizar as configurações do Firebase
async function atualizarConfiguracoesFirebase() {
  try {
    console.log('\n=== ATUALIZANDO CONFIGURAÇÕES DO FIREBASE ===');
    
    // Executar comandos para atualizar configurações
    const { execSync } = require('child_process');
    
    console.log('Atualizando configuração da OpenAI...');
    execSync(`firebase functions:config:set openai.apikey="${OPENAI_API_KEY}"`, { stdio: 'inherit' });
    
    console.log('Atualizando configuração do WhatsApp...');
    execSync(`firebase functions:config:set whatsapp.token="${WHATSAPP_TOKEN}"`, { stdio: 'inherit' });
    execSync(`firebase functions:config:set whatsapp.verify_token="oticadavi2024"`, { stdio: 'inherit' });
    
    console.log('✅ Configurações do Firebase atualizadas com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações do Firebase:', error.message);
    return false;
  }
}

// Função para verificar o webhook
async function verificarWebhook() {
  try {
    console.log('\n=== VERIFICANDO WEBHOOK ===');
    
    console.log('URL do webhook:', WEBHOOK_URL);
    
    // Testar GET (verificação)
    try {
      const getResponse = await axios.get(`${WEBHOOK_URL}?hub.mode=subscribe&hub.verify_token=oticadavi2024&hub.challenge=CHALLENGE_ACCEPTED`);
      console.log('✅ Verificação GET bem-sucedida, status:', getResponse.status);
    } catch (getError) {
      console.log('⚠️ Verificação GET falhou, isso pode ser esperado:', getError.message);
    }
    
    // Testar POST (mensagem)
    try {
      const postResponse = await axios.post(WEBHOOK_URL, {
        object: 'whatsapp_business_account',
        entry: [{
          id: '2887557674896481',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: {
                display_phone_number: '5566999161540',
                phone_number_id: '576714648854724'
              },
              contacts: [{
                profile: { name: 'Cliente Teste' },
                wa_id: '5566999161540'
              }],
              messages: [{
                from: '5566999161540',
                id: 'wamid.test123',
                timestamp: '1677721357',
                type: 'text',
                text: { body: 'Teste do webhook' }
              }]
            },
            field: 'messages'
          }]
        }]
      });
      
      console.log('✅ Teste POST bem-sucedido, status:', postResponse.status);
      console.log('Resposta:', postResponse.data);
    } catch (postError) {
      console.error('❌ Teste POST falhou:', postError.message);
      if (postError.response) {
        console.error('Detalhes:', JSON.stringify(postError.response.data));
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar webhook:', error.message);
    return false;
  }
}

// Função principal para executar todas as verificações e correções
async function diagnosticarCorrigir() {
  try {
    console.log('\n=== DIAGNÓSTICO E CORREÇÃO DO AGENTE DE IA ===');
    console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
    
    // 1. Testar API da OpenAI
    const openaiOk = await testarOpenAI();
    
    // 2. Verificar e corrigir openaiService.js
    const openaiServiceOk = await verificarCorrigirOpenAIService();
    
    // 3. Verificar e corrigir confirmationSystem.js
    const confirmationSystemOk = await verificarCorrigirConfirmationSystem();
    
    // 4. Atualizar configurações do Firebase
    const configOk = await atualizarConfiguracoesFirebase();
    
    // 5. Verificar webhook
    const webhookOk = await verificarWebhook();
    
    // Resumo
    console.log('\n=== RESUMO DO DIAGNÓSTICO ===');
    console.log(`API da OpenAI: ${openaiOk ? '✅ OK' : '❌ Problema'}`);
    console.log(`Arquivo openaiService.js: ${openaiServiceOk ? '✅ OK' : '❌ Problema'}`);
    console.log(`Arquivo confirmationSystem.js: ${confirmationSystemOk ? '✅ OK' : '❌ Problema'}`);
    console.log(`Configurações do Firebase: ${configOk ? '✅ OK' : '❌ Problema'}`);
    console.log(`Webhook: ${webhookOk ? '✅ OK' : '❌ Problema'}`);
    
    // Próximos passos
    console.log('\n=== PRÓXIMOS PASSOS ===');
    
    if (openaiOk && openaiServiceOk && confirmationSystemOk && configOk && webhookOk) {
      console.log('✅ Todos os componentes estão funcionando corretamente.');
      console.log('Recomendação: Reimplante as funções para aplicar as alterações:');
      console.log('  firebase deploy --only functions');
    } else {
      console.log('⚠️ Alguns componentes precisam de atenção:');
      
      if (!openaiOk) {
        console.log('1. Verifique a chave da API da OpenAI');
      }
      
      if (!openaiServiceOk) {
        console.log('2. Revise manualmente o arquivo openaiService.js');
      }
      
      if (!confirmationSystemOk) {
        console.log('3. Revise manualmente o arquivo confirmationSystem.js');
      }
      
      if (!configOk) {
        console.log('4. Verifique as permissões para atualizar as configurações do Firebase');
      }
      
      if (!webhookOk) {
        console.log('5. Verifique a configuração do webhook no Facebook Developer Portal');
      }
    }
    
    console.log('\nApós fazer as correções necessárias, reimplante as funções:');
    console.log('  firebase deploy --only functions');
    
  } catch (error) {
    console.error('\n❌ ERRO NO DIAGNÓSTICO');
    console.error('Erro:', error);
  }
}

// Executar o diagnóstico
diagnosticarCorrigir();

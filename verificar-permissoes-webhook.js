/**
 * Script para verificar as permissões do webhook do WhatsApp
 */
const axios = require('axios');
require('dotenv').config();
const readline = require('readline');

// Criar interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function verificarPermissoes() {
  try {
    console.log('=== VERIFICAÇÃO DE PERMISSÕES DO WEBHOOK ===');
    
    // Solicitar token de acesso
    const accessToken = await new Promise(resolve => {
      rl.question('Digite o token de acesso do WhatsApp Business: ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (!accessToken) {
      console.error('Token de acesso inválido');
      rl.close();
      return;
    }
    
    // Solicitar ID da conta de negócios do WhatsApp
    const whatsappBusinessAccountId = await new Promise(resolve => {
      rl.question('Digite o ID da conta de negócios do WhatsApp (padrão: 2887557674896481): ', (answer) => {
        return resolve(answer.trim() || '2887557674896481');
      });
    });
    
    console.log('\nVerificando permissões...');
    
    // Verificar permissões da aplicação
    const appPermissionsUrl = `https://graph.facebook.com/v21.0/app/permissions`;
    console.log('Verificando permissões da aplicação...');
    
    try {
      const appPermissionsResponse = await axios.get(appPermissionsUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('Permissões da aplicação:');
      console.log(JSON.stringify(appPermissionsResponse.data, null, 2));
    } catch (error) {
      console.error('Erro ao verificar permissões da aplicação:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    // Verificar webhook
    const webhookUrl = `https://graph.facebook.com/v21.0/${whatsappBusinessAccountId}/webhooks`;
    console.log('\nVerificando configuração do webhook...');
    
    try {
      const webhookResponse = await axios.get(webhookUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      console.log('Configuração do webhook:');
      console.log(JSON.stringify(webhookResponse.data, null, 2));
      
      if (webhookResponse.data && webhookResponse.data.data && webhookResponse.data.data.length > 0) {
        console.log('\n✅ Webhook configurado!');
        
        // Verificar campos inscritos
        const fields = webhookResponse.data.data[0].fields || [];
        console.log('Campos inscritos:', fields.join(', '));
        
        // Verificar status
        const status = webhookResponse.data.data[0].status || 'unknown';
        console.log('Status do webhook:', status);
        
        if (status !== 'subscribed') {
          console.log('\n⚠️ O webhook não está inscrito. Você precisa verificar o callback_url e o verify_token.');
        }
      } else {
        console.log('\n❌ Webhook não encontrado ou não configurado corretamente');
      }
    } catch (error) {
      console.error('Erro ao verificar webhook:', error.message);
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Dados:', JSON.stringify(error.response.data, null, 2));
      }
    }
    
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
  } catch (error) {
    console.error('\n❌ Erro geral:', error.message);
  } finally {
    rl.close();
  }
}

// Executar a verificação
verificarPermissoes();

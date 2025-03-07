/**
 * Script para testar o envio de mensagens diretamente para o WhatsApp
 * Utiliza o token permanente e a API oficial do WhatsApp Business
 */
const axios = require('axios');

// Configuração
const WHATSAPP_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
const PHONE_NUMBER_ID = '576714648854724';
const VERSION = 'v21.0';

// Função para enviar mensagem de texto simples
async function enviarMensagemTexto(telefone, texto) {
  try {
    console.log(`\n=== ENVIANDO MENSAGEM DE TEXTO ===`);
    console.log(`Telefone: ${telefone}`);
    console.log(`Texto: "${texto}"`);
    
    const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: telefone,
      type: 'text',
      text: {
        preview_url: false,
        body: texto
      }
    };
    
    console.log('Enviando requisição para a API do WhatsApp...');
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });
    
    console.log('\n✅ RESPOSTA DA API DO WHATSAPP');
    console.log('Status:', response.status);
    console.log('Corpo:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\n❌ ERRO AO ENVIAR MENSAGEM');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Corpo:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
    throw error;
  }
}

// Função para enviar mensagem com botões interativos
async function enviarMensagemInterativa(telefone, texto, botoes) {
  try {
    console.log(`\n=== ENVIANDO MENSAGEM INTERATIVA ===`);
    console.log(`Telefone: ${telefone}`);
    console.log(`Texto: "${texto}"`);
    console.log(`Botões: ${JSON.stringify(botoes)}`);
    
    const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: telefone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: texto
        },
        action: {
          buttons: botoes.map((botao, index) => ({
            type: 'reply',
            reply: {
              id: botao.id || `botao_${index}`,
              title: botao.titulo
            }
          }))
        }
      }
    };
    
    console.log('Enviando requisição para a API do WhatsApp...');
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });
    
    console.log('\n✅ RESPOSTA DA API DO WHATSAPP');
    console.log('Status:', response.status);
    console.log('Corpo:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\n❌ ERRO AO ENVIAR MENSAGEM INTERATIVA');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Corpo:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
    throw error;
  }
}

// Função para enviar mensagem de template
async function enviarMensagemTemplate(telefone, template, parametros) {
  try {
    console.log(`\n=== ENVIANDO MENSAGEM DE TEMPLATE ===`);
    console.log(`Telefone: ${telefone}`);
    console.log(`Template: "${template}"`);
    console.log(`Parâmetros: ${JSON.stringify(parametros)}`);
    
    const url = `https://graph.facebook.com/${VERSION}/${PHONE_NUMBER_ID}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: telefone,
      type: 'template',
      template: {
        name: template,
        language: {
          code: 'pt_BR'
        },
        components: parametros ? [
          {
            type: 'body',
            parameters: parametros.map(param => ({
              type: 'text',
              text: param
            }))
          }
        ] : []
      }
    };
    
    console.log('Enviando requisição para a API do WhatsApp...');
    console.log('URL:', url);
    console.log('Payload:', JSON.stringify(payload, null, 2));
    
    const response = await axios.post(url, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`
      }
    });
    
    console.log('\n✅ RESPOSTA DA API DO WHATSAPP');
    console.log('Status:', response.status);
    console.log('Corpo:', JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    console.error('\n❌ ERRO AO ENVIAR MENSAGEM DE TEMPLATE');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Corpo:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
    throw error;
  }
}

// Função principal para executar os testes
async function executarTestes() {
  try {
    console.log('\n=== TESTE DE ENVIO DE MENSAGENS WHATSAPP ===');
    console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`Token: ${WHATSAPP_TOKEN.substring(0, 10)}...${WHATSAPP_TOKEN.substring(WHATSAPP_TOKEN.length - 10)}`);
    console.log(`ID do Telefone: ${PHONE_NUMBER_ID}`);
    console.log(`Versão da API: ${VERSION}`);
    
    // Número de telefone para teste (número correto do cliente)
    const telefoneDestino = '5566999161540';
    
    // Teste 1: Mensagem de texto simples
    await enviarMensagemTexto(telefoneDestino, 'Olá! Esta é uma mensagem de teste do sistema de agendamento da Ótica Davi.');
    
    console.log('\nAguardando 5 segundos antes do próximo teste...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Teste 2: Mensagem interativa com botões
    await enviarMensagemInterativa(
      telefoneDestino,
      'Você deseja confirmar seu agendamento para amanhã às 14:30?',
      [
        { id: 'sim', titulo: 'Sim' },
        { id: 'nao', titulo: 'Não' }
      ]
    );
    
    console.log('\nAguardando 5 segundos antes do próximo teste...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Teste 3: Mensagem de template
    await enviarMensagemTemplate(
      telefoneDestino,
      'template_agendamento',
      ['João Silva', '02/03/2025', '14:30', 'Campo Grande']
    );
    
    console.log('\n=== TESTES CONCLUÍDOS ===');
  } catch (error) {
    console.error('\n❌ ERRO AO EXECUTAR TESTES');
    console.error('Erro:', error);
  }
}

// Executa os testes
executarTestes();

/**
 * Script para testar o processamento de mensagens do webhook com a OpenAI
 * Simula o recebimento de uma mensagem do WhatsApp e o processamento com a IA
 */
const openaiService = require('./src/openaiService');
const axios = require('axios');

// Carregar variáveis de ambiente do arquivo .env se existir
try {
  require('dotenv').config();
} catch (e) {
  console.log('Arquivo .env não encontrado, usando variáveis de ambiente do sistema');
}

// Configurações
const TELEFONE = '66999161540'; // Substitua pelo número de telefone para teste
const MENSAGEM = 'Qual o horário de funcionamento da ótica?';

// Função para enviar mensagem simples (cópia da função no confirmationSystem.js)
async function enviarMensagemSimples(telefone, texto) {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || "576714648854724";
    
    if (!token) {
      throw new Error('Token do WhatsApp não configurado. Configure a variável de ambiente WHATSAPP_TOKEN');
    }
    
    // Formatar o número do telefone
    const numeroFormatado = telefone.startsWith('55') ? telefone : `55${telefone}`;
    
    const message = {
      messaging_product: "whatsapp",
      to: numeroFormatado,
      type: "text",
      text: {
        body: texto
      }
    };
    
    console.log(`Enviando mensagem para ${numeroFormatado}: "${texto}"`);
    
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log('Resposta da API do WhatsApp:', response.data);
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem simples:', error.response?.data || error.message);
    return false;
  }
}

// Função para testar a comunicação direta com a OpenAI
async function testarOpenAI() {
  try {
    console.log('\n=== TESTE DE COMUNICAÇÃO DIRETA COM A OPENAI ===');
    console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
    console.log(`Mensagem: "${MENSAGEM}"`);
    console.log(`Telefone: ${TELEFONE}`);
    
    console.log('\nObtendo chave da API...');
    const apiKey = await openaiService.getApiKey();
    console.log('Chave da API obtida:', apiKey ? 'Sim (chave válida)' : 'Não (chave inválida)');
    
    console.log('\nProcessando mensagem com a OpenAI...');
    const resposta = await openaiService.processarMensagemIA(MENSAGEM, TELEFONE);
    
    console.log('\n✅ RESPOSTA DA OPENAI:');
    console.log(resposta);
    
    console.log('\nEnviando resposta via WhatsApp...');
    const enviado = await enviarMensagemSimples(TELEFONE, resposta);
    
    if (enviado) {
      console.log('\n✅ Teste concluído com sucesso! A resposta foi enviada via WhatsApp.');
    } else {
      console.log('\n❌ Erro ao enviar resposta via WhatsApp.');
    }
  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE:');
    console.error(error);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    }
    
    // Tentar enviar mensagem de erro via WhatsApp
    try {
      const mensagemErro = "Ocorreu um erro durante o teste: " + (error.message || 'Erro desconhecido');
      await enviarMensagemSimples(TELEFONE, mensagemErro);
    } catch (e) {
      console.error('Erro ao enviar mensagem de erro:', e.message);
    }
  }
}

// Função para testar diretamente a chamada à API da OpenAI
async function testarChamadaDiretaOpenAI() {
  try {
    console.log('\n=== TESTE DE CHAMADA DIRETA À API DA OPENAI ===');
    console.log(`Data e hora: ${new Date().toLocaleString('pt-BR')}`);
    
    // Obter a chave da API
    console.log('\nObtendo chave da API...');
    const apiKey = await openaiService.getApiKey();
    
    if (!apiKey) {
      console.error('\n❌ Chave da API não encontrada!');
      return;
    }
    
    console.log('Chave da API obtida com sucesso!');
    
    // Criar mensagens para a API
    const mensagens = [
      { role: 'system', content: 'Você é um assistente de atendimento da Ótica Davi, uma ótica localizada em Cuiabá. Você deve fornecer informações sobre produtos, serviços, horários de funcionamento e agendamentos. Seja sempre educado e prestativo.' },
      { role: 'user', content: MENSAGEM }
    ];
    
    console.log('\nFazendo chamada direta à API da OpenAI...');
    
    // Fazer chamada direta à API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: mensagens,
        max_tokens: 500,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ RESPOSTA DIRETA DA API DA OPENAI:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const respostaTexto = response.data.choices[0].message.content;
    console.log('\nTexto da resposta:');
    console.log(respostaTexto);
    
    console.log('\nEnviando resposta via WhatsApp...');
    const enviado = await enviarMensagemSimples(TELEFONE, respostaTexto);
    
    if (enviado) {
      console.log('\n✅ Teste concluído com sucesso! A resposta foi enviada via WhatsApp.');
    } else {
      console.log('\n❌ Erro ao enviar resposta via WhatsApp.');
    }
  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE DE CHAMADA DIRETA:');
    console.error(error.message);
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Função para testar diretamente a chamada à API da OpenAI
async function executarTestes() {
  console.log('=== INICIANDO TESTES DE INTEGRAÇÃO COM OPENAI ===');
  
  try {
    // Testar comunicação com a OpenAI usando o serviço
    await testarOpenAI();
    
    console.log('\n' + '-'.repeat(50) + '\n');
    
    // Testar chamada direta à API da OpenAI
    await testarChamadaDiretaOpenAI();
    
    console.log('\n=== TESTES CONCLUÍDOS ===');
  } catch (error) {
    console.error('\nErro fatal durante os testes:', error);
  }
}

// Executar os testes
executarTestes();

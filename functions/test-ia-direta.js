/**
 * Script para testar diretamente a função de processamento de IA
 * Sem depender do webhook ou do Firebase
 */
const axios = require('axios');

// Configurações
const TELEFONE = '66999161540'; // Número para teste
const MENSAGEM = 'Qual o horário de funcionamento da ótica?';
const OPENAI_API_KEY = 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';

// Função para chamar a API da OpenAI diretamente
async function chamarOpenAI(mensagens) {
  try {
    console.log('\n=== CHAMANDO API OPENAI ===');
    console.log('Mensagens enviadas para a API:');
    console.log(JSON.stringify(mensagens, null, 2));
    
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-3.5-turbo',
      messages: mensagens,
      max_tokens: 250,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n=== RESPOSTA DA API OPENAI ===');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Conteúdo da resposta:');
    console.log(JSON.stringify(response.data.choices[0].message.content, null, 2));
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('\n❌ ERRO AO CHAMAR OPENAI');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Dados do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`Erro: ${error.message}`);
    }
    return 'Erro ao processar sua mensagem. Por favor, tente novamente mais tarde.';
  }
}

// Função para enviar mensagem via WhatsApp
async function enviarMensagemWhatsApp(telefone, texto) {
  try {
    console.log('\n=== ENVIANDO MENSAGEM VIA WHATSAPP ===');
    console.log(`Telefone: ${telefone}`);
    console.log(`Mensagem: "${texto}"`);
    
    // Formatar o número para o formato internacional
    let numeroFormatado = telefone;
    if (!numeroFormatado.startsWith('55')) {
      numeroFormatado = '55' + numeroFormatado;
    }
    
    const token = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
    const phoneNumberId = '576714648854724';
    const version = 'v21.0';
    
    const payload = {
      messaging_product: 'whatsapp',
      to: numeroFormatado,
      type: 'text',
      text: {
        body: texto
      }
    };
    
    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      data: payload,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('\n=== RESPOSTA DA API WHATSAPP ===');
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log('Dados da resposta:');
    console.log(JSON.stringify(response.data, null, 2));
    
    return true;
  } catch (error) {
    console.error('\n❌ ERRO AO ENVIAR MENSAGEM WHATSAPP');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Dados do erro:');
      console.error(JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(`Erro: ${error.message}`);
    }
    return false;
  }
}

// Função principal para testar o processamento de IA
async function testarProcessamentoIA() {
  try {
    console.log(`\n=== TESTE DE PROCESSAMENTO DE IA ===`);
    console.log(`Data e hora: ${new Date().toLocaleString()}`);
    console.log(`Telefone: ${TELEFONE}`);
    console.log(`Mensagem: "${MENSAGEM}"`);
    
    // Criar prompt para a IA
    const mensagens = [
      {
        role: 'system',
        content: `Você é um assistente virtual da Ótica Davi, especializada em óculos e lentes. 
Seja educado, profissional e direto nas respostas.
Informações importantes:
- Horário de funcionamento: Segunda a sexta das 8h às 18h, sábados das 8h às 12h
- Endereço: Av. Principal, 123, Centro, Cidade
- Telefone: (66) 3333-4444
- Serviços: Exames de vista, ajustes de armações, consertos, venda de óculos e lentes
- Marcas: Ray-Ban, Oakley, Chilli Beans, entre outras
Não invente informações que não foram fornecidas.`
      },
      {
        role: 'user',
        content: MENSAGEM
      }
    ];
    
    // Chamar a OpenAI
    console.log('\nProcessando mensagem com IA...');
    const respostaIA = await chamarOpenAI(mensagens);
    
    // Enviar a resposta via WhatsApp
    console.log('\nEnviando resposta da IA via WhatsApp...');
    await enviarMensagemWhatsApp(TELEFONE, respostaIA);
    
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('A resposta da IA foi enviada via WhatsApp.');
    console.log('Verifique seu celular para confirmar o recebimento.');
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE O TESTE:', error);
  }
}

// Executar o teste
testarProcessamentoIA();

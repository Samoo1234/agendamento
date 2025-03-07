/**
 * Script para diagnosticar e corrigir problemas comuns na integração WhatsApp + OpenAI
 */
const axios = require('axios');
require('dotenv').config();
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Criar interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para executar comandos no terminal
function executarComando(comando) {
  return new Promise((resolve, reject) => {
    exec(comando, (error, stdout, stderr) => {
      if (error) {
        console.error(`Erro ao executar comando: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

async function diagnosticarProblemas() {
  try {
    console.log('=== DIAGNÓSTICO DE PROBLEMAS DE INTEGRAÇÃO WHATSAPP + OPENAI ===');
    console.log('Data e hora:', new Date().toLocaleString());
    
    // Verificar se o Ngrok está instalado
    console.log('\n1. Verificando se o Ngrok está instalado...');
    try {
      const ngrokVersion = await executarComando('ngrok --version');
      console.log('✅ Ngrok está instalado:', ngrokVersion.trim());
    } catch (error) {
      console.log('❌ Ngrok não está instalado ou não está no PATH');
      console.log('Recomendação: Instale o Ngrok a partir de https://ngrok.com/download');
    }
    
    // Verificar se o servidor local está rodando
    console.log('\n2. Verificando se o servidor local está rodando...');
    try {
      const resultado = await axios.get('http://localhost:3000');
      console.log('✅ Servidor local está rodando:', resultado.status, resultado.statusText);
    } catch (error) {
      console.log('❌ Servidor local não está rodando na porta 3000');
      console.log('Recomendação: Inicie o servidor local com "cd servidor-local-whatsapp && npm start"');
    }
    
    // Verificar variáveis de ambiente
    console.log('\n3. Verificando variáveis de ambiente...');
    const variaveis = [
      'WHATSAPP_TOKEN',
      'WHATSAPP_PHONE_ID',
      'VERIFY_TOKEN',
      'OPENAI_API_KEY'
    ];
    
    let todasVariaveisPresentes = true;
    for (const variavel of variaveis) {
      if (process.env[variavel]) {
        console.log(`✅ ${variavel} está definida`);
      } else {
        console.log(`❌ ${variavel} não está definida`);
        todasVariaveisPresentes = false;
      }
    }
    
    if (!todasVariaveisPresentes) {
      console.log('Recomendação: Crie um arquivo .env na raiz do projeto com todas as variáveis necessárias');
    }
    
    // Verificar conexão com a API da OpenAI
    console.log('\n4. Verificando conexão com a API da OpenAI...');
    const openaiApiKey = process.env.OPENAI_API_KEY || 'sk-svcacct-vNtBGtbCqpyQrfa47QFctuzbHrZrm1zMFcsvYwrQYIdrIjTqY4nolYf-oXh1T-7urT3BlbkFJKQdDeFkUbixavp8gHuqvjtYSaSSs2DgZ59OTJgWDoAAa_k9VmBM9OooIAi7w8eiAA';
    
    try {
      const openaiResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Você é um assistente útil.' },
            { role: 'user', content: 'Diga "Teste de conexão bem-sucedido" em uma palavra.' }
          ],
          max_tokens: 10
        },
        {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log('✅ Conexão com a API da OpenAI bem-sucedida');
      console.log('Resposta:', openaiResponse.data.choices[0].message.content);
    } catch (error) {
      console.log('❌ Erro ao conectar com a API da OpenAI');
      console.log('Mensagem de erro:', error.message);
      
      if (error.response) {
        console.log('Status do erro:', error.response.status);
        console.log('Dados do erro:', JSON.stringify(error.response.data, null, 2));
      }
      
      console.log('Recomendação: Verifique se a chave da API da OpenAI é válida e se você tem créditos suficientes');
    }
    
    // Verificar conexão com a API do WhatsApp
    console.log('\n5. Verificando conexão com a API do WhatsApp...');
    const whatsappToken = process.env.WHATSAPP_TOKEN || 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';
    const whatsappPhoneId = process.env.WHATSAPP_PHONE_ID || '576714648854724';
    
    try {
      const whatsappResponse = await axios.get(
        `https://graph.facebook.com/v21.0/${whatsappPhoneId}`,
        {
          headers: {
            'Authorization': `Bearer ${whatsappToken}`
          }
        }
      );
      
      console.log('✅ Conexão com a API do WhatsApp bem-sucedida');
      console.log('Dados do telefone:', JSON.stringify(whatsappResponse.data, null, 2));
    } catch (error) {
      console.log('❌ Erro ao conectar com a API do WhatsApp');
      console.log('Mensagem de erro:', error.message);
      
      if (error.response) {
        console.log('Status do erro:', error.response.status);
        console.log('Dados do erro:', JSON.stringify(error.response.data, null, 2));
      }
      
      console.log('Recomendação: Verifique se o token do WhatsApp e o ID do telefone estão corretos');
    }
    
    // Perguntar ao usuário qual é o problema específico
    console.log('\n6. Qual é o problema específico que você está enfrentando?');
    const problema = await new Promise(resolve => {
      rl.question('Descreva o problema (ou pressione Enter para pular): ', (answer) => {
        resolve(answer.trim());
      });
    });
    
    if (problema) {
      console.log('\nCom base na sua descrição, aqui estão algumas possíveis soluções:');
      
      if (problema.includes('erro') || problema.includes('falha')) {
        console.log('1. Verifique os logs do servidor para identificar o erro específico');
        console.log('2. Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente');
        console.log('3. Verifique se o webhook está configurado corretamente no WhatsApp Business');
      }
      
      if (problema.includes('webhook') || problema.includes('não recebe')) {
        console.log('1. Verifique se o Ngrok está expondo corretamente o servidor local');
        console.log('2. Certifique-se de que o webhook está configurado com a URL correta do Ngrok');
        console.log('3. Verifique se o token de verificação está correto');
      }
      
      if (problema.includes('OpenAI') || problema.includes('IA')) {
        console.log('1. Verifique se a chave da API da OpenAI é válida');
        console.log('2. Certifique-se de que você tem créditos suficientes na sua conta da OpenAI');
        console.log('3. Verifique se o modelo especificado está disponível para sua conta');
      }
    }
    
    // Perguntar se o usuário quer testar o envio de mensagem
    console.log('\n7. Você gostaria de testar o envio de uma mensagem direta para o WhatsApp?');
    const testarEnvio = await new Promise(resolve => {
      rl.question('Digite "sim" para testar ou pressione Enter para pular: ', (answer) => {
        resolve(answer.trim().toLowerCase() === 'sim');
      });
    });
    
    if (testarEnvio) {
      const telefone = await new Promise(resolve => {
        rl.question('Digite o número de telefone (com código do país, ex: 5566999161540): ', (answer) => {
          resolve(answer.trim());
        });
      });
      
      if (!telefone || telefone.length < 10) {
        console.log('Número de telefone inválido, pulando teste de envio');
      } else {
        const mensagem = 'Teste de diagnóstico: Esta é uma mensagem de teste enviada pelo script de diagnóstico.';
        
        try {
          console.log(`Enviando mensagem para ${telefone}: ${mensagem}`);
          
          const response = await axios.post(
            `https://graph.facebook.com/v21.0/${whatsappPhoneId}/messages`,
            {
              messaging_product: 'whatsapp',
              to: telefone,
              type: 'text',
              text: { body: mensagem }
            },
            {
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('✅ Mensagem enviada com sucesso!');
          console.log('Resposta:', JSON.stringify(response.data, null, 2));
        } catch (error) {
          console.log('❌ Erro ao enviar mensagem');
          console.log('Mensagem de erro:', error.message);
          
          if (error.response) {
            console.log('Status do erro:', error.response.status);
            console.log('Dados do erro:', JSON.stringify(error.response.data, null, 2));
          }
        }
      }
    }
    
    console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');
    console.log('Recomendações gerais:');
    console.log('1. Use o servidor simplificado (servidor-simples.js) para testar a comunicação básica');
    console.log('2. Verifique os logs do servidor para identificar erros específicos');
    console.log('3. Certifique-se de que o webhook está configurado corretamente no WhatsApp Business');
    console.log('4. Verifique se todas as variáveis de ambiente estão configuradas corretamente');
  } catch (error) {
    console.error('\n❌ Erro geral no diagnóstico:', error.message);
  } finally {
    rl.close();
  }
}

// Executar o diagnóstico
diagnosticarProblemas();

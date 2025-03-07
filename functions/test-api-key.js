/**
 * Script para testar se a chave da API está sendo recuperada corretamente
 */
const functions = require('firebase-functions');

// Função para obter a chave da API
const getApiKey = () => {
  return process.env.OPENAI_API_KEY || functions.config().openai?.apikey;
};

// Testar a função
console.log('\n=== TESTE DE RECUPERAÇÃO DA CHAVE DA API ===');
console.log('Data e hora:', new Date().toLocaleString());

// Verificar variável de ambiente
console.log('\nVerificando variável de ambiente OPENAI_API_KEY:');
if (process.env.OPENAI_API_KEY) {
  console.log('✅ Variável de ambiente OPENAI_API_KEY está definida');
  console.log('Valor (primeiros 10 caracteres):', process.env.OPENAI_API_KEY.substring(0, 10) + '...');
} else {
  console.log('❌ Variável de ambiente OPENAI_API_KEY não está definida');
}

// Verificar configuração do Firebase
console.log('\nVerificando configuração do Firebase:');
try {
  const firebaseConfig = functions.config();
  console.log('Configuração do Firebase:', JSON.stringify(firebaseConfig, null, 2));
  
  if (firebaseConfig.openai && firebaseConfig.openai.apikey) {
    console.log('✅ Configuração openai.apikey está definida');
    console.log('Valor (primeiros 10 caracteres):', firebaseConfig.openai.apikey.substring(0, 10) + '...');
  } else {
    console.log('❌ Configuração openai.apikey não está definida');
  }
} catch (error) {
  console.error('❌ Erro ao acessar configuração do Firebase:', error.message);
}

// Testar a função getApiKey
console.log('\nTestando função getApiKey:');
const apiKey = getApiKey();
if (apiKey) {
  console.log('✅ getApiKey retornou um valor');
  console.log('Valor (primeiros 10 caracteres):', apiKey.substring(0, 10) + '...');
} else {
  console.log('❌ getApiKey não retornou nenhum valor');
}

console.log('\n=== TESTE CONCLUÍDO ===');

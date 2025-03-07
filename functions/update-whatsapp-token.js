/**
 * Script para atualizar o token do WhatsApp no arquivo de configuração
 * Isso é útil quando o token expira e precisa ser substituído
 */
const fs = require('fs');
const path = require('path');

// Novo token do WhatsApp (token permanente)
const NOVO_TOKEN = 'EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD';

// Arquivos que contêm o token do WhatsApp
const ARQUIVOS = [
  path.join(__dirname, 'src', 'confirmationSystem.js'),
  path.join(__dirname, 'src', 'whatsappNotification.js'),
  path.join(__dirname, 'test-estabilidade-ia.js'),
  path.join(__dirname, 'test-webhook.js'),
  path.join(__dirname, 'test-envio-direto.js')
];

// Função para atualizar o token em um arquivo
function atualizarTokenNoArquivo(arquivo) {
  console.log(`\nVerificando arquivo: ${arquivo}`);
  
  if (!fs.existsSync(arquivo)) {
    console.log(`❌ Arquivo não encontrado: ${arquivo}`);
    return false;
  }
  
  try {
    // Ler o conteúdo do arquivo
    let conteudo = fs.readFileSync(arquivo, 'utf8');
    
    // Padrão para encontrar o token (pode precisar de ajustes dependendo do formato)
    const padraoToken = /token\s*=\s*.*?"(EAAIj8UCs6L8[^"]+)"/g;
    const padraoToken2 = /WHATSAPP_TOKEN\s*=\s*['"]+(EAAIj8UCs6L8[^'"]+)['"]+/g;
    
    // Verificar se o token foi encontrado
    const matchesToken = conteudo.match(padraoToken);
    const matchesToken2 = conteudo.match(padraoToken2);
    
    if (!matchesToken && !matchesToken2) {
      console.log(`⚠️ Nenhum token encontrado no arquivo: ${arquivo}`);
      return false;
    }
    
    // Substituir o token
    let substituicoes = 0;
    
    if (matchesToken) {
      conteudo = conteudo.replace(padraoToken, (match, token) => {
        substituicoes++;
        return match.replace(token, NOVO_TOKEN);
      });
    }
    
    if (matchesToken2) {
      conteudo = conteudo.replace(padraoToken2, (match, token) => {
        substituicoes++;
        return match.replace(token, NOVO_TOKEN);
      });
    }
    
    // Salvar o arquivo atualizado
    fs.writeFileSync(arquivo, conteudo, 'utf8');
    
    console.log(`✅ Token atualizado em ${substituicoes} lugares no arquivo: ${arquivo}`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao atualizar o token no arquivo ${arquivo}:`, error.message);
    return false;
  }
}

// Função principal
function atualizarToken() {
  console.log('=== ATUALIZANDO TOKEN DO WHATSAPP ===');
  console.log(`Data e hora: ${new Date().toLocaleString()}`);
  console.log(`Novo token: ${NOVO_TOKEN.substring(0, 10)}...${NOVO_TOKEN.substring(NOVO_TOKEN.length - 10)}`);
  
  if (NOVO_TOKEN === 'SEU_NOVO_TOKEN_AQUI') {
    console.log('\n❌ ERRO: Você precisa substituir "SEU_NOVO_TOKEN_AQUI" pelo token real do WhatsApp!');
    console.log('Edite este arquivo e substitua a constante NOVO_TOKEN pelo token atual.');
    return;
  }
  
  let sucessos = 0;
  let falhas = 0;
  
  // Atualizar o token em cada arquivo
  for (const arquivo of ARQUIVOS) {
    const resultado = atualizarTokenNoArquivo(arquivo);
    if (resultado) {
      sucessos++;
    } else {
      falhas++;
    }
  }
  
  console.log('\n=== RESUMO ===');
  console.log(`Total de arquivos: ${ARQUIVOS.length}`);
  console.log(`Arquivos atualizados com sucesso: ${sucessos}`);
  console.log(`Arquivos com falha: ${falhas}`);
  
  if (sucessos > 0) {
    console.log('\n✅ Token atualizado com sucesso em alguns arquivos!');
    console.log('Próximos passos:');
    console.log('1. Atualize o token nas configurações do Firebase:');
    console.log('   firebase functions:config:set whatsapp.token="' + NOVO_TOKEN + '"');
    console.log('2. Reimplante as funções:');
    console.log('   firebase deploy --only functions');
  } else {
    console.log('\n❌ Não foi possível atualizar o token em nenhum arquivo.');
  }
}

// Executar a função principal
atualizarToken();

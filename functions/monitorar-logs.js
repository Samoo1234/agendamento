/**
 * Script para monitorar os logs do Firebase Functions
 * Isso ajudará a identificar erros em tempo real
 */
const { exec } = require('child_process');

console.log('=== MONITORANDO LOGS DO FIREBASE FUNCTIONS ===');
console.log('Pressione Ctrl+C para interromper o monitoramento');
console.log('Iniciando monitoramento...\n');

// Executar o comando firebase functions:log
const process = exec('firebase functions:log', { maxBuffer: 1024 * 1024 * 10 });

// Capturar a saída padrão
process.stdout.on('data', (data) => {
  // Destacar erros em vermelho
  const formattedData = data
    .replace(/ERROR/g, '\x1b[31mERROR\x1b[0m')
    .replace(/Error:/g, '\x1b[31mError:\x1b[0m')
    .replace(/error:/g, '\x1b[31merror:\x1b[0m');
  
  console.log(formattedData);
});

// Capturar a saída de erro
process.stderr.on('data', (data) => {
  console.error(`\x1b[31m${data}\x1b[0m`);
});

// Capturar evento de término
process.on('exit', (code) => {
  console.log(`\nMonitoramento encerrado com código ${code}`);
});

// Tratar interrupção (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\nInterrompendo monitoramento...');
  process.kill();
});

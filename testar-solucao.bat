@echo off
echo === TESTE DA SOLUCAO FINAL ===
echo.
echo Este script vai executar a solucao final e abrir o Ngrok
echo.
echo Pressione qualquer tecla para continuar...
pause > nul

echo.
echo 1. Iniciando o servidor...
start cmd /k "node solucao-final.js"

echo.
echo 2. Aguardando 5 segundos para o servidor iniciar...
timeout /t 5 /nobreak > nul

echo.
echo 3. Iniciando o Ngrok...
start cmd /k "ngrok http 3000"

echo.
echo 4. Aguardando 5 segundos para o Ngrok iniciar...
timeout /t 5 /nobreak > nul

echo.
echo 5. Agora, copie a URL do Ngrok (https://xxxx-xxxx.ngrok.io) e execute:
echo    node atualizar-webhook-simples.js
echo.
echo 6. Cole a URL do Ngrok quando solicitado
echo.
echo 7. Cole o token de acesso do WhatsApp Business quando solicitado
echo.
echo 8. Teste enviando uma mensagem do seu smartphone para o WhatsApp Business
echo.
echo Pressione qualquer tecla para sair...
pause > nul

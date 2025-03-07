# Script para iniciar o servidor de webhook e o Ngrok

# Função para verificar se um processo está rodando na porta especificada
function Test-PortInUse {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | findstr ":$Port "
    return $connections.Length -gt 0
}

# Função para encontrar e matar processos usando uma porta específica
function Kill-ProcessOnPort {
    param (
        [int]$Port
    )
    
    $connections = netstat -ano | findstr ":$Port "
    if ($connections) {
        $connections | ForEach-Object {
            $parts = $_ -split '\s+', 5
            if ($parts.Count -ge 5) {
                $pid = $parts[4]
                Write-Host "Matando processo com PID $pid na porta $Port"
                Stop-Process -Id $pid -Force
            }
        }
    }
}

# Verificar se a porta 3000 está em uso e matar o processo se necessário
if (Test-PortInUse -Port 3000) {
    Write-Host "Porta 3000 em uso. Matando processos..."
    Kill-ProcessOnPort -Port 3000
    Start-Sleep -Seconds 2
}

# Iniciar o servidor Flask em uma nova janela
Write-Host "Iniciando servidor Flask na porta 3000..."
Start-Process powershell -ArgumentList "-Command python webhook_server_python.py" -WindowStyle Normal

# Aguardar o servidor iniciar
Write-Host "Aguardando o servidor iniciar..."
Start-Sleep -Seconds 5

# Iniciar o Ngrok em uma nova janela
Write-Host "Iniciando Ngrok para expor a porta 3000..."
Start-Process "$env:USERPROFILE\ngrok\ngrok.exe" -ArgumentList "http 3000" -WindowStyle Normal

# Instruções para o usuário
Write-Host ""
Write-Host "=== INSTRUÇÕES ==="
Write-Host "1. Verifique a janela do Ngrok para obter a URL pública (https://xxxx.ngrok.io)"
Write-Host "2. Use essa URL para configurar o webhook no painel do Meta ou execute:"
Write-Host "   node configurar-webhook.js"
Write-Host "   (Atualize a URL no script primeiro)"
Write-Host ""
Write-Host "Para testar o webhook, envie uma mensagem para o número do WhatsApp configurado."

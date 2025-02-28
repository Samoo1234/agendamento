# Integração com WhatsApp Business API

Este documento contém instruções para configurar e testar a integração com a API do WhatsApp Business para envio de notificações de agendamento.

## Configuração

1. **Obter as credenciais do Firebase**:
   - Acesse o [Console do Firebase](https://console.firebase.google.com/)
   - Selecione seu projeto
   - Vá para Configurações > Contas de serviço
   - Clique em "Gerar nova chave privada"
   - Salve o arquivo JSON baixado como `serviceAccountKey.json` na raiz do projeto

2. **Configurar as variáveis de ambiente**:
   - Execute o seguinte comando para configurar o token do WhatsApp:
   ```
   firebase functions:config:set whatsapp.token="SEU_TOKEN_DO_WHATSAPP" whatsapp.phone_id="576714648854724"
   ```

## Testar a integração

### Teste local

Para testar o envio de mensagens localmente:

1. Execute o script de teste:
   ```
   node test-whatsapp.js
   ```

### Teste da Cloud Function

Para testar a Cloud Function que envia notificações quando um novo agendamento é criado:

1. Certifique-se de que o arquivo `serviceAccountKey.json` está na raiz do projeto
2. Execute o script de teste da Cloud Function:
   ```
   node test-cloud-function.js
   ```

## Solução de problemas

Se encontrar problemas com o envio de mensagens:

1. Verifique se o template "template_agendamento" foi aprovado no WhatsApp Business Manager
2. Confirme que o token de acesso está válido e não expirou
3. Verifique os logs da Cloud Function no Console do Firebase
4. Certifique-se de que o número de telefone está formatado corretamente (com código do país)

## Parâmetros do template

O template "template_agendamento" requer os seguintes parâmetros:

1. `nome` - Nome do cliente
2. `data` - Data do agendamento (formato DD/MM/AAAA)
3. `hora` - Horário do agendamento (formato HH:MM)
4. `cidade` - Cidade onde será realizado o atendimento

## Versões da API

A integração está configurada para usar a versão v17.0 da API do WhatsApp Business.

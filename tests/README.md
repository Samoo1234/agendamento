# Estrutura de Testes Consolidada

Este diretório contém a estrutura consolidada de testes para o projeto. A organização foi feita para melhorar a manutenibilidade e reduzir a duplicação de código.

## Estrutura de Diretórios

```
tests/
├── config.js                 # Configurações centralizadas
├── utils/                    # Utilitários compartilhados
│   └── testUtils.js         # Funções utilitárias comuns
├── openai/                   # Testes relacionados à OpenAI
│   └── openaiTests.js       # Testes consolidados da OpenAI
├── webhook/                  # Testes de webhook
├── whatsapp/                # Testes do WhatsApp
├── integration/             # Testes de integração
└── results/                 # Resultados dos testes
```

## Como Usar

1. **Configuração**:
   - Copie o arquivo `.env.example` para `.env`
   - Preencha todas as variáveis de ambiente necessárias

2. **Instalação**:
   ```bash
   npm install
   ```

3. **Executando Testes**:
   
   Para executar todos os testes:
   ```bash
   npm test
   ```

   Para executar testes específicos:
   ```bash
   # Testes da OpenAI
   node tests/openai/openaiTests.js

   # Testes de Webhook (quando implementado)
   node tests/webhook/webhookTests.js

   # Testes do WhatsApp (quando implementado)
   node tests/whatsapp/whatsappTests.js
   ```

## Benefícios da Nova Estrutura

1. **Código Centralizado**: Elimina duplicação de código entre arquivos de teste similares
2. **Configuração Única**: Todas as configurações em um único lugar
3. **Utilitários Compartilhados**: Funções comuns centralizadas
4. **Melhor Organização**: Testes agrupados por funcionalidade
5. **Manutenção Simplificada**: Mais fácil de manter e atualizar

## Próximos Passos

1. Migrar os testes existentes para a nova estrutura
2. Implementar testes de webhook consolidados
3. Implementar testes de WhatsApp consolidados
4. Adicionar testes de integração
5. Configurar CI/CD para executar os testes automaticamente

## Contribuindo

1. Mantenha a estrutura organizada
2. Utilize os utilitários compartilhados
3. Documente novos testes
4. Mantenha os resultados dos testes na pasta `results`
5. Atualize este README conforme necessário 
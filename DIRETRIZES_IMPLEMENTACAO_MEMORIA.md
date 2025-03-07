# Diretrizes para Implementação do Sistema de Memória - WhatsApp IA

## 1. Sistema Atual (Não Modificar)
- **Webhook URL**: `https://us-central1-oticadavi-113e0.cloudfunctions.net/whatsAppWebhook`
- **Token de Verificação**: `8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821`
- **Fluxo Atual**:
  ```
  Webhook -> Cloud Function -> OpenAI -> Cloud Function -> WhatsApp API
  ```

## 2. Plano de Implementação

### Fase 1: Desenvolvimento Paralelo
1. **Nova Cloud Function**
   - Nome sugerido: `whatsAppWebhookWithMemory`
   - Manter independente da função atual
   - Implementar feature flag para controle

2. **Estrutura do Banco de Dados**
   ```javascript
   conversations: {
     phoneNumber: {
       lastInteraction: timestamp,
       context: {
         recentMessages: [],
         preferences: {},
         lastTopic: string
       },
       metadata: {
         firstInteraction: timestamp,
         totalInteractions: number
       }
     }
   }
   ```

3. **Sistema de Cache**
   - Implementar TTL (Time To Live) de 30 minutos
   - Limitar histórico a últimas 10 mensagens
   - Priorizar informações relevantes

### Fase 2: Testes e Validação
1. **Ambiente de Teste**
   - Criar números de WhatsApp específicos para teste
   - Implementar logs detalhados
   - Monitorar uso de recursos

2. **Cenários de Teste**
   - Conversas longas
   - Múltiplos usuários simultâneos
   - Falhas de conexão
   - Limites de memória

3. **Métricas de Sucesso**
   - Tempo de resposta < 2 segundos
   - Zero perda de mensagens
   - Consistência nas respostas

### Fase 3: Integração Gradual
1. **Procedimento de Backup**
   - Backup completo do sistema atual
   - Documentar todos os tokens e configs
   - Criar pontos de restauração

2. **Plano de Rollback**
   ```
   1. Desativar feature flag
   2. Reverter para webhook original
   3. Limpar dados de teste
   4. Verificar integridade
   ```

3. **Monitoramento**
   - Implementar alertas de erro
   - Monitorar uso da OpenAI
   - Acompanhar métricas de performance

## 3. Pontos de Atenção

### Segurança
- Manter tokens seguros
- Encriptar dados sensíveis
- Implementar rate limiting
- Validar entrada de dados

### Performance
- Otimizar queries
- Implementar limpeza automática
- Monitorar uso de memória
- Cachear respostas comuns

### Manutenção
- Documentar todas as mudanças
- Manter logs organizados
- Criar rotinas de backup
- Planejar atualizações futuras

## 4. Próximos Passos
1. Revisar e aprovar plano
2. Criar ambiente de desenvolvimento
3. Implementar versão básica
4. Realizar testes iniciais
5. Avaliar resultados
6. Planejar implantação gradual

## 5. Notas Importantes
- Não modificar sistema atual até aprovação
- Manter backups constantes
- Documentar todas as alterações
- Priorizar estabilidade sobre features

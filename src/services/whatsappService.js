// src/services/whatsappService.js
import { functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';

/**
 * Serviço para envio de notificações via WhatsApp
 * Este serviço utiliza Cloud Functions para enviar mensagens
 * evitando expor tokens e credenciais no frontend
 */
export const whatsappService = {
  /**
   * Envia uma notificação de confirmação de agendamento
   * @param {Object} agendamento - Dados do agendamento
   * @returns {Promise} - Resultado da operação
   */
  enviarConfirmacao: async (agendamento) => {
    try {
      // Utilizamos Cloud Functions para manter as credenciais seguras
      const sendWhatsAppMessage = httpsCallable(functions, 'sendWhatsAppConfirmation');
      
      // Formata o telefone (remove espaços, parênteses, etc.)
      const telefoneFormatado = agendamento.telefone.replace(/[\s\-\(\)]/g, '');
      
      // Adiciona o código do país se necessário
      const numeroCompleto = telefoneFormatado.startsWith('55') 
        ? telefoneFormatado 
        : `55${telefoneFormatado}`;
      
      // Prepara os dados para envio
      const dadosEnvio = {
        telefone: numeroCompleto,
        nome: agendamento.nome,
        data: agendamento.data, // Formato esperado: DD/MM/YYYY
        horario: agendamento.horario,
        cidade: agendamento.cidade
      };
      
      // Chama a Cloud Function
      const resultado = await sendWhatsAppMessage(dadosEnvio);
      console.log('Notificação WhatsApp enviada:', resultado.data);
      return resultado.data;
    } catch (error) {
      console.error('Erro ao enviar notificação WhatsApp:', error);
      throw new Error(`Falha ao enviar notificação: ${error.message}`);
    }
  },
  
  /**
   * Envia um lembrete de agendamento
   * @param {Object} agendamento - Dados do agendamento
   * @returns {Promise} - Resultado da operação
   */
  enviarLembrete: async (agendamento) => {
    try {
      const sendWhatsAppReminder = httpsCallable(functions, 'sendWhatsAppReminder');
      
      const telefoneFormatado = agendamento.telefone.replace(/[\s\-\(\)]/g, '');
      const numeroCompleto = telefoneFormatado.startsWith('55') 
        ? telefoneFormatado 
        : `55${telefoneFormatado}`;
      
      const dadosEnvio = {
        telefone: numeroCompleto,
        nome: agendamento.nome,
        data: agendamento.data,
        horario: agendamento.horario,
        cidade: agendamento.cidade
      };
      
      const resultado = await sendWhatsAppReminder(dadosEnvio);
      console.log('Lembrete WhatsApp enviado:', resultado.data);
      return resultado.data;
    } catch (error) {
      console.error('Erro ao enviar lembrete WhatsApp:', error);
      throw new Error(`Falha ao enviar lembrete: ${error.message}`);
    }
  }
};

export default whatsappService;

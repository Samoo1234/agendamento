const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const openaiService = require('./openaiService');
const simpleResponse = require('./simpleResponse');

// Verificar se o Firebase já foi inicializado
try {
  if (!admin.apps.length) {
    admin.initializeApp();
    console.log('Firebase inicializado no confirmationSystem.js');
  } else {
    console.log('Firebase já inicializado anteriormente');
  }
} catch (error) {
  console.error('Erro ao inicializar Firebase:', error);
}

/**
 * Função agendada para enviar solicitações de confirmação 24h antes do agendamento
 * Esta função é executada diariamente às 10:00 da manhã
 */
exports.sendConfirmationRequests = functions.pubsub.schedule('0 10 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      // Configurações do WhatsApp Business API
      const token = functions.config().whatsapp?.token || "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
      const phoneNumberId = functions.config().whatsapp?.phone_id || "576714648854724";
      const version = 'v21.0';
      
      // Calcula a data de amanhã
      const hoje = new Date();
      const amanha = new Date(hoje);
      amanha.setDate(hoje.getDate() + 1);
      
      // Formata a data para o formato YYYY-MM-DD
      const dataAmanha = amanha.toISOString().split('T')[0];
      
      // Busca todos os agendamentos para amanhã
      const agendamentosRef = admin.firestore().collection('agendamentos');
      const snapshot = await agendamentosRef
        .where('data', '==', dataAmanha)
        .where('status_confirmacao', '==', 'pendente')
        .get();
      
      if (snapshot.empty) {
        console.log('Nenhum agendamento pendente encontrado para amanhã:', dataAmanha);
        return null;
      }
      
      // Envia solicitações de confirmação para cada agendamento
      const promises = [];
      snapshot.forEach(doc => {
        const agendamento = doc.data();
        
        // Verifica se tem telefone
        if (!agendamento.telefone) {
          console.log('Agendamento sem telefone:', doc.id);
          return;
        }
        
        // Formata o telefone
        const telefoneFormatado = agendamento.telefone.replace(/[\s\-\(\)]/g, '');
        const numeroCompleto = telefoneFormatado.startsWith('55') 
          ? telefoneFormatado 
          : `55${telefoneFormatado}`;
        
        // Formata a data para exibição
        const dataFormatada = new Date(agendamento.data).toLocaleDateString('pt-BR');
        
        // Formata a mensagem com template
        const message = {
          messaging_product: "whatsapp",
          to: numeroCompleto,
          type: "template",
          template: {
            name: "confirmacao_agendamento",
            language: {
              code: "pt_BR"
            },
            components: [
              {
                type: "body",
                parameters: [
                  { type: "text", text: agendamento.nome || "Cliente" },
                  { type: "text", text: dataFormatada || "Data não especificada" },
                  { type: "text", text: agendamento.horario || "Horário não especificado" },
                  { type: "text", text: agendamento.cidade || "Não especificada" }
                ]
              }
            ]
          }
        };
        
        // Envia a mensagem
        const promise = axios({
          method: "POST",
          url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
          data: message,
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          }
        }).then(async (response) => {
          // Atualiza o documento com o ID da mensagem
          await doc.ref.update({
            confirmacao_solicitada: true,
            confirmacao_timestamp: admin.firestore.FieldValue.serverTimestamp(),
            confirmacao_mensagem_id: response.data.messages?.[0]?.id || null
          });
          return response;
        });
        
        promises.push(promise);
      });
      
      await Promise.all(promises);
      console.log(`Solicitações de confirmação enviadas para ${promises.length} agendamentos`);
      return null;
    } catch (error) {
      console.error('Erro ao enviar solicitações de confirmação:', error);
      return null;
    }
  });

/**
 * Webhook para processar respostas de confirmação do WhatsApp
 */
exports.processWhatsAppWebhook = functions.https.onRequest(async (req, res) => {
  try {
    console.log('======= INÍCIO DO PROCESSAMENTO DO WEBHOOK =======');
    console.log('Data e hora:', new Date().toISOString());
    console.log('Método da requisição:', req.method);
    
    if (req.method === 'GET') {
      // Verifica se é uma solicitação GET (verificação do webhook)
      console.log('Verificação do webhook (GET)');
      console.log('Query params:', JSON.stringify(req.query));
      
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];
      
      console.log('Mode:', mode);
      console.log('Token:', token);
      console.log('Challenge:', challenge);
      
      // Verificar o token
      const VERIFY_TOKEN = process.env.VERIFY_TOKEN || '8255b4471f00fc2205629c12de1addfec4cdcb9e0f921bc9e2989574edd02821';
      console.log('Token esperado:', VERIFY_TOKEN);
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Verificação do webhook bem-sucedida');
        res.status(200).send(challenge);
      } else {
        console.log('Verificação do webhook falhou - token inválido');
        res.status(403).send('Forbidden');
      }
    } else if (req.method === 'POST') {
      // Processar mensagem recebida
      console.log('Processando mensagem recebida (POST)');
      console.log('Headers:', JSON.stringify(req.headers));
      console.log('Body completo:', JSON.stringify(req.body));
      
      const body = req.body;
      
      if (body.object) {
        console.log('Objeto recebido:', body.object);
        
        if (body.entry && 
            body.entry[0].changes && 
            body.entry[0].changes[0] && 
            body.entry[0].changes[0].value.messages && 
            body.entry[0].changes[0].value.messages[0]) {
          
          console.log('Entrada válida detectada');
          
          const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
          const from = body.entry[0].changes[0].value.messages[0].from;
          const msgBody = body.entry[0].changes[0].value.messages[0].text?.body;
          
          console.log('ID do telefone:', phoneNumberId);
          console.log('Remetente:', from);
          console.log('Mensagem recebida:', msgBody);
          
          if (msgBody) {
            console.log('Processando mensagem de texto');
            
            try {
              console.log('Chamando processarMensagemRecebida');
              const resposta = await processarMensagemRecebida(msgBody, from);
              console.log('Resposta gerada:', resposta);
              
              console.log('Enviando resposta de volta para o WhatsApp');
              await enviarMensagemSimples(from, resposta);
              console.log('Resposta enviada com sucesso');
            } catch (error) {
              console.error('Erro ao processar ou enviar mensagem:', error);
              console.error('Stack trace:', error.stack);
              
              // Tentar enviar uma mensagem de erro para o usuário
              try {
                await enviarMensagemSimples(from, "Desculpe, estamos enfrentando problemas técnicos no momento. Por favor, tente novamente mais tarde ou entre em contato diretamente pelo telefone (66) 3333-4444.");
              } catch (sendError) {
                console.error('Erro ao enviar mensagem de erro:', sendError);
              }
            }
          } else {
            console.log('Mensagem sem texto, ignorando');
          }
        } else {
          console.log('Entrada inválida ou sem mensagens');
          console.log('Estrutura da entrada:', JSON.stringify(body.entry));
        }
      } else {
        console.log('Objeto inválido ou não reconhecido');
      }
      
      res.status(200).send('OK');
    } else {
      console.log('Método não suportado:', req.method);
      res.status(405).send('Method Not Allowed');
    }
    
    console.log('======= FIM DO PROCESSAMENTO DO WEBHOOK =======');
  } catch (error) {
    console.error('Erro geral no processamento do webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * Processar mensagem recebida
 * @param {string} mensagem - Mensagem recebida
 * @param {string} telefone - Número de telefone do remetente
 * @returns {Promise<string>} - Resposta gerada pela IA
 */
async function processarMensagemRecebida(mensagem, telefone) {
  try {
    console.log('processarMensagemRecebida - Iniciando processamento');
    console.log('processarMensagemRecebida - Mensagem:', mensagem);
    console.log('processarMensagemRecebida - Telefone:', telefone);
    
    // Verificar se é uma confirmação simples
    const mensagemLower = mensagem.toLowerCase().trim();
    if (mensagemLower === 'sim' || mensagemLower === 'confirmar' || mensagemLower === 'confirmo') {
      console.log('processarMensagemRecebida - Detectada mensagem de confirmação');
      
      try {
        console.log('processarMensagemRecebida - Buscando agendamentos pendentes');
        
        // Buscar agendamentos pendentes para este número
        const agendamentosRef = admin.firestore().collection('agendamentos');
        const telefoneFormatado = telefone.replace(/\D/g, '');
        const query = await agendamentosRef
          .where('telefone_formatado', '==', telefoneFormatado)
          .where('status_confirmacao', '==', 'pendente')
          .orderBy('data', 'asc')
          .limit(1)
          .get();
        
        if (query.empty) {
          console.log('processarMensagemRecebida - Nenhum agendamento pendente encontrado');
          return 'Não encontramos agendamentos pendentes de confirmação para o seu número. Se precisar de ajuda, por favor entre em contato com nossa central.';
        }
        
        // Atualizar o agendamento
        const doc = query.docs[0];
        const agendamento = doc.data();
        
        await doc.ref.update({
          status_confirmacao: 'confirmado',
          confirmacao_timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('processarMensagemRecebida - Agendamento confirmado:', doc.id);
        
        // Formatar data para exibição
        const dataObj = new Date(agendamento.data);
        const dataFormatada = dataObj.toLocaleDateString('pt-BR');
        
        return `Obrigado! Seu agendamento para ${dataFormatada} às ${agendamento.horario} foi confirmado. Esperamos por você!`;
      } catch (error) {
        console.error('Erro ao processar confirmação:', error);
        return 'Desculpe, tivemos um problema ao processar sua confirmação. Por favor, tente novamente mais tarde ou entre em contato diretamente conosco.';
      }
    } else {
      // Processar com a IA
      console.log('processarMensagemRecebida - Processando com IA');
      return await openaiService.processarMensagemIA(mensagem, telefone);
    }
  } catch (error) {
    console.error('Erro ao processar mensagem recebida:', error);
    throw error;
  }
}

/**
 * Função auxiliar para enviar mensagem simples via WhatsApp
 * @param {string} telefone - Número de telefone do destinatário
 * @param {string} texto - Texto da mensagem
 * @returns {Promise<boolean>} - True se a mensagem foi enviada com sucesso
 */
async function enviarMensagemSimples(telefone, texto) {
  try {
    console.log('enviarMensagemSimples - Iniciando envio');
    console.log('enviarMensagemSimples - Telefone:', telefone);
    console.log('enviarMensagemSimples - Texto:', texto);
    
    const token = process.env.WHATSAPP_TOKEN || "EAAIj8UCs6L8BO9quBsc0leqkO9ldOR6qgf5Ur0eMG873azXaxFIoxVtoOeqS4Sada0cXxU7k1bbjlxrgZCSs8gCjlwzppXOxCMlFaZAXBP5snVhP6tv6Fl87wvhKYlgJvrWM21TiPZBZBcFtF2nnVEETuRqTZAe2ofoUZAg7F3lnYn3cSXRXbXyb9dwnH9Cr4VpAZDZD";
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID || "576714648854724";
    const version = 'v21.0';
    
    const message = {
      messaging_product: "whatsapp",
      to: telefone,
      type: "text",
      text: {
        body: texto
      }
    };
    
    console.log('enviarMensagemSimples - Configurações:');
    console.log('enviarMensagemSimples - Token:', token ? 'Configurado' : 'Não configurado');
    console.log('enviarMensagemSimples - Phone ID:', phoneNumberId);
    console.log('enviarMensagemSimples - Versão API:', version);
    console.log('enviarMensagemSimples - Mensagem:', JSON.stringify(message));
    
    const response = await axios({
      method: "POST",
      url: `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
      data: message,
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    });
    
    console.log('enviarMensagemSimples - Resposta da API:', JSON.stringify(response.data));
    return true;
  } catch (error) {
    console.error('Erro ao enviar mensagem simples:', error.message);
    
    if (error.response) {
      console.error('Status do erro:', error.response.status);
      console.error('Dados do erro:', JSON.stringify(error.response.data));
      console.error('Headers do erro:', JSON.stringify(error.response.headers));
    } else if (error.request) {
      console.error('Sem resposta do servidor WhatsApp');
      console.error('Detalhes da requisição:', JSON.stringify(error.request));
    } else {
      console.error('Erro na configuração da requisição:', error.message);
    }
    
    return false;
  }
}

/**
 * Função para atualizar status de confirmação de agendamentos antigos
 * Esta função é executada uma vez por dia para marcar como "pendente" agendamentos sem status
 */
exports.updateConfirmationStatus = functions.pubsub.schedule('0 0 * * *')
  .timeZone('America/Sao_Paulo')
  .onRun(async (context) => {
    try {
      // Busca agendamentos sem status de confirmação
      const agendamentosRef = admin.firestore().collection('agendamentos');
      const snapshot = await agendamentosRef
        .where('status_confirmacao', '==', null)
        .get();
      
      if (snapshot.empty) {
        console.log('Nenhum agendamento sem status de confirmação encontrado');
        return null;
      }
      
      // Atualiza o status para "pendente"
      const batch = admin.firestore().batch();
      snapshot.forEach(doc => {
        batch.update(doc.ref, { status_confirmacao: 'pendente' });
      });
      
      await batch.commit();
      console.log(`Status de confirmação atualizado para ${snapshot.size} agendamentos`);
      return null;
    } catch (error) {
      console.error('Erro ao atualizar status de confirmação:', error);
      return null;
    }
  });

// Função para inicializar o status de confirmação em novos agendamentos
exports.initConfirmationStatus = functions.firestore
  .document('agendamentos/{agendamentoId}')
  .onCreate(async (snap, context) => {
    try {
      // Define o status de confirmação como "pendente" para novos agendamentos
      await snap.ref.update({
        status_confirmacao: 'pendente'
      });
      
      return null;
    } catch (error) {
      console.error('Erro ao inicializar status de confirmação:', error);
      return null;
    }
  });

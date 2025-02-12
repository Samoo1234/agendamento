/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.deleteUser = functions.https.onCall(async (data, context) => {
  // Verificar se o chamador é um administrador
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado');
  }

  try {
    // Buscar o role do usuário no Firestore
    const callerDoc = await admin.firestore().collection('usuarios').doc(context.auth.uid).get();
    const callerData = callerDoc.data();

    if (!callerData || callerData.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem deletar usuários');
    }

    // Verificar se o UID foi fornecido
    if (!data.uid) {
      throw new functions.https.HttpsError('invalid-argument', 'UID do usuário não fornecido');
    }

    // Deletar o usuário do Authentication
    await admin.auth().deleteUser(data.uid);

    return { success: true, message: 'Usuário deletado com sucesso' };
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    throw new functions.https.HttpsError('internal', 'Erro ao deletar usuário: ' + error.message);
  }
});

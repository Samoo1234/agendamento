/**
 * Utilitário para padronizar números de telefone
 */

/**
 * Normaliza um número de telefone para o formato padrão
 * @param {string} phone - Número de telefone em qualquer formato
 * @returns {string} Número normalizado ou null se inválido
 */
function normalizePhoneNumber(phone) {
    if (!phone || typeof phone !== 'string') {
        return null;
    }

    // Remover todos os caracteres não numéricos
    let normalized = phone.replace(/\D/g, '');

    // Remover zeros à esquerda
    normalized = normalized.replace(/^0+/, '');

    // Se começar com 55, manter, senão adicionar
    if (!normalized.startsWith('55')) {
        normalized = '55' + normalized;
    }

    // Se tiver 12 dígitos (sem o 9), adicionar o 9 depois do DDD
    if (normalized.length === 12 && normalized.startsWith('55')) {
        const ddd = normalized.substring(0, 4);
        const numero = normalized.substring(4);
        normalized = ddd + '9' + numero;
    }

    // Verificar se tem o tamanho correto (13 dígitos = 55 + DDD + 9 dígitos)
    if (normalized.length !== 13) {
        console.warn(`Número ${phone} normalizado para ${normalized} tem tamanho incorreto`);
        return normalized; // Retornar mesmo assim para tentar encontrar
    }

    return normalized;
}

/**
 * Gera todas as variações possíveis de um número de telefone
 * @param {string} phone - Número de telefone normalizado
 * @returns {string[]} Array com todas as variações do número
 */
function getAllPhoneFormats(phone) {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) {
        return [];
    }

    // Exemplo: para 5527999999999
    const formats = [
        normalized,                    // 5527999999999
        normalized.substring(2),       // 27999999999
        normalized.substring(4),       // 999999999
        `+${normalized}`,             // +5527999999999
        `+${normalized.substring(2)}`, // +27999999999
    ];

    // Se o número tem 13 dígitos, adicionar versão sem o 9
    if (normalized.length === 13) {
        const sem9 = normalized.substring(0, 4) + normalized.substring(5);
        formats.push(sem9); // 556699161540 (sem o 9)
    }

    // Se o número tem 12 dígitos, adicionar versão com o 9
    if (normalized.length === 12) {
        const com9 = normalized.substring(0, 4) + '9' + normalized.substring(4);
        formats.push(com9); // 5566999161540 (com o 9)
    }

    console.log('📱 Formatos de telefone gerados:', formats);
    return formats;
}

module.exports = {
    normalizePhoneNumber,
    getAllPhoneFormats
};

/**
 * Utilitários para manipulação de strings
 */

/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas
 * @param {string} str - String para normalizar
 * @returns {string} String normalizada
 */
const normalizeString = (str) => {
    if (!str) return '';
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
              .trim();
};

/**
 * Compara duas strings ignorando acentos e case
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {boolean} True se as strings são iguais ignorando acentos e case
 */
const compareStrings = (str1, str2) => {
    return normalizeString(str1) === normalizeString(str2);
};

/**
 * Formata uma string para exibição mantendo a capitalização correta
 * @param {string} str - String para formatar
 * @returns {string} String formatada
 */
const formatDisplayString = (str) => {
    if (!str) return '';
    return str.trim()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
};

module.exports = {
    normalizeString,
    compareStrings,
    formatDisplayString
}; 
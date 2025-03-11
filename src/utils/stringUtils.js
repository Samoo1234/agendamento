/**
 * Utilitários para manipulação de strings
 */

/**
 * Normaliza uma string removendo acentos e convertendo para minúsculas
 * @param {string} str - String para normalizar
 * @returns {string} String normalizada
 */
export const normalizeString = (str) => {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
};

/**
 * Compara duas strings ignorando acentos e case
 * @param {string} str1 - Primeira string
 * @param {string} str2 - Segunda string
 * @returns {boolean} True se as strings são iguais ignorando acentos e case
 */
export const compareStrings = (a, b) => {
    return normalizeString(a).localeCompare(normalizeString(b));
};

/**
 * Formata uma string para exibição mantendo a capitalização correta
 * @param {string} str - String para formatar
 * @returns {string} String formatada
 */
export const formatDisplayString = (str) => {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .trim();
};

export const formatarTelefone = (telefone) => {
  if (!telefone) return '';
  const numero = telefone.replace(/\D/g, '');
  if (numero.length === 11) {
    return numero.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  return numero.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
};

export const formatarCPF = (cpf) => {
  if (!cpf) return '';
  const numero = cpf.replace(/\D/g, '');
  return numero.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
};

export const formatarData = (data) => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarCPF = (cpf) => {
  const numero = cpf.replace(/\D/g, '');
  if (numero.length !== 11) return false;
  return true; // Simplificado - adicione validação completa se necessário
};

export const validarTelefone = (telefone) => {
  const numero = telefone.replace(/\D/g, '');
  return numero.length >= 10 && numero.length <= 11;
};

export const compareStringsLocale = (a, b) => {
  return normalizeString(a).localeCompare(normalizeString(b));
};

export const formatDisplayStringLocale = (str) => {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim();
};

export const formatarTelefoneLocale = (telefone) => {
  if (!telefone) return '';
  const numero = telefone.replace(/\D/g, '');
  if (numero.length === 11) {
    return numero.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  return numero.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
};

export const formatarCPFLocale = (cpf) => {
  if (!cpf) return '';
  const numero = cpf.replace(/\D/g, '');
  return numero.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
};

export const formatarDataLocale = (data) => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

export const validarEmailLocale = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validarCPFLocale = (cpf) => {
  const numero = cpf.replace(/\D/g, '');
  if (numero.length !== 11) return false;
  return true; // Simplificado - adicione validação completa se necessário
};

export const validarTelefoneLocale = (telefone) => {
  const numero = telefone.replace(/\D/g, '');
  return numero.length >= 10 && numero.length <= 11;
}; 
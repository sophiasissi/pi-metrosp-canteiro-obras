/**
 * Utilitários para validação de CPF
 * Implementa o algoritmo oficial de validação de CPF brasileiro
 */

export interface CPFValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Remove formatação do CPF (pontos e traços)
 */
export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

/**
 * Formata CPF com pontos e traço
 */
export function formatCPF(cpf: string): string {
  const numbersOnly = cleanCPF(cpf);
  
  if (numbersOnly.length <= 3) {
    return numbersOnly;
  } else if (numbersOnly.length <= 6) {
    return numbersOnly.slice(0, 3) + '.' + numbersOnly.slice(3);
  } else if (numbersOnly.length <= 9) {
    return numbersOnly.slice(0, 3) + '.' + numbersOnly.slice(3, 6) + '.' + numbersOnly.slice(6);
  } else if (numbersOnly.length <= 11) {
    return numbersOnly.slice(0, 3) + '.' + numbersOnly.slice(3, 6) + '.' + numbersOnly.slice(6, 9) + '-' + numbersOnly.slice(9);
  }
  
  return cpf;
}

/**
 * Valida se o CPF é um número válido usando o algoritmo oficial
 */
export function validateCPF(cpf: string): CPFValidationResult {
  const cleanedCPF = cleanCPF(cpf);
  
  // Verifica se tem 11 dígitos
  if (cleanedCPF.length !== 11) {
    return {
      isValid: false,
      message: 'CPF deve conter exatamente 11 dígitos'
    };
  }
  
  // Verifica se todos os dígitos são iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleanedCPF)) {
    return {
      isValid: false,
      message: 'CPF não pode ter todos os dígitos iguais'
    };
  }
  
  // Converte string para array de números
  const digits = cleanedCPF.split('').map(Number);
  
  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o primeiro dígito
  if (digits[9] !== firstDigit) {
    return {
      isValid: false,
      message: 'CPF inválido'
    };
  }
  
  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  // Verifica o segundo dígito
  if (digits[10] !== secondDigit) {
    return {
      isValid: false,
      message: 'CPF inválido'
    };
  }
  
  return {
    isValid: true,
    message: 'CPF válido'
  };
}

/**
 * Lista de CPFs para teste (válidos)
 */
export const TEST_VALID_CPFS = [
  '11144477735',
  '22233344456',
  '33366699958'
];

/**
 * Lista de CPFs para teste (inválidos)
 */
export const TEST_INVALID_CPFS = [
  '11111111111',
  '22222222222',
  '12345678901',
  '00000000000'
];
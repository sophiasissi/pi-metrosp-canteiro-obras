/**
 * Arquivo de teste para demonstrar o funcionamento do validador de CPF
 * 
 * Para executar este teste, você pode usar o comando:
 * npx ts-node utils/testCpfValidator.ts
 */

import { validateCPF, formatCPF, cleanCPF } from './cpfValidator';

console.log('🧪 Testando Validador de CPF\n');

// Lista de CPFs para teste
const testCases = [
  // CPFs válidos
  { cpf: '11144477735', expected: true, description: 'CPF válido sem formatação' },
  { cpf: '111.444.777-35', expected: true, description: 'CPF válido com formatação' },
  
  // CPFs inválidos
  { cpf: '11111111111', expected: false, description: 'CPF com todos os dígitos iguais' },
  { cpf: '12345678901', expected: false, description: 'CPF com sequência inválida' },
  { cpf: '000.000.000-00', expected: false, description: 'CPF zerado' },
  { cpf: '123.456.789-00', expected: false, description: 'CPF com dígitos verificadores incorretos' },
  
  // Casos de entrada inválida
  { cpf: '123', expected: false, description: 'CPF muito curto' },
  { cpf: '123456789012', expected: false, description: 'CPF muito longo' },
  { cpf: '', expected: false, description: 'CPF vazio' },
  { cpf: 'abc.def.ghi-jk', expected: false, description: 'CPF com letras' },
];

console.log('📋 Resultados dos testes:\n');

testCases.forEach((testCase, index) => {
  const result = validateCPF(testCase.cpf);
  const passed = result.isValid === testCase.expected;
  
  console.log(`${index + 1}. ${testCase.description}`);
  console.log(`   CPF: "${testCase.cpf}"`);
  console.log(`   Esperado: ${testCase.expected ? 'válido' : 'inválido'}`);
  console.log(`   Resultado: ${result.isValid ? 'válido' : 'inválido'}`);
  console.log(`   Mensagem: ${result.message}`);
  console.log(`   Status: ${passed ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log('');
});

console.log('🔧 Testando formatação de CPF:\n');

const formatTests = [
  '11144477735',
  '111444777',
  '111444',
  '111',
  '1',
  ''
];

formatTests.forEach(cpf => {
  const formatted = formatCPF(cpf);
  const cleaned = cleanCPF(cpf);
  console.log(`Original: "${cpf}" → Formatado: "${formatted}" → Limpo: "${cleaned}"`);
});

console.log('\n✨ Teste concluído!');
#!/usr/bin/env node
/**
 * Script de validação de variáveis de ambiente
 * Task 1: Verificar se .env está configurado corretamente
 */

require('dotenv').config();

console.log('\n🔍 Validando Variáveis de Ambiente...\n');
console.log('='.repeat(50));

const requiredVars = [
  { name: 'PORT', required: false, default: '3333' },
  { name: 'HOST', required: false, default: 'localhost' },
  { name: 'NODE_ENV', required: false, default: 'development' },
  { name: 'JWT_SECRET', required: true, default: null },
  { name: 'JWT_ACCESS_EXPIRY', required: false, default: '1h' },
  { name: 'JWT_REFRESH_EXPIRY', required: false, default: '7d' },
  { name: 'ALLOWED_ORIGINS', required: false, default: 'http://localhost:3000' },
  { name: 'LOG_LEVEL', required: false, default: 'info' },
  { name: 'DB_FILE', required: false, default: 'db.json' }
];

let hasErrors = false;
let hasWarnings = false;

requiredVars.forEach(varDef => {
  const value = process.env[varDef.name];
  const isSet = value !== undefined && value !== '';
  
  if (!isSet && varDef.required && process.env.NODE_ENV === 'production') {
    console.log(`❌ ${varDef.name.padEnd(25)} ERRO: Obrigatório em produção`);
    hasErrors = true;
  } else if (!isSet) {
    console.log(`⚠️  ${varDef.name.padEnd(25)} Usando padrão: ${varDef.default || 'N/A'}`);
    hasWarnings = true;
  } else {
    // Ocultar valores sensíveis
    const displayValue = varDef.name.includes('SECRET') || varDef.name.includes('PASSWORD')
      ? '***' + value.slice(-4)
      : value;
    console.log(`✅ ${varDef.name.padEnd(25)} ${displayValue}`);
  }
});

console.log('='.repeat(50));

// Validações de segurança
console.log('\n🔒 Validações de Segurança:\n');

if (process.env.JWT_SECRET) {
  const secretLength = process.env.JWT_SECRET.length;
  if (secretLength < 32) {
    console.log(`⚠️  JWT_SECRET muito curto (${secretLength} chars). Recomendado: 32+`);
    hasWarnings = true;
  } else {
    console.log(`✅ JWT_SECRET com tamanho adequado (${secretLength} chars)`);
  }
  
  if (process.env.JWT_SECRET.includes('your-super-secret')) {
    console.log('⚠️  JWT_SECRET parece ser o valor de exemplo. Altere em produção!');
    hasWarnings = true;
  }
}

console.log('='.repeat(50));

// Resumo final
if (hasErrors) {
  console.log('\n❌ VALIDAÇÃO FALHOU: Corrija os erros acima\n');
  process.exit(1);
} else if (hasWarnings && process.env.NODE_ENV === 'production') {
  console.log('\n⚠️  AVISOS ENCONTRADOS: Revise antes de ir para produção\n');
  process.exit(0);
} else if (hasWarnings) {
  console.log('\n⚠️  Avisos encontrados (ok para desenvolvimento)\n');
  process.exit(0);
} else {
  console.log('\n✅ TODAS AS VARIÁVEIS VALIDADAS COM SUCESSO! 🎉\n');
  process.exit(0);
}

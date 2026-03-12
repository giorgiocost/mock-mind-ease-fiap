/**
 * Vercel Serverless Function Handler
 * Wrapper para o JSON Server funcionar no Vercel
 */

// Importar o servidor configurado
const app = require('../server');

// Exportar como handler do Vercel
module.exports = app;

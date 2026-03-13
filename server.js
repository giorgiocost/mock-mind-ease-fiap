/**
 * MindEase Backend Mock - JSON Server
 * 
 * Servidor mock para desenvolvimento frontend usando JSON Server.
 * Implementa API REST completa com autenticação mockada.
 * 
 * @version 1.0.0
 * @port 3333
 * @baseUrl http://localhost:3333/api/v1
 */

// ========================================
// CARREGAR VARIÁVEIS DE AMBIENTE
// ========================================
require('dotenv').config();

const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// ========================================
// CONFIGURAÇÃO DO SERVIDOR
// ========================================

// Criar instâncias do JSON Server
const server = jsonServer.create();

// Em ambientes serverless (Vercel) o filesystem é read-only (/var/task/).
// Usar o adaptador in-memory passando o objeto JSON diretamente.
// Em desenvolvimento, usar o adaptador FileSync normal (persiste em disco).
const IS_SERVERLESS = !!(process.env.VERCEL || process.env.VERCEL_ENV);
const router = IS_SERVERLESS
  ? jsonServer.router(require('./db.json'))
  : jsonServer.router(path.join(__dirname, 'db.json'));

const middlewares = jsonServer.defaults();

// Carregar configurações externas
const routes = require('./routes.json');
const customMiddleware = require('./custom-middleware');

// ========================================
// MIDDLEWARES
// ========================================

/**
 * Configuração CORS
 * Permite requisições de qualquer origem (modo desenvolvimento)
 * Em produção, especifique as origens permitidas
 */
server.use(cors({
  origin: '*', // Permite qualquer origem
  credentials: false, // Com origin: '*', credentials deve ser false
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With', 'x-correlation-id'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

/**
 * Middlewares padrão do JSON Server
 * - Logger de requisições
 * - Servir arquivos estáticos
 * - No-cache headers
 */
server.use(middlewares);

/**
 * Body parser para processar JSON
 */
server.use(jsonServer.bodyParser);

/**
 * Middleware customizado
 * - Logging
 * - Timestamps automáticos
 * - Mock de autenticação
 * - Validações básicas
 * - Health check
 */
server.use(customMiddleware(router.db));

// ========================================
// SWAGGER UI DOCUMENTATION
// ========================================

/**
 * Swagger UI - Interactive API Documentation
 * Access: http://localhost:3333/api-docs
 */
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MindEase API Docs',
  customfavIcon: '/favicon.ico'
}));

/**
 * OpenAPI JSON Spec Download
 * Access: http://localhost:3333/swagger.json
 */
server.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ========================================
// ROTAS CUSTOMIZADAS
// ========================================

/**
 * Informações da API
 * Lista endpoints disponíveis
 * 
 * @route GET /api/v1
 * @returns {object} Documentação básica
 */
server.get('/api/v1', (req, res) => {
  res.status(200).json({
    message: 'MindEase Backend Mock API',
    version: '1.0.0',
    baseUrl: 'http://localhost:3333/api/v1',
    endpoints: {
      health: '/health',
      users: '/api/v1/users',
      preferences: '/api/v1/preferences',
      tasks: '/api/v1/tasks',
      checklistItems: '/api/v1/checklistItems',
      taskNotes: '/api/v1/taskNotes',
      focusSessions: '/api/v1/focusSessions',
      cognitiveAlerts: '/api/v1/cognitiveAlerts',
      telemetryEvents: '/api/v1/telemetryEvents'
    },
    documentation: 'Ver back-end/docs/api-mock/refinamento_tecnico-backend-mockado.md'
  });
});

// ========================================
// REWRITE DE ROTAS
// ========================================

/**
 * Carregar rotas customizadas de routes.json
 * Reescreve /api/v1/* para /*
 */
server.use(jsonServer.rewriter(routes));

// ========================================
// ROUTER PADRÃO
// ========================================

/**
 * Usar router padrão do JSON Server
 * Cria automaticamente endpoints REST para todas as collections:
 * - GET    /collection       (listar todos)
 * - GET    /collection/:id   (buscar por ID)
 * - POST   /collection       (criar novo)
 * - PUT    /collection/:id   (substituir completo)
 * - PATCH  /collection/:id   (atualizar parcial)
 * - DELETE /collection/:id   (deletar)
 * 
 * Suporta queries:
 * - ?field=value            (filtro)
 * - ?_sort=field&_order=asc (ordenação)
 * - ?_page=1&_limit=10      (paginação)
 */
server.use(router);

// ========================================
// INICIALIZAÇÃO
// ========================================

/**
 * Validação de variáveis de ambiente críticas
 */
function validateEnvironment() {
  const requiredVars = ['JWT_SECRET'];
  const missingVars = [];

  if (process.env.NODE_ENV === 'production') {
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    });

    if (missingVars.length > 0) {
      console.error('❌ FATAL ERROR: Missing required environment variables in production:');
      missingVars.forEach(v => console.error(`   - ${v}`));
      console.error('\nPlease set these variables in your .env file or environment.');
      process.exit(1);
    }
  }

  // Warning para desenvolvimento
  if (process.env.NODE_ENV !== 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('your-super-secret')) {
      console.warn('⚠️  WARNING: Using default/weak JWT_SECRET (development only)');
      console.warn('   Generate strong secret: openssl rand -base64 32');
    }
  }
}

// Validar ambiente antes de iniciar
validateEnvironment();

const PORT = process.env.PORT || 3333;
const HOST = process.env.HOST || 'localhost';

// Exportar o servidor para o Vercel (serverless)
module.exports = server;

// Se não estiver rodando no Vercel, iniciar o servidor normalmente
if (require.main === module) {
  server.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 MindEase Backend Mock - JSON Server');
    console.log('='.repeat(50));
    console.log(`🔗 Servidor rodando em: http://${HOST}:${PORT}`);
    console.log(`📡 API Base URL:        http://${HOST}:${PORT}/api/v1`);
    console.log(`💚 Health Check:        http://${HOST}:${PORT}/health`);
    console.log(`💾 Database:            ${path.join(__dirname, 'db.json')}`);
    console.log(`🌍 Environment:         ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
    console.log('⏹️  Use Ctrl+C para parar o servidor');
    console.log('📋 Logs de requisições aparecerão abaixo:\n');
  });
}

// ========================================
// TRATAMENTO DE ERROS
// ========================================

/**
 * Capturar erros não tratados
 */
process.on('uncaughtException', (err) => {
  console.error('❌ Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

/**
 * Graceful shutdown
 */
process.on('SIGINT', () => {
  console.log('\n��� Encerrando servidor...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n��� Encerrando servidor...');
  process.exit(0);
});

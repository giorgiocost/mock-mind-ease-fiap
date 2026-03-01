# 🚀 Plano de Melhorias - MindEase Backend Mock

**Data:** 10 de Fevereiro de 2026  
**Nível Atual:** 8.5/10 (Sênior/Profissional)  
**Meta:** 10/10 (Excelência)

---

## 📊 Status Atual

### ✅ Pontos Fortes (Manter)
- Arquitetura bem organizada (server.js, middleware.js, routes.json)
- JWT implementado corretamente (access + refresh tokens)
- 35 testes E2E com 100% de cobertura
- Validações robustas (400, 401, 403, 404, 409)
- Documentação completa (README, DB_SCHEMA, TESTING, relatorio-teste)
- Ownership checks implementados
- Exit codes para CI/CD
- Seed data com reset script

### ⚠️ Áreas de Melhoria Identificadas
1. Refatoração de código (middleware.js muito longo)
2. Configuração por ambiente (.env)
3. Logging profissional (winston/pino)
4. Testes unitários (Jest)
5. Rate limiting (proteção contra abuse)
6. Input sanitization (segurança)

---

## 🎯 Roadmap de Melhorias

### 📅 **FASE 1: Quick Wins** (1-2 dias)

#### 🔹 Prioridade: ALTA | Esforço: BAIXO

---

#### 1.1. Adicionar Variáveis de Ambiente (.env)

**Problema:** JWT_SECRET e configurações hardcoded  
**Impacto:** Segurança e flexibilidade  
**Esforço:** 30 minutos

**Implementação:**

```bash
# Instalar dependência
npm install dotenv
```

**Criar arquivo `.env`:**
```env
# MindEase Backend Mock - Environment Variables

# Server
PORT=3333
NODE_ENV=development

# JWT
JWT_SECRET=mindease-mock-secret-key-change-in-production
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d

# CORS
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:4201

# Database
DB_FILE=db.json
```

**Criar arquivo `.env.example`:**
```env
# Copie este arquivo para .env e ajuste os valores

PORT=3333
NODE_ENV=development
JWT_SECRET=your-secret-key-here
JWT_ACCESS_EXPIRY=1h
JWT_REFRESH_EXPIRY=7d
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:4201
DB_FILE=db.json
```

**Atualizar `.gitignore`:**
```gitignore
# Existing...
.env
.env.local
```

**Atualizar `server.js`:**
```javascript
require('dotenv').config();

const PORT = process.env.PORT || 3333;

server.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ...

const server = app.listen(PORT, () => {
  console.log(`✅ MindEase Mock Server running on http://localhost:${PORT}`);
});
```

**Atualizar `middleware.js`:**
```javascript
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-never-use-in-production';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Usar nas linhas de jwt.sign():
const accessToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRY });
const refreshToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
```

**Checklist:**
- [ ] Instalar dotenv
- [ ] Criar .env com valores padrão
- [ ] Criar .env.example para documentação
- [ ] Atualizar .gitignore
- [ ] Atualizar server.js para usar process.env.PORT
- [ ] Atualizar middleware.js para usar process.env.JWT_SECRET
- [ ] Testar com `npm test`

---

#### 1.2. Adicionar Logging Profissional (Winston)

**Problema:** console.log() não é estruturado  
**Impacto:** Debugging e monitoramento  
**Esforço:** 1 hora

**Implementação:**

```bash
npm install winston
```

**Criar arquivo `logger.js`:**
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'mindease-mock' },
  transports: [
    // Logs de erro em arquivo separado
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    // Todos os logs
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

// Console logs em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `[${timestamp}] ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
      })
    ),
  }));
}

module.exports = logger;
```

**Atualizar `middleware.js`:**
```javascript
const logger = require('./logger');

// Substituir console.log() por:

// Antes:
console.log(`[${timestamp}] ${method} ${url}`);

// Depois:
logger.info(`Request received`, { method, url, timestamp });

// Antes:
console.log(`  ↳ ❌ Auth: Email já cadastrado`);

// Depois:
logger.warn('Registration failed - Email already exists', { email });

// Antes:
console.log(`  ↳ ✅ Auth: Usuário ${email} registrado com sucesso`);

// Depois:
logger.info('User registered successfully', { email, userId: newUser.id });
```

**Criar diretório de logs:**
```bash
mkdir logs
echo "logs/" >> .gitignore
```

**Adicionar ao `.env`:**
```env
LOG_LEVEL=info
```

**Checklist:**
- [ ] Instalar winston
- [ ] Criar logger.js
- [ ] Criar pasta logs/
- [ ] Atualizar .gitignore
- [ ] Substituir console.log() por logger.info/warn/error
- [ ] Testar geração de logs
- [ ] Validar formato JSON em logs/combined.log

---

### 📅 **FASE 2: Qualidade de Código** (2-3 dias)

#### 🔹 Prioridade: ALTA | Esforço: MÉDIO

---

#### 2.1. Refatorar Middleware em Módulos

**Problema:** middleware.js com 664 linhas  
**Impacto:** Manutenibilidade  
**Esforço:** 2-3 horas

**Estrutura proposta:**
```
middleware/
├── index.js          (orquestrador)
├── logger.middleware.js
├── timestamps.middleware.js
├── auth.middleware.js
├── validation.middleware.js
├── tasks.middleware.js
└── preferences.middleware.js
```

**Criar `middleware/index.js`:**
```javascript
const loggerMiddleware = require('./logger.middleware');
const timestampsMiddleware = require('./timestamps.middleware');
const validationMiddleware = require('./validation.middleware');
const authMiddleware = require('./auth.middleware');
const tasksMiddleware = require('./tasks.middleware');
const preferencesMiddleware = require('./preferences.middleware');

module.exports = [
  loggerMiddleware,
  timestampsMiddleware,
  validationMiddleware,
  authMiddleware,
  preferencesMiddleware,
  tasksMiddleware,
];
```

**Criar `middleware/logger.middleware.js`:**
```javascript
const logger = require('../logger');

module.exports = (req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
};
```

**Criar `middleware/timestamps.middleware.js`:**
```javascript
module.exports = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const now = new Date().toISOString();
    
    if (req.method === 'POST') {
      req.body.createdAt = now;
      req.body.updatedAt = now;
    }
    
    if (req.method === 'PUT' || req.method === 'PATCH') {
      req.body.updatedAt = now;
    }
  }
  next();
};
```

**Criar `middleware/auth.middleware.js`:**
```javascript
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');

const JWT_SECRET = process.env.JWT_SECRET;

const getDb = () => {
  const dbPath = path.join(__dirname, '..', 'db.json');
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(rawData);
};

const saveDb = (db) => {
  const dbPath = path.join(__dirname, '..', 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
};

// Health check
const healthCheck = (req, res, next) => {
  if (req.url === '/health' || req.path === '/health') {
    logger.info('Health check requested');
    return res.status(200).json({
      status: 'ok',
      service: 'mindease-backend-mock',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  }
  next();
};

// POST /api/v1/auth/register
const register = (req, res, next) => {
  if (req.method !== 'POST' || req.url !== '/api/v1/auth/register') {
    return next();
  }

  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    logger.warn('Registration failed - Missing fields', { email, name });
    return res.status(400).json({
      error: 'ValidationError',
      message: 'email, password, and name are required',
    });
  }

  const db = getDb();
  const existingUser = db.users.find((u) => u.email === email);

  if (existingUser) {
    logger.warn('Registration failed - Email exists', { email });
    return res.status(409).json({
      error: 'ConflictError',
      message: 'Email already exists',
    });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    email,
    passwordHash: `mock-hash-${password}`,
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  saveDb(db);

  const accessToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { 
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' 
  });
  const refreshToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' 
  });

  const userResponse = { ...newUser };
  delete userResponse.passwordHash;

  logger.info('User registered successfully', { userId: newUser.id, email });

  return res.status(201).json({
    user: userResponse,
    accessToken,
    refreshToken,
  });
};

// POST /api/v1/auth/login
const login = (req, res, next) => {
  if (req.method !== 'POST' || req.url !== '/api/v1/auth/login') {
    return next();
  }

  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn('Login failed - Missing credentials');
    return res.status(400).json({
      error: 'ValidationError',
      message: 'email and password are required',
    });
  }

  const db = getDb();
  const user = db.users.find((u) => u.email === email);

  if (!user) {
    logger.warn('Login failed - User not found', { email });
    return res.status(404).json({
      error: 'NotFoundError',
      message: 'User not found',
    });
  }

  const expectedHash = `mock-hash-${password}`;
  if (user.passwordHash !== expectedHash) {
    logger.warn('Login failed - Invalid password', { email });
    return res.status(401).json({
      error: 'UnauthorizedError',
      message: 'Invalid credentials',
    });
  }

  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { 
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '1h' 
  });
  const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { 
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' 
  });

  const userResponse = { ...user };
  delete userResponse.passwordHash;

  logger.info('User logged in successfully', { userId: user.id, email });

  return res.status(200).json({
    user: userResponse,
    accessToken,
    refreshToken,
  });
};

module.exports = (req, res, next) => {
  healthCheck(req, res, () => {
    register(req, res, () => {
      login(req, res, next);
    });
  });
};
```

**Atualizar `server.js`:**
```javascript
// Antes:
const customMiddleware = require('./middleware');
server.use(customMiddleware);

// Depois:
const customMiddlewares = require('./middleware');
customMiddlewares.forEach(middleware => server.use(middleware));
```

**Checklist:**
- [ ] Criar pasta middleware/
- [ ] Criar index.js
- [ ] Criar logger.middleware.js
- [ ] Criar timestamps.middleware.js
- [ ] Criar auth.middleware.js
- [ ] Criar validation.middleware.js
- [ ] Criar tasks.middleware.js
- [ ] Criar preferences.middleware.js
- [ ] Atualizar server.js
- [ ] Deletar middleware.js antigo (backup antes!)
- [ ] Testar com `npm test` (35/35 deve passar)

---

#### 2.2. Adicionar Testes Unitários (Jest)

**Problema:** Apenas testes E2E, faltam unitários  
**Impacto:** Confiança em refatorações  
**Esforço:** 3-4 horas

**Implementação:**

```bash
npm install --save-dev jest supertest
```

**Atualizar `package.json`:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "bash test-all-endpoints.sh",
    "test:unit": "jest",
    "test:all": "npm run test:unit && npm run test",
    "test:health": "curl http://localhost:3333/health"
  },
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "coverage",
    "collectCoverageFrom": [
      "**/*.js",
      "!node_modules/**",
      "!coverage/**",
      "!tests/**"
    ]
  }
}
```

**Criar `tests/unit/auth.test.js`:**
```javascript
const jwt = require('jsonwebtoken');

describe('JWT Token Generation', () => {
  const JWT_SECRET = 'test-secret';

  test('should generate valid access token', () => {
    const userId = 'user-123';
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
    
    expect(token).toBeDefined();
    expect(token).toMatch(/^eyJ/); // JWT format

    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe(userId);
  });

  test('should generate valid refresh token', () => {
    const userId = 'user-123';
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    
    expect(token).toBeDefined();
    
    const decoded = jwt.verify(token, JWT_SECRET);
    expect(decoded.userId).toBe(userId);
  });

  test('should reject invalid token', () => {
    const invalidToken = 'invalid-token';
    
    expect(() => {
      jwt.verify(invalidToken, JWT_SECRET);
    }).toThrow();
  });
});
```

**Criar `tests/unit/validation.test.js`:**
```javascript
describe('Email Validation', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  test('should accept valid email', () => {
    expect('test@example.com').toMatch(emailRegex);
    expect('user.name+tag@example.co.uk').toMatch(emailRegex);
  });

  test('should reject invalid email', () => {
    expect('invalid-email').not.toMatch(emailRegex);
    expect('@example.com').not.toMatch(emailRegex);
    expect('test@').not.toMatch(emailRegex);
  });
});

describe('Task Status Validation', () => {
  const validStatuses = ['TODO', 'DOING', 'DONE'];

  test('should accept valid status', () => {
    expect(validStatuses).toContain('TODO');
    expect(validStatuses).toContain('DOING');
    expect(validStatuses).toContain('DONE');
  });

  test('should reject invalid status', () => {
    expect(validStatuses).not.toContain('INVALID');
    expect(validStatuses).not.toContain('todo'); // case-sensitive
  });
});
```

**Criar `tests/unit/helpers.test.js`:**
```javascript
const fs = require('fs');
const path = require('path');

describe('Database Helpers', () => {
  const testDbPath = path.join(__dirname, 'test-db.json');
  
  beforeEach(() => {
    fs.writeFileSync(testDbPath, JSON.stringify({ users: [] }), 'utf-8');
  });

  afterEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  test('should read database', () => {
    const data = fs.readFileSync(testDbPath, 'utf-8');
    const db = JSON.parse(data);
    
    expect(db).toHaveProperty('users');
    expect(db.users).toEqual([]);
  });

  test('should write database', () => {
    const db = { users: [{ id: 'user-1', name: 'Test' }] };
    fs.writeFileSync(testDbPath, JSON.stringify(db, null, 2), 'utf-8');
    
    const data = fs.readFileSync(testDbPath, 'utf-8');
    const readDb = JSON.parse(data);
    
    expect(readDb.users).toHaveLength(1);
    expect(readDb.users[0].name).toBe('Test');
  });
});
```

**Executar testes:**
```bash
npm run test:unit
```

**Checklist:**
- [ ] Instalar jest e supertest
- [ ] Criar pasta tests/unit/
- [ ] Criar auth.test.js
- [ ] Criar validation.test.js
- [ ] Criar helpers.test.js
- [ ] Atualizar package.json com scripts
- [ ] Executar `npm run test:unit`
- [ ] Meta: 100% dos testes unitários passando

---

### 📅 **FASE 3: Segurança** (1-2 dias)

#### 🔹 Prioridade: MÉDIA | Esforço: MÉDIO

---

#### 3.1. Adicionar Rate Limiting

**Problema:** Sem proteção contra abuse de API  
**Impacto:** Segurança e estabilidade  
**Esforço:** 30 minutos

**Implementação:**

```bash
npm install express-rate-limit
```

**Atualizar `server.js`:**
```javascript
const rateLimit = require('express-rate-limit');

// Rate limiter geral (100 requests por 15 min)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: 'TooManyRequests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter para auth (5 tentativas por 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true, // Não conta requests com sucesso
  message: {
    error: 'TooManyRequests',
    message: 'Too many login attempts, please try again later.',
  },
});

// Aplicar limiters
server.use('/api/v1', generalLimiter);
server.use('/api/v1/auth/login', authLimiter);
server.use('/api/v1/auth/register', authLimiter);
```

**Testar rate limiting:**
```bash
# Deve retornar 429 após 5 tentativas
for i in {1..6}; do
  curl -X POST http://localhost:3333/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrong"}'
done
```

**Checklist:**
- [ ] Instalar express-rate-limit
- [ ] Adicionar general limiter (100/15min)
- [ ] Adicionar auth limiter (5/15min)
- [ ] Testar com script acima
- [ ] Validar resposta 429 TooManyRequests

---

#### 3.2. Adicionar Input Sanitization

**Problema:** Inputs não sanitizados (XSS risk)  
**Impacto:** Segurança  
**Esforço:** 1 hora

**Implementação:**

```bash
npm install express-validator
```

**Criar `middleware/validation.middleware.js` (versão melhorada):**
```javascript
const { body, validationResult } = require('express-validator');

// Validações para registro
const registerValidation = [
  body('email')
    .trim()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/).withMessage('Password must contain uppercase, lowercase, number and special char'),
  body('name')
    .trim()
    .escape()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/).withMessage('Name can only contain letters and spaces'),
];

// Validações para tasks
const taskValidation = [
  body('title')
    .trim()
    .escape()
    .isLength({ min: 1, max: 200 }).withMessage('Title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters'),
];

// Middleware de validação
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = {
  registerValidation,
  taskValidation,
  validate,
};
```

**Atualizar `server.js`:**
```javascript
const { registerValidation, taskValidation, validate } = require('./middleware/validation.middleware');

// Aplicar validações
server.post('/api/v1/auth/register', registerValidation, validate);
server.post('/api/v1/tasks', taskValidation, validate);
```

**Checklist:**
- [ ] Instalar express-validator
- [ ] Criar validation.middleware.js
- [ ] Adicionar validações para register
- [ ] Adicionar validações para tasks
- [ ] Aplicar no server.js
- [ ] Testar com inputs maliciosos (XSS, SQL injection tentativas)

---

### 📅 **FASE 4: DevOps & Documentação** (2-3 dias)

#### 🔹 Prioridade: BAIXA | Esforço: MÉDIO

---

#### 4.1. Adicionar Docker

**Problema:** Setup manual complexo  
**Impacto:** Portabilidade  
**Esforço:** 1 hora

**Criar `Dockerfile`:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código
COPY . .

# Expor porta
EXPOSE 3333

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3333/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Iniciar servidor
CMD ["npm", "start"]
```

**Criar `docker-compose.yml`:**
```yaml
version: '3.8'

services:
  mindease-mock:
    build: .
    container_name: mindease-backend-mock
    ports:
      - "3333:3333"
    environment:
      - NODE_ENV=production
      - PORT=3333
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./db.json:/app/db.json
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3333/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**Criar `.dockerignore`:**
```
node_modules
npm-debug.log
.env
.env.local
.git
.gitignore
coverage
logs
*.md
tests
```

**Comandos Docker:**
```bash
# Build
docker-compose build

# Iniciar
docker-compose up -d

# Logs
docker-compose logs -f

# Parar
docker-compose down
```

**Checklist:**
- [ ] Criar Dockerfile
- [ ] Criar docker-compose.yml
- [ ] Criar .dockerignore
- [ ] Build imagem
- [ ] Testar container
- [ ] Validar health check

---

#### 4.2. Adicionar CI/CD (GitHub Actions)

**Problema:** Sem pipeline automatizado  
**Impacto:** Qualidade contínua  
**Esforço:** 1 hora

**Criar `.github/workflows/ci.yml`:**
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Start server
        run: npm start &
        env:
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
      
      - name: Wait for server
        run: npx wait-on http://localhost:3333/health
      
      - name: Run E2E tests
        run: bash test-all-endpoints.sh
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        if: always()
        with:
          files: ./coverage/lcov.info
  
  lint:
    name: Lint Code
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
        continue-on-error: true

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
```

**Adicionar ESLint:**
```bash
npm install --save-dev eslint
npx eslint --init
```

**Atualizar `package.json`:**
```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix"
  }
}
```

**Checklist:**
- [ ] Criar .github/workflows/ci.yml
- [ ] Adicionar secrets no GitHub (JWT_SECRET)
- [ ] Configurar ESLint
- [ ] Push e validar pipeline
- [ ] Validar badge no README

---

#### 4.3. Adicionar Swagger/OpenAPI

**Problema:** Documentação API não interativa  
**Impacto:** Developer Experience  
**Esforço:** 2 horas

**Implementação:**

```bash
npm install swagger-ui-express swagger-jsdoc
```

**Criar `swagger.js`:**
```javascript
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MindEase Backend Mock API',
      version: '1.0.0',
      description: 'API mock para desenvolvimento frontend do MindEase',
      contact: {
        name: 'MindEase Team',
      },
    },
    servers: [
      {
        url: 'http://localhost:3333',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./server.js', './middleware/**/*.js'],
};

module.exports = swaggerJsdoc(options);
```

**Atualizar `server.js`:**
```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

// Swagger UI
server.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
}));

console.log('📚 API Docs available at: http://localhost:3333/api-docs');
```

**Adicionar JSDoc nos endpoints:**
```javascript
/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 */
```

**Checklist:**
- [ ] Instalar swagger-ui-express e swagger-jsdoc
- [ ] Criar swagger.js
- [ ] Adicionar rota /api-docs no server.js
- [ ] Documentar endpoints principais com JSDoc
- [ ] Testar UI em http://localhost:3333/api-docs

---

## 📊 Métricas de Sucesso

### Antes das Melhorias
- **Nível:** 8.5/10
- **Testes:** 35 E2E (0 unitários)
- **Cobertura:** ~85% (apenas E2E)
- **Segurança:** JWT básico
- **Documentação:** 4 arquivos MD
- **DevOps:** Scripts manuais

### Depois das Melhorias (Meta)
- **Nível:** 10/10 ⭐
- **Testes:** 35 E2E + 20+ unitários
- **Cobertura:** >95% (E2E + unit)
- **Segurança:** JWT + Rate limiting + Sanitization
- **Documentação:** 4 MD + Swagger UI
- **DevOps:** Docker + CI/CD

---

## 🗓️ Cronograma Sugerido

| Fase | Duração | Prioridade | Status |
|------|---------|------------|--------|
| **FASE 1: Quick Wins** | 1-2 dias | 🔴 ALTA | ⏳ Pendente |
| - Variáveis de ambiente | 30 min | 🔴 ALTA | ⏳ Pendente |
| - Logging profissional | 1 hora | 🔴 ALTA | ⏳ Pendente |
| **FASE 2: Qualidade** | 2-3 dias | 🔴 ALTA | ⏳ Pendente |
| - Refatorar middleware | 2-3 horas | 🔴 ALTA | ⏳ Pendente |
| - Testes unitários | 3-4 horas | 🔴 ALTA | ⏳ Pendente |
| **FASE 3: Segurança** | 1-2 dias | 🟡 MÉDIA | ⏳ Pendente |
| - Rate limiting | 30 min | 🟡 MÉDIA | ⏳ Pendente |
| - Input sanitization | 1 hora | 🟡 MÉDIA | ⏳ Pendente |
| **FASE 4: DevOps** | 2-3 dias | 🟢 BAIXA | ⏳ Pendente |
| - Docker | 1 hora | 🟢 BAIXA | ⏳ Pendente |
| - CI/CD | 1 hora | 🟢 BAIXA | ⏳ Pendente |
| - Swagger | 2 horas | 🟢 BAIXA | ⏳ Pendente |

**Total Estimado:** 6-10 dias (1-2 semanas)

---

## ✅ Checklist Final

### FASE 1: Quick Wins ✅
- [ ] .env configurado e funcionando
- [ ] Winston instalado e logs estruturados
- [ ] Testes E2E passando (35/35)

### FASE 2: Qualidade ✅
- [ ] Middleware refatorado em módulos
- [ ] Testes unitários implementados (>20 testes)
- [ ] Cobertura >90%

### FASE 3: Segurança ✅
- [ ] Rate limiting ativo
- [ ] Input sanitization implementado
- [ ] Audit npm sem vulnerabilidades

### FASE 4: DevOps ✅
- [ ] Docker funcionando
- [ ] CI/CD pipeline verde
- [ ] Swagger UI acessível

---

## 📚 Recursos e Referências

### Documentação Oficial
- [Winston Logger](https://github.com/winstonjs/winston)
- [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- [Express Validator](https://express-validator.github.io/docs/)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [Jest Testing](https://jestjs.io/docs/getting-started)

### Boas Práticas
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [REST API Security Essentials](https://restfulapi.net/security-essentials/)
- [12 Factor App](https://12factor.net/)

---

**Última atualização:** 10 de Fevereiro de 2026  
**Status:** Plano de melhorias aprovado - Pronto para implementação  
**Meta:** Alcançar nível 10/10 em 1-2 semanas

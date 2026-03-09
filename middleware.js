/**
 * Middlewares Customizados para JSON Server
 * MindEase Backend Mock
 * 
 * Funcionalidades:
 * 1. Logging de requisições
 * 2. Timestamps automáticos (createdAt/updatedAt)
 * 3. Mock de autenticação Bearer token
 * 4. Validação básica de campos obrigatórios
 * 5. Health check endpoint
 * 6. Endpoints de preferências (GET/PUT /api/v1/preferences)
 */

const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURAÇÃO DE JWT
// ========================================

/**
 * JWT Secret com validação de segurança
 * - Em produção: JWT_SECRET deve estar definido no .env
 * - Em desenvolvimento: usa fallback com warning
 */
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('❌ FATAL: JWT_SECRET is required in production environment!');
  }
  console.warn('⚠️  WARNING: Using default JWT_SECRET (development only)');
  return 'mindease-development-secret-key-not-for-production';
})();

const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '1h';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Helper para ler db.json
const getDb = () => {
  const dbPath = path.join(__dirname, 'db.json');
  const rawData = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(rawData);
};

// Helper para salvar db.json
const saveDb = (db) => {
  const dbPath = path.join(__dirname, 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
};

module.exports = (routerDb) => (req, res, next) => {
  // ==========================================
  // 1. LOGGING DE REQUISIÇÕES
  // ==========================================
  const timestamp = new Date().toISOString();
  const method = req.method.padEnd(7, ' ');
  const url = req.url;

  console.log(`[${timestamp}] ${method} ${url}`);

  // ==========================================
  // 2. TIMESTAMPS AUTOMÁTICOS
  // ==========================================
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const now = new Date().toISOString();

    if (req.method === 'POST') {
      req.body.createdAt = now;
      req.body.updatedAt = now;
      console.log(`  ↳ ��� Timestamps adicionados: createdAt, updatedAt`);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      req.body.updatedAt = now;
      console.log(`  ↳ ��� Timestamp atualizado: updatedAt`);
    }
  }

  // ==========================================
  // 3. MOCK DE AUTENTICAÇÃO (Bearer Token)
  // ==========================================
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    // Mock: aceita qualquer token (sem validação real)
    // Em produção, usaria JWT verify aqui
    req.userId = 'mock-user-id-123';
    req.userEmail = 'mock@example.com';

    console.log(`  ↳ ��� Auth: Token recebido (mock userId: ${req.userId})`);
  }

  // ==========================================
  // 4. VALIDAÇÃO BÁSICA DE CAMPOS
  // ==========================================
  if (req.method === 'POST' && req.body) {
    const path = req.path || req.url;

    // Validar users
    if (path.includes('/users')) {
      if (!req.body.email || !req.body.name) {
        console.log(`  ↳ ❌ Validação: email e name são obrigatórios`);
        return res.status(400).json({
          error: 'Validation Error',
          message: 'email and name are required',
          fields: {
            email: req.body.email ? 'ok' : 'missing',
            name: req.body.name ? 'ok' : 'missing'
          }
        });
      }

      // Validar formato de email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        console.log(`  ↳ ❌ Validação: formato de email inválido`);
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Invalid email format'
        });
      }

      console.log(`  ↳ ✅ Validação: user OK`);
    }

    // Validar tasks (mas não /move)
    if (path.includes('/tasks') && !path.includes('/move')) {
      if (!req.body.title || req.body.title.trim() === '') {
        console.log(`  ↳ ❌ Validação: title é obrigatório`);
        return res.status(400).json({
          error: 'Validation Error',
          message: 'title is required and cannot be empty'
        });
      }

      console.log(`  ↳ ✅ Validação: task OK`);
    }

    // Validar preferences
    if (path.includes('/preferences')) {
      // Validar ranges numéricos
      if (req.body.fontScale !== undefined) {
        const fontScale = parseFloat(req.body.fontScale);
        if (isNaN(fontScale) || fontScale < 0.9 || fontScale > 1.4) {
          console.log(`  ↳ ❌ Validação: fontScale fora do range`);
          return res.status(400).json({
            error: 'Validation Error',
            message: 'fontScale must be between 0.9 and 1.4'
          });
        }
      }

      if (req.body.spacingScale !== undefined) {
        const spacingScale = parseFloat(req.body.spacingScale);
        if (isNaN(spacingScale) || spacingScale < 0.9 || spacingScale > 1.4) {
          console.log(`  ↳ ❌ Validação: spacingScale fora do range`);
          return res.status(400).json({
            error: 'Validation Error',
            message: 'spacingScale must be between 0.9 and 1.4'
          });
        }
      }

      if (req.body.alertThresholdMinutes !== undefined) {
        const threshold = parseInt(req.body.alertThresholdMinutes);
        if (isNaN(threshold) || threshold < 10 || threshold > 180) {
          console.log(`  ↳ ❌ Validação: alertThresholdMinutes fora do range`);
          return res.status(400).json({
            error: 'Validation Error',
            message: 'alertThresholdMinutes must be between 10 and 180'
          });
        }
      }
    }
  }

  // ==========================================
  // 5. HEALTH CHECK ENDPOINT
  // ==========================================
  if (req.url === '/health' || req.path === '/health') {
    console.log(`  ↳ ��� Health check solicitado`);
    return res.status(200).json({
      status: 'ok',
      service: 'mindease-backend-mock',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      endpoints: {
        base: '/api/v1',
        health: '/health'
      }
    });
  }

  // ==========================================
  // 6. AUTH ENDPOINTS
  // ==========================================

  /**
   * @swagger
   * /auth/register:
   *   post:
   *     summary: Register a new user
   *     description: Creates a new user account with email, password, and name. Returns JWT access and refresh tokens.
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserRegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Validation error or email already exists
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // POST /api/v1/auth/register
  if (req.method === 'POST' && req.url === '/api/v1/auth/register') {
    const { email, password, name } = req.body;

    // Validação
    if (!email || !password || !name) {
      console.log(`  ↳ ❌ Auth: Campos obrigatórios ausentes`);
      return res.status(400).json({
        error: 'ValidationError',
        message: 'email, password, and name are required',
      });
    }

    const db = getDb();

    // Verificar se email já existe
    const existingUser = db.users.find((u) => u.email === email);
    if (existingUser) {
      console.log(`  ↳ ❌ Auth: Email já cadastrado`);
      return res.status(409).json({
        error: 'ConflictError',
        message: 'Email already exists',
      });
    }

    // Criar novo usuário
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      passwordHash: `mock-hash-${password}`, // Mock de bcrypt
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    saveDb(db);

    // Gerar tokens JWT
    const accessToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

    // Resposta (sem retornar passwordHash)
    const userResponse = { ...newUser };
    delete userResponse.passwordHash;

    console.log(`  ↳ ✅ Auth: Usuário ${email} registrado com sucesso`);
    return res.status(201).json({
      user: userResponse,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  /**
   * @swagger
   * /auth/login:
   *   post:
   *     summary: Login with email and password
   *     description: Authenticates a user and returns JWT access and refresh tokens.
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserLoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       400:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // POST /api/v1/auth/login
  if (req.method === 'POST' && req.url === '/api/v1/auth/login') {
    const { email, password } = req.body;

    // Validação
    if (!email || !password) {
      console.log(`  ↳ ❌ Auth: Email ou senha ausentes`);
      return res.status(400).json({
        error: 'ValidationError',
        message: 'email and password are required',
      });
    }

    const db = getDb();

    // Buscar usuário
    const user = db.users.find((u) => u.email === email);
    if (!user) {
      console.log(`  ↳ ❌ Auth: Usuário não encontrado`);
      return res.status(404).json({
        error: 'NotFoundError',
        message: 'User not found',
      });
    }

    // Verificar senha (mock - apenas checa se existe)
    const expectedHash = `mock-hash-${password}`;
    if (user.passwordHash !== expectedHash) {
      console.log(`  ↳ ❌ Auth: Senha incorreta`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid credentials',
      });
    }

    // Gerar tokens JWT
    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    // Resposta
    const userResponse = { ...user };
    delete userResponse.passwordHash;

    console.log(`  ↳ ✅ Auth: Login realizado com sucesso para ${email}`);
    return res.status(200).json({
      user: userResponse,
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  }

  // ==========================================
  // 7. PREFERENCES ENDPOINTS
  // ==========================================

  /**
   * @swagger
   * /preferences:
   *   get:
   *     summary: Get user preferences
   *     description: Retrieves the authenticated user's cognitive accessibility preferences.
   *     tags: [Preferences]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Preferences retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Preferences'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Preferences not found for this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // GET /api/v1/preferences
  if (req.method === 'GET' && req.url === '/api/v1/preferences') {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`  ↳ ❌ Preferences: Auth header ausente ou inválido`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = getDb();

      // Buscar preferências do usuário
      let preferences = db.preferences.find(p => p.userId === decoded.userId);

      // Se não existir, criar com defaults
      if (!preferences) {
        console.log(`  ↳ ⚙️  Preferences: Criando com defaults para userId ${decoded.userId}`);
        preferences = {
          id: `pref-${Date.now()}`,
          userId: decoded.userId,
          uiDensity: 'medium',
          focusMode: false,
          contentMode: 'detailed',
          contrast: 'normal',
          fontScale: 1.0,
          spacingScale: 1.0,
          motion: 'full',
          timersEnabled: true,
          breakReminders: true,
          alertThresholdMinutes: 25,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        db.preferences.push(preferences);
        saveDb(db);
      } else {
        console.log(`  ↳ ⚙️  Preferences: Retornando preferências existentes`);
      }

      return res.status(200).json(preferences);
    } catch (error) {
      console.log(`  ↳ ❌ Preferences: Token inválido ou expirado`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired token',
      });
    }
  }

  /**
   * @swagger
   * /preferences:
   *   put:
   *     summary: Update user preferences
   *     description: Updates the authenticated user's cognitive accessibility preferences. Supports partial updates.
   *     tags: [Preferences]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/PreferencesUpdateRequest'
   *     responses:
   *       200:
   *         description: Preferences updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Preferences'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Preferences not found for this user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // PUT /api/v1/preferences
  if (req.method === 'PUT' && req.url === '/api/v1/preferences') {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`  ↳ ❌ Preferences: Auth header ausente ou inválido`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const db = getDb();

      // Buscar preferências existentes
      let preferences = db.preferences.find(p => p.userId === decoded.userId);

      // Validações básicas (já feitas no middleware de validação, mas reforçando)
      const { fontScale, spacingScale, alertThresholdMinutes } = req.body;

      if (fontScale !== undefined && (fontScale < 0.9 || fontScale > 1.4)) {
        console.log(`  ↳ ❌ Preferences: fontScale fora do range`);
        return res.status(400).json({
          error: 'ValidationError',
          message: 'fontScale must be between 0.9 and 1.4',
        });
      }

      if (spacingScale !== undefined && (spacingScale < 0.9 || spacingScale > 1.4)) {
        console.log(`  ↳ ❌ Preferences: spacingScale fora do range`);
        return res.status(400).json({
          error: 'ValidationError',
          message: 'spacingScale must be between 0.9 and 1.4',
        });
      }

      if (alertThresholdMinutes !== undefined && (alertThresholdMinutes < 10 || alertThresholdMinutes > 180)) {
        console.log(`  ↳ ❌ Preferences: alertThresholdMinutes fora do range`);
        return res.status(400).json({
          error: 'ValidationError',
          message: 'alertThresholdMinutes must be between 10 and 180',
        });
      }

      if (preferences) {
        // Atualizar preferências existentes (partial update)
        console.log(`  ↳ ⚙️  Preferences: Atualizando preferências existentes`);
        const originalCreatedAt = preferences.createdAt;
        preferences = {
          ...preferences,
          ...req.body,
          userId: decoded.userId,  // Garantir que userId não mude
          id: preferences.id,      // Garantir que id não mude
          createdAt: originalCreatedAt, // Preservar createdAt original
          updatedAt: new Date().toISOString(),
        };

        const index = db.preferences.findIndex(p => p.id === preferences.id);
        db.preferences[index] = preferences;
      } else {
        // Criar novas preferências
        console.log(`  ↳ ⚙️  Preferences: Criando com defaults + body`);
        preferences = {
          id: `pref-${Date.now()}`,
          userId: decoded.userId,
          uiDensity: 'medium',
          focusMode: false,
          contentMode: 'detailed',
          contrast: 'normal',
          fontScale: 1.0,
          spacingScale: 1.0,
          motion: 'full',
          timersEnabled: true,
          breakReminders: true,
          alertThresholdMinutes: 25,
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        db.preferences.push(preferences);
      }

      saveDb(db);
      return res.status(200).json(preferences);
    } catch (error) {
      console.log(`  ↳ ❌ Preferences: Token inválido ou expirado`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired token',
      });
    }
  }

  // ==========================================
  // 8. TASKS ENDPOINTS
  // ==========================================

  /**
   * @swagger
   * /tasks:
   *   post:
   *     summary: Create a new task
   *     description: Creates a new task in the Kanban board (TODO, DOING, or DONE).
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskCreateRequest'
   *     responses:
   *       201:
   *         description: Task created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Validation error - missing or invalid fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // POST /api/v1/tasks - Criar task
  if (req.method === 'POST' && req.url === '/api/v1/tasks') {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`  ↳ ❌ Tasks: Auth header ausente ou inválido`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);

      // Validar campos obrigatórios
      if (!req.body.title || req.body.title.trim() === '') {
        console.log(`  ↳ ❌ Tasks: title é obrigatório`);
        return res.status(400).json({
          error: 'ValidationError',
          message: 'title is required',
        });
      }

      // Adicionar userId do token e defaults
      req.body.userId = decoded.userId;
      req.body.status = req.body.status || 'TODO';
      req.body.position = req.body.position !== undefined ? req.body.position : 0;

      console.log(`  ↳ 📝 Creating task for user: ${decoded.userId}`);

      // Deixar JSON Server processar (não fazer return, continuar para next())
    } catch (error) {
      console.log(`  ↳ ❌ Tasks: Token inválido ou expirado`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired token',
      });
    }
  }

  /**
   * @swagger
   * /tasks:
   *   get:
   *     summary: List all tasks
   *     description: Retrieves all tasks for the authenticated user. Supports filtering by status (TODO, DOING, DONE).
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [TODO, DOING, DONE]
   *         description: Filter tasks by status
   *     responses:
   *       200:
   *         description: Tasks retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Task'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // GET /api/v1/tasks - Filtrar tasks por userId
  if (req.method === 'GET' && req.url.startsWith('/api/v1/tasks') && !req.url.includes('/move')) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Adicionar filtro userId à query
        const urlObj = new URL(req.url, `http://localhost:3333`);

        // Se não tiver userId na query, adicionar
        if (!urlObj.searchParams.has('userId')) {
          urlObj.searchParams.set('userId', decoded.userId);
          req.url = urlObj.pathname + urlObj.search;
          console.log(`  ↳ 🔍 Filtering tasks for user: ${decoded.userId}`);
        }
      } catch (error) {
        // Token inválido, deixa passar (JSON Server retornará erro ou vazio)
        console.log(`  ↳ ⚠️  Tasks: Token inválido, listagem sem filtro`);
      }
    }
  }

  /**
   * @swagger
   * /tasks/{id}/move:
   *   post:
   *     summary: Move task to another column
   *     description: Moves a task to a different status column (TODO, DOING, or DONE) and updates its position.
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskMoveRequest'
   *     responses:
   *       200:
   *         description: Task moved successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Validation error - missing or invalid fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - task belongs to another user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // POST /api/v1/tasks/:id/move - Mover task entre colunas
  if (req.method === 'POST' && req.url.match(/^\/api\/v1\/tasks\/[^/]+\/move$/)) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`  ↳ ❌ Tasks: Auth header ausente ou inválido`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const taskIdStr = req.url.split('/')[4]; // Extrair ID da URL
      const taskId = isNaN(taskIdStr) ? taskIdStr : Number(taskIdStr); // Converter para número se possível
      const { toStatus, position } = req.body;

      if (!toStatus) {
        console.log(`  ↳ ❌ Tasks: toStatus é obrigatório`);
        return res.status(400).json({
          error: 'ValidationError',
          message: 'toStatus is required',
        });
      }

      if (!['TODO', 'DOING', 'DONE'].includes(toStatus)) {
        console.log(`  ↳ ❌ Tasks: toStatus inválido`);
        return res.status(400).json({
          error: 'ValidationError',
          message: 'toStatus must be TODO, DOING, or DONE',
        });
      }

      const db = getDb();

      // Buscar task
      const task = db.tasks.find(t => t.id === taskId);

      if (!task) {
        console.log(`  ↳ ❌ Tasks: Task ${taskId} não encontrada`);
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Task not found',
        });
      }

      // Verificar ownership
      if (task.userId !== decoded.userId) {
        console.log(`  ↳ ❌ Tasks: Usuário ${decoded.userId} não possui task ${taskId}`);
        return res.status(403).json({
          error: 'ForbiddenError',
          message: 'You do not own this task',
        });
      }

      // Atualizar status e position
      task.status = toStatus;
      task.position = position !== undefined ? position : task.position;
      task.updatedAt = new Date().toISOString();

      // Salvar
      const index = db.tasks.findIndex(t => t.id === taskId);
      db.tasks[index] = task;
      saveDb(db);

      console.log(`  ↳ ↔️  Task ${taskId} moved to ${toStatus} (position: ${task.position})`);

      return res.status(200).json(task);
    } catch (error) {
      console.log(`  ↳ ❌ Tasks: Token inválido ou expirado`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired token',
      });
    }
  }

  /**
   * @swagger
   * /tasks/{id}:
   *   patch:
   *     summary: Update a task
   *     description: Partially updates a task's properties (title, description, status, position).
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskUpdateRequest'
   *     responses:
   *       200:
   *         description: Task updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       400:
   *         description: Validation error - invalid fields
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ValidationError'
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - task belongs to another user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // PATCH /api/v1/tasks/:id - Ownership check
  if (req.method === 'PATCH' && req.url.match(/^\/api\/v1\/tasks\/[^/]+$/)) {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const taskIdStr = req.url.split('/')[4];
        const taskId = isNaN(taskIdStr) ? taskIdStr : Number(taskIdStr);
        const db = getDb();
        const task = db.tasks.find(t => t.id === taskId);

        if (task && task.userId !== decoded.userId) {
          console.log(`  ↳ ❌ Tasks: Usuário ${decoded.userId} não possui task ${taskId}`);
          return res.status(403).json({
            error: 'ForbiddenError',
            message: 'You do not own this task',
          });
        }

        console.log(`  ↳ ✏️  Updating task ${taskId}`);
      } catch (error) {
        // Token inválido, deixa passar (JSON Server retornará erro)
      }
    }
  }

  /**
   * @swagger
   * /tasks/{id}:
   *   delete:
   *     summary: Delete a task
   *     description: Permanently deletes a task from the Kanban board.
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     responses:
   *       200:
   *         description: Task deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: Task deleted successfully
   *       401:
   *         description: Unauthorized - missing or invalid token
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       403:
   *         description: Forbidden - task belongs to another user
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       404:
   *         description: Task not found
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  // DELETE /api/v1/tasks/:id - Ownership & manual delete
  if (req.method === 'DELETE' && req.url.match(/^\/api\/v1\/tasks\/[^/]+$/)) {
    const authHeader = req.headers.authorization;

    // require bearer token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log(`  ↳ ❌ Tasks: DELETE sem Authorization`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Missing or invalid Authorization header',
      });
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const taskId = req.url.split('/')[4];
      const db = getDb();
      const task = db.tasks.find(t => String(t.id) === String(taskId));

      if (task && task.userId !== decoded.userId) {
        console.log(`  ↳ ❌ Tasks: Usuário ${decoded.userId} não possui task ${taskId}`);
        return res.status(403).json({
          error: 'ForbiddenError',
          message: 'You do not own this task',
        });
      }

      // Manual deletion to avoid JSON Server wiping other tasks
      console.log(`  ↳ 🗑️  Deleting task ${taskId}`);
      // remove item from db and save
      const index = db.tasks.findIndex(t => String(t.id) === String(taskId));
      if (index === -1) {
        // should not happen, but handle gracefully
        return res.status(404).json({
          error: 'NotFoundError',
          message: 'Task not found',
        });
      }
      db.tasks.splice(index, 1);
      saveDb(db);
      routerDb.set('tasks', db.tasks).write();

      // respond and stop middleware chain
      return res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.log(`  ↳ ❌ Tasks: Token inválido na deleção`);
      return res.status(401).json({
        error: 'UnauthorizedError',
        message: 'Invalid or expired token',
      });
    }
  }

  // ==========================================
  // 8. SUBTASKS ENDPOINTS
  // ==========================================

  /**
   * @swagger
   * /tasks/{id}/subtasks:
   *   get:
   *     summary: List subtasks of a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     responses:
   *       200:
   *         description: List of subtasks
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Subtask'
   *       404:
   *         description: Task not found
   */
  // GET /api/v1/tasks/:id/subtasks
  if (req.method === 'GET' && req.url.match(/^\/api\/v1\/tasks\/[^/]+\/subtasks$/)) {
    const taskIdStr = req.url.split('/')[4];
    const taskId = isNaN(taskIdStr) ? taskIdStr : Number(taskIdStr);
    const db = getDb();
    const task = db.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'NotFoundError', message: 'Task not found' });
    }

    console.log(`  ↳ 📋 Subtasks GET: task ${taskId} → ${(task.subtasks || []).length} subtasks`);
    return res.status(200).json(task.subtasks || []);
  }

  /**
   * @swagger
   * /tasks/{id}/subtasks:
   *   post:
   *     summary: Add a subtask to a task
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: Task ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [title]
   *             properties:
   *               title:
   *                 type: string
   *                 example: Revisar código
   *     responses:
   *       201:
   *         description: Subtask created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Subtask'
   *       400:
   *         description: Validation error
   *       404:
   *         description: Task not found
   */
  // POST /api/v1/tasks/:id/subtasks
  if (req.method === 'POST' && req.url.match(/^\/api\/v1\/tasks\/[^/]+\/subtasks$/)) {
    const taskIdStr = req.url.split('/')[4];
    const taskId = isNaN(taskIdStr) ? taskIdStr : Number(taskIdStr);
    const { title } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'ValidationError', message: 'title is required' });
    }

    const db = getDb();
    const task = db.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'NotFoundError', message: 'Task not found' });
    }

    if (!task.subtasks) task.subtasks = [];

    const newSubtask = {
      id: `sub-${taskId}-${Date.now()}`,
      title: title.trim(),
      completed: false
    };

    task.subtasks.push(newSubtask);
    task.updatedAt = new Date().toISOString();
    saveDb(db);
    routerDb.set('tasks', db.tasks).write();

    console.log(`  ↳ ✅ Subtask criada: "${newSubtask.title}" na task ${taskId}`);
    return res.status(201).json(newSubtask);
  }

  /**
   * @swagger
   * /tasks/{id}/subtasks/{subtaskId}:
   *   patch:
   *     summary: Update a subtask (toggle completed, edit title)
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: subtaskId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               completed:
   *                 type: boolean
   *               title:
   *                 type: string
   *     responses:
   *       200:
   *         description: Subtask updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Subtask'
   *       404:
   *         description: Task or subtask not found
   *   delete:
   *     summary: Remove a subtask
   *     tags: [Tasks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *       - in: path
   *         name: subtaskId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Subtask deleted
   *       404:
   *         description: Task or subtask not found
   */
  // PATCH /api/v1/tasks/:id/subtasks/:subtaskId
  if (req.method === 'PATCH' && req.url.match(/^\/api\/v1\/tasks\/[^/]+\/subtasks\/[^/]+$/)) {
    const parts = req.url.split('/');
    const taskIdStr = parts[4];
    const subtaskId = parts[6];
    const taskId = isNaN(taskIdStr) ? taskIdStr : Number(taskIdStr);

    const db = getDb();
    const task = db.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'NotFoundError', message: 'Task not found' });
    }

    const subtask = (task.subtasks || []).find(s => s.id === subtaskId);
    if (!subtask) {
      return res.status(404).json({ error: 'NotFoundError', message: 'Subtask not found' });
    }

    if (req.body.completed !== undefined) subtask.completed = req.body.completed;
    if (req.body.title !== undefined) subtask.title = req.body.title;
    task.updatedAt = new Date().toISOString();
    saveDb(db);
    routerDb.set('tasks', db.tasks).write();

    console.log(`  ↳ ✅ Subtask ${subtaskId} atualizada (completed: ${subtask.completed})`);
    return res.status(200).json(subtask);
  }

  // DELETE /api/v1/tasks/:id/subtasks/:subtaskId
  if (req.method === 'DELETE' && req.url.match(/^\/api\/v1\/tasks\/[^/]+\/subtasks\/[^/]+$/)) {
    const parts = req.url.split('/');
    const taskIdStr = parts[4];
    const subtaskId = parts[6];
    const taskId = isNaN(taskIdStr) ? taskIdStr : Number(taskIdStr);

    const db = getDb();
    const task = db.tasks.find(t => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: 'NotFoundError', message: 'Task not found' });
    }

    const subtaskIndex = (task.subtasks || []).findIndex(s => s.id === subtaskId);
    if (subtaskIndex === -1) {
      return res.status(404).json({ error: 'NotFoundError', message: 'Subtask not found' });
    }

    task.subtasks.splice(subtaskIndex, 1);
    task.updatedAt = new Date().toISOString();
    saveDb(db);
    routerDb.set('tasks', db.tasks).write();

    console.log(`  ↳ 🗑️  Subtask ${subtaskId} removida da task ${taskId}`);
    return res.status(200).json({ message: 'Subtask deleted successfully' });
  }

  // ==========================================
  // CONTINUAR PARA PRÓXIMO MIDDLEWARE
  // ==========================================
  next();
};

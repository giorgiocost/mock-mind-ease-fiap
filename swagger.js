/**
 * Swagger/OpenAPI 3.0 Configuration
 * MindEase Backend Mock API Documentation
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MindEase Backend Mock API',
      version: '2.0.0',
      description: `
# MindEase - Backend Mock API

Backend mock completo para o projeto MindEase - Plataforma de Gestão de Saúde Mental.

## 🎯 Funcionalidades Implementadas

### ✅ Autenticação
- **Register** (POST /auth/register) - Criar nova conta
- **Login** (POST /auth/login) - Autenticar e obter JWT tokens
- Tokens JWT (Access Token: 1h, Refresh Token: 7 dias)

### ⚙️ Preferências de Usuário
- **GET /preferences** - Obter preferências (cria defaults se não existir)
- **PUT /preferences** - Atualizar preferências (partial update)
- Configurações de acessibilidade cognitiva completas

### 📋 Gestão de Tarefas (Kanban)
- **CRUD Completo** de tarefas (TODO, DOING, DONE)
- **Move Task** (POST /tasks/:id/move) - Mover entre colunas
- Filtro automático por usuário autenticado
- Posicionamento customizável nas colunas

### ✅ Subtarefas (Subtasks)
- **GET /tasks/:id/subtasks** - Listar subtasks de uma tarefa
- **POST /tasks/:id/subtasks** - Criar nova subtask
- **PATCH /tasks/:id/subtasks/:subtaskId** - Atualizar (toggle completed, editar título)
- **DELETE /tasks/:id/subtasks/:subtaskId** - Remover subtask
- Armazenamento inline nas tasks

### 🔜 Próximas Funcionalidades
- Focus Sessions (Pomodoro/timers)
- Cognitive Alerts (alertas cognitivos)
- Telemetry Events (rastreamento de eventos)

## 🔐 Como Autenticar

1. **Registre-se** ou faça **Login**:
   - POST \`/api/v1/auth/register\` ou
   - POST \`/api/v1/auth/login\`

2. **Copie o accessToken** da resposta

3. **Clique em "Authorize"** (🔓) no topo desta página

4. **Cole o token** (apenas o token, sem "Bearer"): \`eyJhbGci...\`

5. **Agora você pode testar** todos os endpoints protegidos! 🎉

## 📊 Status do Ambiente

- **Base URL:** http://localhost:3333/api/v1
- **Health Check:** http://localhost:3333/health
- **Versão:** 2.0.0
- **Ambiente:** Development (JSON Server Mock)

## 🧪 Testando a API

Use o botão **"Try it out"** em cada endpoint para testar diretamente pela interface.

## 📝 Exemplos de Uso

### Credenciais de Teste
\`\`\`
Email: daniel@example.com
Senha: Senha@123
\`\`\`
      `,
      contact: {
        name: 'MindEase Development Team',
        url: 'https://github.com/mindease-project',
        email: 'dev@mindease.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3333/api/v1',
        description: 'Development Server - API Endpoints'
      },
      {
        url: 'http://localhost:3333',
        description: 'Development Server - Base (Health Check)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Access Token obtido via /auth/login ou /auth/register. Format: `Bearer <token>`'
        }
      },
      schemas: {
        // ========================================
        // USER SCHEMAS
        // ========================================
        User: {
          type: 'object',
          properties: {
            id: { 
              type: 'string', 
              example: 'user-1770706108857',
              description: 'ID único do usuário'
            },
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'ana.silva@example.com',
              description: 'Email do usuário (único)'
            },
            name: { 
              type: 'string', 
              example: 'Ana Silva',
              description: 'Nome completo do usuário'
            },
            passwordHash: {
              type: 'string',
              example: 'mock-hash-Senha@123',
              description: 'Hash da senha (bcrypt em produção)'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time', 
              example: '2026-02-10T10:00:00.000Z' 
            },
            updatedAt: { 
              type: 'string', 
              format: 'date-time', 
              example: '2026-02-10T10:00:00.000Z' 
            }
          }
        },
        
        UserRegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { 
              type: 'string', 
              example: 'João Silva',
              minLength: 2,
              maxLength: 100
            },
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'joao.silva@example.com' 
            },
            password: { 
              type: 'string', 
              format: 'password', 
              example: 'Senha@123',
              minLength: 6,
              description: 'Senha (mínimo 6 caracteres)'
            }
          }
        },
        
        UserLoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email', 
              example: 'ana.silva@example.com' 
            },
            password: { 
              type: 'string', 
              format: 'password', 
              example: 'Senha@123' 
            }
          }
        },
        
        AuthResponse: {
          type: 'object',
          properties: {
            user: {
              $ref: '#/components/schemas/User',
              description: 'Dados do usuário (sem passwordHash)'
            },
            accessToken: { 
              type: 'string', 
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEiLCJpYXQiOjE3MDcwNjEwOH0...',
              description: 'JWT Access Token (válido por 1h)'
            },
            refreshToken: { 
              type: 'string', 
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c2VyLTEiLCJpYXQiOjE3MDcwNjEwOH0...',
              description: 'JWT Refresh Token (válido por 7 dias)'
            }
          }
        },
        
        // ========================================
        // PREFERENCES SCHEMAS
        // ========================================
        Preferences: {
          type: 'object',
          properties: {
            id: { 
              type: 'string', 
              example: 'pref-1770706116296' 
            },
            userId: { 
              type: 'string', 
              example: 'user-1770706108857',
              description: 'ID do usuário proprietário'
            },
            uiDensity: { 
              type: 'string', 
              enum: ['simple', 'medium', 'full'],
              example: 'medium',
              description: 'Densidade da interface'
            },
            focusMode: { 
              type: 'boolean', 
              example: false,
              description: 'Modo foco ativado'
            },
            contentMode: { 
              type: 'string', 
              enum: ['summary', 'detailed'],
              example: 'detailed',
              description: 'Modo de exibição de conteúdo'
            },
            contrast: { 
              type: 'string', 
              enum: ['low', 'normal', 'high'],
              example: 'normal',
              description: 'Nível de contraste'
            },
            fontScale: { 
              type: 'number', 
              example: 1.0,
              minimum: 0.9,
              maximum: 1.4,
              description: 'Escala da fonte (0.9 - 1.4)'
            },
            spacingScale: { 
              type: 'number', 
              example: 1.0,
              minimum: 0.9,
              maximum: 1.4,
              description: 'Escala de espaçamento (0.9 - 1.4)'
            },
            motion: { 
              type: 'string', 
              enum: ['full', 'reduced', 'off'],
              example: 'full',
              description: 'Animações'
            },
            timersEnabled: { 
              type: 'boolean', 
              example: true,
              description: 'Timers habilitados'
            },
            breakReminders: { 
              type: 'boolean', 
              example: true,
              description: 'Lembretes de pausa'
            },
            alertThresholdMinutes: { 
              type: 'number', 
              example: 25,
              minimum: 10,
              maximum: 180,
              description: 'Limite para alertas cognitivos (minutos)'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time' 
            },
            updatedAt: { 
              type: 'string', 
              format: 'date-time' 
            }
          }
        },
        
        PreferencesUpdateRequest: {
          type: 'object',
          properties: {
            uiDensity: { 
              type: 'string', 
              enum: ['simple', 'medium', 'full']
            },
            focusMode: { 
              type: 'boolean' 
            },
            contentMode: { 
              type: 'string', 
              enum: ['summary', 'detailed']
            },
            contrast: { 
              type: 'string', 
              enum: ['low', 'normal', 'high']
            },
            fontScale: { 
              type: 'number',
              minimum: 0.9,
              maximum: 1.4
            },
            spacingScale: { 
              type: 'number',
              minimum: 0.9,
              maximum: 1.4
            },
            motion: { 
              type: 'string', 
              enum: ['full', 'reduced', 'off']
            },
            timersEnabled: { 
              type: 'boolean' 
            },
            breakReminders: { 
              type: 'boolean' 
            },
            alertThresholdMinutes: { 
              type: 'number',
              minimum: 10,
              maximum: 180
            }
          }
        },
        
        // ========================================
        // TASK SCHEMAS
        // ========================================
        Task: {
          type: 'object',
          properties: {
            id: { 
              type: 'string', 
              example: 'task-123',
              description: 'ID único da tarefa'
            },
            userId: { 
              type: 'string', 
              example: 'user-001',
              description: 'ID do usuário dono'
            },
            title: { 
              type: 'string', 
              example: 'Meditar por 10 minutos',
              description: 'Título da tarefa'
            },
            description: { 
              type: 'string', 
              example: 'Meditação guiada matinal',
              description: 'Descrição opcional'
            },
            status: { 
              type: 'string', 
              enum: ['TODO', 'DOING', 'DONE'],
              example: 'TODO',
              description: 'Status da tarefa'
            },
            position: { 
              type: 'number', 
              example: 0,
              description: 'Posição na coluna do Kanban'
            },
            createdAt: { 
              type: 'string', 
              format: 'date-time' 
            },
            updatedAt: { 
              type: 'string', 
              format: 'date-time' 
            },
            subtasks: {
              type: 'array',
              description: 'Lista de subtarefas',
              items: { $ref: '#/components/schemas/Subtask' }
            }
          }
        },
        
        Subtask: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'sub-17-1' },
            title: { type: 'string', example: 'Revisar código' },
            completed: { type: 'boolean', example: false }
          }
        },
        
        TaskCreateRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { 
              type: 'string', 
              example: 'Revisar documentação',
              minLength: 1,
              maxLength: 200
            },
            description: { 
              type: 'string', 
              example: 'Revisar README.md e atualizar instruções',
              maxLength: 2000
            },
            status: { 
              type: 'string', 
              enum: ['TODO', 'DOING', 'DONE'],
              default: 'TODO'
            },
            position: { 
              type: 'number',
              example: 0
            }
          }
        },
        
        TaskUpdateRequest: {
          type: 'object',
          properties: {
            title: { 
              type: 'string',
              minLength: 1,
              maxLength: 200
            },
            description: { 
              type: 'string',
              maxLength: 2000
            },
            status: { 
              type: 'string', 
              enum: ['TODO', 'DOING', 'DONE']
            },
            position: { 
              type: 'number'
            }
          }
        },
        
        TaskMoveRequest: {
          type: 'object',
          required: ['toStatus', 'position'],
          properties: {
            toStatus: {
              type: 'string',
              enum: ['TODO', 'DOING', 'DONE'],
              example: 'DOING',
              description: 'Status de destino'
            },
            position: {
              type: 'number',
              example: 0,
              description: 'Posição na nova coluna'
            }
          }
        },
        
        // ========================================
        // ERROR SCHEMAS
        // ========================================
        Error: {
          type: 'object',
          properties: {
            error: { 
              type: 'string', 
              example: 'UnauthorizedError',
              description: 'Tipo do erro'
            },
            message: { 
              type: 'string', 
              example: 'Missing or invalid Authorization header',
              description: 'Mensagem descritiva do erro'
            }
          }
        },
        
        ValidationError: {
          type: 'object',
          properties: {
            error: { 
              type: 'string', 
              example: 'ValidationError' 
            },
            message: { 
              type: 'string', 
              example: 'Campo obrigatório ausente: title' 
            },
            field: {
              type: 'string',
              example: 'title',
              description: 'Campo que falhou na validação'
            }
          }
        },
        
        // ========================================
        // HEALTH CHECK SCHEMA
        // ========================================
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'ok',
              description: 'Status do servidor'
            },
            service: {
              type: 'string',
              example: 'mindease-backend-mock'
            },
            version: {
              type: 'string',
              example: '1.0.0'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            },
            uptime: {
              type: 'number',
              example: 123.456,
              description: 'Tempo ativo em segundos'
            },
            endpoints: {
              type: 'object',
              properties: {
                base: { type: 'string', example: '/api/v1' },
                health: { type: 'string', example: '/health' }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check do servidor'
      },
      {
        name: 'Auth',
        description: 'Autenticação e registro de usuários'
      },
      {
        name: 'Preferences',
        description: 'Gerenciamento de preferências do usuário (acessibilidade cognitiva)'
      },
      {
        name: 'Tasks',
        description: 'CRUD de tarefas (Kanban: TODO, DOING, DONE)'
      }
    ]
  },
  apis: ['./custom-middleware.js', './server.js'], // Arquivos com JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

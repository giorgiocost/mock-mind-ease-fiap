# ��� MindEase Backend Mock

Backend mockado usando JSON Server para desenvolvimento frontend do projeto MindEase.

## ��� Pré-requisitos

- **Node.js:** 18+ instalado
- **npm:** 9+

## ��� Instalação

```bash
# Instalar dependências
npm install
```

## ▶️ Como usar

### Iniciar servidor (produção)
```bash
npm start
```

### Iniciar servidor (desenvolvimento com auto-reload)
```bash
npm run dev
```

### Testar health check
```bash
npm test
```

Ou manualmente:
```bash
curl http://localhost:3333/health
```

## ��� Endpoints Disponíveis

**Base URL:** `http://localhost:3333/api/v1`

### Collections (REST automático)

Todas as collections suportam operações CRUD completas:

| Collection | Endpoint | Descrição |
|------------|----------|-----------|
| Users | `/api/v1/users` | Usuários do sistema |
| Preferences | `/api/v1/preferences` | Preferências de acessibilidade |
| Tasks | `/api/v1/tasks` | Tarefas e subtarefas |
| Checklist Items | `/api/v1/checklistItems` | Itens de checklist das tarefas |
| Task Notes | `/api/v1/taskNotes` | Notas das tarefas |
| Focus Sessions | `/api/v1/focusSessions` | Sessões de foco/pomodoro |
| Cognitive Alerts | `/api/v1/cognitiveAlerts` | Alertas cognitivos |
| Telemetry Events | `/api/v1/telemetryEvents` | Eventos de telemetria |

### Operações REST

```bash
# GET - Listar todos
GET /api/v1/users

# GET - Buscar por ID
GET /api/v1/users/1

# POST - Criar novo
POST /api/v1/users
Content-Type: application/json
{
  "name": "João Silva",
  "email": "joao@example.com"
}

# PATCH - Atualizar parcial
PATCH /api/v1/users/1
Content-Type: application/json
{
  "name": "João Silva Updated"
}

# PUT - Substituir completo
PUT /api/v1/users/1
Content-Type: application/json
{
  "name": "João Silva",
  "email": "joao.updated@example.com"
}

# DELETE - Deletar
DELETE /api/v1/users/1
```

### Queries e Filtros

JSON Server suporta queries avançadas:

```bash
# Filtrar por campo
GET /api/v1/tasks?status=DONE

# Filtrar múltiplos
GET /api/v1/tasks?userId=user-001&status=TODO

# Ordenar
GET /api/v1/tasks?_sort=createdAt&_order=desc

# Paginar
GET /api/v1/tasks?_page=1&_limit=10

# Buscar (full-text em todos os campos)
GET /api/v1/tasks?q=urgente

# Operadores
GET /api/v1/tasks?priority_gte=2  # maior ou igual
GET /api/v1/tasks?priority_lte=5  # menor ou igual
GET /api/v1/tasks?title_like=bug  # contém (regex)
```

### Relacionamentos

```bash
# Embed - incluir relacionamentos
GET /api/v1/tasks?_embed=checklistItems

# Expand - expandir referências
GET /api/v1/tasks?_expand=user
```

## ��� Estrutura de Dados

### User
```json
{
  "id": "user-001",
  "email": "usuario@example.com",
  "passwordHash": "hash-mock",
  "name": "Nome do Usuário",
  "createdAt": "2026-02-10T10:00:00.000Z",
  "updatedAt": "2026-02-10T10:00:00.000Z"
}
```

### Task
```json
{
  "id": "task-001",
  "userId": "user-001",
  "title": "Título da tarefa",
  "description": "Descrição detalhada",
  "status": "TODO",
  "priority": 2,
  "position": 0,
  "createdAt": "2026-02-10T10:00:00.000Z",
  "updatedAt": "2026-02-10T10:00:00.000Z"
}
```

Para estruturas completas, ver:
- **Documentação:** `back-end/docs/api-mock/refinamento_tecnico-backend-mockado.md`
- **Tasks:** `back-end/docs/api-mock/tasks/`

## ��� Autenticação

Este é um mock básico. Para autenticação completa (JWT), implementar:
- Task 4: `back-end/docs/api-mock/tasks/task_4_add_auth_endpoints.md`

## ��� Testes

### Teste manual básico

```bash
# 1. Criar um usuário
curl -X POST http://localhost:3333/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com"}'

# 2. Listar usuários
curl http://localhost:3333/api/v1/users

# 3. Atualizar usuário
curl -X PATCH http://localhost:3333/api/v1/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User Updated"}'

# 4. Deletar usuário
curl -X DELETE http://localhost:3333/api/v1/users/1
```

## ��� Estrutura de Arquivos

```
back-end/mock/
├── package.json       # Dependências e scripts
├── server.js          # Servidor JSON Server configurado
├── db.json            # Database (arquivo JSON)
├── .gitignore         # Arquivos ignorados pelo Git
└── README.md          # Este arquivo
```
## 🔐 Environment Variables

Este projeto usa variáveis de ambiente para configuração.

### Setup Inicial

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edite `.env` e configure seus valores:**
   ```env
   JWT_SECRET=your-super-secret-key-minimum-32-characters
   PORT=3333
   NODE_ENV=development
   ```

3. **Inicie o servidor:**
   ```bash
   npm start
   ```

### Variáveis Disponíveis

| Variável | Descrição | Padrão | Obrigatório |
|----------|-----------|--------|-------------|
| `PORT` | Porta do servidor | `3333` | Não |
| `HOST` | Host do servidor | `localhost` | Não |
| `NODE_ENV` | Ambiente de execução | `development` | Não |
| `JWT_SECRET` | Chave de assinatura JWT | - | **Sim (prod)** |
| `JWT_ACCESS_EXPIRY` | Tempo de vida do access token | `1h` | Não |
| `JWT_REFRESH_EXPIRY` | Tempo de vida do refresh token | `7d` | Não |
| `ALLOWED_ORIGINS` | Origens CORS permitidas | `http://localhost:3000` | Não |
| `LOG_LEVEL` | Nível de logging | `info` | Não |
| `DB_FILE` | Arquivo do banco de dados | `db.json` | Não |

### Notas de Segurança

⚠️ **NUNCA commite `.env` no Git!**  
✅ Sempre use `.env.example` como template  
🔒 Gere JWT_SECRET forte: `openssl rand -base64 32`  
🚨 Em produção, `JWT_SECRET` é **obrigatório**

### Exemplos de Uso

```bash
# Desenvolvimento (porta padrão)
npm start

# Desenvolvimento (porta customizada)
PORT=4000 npm start

# Produção (requer JWT_SECRET)
NODE_ENV=production JWT_SECRET=$(openssl rand -base64 32) npm start
```
## ���️ Configurações Avançadas

### Mudar porta

```bash
PORT=3334 npm start
```

### Adicionar mais origins CORS

Editar `server.js`, linha ~30:
```javascript
server.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:4201', 'http://localhost:8080'],
  credentials: true
}));
```

## ��� Recursos

- [JSON Server Documentation](https://github.com/typicode/json-server)
- [Documentação do Projeto](../docs/api-mock/refinamento_tecnico-backend-mockado.md)
- [Tasks de Implementação](../docs/api-mock/tasks/)

## ��� Troubleshooting

### Porta já em uso
```bash
# Windows
netstat -ano | findstr :3333
taskkill /PID <PID> /F

# Ou mudar a porta
PORT=3334 npm start
```

### Database corrompido
```bash
# Resetar database (apaga todos os dados)
echo '{"users":[],"preferences":[],"tasks":[],"checklistItems":[],"taskNotes":[],"focusSessions":[],"cognitiveAlerts":[],"telemetryEvents":[]}' > db.json
```

### Módulos não encontrados
```bash
# Reinstalar dependências
rm -rf node_modules package-lock.json
npm install
```

## ��� Próximos Passos

1. ✅ Setup básico (você está aqui - Task 1)
2. ⏳ Popular database com estrutura completa (Task 2)
3. ⏳ Configurar middleware avançado (Task 3)
4. ⏳ Adicionar autenticação JWT mock (Task 4)
5. ⏳ Implementar endpoints customizados (Tasks 5-6)
6. ⏳ Seed data com exemplos (Task 7)
7. ⏳ Testes E2E completos (Task 8)

Ver: `back-end/docs/api-mock/tasks/` para guias detalhados.

---

**Status:** ✅ Funcional  
**Versão:** 1.0.0  
**Última atualização:** 10/02/2026

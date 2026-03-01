# 🧪 MindEase Mock API - Testing Guide

## Testes Disponíveis

### 1. Suite Completa (Recomendado)
```bash
npm test
# ou
./test-all-endpoints.sh
```

**O que testa:**
- ✅ Health check
- ✅ Auth (register, login, refresh, logout)
- ✅ Preferences (GET, PUT)
- ✅ Tasks (CRUD + move)
- ✅ Checklist items
- ✅ Task notes
- ✅ Focus sessions
- ✅ Alerts & Telemetry
- ✅ Validações (400, 401, 403, 404, 409)

**Total:** 30+ casos de teste

---

## 🚀 Quick Start

### Pré-requisitos
1. Servidor rodando: `npm start`
2. Seed data aplicado: `./reset-db.sh`

### Executar Testes
```bash
cd back-end/mock

# Garantir que servidor está rodando
npm start &

# Aguardar servidor iniciar
sleep 3

# Rodar testes
npm test
```

---

## 📊 Estrutura dos Testes

### 1. Health Check
```bash
curl http://localhost:3333/health
```
**Esperado:** 200 OK

### 2. Auth Flow Completo

#### Register
```bash
curl -X POST http://localhost:3333/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","name":"Test User"}'
```
**Esperado:** 201 Created  
**Validações:** 400 (campos faltando), 409 (email duplicado)

#### Login
```bash
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@example.com","password":"Senha@123"}'
```
**Esperado:** 200 OK com accessToken e refreshToken  
**Validações:** 401 (senha errada), 404 (usuário não existe)

### 3. Preferences

#### GET Preferences
```bash
TOKEN="seu-token-aqui"
curl http://localhost:3333/api/v1/preferences \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado:** 200 OK  
**Validações:** 401 (sem auth)

#### PUT Preferences
```bash
curl -X PUT http://localhost:3333/api/v1/preferences \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","language":"pt-BR"}'
```
**Esperado:** 200 OK  
**Validações:** 400 (dados inválidos), 401 (sem auth)

### 4. Tasks CRUD

#### List Tasks
```bash
curl http://localhost:3333/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado:** 200 OK

#### Filter Tasks
```bash
curl "http://localhost:3333/api/v1/tasks?status=TODO" \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado:** 200 OK

#### Create Task
```bash
curl -X POST http://localhost:3333/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Nova Tarefa","description":"Descrição"}'
```
**Esperado:** 201 Created  
**Validações:** 400 (title faltando), 401 (sem auth)

#### Update Task
```bash
curl -X PATCH http://localhost:3333/api/v1/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"DOING","description":"Atualizado"}'
```
**Esperado:** 200 OK  
**Validações:** 401 (sem auth), 403 (não é dono), 404 (não existe)

#### Move Task (Kanban)
```bash
curl -X POST http://localhost:3333/api/v1/tasks/1/move \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toStatus":"DONE","position":0}'
```
**Esperado:** 200 OK  
**Validações:** 400 (toStatus inválido), 401 (sem auth), 403 (não é dono)

#### Delete Task
```bash
curl -X DELETE http://localhost:3333/api/v1/tasks/1 \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado:** 200 OK  
**Validações:** 401 (sem auth), 403 (não é dono), 404 (não existe)

### 5. Checklist Items

```bash
# List
curl "http://localhost:3333/api/v1/checklistItems?taskId=2"

# Create
curl -X POST http://localhost:3333/api/v1/checklistItems \
  -H "Content-Type: application/json" \
  -d '{"taskId":2,"text":"Item checklist","completed":false,"order":0}'

# Delete
curl -X DELETE http://localhost:3333/api/v1/checklistItems/checklist-001
```

### 6. Task Notes

```bash
# List
curl "http://localhost:3333/api/v1/taskNotes?taskId=2"

# Create
curl -X POST http://localhost:3333/api/v1/taskNotes \
  -H "Content-Type: application/json" \
  -d '{"taskId":2,"content":"Nota importante"}'

# Delete
curl -X DELETE http://localhost:3333/api/v1/taskNotes/note-001
```

### 7. Focus Sessions

```bash
# List
curl http://localhost:3333/api/v1/focusSessions

# Create
curl -X POST http://localhost:3333/api/v1/focusSessions \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-001","taskId":2,"status":"RUNNING","type":"POMODORO"}'

# Update
curl -X PATCH http://localhost:3333/api/v1/focusSessions/session-001 \
  -H "Content-Type: application/json" \
  -d '{"status":"PAUSED"}'

# Delete
curl -X DELETE http://localhost:3333/api/v1/focusSessions/session-001
```

### 8. Cognitive Alerts

```bash
# List all
curl http://localhost:3333/api/v1/cognitiveAlerts

# Filter by type
curl "http://localhost:3333/api/v1/cognitiveAlerts?type=BREAK_SUGGESTION"

# Create
curl -X POST http://localhost:3333/api/v1/cognitiveAlerts \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user-001",
    "type":"BREAK_SUGGESTION",
    "severity":"MEDIUM",
    "message":"Hora de fazer uma pausa",
    "metadata":{},
    "dismissed":false
  }'
```

### 9. Telemetry Events

```bash
# List
curl http://localhost:3333/api/v1/telemetryEvents

# Create
curl -X POST http://localhost:3333/api/v1/telemetryEvents \
  -H "Content-Type: application/json" \
  -d '{
    "userId":"user-001",
    "eventType":"buttonClicked",
    "eventData":{"button":"save"}
  }'
```

---

## 📋 Status Codes Esperados

| Endpoint | Method | Success | Errors |
|----------|--------|---------|--------|
| /health | GET | 200 | - |
| /auth/register | POST | 201 | 400, 409 |
| /auth/login | POST | 200 | 400, 401, 404 |
| /auth/refresh | POST | 200 | 400, 401 |
| /auth/logout | POST | 204 | 401 |
| /me | GET | 200 | 401 |
| /preferences | GET | 200 | 401 |
| /preferences | PUT | 200 | 400, 401 |
| /tasks | GET | 200 | - |
| /tasks | POST | 201 | 400, 401 |
| /tasks/:id | GET | 200 | 404 |
| /tasks/:id | PATCH | 200 | 401, 403, 404 |
| /tasks/:id | DELETE | 200 | 401, 403, 404 |
| /tasks/:id/move | POST | 200 | 400, 401, 403, 404 |
| /checklistItems | GET, POST | 200, 201 | - |
| /taskNotes | GET, POST | 200, 201 | - |
| /focusSessions | GET, POST | 200, 201 | - |
| /cognitiveAlerts | GET, POST | 200, 201 | - |
| /telemetryEvents | GET, POST | 200, 201 | - |

---

## 🔧 Troubleshooting

### Servidor não está rodando
```bash
cd back-end/mock
npm start
```

### Porta 3333 já está em uso
```bash
# No Windows
netstat -ano | findstr :3333
taskkill /PID <PID> /F

# No Linux/Mac
lsof -ti:3333 | xargs kill -9
```

### Dados corrompidos
```bash
./reset-db.sh
npm start
```

### Testes falhando
1. Verificar que servidor está rodando (porta 3333)
2. Resetar database com seed data: `./reset-db.sh`
3. Verificar logs do servidor (possíveis erros)
4. Testar endpoints individuais para isolar problema
5. Verificar que curl está instalado: `curl --version`

### Token expirado
Os tokens JWT têm validade de 1 hora. Se os testes demorarem muito, faça login novamente.

---

## 🤖 CI/CD Integration

### GitHub Actions Example
```yaml
name: Test Mock API

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd back-end/mock
          npm install
      
      - name: Start server
        run: |
          cd back-end/mock
          npm start &
          sleep 5
      
      - name: Run tests
        run: |
          cd back-end/mock
          chmod +x test-all-endpoints.sh
          ./test-all-endpoints.sh
```

---

## 📈 Coverage

Cobertura de testes por módulo:

| Módulo | Testes | Cobertura |
|--------|--------|-----------|
| Health Check | 1 | 100% |
| Auth | 6 | 100% |
| Preferences | 3 | 100% |
| Tasks | 10 | 100% |
| Checklist | 3 | CRUD básico |
| Notes | 3 | CRUD básico |
| Focus Sessions | 4 | CRUD básico |
| Alerts | 3 | GET + filtros + POST |
| Telemetry | 2 | GET + POST |

**Total:** ~35 casos de teste

---

## 🎯 Próximos Passos

- [ ] Adicionar testes de performance (k6/Artillery)
- [ ] Testes de carga (100+ usuários simultâneos)
- [ ] Integration tests com Cypress/Playwright
- [ ] Contract testing com Pact
- [ ] Monitoramento de API (tempo de resposta)

---

## 📝 Notas

**Dados de teste:**
- Os testes usam dados do seed (user-001, ana.silva@example.com, etc.)
- Recursos criados durante testes são deletados automaticamente
- Exit code 0 = sucesso, 1 = falha (permite integração CI/CD)

**Performance:**
- Suite completa leva ~10-15 segundos
- Testes podem ser executados em paralelo (modificar script)
- Servidor deve estar rodando antes dos testes

---

**Última atualização:** 2026-02-10  
**Versão:** 1.0.0

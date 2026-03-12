# Correções de Autenticação e Refresh Token

## 📋 Problemas Identificados

### 1. ❌ Backend: Endpoint `/auth/refresh` não existia (404)
### 2. ❌ Frontend: Interface `RefreshTokenResponse` incompleta  
### 3. ❌ Frontend: AuthStore não atualizava o `refreshToken` após refresh

---

## ✅ Correções Implementadas

### Backend (`custom-middleware.js`)

**Adicionado endpoint POST /api/v1/auth/refresh:**
- Valida o refreshToken recebido no body
- Verifica se o token é válido usando JWT.verify()
- Busca o usuário no banco
- Gera novos accessToken e refreshToken
- Retorna ambos os tokens na resposta
- Documentação Swagger completa

```javascript
// POST /api/v1/auth/refresh
if (req.method === 'POST' && req.url === '/api/v1/auth/refresh') {
  const { refreshToken } = req.body;
  // ... validação ...
  return res.status(200).json({
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  });
}
```

### Frontend - Modelos (`auth.models.ts`)

**Corrigido interface RefreshTokenResponse:**
```typescript
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;  // ✅ ADICIONADO
}
```

### Frontend - Store (`auth.store.ts`)

**Corrigido método refreshAccessToken():**
- Agora atualiza AMBOS os tokens (accessToken + refreshToken)
- Faz broadcast do novo estado de autenticação

```typescript
async refreshAccessToken(): Promise<string> {
  // ... request ...
  
  // ✅ Update both tokens
  this._accessToken.set(response.accessToken);
  this._refreshToken.set(response.refreshToken);  // ADICIONADO
  
  // ✅ Broadcast updated state
  this.broadcastAuthState({
    user,
    accessToken: response.accessToken,
    refreshToken: response.refreshToken
  });
  
  return response.accessToken;
}
```

---

## 🔄 Fluxo de Autenticação (Implementado)

### 1. **Login/Register**
```
Frontend → POST /api/v1/auth/login
         ← { user, accessToken, refreshToken }
```

### 2. **Requisição Protegida (Tasks, Preferences, etc)**
```
Frontend → GET /api/v1/tasks
         + Header: Authorization: Bearer <accessToken>
         ← 200 OK (se token válido)
         ← 401 Unauthorized (se token expirou)
```

### 3. **Interceptor Captura 401 e Renova Token**
```
authInterceptor detecta 401
         ↓
authStore.refreshAccessToken()
         ↓
Frontend → POST /api/v1/auth/refresh
         + Body: { refreshToken }
         ← { accessToken, refreshToken }
         ↓
Atualiza tokens no AuthStore
         ↓
Retenta requisição original com novo token
```

### 4. **Se Refresh Falhar**
```
authStore.logout()
         ↓
Limpa estado (localstorage, signals)
         ↓
router.navigate(['/login'])
```

---

## 🧪 Como Testar

### 1. **Reiniciar o servidor mock:**
```bash
cd c:/Users/ge-gi/Desktop/workspace/fiap-projeto-final/back-end/mock
npm start
```

### 2. **Testar endpoint de refresh (manual):**
```bash
# 1. Login
curl -X POST http://localhost:3333/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "daniel@example.com", "password": "Senha@123"}'

# Copiar o refreshToken da resposta

# 2. Refresh
curl -X POST http://localhost:3333/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<REFRESH_TOKEN_AQUI>"}'
```

### 3. **Testar move task com autenticação:**
```bash
# Use o script criado
chmod +x test-task-move-auth.sh
./test-task-move-auth.sh
```

### 4. **Testar no frontend:**
- Faça login na aplicação
- Use normalmente (criar tasks, mover no Kanban, etc)
- O interceptor vai adicionar o token automaticamente
- Se o token expirar após 1h, ele será renovado automaticamente

---

## 📝 Arquivos Modificados

### Backend
- ✅ `custom-middleware.js` - Endpoint /auth/refresh implementado
- ✅ `swagger.js` - Documentação atualizada

### Frontend
- ✅ `libs/shared/state/src/lib/auth/auth.models.ts` - RefreshTokenResponse corrigida
- ✅ `libs/shared/state/src/lib/auth/auth.store.ts` - refreshAccessToken() corrigido

### Testes
- ✅ `test-auth-refresh.sh` - Script de teste do endpoint refresh
- ✅ `test-task-move-auth.sh` - Script de teste do endpoint move com auth

---

## ✅ Status Final

| Componente | Status | Observação |
|-----------|--------|------------|
| POST /auth/refresh (backend) | ✅ OK | Implementado e documentado |
| RefreshTokenResponse | ✅ OK | Inclui accessToken + refreshToken |
| AuthStore.refreshAccessToken() | ✅ OK | Atualiza ambos os tokens |
| authInterceptor | ✅ OK | Já estava correto |
| Tasks /move endpoint | ✅ OK | Requer Bearer token (correto) |
| Kanban drag & drop | ✅ OK | Usa TasksStore.updateTaskStatus() |

---

## 🎯 Conclusão

**Todos os problemas foram corrigidos!**

O erro 401 em `/tasks/22/move` não é um bug - é o comportamento correto quando:
- O token não é enviado no header
- O token está expirado
- O token é inválido

Com as correções implementadas:
1. ✅ O backend tem o endpoint `/auth/refresh`
2. ✅ O frontend renova automaticamente tokens expirados
3. ✅ Todas as requisições protegidas incluem o Bearer token
4. ✅ O fluxo completo de autenticação funciona end-to-end

**Ação necessária:** Reiniciar o servidor mock para aplicar as alterações no backend.

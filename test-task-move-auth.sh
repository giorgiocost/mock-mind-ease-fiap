#!/bin/bash

# Test Task Move with Auth
# Tests POST /tasks/:id/move endpoint with authentication

BASE_URL="http://localhost:3333/api/v1"

echo "========================================"
echo "🧪 Testing Task Move with Auth"
echo "========================================"
echo ""

# 1. Login para obter token
echo "1️⃣  POST /auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "daniel@example.com",
    "password": "Senha@123"
  }')

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id')

echo "✅ Logged in as: $(echo "$LOGIN_RESPONSE" | jq -r '.user.email')"
echo "User ID: $USER_ID"
echo "Token: ${ACCESS_TOKEN:0:50}..."
echo ""

# 2. Criar uma task para testar
echo "2️⃣  POST /tasks (criar task de teste)"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "title": "Task de teste para mover",
    "description": "Testando movimento entre colunas",
    "status": "TODO",
    "priority": "medium",
    "category": "work",
    "position": 0
  }')

TASK_ID=$(echo "$CREATE_RESPONSE" | jq -r '.id')

echo "✅ Task criada:"
echo "$CREATE_RESPONSE" | jq .
echo ""
echo "Task ID: $TASK_ID"
echo ""

# 3. Mover task para DOING (com autenticação - deve funcionar)
echo "3️⃣  POST /tasks/$TASK_ID/move (TODO → DOING) - COM AUTH"
MOVE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "toStatus": "DOING",
    "position": 0
  }')

echo "Response:"
echo "$MOVE_RESPONSE" | sed 's/HTTP_CODE:/\nHTTP Status Code: /'
echo ""

# 4. Verificar que a task foi movida
echo "4️⃣  GET /tasks/$TASK_ID (verificar status)"
GET_RESPONSE=$(curl -s -X GET "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "Task atual:"
echo "$GET_RESPONSE" | jq '{id, title, status, position}'
echo ""

# 5. Mover task para DONE
echo "5️⃣  POST /tasks/$TASK_ID/move (DOING → DONE)"
MOVE2_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "toStatus": "DONE",
    "position": 0
  }')

echo "Response:"
echo "$MOVE2_RESPONSE" | sed 's/HTTP_CODE:/\nHTTP Status Code: /'
echo ""

# 6. Tentar mover SEM autenticação (deve retornar 401)
echo "6️⃣  POST /tasks/$TASK_ID/move - SEM AUTH (deve retornar 401)"
UNAUTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Content-Type: application/json" \
  -d '{
    "toStatus": "TODO",
    "position": 0
  }')

echo "Response:"
echo "$UNAUTH_RESPONSE" | sed 's/HTTP_CODE:/\nHTTP Status Code: /'
echo ""

# 7. Tentar mover com token inválido (deve retornar 401)
echo "7️⃣  POST /tasks/$TASK_ID/move - TOKEN INVÁLIDO (deve retornar 401)"
INVALID_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid-token-xyz" \
  -d '{
    "toStatus": "TODO",
    "position": 0
  }')

echo "Response:"
echo "$INVALID_RESPONSE" | sed 's/HTTP_CODE:/\nHTTP Status Code: /'
echo ""

# 8. Tentar mover com status inválido (deve retornar 400)
echo "8️⃣  POST /tasks/$TASK_ID/move - STATUS INVÁLIDO (deve retornar 400)"
BAD_STATUS_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "toStatus": "INVALID_STATUS",
    "position": 0
  }')

echo "Response:"
echo "$BAD_STATUS_RESPONSE" | sed 's/HTTP_CODE:/\nHTTP Status Code: /'
echo ""

# 9. Limpar - deletar task de teste
echo "9️⃣  DELETE /tasks/$TASK_ID (limpar)"
DELETE_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X DELETE "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

echo "HTTP Status Code: $(echo "$DELETE_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d: -f2)"
echo ""

echo "========================================"
echo "✅ Task Move Tests Complete"
echo "========================================"
echo ""
echo "📝 Resumo:"
echo "- ✅ Move com auth deve retornar 200"
echo "- ❌ Move sem auth deve retornar 401"
echo "- ❌ Move com token inválido deve retornar 401"
echo "- ❌ Move com status inválido deve retornar 400"

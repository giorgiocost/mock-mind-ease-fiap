#!/bin/bash
BASE_URL="http://localhost:3333/api/v1"

echo "í·ª Teste Manual Completo - Tasks"
echo ""

# Login
echo "1. Login..."
TOKEN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste-pref@example.com","password":"Senha@123"}' | tr -d '\n\r' | tr -d ' ' | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "Token: ${TOKEN:0:50}..."
echo ""

# POST task
echo "2. POST /api/v1/tasks (criar task)"
TASK=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Implementar Frontend","description":"Criar componentes Angular"}')
echo "$TASK" | grep -E '(title|id|status|userId)'
TASK_ID=$(echo "$TASK" | grep -o '"id":"task-[^"]*"' | cut -d'"' -f4)
echo ""

# GET tasks
echo "3. GET /api/v1/tasks (listar)"
curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" | grep -E '(title|id|status)' | head -10
echo ""

# PATCH task
echo "4. PATCH /api/v1/tasks/$TASK_ID (atualizar)"
curl -s -X PATCH "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"DOING","description":"Trabalhado nisso agora"}' | grep -E '(title|status)'
echo ""

# POST move
echo "5. POST /api/v1/tasks/$TASK_ID/move (mover para DONE)"
curl -s -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toStatus":"DONE","position":1}' | grep -E '(title|status|position)'
echo ""

# GET filtered
echo "6. GET /api/v1/tasks?status=DONE (filtrar)"
curl -s -X GET "$BASE_URL/tasks?status=DONE" \
  -H "Authorization: Bearer $TOKEN" | grep -c '"id"'
echo "task(s) com status=DONE"
echo ""

# DELETE task
echo "7. DELETE /api/v1/tasks/$TASK_ID"
curl -s -o /dev/null -w "Status: %{http_code}\n" \
  -X DELETE "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN"
echo ""

echo "âœ… Teste manual concluÃ­do!"

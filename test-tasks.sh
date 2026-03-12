#!/bin/bash
BASE_URL="http://localhost:3333/api/v1"

echo "��� Testando endpoints de tasks..."
echo ""

# 1. Login para obter token
echo "1. Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste-pref@example.com","password":"Senha@123"}' | tr -d '\n\r' | tr -d ' ')
TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "   ❌ Falha ao obter token"
  echo "   Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "   ✅ Token obtido: ${TOKEN:0:30}..."
echo ""

# 2. Criar task (POST)
echo "2. Criando task (POST /api/v1/tasks)..."
TASK_RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Tarefa de Teste","description":"Descrição da tarefa"}' | tr -d '\n\r')

TASK_ID=$(echo "$TASK_RESPONSE" | grep -o '"id"[ ]*:[ ]*[0-9]*' | grep -o '[0-9][0-9]*')

if [ -n "$TASK_ID" ]; then
  echo "   ✅ Task criada: $TASK_ID"
else
  echo "   ❌ Falha ao criar task"
  echo "   Response: $TASK_RESPONSE"
fi
echo ""

# 3. Listar tasks (GET)
echo "3. Listando tasks (GET /api/v1/tasks)..."
TASKS_LIST=$(curl -s -X GET "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN")

TASKS_COUNT=$(echo "$TASKS_LIST" | grep -o '"id"' | wc -l)

if [ "$TASKS_COUNT" -ge 1 ]; then
  echo "   ✅ Tasks listadas: $TASKS_COUNT task(s)"
else
  echo "   ❌ Falha ao listar tasks"
fi
echo ""

# 4. Atualizar task (PATCH)
echo "4. Atualizando task (PATCH /api/v1/tasks/$TASK_ID)..."
UPDATE_RESPONSE=$(curl -s -X PATCH "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"DOING","description":"Trabalhando nisso"}')

if echo "$UPDATE_RESPONSE" | tr -d ' ' | grep -q '"status":"DOING"'; then
  echo "   ✅ Task atualizada (status=DOING)"
else
  echo "   ❌ Falha ao atualizar task"
  echo "   Response: $UPDATE_RESPONSE"
fi
echo ""

# 5. Mover task (POST /move)
echo "5. Movendo task (POST /api/v1/tasks/$TASK_ID/move)..."
MOVE_RESPONSE=$(curl -s -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toStatus":"DONE","position":1}')

if echo "$MOVE_RESPONSE" | tr -d ' ' | grep -q '"status":"DONE"'; then
  echo "   ✅ Task movida para DONE"
else
  echo "   ❌ Falha ao mover task"
  echo "   Response: $MOVE_RESPONSE"
fi
echo ""

# 6. Filtrar por status
echo "6. Filtrando tasks por status (GET /api/v1/tasks?status=DONE)..."
FILTERED_TASKS=$(curl -s -X GET "$BASE_URL/tasks?status=DONE" \
  -H "Authorization: Bearer $TOKEN")

DONE_COUNT=$(echo "$FILTERED_TASKS" | tr -d ' ' | grep -o '"status":"DONE"' | wc -l)

if [ "$DONE_COUNT" -ge 1 ]; then
  echo "   ✅ Filtro por status funcionando ($DONE_COUNT DONE task(s))"
else
  echo "   ⚠️  Nenhuma task DONE encontrada"
  echo "   Debug - Response: $FILTERED_TASKS"
fi
echo ""

# 7. Criar segunda task
echo "7. Criando segunda task..."
TASK2_RESPONSE=$(curl -s -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Segunda Tarefa","status":"TODO"}' | tr -d '\n\r')

TASK2_ID=$(echo "$TASK2_RESPONSE" | grep -o '"id"[ ]*:[ ]*[0-9]*' | grep -o '[0-9][0-9]*')

if [ -n "$TASK2_ID" ]; then
  echo "   ✅ Segunda task criada: $TASK2_ID"
else
  echo "   ❌ Falha ao criar segunda task"
fi
echo ""

# 8. Deletar task (DELETE)
echo "8. Deletando segunda task (DELETE /api/v1/tasks/$TASK2_ID)..."
# contar tasks antes
BEFORE_DELETE_COUNT=$(echo "$TASKS_LIST" | grep -o '"id"' | wc -l)

DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE "$BASE_URL/tasks/$TASK2_ID" \
  -H "Authorization: Bearer $TOKEN")

if [ "$DELETE_STATUS" == "200" ]; then
  echo "   ✅ Task deletada (status: $DELETE_STATUS)"
  # checar se apenas uma task sumiu
  AFTER_DELETE_LIST=$(curl -s -X GET "$BASE_URL/tasks" \
    -H "Authorization: Bearer $TOKEN")
  AFTER_DELETE_COUNT=$(echo "$AFTER_DELETE_LIST" | grep -o '"id"' | wc -l)
  if [ $((BEFORE_DELETE_COUNT - AFTER_DELETE_COUNT)) -eq 1 ]; then
    echo "   ✅ Apenas uma task removida (antes: $BEFORE_DELETE_COUNT, depois: $AFTER_DELETE_COUNT)"
  else
    echo "   ❌ Algo estranho: counts before=$BEFORE_DELETE_COUNT after=$AFTER_DELETE_COUNT"
  fi
else
  echo "   ❌ Falha ao deletar task (status: $DELETE_STATUS)"
fi
echo ""

# 9. Validações negativas
echo "9. Testando validações..."

# Title obrigatório
NO_TITLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"Sem título"}')

if [ "$NO_TITLE_STATUS" == "400" ]; then
  echo "   ✅ Sem title = 400"
else
  echo "   ❌ Sem title deveria retornar 400, retornou $NO_TITLE_STATUS"
fi

# Sem autenticação
NO_AUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Teste"}')

if [ "$NO_AUTH_STATUS" == "401" ]; then
  echo "   ✅ Sem auth = 401"
else
  echo "   ❌ Sem auth deveria retornar 401, retornou $NO_AUTH_STATUS"
fi

# toStatus inválido no move
INVALID_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toStatus":"INVALID"}')

if [ "$INVALID_STATUS" == "400" ]; then
  echo "   ✅ toStatus inválido = 400"
else
  echo "   ❌ toStatus inválido deveria retornar 400, retornou $INVALID_STATUS"
fi

# toStatus ausente no move
MISSING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
  -X POST "$BASE_URL/tasks/$TASK_ID/move" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"position":0}')

if [ "$MISSING_STATUS" == "400" ]; then
  echo "   ✅ toStatus ausente = 400"
else
  echo "   ❌ toStatus ausente deveria retornar 400, retornou $MISSING_STATUS"
fi
echo ""

# 10. Cleanup final: deletar task de teste
echo "10. Limpeza final..."
curl -s -o /dev/null -X DELETE "$BASE_URL/tasks/$TASK_ID" \
  -H "Authorization: Bearer $TOKEN"
echo "   ✅ Tasks de teste removidas"
echo ""

echo "✅ Todos os testes de tasks concluídos!"

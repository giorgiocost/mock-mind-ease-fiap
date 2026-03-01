#!/bin/bash
BASE_URL="http://localhost:3333/api/v1"

echo "��� Testando endpoints de preferências..."
echo ""

# 0. Registrar usuário de teste (caso não exista)
echo "0. Preparando usuário de teste..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste-pref@example.com","password":"Senha@123","name":"Teste Preferences"}' 2>/dev/null | tr -d '\n\r' | tr -d ' ')

# Se já existir, fazer login
if echo "$REGISTER_RESPONSE" | grep -qi "alreadyexists\|ConflictError"; then
  echo "   ℹ️  Usuário já existe, fazendo login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"teste-pref@example.com","password":"Senha@123"}' | tr -d '\n\r' | tr -d ' ')
  TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
else
  echo "   ✅ Usuário criado"
  TOKEN=$(echo "$REGISTER_RESPONSE" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
fi

if [ -z "$TOKEN" ]; then
  echo "   ❌ Falha ao obter token"
  echo "   Response: $REGISTER_RESPONSE $LOGIN_RESPONSE"
  exit 1
fi

echo "   ✅ Token obtido"
echo ""

# 1. GET preferences (deve criar com defaults)
echo "1. Buscando preferências (GET)..."
PREFS=$(curl -s -X GET "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PREFS" | grep -q "uiDensity"; then
  echo "   ✅ Preferências retornadas"
  if echo "$PREFS" | grep -q '"uiDensity":"medium"'; then
    echo "   ✅ Defaults aplicados corretamente"
  else
    echo "   ⚠️  Defaults podem não estar corretos"
  fi
else
  echo "   ❌ Falha ao buscar preferências"
  echo "   Resposta: $PREFS"
fi
echo ""

# 2. PUT preferences (atualizar)
echo "2. Atualizando preferências (PUT)..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uiDensity":"simple","focusMode":true,"fontScale":1.2}')

if echo "$UPDATE_RESPONSE" | grep -q '"uiDensity":"simple"'; then
  echo "   ✅ Atualização OK (uiDensity=simple)"
else
  echo "   ❌ Falha na atualização"
  echo "   Resposta: $UPDATE_RESPONSE"
fi

if echo "$UPDATE_RESPONSE" | grep -q '"focusMode":true'; then
  echo "   ✅ focusMode=true"
else
  echo "   ❌ focusMode não atualizado"
fi

if echo "$UPDATE_RESPONSE" | grep -q '"fontScale":1.2'; then
  echo "   ✅ fontScale=1.2"
else
  echo "   ❌ fontScale não atualizado"
fi
echo ""

# 3. Verificar updatedAt mudou
echo "3. Verificando updatedAt..."
sleep 1
UPDATE2=$(curl -s -X PUT "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"contrast":"high"}')

OLD_DATE=$(echo "$UPDATE_RESPONSE" | grep -o '"updatedAt":"[^"]*"' | cut -d'"' -f4)
NEW_DATE=$(echo "$UPDATE2" | grep -o '"updatedAt":"[^"]*"' | cut -d'"' -f4)

if [ "$OLD_DATE" != "$NEW_DATE" ]; then
  echo "   ✅ updatedAt atualizado ($OLD_DATE → $NEW_DATE)"
else
  echo "   ❌ updatedAt não mudou"
fi
echo ""

# 4. Validações negativas
echo "4. Testando validações..."

# fontScale inválido (> 1.4)
INVALID_FONT_RESPONSE=$(curl -s -X PUT "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fontScale":2.0}')
INVALID_FONT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fontScale":2.0}')

if [ "$INVALID_FONT_STATUS" == "400" ]; then
  echo "   ✅ fontScale inválido (2.0) = 400"
else
  echo "   ❌ fontScale 2.0 deveria retornar 400, retornou $INVALID_FONT_STATUS"
fi

# spacingScale inválido (< 0.9)
INVALID_SPACING_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"spacingScale":0.5}')

if [ "$INVALID_SPACING_STATUS" == "400" ]; then
  echo "   ✅ spacingScale inválido (0.5) = 400"
else
  echo "   ❌ spacingScale 0.5 deveria retornar 400, retornou $INVALID_SPACING_STATUS"
fi

# alertThresholdMinutes inválido (> 180)
INVALID_ALERT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$BASE_URL/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alertThresholdMinutes":200}')

if [ "$INVALID_ALERT_STATUS" == "400" ]; then
  echo "   ✅ alertThresholdMinutes inválido (200) = 400"
else
  echo "   ❌ alertThresholdMinutes 200 deveria retornar 400, retornou $INVALID_ALERT_STATUS"
fi
echo ""

# 5. Sem autenticação
echo "5. Testando autenticação..."
UNAUTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/preferences")

if [ "$UNAUTH_STATUS" == "401" ]; then
  echo "   ✅ Sem auth = 401"
else
  echo "   ❌ Sem auth deveria retornar 401, retornou $UNAUTH_STATUS"
fi

# Token inválido
INVALID_TOKEN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$BASE_URL/preferences" \
  -H "Authorization: Bearer token-invalido-123")

if [ "$INVALID_TOKEN_STATUS" == "401" ]; then
  echo "   ✅ Token inválido = 401"
else
  echo "   ❌ Token inválido deveria retornar 401, retornou $INVALID_TOKEN_STATUS"
fi
echo ""

echo "✅ Todos os testes de preferências concluídos!"

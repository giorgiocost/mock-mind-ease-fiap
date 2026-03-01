#!/bin/bash
echo "Ì¥ç Teste Manual Completo - Preferences"
echo ""

# Login
echo "1. Login..."
LOGIN=$(curl -s -X POST "http://localhost:3333/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste-pref@example.com","password":"Senha@123"}')
TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')
echo "‚úÖ Token: ${TOKEN:0:50}..."
echo ""

# GET preferences
echo "2. GET /api/v1/preferences"
curl -s -X GET "http://localhost:3333/api/v1/preferences" \
  -H "Authorization: Bearer $TOKEN" | python -m json.tool
echo ""

# PUT preferences
echo "3. PUT /api/v1/preferences (mudando uiDensity para 'full')"
curl -s -X PUT "http://localhost:3333/api/v1/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uiDensity":"full","fontScale":1.3}' | python -m json.tool
echo ""

# Valida√ß√£o fontScale inv√°lido
echo "4. PUT com fontScale=2.0 (inv√°lido, deve retornar 400)"
curl -s -X PUT "http://localhost:3333/api/v1/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"fontScale":2.0}' | python -m json.tool
echo ""

# Sem auth
echo "5. GET sem Authorization (deve retornar 401)"
curl -s -X GET "http://localhost:3333/api/v1/preferences" | python -m json.tool
echo ""

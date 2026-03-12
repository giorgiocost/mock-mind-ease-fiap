#!/bin/bash

# Test Auth Refresh Endpoint
# Tests the new POST /auth/refresh endpoint

BASE_URL="http://localhost:3333/api/v1"

echo "========================================"
echo "🧪 Testing Auth Refresh Endpoint"
echo "========================================"
echo ""

# 1. Login para obter refresh token
echo "1️⃣  POST /auth/login (obter tokens)"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "daniel@example.com",
    "password": "Senha@123"
  }')

echo "Response:"
echo "$LOGIN_RESPONSE" | jq .
echo ""

# Extrair tokens
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.accessToken')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.refreshToken')

echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."
echo ""

# 2. Testar refresh endpoint
echo "2️⃣  POST /auth/refresh (renovar token)"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

echo "Response:"
echo "$REFRESH_RESPONSE" | jq .
echo ""

# Extrair novo access token
NEW_ACCESS_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo "$REFRESH_RESPONSE" | jq -r '.refreshToken')

echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
echo "New Refresh Token: ${NEW_REFRESH_TOKEN:0:50}..."
echo ""

# 3. Testar novo token em endpoint protegido
echo "3️⃣  GET /preferences (usando novo token)"
PREF_RESPONSE=$(curl -s -X GET "$BASE_URL/preferences" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

echo "Response:"
echo "$PREF_RESPONSE" | jq .
echo ""

# 4. Testar com refresh token inválido
echo "4️⃣  POST /auth/refresh (token inválido - deve retornar 401)"
INVALID_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "invalid-token-xyz"
  }')

echo "Response:"
echo "$INVALID_RESPONSE" | sed 's/HTTP_CODE:/\nHTTP Status Code: /'
echo ""

# 5. Testar sem refresh token
echo "5️⃣  POST /auth/refresh (sem token - deve retornar 400)"
MISSING_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d '{}')

echo "Response:"
echo "$MISSING_RESPONSE" | sed 's/HTTP_CODE:/\nHTTP Status Code: /'
echo ""

echo "========================================"
echo "✅ Auth Refresh Tests Complete"
echo "========================================"

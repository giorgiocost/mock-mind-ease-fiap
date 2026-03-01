#!/bin/bash

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3333"
API_URL="$BASE_URL/api/v1"

# Contadores
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Função para testar
test_endpoint() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if [ "$expected" == "$actual" ]; then
    echo -e "   ${GREEN}✅ PASS${NC}: $test_name (Status: $actual)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "   ${RED}❌ FAIL${NC}: $test_name (Expected: $expected, Got: $actual)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
}

# Banner
echo ""
echo "========================================"
echo "🧪 MINDEASE MOCK API - TEST SUITE"
echo "========================================"
echo ""
echo "Testing API at: $API_URL"
echo ""

# ========== 1. HEALTH CHECK ==========
echo -e "${BLUE}📍 1. HEALTH CHECK${NC}"
echo "-------------------"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/health")
test_endpoint "Health check endpoint" "200" "$STATUS"
echo ""

# ========== 2. AUTH ENDPOINTS ==========
echo -e "${BLUE}📍 2. AUTH ENDPOINTS${NC}"
echo "-------------------"

# 2.1 Register (success)
UNIQUE_EMAIL="test-$(date +%s)@example.com"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$UNIQUE_EMAIL\",\"password\":\"Test@123\",\"name\":\"Test User\"}")
test_endpoint "POST /auth/register (new user)" "201" "$STATUS"

# 2.2 Register (duplicate email - fail)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@example.com","password":"Senha@123","name":"Duplicate"}')
test_endpoint "POST /auth/register (duplicate email)" "409" "$STATUS"

# 2.3 Register (missing fields - fail)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}')
test_endpoint "POST /auth/register (missing fields)" "400" "$STATUS"

# 2.4 Login (success)
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@example.com","password":"Senha@123"}')

# Remove ALL whitespace and newlines, then extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | tr -d '\n\r\t ' | sed 's/.*"accessToken":"\([^"]*\)".*/\1/')
REFRESH_TOKEN=$(echo "$LOGIN_RESPONSE" | tr -d '\n\r\t ' | sed 's/.*"refreshToken":"\([^"]*\)".*/\1/')

# Validate token format (should start with eyJ)
if [ -n "$TOKEN" ] && [[ "$TOKEN" == eyJ* ]]; then
  test_endpoint "POST /auth/login (valid credentials)" "200" "200"
else
  test_endpoint "POST /auth/login (valid credentials)" "200" "FAIL"
fi

# 2.5 Login (wrong password - fail)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"ana.silva@example.com","password":"WrongPassword"}')
test_endpoint "POST /auth/login (wrong password)" "401" "$STATUS"

# 2.6 Login (user not found - fail)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"notfound@example.com","password":"Test@123"}')
test_endpoint "POST /auth/login (user not found)" "404" "$STATUS"

echo ""

# ========== 3. PREFERENCES ==========
echo -e "${BLUE}📍 3. PREFERENCES ENDPOINTS${NC}"
echo "---------------------------"

# 3.1 GET preferences (authenticated)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/preferences" \
  -H "Authorization: Bearer $TOKEN")
test_endpoint "GET /preferences (authenticated)" "200" "$STATUS"

# 3.2 GET preferences (no auth - fail)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/preferences")
test_endpoint "GET /preferences (no auth)" "401" "$STATUS"

# 3.3 PUT preferences (valid)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$API_URL/preferences" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"theme":"dark","language":"pt-BR"}')
test_endpoint "PUT /preferences (valid data)" "200" "$STATUS"

echo ""

# ========== 4. TASKS ==========
echo -e "${BLUE}📍 4. TASKS ENDPOINTS${NC}"
echo "---------------------"

# 4.1 GET tasks (list)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/tasks" \
  -H "Authorization: Bearer $TOKEN")
test_endpoint "GET /tasks (list all)" "200" "$STATUS"

# 4.2 GET tasks (filter by status)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/tasks?status=TODO" \
  -H "Authorization: Bearer $TOKEN")
test_endpoint "GET /tasks?status=TODO (filter)" "200" "$STATUS"

# 4.3 POST task (valid)
TASK_RESPONSE=$(curl -s -X POST "$API_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task E2E","description":"End-to-end test task"}')

NEW_TASK_ID=$(echo "$TASK_RESPONSE" | tr -d ' ' | grep -o '"id"[ ]*:[ ]*[0-9]*' | grep -o '[0-9][0-9]*')

if [ -n "$NEW_TASK_ID" ]; then
  test_endpoint "POST /tasks (valid)" "201" "201"
else
  test_endpoint "POST /tasks (valid)" "201" "FAIL"
fi

# 4.4 POST task (missing title - fail)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"description":"No title"}')
test_endpoint "POST /tasks (missing title)" "400" "$STATUS"

# 4.5 POST task (no auth - fail)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/tasks" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}')
test_endpoint "POST /tasks (no auth)" "401" "$STATUS"

# 4.6 GET task by ID
if [ -n "$NEW_TASK_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/tasks/$NEW_TASK_ID")
  test_endpoint "GET /tasks/:id (specific task)" "200" "$STATUS"
fi

# 4.7 PATCH task (update)
if [ -n "$NEW_TASK_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$API_URL/tasks/$NEW_TASK_ID" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"status":"DOING","description":"Updated description"}')
  test_endpoint "PATCH /tasks/:id (update)" "200" "$STATUS"
fi

# 4.8 POST task move (valid)
if [ -n "$NEW_TASK_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/tasks/$NEW_TASK_ID/move" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"toStatus":"DONE","position":0}')
  test_endpoint "POST /tasks/:id/move (valid move)" "200" "$STATUS"
fi

# 4.9 POST task move (invalid status - fail)
if [ -n "$NEW_TASK_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$API_URL/tasks/$NEW_TASK_ID/move" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"toStatus":"INVALID"}')
  test_endpoint "POST /tasks/:id/move (invalid status)" "400" "$STATUS"
fi

# 4.10 DELETE task
if [ -n "$NEW_TASK_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/tasks/$NEW_TASK_ID" \
    -H "Authorization: Bearer $TOKEN")
  test_endpoint "DELETE /tasks/:id (delete task)" "200" "$STATUS"
fi

echo ""

# ========== 5. CHECKLIST & NOTES ==========
echo -e "${BLUE}📍 5. CHECKLIST & NOTES ENDPOINTS${NC}"
echo "----------------------------------"

# Usar task do seed data
EXISTING_TASK="2"

# 5.1 GET checklist items
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/checklistItems?taskId=$EXISTING_TASK")
test_endpoint "GET /checklistItems?taskId=X" "200" "$STATUS"

# 5.2 POST checklist item
CHECKLIST_RESPONSE=$(curl -s -X POST "$API_URL/checklistItems" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":$EXISTING_TASK,\"text\":\"E2E test checklist\",\"completed\":false,\"order\":99}")

NEW_CHECKLIST_ID=$(echo "$CHECKLIST_RESPONSE" | tr -d ' ' | grep -o '"id"[ ]*:[ ]*"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_CHECKLIST_ID" ]; then
  test_endpoint "POST /checklistItems (create)" "201" "201"
  
  # 5.3 DELETE checklist item
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/checklistItems/$NEW_CHECKLIST_ID")
  test_endpoint "DELETE /checklistItems/:id" "200" "$STATUS"
else
  test_endpoint "POST /checklistItems (create)" "201" "FAIL"
fi

# 5.4 GET task notes
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/taskNotes?taskId=$EXISTING_TASK")
test_endpoint "GET /taskNotes?taskId=X" "200" "$STATUS"

# 5.5 POST task note
NOTE_RESPONSE=$(curl -s -X POST "$API_URL/taskNotes" \
  -H "Content-Type: application/json" \
  -d "{\"taskId\":$EXISTING_TASK,\"content\":\"E2E test note\"}")

NEW_NOTE_ID=$(echo "$NOTE_RESPONSE" | tr -d ' ' | grep -o '"id"[ ]*:[ ]*"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_NOTE_ID" ]; then
  test_endpoint "POST /taskNotes (create)" "201" "201"
  
  # 5.6 DELETE note
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/taskNotes/$NEW_NOTE_ID")
  test_endpoint "DELETE /taskNotes/:id" "200" "$STATUS"
else
  test_endpoint "POST /taskNotes (create)" "201" "FAIL"
fi

echo ""

# ========== 6. FOCUS SESSIONS ==========
echo -e "${BLUE}📍 6. FOCUS SESSIONS ENDPOINTS${NC}"
echo "-------------------------------"

# 6.1 GET focus sessions
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/focusSessions")
test_endpoint "GET /focusSessions (list)" "200" "$STATUS"

# 6.2 POST create focus session
SESSION_RESPONSE=$(curl -s -X POST "$API_URL/focusSessions" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-001","taskId":2,"status":"RUNNING","startTime":"2026-02-10T18:00:00.000Z","duration":null,"type":"POMODORO"}')

NEW_SESSION_ID=$(echo "$SESSION_RESPONSE" | tr -d ' ' | grep -o '"id"[ ]*:[ ]*"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_SESSION_ID" ]; then
  test_endpoint "POST /focusSessions (create)" "201" "201"
  
  # 6.3 PATCH focus session (update status)
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X PATCH "$API_URL/focusSessions/$NEW_SESSION_ID" \
    -H "Content-Type: application/json" \
    -d '{"status":"PAUSED"}')
  test_endpoint "PATCH /focusSessions/:id (update)" "200" "$STATUS"
  
  # 6.4 DELETE focus session
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$API_URL/focusSessions/$NEW_SESSION_ID")
  test_endpoint "DELETE /focusSessions/:id" "200" "$STATUS"
else
  test_endpoint "POST /focusSessions (create)" "201" "FAIL"
fi

echo ""

# ========== 7. ALERTS & TELEMETRY ==========
echo -e "${BLUE}📍 7. ALERTS & TELEMETRY ENDPOINTS${NC}"
echo "-----------------------------------"

# 7.1 GET alerts
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/cognitiveAlerts")
test_endpoint "GET /cognitiveAlerts (list)" "200" "$STATUS"

# 7.2 GET alerts filtered
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/cognitiveAlerts?type=BREAK_SUGGESTION")
test_endpoint "GET /cognitiveAlerts?type=X (filter)" "200" "$STATUS"

# 7.3 POST cognitive alert
ALERT_RESPONSE=$(curl -s -X POST "$API_URL/cognitiveAlerts" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-001","type":"BREAK_SUGGESTION","severity":"MEDIUM","message":"Test alert","metadata":{},"dismissed":false}')

NEW_ALERT_ID=$(echo "$ALERT_RESPONSE" | tr -d ' ' | grep -o '"id"[ ]*:[ ]*"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_ALERT_ID" ]; then
  test_endpoint "POST /cognitiveAlerts (create)" "201" "201"
fi

# 7.4 GET telemetry events
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X GET "$API_URL/telemetryEvents")
test_endpoint "GET /telemetryEvents (list)" "200" "$STATUS"

# 7.5 POST telemetry event
TELEMETRY_RESPONSE=$(curl -s -X POST "$API_URL/telemetryEvents" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-001","eventType":"testEvent","eventData":{"test":true}}')

NEW_TELEMETRY_ID=$(echo "$TELEMETRY_RESPONSE" | tr -d ' ' | grep -o '"id"[ ]*:[ ]*"[^"]*"' | cut -d'"' -f4)

if [ -n "$NEW_TELEMETRY_ID" ]; then
  test_endpoint "POST /telemetryEvents (create)" "201" "201"
fi

echo ""

# ========== RESULTS ==========
echo "========================================"
echo "📊 TEST RESULTS"
echo "========================================"
echo -e "Total tests: ${YELLOW}$TOTAL_TESTS${NC}"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
echo ""

PASS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
echo "Pass rate: ${PASS_RATE}%"
echo ""

if [ "$FAILED_TESTS" -eq 0 ]; then
  echo -e "${GREEN}✅ ALL TESTS PASSED! 🎉${NC}"
  echo "Backend mock is ready for frontend integration!"
  echo ""
  exit 0
else
  echo -e "${RED}❌ SOME TESTS FAILED${NC}"
  echo "Review the errors above and fix before integrating."
  echo ""
  exit 1
fi

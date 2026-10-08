#!/usr/bin/env bash
# Collects the logs of the automated checks (AUTO01–AUTO05) into <evidence>/logs.
# Usage: scripts/auto-run.sh   (from the evidence folder; needs node_modules and a disposable PostgreSQL test DB)
#   DIGITALENT_TEST_POSTGRES_CONNECTION  test database whose name ends with _test (backend integration tests)
#   logs/develop-vitest.txt               full Vitest run on origin/develop, used as the baseline of AUTO02
set -u
EVIDENCE="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$(cd "$EVIDENCE/../../.." && pwd)"
LOGS="$EVIDENCE/logs"
mkdir -p "$LOGS"
strip() { sed 's/\x1b\[[0-9;]*m//g; s/\x1b\[2K//g'; }

cd "$REPO/frontend"

# AUTO01 — frontend tests touched by the branch, verbose
RELATED="src/lib/__tests__/organization-errors.test.ts src/services/__tests__/be1-organization-contract.test.ts src/hooks/__tests__/use-departments.test.tsx src/hooks/__tests__/use-skill-gaps.test.tsx src/hooks/__tests__/use-notification-hub.test.tsx src/features/organization/__tests__ src/features/intelligence/__tests__/SkillGapPages.test.tsx src/services/mock/__tests__/mock-flows.test.ts"
{
  echo "\$ npx vitest run $RELATED --reporter=verbose"
  npx vitest run $RELATED --reporter=verbose 2>&1 | strip | grep -E "^\s*(✓|×|↓)|Test Files|Tests |Duration" \
    | awk '!/mock-flows/ || /invitation activation/'
} > "$LOGS/auto01.txt"

# AUTO02 — whole frontend suite on the branch vs the develop baseline
npx vitest run 2>&1 | strip | grep -E "FAIL|Test Files|Tests " > "$LOGS/branch-vitest.txt"
grep " FAIL " "$LOGS/branch-vitest.txt" | sed 's/^ *//' | sort -u > "$LOGS/branch-fail.txt"
strip < "$LOGS/develop-vitest.txt" | grep " FAIL " | sed 's/^ *//' | sort -u > "$LOGS/develop-fail.txt"
{
  echo "\$ npx vitest run   # toàn bộ suite"
  echo "develop: $(strip < "$LOGS/develop-vitest.txt" | grep -E '^ *Tests ' | sed 's/^ *//')"
  echo "Nhánh: $(grep -E '^ *Tests ' "$LOGS/branch-vitest.txt" | sed 's/^ *//')"
  echo ""
  echo "\$ comm -13 develop-fail.txt branch-fail.txt   # Fail mới trên nhánh"
  NEW=$(comm -13 "$LOGS/develop-fail.txt" "$LOGS/branch-fail.txt")
  if [ -z "$NEW" ]; then echo "Fail mới: (không có)"; else echo "Fail mới:"; echo "$NEW"; fi
  echo ""
  echo "\$ comm -23 develop-fail.txt branch-fail.txt   # Được sửa trên nhánh"
  comm -23 "$LOGS/develop-fail.txt" "$LOGS/branch-fail.txt" | sed 's/^/Được sửa: /'
  echo ""
  echo "Các test vẫn fail (đã fail sẵn trên develop, ngoài phạm vi nhánh):"
  comm -12 "$LOGS/develop-fail.txt" "$LOGS/branch-fail.txt" | sed 's/^FAIL  //'
} > "$LOGS/auto02.txt"

# AUTO03 — tsc, lint, build
CHANGED=$(cd "$REPO" && git diff --name-only origin/develop..HEAD -- frontend/src | sed 's#^frontend/##')
{
  echo "\$ npx tsc -b"
  npx tsc -b 2>&1 | strip; echo "tsc -b exit code: ${PIPESTATUS[0]}"
  echo ""
  echo "\$ npm run lint"
  npm run lint > "$LOGS/lint.txt" 2>&1; LINT=$?
  echo "Lint: exit code $LINT · lỗi: $(grep -c ' error ' "$LOGS/lint.txt") · cảnh báo toàn repo: $(grep -c 'warning' "$LOGS/lint.txt")"
  HITS=0; for f in $CHANGED; do n=$(grep -c "^$f:" "$LOGS/lint.txt"); HITS=$((HITS + n)); done
  echo "Số cảnh báo ở file thay đổi của nhánh ($(echo "$CHANGED" | wc -l) file): $HITS"
  echo ""
  echo "\$ npm run build"
  npm run build 2>&1 | strip | grep -E "vite v|modules transformed|built in|error" | head -5
} > "$LOGS/auto03.txt"

cd "$REPO/backend"

# AUTO04 — backend build and the whole test suite (unit + PostgreSQL integration)
{
  echo "\$ dotnet build DigiTalent.sln"
  dotnet build DigiTalent.sln 2>&1 | strip | grep -E "Build succeeded|Build FAILED| error |[0-9]+ Warning\(s\)|[0-9]+ Error\(s\)" | sort -u
  echo ""
  echo "\$ dotnet test tests/DigiTalent.Tests   # DIGITALENT_TEST_POSTGRES_CONNECTION=…_test"
  dotnet test tests/DigiTalent.Tests --no-build 2>&1 | strip | grep -E "Passed!|Failed!|^\s+Failed "
} > "$LOGS/auto04.txt"

# AUTO05 — the backend tests added by the branch, one line per test
{
  echo "\$ dotnet test --filter \"WorkforceTests|WorkforceValidatorTests|CompetencyInsightTests|SkillGapAnalyticsTests\" --logger \"console;verbosity=normal\""
  dotnet test tests/DigiTalent.Tests --no-build \
    --filter "FullyQualifiedName~WorkforceTests|FullyQualifiedName~WorkforceValidatorTests|FullyQualifiedName~CompetencyInsightTests|FullyQualifiedName~SkillGapAnalyticsTests" \
    --logger "console;verbosity=normal" 2>&1 | strip | grep -E "^\s+(Passed|Failed) DigiTalent|Passed!|Failed!|Test Run|Total tests|^\s+(Passed|Failed): " | sed 's/^ *//; s/DigiTalent\.Tests\.//'
} > "$LOGS/auto05.txt"
echo AUTO_DONE

# Run All Tests Script
# This script runs backend, frontend, and E2E tests in sequence

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Running Team Topologies Visualizer Tests" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorCount = 0

# 1. Backend Tests
Write-Host "`n[1/3] Running Backend Tests (pytest)..." -ForegroundColor Yellow
Write-Host "--------------------------------------`n" -ForegroundColor Yellow

try {
    .\venv\Scripts\python.exe -m pytest tests_backend\ -v
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n✗ Backend tests failed!" -ForegroundColor Red
        $ErrorCount++
    } else {
        Write-Host "`n✓ Backend tests passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "`n✗ Backend tests failed with error: $_" -ForegroundColor Red
    $ErrorCount++
}

# 2. Frontend Tests
Write-Host "`n[2/3] Running Frontend Tests (Vitest)..." -ForegroundColor Yellow
Write-Host "--------------------------------------`n" -ForegroundColor Yellow

Push-Location frontend
try {
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n✗ Frontend tests failed!" -ForegroundColor Red
        $ErrorCount++
    } else {
        Write-Host "`n✓ Frontend tests passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "`n✗ Frontend tests failed with error: $_" -ForegroundColor Red
    $ErrorCount++
} finally {
    Pop-Location
}

# 3. E2E Tests
Write-Host "`n[3/3] Running E2E Tests (Playwright)..." -ForegroundColor Yellow
Write-Host "--------------------------------------`n" -ForegroundColor Yellow
Write-Host "Note: Playwright will automatically start the backend server`n" -ForegroundColor Gray

Push-Location tests
try {
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "`n✗ E2E tests had failures!" -ForegroundColor Red
        $ErrorCount++
    } else {
        Write-Host "`n✓ E2E tests passed!" -ForegroundColor Green
    }
} catch {
    Write-Host "`n✗ E2E tests failed with error: $_" -ForegroundColor Red
    $ErrorCount++
} finally {
    Pop-Location
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($ErrorCount -eq 0) {
    Write-Host "`n✓ All test suites passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n✗ $ErrorCount test suite(s) failed!" -ForegroundColor Red
    exit 1
}

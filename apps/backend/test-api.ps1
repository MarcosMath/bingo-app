# Script de prueba para la API de Bingo
# Uso: .\test-api.ps1

$baseUrl = "http://localhost:3000/api"

Write-Host "`n=== Bingo API - Test Suite ===" -ForegroundColor Cyan
Write-Host "Base URL: $baseUrl`n" -ForegroundColor Gray

# Variables globales
$token = $null
$userId = $null

# 1. Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000" -Method GET
    Write-Host "   Server is running!" -ForegroundColor Green
} catch {
    Write-Host "   ERROR: Server is not responding" -ForegroundColor Red
    Write-Host "   Make sure to run: npm run start:dev" -ForegroundColor Yellow
    exit 1
}

# 2. Register User
Write-Host "`n2. Registering new user..." -ForegroundColor Yellow
try {
    $registerBody = @{
        username = "player1"
        email = "player1@test.com"
        password = "Test123!"
    } | ConvertTo-Json

    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerBody

    Write-Host "   User registered successfully!" -ForegroundColor Green
    Write-Host "   Username: $($registerResponse.user.username)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Credits: $($registerResponse.user.credits)" -ForegroundColor Gray
    Write-Host "   Token: $($registerResponse.access_token.Substring(0,30))..." -ForegroundColor Gray
    
    $token = $registerResponse.access_token
    $userId = $registerResponse.user.id
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   User already exists, trying login..." -ForegroundColor Yellow
    } else {
        Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Login
Write-Host "`n3. Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "player1@test.com"
        password = "Test123!"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody

    Write-Host "   Login successful!" -ForegroundColor Green
    Write-Host "   Token: $($loginResponse.access_token.Substring(0,30))..." -ForegroundColor Gray
    
    $token = $loginResponse.access_token
    $userId = $loginResponse.user.id
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Get User Profile
Write-Host "`n4. Getting user profile..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    $profile = Invoke-RestMethod -Uri "$baseUrl/users/$userId" `
        -Headers $headers `
        -Method GET

    Write-Host "   Profile retrieved!" -ForegroundColor Green
    Write-Host "   ID: $($profile.id)" -ForegroundColor Gray
    Write-Host "   Username: $($profile.username)" -ForegroundColor Gray
    Write-Host "   Email: $($profile.email)" -ForegroundColor Gray
    Write-Host "   Credits: $($profile.credits)" -ForegroundColor Gray
    Write-Host "   Active: $($profile.isActive)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. List Users
Write-Host "`n5. Listing users..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }

    $users = Invoke-RestMethod -Uri "$baseUrl/users" `
        -Headers $headers `
        -Method GET

    Write-Host "   Users retrieved!" -ForegroundColor Green
    Write-Host "   Total users: $($users.meta.total)" -ForegroundColor Gray
    Write-Host "   Page: $($users.meta.page) of $($users.meta.totalPages)" -ForegroundColor Gray
} catch {
    Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Register Second User
Write-Host "`n6. Registering second user..." -ForegroundColor Yellow
try {
    $register2Body = @{
        username = "player2"
        email = "player2@test.com"
        password = "Test123!"
    } | ConvertTo-Json

    $register2Response = Invoke-RestMethod -Uri "$baseUrl/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $register2Body

    Write-Host "   Second user registered!" -ForegroundColor Green
    Write-Host "   Username: $($register2Response.user.username)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   User already exists" -ForegroundColor Yellow
    } else {
        Write-Host "   ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Summary
Write-Host "`n=== Test Summary ===" -ForegroundColor Cyan
Write-Host "All basic endpoints tested!" -ForegroundColor Green
Write-Host "`nYour token (save for manual testing):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor Gray
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "  - Test game creation" -ForegroundColor Gray
Write-Host "  - Test joining games" -ForegroundColor Gray
Write-Host "  - Test WebSocket connection" -ForegroundColor Gray
Write-Host ""

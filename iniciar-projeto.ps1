Write-Host "=====================================================================" -ForegroundColor Yellow
Write-Host "   AERO-OS // INICIANDO ECOSSISTEMA DE MICROSSERVICOS & FRONTEND" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Yellow

Write-Host "Verificando e liberando portas do cluster (8080, 8081, 8082, 8085)..." -ForegroundColor Yellow
$ports = @(8080, 8081, 8082, 8084, 8085)
foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "`n[1/5] Iniciando GATEWAY (:8080)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd gateway; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 3

Write-Host "[2/5] Iniciando AUTH SERVICE (:8081)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd auth; .\mvnw.cmd -pl spring spring-boot:run"

Start-Sleep -Seconds 3

Write-Host "[3/5] Iniciando DESPACHO SERVICE (:8082)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd despacho; .\mvnw.cmd -pl spring spring-boot:run"

Start-Sleep -Seconds 3

Write-Host "[4/5] Iniciando RELATORIO SERVICE (:8085)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd relatorio; .\mvnw.cmd -pl spring spring-boot:run"

Start-Sleep -Seconds 3

Write-Host "[5/5] Iniciando FRONTEND (React Native / Expo Web)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run web"

Write-Host "`n=====================================================================" -ForegroundColor Yellow
Write-Host "   TODOS OS SERVICOS FORAM DISPARADOS EM JANELAS INDEPENDENTES!" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Yellow

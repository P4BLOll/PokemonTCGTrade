@echo off
TITLE AERO-OS // LAUNCHER DO CLUSTER DE MICROSSERVICOS
echo =====================================================================
echo    AERO-OS // INICIANDO ECOSSISTEMA DE MICROSSERVICOS & FRONTEND
echo =====================================================================
echo.

echo Verificando e liberando portas do cluster (8080, 8081, 8082, 8085)...
for %%p in (8080 8081 8082 8084 8085) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo [1/5] Iniciando GATEWAY (:8080)...
start "AERO-OS // GATEWAY :8080" cmd /k "cd gateway && .\mvnw.cmd spring-boot:run"
timeout /t 3 /nobreak > nul

echo [2/5] Iniciando AUTH SERVICE (:8081)...
start "AERO-OS // AUTH :8081" cmd /k "cd auth && .\mvnw.cmd -pl spring spring-boot:run"
timeout /t 3 /nobreak > nul

echo [3/5] Iniciando DESPACHO SERVICE (:8082)...
start "AERO-OS // DESPACHO :8082" cmd /k "cd despacho && .\mvnw.cmd -pl spring spring-boot:run"
timeout /t 3 /nobreak > nul

echo [4/5] Iniciando RELATORIO SERVICE (:8085)...
start "AERO-OS // RELATORIO :8085" cmd /k "cd relatorio && .\mvnw.cmd -pl spring spring-boot:run"
timeout /t 3 /nobreak > nul

echo [5/5] Iniciando FRONTEND (React Native / Expo Web)...
start "AERO-OS // FRONTEND WEB" cmd /k "cd frontend && npm run web"

echo.
echo =====================================================================
echo    TODOS OS SERVICOS FORAM DISPARADOS EM JANELAS INDEPENDENTES!
echo    Acesse o Frontend no navegador (geralmente http://localhost:8081 ou 8082)
echo =====================================================================
pause

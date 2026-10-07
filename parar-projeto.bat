@echo off
TITLE AERO-OS // FINALIZADOR DE PROCESSOS
echo =====================================================================
echo    AERO-OS // ENCERRANDO SERVICOS NAS PORTAS 8080, 8081, 8082, 8085
echo =====================================================================

for %%p in (8080 8081 8082 8084 8085) do (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        echo Encerrando processo na porta %%p (PID: %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

echo.
echo Todos os servicos do backend foram finalizados com sucesso!
pause

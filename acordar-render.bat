@echo off
chcp 65001 >nul
title AERO-OS - Acordar Microsservicos no Render
echo ===============================================================
echo   AERO-OS // Acordando os 5 Microsservicos no Render...
echo   (Se estiverem em sleep, isso pode levar ate 40 segundos)
echo ===============================================================
echo.

echo [1/5] Acordando AUTH (https://auth-3kyz.onrender.com/auth/me)...
curl.exe -s -o nul -w "      -> Status HTTP: %%{http_code}\n" https://auth-3kyz.onrender.com/auth/me

echo [2/5] Acordando DESPACHO (https://despacho-yerd.onrender.com/despacho/pending)...
curl.exe -s -o nul -w "      -> Status HTTP: %%{http_code}\n" https://despacho-yerd.onrender.com/despacho/pending

echo [3/5] Acordando ESTOQUE (https://estoque-9rjl.onrender.com/estoque/metricas)...
curl.exe -s -o nul -w "      -> Status HTTP: %%{http_code}\n" https://estoque-9rjl.onrender.com/estoque/metricas

echo [4/5] Acordando RELATORIO (https://relatorio-d48t.onrender.com/relatorios/geral)...
curl.exe -s -o nul -w "      -> Status HTTP: %%{http_code}\n" https://relatorio-d48t.onrender.com/relatorios/geral

echo [5/5] Acordando GATEWAY (https://gateway-br3q.onrender.com/estoque/metricas)...
curl.exe -s -o nul -w "      -> Status HTTP: %%{http_code}\n" https://gateway-br3q.onrender.com/estoque/metricas

echo.
echo ===============================================================
echo   [OK] Todos os 5 servicos estao prontos!
echo   Abrindo https://pp-aerospace-frontend.vercel.app ...
echo ===============================================================
start https://pp-aerospace-frontend.vercel.app
pause

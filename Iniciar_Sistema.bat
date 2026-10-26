@echo off
title Nathalie's Sistema - Iniciador
echo ===================================================
echo   Iniciando Nathalie's Nails ^& Lashes Sistema...
echo ===================================================
echo.

:: Iniciar Backend PHP en puerto 8000
start "Backend PHP (Puerto 8000)" cmd /k "cd /d C:\Users\chris\.gemini\antigravity\scratch\Nathalies-Sistema\backend && C:\xampp\php\php.exe -S localhost:8000"

:: Iniciar Frontend React en puerto 5173
start "Frontend React (Puerto 5173)" cmd /k "cd /d C:\Users\chris\.gemini\antigravity\scratch\Nathalies-Sistema\frontend && npm run dev"

:: Esperar 3 segundos y abrir el navegador
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo Sistema iniciado en http://localhost:5173

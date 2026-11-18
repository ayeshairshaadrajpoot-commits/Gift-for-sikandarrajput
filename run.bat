@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Node.js not found. Install the LTS version from https://nodejs.org then run again. & pause & exit /b)
if not exist .env (copy .env.example .env >nul & echo Created .env - open it in Notepad, fill in your keys, then run this file again. & notepad .env & pause & exit /b)
if not exist node_modules (call npm install)
call npx netlify dev
pause

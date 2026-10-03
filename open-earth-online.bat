@echo off
cd /d "%~dp0"
echo Starting Earth Online...
start "" "http://127.0.0.1:4173"
"C:\Program Files\nodejs\node.exe" "%~dp0serve-dist.cjs"
echo.
echo Earth Online stopped. If this window shows an error, send it to Codex.
pause

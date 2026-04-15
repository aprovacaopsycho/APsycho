@echo off
echo ========================================================
echo SERVER LOCAL - APROVACAO PSYCHO
echo ========================================================
echo Pressione CTRL+C para encerrar o servidor.
echo O navegador abrira automaticamente.
echo.
start http://localhost:8000/
python -m http.server 8000
pause

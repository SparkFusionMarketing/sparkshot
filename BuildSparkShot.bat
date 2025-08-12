\
@echo off
setlocal
cd /d "%~dp0"
echo Cleaning dist...
rmdir /s /q dist 2>nul
echo Installing dependencies...
npm install || goto :err
echo Building installer...
set ELECTRON_BUILDER_MAX_THREADS=1
npm run build || goto :err
echo Opening dist...
explorer dist
echo Done.
exit /b 0
:err
echo Build failed. See the messages above.
exit /b 1

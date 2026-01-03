@echo off
echo Starting Admin-Candidate Workflow Application...
echo.
echo Starting backend server...
start /min "Backend Server" cmd /c "node src/server/server.js"

echo Waiting for server to start...
timeout /t 3 /nobreak >nul

echo Starting React development server...
start /min "React Dev Server" cmd /c "npm start"

echo Waiting for React server to start...
timeout /t 10 /nobreak >nul

echo Starting Electron app...
npm run electron

echo.
echo Application started! Use Ctrl+C to stop.
pause
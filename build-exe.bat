@echo off
echo Building Admin-Candidate Workflow for Production...
echo.

echo Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building React application...
call npm run build
if errorlevel 1 (
    echo Failed to build React app
    pause
    exit /b 1
)

echo.
echo Step 3: Creating Windows executable...
call npm run dist-win
if errorlevel 1 (
    echo Failed to create executable
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo The installer can be found in the 'dist' folder
echo.
pause
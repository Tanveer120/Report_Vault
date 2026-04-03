@echo off
echo Starting Report Room...

echo Starting Server...
start "Report Room Backend" cmd /k "cd server && npm run dev"

echo Starting Client...
start "Report Room Frontend" cmd /k "cd client && npm run dev"

echo Both services are starting in separate windows.

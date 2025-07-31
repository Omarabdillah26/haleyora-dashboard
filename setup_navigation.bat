@echo off
echo ========================================
echo Setting up Navigation Feature
echo ========================================

echo.
echo 1. Installing react-router-dom dependency...
npm install react-router-dom@6.22.3

echo.
echo 2. Checking if dependencies are installed correctly...
npm list react-router-dom

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Navigation features are now ready:
echo - Click division names in Categories page
echo - Automatic navigation to Tindak Lanjut
echo - Division filtering based on URL parameters
echo.
pause 
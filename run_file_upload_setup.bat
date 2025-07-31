@echo off
echo ========================================
echo Setting up File Upload Feature
echo ========================================

echo.
echo 1. Installing multer dependency...
cd backend
npm install multer@^1.4.5-lts.1
cd ..

echo.
echo 2. Running database update...
echo Please run this command manually:
echo mysql -h pintu2.minecuta.com -u omarjelek -p121212 fdcdb ^< add_file_upload_columns.sql

echo.
echo 3. Creating uploads directory...
if not exist "uploads" mkdir uploads

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your backend server
echo 2. Test file upload functionality
echo 3. Check that files are stored in uploads/ directory
echo.
pause 
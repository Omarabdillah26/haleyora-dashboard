# Backend API Setup Guide

## Overview
Backend API server yang menghubungkan frontend React dengan database MySQL.

## Struktur Project

```
haleyora-dashboard/
├── src/                    # Frontend React
├── backend/               # Backend API Server
│   ├── server.js         # Express server
│   ├── package.json      # Backend dependencies
│   └── .env             # Environment variables
└── database_schema.sql   # MySQL schema
```

## Setup Backend

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Buat file `.env` di folder `backend/`:
```env
PORT=3001
DB_HOST=pintu2.minecuta.com
DB_PORT=3306
DB_NAME=fdcdb
DB_USER=omarjelek
DB_PASSWORD=121212
NODE_ENV=development
```

### 3. Start Backend Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Database Connection
- `GET /api/test-connection` - Test MySQL connection

### Users
- `GET /api/users` - Get all users
- `POST /api/users/login` - User login

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Category Table Data
- `GET /api/category-table-data/:categoryId` - Get table data for category
- `POST /api/category-table-data` - Create new table data
- `PUT /api/category-table-data/:id` - Update table data
- `DELETE /api/category-table-data/:id` - Delete table data

### Arahans
- `GET /api/arahans` - Get all arahans
- `POST /api/arahans` - Create new arahan
- `PUT /api/arahans/:id` - Update arahan
- `DELETE /api/arahans/:id` - Delete arahan

## Database Configuration

### MySQL Connection
- **Host**: `pintu2.minecuta.com`
- **Port**: `3306`
- **Database**: `fdcdb`
- **Username**: `omarjelek`
- **Password**: `121212`

### Connection Pool
- Connection limit: 10
- Auto-reconnect: enabled
- Multiple statements: enabled

## Frontend Integration

### API Service
Frontend menggunakan `src/services/apiService.ts` untuk komunikasi dengan backend.

### Base URL
```typescript
const API_BASE_URL = 'http://localhost:3001/api';
```

## Running the Application

### 1. Start Backend
```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend
```bash
# Di terminal lain
npm run dev
```

### 3. Test Connection
1. Buka browser ke `http://localhost:5173`
2. Login dengan credentials yang ada
3. Klik menu "Database Test"
4. Klik "Test Connection"

## Troubleshooting

### Backend Connection Issues
1. **Port already in use**: Change PORT in .env
2. **MySQL connection failed**: Check database credentials
3. **CORS error**: Backend CORS is configured for all origins

### Frontend Connection Issues
1. **API not found**: Ensure backend is running on port 3001
2. **CORS error**: Backend should be running and accessible
3. **Network error**: Check if backend URL is correct

### Database Issues
1. **Connection refused**: Check if MySQL server is running
2. **Access denied**: Verify username and password
3. **Database not found**: Run `database_schema.sql` first

## Production Deployment

### Environment Variables
```env
PORT=3001
DB_HOST=your-production-host
DB_PORT=3306
DB_NAME=your-database
DB_USER=your-username
DB_PASSWORD=your-password
NODE_ENV=production
```

### Security Notes
- Use environment variables for sensitive data
- Implement proper authentication
- Add rate limiting
- Use HTTPS in production
- Implement input validation

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
``` 
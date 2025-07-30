# MySQL Database Setup Guide

## Overview
Aplikasi ini telah diubah dari Firebase Data Connect ke koneksi MySQL langsung menggunakan `mysql2` package.

## Database Configuration

### Kredensial Database
- **Host**: `pintu2.minecuta.com`
- **Port**: `3306`
- **Database**: `fdcdb`
- **Username**: `omarjelek`
- **Password**: `121212`

## Setup Database

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database Schema
Jalankan script SQL berikut di database MySQL Anda:

```sql
-- Buka file database_schema.sql dan jalankan semua perintah SQL
```

Atau jalankan perintah berikut untuk mengimport schema:
```bash
mysql -h pintu2.minecuta.com -u omarjelek -p fdcdb < database_schema.sql
```

### 3. Test Connection
Untuk mengetes koneksi database, buka browser console dan lihat apakah ada pesan "Database connected successfully".

## Struktur Database

### Tables

#### 1. users
- `id` (VARCHAR) - Primary key
- `username` (VARCHAR) - Username untuk login
- `password` (VARCHAR) - Password (plain text untuk demo)
- `role` (VARCHAR) - Role user (SUPER_ADMIN, BOD-1, KSPI, dll)
- `name` (VARCHAR) - Nama lengkap user

#### 2. categories
- `id` (VARCHAR) - Primary key
- `categoryName` (VARCHAR) - Nama kategori
- `description` (TEXT) - Deskripsi kategori
- `createdAt` (TIMESTAMP) - Waktu pembuatan
- `updatedAt` (TIMESTAMP) - Waktu update

#### 3. category_table_data
- `id` (VARCHAR) - Primary key
- `categoryId` (VARCHAR) - Foreign key ke categories
- `division` (VARCHAR) - Divisi
- `jumlah` (INT) - Total jumlah
- `proses` (INT) - Sedang dalam proses
- `selesai` (INT) - Sudah selesai
- `belumDitindaklanjuti` (INT) - Belum ditindaklanjuti
- `selesaiBerkelanjutan` (INT) - Selesai berkelanjutan
- `progress` (DECIMAL) - Progress dalam persen

#### 4. arahans
- `id` (VARCHAR) - Primary key
- `title` (VARCHAR) - Judul arahan
- `description` (TEXT) - Deskripsi arahan
- `division` (VARCHAR) - Divisi yang bertanggung jawab
- `pic` (VARCHAR) - Person in charge
- `status` (ENUM) - Status arahan
- `createdAt` (TIMESTAMP) - Waktu pembuatan
- `updatedAt` (TIMESTAMP) - Waktu update

## Penggunaan dalam Aplikasi

### 1. Import Database Hook
```typescript
import { useDatabase } from '../hooks/useDatabase';

const MyComponent = () => {
  const { 
    isConnected, 
    loading, 
    error, 
    getCategories, 
    createCategory 
  } = useDatabase();
  
  // Gunakan fungsi database
};
```

### 2. Contoh Penggunaan
```typescript
// Get all categories
const categories = await getCategories();

// Create new category
await createCategory({
  categoryName: 'New Category',
  description: 'Description here'
});

// Get user by credentials
const user = await getUserByCredentials('admin', '123456');
```

## Troubleshooting

### 1. Connection Error
- Pastikan server MySQL berjalan di `pintu2.minecuta.com`
- Periksa kredensial username dan password
- Pastikan port 3306 terbuka

### 2. Module Not Found Error
- Jalankan `npm install` untuk menginstall dependencies
- Pastikan `mysql2` terinstall

### 3. Database Schema Error
- Jalankan ulang script `database_schema.sql`
- Periksa apakah database `fdcdb` sudah dibuat

## Security Notes

⚠️ **Peringatan Keamanan**:
- Password disimpan dalam plain text (hanya untuk demo)
- Dalam production, gunakan hashing untuk password
- Gunakan environment variables untuk kredensial database
- Aktifkan SSL untuk koneksi database

## Environment Variables (Recommended)

Untuk production, gunakan environment variables:

```typescript
// .env file
DB_HOST=pintu2.minecuta.com
DB_PORT=3306
DB_NAME=fdcdb
DB_USER=omarjelek
DB_PASSWORD=121212
```

```typescript
// config/database.ts
export const dbConfig = {
  host: process.env.DB_HOST || 'pintu2.minecuta.com',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'fdcdb',
  user: process.env.DB_USER || 'omarjelek',
  password: process.env.DB_PASSWORD || '121212',
  // ... other config
};
``` 
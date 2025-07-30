# Sistem Monitoring Arahan

Aplikasi web untuk monitoring dan tracking arahan per divisi dengan fitur kategori yang dapat dikustomisasi.

## Fitur Utama

### 1. Dashboard

- Overview statistik arahan per divisi
- Progress tracking real-time
- Visualisasi data dengan grafik

### 2. Rincian Kategori

- **Fitur Baru: Tambah Kategori dengan Tabel Data**
- User dapat membuat tabel kategori baru beserta data lengkap
- Setiap kategori memiliki tabel dengan kolom:
  - NAMA DIVISI
  - JUMLAH
  - PROSES
  - SELESAI
  - BELUM DITINDAKLANJUTI
  - SELESAI BERKELANJUTAN
  - PROGRESS (dihitung otomatis)

### 3. Tindak Lanjut

- **Fitur Baru: Edit Data Tabel Kategori**
- User dapat mengedit data tabel yang dibuat di "Rincian Kategori"
- Menambahkan data baru ke tabel kategori tertentu
- Form "Create Tindak Lanjut" yang lengkap dengan semua field yang diperlukan
- Tracking status dan progress per divisi
- Person in Charge (PIC) assignment

## Cara Menggunakan Fitur "Tambah Kategori"

### Langkah 1: Akses Halaman Rincian Kategori

1. Login ke sistem
2. Navigasi ke menu "Rincian Kategori"

### Langkah 2: Buat Kategori Baru

1. Klik tombol "Tambah Kategori"
2. Isi informasi dasar:
   - **Nama Kategori**: Nama tabel yang akan ditampilkan
   - **Deskripsi**: Penjelasan singkat tentang kategori

### Langkah 3: Tambah Data Tabel

1. Klik tombol "Tambah Baris" untuk menambahkan data divisi
2. Untuk setiap baris, isi:
   - **Divisi**: Pilih dari dropdown (BOD-1, KSPI, SEKPER, VP AGA, VP KEU, VP OP)
   - **Jumlah**: Total item dalam kategori
   - **Proses**: Item yang sedang dalam proses
   - **Selesai**: Item yang sudah selesai
   - **Belum Ditindaklanjuti**: Item yang belum ditindaklanjuti
   - **Selesai Berkelanjutan**: Item yang selesai berkelanjutan
   - **Progress**: Dihitung otomatis berdasarkan data di atas

### Langkah 4: Simpan dan Tampilkan

1. Klik "Tambah" untuk menyimpan kategori baru
2. Tabel akan otomatis muncul di halaman Rincian Kategori
3. Progress bar visual akan ditampilkan untuk setiap divisi

## Cara Menggunakan Fitur "Tindak Lanjut"

### Langkah 1: Akses Halaman Tindak Lanjut

1. Login ke sistem
2. Navigasi ke menu "Tindak Lanjut"

### Langkah 2: Lihat Data Tabel Kategori

1. Halaman akan menampilkan semua tabel kategori yang telah dibuat
2. Setiap tabel menampilkan data per divisi dengan kolom:
   - **Kategori Arahan**: Nama kategori tabel
   - **Detail Arahan**: Detail arahan untuk divisi
   - **PIC**: Person in Charge (divisi)
   - **Target**: Target penyelesaian
   - **Status**: Status progress (Selesai, Proses, Selesai Berkelanjutan, Belum Ditindaklanjuti)
   - **Deskripsi Tindak Lanjut**: Progress detail

### Langkah 3: Edit Data Tabel

1. Klik ikon edit (pensil) pada baris data yang ingin diedit
2. Form "Edit Tindak Lanjut" akan muncul
3. Modifikasi data yang diperlukan
4. Klik "Simpan" untuk menyimpan perubahan

### Langkah 4: Tambah Data Baru

1. Klik tombol "New tindak lanjut" pada tabel kategori yang diinginkan
2. Form "Create Tindak Lanjut" akan muncul dengan field:
   - **Kategori Arahan**: Otomatis terisi sesuai tabel yang dipilih
   - **PIC (Person in Charge)**: Pilih divisi dari dropdown
   - **Detail Arahan**: Masukkan detail arahan (required)
   - **Target Penyelesaian**: Pilih tanggal target (required)
   - **Status**: Pilih status (required)
   - **Check Point**: Masukkan check point (optional)
   - **Deskripsi Tindak Lanjut**: Masukkan deskripsi (optional)
   - **Catatan Sekretaris & Komite Dekom**: Masukkan catatan (optional)
3. Klik "Create" untuk menambahkan data baru

### Langkah 5: Hapus Data

1. Klik ikon hapus (tempat sampah) pada baris data yang ingin dihapus
2. Data akan langsung dihapus dari tabel

### Langkah 6: Filter dan Pencarian

1. Gunakan search box untuk mencari kategori tertentu
2. Gunakan dropdown filter untuk melihat kategori tertentu
3. Pagination tersedia untuk navigasi data yang banyak

## Fitur Tambahan

### Edit Kategori

- Klik ikon edit (pensil) pada tabel kategori
- Modifikasi data yang ada
- Tambah atau hapus baris data
- Simpan perubahan

### Hapus Kategori

- Klik ikon hapus (tempat sampah) pada tabel kategori
- Konfirmasi penghapusan
- Kategori dan semua datanya akan dihapus

### Filter Kategori

- Gunakan dropdown filter untuk melihat kategori tertentu
- Pilihan "Semua Kategori" untuk melihat semua tabel

## Struktur Data

### CategoryTable

```typescript
interface CategoryTable {
  id: string;
  categoryName: string;
  description: string;
  tableData: CategoryTableData[];
  createdAt: string;
  updatedAt: string;
}
```

### CategoryTableData

```typescript
interface CategoryTableData {
  id: string;
  division: string;
  jumlah: number;
  proses: number;
  selesai: number;
  belumDitindaklanjuti: number;
  selesaiBerkelanjutan: number;
  progress: number;
}
```

## Teknologi yang Digunakan

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **Icons**: Lucide React
- **Build Tool**: Vite

## Instalasi dan Menjalankan

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Login Credentials

- **Super Admin**: admin / 123456
- **BOD-1**: bod1 / 123456
- **KSPI**: kspi / 123456
- **SEKPER**: sekper / 123456
- **VP AGA**: vpaga / 123456
- **VP KEU**: vpkeu / 123456
- **VP OP**: vpop / 123456

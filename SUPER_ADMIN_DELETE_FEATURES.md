# Fitur Hapus Kategori untuk Super Admin

## Deskripsi

Fitur ini memungkinkan user dengan role "SUPER_ADMIN" untuk menghapus tabel kategori di halaman "Rincian Kategori".

## Fitur yang Ditambahkan

### 1. Indikator Super Admin

- Badge merah di header halaman yang menunjukkan status Super Admin
- Teks "Super Admin - Dapat Menghapus Kategori" dengan ikon trash

### 2. Tombol Aksi di Header Kategori

- Tombol edit (✏️) dan hapus (🗑️) di header setiap kategori
- Hanya muncul untuk user dengan role "SUPER_ADMIN"
- Posisi yang mudah diakses di bagian atas setiap tabel kategori

### 3. Panel Informasi Super Admin

- Panel biru dengan informasi fitur Super Admin
- Panduan penggunaan untuk edit dan hapus kategori
- Hanya muncul untuk user Super Admin

### 4. Modal Konfirmasi Hapus yang Ditingkatkan

- Desain yang lebih informatif dengan ikon dan warna
- Peringatan yang jelas tentang konsekuensi penghapusan
- Konfirmasi ganda untuk mencegah penghapusan tidak sengaja

## Cara Penggunaan

### Untuk Super Admin:

1. Login dengan akun Super Admin
2. Navigasi ke halaman "Rincian Kategori"
3. Lihat badge merah di header yang menunjukkan status Super Admin
4. Untuk menghapus kategori:
   - Klik ikon hapus (🗑️) di header kategori yang ingin dihapus
   - Baca peringatan di modal konfirmasi
   - Klik "Hapus Kategori" untuk mengkonfirmasi
   - Klik "Batal" untuk membatalkan

### Untuk User Non-Super Admin:

- Tombol hapus tidak akan muncul
- Tidak ada akses ke fitur penghapusan kategori

## Keamanan

- Hanya user dengan role "SUPER_ADMIN" yang dapat mengakses fitur ini
- Konfirmasi ganda sebelum penghapusan
- Peringatan yang jelas tentang konsekuensi penghapusan
- Data yang dihapus tidak dapat dipulihkan

## File yang Dimodifikasi

- `src/components/Categories.tsx` - Menambahkan fitur delete untuk Super Admin

## Dependensi

- React Router untuk navigasi
- Lucide React untuk ikon
- Tailwind CSS untuk styling
- Context API untuk state management

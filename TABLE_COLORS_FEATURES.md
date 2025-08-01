# Fitur Warna Tabel Kategori

## Deskripsi

Fitur ini menambahkan warna yang berbeda untuk setiap tabel kategori di halaman "Rincian Kategori" agar lebih mudah dibedakan dan lebih menarik secara visual.

## Fitur yang Ditambahkan

### 1. Sistem Warna Otomatis

- Setiap tabel kategori mendapatkan warna yang berbeda secara otomatis
- 10 warna yang tersedia: Orange, Blue, Green, Purple, Red, Indigo, Pink, Teal, Yellow, Cyan
- Warna akan berulang jika jumlah tabel melebihi 10

### 2. Elemen yang Menggunakan Warna Tabel

- **Header Kategori**: Background header menggunakan warna utama tabel
- **Border Tabel**: Border tabel menggunakan warna yang sama dengan header
- **Header Tabel**: Background header tabel menggunakan warna yang lebih muda (100)
- **Link Divisi**: Warna teks link divisi menggunakan warna tabel
- **Progress Bar**: Progress bar menggunakan warna tabel yang sesuai
- **Summary Row**: Background summary row menggunakan warna yang lebih muda (200)

### 3. Konsistensi Visual

- Semua elemen dalam satu tabel menggunakan skema warna yang sama
- Hover effects menggunakan warna yang lebih gelap dari warna utama
- Transisi warna yang halus untuk interaksi user

## Daftar Warna yang Digunakan

1. **Orange** (`bg-orange-500`) - Warna default
2. **Blue** (`bg-blue-500`)
3. **Green** (`bg-green-500`)
4. **Purple** (`bg-purple-500`)
5. **Red** (`bg-red-500`)
6. **Indigo** (`bg-indigo-500`)
7. **Pink** (`bg-pink-500`)
8. **Teal** (`bg-teal-500`)
9. **Yellow** (`bg-yellow-500`)
10. **Cyan** (`bg-cyan-500`)

## Implementasi Teknis

### Fungsi Utama

```typescript
// Array warna untuk tabel kategori
const tableColors = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-yellow-500",
  "bg-cyan-500",
];

// Fungsi untuk mendapatkan warna tabel berdasarkan index
const getTableColor = (index: number) => {
  return tableColors[index % tableColors.length];
};

// Fungsi untuk mendapatkan warna hover yang sesuai
const getTableHoverColor = (index: number) => {
  const baseColor = tableColors[index % tableColors.length];
  return baseColor.replace("500", "600");
};
```

### Progress Color yang Dinamis

```typescript
const getProgressColor = (progress: number, tableIndex?: number) => {
  if (tableIndex !== undefined) {
    const baseColor = tableColors[tableIndex % tableColors.length];
    if (progress >= 80) return baseColor;
    if (progress >= 60) return baseColor.replace("500", "400");
    if (progress >= 40) return baseColor.replace("500", "300");
    return "bg-gray-300";
  }
  // Fallback untuk komponen lain
  return "bg-orange-500";
};
```

## Manfaat

### 1. Identifikasi Visual

- Setiap kategori mudah dibedakan dengan warna yang unik
- User dapat dengan cepat mengidentifikasi kategori yang berbeda

### 2. Pengalaman Pengguna

- Interface yang lebih menarik dan modern
- Navigasi yang lebih intuitif
- Pengurangan kebingungan saat melihat multiple tabel

### 3. Aksesibilitas

- Kontras warna yang baik untuk readability
- Konsistensi dalam penggunaan warna
- Hover effects yang jelas

## File yang Dimodifikasi

- `src/components/Categories.tsx` - Menambahkan sistem warna tabel

## Dependensi

- Tailwind CSS untuk utility classes warna
- React untuk state management dan rendering

## Catatan

- Warna akan berulang secara siklus jika jumlah tabel melebihi 10
- Semua warna menggunakan skala Tailwind CSS yang konsisten
- Progress bar menggunakan variasi warna yang sama dengan tabel utama

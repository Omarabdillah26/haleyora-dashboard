# Test Navigation Features

## 🧪 **Testing Guide untuk Fitur Navigasi**

### **Prerequisites:**

1. Pastikan semua dependencies terinstall:

   ```bash
   npm install react-router-dom@6.22.3
   ```

2. Jalankan aplikasi:
   ```bash
   npm run dev
   ```

### **Test Cases:**

#### **1. Test Navigasi Sidebar**

- [ ] Klik "Dashboard" → harus navigasi ke `/dashboard`
- [ ] Klik "Rincian Kategori" → harus navigasi ke `/categories`
- [ ] Klik "Tindak Lanjut" → harus navigasi ke `/tindak-lanjut`
- [ ] Sidebar harus highlight menu yang aktif

#### **2. Test Klik Nama Divisi di Rincian Kategori**

- [ ] Buka halaman "Rincian Kategori"
- [ ] Lihat nama divisi dengan icon arrow (→)
- [ ] Hover pada nama divisi → harus ada tooltip
- [ ] Klik nama divisi "BOD-1" → harus navigasi ke `/tindak-lanjut?division=BOD-1`
- [ ] Klik nama divisi "KSPI" → harus navigasi ke `/tindak-lanjut?division=KSPI`
- [ ] Klik nama divisi "SEKPER" → harus navigasi ke `/tindak-lanjut?division=SEKPER`

#### **3. Test Filter Otomatis di Tindak Lanjut**

- [ ] Setelah klik nama divisi, halaman Tindak Lanjut harus terbuka
- [ ] Header harus menampilkan "Tindak Lanjut - Filter: [nama divisi]"
- [ ] Counter harus menampilkan jumlah hasil yang difilter
- [ ] Hanya data dari divisi yang diklik yang ditampilkan
- [ ] URL harus berubah menjadi `/tindak-lanjut?division=[nama_divisi]`

#### **4. Test Clear Filter**

- [ ] Ketika ada filter aktif, tombol "Clear Filter" harus muncul
- [ ] Klik "Clear Filter" → filter harus hilang
- [ ] Semua data tindak lanjut harus ditampilkan
- [ ] Header harus kembali ke "Tindak Lanjut" (tanpa filter)
- [ ] Counter harus menampilkan total semua data

#### **5. Test URL Direct Access**

- [ ] Akses langsung `/tindak-lanjut?division=BOD-1` → harus filter otomatis
- [ ] Akses langsung `/tindak-lanjut?division=KSPI` → harus filter otomatis
- [ ] Akses langsung `/tindak-lanjut` (tanpa parameter) → harus tampil semua data

#### **6. Test Browser Navigation**

- [ ] Gunakan tombol Back browser → harus kembali ke halaman sebelumnya
- [ ] Gunakan tombol Forward browser → harus maju ke halaman berikutnya
- [ ] Refresh halaman dengan filter → filter harus tetap aktif

### **Expected Behavior:**

#### **Di Rincian Kategori:**

- Nama divisi dengan warna orange
- Icon arrow (→) di sebelah nama
- Hover effect (underline dan warna lebih gelap)
- Tooltip: "Klik untuk melihat tindak lanjut [nama divisi]"

#### **Di Tindak Lanjut:**

- Header: "Tindak Lanjut - Filter: [nama divisi]"
- Counter: "[jumlah] results"
- Tombol "Clear Filter" (abu-abu dengan icon X)
- Hanya data dari divisi yang dipilih

### **Error Cases to Test:**

- [ ] Akses URL dengan divisi yang tidak ada → harus handle gracefully
- [ ] Akses URL dengan parameter kosong → harus tampil semua data
- [ ] Network error saat navigasi → harus ada error handling

### **Performance Tests:**

- [ ] Navigasi antar halaman harus cepat (< 500ms)
- [ ] Filter data harus responsif
- [ ] Tidak ada memory leak saat navigasi berulang

### **Browser Compatibility:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### **Mobile Responsiveness:**

- [ ] Test di mobile browser
- [ ] Touch navigation harus bekerja
- [ ] UI harus responsive

### **Accessibility:**

- [ ] Keyboard navigation (Tab, Enter, Space)
- [ ] Screen reader compatibility
- [ ] Focus management
- [ ] ARIA labels

### **Debugging:**

Jika ada masalah, cek:

1. Browser console untuk error
2. Network tab untuk API calls
3. React DevTools untuk state management
4. URL parameters di address bar

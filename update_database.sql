-- Update database schema for tindak lanjut functionality
-- Run this script to add new columns to existing category_table_data table

USE fdcdb;

-- Add new columns to category_table_data table
ALTER TABLE category_table_data 
ADD COLUMN status ENUM('belum_ditindaklanjuti', 'dalam_proses', 'selesai', 'selesai_berkelanjutan') DEFAULT 'belum_ditindaklanjuti' AFTER progress,
ADD COLUMN targetPenyelesaian DATE AFTER status,
ADD COLUMN detailArahan TEXT AFTER targetPenyelesaian,
ADD COLUMN checkPoint VARCHAR(255) AFTER detailArahan,
ADD COLUMN deskripsiTindakLanjut TEXT AFTER checkPoint,
ADD COLUMN catatanSekretaris TEXT AFTER deskripsiTindakLanjut;

-- Update existing sample data with some tindak lanjut information
UPDATE category_table_data 
SET 
  status = 'dalam_proses',
  targetPenyelesaian = '2025-12-31',
  detailArahan = 'Implementasi sistem digital untuk meningkatkan efisiensi kerja',
  checkPoint = 'Review bulanan',
  deskripsiTindakLanjut = 'Sistem sedang dalam tahap pengembangan',
  catatanSekretaris = 'Progress sesuai timeline'
WHERE id = 'ctd-1';

UPDATE category_table_data 
SET 
  status = 'selesai',
  targetPenyelesaian = '2025-10-31',
  detailArahan = 'Optimasi proses bisnis untuk meningkatkan produktivitas',
  checkPoint = 'Final review',
  deskripsiTindakLanjut = 'Proses optimasi telah selesai dan berjalan dengan baik',
  catatanSekretaris = 'Proyek berhasil diselesaikan tepat waktu'
WHERE id = 'ctd-2';

UPDATE category_table_data 
SET 
  status = 'selesai_berkelanjutan',
  targetPenyelesaian = '2025-06-30',
  detailArahan = 'Program pelatihan untuk meningkatkan skill karyawan',
  checkPoint = 'Evaluasi triwulan',
  deskripsiTindakLanjut = 'Program pelatihan berkelanjutan untuk maintenance skill',
  catatanSekretaris = 'Program berjalan dengan baik dan perlu dilanjutkan'
WHERE id = 'ctd-3';

UPDATE category_table_data 
SET 
  status = 'belum_ditindaklanjuti',
  targetPenyelesaian = '2025-03-31',
  detailArahan = 'Audit internal untuk memastikan compliance',
  checkPoint = 'Planning phase',
  deskripsiTindakLanjut = 'Belum dimulai, menunggu approval dari management',
  catatanSekretaris = 'Perlu koordinasi dengan tim audit'
WHERE id = 'ctd-4';

-- Insert additional sample tindak lanjut data
INSERT INTO category_table_data (id, categoryId, division, jumlah, proses, selesai, belumDitindaklanjuti, selesaiBerkelanjutan, progress, status, targetPenyelesaian, detailArahan, checkPoint, deskripsiTindakLanjut, catatanSekretaris) VALUES
('ctd-5', 'cat-1', 'VP KEU', 15, 5, 8, 2, 1, 60.00, 'dalam_proses', '2025-11-30', 'Perseroan agar mempertahankan Sustainable Development Goals (SDGs)', 'Monthly review', 'Implementasi SDGs sedang dalam tahap evaluasi', 'Progress 60% sesuai target'),
('ctd-6', 'cat-2', 'VP AGA', 12, 3, 7, 2, 0, 58.33, 'selesai', '2025-09-30', 'Perseroan diminta melakukan ratifikasi/adopsi kebijakan ESG', 'Final review', 'Kebijakan ESG telah berhasil diadopsi', 'Proyek selesai dengan hasil memuaskan'),
('ctd-7', 'cat-3', 'BOD-1', 8, 2, 4, 2, 1, 62.50, 'selesai_berkelanjutan', '2025-12-31', 'Perseroan agar melakukan penyiapan implementasi IFRS S1 S2', 'Quarterly review', 'Implementasi IFRS S1 S2 berjalan berkelanjutan', 'Monitoring berkelanjutan diperlukan'),
('ctd-8', 'cat-1', 'SEKPER', 10, 4, 4, 2, 0, 40.00, 'dalam_proses', '2025-08-31', 'Pengembangan infrastruktur digital untuk mendukung transformasi', 'Bi-weekly review', 'Infrastruktur sedang dalam tahap pengembangan', 'Progress sesuai rencana'),
('ctd-9', 'cat-2', 'KSPI', 6, 1, 3, 2, 0, 50.00, 'selesai', '2025-07-31', 'Implementasi sistem manajemen risiko terintegrasi', 'Final review', 'Sistem manajemen risiko telah berhasil diimplementasikan', 'Proyek selesai dengan baik'),
('ctd-10', 'cat-3', 'VP OP', 20, 6, 10, 4, 2, 60.00, 'dalam_proses', '2025-12-31', 'Program pengembangan kompetensi karyawan berkelanjutan', 'Monthly review', 'Program pengembangan sedang berjalan aktif', 'Progress 60% sesuai target'); 
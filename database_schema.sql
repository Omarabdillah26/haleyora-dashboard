-- Database schema for haleyora-dashboard
-- Run this script in your MySQL database

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS fdcdb;
USE fdcdb;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    categoryName VARCHAR(100) NOT NULL,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Category table data
CREATE TABLE IF NOT EXISTS category_table_data (
    id VARCHAR(36) PRIMARY KEY,
    categoryId VARCHAR(36) NOT NULL,
    division VARCHAR(50) NOT NULL,
    jumlah INT DEFAULT 0,
    proses INT DEFAULT 0,
    selesai INT DEFAULT 0,
    belumDitindaklanjuti INT DEFAULT 0,
    selesaiBerkelanjutan INT DEFAULT 0,
    progress DECIMAL(5,2) DEFAULT 0.00,
    status ENUM('belum_ditindaklanjuti', 'dalam_proses', 'selesai', 'selesai_berkelanjutan') DEFAULT 'belum_ditindaklanjuti',
    targetPenyelesaian DATE,
    detailArahan TEXT,
    checkPoint VARCHAR(255),
    deskripsiTindakLanjut TEXT,
    catatanSekretaris TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
);

-- Arahans table
CREATE TABLE IF NOT EXISTS arahans (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    division VARCHAR(50) NOT NULL,
    pic VARCHAR(100) NOT NULL,
    status ENUM('dalam_proses', 'selesai', 'selesai_berkelanjutan', 'belum_ditindaklanjuti') DEFAULT 'belum_ditindaklanjuti',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial users data
INSERT INTO users (id, username, password, role, name) VALUES
('1', 'bod1', '123456', 'BOD-1', 'Board of Directors 1'),
('2', 'kspi', '123456', 'KSPI', 'KSPI User'),
('3', 'sekper', '123456', 'SEKPER', 'Sekretaris Perusahaan'),
('4', 'vpaga', '123456', 'VP AGA', 'VP Administrasi & Governance Affairs'),
('5', 'vpkeu', '123456', 'VP KEU', 'VP Keuangan'),
('6', 'vpop', '123456', 'VP OP', 'VP Operasi'),
('8', 'vpren', '123456', 'VP REN', 'VP Renovasi'),
('9', 'vpmhc', '123456', 'VP MHC', 'VP Manajemen & Human Capital'),
('10', 'manhk', '123456', 'MAN HK', 'Manajer Human Capital'),
('11', 'manmr', '123456', 'MAN MR', 'Manajer Marketing'),
('7', 'admin', '123456', 'SUPER_ADMIN', 'Super Administrator');

-- Insert sample categories
INSERT INTO categories (id, categoryName, description) VALUES
('cat-1', 'Proyek Digital', 'Implementasi sistem digital untuk meningkatkan efisiensi'),
('cat-2', 'Optimasi Proses', 'Optimasi proses bisnis untuk meningkatkan produktivitas'),
('cat-3', 'Pelatihan', 'Program pelatihan untuk meningkatkan skill karyawan');

-- Insert sample category table data
INSERT INTO category_table_data (id, categoryId, division, jumlah, proses, selesai, belumDitindaklanjuti, selesaiBerkelanjutan, progress) VALUES
('ctd-1', 'cat-1', 'SEKPER', 10, 3, 5, 2, 1, 60.00),
('ctd-2', 'cat-1', 'KSPI', 8, 2, 4, 2, 0, 50.00),
('ctd-3', 'cat-2', 'VP OP', 12, 4, 6, 2, 2, 66.67),
('ctd-4', 'cat-3', 'VP AGA', 6, 1, 3, 2, 1, 50.00);

-- Insert sample arahans
INSERT INTO arahans (id, title, description, division, pic, status) VALUES
('arah-1', 'Implementasi Sistem Digital', 'Mengimplementasikan sistem digital untuk meningkatkan efisiensi kerja', 'SEKPER', 'John Doe', 'dalam_proses'),
('arah-2', 'Optimasi Proses Bisnis', 'Melakukan optimasi proses bisnis untuk meningkatkan produktivitas', 'KSPI', 'Jane Smith', 'selesai'),
('arah-3', 'Pelatihan Karyawan', 'Program pelatihan untuk meningkatkan skill karyawan', 'VP OP', 'Bob Johnson', 'selesai'),
('arah-4', 'Audit Internal', 'Melakukan audit internal untuk memastikan compliance', 'VP OP', 'Alice Brown', 'selesai_berkelanjutan'); 
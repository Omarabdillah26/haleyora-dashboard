-- Add file upload columns to category_table_data table
-- Run this script to add file upload functionality

USE fdcdb;

-- Add file upload columns
ALTER TABLE category_table_data 
ADD COLUMN uploadedFiles TEXT AFTER catatanSekretaris,
ADD COLUMN fileNames TEXT AFTER uploadedFiles;

-- Update existing records to have empty file arrays
UPDATE category_table_data 
SET 
  uploadedFiles = '[]',
  fileNames = '[]'
WHERE uploadedFiles IS NULL; 
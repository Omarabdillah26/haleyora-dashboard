import mysql from 'mysql2/promise';
import { dbConfig } from '../config/database';

// Create connection pool with better error handling
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  queueLimit: 0,
  multipleStatements: true,
});

// Test database connection with detailed error reporting
export const testConnection = async () => {
  try {
    console.log('Attempting to connect to MySQL...');
    console.log('Connection config:', {
      host: dbConfig.host,
      port: dbConfig.port,
      database: dbConfig.database,
      user: dbConfig.user,
      // password: '***' // Don't log password
    });

    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', rows);
    
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // Provide more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Check specific error types
    const errorObj = error as any;
    if (errorObj.code === 'ECONNREFUSED') {
      console.error('Connection refused - check if MySQL server is running');
    } else if (errorObj.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('Access denied - check username and password');
    } else if (errorObj.code === 'ER_BAD_DB_ERROR') {
      console.error('Database does not exist');
    }
    
    return false;
  }
};

// Generic query function with better error handling
export const executeQuery = async (query: string, params?: any[]) => {
  try {
    console.log('Executing query:', query);
    console.log('Query params:', params);
    
    const [rows] = await pool.execute(query, params);
    console.log('Query result:', rows);
    return rows;
  } catch (error) {
    console.error('Query execution failed:', error);
    console.error('Query was:', query);
    console.error('Params were:', params);
    throw error;
  }
};

// Get all users
export const getUsers = async () => {
  try {
    const query = 'SELECT * FROM users';
    return await executeQuery(query);
  } catch (error) {
    console.error('Failed to get users:', error);
    return [];
  }
};

// Get user by username and password
export const getUserByCredentials = async (username: string, password: string) => {
  try {
    const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
    const result = await executeQuery(query, [username, password]);
    return Array.isArray(result) ? result[0] : null;
  } catch (error) {
    console.error('Failed to get user by credentials:', error);
    return null;
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    const query = 'SELECT * FROM categories';
    return await executeQuery(query);
  } catch (error) {
    console.error('Failed to get categories:', error);
    return [];
  }
};

// Get category by ID
export const getCategoryById = async (id: string) => {
  try {
    const query = 'SELECT * FROM categories WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return Array.isArray(result) ? result[0] : null;
  } catch (error) {
    console.error('Failed to get category by ID:', error);
    return null;
  }
};

// Create new category
export const createCategory = async (categoryData: any) => {
  try {
    const query = 'INSERT INTO categories (categoryName, description, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())';
    const result = await executeQuery(query, [categoryData.categoryName, categoryData.description]);
    return result;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
};

// Update category
export const updateCategory = async (id: string, categoryData: any) => {
  try {
    const query = 'UPDATE categories SET categoryName = ?, description = ?, updatedAt = NOW() WHERE id = ?';
    const result = await executeQuery(query, [categoryData.categoryName, categoryData.description, id]);
    return result;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string) => {
  try {
    const query = 'DELETE FROM categories WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result;
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
};

// Get category table data
export const getCategoryTableData = async (categoryId: string) => {
  try {
    const query = 'SELECT * FROM category_table_data WHERE categoryId = ?';
    return await executeQuery(query, [categoryId]);
  } catch (error) {
    console.error('Failed to get category table data:', error);
    return [];
  }
};

// Create category table data
export const createCategoryTableData = async (tableData: any) => {
  try {
    const query = 'INSERT INTO category_table_data (categoryId, division, jumlah, proses, selesai, belumDitindaklanjuti, selesaiBerkelanjutan, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const result = await executeQuery(query, [
      tableData.categoryId,
      tableData.division,
      tableData.jumlah,
      tableData.proses,
      tableData.selesai,
      tableData.belumDitindaklanjuti,
      tableData.selesaiBerkelanjutan,
      tableData.progress
    ]);
    return result;
  } catch (error) {
    console.error('Failed to create category table data:', error);
    throw error;
  }
};

// Update category table data
export const updateCategoryTableData = async (id: string, tableData: any) => {
  try {
    const query = 'UPDATE category_table_data SET division = ?, jumlah = ?, proses = ?, selesai = ?, belumDitindaklanjuti = ?, selesaiBerkelanjutan = ?, progress = ? WHERE id = ?';
    const result = await executeQuery(query, [
      tableData.division,
      tableData.jumlah,
      tableData.proses,
      tableData.selesai,
      tableData.belumDitindaklanjuti,
      tableData.selesaiBerkelanjutan,
      tableData.progress,
      id
    ]);
    return result;
  } catch (error) {
    console.error('Failed to update category table data:', error);
    throw error;
  }
};

// Delete category table data
export const deleteCategoryTableData = async (id: string) => {
  try {
    const query = 'DELETE FROM category_table_data WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result;
  } catch (error) {
    console.error('Failed to delete category table data:', error);
    throw error;
  }
};

// Get all arahans
export const getArahans = async () => {
  try {
    const query = 'SELECT * FROM arahans';
    return await executeQuery(query);
  } catch (error) {
    console.error('Failed to get arahans:', error);
    return [];
  }
};

// Create new arahan
export const createArahan = async (arahanData: any) => {
  try {
    const query = 'INSERT INTO arahans (title, description, division, pic, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())';
    const result = await executeQuery(query, [
      arahanData.title,
      arahanData.description,
      arahanData.division,
      arahanData.pic,
      arahanData.status
    ]);
    return result;
  } catch (error) {
    console.error('Failed to create arahan:', error);
    throw error;
  }
};

// Update arahan
export const updateArahan = async (id: string, arahanData: any) => {
  try {
    const query = 'UPDATE arahans SET title = ?, description = ?, division = ?, pic = ?, status = ?, updatedAt = NOW() WHERE id = ?';
    const result = await executeQuery(query, [
      arahanData.title,
      arahanData.description,
      arahanData.division,
      arahanData.pic,
      arahanData.status,
      id
    ]);
    return result;
  } catch (error) {
    console.error('Failed to update arahan:', error);
    throw error;
  }
};

// Delete arahan
export const deleteArahan = async (id: string) => {
  try {
    const query = 'DELETE FROM arahans WHERE id = ?';
    const result = await executeQuery(query, [id]);
    return result;
  } catch (error) {
    console.error('Failed to delete arahan:', error);
    throw error;
  }
}; 
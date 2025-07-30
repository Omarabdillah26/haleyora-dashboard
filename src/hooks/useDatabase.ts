import { useState, useEffect } from 'react';
import * as apiService from '../services/apiService';

export const useDatabase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiService.testConnection();
      setIsConnected(result.success);
      console.log('✅ API connection successful:', result.message);
    } catch (err) {
      console.error('❌ API connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const executeQuery = async (queryFn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryFn();
      return result;
    } catch (err) {
      console.error('Query execution failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Query failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    isConnected,
    loading,
    error,
    testConnection,
    executeQuery,
    // Database operations using API
    getUsers: () => executeQuery(apiService.getUsers),
    getUserByCredentials: (username: string, password: string) => 
      executeQuery(() => apiService.loginUser(username, password)),
    getCategories: () => executeQuery(apiService.getCategories),
    getCategoryById: (id: string) => executeQuery(() => apiService.getCategoryById(id)),
    createCategory: (data: any) => executeQuery(() => apiService.createCategory(data)),
    updateCategory: (id: string, data: any) => executeQuery(() => apiService.updateCategory(id, data)),
    deleteCategory: (id: string) => executeQuery(() => apiService.deleteCategory(id)),
    getCategoryTableData: (categoryId: string) => executeQuery(() => apiService.getCategoryTableData(categoryId)),
    createCategoryTableData: (data: any) => executeQuery(() => apiService.createCategoryTableData(data)),
    updateCategoryTableData: (id: string, data: any) => executeQuery(() => apiService.updateCategoryTableData(id, data)),
    deleteCategoryTableData: (id: string) => executeQuery(() => apiService.deleteCategoryTableData(id)),
    getArahans: () => executeQuery(apiService.getArahans),
    createArahan: (data: any) => executeQuery(() => apiService.createArahan(data)),
    updateArahan: (id: string, data: any) => executeQuery(() => apiService.updateArahan(id, data)),
    deleteArahan: (id: string) => executeQuery(() => apiService.deleteArahan(id)),
  };
}; 
import { getApiUrl } from "../config/api";

const API_BASE_URL = getApiUrl();

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    console.log(`Making API call to: ${API_BASE_URL}${endpoint}`);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    console.log(`Response status: ${response.status}`);
    console.log(`Response headers:`, response.headers);

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error(`Non-JSON response from ${endpoint}:`, text);
      throw new Error(
        `Expected JSON response but got: ${contentType}. Server might be down or endpoint not found.`
      );
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
};

// Test connection
export const testConnection = async () => {
  return apiCall("/test-connection");
};

// Test server status
export const testServerStatus = async () => {
  const response = await apiCall("/server-status");
  return response;
};

// Users API
export const getUsers = async () => {
  const response = await apiCall("/users");
  return response.data;
};

export const loginUser = async (username: string, password: string) => {
  const response = await apiCall("/users/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return response.data;
};

// Categories API
export const getCategories = async () => {
  const response = await apiCall("/categories");
  return response.data;
};

export const getCategoryById = async (id: string) => {
  const response = await apiCall(`/categories/${id}`);
  return response.data;
};

export const createCategory = async (categoryData: any) => {
  const response = await apiCall("/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
  return response.data;
};

export const updateCategory = async (id: string, categoryData: any) => {
  const response = await apiCall(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
  return response;
};

export const deleteCategory = async (id: string) => {
  const response = await apiCall(`/categories/${id}`, {
    method: "DELETE",
  });
  return response;
};

// Category Table Data API
export const getCategoryTableData = async (categoryId: string) => {
  const response = await apiCall(`/category-table-data/${categoryId}`);
  return response.data;
};

export const createCategoryTableData = async (tableData: any) => {
  const response = await apiCall("/category-table-data", {
    method: "POST",
    body: JSON.stringify(tableData),
  });
  return response.data;
};

export const updateCategoryTableData = async (id: string, tableData: any) => {
  const response = await apiCall(`/category-table-data/${id}`, {
    method: "PUT",
    body: JSON.stringify(tableData),
  });
  return response.data;
};

export const deleteCategoryTableData = async (id: string) => {
  const response = await apiCall(`/category-table-data/${id}`, {
    method: "DELETE",
  });
  return response;
};

// Arahans API
export const getArahans = async () => {
  const response = await apiCall("/arahans");
  return response.data;
};

export const createArahan = async (arahanData: any) => {
  const response = await apiCall("/arahans", {
    method: "POST",
    body: JSON.stringify(arahanData),
  });
  return response.data;
};

export const updateArahan = async (id: string, arahanData: any) => {
  const response = await apiCall(`/arahans/${id}`, {
    method: "PUT",
    body: JSON.stringify(arahanData),
  });
  return response;
};

export const deleteArahan = async (id: string) => {
  const response = await apiCall(`/arahans/${id}`, {
    method: "DELETE",
  });
  return response;
};

// File Upload API
export const uploadFiles = async (files: File[]) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_BASE_URL}/upload-files`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload files");
  }

  const result = await response.json();
  return result.data;
};

export const deleteFile = async (filename: string) => {
  const response = await apiCall(`/delete-file/${filename}`, {
    method: "DELETE",
  });
  return response;
};

export const getFileUrl = (filename: string) => {
  return `${API_BASE_URL}/download/${filename}`;
};

export const getFileViewUrl = (filename: string) => {
  return `${API_BASE_URL}/view/${filename}`;
};

// Tindak Lanjut API
export const getTindakLanjut = async () => {
  const response = await apiCall("/tindak-lanjut");
  return response.data;
};

export const getTindakLanjutById = async (id: string) => {
  const response = await apiCall(`/tindak-lanjut/${id}`);
  return response.data;
};

export const createTindakLanjut = async (tindakLanjutData: any) => {
  const response = await apiCall("/tindak-lanjut", {
    method: "POST",
    body: JSON.stringify(tindakLanjutData),
  });
  return response.data;
};

export const updateTindakLanjut = async (id: string, tindakLanjutData: any) => {
  console.log("apiService: Updating tindak lanjut with ID:", id);
  console.log("apiService: Data to update:", tindakLanjutData);

  const response = await apiCall(`/tindak-lanjut/${id}`, {
    method: "PUT",
    body: JSON.stringify(tindakLanjutData),
  });

  console.log("apiService: Update response:", response);
  return response;
};

export const deleteTindakLanjut = async (id: string) => {
  const response = await apiCall(`/tindak-lanjut/${id}`, {
    method: "DELETE",
  });
  return response;
};

// Test tindak_lanjut table
export const testTindakLanjutTable = async () => {
  const response = await apiCall("/test-tindak-lanjut-table");
  return response;
};

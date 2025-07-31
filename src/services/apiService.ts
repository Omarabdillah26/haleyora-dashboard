const API_BASE_URL = "http://localhost:3001/api";

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

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
  return `${API_BASE_URL}/uploads/${filename}`;
};

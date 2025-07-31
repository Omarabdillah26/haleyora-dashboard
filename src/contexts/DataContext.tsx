import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Arahan, Category, CategoryTable } from "../types";
import * as apiService from "../services/apiService";

interface DataContextType {
  arahan: Arahan[];
  categories: Category[];
  categoryTables: CategoryTable[];
  loading: boolean;
  error: string | null;
  addArahan: (
    arahan: Omit<Arahan, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateArahan: (id: string, arahan: Partial<Arahan>) => Promise<void>;
  deleteArahan: (id: string) => Promise<void>;
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addCategoryTable: (
    categoryTable: Omit<CategoryTable, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  updateCategoryTable: (
    id: string,
    categoryTable: Partial<CategoryTable>
  ) => Promise<void>;
  deleteCategoryTable: (id: string) => Promise<void>;
  getArahanByDivision: (division: string) => Arahan[];
  getCategoriesByDivision: (division: string) => Category[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [arahan, setArahan] = useState<Arahan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTables, setCategoryTables] = useState<CategoryTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from API on mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load arahans
      const arahansData = await apiService.getArahans();
      setArahan(arahansData);

      // Load categories
      const categoriesData = await apiService.getCategories();
      setCategories(categoriesData);

      // Load category tables with their associated table data
      const categoryTablesData = await Promise.all(
        categoriesData.map(async (cat: Category) => {
          // Get table data for this category
          const tableDataResponse = await apiService.getCategoryTableData(
            cat.id
          );
          const tableData = tableDataResponse || [];

          return {
            id: cat.id,
            categoryName: cat.categoryName || "Unnamed Category",
            description: cat.description || "",
            tableData: tableData,
            createdAt: cat.createdAt || new Date().toISOString().split("T")[0],
            updatedAt: cat.updatedAt || new Date().toISOString().split("T")[0],
          };
        })
      );
      setCategoryTables(categoryTablesData);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const addArahan = async (
    newArahan: Omit<Arahan, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const createdArahan = await apiService.createArahan(newArahan);
      setArahan((prev) => [...prev, createdArahan]);
    } catch (err) {
      console.error("Failed to add arahan:", err);
      throw err;
    }
  };

  const updateArahan = async (id: string, updates: Partial<Arahan>) => {
    try {
      await apiService.updateArahan(id, updates);
      setArahan((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update arahan:", err);
      throw err;
    }
  };

  const deleteArahan = async (id: string) => {
    try {
      await apiService.deleteArahan(id);
      setArahan((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete arahan:", err);
      throw err;
    }
  };

  const addCategory = async (
    newCategory: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const createdCategory = await apiService.createCategory(newCategory);
      setCategories((prev) => [...prev, createdCategory]);
    } catch (err) {
      console.error("Failed to add category:", err);
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await apiService.updateCategory(id, updates);
      setCategories((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...updates,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : item
        )
      );
    } catch (err) {
      console.error("Failed to update category:", err);
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await apiService.deleteCategory(id);
      setCategories((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete category:", err);
      throw err;
    }
  };

  const addCategoryTable = async (
    newCategoryTable: Omit<CategoryTable, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      // Create a category with the correct field names
      const categoryData = {
        categoryName: newCategoryTable.categoryName,
        description: newCategoryTable.description,
      };

      const createdCategory = await apiService.createCategory(categoryData);

      // Add table data for each division
      for (const tableData of newCategoryTable.tableData) {
        await apiService.createCategoryTableData({
          categoryId: createdCategory.id,
          division: tableData.division,
          jumlah: tableData.jumlah,
          proses: tableData.proses,
          selesai: tableData.selesai,
          belumDitindaklanjuti: tableData.belumDitindaklanjuti,
          selesaiBerkelanjutan: tableData.selesaiBerkelanjutan,
          progress: tableData.progress,
          status: tableData.status || "belum_ditindaklanjuti",
          targetPenyelesaian: tableData.targetPenyelesaian,
          detailArahan: tableData.detailArahan,
          checkPoint: tableData.checkPoint,
          deskripsiTindakLanjut: tableData.deskripsiTindakLanjut,
          catatanSekretaris: tableData.catatanSekretaris,
        });
      }

      // Refresh data to get the updated state
      await refreshData();
    } catch (err) {
      console.error("Failed to add category table:", err);
      throw err;
    }
  };

  const updateCategoryTable = async (
    id: string,
    updates: Partial<CategoryTable>
  ) => {
    try {
      // Update the category if categoryName or description is provided
      if (updates.categoryName || updates.description) {
        await apiService.updateCategory(id, {
          categoryName: updates.categoryName,
          description: updates.description,
        });
      }

      // Update table data if provided
      if (updates.tableData) {
        // Get existing table data
        const existingTableData = await apiService.getCategoryTableData(id);

        // Create a map of existing data by ID for easy lookup
        const existingDataMap = new Map(
          existingTableData.map((item: any) => [item.id, item])
        );

        // Process each table data item
        for (const tableData of updates.tableData) {
          if (existingDataMap.has(tableData.id)) {
            // Update existing record
            await apiService.updateCategoryTableData(tableData.id, {
              categoryId: id,
              division: tableData.division,
              jumlah: tableData.jumlah,
              proses: tableData.proses,
              selesai: tableData.selesai,
              belumDitindaklanjuti: tableData.belumDitindaklanjuti,
              selesaiBerkelanjutan: tableData.selesaiBerkelanjutan,
              progress: tableData.progress,
              status: tableData.status,
              targetPenyelesaian: tableData.targetPenyelesaian,
              detailArahan: tableData.detailArahan,
              checkPoint: tableData.checkPoint,
              deskripsiTindakLanjut: tableData.deskripsiTindakLanjut,
              catatanSekretaris: tableData.catatanSekretaris,
            });
          } else {
            // Create new record
            await apiService.createCategoryTableData({
              categoryId: id,
              division: tableData.division,
              jumlah: tableData.jumlah,
              proses: tableData.proses,
              selesai: tableData.selesai,
              belumDitindaklanjuti: tableData.belumDitindaklanjuti,
              selesaiBerkelanjutan: tableData.selesaiBerkelanjutan,
              progress: tableData.progress,
              status: tableData.status,
              targetPenyelesaian: tableData.targetPenyelesaian,
              detailArahan: tableData.detailArahan,
              checkPoint: tableData.checkPoint,
              deskripsiTindakLanjut: tableData.deskripsiTindakLanjut,
              catatanSekretaris: tableData.catatanSekretaris,
            });
          }
        }
      }

      // Refresh data to ensure all components are updated
      await refreshData();
    } catch (err) {
      console.error("Failed to update category table:", err);
      throw err;
    }
  };

  const deleteCategoryTable = async (id: string) => {
    try {
      await apiService.deleteCategory(id);
      setCategoryTables((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Failed to delete category table:", err);
      throw err;
    }
  };

  const getArahanByDivision = (division: string) => {
    return arahan.filter((item) => item.division === division);
  };

  const getCategoriesByDivision = (division: string) => {
    // Since categories don't have division field, return all categories
    // Division filtering should be done at the table data level
    return categories;
  };

  const value = {
    arahan,
    categories,
    categoryTables,
    loading,
    error,
    addArahan,
    updateArahan,
    deleteArahan,
    addCategory,
    updateCategory,
    deleteCategory,
    addCategoryTable,
    updateCategoryTable,
    deleteCategoryTable,
    getArahanByDivision,
    getCategoriesByDivision,
    refreshData,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

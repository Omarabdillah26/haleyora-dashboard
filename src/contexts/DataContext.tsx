import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Arahan, Category, CategoryTable } from "../types";
import {
  initialArahan,
  initialCategories,
  initialCategoryTables,
} from "../data/mockData";

interface DataContextType {
  arahan: Arahan[];
  categories: Category[];
  categoryTables: CategoryTable[];
  addArahan: (arahan: Omit<Arahan, "id" | "createdAt" | "updatedAt">) => void;
  updateArahan: (id: string, arahan: Partial<Arahan>) => void;
  deleteArahan: (id: string) => void;
  addCategory: (
    category: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  addCategoryTable: (
    categoryTable: Omit<CategoryTable, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateCategoryTable: (
    id: string,
    categoryTable: Partial<CategoryTable>
  ) => void;
  deleteCategoryTable: (id: string) => void;
  getArahanByDivision: (division: string) => Arahan[];
  getCategoriesByDivision: (division: string) => Category[];
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

  useEffect(() => {
    const savedArahan = localStorage.getItem("arahan");
    const savedCategories = localStorage.getItem("categories");
    const savedCategoryTables = localStorage.getItem("categoryTables");

    setArahan(savedArahan ? JSON.parse(savedArahan) : initialArahan);
    setCategories(
      savedCategories ? JSON.parse(savedCategories) : initialCategories
    );
    setCategoryTables(
      savedCategoryTables
        ? JSON.parse(savedCategoryTables)
        : initialCategoryTables
    );
  }, []);

  useEffect(() => {
    localStorage.setItem("arahan", JSON.stringify(arahan));
  }, [arahan]);

  useEffect(() => {
    localStorage.setItem("categories", JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem("categoryTables", JSON.stringify(categoryTables));
  }, [categoryTables]);

  const addArahan = (
    newArahan: Omit<Arahan, "id" | "createdAt" | "updatedAt">
  ) => {
    const arahan_obj: Arahan = {
      ...newArahan,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setArahan((prev) => [...prev, arahan_obj]);
  };

  const updateArahan = (id: string, updates: Partial<Arahan>) => {
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
  };

  const deleteArahan = (id: string) => {
    setArahan((prev) => prev.filter((item) => item.id !== id));
  };

  const addCategory = (
    newCategory: Omit<Category, "id" | "createdAt" | "updatedAt">
  ) => {
    const category: Category = {
      ...newCategory,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setCategories((prev) => [...prev, category]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
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
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((item) => item.id !== id));
  };

  const addCategoryTable = (
    newCategoryTable: Omit<CategoryTable, "id" | "createdAt" | "updatedAt">
  ) => {
    const categoryTable: CategoryTable = {
      ...newCategoryTable,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setCategoryTables((prev) => [...prev, categoryTable]);
  };

  const updateCategoryTable = (id: string, updates: Partial<CategoryTable>) => {
    setCategoryTables((prev) =>
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
  };

  const deleteCategoryTable = (id: string) => {
    setCategoryTables((prev) => prev.filter((item) => item.id !== id));
  };

  const getArahanByDivision = (division: string) => {
    return arahan.filter((item) => item.division === division);
  };

  const getCategoriesByDivision = (division: string) => {
    return categories.filter((item) => item.division === division);
  };

  const value = {
    arahan,
    categories,
    categoryTables,
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
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

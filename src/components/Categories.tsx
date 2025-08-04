import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useRealTimeSync } from "../hooks/useRealTimeSync";
import {
  Plus,
  Edit,
  Trash2,
  Grid3X3,
  X,
  Filter,
  Plus as PlusIcon,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { CategoryTable, CategoryTableData } from "../types";

const divisions = ["BOD-1", "KSPI", "SEKPER", "VP AGA", "VP KEU", "VP OP", "VP REN", "VP MHC", "MAN HK", "MAN MR"];

// Array warna untuk tabel kategori
const tableColors = [
  "bg-orange-500", // Orange (default)
  "bg-blue-500", // Blue
  "bg-green-500", // Green
  "bg-purple-500", // Purple
  "bg-red-500", // Red
  "bg-indigo-500", // Indigo
  "bg-pink-500", // Pink
  "bg-teal-500", // Teal
  "bg-yellow-500", // Yellow
  "bg-cyan-500", // Cyan
];

const Categories: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    categories,
    tindakLanjut,
    getCategoryStatsFromTindakLanjut,
    getCategoryStatsByDivision,
    loading,
    refreshing,
    error,
    addCategory,
    refreshData,
    updateCategory,
    deleteCategory,
  } = useData();
  const { syncData } = useRealTimeSync();

  // Debug: Log when categories change
  useEffect(() => {
    // console.log("Categories updated:", categories);
  }, [categories]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getProgressColor = (progress: number, tableIndex?: number) => {
    if (tableIndex !== undefined) {
      const baseColor = tableColors[tableIndex % tableColors.length];
      if (progress >= 80) return baseColor;
      if (progress >= 60) return baseColor.replace("500", "400");
      if (progress >= 40) return baseColor.replace("500", "300");
      return "bg-gray-300";
    }
    // Fallback untuk komponen lain yang tidak memiliki tableIndex
    if (progress >= 80) return "bg-orange-500";
    if (progress >= 60) return "bg-orange-400";
    if (progress >= 40) return "bg-orange-300";
    return "bg-gray-300";
  };

  // Fungsi untuk mendapatkan warna tabel berdasarkan index
  const getTableColor = (index: number) => {
    return tableColors[index % tableColors.length];
  };

  // Fungsi untuk mendapatkan warna hover yang sesuai
  const getTableHoverColor = (index: number) => {
    const baseColor = tableColors[index % tableColors.length];
    return baseColor.replace("500", "600");
  };

  const navigateToTindakLanjut = (division: string, categoryName?: string) => {
    const params = new URLSearchParams();
    params.set('pic', division);
    if (categoryName) {
      params.set('kategoriArahan', categoryName);
    }
    navigate(`/tindak-lanjut?${params.toString()}`);
  };

  const handleAddCategory = () => {
    setFormData({
      categoryName: "",
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setEditingCategory(null);
    setFormData({
      categoryName: "",
      description: "",
    });
  };

  const handleEditCategory = (categoryName: string) => {
    // Find the category from categories array
    const category = categories.find(cat => cat.categoryName === categoryName);
    if (category) {
      setEditingCategory(category);
      setFormData({
        categoryName: category.categoryName,
        description: category.description || "",
      });
      setIsEditMode(true);
      setIsModalOpen(true);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    // Show confirmation first
    setDeleteConfirm(categoryName);
  };

  const confirmDeleteCategory = async (categoryName: string) => {
    // Find the category from categories array
    const category = categories.find(cat => cat.categoryName === categoryName);
    if (category) {
      try {
        await deleteCategory(category.id);
        await refreshData();
        setDeleteConfirm(null);
      } catch (error) {
        console.error("Failed to delete category:", error);
        alert("Gagal menghapus kategori. Silakan coba lagi.");
      }
    }
  };

  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      alert("Nama kategori harus diisi");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditMode && editingCategory) {
        // Update existing category
        await updateCategory(editingCategory.id, {
          categoryName: formData.categoryName.trim(),
          description: formData.description.trim() || formData.categoryName.trim(),
        });
      } else {
        // Add new category
        await addCategory({
          categoryName: formData.categoryName.trim(),
          description: formData.description.trim() || formData.categoryName.trim(),
        });
      }
      
      // Reset form and close modal
      setFormData({
        categoryName: "",
        description: "",
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingCategory(null);
      
      // Refresh data
      await refreshData();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Gagal menyimpan kategori. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get unique category names from categories array instead of tindak_lanjut
  const uniqueCategories = categories.map(cat => cat.categoryName);

  const filteredCategories = selectedCategory === "all" 
    ? uniqueCategories 
    : uniqueCategories.filter(cat => cat.trim().toLowerCase() === selectedCategory.trim().toLowerCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rincian Kategori</h2>
          <p className="text-gray-600 mt-1">
            Progress monitoring per kategori dan divisi
            {user?.role === "SUPER_ADMIN" && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <Trash2 className="w-3 h-3 mr-1" />
                Super Admin - Dapat Menghapus Kategori
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category.id} value={category.categoryName}>
                  {category.categoryName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddCategory}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-hidden">
          {error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">❌ Error: {error}</div>
              <p className="text-gray-500">Failed to load categories</p>
            </div>
          ) : categories.length === 0 && !loading && !refreshing ? (
            <div className="text-center py-8">
              <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada kategori yang dibuat</p>
            </div>
          ) : (
            <div className="space-y-8">
              {refreshing && (
                <div className="flex items-center justify-center py-4">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Refreshing data...</span>
                  </div>
                </div>
              )}
              {filteredCategories.map((categoryName) => {
                // Find the category object from categories array
                const category = categories.find(cat => cat.categoryName === categoryName);
                if (!category) return null;
                
                // Get tindakLanjut data for this category using categoryId
                const categoryTindakLanjut = tindakLanjut.filter(
                  (table) => table.categoryId === category.id
                );
                
                return (
                  <div key={category.id} className="space-y-4">
                  {/* Category Header */}
                  <div
                    className={`${getTableColor(
                        categoryTindakLanjut.length
                    )} text-white px-6 py-3 font-semibold text-center flex items-center justify-between`}
                  >
                      <span className="flex-1">{category.categoryName}</span>
                    {user?.role === "SUPER_ADMIN" && (
                      <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handleEditCategory(category.categoryName)}
                          className="p-1 text-white hover:text-white/80 transition-colors"
                          title="Edit Kategori"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => handleDeleteCategory(category.categoryName)}
                          className="p-1 text-white hover:text-red-200 transition-colors"
                          title="Hapus Kategori"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Table */}
                  <div
                    className={`overflow-x-auto border-2 ${getTableColor(
                        categoryTindakLanjut.length
                    ).replace("bg-", "border-")} rounded-lg`}
                  >
                    <table className="w-full">
                      <thead>
                        <tr
                            className={`${getTableColor(categoryTindakLanjut.length).replace(
                            "500",
                            "100"
                            )} border-b ${getTableColor(categoryTindakLanjut.length).replace(
                            "bg-",
                            "border-"
                          )}`}
                        >
                          <th className="text-left py-3 px-4 font-semibold text-gray-700">
                            NAMA DIVISI
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            JUMLAH
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            PROSES
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            SELESAI
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            BELUM DITINDAKLANJUTI
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            SELESAI BERKELANJUTAN
                          </th>
                          <th className="text-center py-3 px-4 font-semibold text-gray-700">
                            PROGRESS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                          {divisions.map((division) => {
                            const stats = getCategoryStatsByDivision(categoryName, division);
                            
                            return (
                              <tr
                                key={division}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                              >
                                <td className="py-3 px-4">
                              <button
                                onClick={() =>
                                      navigateToTindakLanjut(division, categoryName)
                                }
                                className={`flex items-center space-x-2 hover:underline transition-colors ${getTableColor(
                                      categoryTindakLanjut.length
                                )
                                  .replace("bg-", "text-")
                                  .replace("500", "600")} hover:${getTableColor(
                                      categoryTindakLanjut.length
                                )
                                  .replace("bg-", "text-")
                                  .replace("500", "800")}`}
                                    title={`Klik untuk melihat tindak lanjut ${division}`}
                              >
                                    <span>{division}</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {stats.total}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {stats.dalamProses}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {stats.selesai}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {stats.belumDitindaklanjuti}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {stats.selesaiBerkelanjutan}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getProgressColor(
                                        stats.progress,
                                        categoryTindakLanjut.length
                                  )}`}
                                >
                                      {stats.progress}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(
                                          stats.progress,
                                          categoryTindakLanjut.length
                                    )}`}
                                        style={{ width: `${stats.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                            );
                          })}
                        </tbody>
                      </table>

                        {/* Summary Row */}
                      {(() => {
                        const totalStats = getCategoryStatsFromTindakLanjut(categoryName);
                        
                        return (
                          <table className="w-full mt-4">
                            <tbody>
                              <tr
                                className={`${getTableColor(categoryTindakLanjut.length).replace(
                              "500",
                              "200"
                            )} font-semibold border-t ${getTableColor(
                                  categoryTindakLanjut.length
                            ).replace("bg-", "border-")}`}
                          >
                            <td className="py-3 px-4">JUMLAH</td>
                            <td className="py-3 px-4 text-center">
                                  {totalStats.total}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {totalStats.dalamProses}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {totalStats.selesai}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {totalStats.belumDitindaklanjuti}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  {totalStats.selesaiBerkelanjutan}
                            </td>
                            <td className="py-3 px-4 text-center">
                                  <div className="flex items-center justify-center space-x-2">
                                  <span
                                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getProgressColor(
                                        totalStats.progress || 0,
                                        categoryTindakLanjut.length
                                    )}`}
                                  >
                                      {totalStats.progress || 0}%
                                  </span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${getProgressColor(
                                          totalStats.progress || 0,
                                          categoryTindakLanjut.length
                                        )}`}
                                        style={{ width: `${totalStats.progress || 0}%` }}
                                      ></div>
                                    </div>
                                  </div>
                            </td>
                          </tr>
                      </tbody>
                    </table>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Super Admin Help Section */}
      {user?.role === "SUPER_ADMIN" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">i</span>
              </div>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                Fitur Super Admin
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Sebagai Super Admin, Anda dapat mengedit dan menghapus kategori.
                Klik ikon edit (✏️) atau hapus (🗑️) di header setiap kategori
                untuk mengelola data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama kategori"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Masukkan deskripsi kategori (opsional)"
                  />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                  <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Menyimpan..." : (isEditMode ? "Update Kategori" : "Simpan Kategori")}
                              </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Konfirmasi Hapus
                  </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus kategori "{deleteConfirm}"?
              <br />
              <span className="text-sm text-red-600">
                    Tindakan ini tidak dapat dibatalkan.
              </span>
                  </p>
            <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                onClick={() => {
                  confirmDeleteCategory(deleteConfirm);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
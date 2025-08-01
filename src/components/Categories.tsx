import React, { useState } from "react";
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
} from "lucide-react";
import { CategoryTable, CategoryTableData } from "../types";

const divisions = ["BOD-1", "KSPI", "SEKPER", "VP AGA", "VP KEU", "VP OP"];

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
    error,
  } = useData();
  const { syncData } = useRealTimeSync();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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

  const navigateToTindakLanjut = (division: string) => {
    navigate(`/tindak-lanjut?division=${division}`);
  };

  // Get unique category names from tindak_lanjut
  const uniqueCategories = Array.from(
    new Set(tindakLanjut.map(tl => tl.kategoriArahan).filter(Boolean))
  );

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
              {uniqueCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              // This button is for adding new categories, not editing existing ones.
              // The modal form handles adding/editing.
              // For now, we'll just open the modal for adding.
              // If you want to add a new category directly, you'd need a state for newCategory
              // and a function to add it to tindakLanjut.
              // For now, it's just a placeholder for adding.
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-hidden">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">❌ Error: {error}</div>
              <p className="text-gray-500">Failed to load categories</p>
            </div>
          ) : tindakLanjut.length === 0 ? (
            <div className="text-center py-8">
              <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada kategori yang dibuat</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((categoryName) => {
                const categoryTables = tindakLanjut.filter(
                  (table) => table.kategoriArahan && 
                  table.kategoriArahan.trim().toLowerCase() === categoryName.trim().toLowerCase()
                );
                
                return (
                  <div key={categoryName} className="space-y-4">
                    {/* Category Header */}
                    <div
                      className={`${getTableColor(
                        categoryTables.length
                      )} text-white px-6 py-3 font-semibold text-center flex items-center justify-between`}
                    >
                      <span className="flex-1">{categoryName}</span>
                      {user?.role === "SUPER_ADMIN" && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              // This button is for editing existing categories.
                              // The modal form handles editing.
                              // For now, it's just a placeholder for editing.
                            }}
                            className="p-1 text-white hover:text-white/80 transition-colors"
                            title="Edit Kategori"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              // This button is for deleting existing categories.
                              // The modal form handles deleting.
                              // For now, it's just a placeholder for deleting.
                            }}
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
                        categoryTables.length
                      ).replace("bg-", "border-")} rounded-lg`}
                    >
                      <table className="w-full">
                        <thead>
                          <tr
                            className={`${getTableColor(categoryTables.length).replace(
                              "500",
                              "100"
                            )} border-b ${getTableColor(categoryTables.length).replace(
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
                                      navigateToTindakLanjut(division)
                                    }
                                    className={`flex items-center space-x-2 hover:underline transition-colors ${getTableColor(
                                      categoryTables.length
                                    )
                                      .replace("bg-", "text-")
                                      .replace("500", "600")} hover:${getTableColor(
                                      categoryTables.length
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
                                        categoryTables.length
                                      )}`}
                                    >
                                      {stats.progress}%
                                    </span>
                                    <div className="w-16 bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${getProgressColor(
                                          stats.progress,
                                          categoryTables.length
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
                                className={`${getTableColor(categoryTables.length).replace(
                                  "500",
                                  "200"
                                )} font-semibold border-t ${getTableColor(
                                  categoryTables.length
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
                                  <span
                                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getProgressColor(
                                      totalStats.progress,
                                      categoryTables.length
                                    )}`}
                                  >
                                    {totalStats.progress}%
                                  </span>
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
    </div>
  );
};

export default Categories;
import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  Plus,
  Edit,
  Trash2,
  Grid3X3,
  X,
  Filter,
  Plus as PlusIcon,
} from "lucide-react";
import { CategoryTable, CategoryTableData } from "../types";

const divisions = ["BOD-1", "KSPI", "SEKPER", "VP AGA", "VP KEU", "VP OP"];

const Categories: React.FC = () => {
  const { user } = useAuth();
  const {
    categoryTables,
    addCategoryTable,
    updateCategoryTable,
    deleteCategoryTable,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<CategoryTable | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    tableData: [] as CategoryTableData[],
  });

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-orange-500";
    if (progress >= 60) return "bg-orange-400";
    if (progress >= 40) return "bg-orange-300";
    return "bg-gray-300";
  };

  const calculateProgress = (data: CategoryTableData) => {
    const total = data.jumlah;
    const completed = data.selesai + data.selesaiBerkelanjutan;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const addTableRow = () => {
    const newRow: CategoryTableData = {
      id: Date.now().toString(),
      division: "BOD-1",
      jumlah: 0,
      proses: 0,
      selesai: 0,
      belumDitindaklanjuti: 0,
      selesaiBerkelanjutan: 0,
      progress: 0,
    };
    setFormData((prev) => ({
      ...prev,
      tableData: [...prev.tableData, newRow],
    }));
  };

  const updateTableRow = (
    index: number,
    field: keyof CategoryTableData,
    value: any
  ) => {
    const updatedData = [...formData.tableData];
    updatedData[index] = { ...updatedData[index], [field]: value };

    // Recalculate progress
    const total = updatedData[index].jumlah;
    const completed =
      updatedData[index].selesai + updatedData[index].selesaiBerkelanjutan;
    updatedData[index].progress =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    setFormData((prev) => ({
      ...prev,
      tableData: updatedData,
    }));
  };

  const removeTableRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tableData: prev.tableData.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTable) {
      updateCategoryTable(editingTable.id, formData);
    } else {
      addCategoryTable(formData);
    }

    handleCloseModal();
  };

  const handleEdit = (table: CategoryTable) => {
    setEditingTable(table);
    setFormData({
      categoryName: table.categoryName,
      description: table.description,
      tableData: table.tableData,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteCategoryTable(id);
    setDeleteConfirm(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setFormData({
      categoryName: "",
      description: "",
      tableData: [],
    });
  };

  const filteredTables =
    selectedCategory === "all"
      ? categoryTables
      : categoryTables.filter(
          (table) => table.categoryName === selectedCategory
        );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rincian Kategori</h2>
          <p className="text-gray-600 mt-1">
            Progress monitoring per kategori dan divisi
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
              {categoryTables.map((table) => (
                <option key={table.id} value={table.categoryName}>
                  {table.categoryName}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-hidden">
          {categoryTables.length === 0 ? (
            <div className="text-center py-8">
              <Grid3X3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada kategori yang dibuat</p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredTables.map((table) => (
                <div key={table.id} className="space-y-4">
                  {/* Category Header */}
                  <div className="bg-orange-500 text-white px-6 py-3 font-semibold text-center">
                    {table.categoryName}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-100">
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
                          {user?.role === "SUPER_ADMIN" && (
                            <th className="text-center py-3 px-4 font-semibold text-gray-700">
                              AKSI
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {table.tableData.map((data, index) => (
                          <tr
                            key={data.id}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="py-3 px-4 font-medium text-orange-600">
                              {data.division}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {data.jumlah}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {data.proses}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {data.selesai}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {data.belumDitindaklanjuti}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {data.selesaiBerkelanjutan}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <span
                                  className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getProgressColor(
                                    data.progress
                                  )}`}
                                >
                                  {data.progress}%
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${getProgressColor(
                                      data.progress
                                    )}`}
                                    style={{ width: `${data.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            {user?.role === "SUPER_ADMIN" && (
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center space-x-1">
                                  <button
                                    onClick={() => handleEdit(table)}
                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(table.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}

                        {/* Summary Row */}
                        {table.tableData.length > 0 && (
                          <tr className="bg-gray-200 font-semibold">
                            <td className="py-3 px-4">JUMLAH</td>
                            <td className="py-3 px-4 text-center">
                              {table.tableData.reduce(
                                (sum, data) => sum + data.jumlah,
                                0
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {table.tableData.reduce(
                                (sum, data) => sum + data.proses,
                                0
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {table.tableData.reduce(
                                (sum, data) => sum + data.selesai,
                                0
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {table.tableData.reduce(
                                (sum, data) => sum + data.belumDitindaklanjuti,
                                0
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {table.tableData.reduce(
                                (sum, data) => sum + data.selesaiBerkelanjutan,
                                0
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {(() => {
                                const totalItems = table.tableData.reduce(
                                  (sum, data) => sum + data.jumlah,
                                  0
                                );
                                const completedItems = table.tableData.reduce(
                                  (sum, data) =>
                                    sum +
                                    data.selesai +
                                    data.selesaiBerkelanjutan,
                                  0
                                );
                                const overallProgress =
                                  totalItems > 0
                                    ? Math.round(
                                        (completedItems / totalItems) * 100
                                      )
                                    : 0;
                                return (
                                  <span
                                    className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getProgressColor(
                                      overallProgress
                                    )}`}
                                  >
                                    {overallProgress}%
                                  </span>
                                );
                              })()}
                            </td>
                            {user?.role === "SUPER_ADMIN" && (
                              <td className="py-3 px-4 text-center">-</td>
                            )}
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTable ? "Edit Kategori" : "Tambah Kategori"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    value={formData.categoryName}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryName: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Table Data Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-gray-900">
                    Data Tabel
                  </h4>
                  <button
                    type="button"
                    onClick={addTableRow}
                    className="flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                {formData.tableData.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">
                      Belum ada data tabel. Klik "Tambah Baris" untuk
                      menambahkan data.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-300 px-3 py-2 text-left">
                            Divisi
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Jumlah
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Proses
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Selesai
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Belum Ditindaklanjuti
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Selesai Berkelanjutan
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Progress
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-center">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData.tableData.map((row, index) => (
                          <tr key={row.id}>
                            <td className="border border-gray-300 px-3 py-2">
                              <select
                                value={row.division}
                                onChange={(e) =>
                                  updateTableRow(
                                    index,
                                    "division",
                                    e.target.value
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              >
                                {divisions.map((division) => (
                                  <option key={division} value={division}>
                                    {division}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="number"
                                value={row.jumlah}
                                onChange={(e) =>
                                  updateTableRow(
                                    index,
                                    "jumlah",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                                min="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="number"
                                value={row.proses}
                                onChange={(e) =>
                                  updateTableRow(
                                    index,
                                    "proses",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                                min="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="number"
                                value={row.selesai}
                                onChange={(e) =>
                                  updateTableRow(
                                    index,
                                    "selesai",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                                min="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="number"
                                value={row.belumDitindaklanjuti}
                                onChange={(e) =>
                                  updateTableRow(
                                    index,
                                    "belumDitindaklanjuti",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                                min="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2">
                              <input
                                type="number"
                                value={row.selesaiBerkelanjutan}
                                onChange={(e) =>
                                  updateTableRow(
                                    index,
                                    "selesaiBerkelanjutan",
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-center"
                                min="0"
                              />
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center">
                              <span
                                className={`px-2 py-1 rounded text-white text-sm font-medium ${getProgressColor(
                                  row.progress
                                )}`}
                              >
                                {row.progress}%
                              </span>
                            </td>
                            <td className="border border-gray-300 px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeTableRow(index)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingTable ? "Simpan" : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Hapus Kategori
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini
                tidak dapat dibatalkan.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;

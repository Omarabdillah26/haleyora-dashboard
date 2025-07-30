import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  Plus,
  Edit,
  Trash2,
  ClipboardList,
  X,
  Search,
  Filter,
  Eye,
} from "lucide-react";
import { CategoryTable, CategoryTableData } from "../types";

const divisions = ["BOD-1", "KSPI", "SEKPER", "VP AGA", "VP KEU", "VP OP"];

const TindakLanjut: React.FC = () => {
  const { user } = useAuth();
  const { categoryTables, updateCategoryTable, deleteCategoryTable } =
    useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<CategoryTable | null>(null);
  const [editingRow, setEditingRow] = useState<CategoryTableData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    categoryName: "",
    division: "BOD-1",
    jumlah: 0,
    proses: 0,
    selesai: 0,
    belumDitindaklanjuti: 0,
    selesaiBerkelanjutan: 0,
    progress: 0,
    status: "belum_ditindaklanjuti",
    targetPenyelesaian: "",
    detailArahan: "",
    checkPoint: "",
    deskripsiTindakLanjut: "",
    catatanSekretaris: "",
  });

  const [editingCell, setEditingCell] = useState<{
    tableId: string;
    rowId: string;
    field: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-orange-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getStatusText = (progress: number) => {
    if (progress >= 80) return "Selesai";
    if (progress >= 60) return "Proses";
    if (progress >= 40) return "Selesai Berkelanjutan";
    return "Belum Ditindaklanjuti";
  };

  const calculateProgress = (data: CategoryTableData) => {
    const total = data.jumlah;
    const completed = data.selesai + data.selesaiBerkelanjutan;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const updateTableRow = (
    tableId: string,
    rowId: string,
    updates: Partial<CategoryTableData>
  ) => {
    const table = categoryTables.find((t) => t.id === tableId);
    if (!table) return;

    const updatedTableData = table.tableData.map((row) => {
      if (row.id === rowId) {
        const updatedRow = { ...row, ...updates };
        // Recalculate progress
        const total = updatedRow.jumlah;
        const completed = updatedRow.selesai + updatedRow.selesaiBerkelanjutan;
        updatedRow.progress =
          total > 0 ? Math.round((completed / total) * 100) : 0;
        return updatedRow;
      }
      return row;
    });

    updateCategoryTable(tableId, { tableData: updatedTableData });
  };

  const addTableRow = (tableId: string) => {
    const table = categoryTables.find((t) => t.id === tableId);
    if (!table) return;

    const newRow: CategoryTableData = {
      id: Date.now().toString(),
      division: formData.division,
      jumlah: formData.jumlah,
      proses: formData.proses,
      selesai: formData.selesai,
      belumDitindaklanjuti: formData.belumDitindaklanjuti,
      selesaiBerkelanjutan: formData.selesaiBerkelanjutan,
      progress: calculateProgress({
        id: "",
        division: formData.division,
        jumlah: formData.jumlah,
        proses: formData.proses,
        selesai: formData.selesai,
        belumDitindaklanjuti: formData.belumDitindaklanjuti,
        selesaiBerkelanjutan: formData.selesaiBerkelanjutan,
        progress: 0,
      }),
    };

    const updatedTableData = [...table.tableData, newRow];
    updateCategoryTable(tableId, { tableData: updatedTableData });
    handleCloseModal();
  };

  const removeTableRow = (tableId: string, rowId: string) => {
    const table = categoryTables.find((t) => t.id === tableId);
    if (!table) return;

    const updatedTableData = table.tableData.filter((row) => row.id !== rowId);
    updateCategoryTable(tableId, { tableData: updatedTableData });
  };

  const handleEdit = (table: CategoryTable, row: CategoryTableData) => {
    setEditingTable(table);
    setEditingRow(row);
    setFormData({
      categoryName: table.categoryName,
      division: row.division,
      jumlah: row.jumlah,
      proses: row.proses,
      selesai: row.selesai,
      belumDitindaklanjuti: row.belumDitindaklanjuti,
      selesaiBerkelanjutan: row.selesaiBerkelanjutan,
      progress: row.progress,
      status: row.status || "belum_ditindaklanjuti",
      targetPenyelesaian: row.targetPenyelesaian || "",
      detailArahan: row.detailArahan || "",
      checkPoint: row.checkPoint || "",
      deskripsiTindakLanjut: row.deskripsiTindakLanjut || "",
      catatanSekretaris: row.catatanSekretaris || "",
    });
    setIsModalOpen(true);
  };

  const handleAddNew = (table: CategoryTable) => {
    setEditingTable(table);
    setEditingRow(null);
    setFormData({
      categoryName: table.categoryName,
      division: "BOD-1",
      jumlah: 0,
      proses: 0,
      selesai: 0,
      belumDitindaklanjuti: 0,
      selesaiBerkelanjutan: 0,
      progress: 0,
      status: "belum_ditindaklanjuti",
      targetPenyelesaian: "",
      detailArahan: "",
      checkPoint: "",
      deskripsiTindakLanjut: "",
      catatanSekretaris: "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTable && editingRow) {
      // Update existing row
      updateTableRow(editingTable.id, editingRow.id, {
        division: formData.division,
        jumlah: formData.jumlah,
        proses: formData.proses,
        selesai: formData.selesai,
        belumDitindaklanjuti: formData.belumDitindaklanjuti,
        selesaiBerkelanjutan: formData.selesaiBerkelanjutan,
        status: formData.status,
        targetPenyelesaian: formData.targetPenyelesaian,
        detailArahan: formData.detailArahan,
        checkPoint: formData.checkPoint,
        deskripsiTindakLanjut: formData.deskripsiTindakLanjut,
        catatanSekretaris: formData.catatanSekretaris,
      });
    } else if (editingTable) {
      // Add new row
      addTableRow(editingTable.id);
    }

    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    deleteCategoryTable(id);
    setDeleteConfirm(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTable(null);
    setEditingRow(null);
    setFormData({
      categoryName: "",
      division: "BOD-1",
      jumlah: 0,
      proses: 0,
      selesai: 0,
      belumDitindaklanjuti: 0,
      selesaiBerkelanjutan: 0,
      progress: 0,
      status: "belum_ditindaklanjuti",
      targetPenyelesaian: "",
      detailArahan: "",
      checkPoint: "",
      deskripsiTindakLanjut: "",
      catatanSekretaris: "",
    });
  };

  // Filter and search logic
  const filteredTables = categoryTables.filter((table) => {
    const matchesCategory =
      selectedCategory === "all" || table.categoryName === selectedCategory;
    const matchesSearch =
      table.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTables = filteredTables.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTables.length / itemsPerPage);

  const handleInlineEdit = (
    tableId: string,
    rowId: string,
    field: string,
    value: string | number
  ) => {
    const updates: Partial<CategoryTableData> = {};
    updates[field as keyof CategoryTableData] = value as any;

    // Auto-save the changes
    updateTableRow(tableId, rowId, updates);
  };

  const startEditing = (
    tableId: string,
    rowId: string,
    field: string,
    currentValue: string | number
  ) => {
    setEditingCell({ tableId, rowId, field });
    setEditValue(currentValue.toString());
  };

  const saveEdit = () => {
    if (editingCell) {
      const { tableId, rowId, field } = editingCell;
      const value =
        field === "jumlah" ||
        field === "proses" ||
        field === "selesai" ||
        field === "belumDitindaklanjuti" ||
        field === "selesaiBerkelanjutan"
          ? parseInt(editValue) || 0
          : editValue;

      handleInlineEdit(tableId, rowId, field, value);
      setEditingCell(null);
      setEditValue("");
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  const handleFormDataChange = (field: string, value: string | number) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Auto-save if editing existing row
    if (editingTable && editingRow) {
      const updates: Partial<CategoryTableData> = {};

      // Map form fields to table data fields
      if (field === "division") updates.division = value as string;
      if (field === "jumlah") updates.jumlah = value as number;
      if (field === "proses") updates.proses = value as number;
      if (field === "selesai") updates.selesai = value as number;
      if (field === "belumDitindaklanjuti")
        updates.belumDitindaklanjuti = value as number;
      if (field === "selesaiBerkelanjutan")
        updates.selesaiBerkelanjutan = value as number;
      if (field === "status") updates.status = value as string;
      if (field === "targetPenyelesaian")
        updates.targetPenyelesaian = value as string;
      if (field === "detailArahan") updates.detailArahan = value as string;
      if (field === "checkPoint") updates.checkPoint = value as string;
      if (field === "deskripsiTindakLanjut")
        updates.deskripsiTindakLanjut = value as string;
      if (field === "catatanSekretaris")
        updates.catatanSekretaris = value as string;

      // Auto-save the changes
      updateTableRow(editingTable.id, editingRow.id, updates);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tindak Lanjut</h2>
          <p className="text-gray-600 mt-1">
            Kelola data tabel kategori dan tindak lanjutnya
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Q Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

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
      </div>

      {/* Data Tables */}
      <div className="space-y-6">
        {currentTables.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Belum ada data tabel yang tersedia</p>
          </div>
        ) : (
          currentTables.map((table) => (
            <div key={table.id} className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {table.categoryName}
                  </h3>
                  <button
                    onClick={() => handleAddNew(table)}
                    className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New tindak lanjut</span>
                  </button>
                </div>

                {table.tableData.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">
                      Belum ada data dalam tabel ini
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Divisi
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Jumlah
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Proses
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Selesai
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Selesai Berkelanjutan
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Belum Ditindaklanjuti
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Progress
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.tableData.map((row, index) => (
                          <tr
                            key={row.id}
                            className={`border-b border-gray-100 ${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {row.division}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {editingCell?.tableId === table.id &&
                              editingCell?.rowId === row.id &&
                              editingCell?.field === "jumlah" ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onBlur={saveEdit}
                                    onKeyPress={(e) =>
                                      e.key === "Enter" && saveEdit()
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveEdit}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    startEditing(
                                      table.id,
                                      row.id,
                                      "jumlah",
                                      row.jumlah
                                    )
                                  }
                                  className="hover:bg-blue-50 px-2 py-1 rounded"
                                >
                                  {row.jumlah}
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {editingCell?.tableId === table.id &&
                              editingCell?.rowId === row.id &&
                              editingCell?.field === "proses" ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onBlur={saveEdit}
                                    onKeyPress={(e) =>
                                      e.key === "Enter" && saveEdit()
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveEdit}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    startEditing(
                                      table.id,
                                      row.id,
                                      "proses",
                                      row.proses
                                    )
                                  }
                                  className="hover:bg-blue-50 px-2 py-1 rounded"
                                >
                                  {row.proses}
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {editingCell?.tableId === table.id &&
                              editingCell?.rowId === row.id &&
                              editingCell?.field === "selesai" ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onBlur={saveEdit}
                                    onKeyPress={(e) =>
                                      e.key === "Enter" && saveEdit()
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveEdit}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    startEditing(
                                      table.id,
                                      row.id,
                                      "selesai",
                                      row.selesai
                                    )
                                  }
                                  className="hover:bg-blue-50 px-2 py-1 rounded"
                                >
                                  {row.selesai}
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {editingCell?.tableId === table.id &&
                              editingCell?.rowId === row.id &&
                              editingCell?.field === "selesaiBerkelanjutan" ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onBlur={saveEdit}
                                    onKeyPress={(e) =>
                                      e.key === "Enter" && saveEdit()
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveEdit}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    startEditing(
                                      table.id,
                                      row.id,
                                      "selesaiBerkelanjutan",
                                      row.selesaiBerkelanjutan
                                    )
                                  }
                                  className="hover:bg-blue-50 px-2 py-1 rounded"
                                >
                                  {row.selesaiBerkelanjutan}
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4 text-gray-700">
                              {editingCell?.tableId === table.id &&
                              editingCell?.rowId === row.id &&
                              editingCell?.field === "belumDitindaklanjuti" ? (
                                <div className="flex items-center space-x-1">
                                  <input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) =>
                                      setEditValue(e.target.value)
                                    }
                                    onBlur={saveEdit}
                                    onKeyPress={(e) =>
                                      e.key === "Enter" && saveEdit()
                                    }
                                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                                    autoFocus
                                  />
                                  <button
                                    onClick={saveEdit}
                                    className="text-green-600 hover:text-green-800"
                                  >
                                    ✓
                                  </button>
                                  <button
                                    onClick={cancelEdit}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    ✕
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    startEditing(
                                      table.id,
                                      row.id,
                                      "belumDitindaklanjuti",
                                      row.belumDitindaklanjuti
                                    )
                                  }
                                  className="hover:bg-blue-50 px-2 py-1 rounded"
                                >
                                  {row.belumDitindaklanjuti}
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getProgressColor(
                                  row.progress
                                )}`}
                              >
                                {row.progress}%
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEdit(table, row)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(row.id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredTables.length > itemsPerPage && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
          <div className="text-sm text-gray-700">
            Showing {indexOfFirstItem + 1} to{" "}
            {Math.min(indexOfLastItem, filteredTables.length)} of{" "}
            {filteredTables.length} results
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={itemsPerPage}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-700">Per page</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRow ? "Edit Tindak Lanjut" : "Create Tindak Lanjut"}
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
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900">
                  Detail Utama
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori Arahan *
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.categoryName}
                        disabled
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                      >
                        <option value={formData.categoryName}>
                          {formData.categoryName}
                        </option>
                      </select>
                      <button
                        type="button"
                        className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIC (Person in Charge) *
                    </label>
                    <select
                      value={formData.division}
                      onChange={(e) =>
                        handleFormDataChange("division", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {divisions.map((division) => (
                        <option key={division} value={division}>
                          {division}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detail Arahan *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.detailArahan}
                    onChange={(e) =>
                      handleFormDataChange("detailArahan", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan detail arahan..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Penyelesaian *
                    </label>
                    <input
                      type="date"
                      value={formData.targetPenyelesaian}
                      onChange={(e) =>
                        handleFormDataChange(
                          "targetPenyelesaian",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        handleFormDataChange("status", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="belum_ditindaklanjuti">
                        Belum Ditindaklanjuti
                      </option>
                      <option value="dalam_proses">Dalam Proses</option>
                      <option value="selesai">Selesai</option>
                      <option value="selesai_berkelanjutan">
                        Selesai Berkelanjutan
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Check Point
                  </label>
                  <input
                    type="text"
                    value={formData.checkPoint}
                    onChange={(e) =>
                      handleFormDataChange("checkPoint", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan check point..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Tindak Lanjut
                  </label>
                  <textarea
                    rows={4}
                    value={formData.deskripsiTindakLanjut}
                    onChange={(e) =>
                      handleFormDataChange(
                        "deskripsiTindakLanjut",
                        e.target.value
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan deskripsi tindak lanjut..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan Sekretaris & Komite Dekom
                  </label>
                  <textarea
                    rows={4}
                    value={formData.catatanSekretaris}
                    onChange={(e) =>
                      handleFormDataChange("catatanSekretaris", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan catatan..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingRow ? "Simpan" : "Create"}
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
                Hapus Data
              </h3>
              <p className="text-gray-600 mb-6">
                Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak
                dapat dibatalkan.
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

export default TindakLanjut;

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useRealTimeSync } from "../hooks/useRealTimeSync";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Search,
  Filter,
  Eye,
  Calendar,
  User,
  Target,
  FileText,
  Upload,
  Download,
  Paperclip,
} from "lucide-react";
import { CategoryTable, CategoryTableData } from "../types";
import { uploadFiles, deleteFile, getFileUrl } from "../services/apiService";

const divisions = ["BOD-1", "KSPI", "SEKPER", "VP AGA", "VP KEU", "VP OP"];

const TindakLanjut: React.FC = () => {
  const { user } = useAuth();
  const { categoryTables, updateCategoryTable, loading, error } = useData();
  const { syncData } = useRealTimeSync();
  const [searchParams] = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [divisionFilter, setDivisionFilter] = useState<string>("");
  const [editingRow, setEditingRow] = useState<{
    tableId: string;
    rowId: string;
    data: CategoryTableData;
  } | null>(null);

  // Read division filter from URL parameters
  useEffect(() => {
    const division = searchParams.get("division");
    if (division) {
      setDivisionFilter(division);
      setSearchTerm(division); // Also set search term to filter by division
    }
  }, [searchParams]);

  const [formData, setFormData] = useState({
    selectedCategoryId: "",
    division: "BOD-1",
    status: "belum_ditindaklanjuti",
    targetPenyelesaian: "",
    detailArahan: "",
    checkPoint: "",
    deskripsiTindakLanjut: "",
    catatanSekretaris: "",
  });

  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500";
    if (progress >= 60) return "bg-orange-500";
    if (progress >= 40) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "selesai":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Selesai
          </span>
        );
      case "dalam_proses":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
            Proses
          </span>
        );
      case "selesai_berkelanjutan":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Selesai Berkelanjutan
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
            Belum Ditindaklanjuti
          </span>
        );
    }
  };

  const calculateProgress = (data: Partial<CategoryTableData>) => {
    const total = data.jumlah || 0;
    const completed = (data.selesai || 0) + (data.selesaiBerkelanjutan || 0);
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const handleAddNew = () => {
    setFormData({
      selectedCategoryId: "",
      division: "BOD-1",
      status: "belum_ditindaklanjuti",
      targetPenyelesaian: "",
      detailArahan: "",
      checkPoint: "",
      deskripsiTindakLanjut: "",
      catatanSekretaris: "",
    });
    setEditingRow(null);
    setIsModalOpen(true);
  };

  const handleEdit = (
    tableId: string,
    rowId: string,
    data: CategoryTableData
  ) => {
    setEditingRow({ tableId, rowId, data });
    setFormData({
      selectedCategoryId: tableId,
      division: data.division,
      status: data.status || "belum_ditindaklanjuti",
      targetPenyelesaian: data.targetPenyelesaian || "",
      detailArahan: data.detailArahan || "",
      checkPoint: data.checkPoint || "",
      deskripsiTindakLanjut: data.deskripsiTindakLanjut || "",
      catatanSekretaris: data.catatanSekretaris || "",
    });

    // Load existing files
    try {
      if (data.uploadedFiles) {
        setUploadedFiles(JSON.parse(data.uploadedFiles));
      }
      if (data.fileNames) {
        setFileNames(JSON.parse(data.fileNames));
      }
    } catch (error) {
      console.error("Failed to parse file data:", error);
      setUploadedFiles([]);
      setFileNames([]);
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (tableId: string, rowId: string) => {
    try {
      const table = categoryTables.find((t) => t.id === tableId);
      if (!table) return;

      const updatedTableData = table.tableData.filter(
        (row) => row.id !== rowId
      );
      await updateCategoryTable(tableId, { tableData: updatedTableData });
      // Sync data immediately after delete to ensure all components are updated
      await syncData();
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Failed to delete tindak lanjut:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const selectedTable = categoryTables.find(
        (t) => t.id === formData.selectedCategoryId
      );
      if (!selectedTable) {
        alert("Please select a category");
        return;
      }

      const newRowData: CategoryTableData = {
        id: editingRow ? editingRow.rowId : Date.now().toString(),
        division: formData.division,
        jumlah: 0,
        proses: 0,
        selesai: 0,
        belumDitindaklanjuti: 0,
        selesaiBerkelanjutan: 0,
        progress: 0,
        status: formData.status,
        targetPenyelesaian: formData.targetPenyelesaian,
        detailArahan: formData.detailArahan,
        checkPoint: formData.checkPoint,
        deskripsiTindakLanjut: formData.deskripsiTindakLanjut,
        catatanSekretaris: formData.catatanSekretaris,
        uploadedFiles: JSON.stringify(uploadedFiles),
        fileNames: JSON.stringify(fileNames),
      };

      let updatedTableData: CategoryTableData[];
      if (editingRow) {
        // Update existing row
        updatedTableData = selectedTable.tableData.map((row) =>
          row.id === editingRow.rowId ? newRowData : row
        );
      } else {
        // Add new row
        updatedTableData = [...selectedTable.tableData, newRowData];
      }

      await updateCategoryTable(formData.selectedCategoryId, {
        tableData: updatedTableData,
      });
      // Sync data immediately after update to ensure all components are updated
      await syncData();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save tindak lanjut:", error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRow(null);
    setFormData({
      selectedCategoryId: "",
      division: "BOD-1",
      status: "belum_ditindaklanjuti",
      targetPenyelesaian: "",
      detailArahan: "",
      checkPoint: "",
      deskripsiTindakLanjut: "",
      catatanSekretaris: "",
    });
    setUploadedFiles([]);
    setFileNames([]);
  };

  const handleFormDataChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const fileArray = Array.from(files);
      const uploadedFileData = await uploadFiles(fileArray);

      setUploadedFiles((prev) => [...prev, ...uploadedFileData]);
      setFileNames((prev) => [...prev, ...fileArray.map((f) => f.name)]);
    } catch (error) {
      console.error("Failed to upload files:", error);
      alert("Gagal mengupload file. Silakan coba lagi.");
    }
  };

  const handleFileDelete = async (index: number) => {
    try {
      const fileToDelete = uploadedFiles[index];
      if (fileToDelete.filename) {
        await deleteFile(fileToDelete.filename);
      }

      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
      setFileNames((prev) => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error("Failed to delete file:", error);
      alert("Gagal menghapus file. Silakan coba lagi.");
    }
  };

  const handleFileDownload = (filename: string, originalName: string) => {
    const url = getFileUrl(filename);
    const link = document.createElement("a");
    link.href = url;
    link.download = originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter and search logic
  const filteredTables = categoryTables.filter((table) => {
    const matchesCategory =
      selectedCategory === "all" ||
      (table.categoryName && table.categoryName === selectedCategory);
    const matchesSearch =
      (table.categoryName &&
        table.categoryName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (table.description &&
        table.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Get all tindak lanjut entries from all tables
  const allTindakLanjut = filteredTables.flatMap((table) =>
    table.tableData.map((row) => ({
      ...row,
      categoryName: table.categoryName,
      tableId: table.id,
    }))
  );

  // Apply division filter if specified
  const filteredTindakLanjut = divisionFilter
    ? allTindakLanjut.filter((row) => row.division === divisionFilter)
    : allTindakLanjut;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTindakLanjut = filteredTindakLanjut.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTindakLanjut.length / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <span className="text-gray-500">Tindak Lanjut</span>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="mx-2 text-gray-400">/</span>
                  <span className="text-gray-500">List</span>
                </div>
              </li>
            </ol>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            Tindak Lanjut
            {divisionFilter && (
              <span className="text-lg font-normal text-orange-600 ml-2">
                - Filter: {divisionFilter}
              </span>
            )}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {divisionFilter && (
            <button
              onClick={() => {
                setDivisionFilter("");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear Filter</span>
            </button>
          )}
          <button
            onClick={handleAddNew}
            className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New tindak lanjut</span>
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {filteredTindakLanjut.length} results
            </span>
          </div>
          <button className="p-2 text-gray-500 hover:text-gray-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                  <div className="flex items-center space-x-1">
                    <span>Kategori Arahan</span>
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detail Arahan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deskripsi Tindak Lanjut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTindakLanjut.map((row) => (
                <tr
                  key={`${row.tableId}-${row.id}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.categoryName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {row.detailArahan || "Tidak ada detail"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.division}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.targetPenyelesaian
                      ? new Date(row.targetPenyelesaian).toLocaleDateString(
                          "en-GB",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Tidak ada target"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(row.status || "belum_ditindaklanjuti")}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                    {row.deskripsiTindakLanjut || "Tidak ada deskripsi"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.uploadedFiles && row.uploadedFiles !== "[]" ? (
                      <div className="flex items-center space-x-1">
                        <Paperclip className="w-4 h-4 text-gray-500" />
                        <span className="text-xs text-gray-600">
                          {(() => {
                            try {
                              const files = JSON.parse(row.uploadedFiles);
                              return `${files.length} file(s)`;
                            } catch {
                              return "0 file(s)";
                            }
                          })()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No files</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(row.tableId, row.id, row)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm(`${row.tableId}-${row.id}`)
                        }
                        className="text-red-600 hover:text-red-900"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(indexOfLastItem, allTindakLanjut.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">{allTindakLanjut.length}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus tindak lanjut ini?
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
                  const [tableId, rowId] = deleteConfirm.split("-");
                  handleDelete(tableId, rowId);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingRow ? "Edit Tindak Lanjut" : "Create Tindak Lanjut"}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Detail Utama</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori Arahan *
                </label>
                <div className="flex items-center space-x-2">
                  <select
                    value={formData.selectedCategoryId}
                    onChange={(e) =>
                      handleFormDataChange("selectedCategoryId", e.target.value)
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select an option</option>
                    {categoryTables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.categoryName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detail Arahan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detail Arahan *
                </label>
                <textarea
                  value={formData.detailArahan}
                  onChange={(e) =>
                    handleFormDataChange("detailArahan", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* PIC and Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Penyelesaian *
                  </label>
                  <div className="relative">
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
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Status */}
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

              {/* Check Point */}
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
                />
              </div>

              {/* Deskripsi Tindak Lanjut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deskripsi Tindak Lanjut
                </label>
                <textarea
                  value={formData.deskripsiTindakLanjut}
                  onChange={(e) =>
                    handleFormDataChange(
                      "deskripsiTindakLanjut",
                      e.target.value
                    )
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Catatan Sekretaris & Komite Dekom */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Sekretaris & Komite Dekom
                </label>
                <textarea
                  value={formData.catatanSekretaris}
                  onChange={(e) =>
                    handleFormDataChange("catatanSekretaris", e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <div className="space-y-3">
                  {/* File Input */}
                  <div className="flex items-center space-x-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Choose Files</span>
                    </button>
                    <span className="text-sm text-gray-500">
                      Max 5 files, 10MB each
                    </span>
                  </div>

                  {/* File List */}
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Uploaded Files:
                      </h4>
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">
                              {fileNames[index] || file.originalname}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleFileDownload(
                                  file.filename,
                                  fileNames[index] || file.originalname
                                )
                              }
                              className="p-1 text-blue-600 hover:text-blue-800"
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFileDelete(index)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-6 border-t">
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingRow ? "Update" : "Create"}
                </button>
                {!editingRow && (
                  <button
                    type="button"
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Create & create another
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TindakLanjut;

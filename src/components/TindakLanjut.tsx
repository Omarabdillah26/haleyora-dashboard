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
  ClipboardList,
  RefreshCw,
  Lock,
} from "lucide-react";
import { TindakLanjut } from "../types";
import {
  uploadFiles,
  deleteFile,
  getFileUrl,
  getFileViewUrl,
  testTindakLanjutTable,
  testServerStatus,
} from "../services/apiService";

const divisions = [
  "BOD-1",
  "KSPI",
  "SEKPER",
  "VP AGA",
  "VP KEU",
  "VP OP",
  "VP REN",
  "VP MHC",
  "MAN HK",
  "MAN MR",
];

// Helper function to check if user can edit tindak lanjut
const canUserEditTindakLanjut = (
  userRole: string,
  tindakLanjutPic: string
): boolean => {
  // SUPER_ADMIN can edit everything
  if (userRole === "SUPER_ADMIN") {
    return true;
  }

  // User can only edit if they are the PIC (Person in Charge)
  return userRole === tindakLanjutPic;
};

// Helper function to check if user can view tindak lanjut
const canUserViewTindakLanjut = (
  userRole: string,
  tindakLanjutPic: string
): boolean => {
  // All users can view all data (no restrictions on viewing)
  return true;
};

const TindakLanjutComponent: React.FC = () => {
  const { user } = useAuth();
  const {
    tindakLanjut,
    addTindakLanjut,
    updateTindakLanjut,
    deleteTindakLanjut,
    categories,
    loading,
    refreshing,
    error,
  } = useData();
  const { syncData } = useRealTimeSync();
  const [searchParams] = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [divisionFilter, setDivisionFilter] = useState<string>("");
  const [picFilter, setPicFilter] = useState<string>("");
  const [kategoriArahanFilter, setKategoriArahanFilter] = useState<string>("");
  const [editingRow, setEditingRow] = useState<TindakLanjut | undefined>(
    undefined
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read division filter from URL parameters
  useEffect(() => {
    const division = searchParams.get("division");
    const pic = searchParams.get("pic");
    const kategoriArahan = searchParams.get("kategoriArahan");

    if (division) {
      setDivisionFilter(division);
      setPicFilter(division); // Set PIC filter to division value
    }

    if (pic) {
      setPicFilter(pic);
    }

    if (kategoriArahan) {
      setKategoriArahanFilter(kategoriArahan);
    }
  }, [searchParams]);

  // Debug categories loading
  useEffect(() => {
    console.log("Categories loaded:", categories);
  }, [categories]);

  const testDatabaseConnection = async () => {
    try {
      console.log("Testing database connection...");
      const result = await testTindakLanjutTable();
      console.log("Database test result:", result);
      alert(
        `Database test: ${result.message}\nRecord count: ${result.recordCount}`
      );
    } catch (error) {
      console.error("Database test failed:", error);
      alert(
        `Database test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const testServerStatusLocal = async () => {
    try {
      console.log("Testing server status...");
      const result = await testServerStatus();
      console.log("Server status result:", result);
      alert(`Server status: ${result.message}\nDatabase: ${result.database}`);
    } catch (error) {
      console.error("Server status test failed:", error);
      alert(
        `Server status test failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const [formData, setFormData] = useState({
    kategoriArahan: "",
    detailArahan: "",
    pic: "BOD-1",
    target: "",
    status: "belum_ditindaklanjuti" as
      | "belum_ditindaklanjuti"
      | "dalam_proses"
      | "selesai"
      | "selesai_berkelanjutan",
    deskripsiTindakLanjut: "",
    catatanSekretaris: "",
    categoryId: "",
    division: "BOD-1",
    fileAttachment: "",
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

  const handleAddNew = () => {
    // Check if user can create new tindak lanjut
    if (user?.role !== "SUPER_ADMIN" && user?.role !== "BOD-1") {
      alert(
        "Anda tidak memiliki akses untuk membuat tindak lanjut baru. Hanya SUPER_ADMIN dan BOD-1 yang dapat membuat tindak lanjut baru."
      );
      return;
    }

    setFormData({
      kategoriArahan: "",
      detailArahan: "",
      pic: "BOD-1",
      target: "",
      status: "belum_ditindaklanjuti" as
        | "belum_ditindaklanjuti"
        | "dalam_proses"
        | "selesai"
        | "selesai_berkelanjutan",
      deskripsiTindakLanjut: "",
      catatanSekretaris: "",
      categoryId: "",
      division: "BOD-1",
      fileAttachment: "",
    });
    setEditingRow(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (tindakLanjut: TindakLanjut) => {
    // All users can view the edit page, but only PIC can actually edit
    // Permissions are checked in the form UI and submit function

    console.log("Editing tindak lanjut:", tindakLanjut);
    console.log("Available categories:", categories);
    console.log("Tindak lanjut kategoriArahan:", tindakLanjut.kategoriArahan);
    console.log(
      "Available category names:",
      categories.map((cat) => cat.categoryName)
    );

    setEditingRow(tindakLanjut);

    // Find the categoryId based on kategoriArahan
    const matchingCategory = categories.find(
      (cat) => cat.categoryName === tindakLanjut.kategoriArahan
    );
    const categoryId = matchingCategory?.id || tindakLanjut.categoryId || "";

    console.log("Matching category:", matchingCategory);
    console.log("Selected categoryId:", categoryId);

    // Format target date for input field (YYYY-MM-DD)
    let targetDate = "";
    if (tindakLanjut.target) {
      try {
        const date = new Date(tindakLanjut.target);
        targetDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      } catch (error) {
        console.error("Error formatting target date:", error);
        targetDate = "";
      }
    }

    setFormData({
      kategoriArahan: tindakLanjut.kategoriArahan,
      detailArahan: tindakLanjut.detailArahan,
      pic: tindakLanjut.pic,
      target: targetDate,
      status: tindakLanjut.status,
      deskripsiTindakLanjut: tindakLanjut.deskripsiTindakLanjut,
      catatanSekretaris: tindakLanjut.catatanSekretaris,
      categoryId: categoryId,
      division: tindakLanjut.division,
      fileAttachment: tindakLanjut.fileAttachment || "",
    });

    // Load existing files
    try {
      if (tindakLanjut.fileAttachment) {
        setUploadedFiles(JSON.parse(tindakLanjut.fileAttachment));
      }
    } catch (error) {
      console.error("Failed to parse file data:", error);
      setUploadedFiles([]);
      setFileNames([]);
    }

    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Find the tindak lanjut to check permissions
    const tindakLanjutToDelete = tindakLanjut.find((t) => t.id === id);

    if (!tindakLanjutToDelete) {
      alert("Data tidak ditemukan");
      return;
    }

    // Check if user can delete this tindak lanjut
    if (user?.role !== "SUPER_ADMIN") {
      alert(
        "Anda tidak memiliki akses untuk menghapus data ini. Hanya SUPER_ADMIN yang dapat menghapus data tindak lanjut."
      );
      setDeleteConfirm(undefined);
      return;
    }

    try {
      await deleteTindakLanjut(id);
      // Sync data immediately after delete to ensure all components are updated
      await syncData();
      setDeleteConfirm(undefined);
    } catch (error) {
      console.error("Failed to delete tindak lanjut:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting form data:", formData);

    // Check permissions for creating new tindak lanjut
    if (!editingRow && user?.role !== "SUPER_ADMIN" && user?.role !== "BOD-1") {
      alert(
        "Anda tidak memiliki akses untuk membuat tindak lanjut baru. Hanya SUPER_ADMIN dan BOD-1 yang dapat membuat tindak lanjut baru."
      );
      return;
    }

    // All users can edit tindak lanjut (field restrictions are handled in the form UI)
    // No need to check permissions here

    // Validate required fields
    if (!formData.categoryId) {
      alert("Please select a category");
      return;
    }

    if (!formData.detailArahan.trim()) {
      alert("Please enter detail arahan");
      return;
    }

    // Validate target date format
    let targetDate = "";
    if (formData.target) {
      try {
        const date = new Date(formData.target);
        if (isNaN(date.getTime())) {
          alert("Invalid target date format");
          return;
        }
        // Send date as YYYY-MM-DD format instead of ISO string
        targetDate = date.toISOString().split("T")[0];
      } catch (error) {
        console.error("Error formatting target date:", error);
        alert("Invalid target date");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const newTindakLanjut = {
        kategoriArahan: formData.kategoriArahan,
        detailArahan: formData.detailArahan,
        pic: formData.pic,
        target: targetDate,
        status: formData.status,
        deskripsiTindakLanjut: formData.deskripsiTindakLanjut,
        catatanSekretaris: formData.catatanSekretaris,
        categoryId: formData.categoryId,
        division: formData.division,
        fileAttachment: JSON.stringify(uploadedFiles),
      };

      console.log("Saving tindak lanjut:", newTindakLanjut);
      console.log("Form data:", formData);
      console.log("Editing row ID:", editingRow?.id);
      console.log("Target date:", targetDate);

      if (editingRow) {
        // Update existing row
        console.log("Updating tindak lanjut with ID:", editingRow.id);
        await updateTindakLanjut(editingRow.id, newTindakLanjut);
      } else {
        // Add new row
        console.log("Creating new tindak lanjut");
        await addTindakLanjut(newTindakLanjut);
      }
      // Sync data immediately after update to ensure all components are updated
      await syncData();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save tindak lanjut:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Failed to save tindak lanjut: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRow(undefined);
    setFormData({
      kategoriArahan: "",
      detailArahan: "",
      pic: "BOD-1",
      target: "",
      status: "belum_ditindaklanjuti" as
        | "belum_ditindaklanjuti"
        | "dalam_proses"
        | "selesai"
        | "selesai_berkelanjutan",
      deskripsiTindakLanjut: "",
      catatanSekretaris: "",
      categoryId: "",
      division: "BOD-1",
      fileAttachment: "",
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

  const handleFileView = (filename: string) => {
    const url = getFileViewUrl(filename);
    window.open(url, "_blank");
  };

  // Filter and search logic - all users can view all data
  const filteredTindakLanjut = tindakLanjut.filter((t) => {
    const matchesSearch =
      (t.kategoriArahan &&
        t.kategoriArahan.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.detailArahan &&
        t.detailArahan.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPicFilter = !picFilter || t.pic === picFilter;
    const matchesKategoriArahanFilter =
      !kategoriArahanFilter ||
      (t.kategoriArahan &&
        t.kategoriArahan.toLowerCase() === kategoriArahanFilter.toLowerCase());

    return matchesSearch && matchesPicFilter && matchesKategoriArahanFilter;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTindakLanjut = filteredTindakLanjut.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredTindakLanjut.length / itemsPerPage);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <nav className="flex mb-2" aria-label="Breadcrumb">
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
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Tindak Lanjut
              {(divisionFilter || picFilter || kategoriArahanFilter) && (
                <span className="text-lg font-normal text-orange-600 ml-2">
                  - Filter: {picFilter && `PIC: ${picFilter}`}
                  {kategoriArahanFilter &&
                    ` ${
                      picFilter ? ", " : ""
                    }Kategori: ${kategoriArahanFilter}`}
                </span>
              )}
            </h1>
            {refreshing && (
              <div className="flex items-center space-x-1 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>
              Logged in as: <strong>{user?.name}</strong> ({user?.role})
            </span>
            <span className="text-blue-600">•</span>
            <Eye className="w-4 h-4 text-blue-600" />
            <span className="text-blue-600">View all data</span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {(divisionFilter || picFilter || kategoriArahanFilter) && (
            <button
              onClick={() => {
                setDivisionFilter("");
                setPicFilter("");
                setKategoriArahanFilter("");
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="flex items-center space-x-2 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
            >
              <X className="w-4 h-4" />
              <span>Clear Filter</span>
            </button>
          )}
          {/* <button
            onClick={testDatabaseConnection}
            className="flex items-center space-x-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            <span>Test DB</span>
          </button>
          <button
            onClick={testServerStatusLocal}
            className="flex items-center space-x-2 bg-purple-500 text-white px-3 py-2 rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            <span>Test Server</span>
          </button> */}
          {(user?.role === "SUPER_ADMIN" || user?.role === "BOD-1") && (
            <button
              onClick={handleAddNew}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New tindak lanjut</span>
              <span className="sm:hidden">New</span>
            </button>
          )}
        </div>
      </div>

      {/* Role-based Access Control Info */}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tindak lanjut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* PIC Filter */}
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <select
                value={picFilter}
                onChange={(e) => setPicFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All PIC</option>
                {divisions.map((division) => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori Arahan Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={kategoriArahanFilter}
                onChange={(e) => setKategoriArahanFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">All Categories</option>
                {Array.from(
                  new Set(
                    tindakLanjut.map((t) => t.kategoriArahan).filter(Boolean)
                  )
                ).map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {filteredTindakLanjut.length} results
              </span>
            </div>
            <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"></button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-w-full">
          <table className="w-full divide-y divide-gray-200 responsive-table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
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
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Detail Arahan</span>
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PIC
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Target
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center space-x-1">
                    <span>Deskripsi Tindak Lanjut</span>
                  </div>
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Files
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Access
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTindakLanjut.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 sm:px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <ClipboardList className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          No tindak lanjut found
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchTerm
                            ? `No results found for "${searchTerm}"`
                            : "Tidak ada data tindak lanjut yang tersedia"}
                        </p>
                      </div>
                      {!searchTerm &&
                        (user?.role === "SUPER_ADMIN" ||
                          user?.role === "BOD-1") && (
                          <button
                            onClick={handleAddNew}
                            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create first tindak lanjut
                          </button>
                        )}
                      {!searchTerm &&
                        user?.role !== "SUPER_ADMIN" &&
                        user?.role !== "BOD-1" && (
                          <div className="mt-4 text-sm text-gray-500">
                            <Lock className="w-4 h-4 inline mr-1" />
                            Hanya SUPER_ADMIN dan BOD-1 yang dapat membuat
                            tindak lanjut baru
                          </div>
                        )}
                      {!searchTerm && filteredTindakLanjut.length === 0 && (
                        <div className="mt-4 text-sm text-blue-600">
                          <Eye className="w-4 h-4 inline mr-1" />
                          Anda dapat melihat semua data tindak lanjut dari semua
                          divisi
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                currentTindakLanjut.map((row) => {
                  // Find category name from categories array
                  const category = categories.find(
                    (cat) => cat.id === row.categoryId
                  );
                  const categoryName = category
                    ? category.categoryName
                    : row.kategoriArahan || "Unknown Category";

                  return (
                    <tr
                      key={row.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="truncate cursor-help hover:bg-gray-50 p-1 rounded transition-colors tooltip">
                          {categoryName}
                          <span className="tooltip-text">{categoryName}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-full relative group">
                          <div className="line-clamp-2 text-sm leading-tight cursor-help hover:bg-gray-50 p-1 rounded transition-colors relative group tooltip">
                            {row.detailArahan || "Tidak ada detail"}
                            <span className="tooltip-text">
                              {row.detailArahan || "Tidak ada detail"}
                            </span>
                          </div>
                          {row.detailArahan &&
                            row.detailArahan.length > 150 && (
                              <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent w-8 h-6 pointer-events-none flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-blue-600 font-medium mr-1">
                                  Read more
                                </span>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.pic}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.target
                          ? new Date(row.target).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "Tidak ada target"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(row.status || "belum_ditindaklanjuti")}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-full relative group">
                          <div className="line-clamp-2 text-sm leading-tight cursor-help hover:bg-gray-50 p-1 rounded transition-colors relative group tooltip">
                            {row.deskripsiTindakLanjut || "Tidak ada deskripsi"}
                            <span className="tooltip-text">
                              {row.deskripsiTindakLanjut ||
                                "Tidak ada deskripsi"}
                            </span>
                          </div>
                          {row.deskripsiTindakLanjut &&
                            row.deskripsiTindakLanjut.length > 150 && (
                              <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white to-transparent w-8 h-6 pointer-events-none flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-xs text-blue-600 font-medium mr-1">
                                  Read more
                                </span>
                              </div>
                            )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {row.fileAttachment && row.fileAttachment !== "[]" ? (
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600">
                              {(() => {
                                try {
                                  const files = JSON.parse(row.fileAttachment);
                                  return `${files.length} file(s)`;
                                } catch {
                                  return "0 file(s)";
                                }
                              })()}
                            </span>
                            <div className="flex items-center space-x-1">
                              {(() => {
                                try {
                                  const files = JSON.parse(row.fileAttachment);
                                  return files.map(
                                    (file: any, index: number) => (
                                      <div
                                        key={index}
                                        className="flex items-center space-x-1"
                                      >
                                        <button
                                          onClick={() =>
                                            handleFileView(file.filename)
                                          }
                                          className="text-blue-600 hover:text-blue-800 text-xs p-1 rounded hover:bg-blue-50 transition-colors"
                                          title="View file"
                                        >
                                          <Eye className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleFileDownload(
                                              file.filename,
                                              file.originalName
                                            )
                                          }
                                          className="text-green-600 hover:text-green-800 text-xs p-1 rounded hover:bg-green-50 transition-colors"
                                          title="Download file"
                                        >
                                          <Download className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )
                                  );
                                } catch {
                                  return null;
                                }
                              })()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No files
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {canUserEditTindakLanjut(user?.role || "", row.pic) ? (
                          user?.role === "SUPER_ADMIN" ? (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Full Access
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
                              Limited Edit
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            View Only
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          {canUserEditTindakLanjut(
                            user?.role || "",
                            row.pic
                          ) ? (
                            <>
                              <button
                                onClick={() => handleEdit(row)}
                                className="text-blue-600 hover:text-blue-900 transition-colors"
                                title="Edit (with field restrictions)"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {user?.role === "SUPER_ADMIN" && (
                                <button
                                  onClick={() => setDeleteConfirm(row.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Delete (SUPER_ADMIN only)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <div className="flex items-center space-x-1 text-blue-400">
                              <Eye className="w-4 h-4" />
                              <span className="text-xs">View Only</span>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 sm:px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    {Math.min(indexOfLastItem, filteredTindakLanjut.length)}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {filteredTindakLanjut.length}
                  </span>{" "}
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
                        className={`relative inline-flex items-center px-3 py-2 border text-sm font-medium transition-colors ${
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
                onClick={() => setDeleteConfirm(undefined)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteConfirm);
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
                    value={formData.categoryId}
                    onChange={(e) => {
                      const selectedCategory = categories.find(
                        (cat) => cat.id === e.target.value
                      );
                      handleFormDataChange("categoryId", e.target.value);
                      handleFormDataChange(
                        "kategoriArahan",
                        selectedCategory?.categoryName || ""
                      );
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={editingRow && user?.role !== "SUPER_ADMIN"}
                  >
                    <option value="">
                      {loading ? "Loading categories..." : "Select an option"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg"
                    disabled={
                      loading || (editingRow && user?.role !== "SUPER_ADMIN")
                    }
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {editingRow && user?.role !== "SUPER_ADMIN" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Hanya SUPER_ADMIN yang dapat mengubah kategori arahan
                  </p>
                )}
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
                  disabled={
                    editingRow &&
                    !canUserEditTindakLanjut(user?.role || "", editingRow.pic)
                  }
                />
                <p className="text-xs text-green-600 mt-1"></p>
              </div>

              {/* PIC and Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PIC (Person in Charge) *
                  </label>
                  <select
                    value={formData.pic}
                    onChange={(e) =>
                      handleFormDataChange("pic", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={editingRow && user?.role !== "SUPER_ADMIN"}
                  >
                    {divisions.map((division) => (
                      <option key={division} value={division}>
                        {division}
                      </option>
                    ))}
                  </select>
                  {editingRow && user?.role !== "SUPER_ADMIN" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Hanya SUPER_ADMIN yang dapat mengubah PIC
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Penyelesaian *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.target}
                      onChange={(e) =>
                        handleFormDataChange("target", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={editingRow && user?.role !== "SUPER_ADMIN"}
                    />
                  </div>
                  {editingRow && user?.role !== "SUPER_ADMIN" && (
                    <p className="text-xs text-gray-500 mt-1">
                      Hanya SUPER_ADMIN yang dapat mengubah target penyelesaian
                    </p>
                  )}
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
                  disabled={
                    editingRow &&
                    !canUserEditTindakLanjut(user?.role || "", editingRow.pic)
                  }
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
                  disabled={
                    editingRow &&
                    !canUserEditTindakLanjut(user?.role || "", editingRow.pic)
                  }
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
                  disabled={
                    editingRow &&
                    !canUserEditTindakLanjut(user?.role || "", editingRow.pic)
                  }
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
                      disabled={
                        editingRow &&
                        !canUserEditTindakLanjut(
                          user?.role || "",
                          editingRow.pic
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      disabled={
                        editingRow &&
                        !canUserEditTindakLanjut(
                          user?.role || "",
                          editingRow.pic
                        )
                      }
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
                              onClick={() => handleFileView(file.filename)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
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
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    isSubmitting ||
                    (editingRow &&
                      !canUserEditTindakLanjut(
                        user?.role || "",
                        editingRow.pic
                      ))
                  }
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingRow
                    ? "Update"
                    : "Create"}
                </button>
                {!editingRow &&
                  (user?.role === "SUPER_ADMIN" || user?.role === "BOD-1") && (
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

export default TindakLanjutComponent;

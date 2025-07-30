import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  Filter,
  FileText,
  CheckCircle,
  Zap,
  Clock,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { DashboardStats, CategoryTable } from "../types";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    getArahanByDivision,
    arahan,
    categories,
    getCategoriesByDivision,
    categoryTables,
    loading,
    error,
  } = useData();
  const [selectedDivision, setSelectedDivision] = useState(
    user?.role === "SUPER_ADMIN" ? "BOD-1" : user?.role || ""
  );
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [selectedDivisionFilter, setSelectedDivisionFilter] =
    useState<string>("all");

  const divisions = ["BOD-1", "KSPI", "SEKPER", "VP AGA", "VP KEU", "VP OP"];

  const currentArahan =
    user?.role === "SUPER_ADMIN"
      ? (arahan || []).filter((item) => item.division === selectedDivision)
      : getArahanByDivision(user?.role || "");

  const stats: DashboardStats = {
    totalArahan: (categoryTables || [])
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          (table.tableData || [])
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce((tableSum, data) => tableSum + (data.jumlah || 0), 0),
        0
      ),
    selesai: (categoryTables || [])
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          (table.tableData || [])
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce((tableSum, data) => tableSum + (data.selesai || 0), 0),
        0
      ),
    selesaiBerkelanjutan: (categoryTables || [])
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          (table.tableData || [])
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce(
              (tableSum, data) => tableSum + (data.selesaiBerkelanjutan || 0),
              0
            ),
        0
      ),
    dalamProses: (categoryTables || [])
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          (table.tableData || [])
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce((tableSum, data) => tableSum + (data.proses || 0), 0),
        0
      ),
  };

  const uniquePICs = [
    "Semua",
    ...Array.from(new Set((currentArahan || []).map((item) => item.pic || ''))),
  ];

  const COLORS = [
    "#f97316", // Orange
    "#3b82f6", // Blue
    "#10b981", // Green
    "#f59e0b", // Yellow
    "#ef4444", // Red
    "#8b5cf6", // Purple
  ];

  // Data untuk pie chart berdasarkan divisi dari kategori
  const currentCategories =
    user?.role === "SUPER_ADMIN"
      ? (categories || [])
      : getCategoriesByDivision(user?.role || "");

  // Generate pie chart data for selected category or all categories
  const generatePieChartData = (categoryName: string) => {
    const relevantCategories =
      categoryName === "all"
        ? (currentCategories || [])
        : (currentCategories || []).filter((cat) => cat.categoryName === categoryName);

    const allArahan =
      user?.role === "SUPER_ADMIN"
        ? (arahan || [])
        : getArahanByDivision(user?.role || "");

    const divisionData = divisions
      .map((division) => {
        const divisionArahan = allArahan.filter(
          (arahan) =>
            arahan.division === division &&
            relevantCategories.some(
              (cat) =>
                (arahan.title && arahan.title.toLowerCase().includes(cat.categoryName?.toLowerCase() || '')) ||
                (arahan.description && arahan.description.toLowerCase().includes(cat.categoryName?.toLowerCase() || ''))
            )
        );

        return {
          name: division,
          value: divisionArahan.length,
          color: COLORS[divisions.indexOf(division) % COLORS.length],
        };
      })
      .filter((item) => item.value > 0);

    return divisionData;
  };

  // Generate pie chart data from category tables
  const generateCategoryTablePieChartData = (categoryTable: CategoryTable) => {
    const divisionData = (categoryTable.tableData || []).map((data) => {
      const divisionIndex = divisions.indexOf(data.division);
      return {
        name: data.division,
        value: data.progress || 0, // Progress percentage for pie chart
        total: data.jumlah || 0,
        selesai: data.selesai || 0,
        selesaiBerkelanjutan: data.selesaiBerkelanjutan || 0,
        proses: data.proses || 0,
        belumDitindaklanjuti: data.belumDitindaklanjuti || 0,
        color: COLORS[divisionIndex % COLORS.length],
      };
    });

    return divisionData;
  };

  const pieChartData = generatePieChartData("all");

  // Filter category tables based on user role
  const currentCategoryTables =
    user?.role === "SUPER_ADMIN"
      ? (categoryTables || [])
      : (categoryTables || []).filter((table) =>
          (table.tableData || []).some((data) => data.division === user?.role)
        );

  const statCards = [
    {
      title: "Jumlah Arahan",
      value: stats.totalArahan,
      description: "Total semua arahan yang tercatat",
      icon: FileText,
      color: "bg-blue-50 text-blue-700",
      iconColor: "text-blue-600",
    },
    {
      title: "Selesai",
      value: stats.selesai,
      description: "Arahan yang sudah tuntas",
      icon: CheckCircle,
      color: "bg-green-50 text-green-700",
      iconColor: "text-green-600",
    },
    {
      title: "Selesai Berkelanjutan",
      value: stats.selesaiBerkelanjutan,
      description: "Arahan yang selesai berkelanjutan",
      icon: Zap,
      color: "bg-yellow-50 text-yellow-700",
      iconColor: "text-yellow-600",
    },
    {
      title: "Dalam Proses",
      value: stats.dalamProses,
      description: "Arahan yang sedang dikerjakan",
      icon: Clock,
      color: "bg-orange-50 text-orange-700",
      iconColor: "text-orange-600",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600 font-medium">
            Progress: {data.value}%
          </p>
          <p className="text-sm text-gray-600">Total Arahan: {data.total}</p>
          <p className="text-sm text-gray-600">Selesai: {data.selesai}</p>
          <p className="text-sm text-gray-600">
            Selesai Berkelanjutan: {data.selesaiBerkelanjutan}
          </p>
          <p className="text-sm text-gray-600">Dalam Proses: {data.proses}</p>
          <p className="text-sm text-gray-600">
            Belum Ditindaklanjuti: {data.belumDitindaklanjuti}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">
            Overview progress pengisian tindak lanjut arahan strategis
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              {categoryTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.categoryName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedDivisionFilter}
              onChange={(e) => setSelectedDivisionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Divisi</option>
              {divisions.map((division) => (
                <option key={division} value={division}>
                  {division}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`${card.color} p-6 rounded-lg shadow-sm`}
                >
                  <div className="flex items-center">
                    <div className={`${card.iconColor} p-2 rounded-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium opacity-80">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold">{card.value}</p>
                    </div>
                  </div>
                  <p className="text-sm mt-2 opacity-70">{card.description}</p>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Progress Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Progress per Divisi
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Category Tables Progress */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Progress per Kategori
              </h3>
              <div className="space-y-4">
                {currentCategoryTables.map((table) => {
                  const tableData = generateCategoryTablePieChartData(table);
                  return (
                    <div key={table.id} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {table.categoryName}
                      </h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={tableData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={60}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {tableData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Aktivitas Terbaru
            </h3>
            <div className="space-y-3">
              {currentArahan.slice(0, 5).map((arahan) => (
                <div
                  key={arahan.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{arahan.title}</p>
                    <p className="text-sm text-gray-600">{arahan.division}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {arahan.pic}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        arahan.status === "selesai"
                          ? "bg-green-100 text-green-800"
                          : arahan.status === "dalam_proses"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {arahan.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;

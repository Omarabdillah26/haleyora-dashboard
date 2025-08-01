import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import { useRealTimeSync } from "../hooks/useRealTimeSync";
import {
  Filter,
  FileText,
  CheckCircle,
  Zap,
  Clock,
  PieChart as PieChartIcon,
  RefreshCw,
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
    tindakLanjut,
    getCategoryStatsFromTindakLanjut,
    getCategoryStatsByDivision,
    loading,
    refreshing,
  } = useData();
  const { syncData } = useRealTimeSync();

  const [selectedDivision, setSelectedDivision] = useState(
    user?.role === "SUPER_ADMIN" ? "BOD-1" : user?.role || ""
  );
  const [selectedTable, setSelectedTable] = useState<string>("all");
  const [selectedDivisionFilter, setSelectedDivisionFilter] =
    useState<string>("all");

  const divisions = ["BOD-1", "KSPI", "SEKPER", "VP AGA", "VP KEU", "VP OP"];

  const currentArahan =
    user?.role === "SUPER_ADMIN"
      ? arahan.filter((item) => item.division === selectedDivision)
      : getArahanByDivision(user?.role || "");

  const stats: DashboardStats = {
    totalArahan: categoryTables
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          table.tableData
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce((tableSum, data) => tableSum + data.jumlah, 0),
        0
      ),
    selesai: categoryTables
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          table.tableData
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce((tableSum, data) => tableSum + data.selesai, 0),
        0
      ),
    selesaiBerkelanjutan: categoryTables
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          table.tableData
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce(
              (tableSum, data) => tableSum + data.selesaiBerkelanjutan,
              0
            ),
        0
      ),
    dalamProses: categoryTables
      .filter((table) => selectedTable === "all" || table.id === selectedTable)
      .reduce(
        (sum, table) =>
          sum +
          table.tableData
            .filter(
              (data) =>
                selectedDivisionFilter === "all" ||
                data.division === selectedDivisionFilter
            )
            .reduce((tableSum, data) => tableSum + data.proses, 0),
        0
      ),
  };

  const uniquePICs = [
    "Semua",
    ...Array.from(new Set(currentArahan.map((item) => item.pic))),
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
      ? categories
      : getCategoriesByDivision(user?.role || "");

  // Generate pie chart data for selected category or all categories
  const generatePieChartData = (categoryName: string) => {
    const relevantCategories =
      categoryName === "all"
        ? currentCategories
        : currentCategories.filter((cat) => cat.categoryName === categoryName);

    const allArahan =
      user?.role === "SUPER_ADMIN"
        ? arahan
        : getArahanByDivision(user?.role || "");

    const divisionData = divisions
      .map((division) => {
        const divisionArahan = allArahan.filter(
          (arahan) =>
            arahan.division === division &&
            relevantCategories.some(
              (cat) =>
                (arahan.title &&
                  arahan.title
                    .toLowerCase()
                    .includes(cat.categoryName?.toLowerCase() || "")) ||
                (arahan.description &&
                  arahan.description
                    .toLowerCase()
                    .includes(cat.categoryName?.toLowerCase() || ""))
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
    const divisionData = categoryTable.tableData
      .filter((data) => data.jumlah > 0) // Only include data with valid jumlah
      .map((data) => {
        const divisionIndex = divisions.indexOf(data.division);
        const progress =
          typeof data.progress === "string"
            ? parseFloat(data.progress)
            : data.progress || 0;
        return {
          name: data.division,
          value: progress, // Progress percentage for pie chart
          total: data.jumlah || 0,
          selesai: data.selesai || 0,
          selesaiBerkelanjutan: data.selesaiBerkelanjutan || 0,
          proses: data.proses || 0,
          belumDitindaklanjuti: data.belumDitindaklanjuti || 0,
          color: COLORS[divisionIndex % COLORS.length],
        };
      })
      .filter((item) => !isNaN(item.value) && item.value >= 0); // Filter out NaN and negative values

    // If no data with valid jumlah, show at least one entry
    if (divisionData.length === 0 && categoryTable.tableData.length > 0) {
      const firstData = categoryTable.tableData[0];
      const divisionIndex = divisions.indexOf(firstData.division);
      const progress =
        typeof firstData.progress === "string"
          ? parseFloat(firstData.progress)
          : firstData.progress || 0;
      divisionData.push({
        name: firstData.division,
        value: progress,
        total: firstData.jumlah || 0,
        selesai: firstData.selesai || 0,
        selesaiBerkelanjutan: firstData.selesaiBerkelanjutan || 0,
        proses: firstData.proses || 0,
        belumDitindaklanjuti: firstData.belumDitindaklanjuti || 0,
        color: COLORS[divisionIndex % COLORS.length],
      });
    }

    return divisionData;
  };

  // Generate pie chart data from tindakLanjut data
  const generateTindakLanjutPieChartData = (categoryName: string) => {
    // Find the category from categories array
    const category = categories.find(cat => cat.categoryName === categoryName);
    if (!category) {
      return [];
    }
    
    // Get tindakLanjut data for this category using categoryId
    const categoryTindakLanjut = tindakLanjut.filter(
      (tl) => tl.categoryId === category.id
    );
    
    // Group by division and calculate stats
    const divisionStats = divisions.map((division) => {
      const divisionTindakLanjut = categoryTindakLanjut.filter(
        (tl) => tl.pic === division
      );
      
      const stats = {
        total: divisionTindakLanjut.length,
        selesai: divisionTindakLanjut.filter(tl => tl.status === 'selesai').length,
        selesaiBerkelanjutan: divisionTindakLanjut.filter(tl => tl.status === 'selesai_berkelanjutan').length,
        dalamProses: divisionTindakLanjut.filter(tl => tl.status === 'dalam_proses').length,
        belumDitindaklanjuti: divisionTindakLanjut.filter(tl => tl.status === 'belum_ditindaklanjuti').length,
      };
      
      // Calculate progress
      const completed = stats.selesai + stats.selesaiBerkelanjutan;
      const progress = stats.total > 0 ? Math.round((completed / stats.total) * 100) : 0;
      
      return {
        name: division,
        value: progress,
        total: stats.total,
        selesai: stats.selesai,
        selesaiBerkelanjutan: stats.selesaiBerkelanjutan,
        proses: stats.dalamProses,
        belumDitindaklanjuti: stats.belumDitindaklanjuti,
        color: COLORS[divisions.indexOf(division) % COLORS.length],
      };
    }).filter((item) => item.total > 0); // Only include divisions with data
    
    return divisionStats;
  };

  const pieChartData = generatePieChartData("all");

  // Filter category tables based on user role
  const currentCategoryTables =
    user?.role === "SUPER_ADMIN"
      ? categoryTables
      : categoryTables.filter((table) =>
          table.tableData.some((data) => data.division === user?.role)
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
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Progress Pengisian Tindak Lanjut Arahan Strategis
            </h2>
            {refreshing && (
              <div className="flex items-center space-x-1 text-blue-600">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Refreshing...</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Kategori</option>
              {categories
                .filter(category => tindakLanjut.some(tl => tl.categoryId === category.id))
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className={`w-6 h-6 ${card.iconColor}`} />
                  </div>
                  <span className="text-3xl font-bold text-gray-900">
                    {card.value}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {card.title}
                </h4>
                <p className="text-sm text-gray-600">{card.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Tables Pie Charts Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-6">
          <PieChartIcon className="w-6 h-6 text-gray-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            Progress per Kategori Tabel
          </h3>
        </div>

        {/* Test Pie Chart */}
        {/* <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="text-sm font-semibold text-yellow-800 mb-2">Test Pie Chart</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "Test A", value: 30, color: "#f97316" },
                    { name: "Test B", value: 70, color: "#3b82f6" }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={40}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories
            .filter((category) => {
              // Only show categories that have tindakLanjut data
              const hasTindakLanjut = tindakLanjut.some(tl => tl.categoryId === category.id);
              return hasTindakLanjut && (selectedTable === "all" || category.id === selectedTable);
            })
            .map((category) => {
              const pieData = generateTindakLanjutPieChartData(category.categoryName).filter(
                (data) =>
                  selectedDivisionFilter === "all" ||
                  data.name === selectedDivisionFilter
              );

              const totalProgress =
                pieData.length > 0
                  ? Math.round(
                      pieData.reduce(
                        (sum, item) => sum + (item.value || 0),
                        0
                      ) / pieData.length
                    )
                  : 0;

              return (
                <div
                  key={category.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                >
                  <div className="text-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {category.categoryName}
                    </h4>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="text-2xl font-bold text-gray-900">
                        {totalProgress}%
                      </div>
                      <div className="text-sm text-gray-600">
                        Rata-rata Progress
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {category.description}
                    </p>
                  </div>

                  {pieData.length > 0 ? (
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={60}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                          <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            wrapperStyle={{ fontSize: "11px", paddingLeft: "10px" }}
                            formatter={(value, entry) => (
                              <span style={{ color: entry.color }}>
                                {value}: {entry.payload?.value || 0}%
                              </span>
                            )}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <PieChartIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Belum ada data</p>
                        <p className="text-xs">
                          Debug: pieData.length = {pieData.length}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Total Divisi: {pieData.length} | Total Arahan:{" "}
                    {pieData.reduce((sum, item) => sum + (item.total || 0), 0)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Detail Kategori Tabel
          </h3>
        </div>
        <div className="p-6">
          {categoryTables.filter(
            (table) => selectedTable === "all" || table.id === selectedTable
          ).length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                Tidak ada kategori tabel yang ditemukan
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {categoryTables
                .filter(
                  (table) =>
                    selectedTable === "all" || table.id === selectedTable
                )
                .map((table) => (
                  <div
                    key={table.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      {table.categoryName}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {table.description}
                    </p>

                    {table.tableData.filter(
                      (data) =>
                        selectedDivisionFilter === "all" ||
                        data.division === selectedDivisionFilter
                    ).length > 0 ? (
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
                                Selesai
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                Selesai Berkelanjutan
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                Dalam Proses
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                Belum Ditindaklanjuti
                              </th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-900">
                                Progress
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {table.tableData
                              .filter(
                                (data) =>
                                  selectedDivisionFilter === "all" ||
                                  data.division === selectedDivisionFilter
                              )
                              .map((data, index) => (
                                <tr
                                  key={data.id}
                                  className={`border-b border-gray-100 ${
                                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                                  }`}
                                >
                                  <td className="py-3 px-4 font-medium text-gray-900">
                                    {data.division}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {data.jumlah}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {data.selesai}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {data.selesaiBerkelanjutan}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {data.proses}
                                  </td>
                                  <td className="py-3 px-4 text-gray-700">
                                    {data.belumDitindaklanjuti}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {data.progress}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-500">
                          Belum ada data untuk kategori ini
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;

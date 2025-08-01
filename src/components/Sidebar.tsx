import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Grid3X3,
  ClipboardList,
  Building2,
  Database,
  Users,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoImage from "../image/Logo_PLN-removebg-preview.png";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, path: "/dashboard" },
    {
      id: "categories",
      label: "Rincian Kategori",
      icon: Grid3X3,
      path: "/categories",
    },
    {
      id: "tindak-lanjut",
      label: "Tindak Lanjut",
      icon: ClipboardList,
      path: "/tindak-lanjut",
    },
    // Show Users menu only for SUPER_ADMIN
    ...(user?.role === "SUPER_ADMIN" ? [
      {
        id: "users",
        label: "Users",
        icon: Users,
        path: "/users",
      }
    ] : []),
    // { id: 'database-test', label: 'Database Test', icon: Database, path: '/database-test' },
  ];

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === "/dashboard" || path === "/") return "dashboard";
    if (path === "/categories") return "categories";
    if (path.startsWith("/tindak-lanjut")) return "tindak-lanjut";
    if (path === "/users") return "users";
    if (path === "/database-test") return "database-test";
    return "dashboard";
  };

  const activeTab = getActiveTab();

  return (
    <div className="w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 rounded-lg w-10 h-10 flex items-center justify-center">
            <img 
              src={logoImage} 
              alt="PLN Logo" 
              className="w-8 h-8 object-contain"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">REPLAY</h1>
            <p className="text-xs text-gray-500">Dashboard Monitoring</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {user && (
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-medium text-sm">
                {user.name.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

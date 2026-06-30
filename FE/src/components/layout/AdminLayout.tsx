import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Đăng xuất thất bại:", error);
    }
  };

  // Các danh mục menu của Admin để map tự động
<<<<<<< HEAD
  const menuItems = [
    { text: "Thống kê chung", icon: "dashboard", path: "/admin/dashboard" },
    { text: "Event Management", icon: "calendar_month", path: "/admin/events" },
    { text: "Categories", icon: "category", path: "/admin/categories" },
  ];
=======
    const menuItems = [
        { text: "Thống kê chung", icon: "dashboard", path: "/admin/dashboard" },
        { text: "Quản lý Sự kiện", icon: "calendar_month", path: "/admin/events" },
        { text: "Check-in QR", icon: "qr_code_scanner", path: "/admin/check-in" },
    ];
>>>>>>> 1efe319463702ae6111f8d069c7984c53e092196

  return (
    <div className="min-h-screen bg-slate-100 font-inter flex">
      
      {/* 1. SIDEBAR QUẢN TRỊ (CỐ ĐỊNH BÊN TRÁI) */}
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800">
        {/* Tên hệ thống */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950 gap-2">
          <span className="material-symbols-outlined text-blue-500 font-bold">admin_panel_settings</span>
          <span className="font-bold text-white tracking-wide uppercase text-sm">
            Event Management
          </span>
        </div>

        {/* Danh sách Menu điều hướng */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Hệ thống
          </div>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition active:scale-[0.98] ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
                {item.text}
              </button>
            );
          })}
        </nav>

        {/* Thông tin tài khoản Admin đang đăng nhập */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-500/30">
            {user?.fullName?.charAt(0).toUpperCase() || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.fullName || "Quản trị viên"}</p>
            <p className="text-xs text-slate-500 truncate">Role: ADMIN ({user?.role})</p>
          </div>
        </div>
      </aside>

      {/* 2. VÙNG NỘI DUNG CHÍNH (BÊN PHẢI) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR / HEADER QUẢN TRỊ */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <span>Trang quản trị</span>
            <span>/</span>
            <span className="text-slate-800 capitalize">
              {location.pathname.split("/").pop() || "Dashboard"}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Nút quay lại màn hình User xem giao diện */}
            <button
              onClick={() => navigate("/")}
              className="text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-base">desktop_windows</span>
              Xem trang chủ User
            </button>

            {/* Nút đăng xuất của hệ thống */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              Đăng xuất
            </button>
          </div>
        </header>

        {/* NƠI HIỂN THỊ NỘI DUNG CÁC TRANG CON ADMIN */}
        <main className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </main>

      </div>
    </div>
  );
};
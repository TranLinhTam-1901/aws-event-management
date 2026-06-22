import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto h-16 px-6 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/")}
            className="text-xl font-bold text-blue-700 hover:text-blue-800 transition bg-transparent cursor-pointer"
          >
            EventHub Cloud
          </button>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/events")}
                className="text-slate-600 hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Sự kiện
              </button>
              <button
                onClick={() => navigate("/my-tickets")}
                className="text-slate-600 hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Vé của tôi
              </button>
              <button
                onClick={() => navigate("/certificates")}
                className="text-slate-600 hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Chứng chỉ
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-700" />
          ) : isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-100 transition"
              >
                <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <span className="text-slate-700 font-medium hidden sm:inline">
                  {user?.email}
                </span>
                <span className="material-symbols-outlined text-slate-600">
                  {showMenu ? "expand_less" : "expand_more"}
                </span>
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2">
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition"
                  >
                    <span className="material-symbols-outlined">person</span>
                    Hồ sơ cá nhân
                  </button>
                  <button
                    onClick={() => {
                      navigate("/my-tickets");
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition"
                  >
                    <span className="material-symbols-outlined">
                      confirmation_number
                    </span>
                    Vé của tôi
                  </button>
                  <button
                    onClick={() => {
                      navigate("/certificates");
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition"
                  >
                    <span className="material-symbols-outlined">
                      workspace_premium
                    </span>
                    Chứng chỉ
                  </button>
                  <div className="border-t border-slate-200 my-2" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 flex items-center gap-2 transition font-medium"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-slate-600 hover:text-blue-700 transition"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-700 text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition"
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

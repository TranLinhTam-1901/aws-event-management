import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Lắng nghe sự thay đổi URL để tự động reset menu
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  const [showMenu, setShowMenu] = useState(false);
  const [prevPathname, setPrevPathname] = useState(location.pathname);

// Kiểm tra trực tiếp trong thân Component (đang render)
if (location.pathname !== prevPathname) {
  setPrevPathname(location.pathname);
  setShowMenu(false); // React sẽ tự động gom chuyến render này lại, không bị lỗi linter
}
  // TỰ ĐỘNG ĐÓNG MENU KHI CLICK RA NGOÀI (Click Outside)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    try {
      setShowMenu(false);
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
            className="text-xl font-bold text-blue-700 hover:text-blue-800 transition bg-transparent cursor-pointer border-none p-0"
          >
            EventHub Cloud
          </button>

          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => navigate("/events")}
                className="text-slate-600 hover:text-blue-700 bg-transparent cursor-pointer transition border-none p-0"
              >
                Sự kiện
              </button>
              <button
                onClick={() => navigate("/my-tickets")}
                className="text-slate-600 hover:text-blue-700 bg-transparent cursor-pointer transition border-none p-0"
              >
                Vé của tôi
              </button>
              <button
                onClick={() => navigate("/certificates")}
                className="text-slate-600 hover:text-blue-700 bg-transparent cursor-pointer transition border-none p-0"
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
            /* Bao bọc bằng div ref để bắt sự kiện click outside */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200 cursor-pointer outline-none bg-transparent"
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover shadow-sm border border-slate-200"
                  />
                ) : (
                  <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                    {(user?.fullName || user?.email || "U").charAt(0).toUpperCase()}
                  </div>
                )}
                
                <span className="text-slate-700 font-medium text-sm hidden sm:inline max-w-[120px] truncate">
                  {user?.fullName || user?.email}
                </span>
                
                <span className="material-symbols-outlined text-slate-400 text-lg transition duration-200">
                  {showMenu ? "expand_less" : "expand_more"}
                </span>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 animate-in fade-in slide-in-from-top-3 duration-200z-50">
                  
                  {/* Mini Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 rounded-t-2xl -mt-2 mb-1 flex items-center gap-3">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border border-white shadow-sm" />
                    ) : (
                      <div className="w-9 h-9 bg-blue-700 text-white font-bold rounded-full flex items-center justify-center text-sm shadow-sm">
                        {(user?.fullName || "U").charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{user?.fullName || "Thành viên"}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                  </div>

                  {/* Danh sách tính năng chính */}
                  <div className="px-1.5 space-y-0.5">
                    <button
                      onClick={() => navigate("/profile/me")}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50/70 hover:text-blue-700 rounded-xl text-slate-600 flex items-center gap-2.5 transition text-sm font-medium border-none cursor-pointer bg-transparent"
                    >
                      <span className="material-symbols-outlined text-xl text-slate-400">account_circle</span>
                      Hồ sơ cá nhân
                    </button>
                    
                    <button
                      onClick={() => navigate("/my-tickets")}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50/70 hover:text-blue-700 rounded-xl text-slate-600 flex items-center gap-2.5 transition text-sm font-medium border-none cursor-pointer bg-transparent"
                    >
                      <span className="material-symbols-outlined text-xl text-slate-400">confirmation_number</span>
                      Vé của tôi
                    </button>
                    
                    <button
                      onClick={() => navigate("/certificates")}
                      className="w-full text-left px-3 py-2 hover:bg-blue-50/70 hover:text-blue-700 rounded-xl text-slate-600 flex items-center gap-2.5 transition text-sm font-medium border-none cursor-pointer bg-transparent"
                    >
                      <span className="material-symbols-outlined text-xl text-slate-400">workspace_premium</span>
                      Chứng chỉ
                    </button>
                  </div>

                  {/* Phân cách Đăng xuất */}
                  <div className="border-t border-slate-100 my-1.5" />
                  
                  <div className="px-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-rose-50 text-rose-600 rounded-xl flex items-center gap-2.5 transition text-sm font-semibold border-none cursor-pointer bg-transparent"
                    >
                      <span className="material-symbols-outlined text-xl">logout</span>
                      Đăng xuất
                    </button>
                  </div>

                </div>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-slate-600 hover:text-blue-700 transition bg-transparent border-none cursor-pointer font-medium text-sm"
              >
                Đăng nhập
              </button>
              <button
                onClick={() => navigate("/register")}
                className="bg-blue-700 text-white px-5 py-2.5 rounded-xl hover:bg-blue-800 transition border-none cursor-pointer font-medium text-sm"
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
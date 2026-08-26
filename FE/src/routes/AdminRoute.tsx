import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export const AdminRoute: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // 1. Đang tải dữ liệu từ API hoặc kiểm tra trạng thái login
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  // 2. Chưa đăng nhập hoặc không có thông tin user hợp lệ -> Đẩy về login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 3. Đã đăng nhập nhưng không phải Admin (role !== 1) -> Đẩy ngược về trang chủ công khai
  if (user.role !== 1) {
    return <Navigate to="/" replace />;
  }


  // 4. Hợp lệ -> Cho phép đi tiếp vào các Route quản trị con
  return <Outlet />;
};
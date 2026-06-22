import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AdminRoute } from "./AdminRoute";
import { HomePage } from "../pages/public/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { ConfirmRegisterPage } from "../pages/auth/ConfirmRegisterPage";
import { MyTicketsPage } from "../pages/user/MyTicketsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLayout } from "../components/layout/AdminLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/confirm-register" element={<ConfirmRegisterPage />} />
        <Route path="/forgot-password"  element={<ForgotPasswordPage />}/>
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />

      // Các route được bảo vệ chỉ có thể truy cập khi đã đăng nhập
          <Route element={<ProtectedRoute />}>
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
            <Route path="/my-tickets" element={<MyTicketsPage />} />
          </Route>

         <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
         
          
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        {/* Trang lỗi 404 nếu người dùng truy cập bừa bãi (Nên thêm ở cuối cùng) */}
        <Route path="*" element={<div className="p-10 text-center text-xl font-medium">Trang không tồn tại - 404</div>} />

      
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
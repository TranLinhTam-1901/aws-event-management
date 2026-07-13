import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnalyticsPage } from "../pages/admin/AnalyticsPage";
import { AdminRoute } from "./AdminRoute";
import { ProtectedRoute } from "./ProtectedRoute";

import { HomePage } from "../pages/public/HomePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { ConfirmRegisterPage } from "../pages/auth/ConfirmRegisterPage";

// import { UserProfilePage } from "../pages/user/UserProfilePage";
import { MyTicketsPage } from "../pages/user/MyTicketsPage";

import { AdminLayout } from "../components/layout/AdminLayout";
import { EventManagementPage } from "../pages/admin/EventManagementPage";
import { UserProfilePage } from "../pages/user/UserProfilePage";
import { CheckInPage } from "../pages/admin/CheckInPage";

import { EventCreatePage } from "../pages/admin/EventCreatePage";
import { EventEditPage } from "../pages/admin/EventEditPage";
import { CategoryManagementPage } from "../pages/admin/CategoryManagementPage";
import { EventListPage } from "../pages/public/EventListPage";
import { EventDetailPage } from "../pages/public/EventDetailPage";
import { MyCertificatesPage } from "../pages/user/MyCertificatesPage";
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/confirm-register"
          element={<ConfirmRegisterPage />}
        />
        <Route
          path="/forgot-password"
          element={<ForgotPasswordPage />}
        />
        <Route
          path="/reset-password"
          element={<ResetPasswordPage />}
        />
        <Route path="/events" element={<EventListPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile/me" element={<UserProfilePage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/certificates" element={<MyCertificatesPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute />}>
          <Route element={<AdminLayout />}>


            <Route
              path="/admin/events"
              element={<EventManagementPage />}
            />
            <Route
              path="/admin/events/create"
              element={<EventCreatePage />}
            />
            <Route
              path="/admin/events/:eventId/edit"
              element={<EventEditPage />}
            />
            <Route
              path="/admin/categories"
              element={<CategoryManagementPage />}
            />
            <Route
              path="/admin"
              element={<Navigate to="/admin/analytics" replace />}
            />
          <Route path="/admin/analytics" element={<AnalyticsPage />} /> 
          <Route path="/admin/check-in" element={<CheckInPage />} />

          <Route path="/admin" element={<Navigate to="/admin/analytics" replace />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="p-10 text-center text-xl font-medium">
              Trang không tồn tại - 404
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
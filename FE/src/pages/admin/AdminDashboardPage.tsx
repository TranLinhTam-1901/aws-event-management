import React from "react";
import { useAuth } from "../../context/AuthContext";

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Dữ liệu giả lập (Mock Data) để hiển thị số liệu thống kê cho đẹp mắt
  const stats = [
    { title: "Tổng số sự kiện", value: "24", icon: "calendar_month", color: "bg-blue-500" },
    { title: "Vé đã phát hành", value: "1,250", icon: "confirmation_number", color: "bg-emerald-500" },
    { title: "Người tham gia", value: "840", icon: "groups", color: "bg-amber-500" },
    { title: "Chứng chỉ đã cấp", value: "320", icon: "workspace_premium", color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-8">
      
      {/* 1. LỜI CHÀO & THÔNG TIN CHỨNG THỰC */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 text-white p-8 rounded-3xl shadow-lg border border-slate-800">
        <h1 className="text-3xl font-bold mb-2">
          Xin chào, {user?.email || user?.fullName || "Quản trị viên"}! 👋
        </h1>
        <p className="text-blue-200 text-sm max-w-xl leading-relaxed">
          Chào mừng bạn đến với Hệ thống Quản trị Sự kiện. Hiện tại Frontend đã xác thực tài khoản của bạn thành công với quyền <span className="font-bold text-white underline">ADMIN (Role: {user?.role})</span> trích xuất từ dữ liệu DynamoDB.
        </p>
      </div>

      {/* 2. CÁC THẺ THỐNG KÊ (STAT CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-md`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. KHU VỰC BẢNG DỮ LIỆU GIẢ LẬP ĐỂ KIỂM TRA ROUTE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">Sự kiện sắp diễn ra</h3>
            <p className="text-xs text-slate-500">Danh sách các hoạt động cần phân tích và quản lý điểm danh</p>
          </div>
          <button className="text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition">
            Xem tất cả
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-semibold text-xs uppercase border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Tên Sự Kiện</th>
                <th className="px-6 py-4">Thời Gian</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {[
                { name: "Workshop Kiến Trúc Serverless với AWS Lambda", time: "25/06/2026 - 09:00", status: "Sắp diễn ra", color: "text-blue-700 bg-blue-50 border-blue-200" },
                { name: "Đào tạo Lập trình .NET Web API Nâng Cao", time: "30/06/2026 - 14:00", status: "Đang mở đăng ký", color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
                { name: "Hội thảo Tích hợp AI (Semantic Kernel) vào Phần mềm", time: "05/07/2026 - 08:30", status: "Bản nháp", color: "text-slate-600 bg-slate-100 border-slate-200" }
              ].map((ev, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition">
                  <td className="px-6 py-4 font-medium text-slate-900">{ev.name}</td>
                  <td className="px-6 py-4 text-slate-500">{ev.time}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${ev.color}`}>
                      {ev.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-700 hover:underline font-medium text-xs">
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
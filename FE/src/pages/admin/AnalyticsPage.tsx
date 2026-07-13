import React, { useEffect, useState } from "react";
import { getDashboardOverview, getEventAnalytics } from "../../services/analyticsApi";
import type { DashboardOverview, EventAnalytics } from "../../services/analyticsApi";
import { getAdminEvents } from "../../services/eventsApi";
import type { EventListItem } from "../../services/eventsApi";

export const AnalyticsPage: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [overviewError, setOverviewError] = useState<string | null>(null);

  const [events, setEvents] = useState<EventListItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [loadingEventAnalytics, setLoadingEventAnalytics] = useState(false);
  const [eventAnalyticsError, setEventAnalyticsError] = useState<string | null>(null);

  // Tải dữ liệu tổng quan + danh sách sự kiện khi vào trang
  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoadingOverview(true);
        const data = await getDashboardOverview();
        setOverview(data);
        setOverviewError(null);
      } catch (err) {
        console.error("Lỗi tải thống kê tổng quan:", err);
        setOverviewError("Không thể tải dữ liệu thống kê tổng quan.");
      } finally {
        setLoadingOverview(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const data = await getAdminEvents();
        setEvents(data);
      } catch (err) {
        console.error("Lỗi tải danh sách sự kiện:", err);
      }
    };

    fetchOverview();
    fetchEvents();
  }, []);

  // Tải thống kê riêng khi chọn 1 sự kiện
  useEffect(() => {
    if (!selectedEventId) {
      setEventAnalytics(null);
      return;
    }

    const fetchEventAnalytics = async () => {
      try {
        setLoadingEventAnalytics(true);
        const data = await getEventAnalytics(selectedEventId);
        setEventAnalytics(data);
        setEventAnalyticsError(null);
      } catch (err) {
        console.error("Lỗi tải thống kê sự kiện:", err);
        setEventAnalyticsError("Không thể tải thống kê cho sự kiện này.");
        setEventAnalytics(null);
      } finally {
        setLoadingEventAnalytics(false);
      }
    };

    fetchEventAnalytics();
  }, [selectedEventId]);

  const overviewCards = [
    { title: "Tổng số sự kiện", value: overview?.totalEvents, icon: "calendar_month", color: "bg-blue-500" },
    { title: "Vé đã phát hành", value: overview?.totalRegistrations, icon: "confirmation_number", color: "bg-emerald-500" },
    { title: "Đã xác nhận", value: overview?.confirmedRegistrations, icon: "check_circle", color: "bg-teal-500" },
    { title: "Người tham gia", value: overview?.totalCheckIns, icon: "groups", color: "bg-amber-500" },
    { title: "Tỷ lệ tham dự", value: overview ? `${overview.averageAttendanceRate}%` : undefined, icon: "trending_up", color: "bg-cyan-500" },
    { title: "Chứng chỉ đã cấp", value: overview?.certificatesIssuedCount, icon: "workspace_premium", color: "bg-indigo-500" },
    { title: "Email đã gửi / lỗi", value: overview ? `${overview.emailSentCount} / ${overview.emailFailedCount}` : undefined, icon: "mail", color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-8">

      {/* TIÊU ĐỀ TRANG */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Thống kê &amp; Phân tích</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tổng quan hoạt động hệ thống và chi tiết theo từng sự kiện
        </p>
      </div>

      {overviewError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {overviewError}
        </div>
      )}

      {/* THẺ THỐNG KÊ TỔNG QUAN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between hover:shadow-md transition"
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {loadingOverview ? "..." : stat.value ?? 0}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-md`}>
              <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* THỐNG KÊ THEO TỪNG SỰ KIỆN */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-900 mb-3">Thống kê theo sự kiện</h3>
          <select
            className="w-full sm:w-96 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="">-- Chọn một sự kiện --</option>
            {events.map((ev) => (
              <option key={ev.eventId} value={ev.eventId}>
                {ev.title}
              </option>
            ))}
          </select>
        </div>

        <div className="p-6">
          {!selectedEventId && (
            <p className="text-sm text-slate-500 text-center py-8">
              Chọn một sự kiện ở trên để xem thống kê chi tiết.
            </p>
          )}

          {selectedEventId && loadingEventAnalytics && (
            <p className="text-sm text-slate-500 text-center py-8">Đang tải dữ liệu...</p>
          )}

          {selectedEventId && eventAnalyticsError && (
            <p className="text-sm text-red-600 text-center py-8">{eventAnalyticsError}</p>
          )}

          {selectedEventId && !loadingEventAnalytics && eventAnalytics && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold">Tổng đăng ký</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{eventAnalytics.totalRegistrations}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold">Đã xác nhận</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{eventAnalytics.confirmedCount}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold">Đã tham dự</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{eventAnalytics.checkInCount}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-xs text-slate-500 uppercase font-semibold">Tỷ lệ tham dự</p>
                <p className="text-2xl font-bold text-cyan-600 mt-1">{eventAnalytics.attendanceRate}%</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
import React from "react";
import { useNavigate } from "react-router-dom";

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-900">EventHub Cloud</h3>
          <p className="text-sm text-slate-600">
            Cổng kết nối bạn đến với những trải nghiệm học tập và sự kiện đẳng
            cấp quốc tế.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-slate-900">Khám phá</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <button
                onClick={() => navigate("/events")}
                className="hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Sự kiện
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/events")}
                className="hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Workshop
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/certificates")}
                className="hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Chứng chỉ
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/profile")}
                className="hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Hồ sơ cá nhân
              </button>
            </li>
          </ul>
        </div>

        {/* <div>
          <h4 className="font-semibold mb-4 text-slate-900">Của tôi</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <button
                onClick={() => navigate("/my-tickets")}
                className="hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Vé của tôi
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/certificates")}
                className="hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Chứng chỉ
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("/profile")}
                className="hover:text-blue-700 bg-transparent cursor-pointer transition"
              >
                Hồ sơ cá nhân
              </button>
            </li>
          </ul>
        </div> */}

        <div>
          <h4 className="font-semibold mb-4 text-slate-900">Hỗ trợ</h4>
          <ul className="space-y-3 text-sm text-slate-600">
            <li>
              <a href="#" className="hover:text-blue-700 transition">
                Liên hệ chúng tôi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-700 transition">
                Câu hỏi thường gặp
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-700 transition">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-blue-700 transition">
                Điều khoản sử dụng
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6 border-t border-slate-200 text-sm text-slate-500">
        © 2024 EventHub Cloud.
      </div>
    </footer>
  );
};

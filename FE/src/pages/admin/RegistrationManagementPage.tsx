import React from 'react';
import { AdminLayout } from '../../components/layout/AdminLayout';

export const RegistrationManagementPage: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold mb-8">Quản lý đăng ký</h1>
      <p className="text-gray-600">Danh sách đăng ký tạm thời không khả dụng trong bản local.</p>
    </AdminLayout>
  );
};

import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import userProfileService, { type UserProfile } from '../../services/userProfileService';

const statusLabels: Record<number, string> = {
  0: 'Hoạt động',
  1: 'Không hoạt động',
  2: 'Bị khóa',
};

const statusStyles: Record<number, string> = {
  0: 'bg-green-100 text-green-700',
  1: 'bg-yellow-100 text-yellow-700',
  2: 'bg-red-100 text-red-700',
};

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await userProfileService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách người dùng.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleStatusChange = async (user: UserProfile, nextStatus: number) => {
    setUpdatingUserId(user.userId);
    try {
      await userProfileService.updateUserStatus(user.userId, nextStatus);
      await loadUsers();
      toast.success(nextStatus === 2 ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.');
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật trạng thái người dùng không thành công.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Quản lý tài khoản người dùng</h1>
          <p className="text-sm text-slate-500 mt-1">Danh sách tài khoản hiện có và trạng thái khóa/mở khóa.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-slate-600">Đang tải danh sách người dùng...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-slate-600">Chưa có người dùng nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Người dùng</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {users.map((user) => {
                    const isLocked = user.status === 2;
                    return (
                      <tr key={user.userId}>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-800">{user.fullName || 'Chưa cập nhật'}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.isAdmin ? 'Admin' : 'Người dùng'}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[user.status] || 'bg-slate-100 text-slate-700'}`}>
                            {statusLabels[user.status] || 'Không xác định'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleStatusChange(user, isLocked ? 0 : 2)}
                            disabled={updatingUserId === user.userId}
                            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${isLocked ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-rose-600 text-white hover:bg-rose-700'} disabled:opacity-60`}
                          >
                            {updatingUserId === user.userId ? 'Đang xử lý...' : isLocked ? 'Mở khóa' : 'Khóa'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

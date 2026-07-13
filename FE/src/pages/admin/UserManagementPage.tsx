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

const PAGE_SIZE = 5;

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const loadUsers = async (email?: string) => {
    setLoading(true);
    try {
      const data = await userProfileService.getAllUsers(email?.trim() || undefined);
      setUsers(data);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải danh sách người dùng.');
      setUsers([]);
      setCurrentPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const handleSearch = async (event?: React.FormEvent) => {
    event?.preventDefault();
    await loadUsers(searchTerm);
  };

  const handleReset = async () => {
    setSearchTerm('');
    await loadUsers();
  };

  const totalPages = Math.max(1, Math.ceil(users.length / PAGE_SIZE));
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pagedUsers = users.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

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
          <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3 md:flex-row md:items-center md:justify-end md:px-4">
            <form onSubmit={handleSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Nhập email..."
                className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-sky-500 sm:w-56"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-sky-600 px-2.5 py-1.5 text-sm font-semibold text-white hover:bg-sky-700"
                >
                  Tìm
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="p-8 text-slate-600">Đang tải danh sách người dùng...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-slate-600">
              {searchTerm ? `Không tìm thấy người dùng nào với email chứa "${searchTerm}".` : 'Chưa có người dùng nào.'}
            </div>
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
                  {pagedUsers.map((user) => {
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

          {!loading && users.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Hiển thị {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, users.length)} trên {users.length} tài khoản
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="rounded-lg bg-white px-3 py-1.5 font-semibold text-slate-700 shadow-sm">
                  {currentPage}/{totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

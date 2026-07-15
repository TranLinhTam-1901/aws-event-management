import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { AppButton } from '../../components/common/AppButton';
import categoryService from '../../services/categoryService';
import type { Category } from '../../services/categoryService';

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAdminCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await categoryService.getAdminCategories();
        if (isMounted) {
          setCategories(data);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          setCategories([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }

    setSaving(true);
    try {
      await categoryService.createCategory({
        name: name.trim(),
      });
      setName('');
      await loadCategories();
    } catch (error) {
      console.error(error);
      toast.error('Tạo danh mục không thành công.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category: Category) => {
    setEditingCategoryId(category.categoryId);
    setEditName(category.name);
  };

  const cancelEdit = () => {
    setEditingCategoryId(null);
    setEditName('');
  };

  const handleSaveEdit = async (category: Category) => {
    if (!editName.trim()) {
      return;
    }

    try {
      await categoryService.updateCategory(category.categoryId, {
        name: editName.trim(),
        isActive: category.isActive,
      });
      await loadCategories();
      cancelEdit();
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật danh mục không thành công.');
    }
  };

  const handleToggleVisibility = async (category: Category) => {
    const nextVisible = !category.isActive;
    const confirmed = await new Promise<boolean>((resolve) => {
      toast(
        (t) => (
          <div className="flex flex-col gap-3">
            <span>
              {nextVisible
                ? `Hiện danh mục "${category.name}" trở lại?`
                : `Ẩn danh mục "${category.name}" khỏi hệ thống?`}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(true);
                }}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
              >
                Xác nhận
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  resolve(false);
                }}
                className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-sm"
              >
                Hủy
              </button>
            </div>
          </div>
        ),
        { duration: Infinity }
      );
    });

    if (!confirmed) {
      return;
    }

    try {
      await categoryService.updateCategory(category.categoryId, {
        name: category.name,
        isActive: nextVisible,
      });
      await loadCategories();
      toast.success(nextVisible ? 'Đã hiện danh mục.' : 'Đã ẩn danh mục.');
    } catch (error) {
      console.error(error);
      toast.error('Cập nhật danh mục không thành công.');
    }
  };

  return (
    <div className="flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Quản lý danh mục sự kiện</h1>
        </div>

        <form
          onSubmit={handleCreate}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên danh mục
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ví dụ: Tech, AI, AWS..."
            />
          </div>

          <AppButton variant="primary" type="submit" disabled={saving}>
            {saving ? 'Đang tạo...' : 'Tạo danh mục'}
          </AppButton>
        </form>

        {loading ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-600">
            Đang tải danh mục...
          </div>
        ) : !categories.length ? (
          <div className="bg-white rounded-lg shadow p-6 text-gray-600">
            Chưa có danh mục nào. Tạo danh mục phía trên.
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.categoryId}>
                    <td className="px-6 py-4 font-medium">
                      {editingCategoryId === category.categoryId ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      ) : (
                        category.name
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {category.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {editingCategoryId === category.categoryId ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(category)}
                            className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Lưu
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 text-sm rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                          >
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => startEdit(category)}
                            className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleToggleVisibility(category)}
                            className="px-3 py-1 text-sm rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            {category.isActive ? 'Ẩn' : 'Hiện'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

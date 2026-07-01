import React, { useEffect, useState } from 'react';
import { AppButton } from '../../components/common/AppButton';
import categoryService from '../../services/categoryService';
import type { Category } from '../../services/categoryService';

export const CategoryManagementPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

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
    loadCategories();
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
      alert('Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoryService.updateCategory(category.categoryId, {
        name: category.name,
        isActive: !category.isActive,
      });
      await loadCategories();
    } catch (error) {
      console.error(error);
      alert('Failed to update category.');
    }
  };

  const handleDeactivate = async (category: Category) => {
    const confirmed = window.confirm(`Deactivate category "${category.name}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await categoryService.deactivateCategory(category.categoryId);
      await loadCategories();
    } catch (error) {
      console.error(error);
      alert('Failed to deactivate category.');
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Event Categories</h1>
      </div>

      <form
        onSubmit={handleCreate}
        className="bg-white rounded-lg shadow p-6 mb-8"
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Tech, AI, AWS..."
          />
        </div>

        <AppButton variant="primary" type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create Category'}
        </AppButton>
      </form>

      {loading ? (
        <div>Loading categories...</div>
      ) : !categories.length ? (
        <div className="bg-white rounded-lg shadow p-6 text-gray-600">
          No categories yet. Create one above.
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.categoryId}>
                  <td className="px-6 py-4 font-medium">{category.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleToggleActive(category)}
                      className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                    >
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDeactivate(category)}
                      className="px-3 py-1 text-sm rounded bg-red-100 text-red-700 hover:bg-red-200"
                    >
                      Soft Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

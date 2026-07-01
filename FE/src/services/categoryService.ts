import axiosInstance from './axiosInstance';

export interface Category {
  categoryId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface CategoryCreateRequest {
  name: string;
}

export interface CategoryUpdateRequest {
  name: string;
  isActive: boolean;
}

interface BackendCategory {
  CategoryId?: string;
  Name?: string;
  IsActive?: boolean;
  CreatedAt?: string;
}

class CategoryService {
  private normalizeCategory(raw: BackendCategory & Partial<Category>): Category {
    return {
      categoryId: raw.categoryId ?? raw.CategoryId ?? '',
      name: raw.name ?? raw.Name ?? '',
      isActive: raw.isActive ?? raw.IsActive ?? true,
      createdAt: raw.createdAt ?? raw.CreatedAt ?? '',
    };
  }

  private normalizeCategories(raw: unknown): Category[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.map((item) => this.normalizeCategory(item));
  }

  async getPublicCategories(): Promise<Category[]> {
    const response = await axiosInstance.get('/categories');
    return this.normalizeCategories(response.data);
  }

  async getAdminCategories(): Promise<Category[]> {
    const response = await axiosInstance.get('/admin/categories');
    return this.normalizeCategories(response.data);
  }

  async createCategory(data: CategoryCreateRequest): Promise<Category> {
    const response = await axiosInstance.post('/admin/categories', data);
    return this.normalizeCategory(response.data);
  }

  async updateCategory(
    categoryId: string,
    data: CategoryUpdateRequest
  ): Promise<Category> {
    const response = await axiosInstance.put(
      `/admin/categories/${categoryId}`,
      data
    );
    return this.normalizeCategory(response.data);
  }

  async deactivateCategory(categoryId: string): Promise<void> {
    await axiosInstance.delete(`/admin/categories/${categoryId}`);
  }
}

export default new CategoryService();

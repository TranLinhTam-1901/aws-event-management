using EventManagement.Shared.DTOs.Categories;
using EventManagement.Shared.Repositories;

namespace EventManagement.Shared.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _repository;

    public CategoryService(ICategoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<CategoryResponseDto>> GetPublicCategoriesAsync()
    {
        var categories = await _repository.GetAllAsync();

        return categories
            .Where(c => c.IsActive)
            .ToList();
    }

    public async Task<List<CategoryResponseDto>> GetAdminCategoriesAsync()
    {
        return await _repository.GetAllAsync();
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(string categoryId)
    {
        return await _repository.GetByIdAsync(categoryId);
    }

    public async Task<CategoryResponseDto> CreateCategoryAsync(
        CategoryCreateRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new Exception("Category name is required.");
        }

        var category = new CategoryResponseDto
        {
            CategoryId = Guid.NewGuid().ToString(),
            Name = request.Name.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow.ToString("O")
        };

        await _repository.CreateAsync(category);

        return category;
    }

    public async Task<CategoryResponseDto> UpdateCategoryAsync(
        string categoryId,
        CategoryUpdateRequestDto request)
    {
        var existing = await _repository.GetByIdAsync(categoryId);

        if (existing == null)
        {
            throw new Exception("Category not found.");
        }

        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new Exception("Category name is required.");
        }

        existing.Name = request.Name.Trim();
        existing.IsActive = request.IsActive;

        await _repository.UpdateAsync(existing);

        return existing;
    }

    public async Task DeactivateCategoryAsync(string categoryId)
    {
        var existing = await _repository.GetByIdAsync(categoryId);

        if (existing == null)
        {
            throw new Exception("Category not found.");
        }

        existing.IsActive = false;
        await _repository.UpdateAsync(existing);
    }

    public async Task<(string CategoryId, string CategoryName)> ResolveCategoryAsync(
        string categoryId,
        string fallbackName)
    {
        if (!string.IsNullOrWhiteSpace(categoryId))
        {
            var category = await _repository.GetByIdAsync(categoryId);

            if (category == null || !category.IsActive)
            {
                throw new Exception("Selected category is invalid or inactive.");
            }

            return (category.CategoryId, category.Name);
        }

        if (!string.IsNullOrWhiteSpace(fallbackName))
        {
            return (string.Empty, fallbackName.Trim());
        }

        throw new Exception("Category is required.");
    }
}

using EventManagement.Shared.DTOs.Categories;

namespace EventManagement.Shared.Services;

public interface ICategoryService
{
    Task<List<CategoryResponseDto>> GetPublicCategoriesAsync();

    Task<List<CategoryResponseDto>> GetAdminCategoriesAsync();

    Task<CategoryResponseDto?> GetByIdAsync(string categoryId);

    Task<CategoryResponseDto> CreateCategoryAsync(CategoryCreateRequestDto request);

    Task<CategoryResponseDto> UpdateCategoryAsync(
        string categoryId,
        CategoryUpdateRequestDto request);

    Task DeactivateCategoryAsync(string categoryId);

    Task<(string CategoryId, string CategoryName)> ResolveCategoryAsync(
        string categoryId,
        string fallbackName);
}

using EventManagement.Shared.DTOs.Categories;

namespace EventManagement.Shared.Repositories;

public interface ICategoryRepository
{
    Task<List<CategoryResponseDto>> GetAllAsync();

    Task<CategoryResponseDto?> GetByIdAsync(string categoryId);

    Task CreateAsync(CategoryResponseDto category);

    Task UpdateAsync(CategoryResponseDto category);
}

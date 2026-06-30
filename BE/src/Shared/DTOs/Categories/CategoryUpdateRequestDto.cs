namespace EventManagement.Shared.DTOs.Categories;

public class CategoryUpdateRequestDto
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}

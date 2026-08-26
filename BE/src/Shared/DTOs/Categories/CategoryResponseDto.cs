namespace EventManagement.Shared.DTOs.Categories;

public class CategoryResponseDto
{
    public string CategoryId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public string CreatedAt { get; set; } = string.Empty;
}

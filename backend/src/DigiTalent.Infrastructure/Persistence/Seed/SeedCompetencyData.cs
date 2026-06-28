using DigiTalent.Domain.Entities.Competency;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

public static class SeedCompetencyData
{
    // Categories
    public static readonly Guid CatAILiteracyId = Guid.Parse("40000000-0000-0000-0000-000000000001");
    public static readonly Guid CatDataLiteracyId = Guid.Parse("40000000-0000-0000-0000-000000000002");
    public static readonly Guid CatCybersecurityId = Guid.Parse("40000000-0000-0000-0000-000000000003");
    public static readonly Guid CatDigitalCollabId = Guid.Parse("40000000-0000-0000-0000-000000000004");

    // Competencies
    public static readonly Guid CompAiBasicsId = Guid.Parse("40000000-0000-0000-0000-000000000010");
    public static readonly Guid CompPromptEngId = Guid.Parse("40000000-0000-0000-0000-000000000011");
    public static readonly Guid CompDataAnalysisId = Guid.Parse("40000000-0000-0000-0000-000000000012");
    public static readonly Guid CompDataVisId = Guid.Parse("40000000-0000-0000-0000-000000000013");
    public static readonly Guid CompSecAwarenessId = Guid.Parse("40000000-0000-0000-0000-000000000014");
    public static readonly Guid CompDataPrivacyId = Guid.Parse("40000000-0000-0000-0000-000000000015");
    public static readonly Guid CompDigiToolsId = Guid.Parse("40000000-0000-0000-0000-000000000016");
    public static readonly Guid CompRemoteCollabId = Guid.Parse("40000000-0000-0000-0000-000000000017");

    // Levels
    public static readonly Guid Level1Id = Guid.Parse("40000000-0000-0000-0000-000000000020");
    public static readonly Guid Level2Id = Guid.Parse("40000000-0000-0000-0000-000000000021");
    public static readonly Guid Level3Id = Guid.Parse("40000000-0000-0000-0000-000000000022");
    public static readonly Guid Level4Id = Guid.Parse("40000000-0000-0000-0000-000000000023");
    public static readonly Guid Level5Id = Guid.Parse("40000000-0000-0000-0000-000000000024");

    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.CompetencyLevels.AnyAsync()) return;

        var orgId = SeedOrganizationData.OrgDevsourceId;

        // Categories
        var categories = new List<CompetencyCategory>
        {
            new() { Id = CatAILiteracyId, OrganizationId = orgId, Code = "AI_LITERACY", Name = "AI Literacy", Description = "Understanding and applying artificial intelligence concepts", SortOrder = 1, Status = "ACTIVE" },
            new() { Id = CatDataLiteracyId, OrganizationId = orgId, Code = "DATA_LITERACY", Name = "Data Literacy", Description = "Ability to read, understand and use data", SortOrder = 2, Status = "ACTIVE" },
            new() { Id = CatCybersecurityId, OrganizationId = orgId, Code = "CYBERSECURITY", Name = "Cybersecurity", Description = "Understanding security threats and safe practices", SortOrder = 3, Status = "ACTIVE" },
            new() { Id = CatDigitalCollabId, OrganizationId = orgId, Code = "DIGITAL_COLLABORATION", Name = "Digital Collaboration", Description = "Using digital tools for teamwork and communication", SortOrder = 4, Status = "ACTIVE" },
        };
        context.CompetencyCategories.AddRange(categories);

        // Competencies
        var competencies = new List<Competency>
        {
            new() { Id = CompAiBasicsId, CategoryId = CatAILiteracyId, Code = "AI_BASICS", Name = "AI Basics", Description = "Basic understanding of AI concepts and applications", Status = "ACTIVE" },
            new() { Id = CompPromptEngId, CategoryId = CatAILiteracyId, Code = "PROMPT_ENGINEERING", Name = "Prompt Engineering", Description = "Crafting effective prompts for AI systems", Status = "ACTIVE" },
            new() { Id = CompDataAnalysisId, CategoryId = CatDataLiteracyId, Code = "DATA_ANALYSIS", Name = "Data Analysis", Description = "Ability to analyze and interpret data", Status = "ACTIVE" },
            new() { Id = CompDataVisId, CategoryId = CatDataLiteracyId, Code = "DATA_VISUALIZATION", Name = "Data Visualization", Description = "Creating meaningful data visualizations", Status = "ACTIVE" },
            new() { Id = CompSecAwarenessId, CategoryId = CatCybersecurityId, Code = "SECURITY_AWARENESS", Name = "Security Awareness", Description = "Awareness of security threats and best practices", Status = "ACTIVE" },
            new() { Id = CompDataPrivacyId, CategoryId = CatCybersecurityId, Code = "DATA_PRIVACY", Name = "Data Privacy", Description = "Understanding data protection and privacy regulations", Status = "ACTIVE" },
            new() { Id = CompDigiToolsId, CategoryId = CatDigitalCollabId, Code = "DIGITAL_TOOLS", Name = "Digital Tools Proficiency", Description = "Proficiency with digital productivity tools", Status = "ACTIVE" },
            new() { Id = CompRemoteCollabId, CategoryId = CatDigitalCollabId, Code = "REMOTE_COLLABORATION", Name = "Remote Collaboration", Description = "Effective collaboration in remote/virtual environments", Status = "ACTIVE" },
        };
        context.Competencies.AddRange(competencies);

        // Levels 1-5
        var levels = new List<CompetencyLevel>
        {
            new() { Id = Level1Id, OrganizationId = orgId, LevelValue = 1, Name = "Beginner", Description = "Basic awareness and limited practical ability", AchievementCriteria = "Can recall basic concepts and perform simple tasks with guidance", Status = "ACTIVE" },
            new() { Id = Level2Id, OrganizationId = orgId, LevelValue = 2, Name = "Basic", Description = "Working knowledge with assistance", AchievementCriteria = "Can perform routine tasks with minimal supervision", Status = "ACTIVE" },
            new() { Id = Level3Id, OrganizationId = orgId, LevelValue = 3, Name = "Intermediate", Description = "Independent and effective", AchievementCriteria = "Can work independently and solve common problems", Status = "ACTIVE" },
            new() { Id = Level4Id, OrganizationId = orgId, LevelValue = 4, Name = "Advanced", Description = "Deep understanding and coaching ability", AchievementCriteria = "Can guide others and handle complex situations", Status = "ACTIVE" },
            new() { Id = Level5Id, OrganizationId = orgId, LevelValue = 5, Name = "Expert", Description = "Thought leader and innovator", AchievementCriteria = "Can create new methods and strategic direction", Status = "ACTIVE" },
        };
        context.CompetencyLevels.AddRange(levels);

        await context.SaveChangesAsync();
    }
}

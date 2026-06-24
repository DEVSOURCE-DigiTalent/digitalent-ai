using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Infrastructure.Persistence.Seed;

public static class AppDbContextSeed
{
    public static async Task SeedAsync(AppDbContext context)
    {
        // Execute seeders in correct dependency order
        await SeedAuthData.SeedAsync(context);
        await SeedOrganizationData.SeedAsync(context);
        await SeedCompetencyData.SeedAsync(context);
        await SeedUserData.SeedAsync(context);

        // Optional: Add seed for scoring configs, demo data, etc.
    }
}

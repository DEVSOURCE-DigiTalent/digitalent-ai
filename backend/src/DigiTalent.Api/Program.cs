using DigiTalent.Api.Extensions;
using DigiTalent.Api.Middlewares;
using DigiTalent.Application;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;
using Npgsql;

var builder = WebApplication.CreateBuilder(args);

// Mặc định Development khi chạy cục bộ mà chưa đặt biến môi trường ASPNETCORE_ENVIRONMENT
if (string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT")) &&
    string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("DOTNET_ENVIRONMENT")))
{
    builder.Environment.EnvironmentName = Environments.Development;
}

// ──────────────────────────────────────────────
// 1. Đăng ký service
// ──────────────────────────────────────────────

builder.Services.AddApplication();                              // use case + validator (tự động)
builder.Services.AddInfrastructure(builder.Configuration);      // database, tạo token, mã hóa mật khẩu
builder.Services.AddJwtAuthentication(builder.Configuration);   // đọc + kiểm tra token FE gửi lên
builder.Services.AddEnterpriseTrial(builder.Configuration, builder.Environment);

builder.Services.AddControllers();
builder.Services.AddSwaggerWithJwt();
builder.Services.AddSignalR();
builder.Services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, DigiTalent.Api.Hubs.SubClaimUserIdProvider>(); // user id = claim "sub"
builder.Services.AddScoped<INotificationSender, DigiTalent.Api.Services.SignalRNotificationSender>();

// Cho phép frontend gọi API. Nhiều địa chỉ thì ngăn cách bằng dấu phẩy.
var allowedOrigins = (builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy => policy
        .WithOrigins(allowedOrigins)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

var app = builder.Build();

// ──────────────────────────────────────────────
// Khóa cấu hình production: Không cho phép khởi động nếu dùng secret/credential mặc định
// ──────────────────────────────────────────────
if (app.Environment.IsProduction())
{
    var signingKey = app.Configuration["Jwt:SigningKey"];
    if (string.IsNullOrWhiteSpace(signingKey) ||
        signingKey.Contains("ChangeThis", StringComparison.OrdinalIgnoreCase) ||
        signingKey.Contains("DevOnly", StringComparison.OrdinalIgnoreCase) ||
        signingKey.Length < 32)
    {
        throw new InvalidOperationException("FATAL: In Production, Jwt:SigningKey must be securely configured via environment variable and must not use development default values.");
    }

    var connectionString = app.Configuration.GetConnectionString("DefaultConnection");
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        throw new InvalidOperationException("FATAL: In Production, ConnectionStrings:DefaultConnection is required.");
    }

    var databasePassword = new NpgsqlConnectionStringBuilder(connectionString).Password;
    if (string.IsNullOrWhiteSpace(databasePassword) ||
        new[] { "changeme", "postgres", "password" }.Contains(databasePassword, StringComparer.OrdinalIgnoreCase))
    {
        throw new InvalidOperationException("FATAL: In Production, configure a non-default database password.");
    }
}

// Chạy CLI seed-demo / reset-seed-demo / reset-demo-passwords (tách riêng, không khởi động HTTP server)
var isSeedDemo = args.Any(a => a is "seed-demo" or "--seed-demo");
var isResetSeedDemo = args.Any(a => a is "reset-seed-demo" or "--reset-seed-demo");
var isResetDemoPasswords = args.Any(a => a is "reset-demo-passwords" or "--reset-demo-passwords");
if (isSeedDemo || isResetSeedDemo || isResetDemoPasswords)
{
    var mainOnly = args.Any(a => a is "--main-only");
    var csvArg = args.FirstOrDefault(a => a.StartsWith("--csv=", StringComparison.OrdinalIgnoreCase))?[6..];
    var csvPath = !string.IsNullOrWhiteSpace(csvArg) ? csvArg : ResolveDefaultDemoCsvPath();
    var trialOrgs = mainOnly ? 0 : 10;

    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
    await db.Database.MigrateAsync();

    if (isResetDemoPasswords)
    {
        var pwdResult = await DemoCaseStudySeeder.ResetDemoPasswordsAsync(db, hasher, csvPath, trialOrgs);
        Console.WriteLine($"[demo-seed] Đã đặt lại mật khẩu cho {pwdResult.UsersCreated} tài khoản demo ({pwdResult.OrganizationsSeeded} tổ chức), csv={pwdResult.CsvPath} ({pwdResult.ExportedAccounts.Count} dòng).");
        return;
    }

    var result = isResetSeedDemo
        ? await DemoCaseStudySeeder.ResetAndReseedAsync(db, hasher, csvPath, trialOrgs, Console.WriteLine)
        : await DemoCaseStudySeeder.SeedAsync(db, hasher, csvPath, trialOrgs);

    Console.WriteLine($"[demo-seed] Hoàn tất: organizationsSeeded={result.OrganizationsSeeded}, usersCreated={result.UsersCreated}, employeesCreated={result.EmployeesCreated}, csv={result.CsvPath} ({result.ExportedAccounts.Count} dòng).");
    return;
}

// Chạy migration & seed khi ở Development hoặc khi có cờ ApplyMigrations/--migrate (trừ khi cố ý tắt bằng ApplyMigrations=false)
var applyMigrations = !string.Equals(app.Configuration["ApplyMigrations"], "false", StringComparison.OrdinalIgnoreCase) &&
                      (app.Environment.IsDevelopment() ||
                       string.Equals(app.Configuration["ApplyMigrations"], "true", StringComparison.OrdinalIgnoreCase) ||
                       args.Contains("--migrate") ||
                       args.Contains("--migrate-only"));

if (applyMigrations)
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();
        if (app.Environment.IsDevelopment())
        {
            await DbSeeder.SeedAsync(
                db,
                scope.ServiceProvider.GetRequiredService<IPasswordHasher>(),
                app.Configuration["DevelopmentSeed:Password"]);
        }
        else
        {
            await DbSeeder.SeedReferenceDataAsync(db);
        }
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Chưa kết nối được cơ sở dữ liệu PostgreSQL cục bộ. Ứng dụng tiếp tục khởi động ở chế độ catalog/offline.");
    }
}

if (args.Contains("--migrate-only"))
{
    return;
}

// ──────────────────────────────────────────────
// 2. Pipeline xử lý request (thứ tự quan trọng)
// ──────────────────────────────────────────────

app.UseMiddleware<ExceptionHandlingMiddleware>(); // phải đứng đầu để bắt được mọi lỗi

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication(); // đọc token → biết ai đang gọi (dùng trong [HasPermission] và ICurrentUser)
app.UseAuthorization();
app.UseRateLimiter();

app.MapControllers();
app.MapHub<DigiTalent.Api.Hubs.NotificationHub>("/hubs/notifications");
app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

app.Run();

static string ResolveDefaultDemoCsvPath()
{
    var dir = new DirectoryInfo(Directory.GetCurrentDirectory());
    while (dir != null)
    {
        if (Directory.Exists(Path.Combine(dir.FullName, "backend")) &&
            File.Exists(Path.Combine(dir.FullName, ".gitignore")))
        {
            return Path.Combine(dir.FullName, "demo-accounts.csv");
        }
        dir = dir.Parent;
    }
    return Path.Combine(Directory.GetCurrentDirectory(), "demo-accounts.csv");
}

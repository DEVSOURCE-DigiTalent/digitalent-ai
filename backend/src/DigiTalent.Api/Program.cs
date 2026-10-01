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

// ──────────────────────────────────────────────
// 1. Đăng ký service
// ──────────────────────────────────────────────

builder.Services.AddApplication();                              // use case + validator (tự động)
builder.Services.AddInfrastructure(builder.Configuration);      // database, tạo token, mã hóa mật khẩu
builder.Services.AddJwtAuthentication(builder.Configuration);   // đọc + kiểm tra token FE gửi lên

builder.Services.AddControllers();
builder.Services.AddSwaggerWithJwt();
builder.Services.AddSignalR();
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

// Chạy migration & seed khi ở Development hoặc khi có cờ ApplyMigrations/--migrate
var applyMigrations = app.Environment.IsDevelopment() ||
                      string.Equals(app.Configuration["ApplyMigrations"], "true", StringComparison.OrdinalIgnoreCase) ||
                      args.Contains("--migrate") ||
                      args.Contains("--migrate-only");

if (applyMigrations)
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

app.MapControllers();
app.MapHub<DigiTalent.Api.Hubs.NotificationHub>("/hubs/notifications");
app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

app.Run();

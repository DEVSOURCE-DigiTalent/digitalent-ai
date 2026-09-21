using DigiTalent.Api.Extensions;
using DigiTalent.Api.Middlewares;
using DigiTalent.Application;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────
// 1. Đăng ký service
// ──────────────────────────────────────────────

builder.Services.AddApplication();                              // use case + validator (tự động)
builder.Services.AddInfrastructure(builder.Configuration);      // database, tạo token, mã hóa mật khẩu
builder.Services.AddJwtAuthentication(builder.Configuration);   // đọc + kiểm tra token FE gửi lên

builder.Services.AddControllers();
builder.Services.AddSwaggerWithJwt();

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
// 2. Pipeline xử lý request (thứ tự quan trọng)
// ──────────────────────────────────────────────

app.UseMiddleware<ExceptionHandlingMiddleware>(); // phải đứng đầu để bắt được mọi lỗi

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    // Môi trường dev: tự chạy migration + tạo tài khoản mẫu khi start
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
    await DbSeeder.SeedAsync(db, scope.ServiceProvider.GetRequiredService<IPasswordHasher>());
}

app.UseCors("Frontend");
app.UseAuthentication(); // đọc token → biết ai đang gọi (dùng trong [HasPermission] và ICurrentUser)

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "Healthy" }));

app.Run();

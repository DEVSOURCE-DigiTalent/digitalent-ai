using DigiTalent.Api.Authorization;
using DigiTalent.Api.Middlewares;
using DigiTalent.Application.Auth.Services;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Infrastructure.Auth;
using DigiTalent.Infrastructure.Persistence;
using DigiTalent.Infrastructure.Persistence.Seed;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────

builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();

// Swagger with JWT Bearer security scheme
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new() { Title = "DigiTalent AI API", Version = "v1" });

    options.AddSecurityDefinition("bearer", new Microsoft.OpenApi.OpenApiSecurityScheme
    {
        Type = Microsoft.OpenApi.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme.",
    });

    options.AddSecurityRequirement(document => new Microsoft.OpenApi.OpenApiSecurityRequirement
    {
        [new Microsoft.OpenApi.OpenApiSecuritySchemeReference("bearer", document)] = [],
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString, b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

// Register DbContext as IApplicationDbContext
builder.Services.AddScoped<IApplicationDbContext>(sp =>
    sp.GetRequiredService<AppDbContext>());

// JWT Authentication
var jwtSection = builder.Configuration.GetSection("Jwt");
var jwtSecret = jwtSection["SigningKey"] ?? "DefaultSecretKeyThatMustBeChangedInProduction-AtLeast64Characters!";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSection["Issuer"] ?? "DigiTalentAI",
        ValidAudience = jwtSection["Audience"] ?? "DigiTalentAI.Web",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ClockSkew = TimeSpan.Zero,
        NameClaimType = "user_id",
        RoleClaimType = System.Security.Claims.ClaimTypes.Role,
    };
});

// Authorization — register permission-based policies
builder.Services.AddAuthorization(options =>
{
    options.FallbackPolicy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
});

builder.Services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<ResourceScopeAuthorizationService>();

// Common Services
builder.Services.AddScoped<DigiTalent.Application.Common.Services.AuditLogService>();

// SignalR Hub Service
builder.Services.AddScoped<INotificationHubService, DigiTalent.Api.Hubs.NotificationHubService>();

// Application Services
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<DigiTalent.Application.Users.Services.UserService>();
builder.Services.AddScoped<DigiTalent.Application.Organization.Services.OrganizationService>();
builder.Services.AddScoped<DigiTalent.Application.Competency.Services.CompetencyService>();
builder.Services.AddScoped<DigiTalent.Application.Learning.Services.CourseService>();
builder.Services.AddScoped<DigiTalent.Application.Learning.Services.EnrollmentService>();

// Phase 6 — Assessment & Certificate
builder.Services.AddScoped<DigiTalent.Application.Assessment.Services.QuestionBankService>();
builder.Services.AddScoped<DigiTalent.Application.Assessment.Services.AssessmentService>();
builder.Services.AddScoped<DigiTalent.Application.Assessment.Services.AttemptService>();
builder.Services.AddScoped<DigiTalent.Application.Certificate.Services.CertificateService>();

// Phase 3 — Intelligence, Task, Dashboard, Notification
builder.Services.AddScoped<DigiTalent.Application.Intelligence.Services.IntelligenceService>();
builder.Services.AddScoped<DigiTalent.Application.Tasks.Services.TaskService>();
builder.Services.AddScoped<DigiTalent.Application.Dashboard.Services.DashboardService>();
builder.Services.AddScoped<DigiTalent.Application.Notifications.Services.NotificationService>();

// Phase 7 — File Storage, Audit Log Search, Scoring Config
builder.Services.AddScoped<DigiTalent.Application.FileStorage.Services.FileService>();
builder.Services.AddScoped<DigiTalent.Application.AuditLogs.Services.AuditLogSearchService>();
builder.Services.AddScoped<DigiTalent.Application.ScoringConfigs.Services.ScoringConfigService>();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var origins = builder.Configuration.GetValue<string>("AllowedOrigins")?.Split(',') ?? new[] { "http://localhost:5173" };
        policy.WithOrigins(origins).AllowAnyMethod().AllowAnyHeader().AllowCredentials();
    });
});

var app = builder.Build();

// ──────────────────────────────────────────────
// Middleware Pipeline
// ──────────────────────────────────────────────

// Exception handling (must be first)
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

// Health endpoints
app.MapGet("/health", () => Results.Ok(new { status = "Healthy", service = "DigiTalent AI API", timestamp = DateTimeOffset.UtcNow }));
app.MapGet("/health/ready", async (AppDbContext db) =>
{
    try { await db.Database.CanConnectAsync(); return Results.Ok(new { status = "Ready", database = "Connected" }); }
    catch { return Results.StatusCode(503); }
});

app.MapControllers();
app.MapHub<DigiTalent.Api.Hubs.NotificationHub>("/hubs/notifications");

// Auto-migrate and seed on development
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await db.Database.MigrateAsync();
        await AppDbContextSeed.SeedAsync(db);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Database migration/seeding failed, continuing anyway");
    }
}

app.Run();

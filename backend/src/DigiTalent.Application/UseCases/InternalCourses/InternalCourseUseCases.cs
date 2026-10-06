using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.InternalCourses;

// ── GET list ──
public class GetInternalCoursesUseCase : IUseCase<GetInternalCoursesInput, GetInternalCoursesOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetInternalCoursesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetInternalCoursesOutput> ExecuteAsync(GetInternalCoursesInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var query = _context.Courses.AsNoTracking()
            .Where(c => c.OrganizationId == orgId && c.SupersedesCourseId == null);

        if (!string.IsNullOrWhiteSpace(input.Status))
            query = query.Where(c => c.Status == input.Status.Trim().ToUpper());

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(c =>
                c.Title.ToLower().Contains(search) ||
                c.Code.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Clamp(input.PageSize, 1, 100);

        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new InternalCourseDto
            {
                Id = c.Id,
                Code = c.Code,
                Title = c.Title,
                Description = c.Description ?? string.Empty,
                Category = c.Purpose ?? string.Empty,
                ModulesCount = _context.CourseModules.Count(m => m.CourseId == c.Id),
                DurationMinutes = c.EstimatedDurationMinutes ?? 0,
                Status = c.Status,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
            })
            .ToListAsync();

        return new GetInternalCoursesOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}

// ── GET by ID ──
public class GetInternalCourseByIdUseCase : IUseCase<GetInternalCourseByIdInput, InternalCourseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetInternalCourseByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<InternalCourseDto> ExecuteAsync(GetInternalCourseByIdInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var course = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == input.Id && c.OrganizationId == orgId)
            .Select(c => new InternalCourseDto
            {
                Id = c.Id,
                Code = c.Code,
                Title = c.Title,
                Description = c.Description ?? string.Empty,
                Category = c.Purpose ?? string.Empty,
                ModulesCount = _context.CourseModules.Count(m => m.CourseId == c.Id),
                DurationMinutes = c.EstimatedDurationMinutes ?? 0,
                Status = c.Status,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
            })
            .FirstOrDefaultAsync()
            ?? throw new NotFoundException("Internal course not found.");

        return course;
    }
}

// ── Create ──
public class CreateInternalCourseUseCase : IUseCase<CreateInternalCourseInput, InternalCourseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateInternalCourseUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<InternalCourseDto> ExecuteAsync(CreateInternalCourseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId ?? throw new ForbiddenException("User not authenticated.");

        var code = input.Code?.Trim();
        if (string.IsNullOrWhiteSpace(code))
        {
            var count = await _context.Courses.AsNoTracking()
                .CountAsync(c => c.OrganizationId == orgId);
            code = $"INT-{count + 1:D3}";
        }

        var codeExists = await _context.Courses.AsNoTracking()
            .AnyAsync(c => c.OrganizationId == orgId && c.Code == code && c.VersionNo == 1);
        if (codeExists)
            throw new ConflictException("Course code already exists.");

        var course = new Course
        {
            OrganizationId = orgId,
            Code = code,
            VersionNo = 1,
            Title = input.Title.Trim(),
            Description = input.Description?.Trim(),
            Purpose = input.Category?.Trim(),
            EstimatedDurationMinutes = input.DurationMinutes,
            CertificateEnabled = false,
            Status = input.Status?.Trim().ToUpper() ?? "DRAFT",
            CreatedByUserId = userId,
        };

        _context.Courses.Add(course);
        await _context.SaveChangesAsync();

        return new InternalCourseDto
        {
            Id = course.Id,
            Code = course.Code,
            Title = course.Title,
            Description = course.Description ?? string.Empty,
            Category = course.Purpose ?? string.Empty,
            ModulesCount = 0,
            DurationMinutes = course.EstimatedDurationMinutes ?? 0,
            Status = course.Status,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
        };
    }
}

// ── Update ──
public class UpdateInternalCourseUseCase : IUseCase<UpdateInternalCourseInput, InternalCourseDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateInternalCourseUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<InternalCourseDto> ExecuteAsync(UpdateInternalCourseInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == input.Id && c.OrganizationId == orgId)
            ?? throw new NotFoundException("Internal course not found.");

        course.Title = input.Title.Trim();
        course.Description = input.Description?.Trim();
        course.Purpose = input.Category?.Trim();
        course.EstimatedDurationMinutes = input.DurationMinutes;

        if (!string.IsNullOrWhiteSpace(input.Status))
            course.Status = input.Status.Trim().ToUpper();

        await _context.SaveChangesAsync();

        var modulesCount = await _context.CourseModules.AsNoTracking()
            .CountAsync(m => m.CourseId == course.Id);

        return new InternalCourseDto
        {
            Id = course.Id,
            Code = course.Code,
            Title = course.Title,
            Description = course.Description ?? string.Empty,
            Category = course.Purpose ?? string.Empty,
            ModulesCount = modulesCount,
            DurationMinutes = course.EstimatedDurationMinutes ?? 0,
            Status = course.Status,
            CreatedAt = course.CreatedAt,
            UpdatedAt = course.UpdatedAt,
        };
    }
}

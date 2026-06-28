using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Learning.DTOs;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Learning.Services;

public class CourseService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public CourseService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ═══════════════════════════════════════
    // Courses
    // ═══════════════════════════════════════

    public async Task<PagedList<CourseResponse>> SearchCoursesAsync(PaginationRequest request)
    {
        var query = _context.Courses.AsQueryable();

        // Data scope filter per RBAC matrix (Section 6.6)
        var isEmployee = _currentUser.Roles.Contains("EMPLOYEE");
        var isTrainer = _currentUser.Roles.Contains("TRAINER");

        if (isEmployee)
        {
            // Employee: only see published/active courses
            query = query.Where(c => c.Status == "PUBLISHED" || c.Status == "ACTIVE");
        }
        else if (isTrainer && _currentUser.EmployeeId.HasValue)
        {
            // Trainer: see courses they own/created
            query = query.Where(c => c.OwnerTrainerId == _currentUser.EmployeeId.Value || c.Status == "PUBLISHED");
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(kw)
                                  || c.Code.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(c => new CourseResponse
            {
                Id = c.Id,
                Code = c.Code,
                Title = c.Title,
                Description = c.Description,
                DifficultyLevel = c.DifficultyLevel,
                EstimatedDurationMinutes = c.EstimatedDurationMinutes,
                Status = c.Status,
                ModuleCount = c.Modules.Count,
                EnrollmentCount = c.Enrollments.Count,
                CreatedAt = c.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<CourseResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<CourseDetailResponse> GetCourseAsync(Guid courseId)
    {
        var course = await _context.Courses
            .Include(c => c.Modules.OrderBy(m => m.SortOrder))
                .ThenInclude(m => m.Lessons.OrderBy(l => l.SortOrder))
            .Include(c => c.CourseCompetencies)
                .ThenInclude(cc => cc.Competency)
            .FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        return new CourseDetailResponse
        {
            Id = course.Id,
            Code = course.Code,
            Title = course.Title,
            Description = course.Description,
            DifficultyLevel = course.DifficultyLevel,
            EstimatedDurationMinutes = course.EstimatedDurationMinutes,
            OwnerTrainerId = course.OwnerTrainerId,
            PassingScore = course.PassingScore,
            Status = course.Status,
            ModuleCount = course.Modules.Count,
            EnrollmentCount = course.Enrollments.Count,
            CreatedAt = course.CreatedAt,
            Modules = course.Modules.Select(m => new ModuleResponse
            {
                Id = m.Id,
                CourseId = m.CourseId,
                Title = m.Title,
                Description = m.Description,
                SortOrder = m.SortOrder,
                Status = m.Status,
                LessonCount = m.Lessons.Count,
                CreatedAt = m.CreatedAt,
            }).ToList(),
            Competencies = course.CourseCompetencies.Select(cc => new CourseCompetencyResponse
            {
                CourseId = cc.CourseId,
                CompetencyId = cc.CompetencyId,
                CompetencyCode = cc.Competency.Code,
                CompetencyName = cc.Competency.Name,
                TargetLevelValue = cc.TargetLevelValue,
                CoverageWeight = cc.CoverageWeight,
                Notes = cc.Notes,
            }).ToList(),
        };
    }

    public async Task<CourseResponse> CreateCourseAsync(CreateCourseRequest request)
    {
        if (await _context.Courses.AnyAsync(c => c.Code == request.Code.ToUpper()))
            throw new InvalidOperationException("Course code already exists.");

        var orgId = await _context.Organizations.Select(o => o.Id).FirstAsync();

        var entity = new Domain.Entities.Learning.Course
        {
            OrganizationId = orgId,
            Code = request.Code.ToUpper(),
            Title = request.Title,
            Description = request.Description,
            DifficultyLevel = request.DifficultyLevel,
            EstimatedDurationMinutes = request.EstimatedDurationMinutes,
            OwnerTrainerId = request.OwnerTrainerId,
            PassingScore = request.PassingScore,
            Status = "DRAFT",
        };
        _context.Courses.Add(entity);
        await _context.SaveChangesAsync(default);

        return new CourseResponse
        {
            Id = entity.Id,
            Code = entity.Code,
            Title = entity.Title,
            Description = entity.Description,
            DifficultyLevel = entity.DifficultyLevel,
            EstimatedDurationMinutes = entity.EstimatedDurationMinutes,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<CourseResponse> UpdateCourseAsync(Guid courseId, UpdateCourseRequest request)
    {
        var course = await _context.Courses
            .FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        if (request.Title != null) course.Title = request.Title;
        if (request.Description != null) course.Description = request.Description;
        if (request.DifficultyLevel != null) course.DifficultyLevel = request.DifficultyLevel;
        if (request.EstimatedDurationMinutes.HasValue) course.EstimatedDurationMinutes = request.EstimatedDurationMinutes.Value;
        if (request.OwnerTrainerId.HasValue) course.OwnerTrainerId = request.OwnerTrainerId;
        if (request.PassingScore.HasValue) course.PassingScore = request.PassingScore;

        await _context.SaveChangesAsync(default);

        var moduleCount = await _context.CourseModules.CountAsync(m => m.CourseId == courseId);

        return new CourseResponse
        {
            Id = course.Id,
            Code = course.Code,
            Title = course.Title,
            Description = course.Description,
            DifficultyLevel = course.DifficultyLevel,
            EstimatedDurationMinutes = course.EstimatedDurationMinutes,
            Status = course.Status,
            ModuleCount = moduleCount,
            CreatedAt = course.CreatedAt,
        };
    }

    public async Task ChangeCourseStatusAsync(Guid courseId, string status)
    {
        var course = await _context.Courses.FindAsync(courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        course.Status = status;
        await _context.SaveChangesAsync(default);
    }

    public async Task<CourseResponse> PublishCourseAsync(Guid courseId, PublishCourseRequest request)
    {
        var course = await _context.Courses
            .Include(c => c.Modules)
            .FirstOrDefaultAsync(c => c.Id == courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        // Validate course can be published
        if (course.Status != "DRAFT" && course.Status != "ARCHIVED")
            throw new InvalidOperationException("Only DRAFT or ARCHIVED courses can be published.");

        if (course.Modules.Count == 0)
            throw new InvalidOperationException("Course must have at least one module before publishing.");

        course.Status = "PUBLISHED";
        await _context.SaveChangesAsync(default);

        var moduleCount = await _context.CourseModules.CountAsync(m => m.CourseId == courseId);

        return new CourseResponse
        {
            Id = course.Id,
            Code = course.Code,
            Title = course.Title,
            Description = course.Description,
            DifficultyLevel = course.DifficultyLevel,
            EstimatedDurationMinutes = course.EstimatedDurationMinutes,
            Status = course.Status,
            ModuleCount = moduleCount,
            CreatedAt = course.CreatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Modules
    // ═══════════════════════════════════════

    public async Task<List<ModuleResponse>> GetModulesAsync(Guid courseId)
    {
        var course = await _context.Courses.FindAsync(courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        return await _context.CourseModules
            .Include(m => m.Lessons)
            .Where(m => m.CourseId == courseId)
            .OrderBy(m => m.SortOrder)
            .Select(m => new ModuleResponse
            {
                Id = m.Id,
                CourseId = m.CourseId,
                Title = m.Title,
                Description = m.Description,
                SortOrder = m.SortOrder,
                Status = m.Status,
                LessonCount = m.Lessons.Count,
                CreatedAt = m.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<ModuleDetailResponse> GetModuleAsync(Guid courseId, Guid moduleId)
    {
        var module = await _context.CourseModules
            .Include(m => m.Lessons.OrderBy(l => l.SortOrder))
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId)
            ?? throw new KeyNotFoundException("Module not found.");

        return new ModuleDetailResponse
        {
            Id = module.Id,
            CourseId = module.CourseId,
            Title = module.Title,
            Description = module.Description,
            SortOrder = module.SortOrder,
            Status = module.Status,
            LessonCount = module.Lessons.Count,
            CreatedAt = module.CreatedAt,
            Lessons = module.Lessons.Select(l => new LessonResponse
            {
                Id = l.Id,
                ModuleId = l.ModuleId,
                Title = l.Title,
                ContentType = l.ContentType,
                EstimatedMinutes = l.EstimatedMinutes,
                SortOrder = l.SortOrder,
                IsRequired = l.IsRequired,
                Status = l.Status,
                CreatedAt = l.CreatedAt,
            }).ToList(),
        };
    }

    public async Task<ModuleResponse> CreateModuleAsync(Guid courseId, CreateModuleRequest request)
    {
        var course = await _context.Courses.FindAsync(courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        var entity = new Domain.Entities.Learning.CourseModule
        {
            CourseId = courseId,
            Title = request.Title,
            Description = request.Description,
            SortOrder = request.SortOrder,
            Status = "ACTIVE",
        };
        _context.CourseModules.Add(entity);
        await _context.SaveChangesAsync(default);

        return new ModuleResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            Title = entity.Title,
            Description = entity.Description,
            SortOrder = entity.SortOrder,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<ModuleResponse> UpdateModuleAsync(Guid courseId, Guid moduleId, UpdateModuleRequest request)
    {
        var module = await _context.CourseModules
            .Include(m => m.Lessons)
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId)
            ?? throw new KeyNotFoundException("Module not found.");

        if (request.Title != null) module.Title = request.Title;
        if (request.Description != null) module.Description = request.Description;
        if (request.SortOrder.HasValue) module.SortOrder = request.SortOrder.Value;

        await _context.SaveChangesAsync(default);

        return new ModuleResponse
        {
            Id = module.Id,
            CourseId = module.CourseId,
            Title = module.Title,
            Description = module.Description,
            SortOrder = module.SortOrder,
            Status = module.Status,
            LessonCount = module.Lessons.Count,
            CreatedAt = module.CreatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Lessons
    // ═══════════════════════════════════════

    public async Task<List<LessonResponse>> GetLessonsAsync(Guid courseId, Guid moduleId)
    {
        var module = await _context.CourseModules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId)
            ?? throw new KeyNotFoundException("Module not found.");

        return await _context.Lessons
            .Where(l => l.ModuleId == moduleId)
            .OrderBy(l => l.SortOrder)
            .Select(l => new LessonResponse
            {
                Id = l.Id,
                ModuleId = l.ModuleId,
                Title = l.Title,
                ContentType = l.ContentType,
                EstimatedMinutes = l.EstimatedMinutes,
                SortOrder = l.SortOrder,
                IsRequired = l.IsRequired,
                Status = l.Status,
                CreatedAt = l.CreatedAt,
            })
            .ToListAsync();
    }

    public async Task<LessonDetailResponse> GetLessonAsync(Guid courseId, Guid moduleId, Guid lessonId)
    {
        var lesson = await _context.Lessons
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ModuleId == moduleId)
            ?? throw new KeyNotFoundException("Lesson not found.");

        // Verify module belongs to course
        var module = await _context.CourseModules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId)
            ?? throw new KeyNotFoundException("Module not found.");

        return new LessonDetailResponse
        {
            Id = lesson.Id,
            ModuleId = lesson.ModuleId,
            Title = lesson.Title,
            ContentType = lesson.ContentType,
            ContentBody = lesson.ContentBody,
            EstimatedMinutes = lesson.EstimatedMinutes,
            SortOrder = lesson.SortOrder,
            IsRequired = lesson.IsRequired,
            Status = lesson.Status,
            CreatedAt = lesson.CreatedAt,
        };
    }

    public async Task<LessonResponse> CreateLessonAsync(Guid courseId, Guid moduleId, CreateLessonRequest request)
    {
        var module = await _context.CourseModules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId)
            ?? throw new KeyNotFoundException("Module not found.");

        var entity = new Domain.Entities.Learning.Lesson
        {
            ModuleId = moduleId,
            Title = request.Title,
            ContentType = request.ContentType,
            ContentBody = request.ContentBody,
            EstimatedMinutes = request.EstimatedMinutes,
            SortOrder = request.SortOrder,
            IsRequired = request.IsRequired,
            Status = "DRAFT",
        };
        _context.Lessons.Add(entity);
        await _context.SaveChangesAsync(default);

        return new LessonResponse
        {
            Id = entity.Id,
            ModuleId = entity.ModuleId,
            Title = entity.Title,
            ContentType = entity.ContentType,
            EstimatedMinutes = entity.EstimatedMinutes,
            SortOrder = entity.SortOrder,
            IsRequired = entity.IsRequired,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<LessonResponse> UpdateLessonAsync(Guid courseId, Guid moduleId, Guid lessonId, UpdateLessonRequest request)
    {
        var lesson = await _context.Lessons
            .FirstOrDefaultAsync(l => l.Id == lessonId && l.ModuleId == moduleId)
            ?? throw new KeyNotFoundException("Lesson not found.");

        // Verify module belongs to course
        var module = await _context.CourseModules
            .FirstOrDefaultAsync(m => m.Id == moduleId && m.CourseId == courseId)
            ?? throw new KeyNotFoundException("Module not found.");

        if (request.Title != null) lesson.Title = request.Title;
        if (request.ContentType != null) lesson.ContentType = request.ContentType;
        if (request.ContentBody != null) lesson.ContentBody = request.ContentBody;
        if (request.EstimatedMinutes.HasValue) lesson.EstimatedMinutes = request.EstimatedMinutes.Value;
        if (request.SortOrder.HasValue) lesson.SortOrder = request.SortOrder.Value;
        if (request.IsRequired.HasValue) lesson.IsRequired = request.IsRequired.Value;
        if (request.Status != null) lesson.Status = request.Status;

        await _context.SaveChangesAsync(default);

        return new LessonResponse
        {
            Id = lesson.Id,
            ModuleId = lesson.ModuleId,
            Title = lesson.Title,
            ContentType = lesson.ContentType,
            EstimatedMinutes = lesson.EstimatedMinutes,
            SortOrder = lesson.SortOrder,
            IsRequired = lesson.IsRequired,
            Status = lesson.Status,
            CreatedAt = lesson.CreatedAt,
        };
    }

    // ═══════════════════════════════════════
    // Learning Materials
    // ═══════════════════════════════════════

    public async Task<MaterialResponse> CreateMaterialAsync(Guid courseId, CreateMaterialRequest request)
    {
        var course = await _context.Courses.FindAsync(courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        var entity = new Domain.Entities.Learning.LearningMaterial
        {
            CourseId = courseId,
            LessonId = request.LessonId,
            FileObjectId = request.FileObjectId,
            MaterialType = request.MaterialType,
            ExternalUrl = request.ExternalUrl,
            Title = request.Title,
            SortOrder = request.SortOrder,
        };
        _context.LearningMaterials.Add(entity);
        await _context.SaveChangesAsync(default);

        return new MaterialResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            LessonId = entity.LessonId,
            FileObjectId = entity.FileObjectId,
            MaterialType = entity.MaterialType,
            ExternalUrl = entity.ExternalUrl,
            Title = entity.Title,
            SortOrder = entity.SortOrder,
            CreatedAt = entity.CreatedAt,
        };
    }

    /// <summary>
    /// Get lesson entity with its module and course info.
    /// </summary>
    public async Task<Domain.Entities.Learning.Lesson> GetLessonEntityAsync(Guid lessonId)
    {
        return await _context.Lessons
            .Include(l => l.Module)
            .FirstOrDefaultAsync(l => l.Id == lessonId)
            ?? throw new KeyNotFoundException("Lesson not found.");
    }

    /// <summary>
    /// Get module entity with course info.
    /// </summary>
    public async Task<Domain.Entities.Learning.CourseModule> GetModuleEntityAsync(Guid moduleId)
    {
        return await _context.CourseModules
            .FirstOrDefaultAsync(m => m.Id == moduleId)
            ?? throw new KeyNotFoundException("Module not found.");
    }

    // ═══════════════════════════════════════
    // Course Competencies
    // ═══════════════════════════════════════

    public async Task<List<CourseCompetencyResponse>> GetCourseCompetenciesAsync(Guid courseId)
    {
        var course = await _context.Courses.FindAsync(courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        return await _context.CourseCompetencies
            .Include(cc => cc.Competency)
            .Where(cc => cc.CourseId == courseId)
            .OrderBy(cc => cc.Competency.Code)
            .Select(cc => new CourseCompetencyResponse
            {
                CourseId = cc.CourseId,
                CompetencyId = cc.CompetencyId,
                CompetencyCode = cc.Competency.Code,
                CompetencyName = cc.Competency.Name,
                TargetLevelValue = cc.TargetLevelValue,
                CoverageWeight = cc.CoverageWeight,
                Notes = cc.Notes,
            })
            .ToListAsync();
    }

    public async Task<List<CourseCompetencyResponse>> SaveCourseCompetenciesAsync(
        Guid courseId, SaveCourseCompetenciesRequest request)
    {
        var course = await _context.Courses.FindAsync(courseId)
            ?? throw new KeyNotFoundException("Course not found.");

        // Remove existing competency mappings for this course
        var existing = await _context.CourseCompetencies
            .Where(cc => cc.CourseId == courseId)
            .ToListAsync();
        _context.CourseCompetencies.RemoveRange(existing);

        // Add new mappings
        foreach (var req in request.Competencies)
        {
            _context.CourseCompetencies.Add(
                new Domain.Entities.Learning.CourseCompetency
                {
                    CourseId = courseId,
                    CompetencyId = req.CompetencyId,
                    TargetLevelValue = req.TargetLevelValue,
                    CoverageWeight = req.CoverageWeight,
                    Notes = req.Notes,
                });
        }

        await _context.SaveChangesAsync(default);

        return await GetCourseCompetenciesAsync(courseId);
    }
}

using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Learning.DTOs;
using DigiTalent.Shared.Pagination;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.Learning.Services;

public class EnrollmentService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public EnrollmentService(IApplicationDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    // ═══════════════════════════════════════
    // Course Assignments
    // ═══════════════════════════════════════

    public async Task<AssignmentResponse> CreateAssignmentAsync(CreateAssignmentRequest request)
    {
        var course = await _context.Courses.FindAsync(request.CourseId)
            ?? throw new KeyNotFoundException("Course not found.");

        if (!_currentUser.UserId.HasValue)
            throw new UnauthorizedAccessException("User not authenticated.");

        var entity = new Domain.Entities.Learning.CourseAssignment
        {
            CourseId = request.CourseId,
            AssignmentType = request.AssignmentType,
            TargetEmployeeId = request.TargetEmployeeId,
            TargetDepartmentId = request.TargetDepartmentId,
            TargetJobPositionId = request.TargetJobPositionId,
            AssignedByUserId = _currentUser.UserId.Value,
            DueDate = request.DueDate,
            Status = "ACTIVE",
        };
        _context.CourseAssignments.Add(entity);
        await _context.SaveChangesAsync(default);

        return new AssignmentResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            CourseTitle = course.Title,
            AssignmentType = entity.AssignmentType,
            TargetEmployeeId = entity.TargetEmployeeId,
            TargetDepartmentId = entity.TargetDepartmentId,
            TargetJobPositionId = entity.TargetJobPositionId,
            AssignedByUserId = entity.AssignedByUserId,
            DueDate = entity.DueDate,
            Status = entity.Status,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<PagedList<AssignmentResponse>> SearchAssignmentsAsync(PaginationRequest request)
    {
        var query = _context.CourseAssignments
            .Include(a => a.Course)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(a => a.Course.Title.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(a => new AssignmentResponse
            {
                Id = a.Id,
                CourseId = a.CourseId,
                CourseTitle = a.Course.Title,
                AssignmentType = a.AssignmentType,
                TargetEmployeeId = a.TargetEmployeeId,
                TargetDepartmentId = a.TargetDepartmentId,
                TargetJobPositionId = a.TargetJobPositionId,
                AssignedByUserId = a.AssignedByUserId,
                DueDate = a.DueDate,
                Status = a.Status,
                EnrollmentCount = a.Course.Enrollments.Count(e => e.CourseAssignmentId == a.Id),
                CreatedAt = a.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<AssignmentResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task CancelAssignmentAsync(Guid assignmentId)
    {
        var assignment = await _context.CourseAssignments.FindAsync(assignmentId)
            ?? throw new KeyNotFoundException("Course assignment not found.");

        assignment.Status = "CANCELLED";
        await _context.SaveChangesAsync(default);
    }

    // ═══════════════════════════════════════
    // Enrollments
    // ═══════════════════════════════════════

    public async Task<EnrollmentResponse> StartEnrollmentAsync(StartEnrollmentRequest request)
    {
        var course = await _context.Courses.FindAsync(request.CourseId)
            ?? throw new KeyNotFoundException("Course not found.");

        if (!_currentUser.EmployeeId.HasValue)
            throw new UnauthorizedAccessException("User is not associated with an employee profile.");

        var employeeId = _currentUser.EmployeeId.Value;

        // Check for duplicate enrollment
        var existing = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.CourseId == request.CourseId && e.EmployeeId == employeeId);
        if (existing != null)
            throw new InvalidOperationException("Already enrolled in this course.");

        var entity = new Domain.Entities.Learning.Enrollment
        {
            CourseId = request.CourseId,
            EmployeeId = employeeId,
            CourseAssignmentId = request.CourseAssignmentId,
            Status = "IN_PROGRESS",
            ProgressPercentage = 0,
            StartedAt = DateTimeOffset.UtcNow,
            DueDate = request.CourseAssignmentId != null
                ? _context.CourseAssignments
                    .Where(a => a.Id == request.CourseAssignmentId)
                    .Select(a => a.DueDate)
                    .FirstOrDefault()
                : null,
        };
        _context.Enrollments.Add(entity);
        await _context.SaveChangesAsync(default);

        return new EnrollmentResponse
        {
            Id = entity.Id,
            CourseId = entity.CourseId,
            CourseTitle = course.Title,
            CourseCode = course.Code,
            EmployeeId = entity.EmployeeId,
            EmployeeName = _currentUser.FullName ?? string.Empty,
            Status = entity.Status,
            ProgressPercentage = entity.ProgressPercentage,
            StartedAt = entity.StartedAt,
            CompletedAt = entity.CompletedAt,
            DueDate = entity.DueDate,
            CreatedAt = entity.CreatedAt,
        };
    }

    public async Task<PagedList<EnrollmentResponse>> GetMyEnrollmentsAsync(PaginationRequest request)
    {
        if (!_currentUser.EmployeeId.HasValue)
            throw new UnauthorizedAccessException("User is not associated with an employee profile.");

        var employeeId = _currentUser.EmployeeId.Value;

        var query = _context.Enrollments
            .Include(e => e.Course)
            .Where(e => e.EmployeeId == employeeId)
            .AsQueryable();

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EnrollmentResponse
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course.Title,
                CourseCode = e.Course.Code,
                EmployeeId = e.EmployeeId,
                EmployeeName = string.Empty,
                Status = e.Status,
                ProgressPercentage = e.ProgressPercentage,
                StartedAt = e.StartedAt,
                CompletedAt = e.CompletedAt,
                DueDate = e.DueDate,
                CreatedAt = e.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<EnrollmentResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<PagedList<EnrollmentResponse>> SearchEnrollmentsAsync(PaginationRequest request)
    {
        var query = _context.Enrollments
            .Include(e => e.Course)
            .AsQueryable();

        // Data scope filter per RBAC
        if (_currentUser.Roles.Any(r => r == "DEPARTMENT_MANAGER") && _currentUser.ManagedDepartmentIds.Count != 0)
        {
            // Department manager: only enrollments of employees in managed departments
            var managedDeptIds = _currentUser.ManagedDepartmentIds;
            query = query.Where(e => _context.Employees
                .Where(emp => managedDeptIds.Contains(emp.DepartmentId))
                .Select(emp => emp.Id)
                .Contains(e.EmployeeId));
        }
        else if (_currentUser.Roles.Any(r => r == "TRAINER") && _currentUser.EmployeeId.HasValue)
        {
            // Trainer: enrollments for courses they own/created
            var trainerId = _currentUser.EmployeeId.Value;
            query = query.Where(e => e.Course.OwnerTrainerId == trainerId);
        }
        else if (_currentUser.Roles.Any(r => r == "EMPLOYEE") && _currentUser.EmployeeId.HasValue)
        {
            // Employee: own enrollments only
            var empId = _currentUser.EmployeeId.Value;
            query = query.Where(e => e.EmployeeId == empId);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var kw = request.Search.ToLower();
            query = query.Where(e => e.Course.Title.ToLower().Contains(kw)
                                  || e.Course.Code.ToLower().Contains(kw));
        }

        var totalItems = await query.CountAsync();
        var items = await query
            .OrderByDescending(e => e.CreatedAt)
            .Skip((request.PageIndex - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(e => new EnrollmentResponse
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseTitle = e.Course.Title,
                CourseCode = e.Course.Code,
                EmployeeId = e.EmployeeId,
                EmployeeName = string.Empty,
                Status = e.Status,
                ProgressPercentage = e.ProgressPercentage,
                StartedAt = e.StartedAt,
                CompletedAt = e.CompletedAt,
                DueDate = e.DueDate,
                CreatedAt = e.CreatedAt,
            })
            .ToListAsync();

        return new PagedList<EnrollmentResponse>
        {
            Items = items,
            PageIndex = request.PageIndex,
            PageSize = request.PageSize,
            TotalItems = totalItems,
        };
    }

    public async Task<EnrollmentDetailResponse> GetEnrollmentAsync(Guid enrollmentId)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId)
            ?? throw new KeyNotFoundException("Enrollment not found.");

        // Get lesson titles for progress display
        var lessonIds = enrollment.LessonProgresses.Select(lp => lp.LessonId).Distinct().ToList();
        var lessons = await _context.Lessons
            .Where(l => lessonIds.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id, l => l.Title);

        return new EnrollmentDetailResponse
        {
            Id = enrollment.Id,
            CourseId = enrollment.CourseId,
            CourseTitle = enrollment.Course.Title,
            CourseCode = enrollment.Course.Code,
            EmployeeId = enrollment.EmployeeId,
            EmployeeName = string.Empty,
            Status = enrollment.Status,
            ProgressPercentage = enrollment.ProgressPercentage,
            StartedAt = enrollment.StartedAt,
            CompletedAt = enrollment.CompletedAt,
            DueDate = enrollment.DueDate,
            CreatedAt = enrollment.CreatedAt,
            LessonProgresses = enrollment.LessonProgresses
                .OrderBy(lp => lp.CreatedAt)
                .Select(lp => new LessonProgressResponse
                {
                    Id = lp.Id,
                    EnrollmentId = lp.EnrollmentId,
                    LessonId = lp.LessonId,
                    LessonTitle = lessons.GetValueOrDefault(lp.LessonId, string.Empty),
                    Status = lp.Status,
                    ProgressPercent = lp.ProgressPercent,
                    LastAccessedAt = lp.LastAccessedAt,
                    CompletedAt = lp.CompletedAt,
                })
                .ToList(),
        };
    }

    // ═══════════════════════════════════════
    // Lesson Progress
    // ═══════════════════════════════════════

    public async Task<LessonProgressResponse> CompleteLessonAsync(
        Guid enrollmentId, Guid lessonId, UpdateLessonProgressRequest request)
    {
        var enrollment = await _context.Enrollments
            .Include(e => e.Course)
                .ThenInclude(c => c.Modules)
                .ThenInclude(m => m.Lessons)
            .Include(e => e.LessonProgresses)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId)
            ?? throw new KeyNotFoundException("Enrollment not found.");

        // Ensure the lesson belongs to this course
        var lesson = await _context.Lessons.FindAsync(lessonId)
            ?? throw new KeyNotFoundException("Lesson not found.");

        // Check lesson is part of this course's modules
        var lessonBelongsToCourse = enrollment.Course.Modules
            .Any(m => m.Id == lesson.ModuleId);
        if (!lessonBelongsToCourse)
            throw new InvalidOperationException("Lesson does not belong to the enrolled course.");

        // Find or create lesson progress
        var progress = enrollment.LessonProgresses
            .FirstOrDefault(lp => lp.LessonId == lessonId);

        if (progress == null)
        {
            progress = new Domain.Entities.Learning.LessonProgress
            {
                EnrollmentId = enrollmentId,
                LessonId = lessonId,
                Status = request.Status,
                ProgressPercent = request.ProgressPercent ?? 100,
                LastAccessedAt = DateTimeOffset.UtcNow,
                CompletedAt = request.Status == "COMPLETED" ? DateTimeOffset.UtcNow : null,
            };
            _context.LessonProgresses.Add(progress);
        }
        else
        {
            progress.Status = request.Status;
            if (request.ProgressPercent.HasValue)
                progress.ProgressPercent = request.ProgressPercent.Value;
            progress.LastAccessedAt = DateTimeOffset.UtcNow;
            if (request.Status == "COMPLETED" && progress.CompletedAt == null)
                progress.CompletedAt = DateTimeOffset.UtcNow;
        }

        // Auto-calculate course progress percentage
        var allLessons = enrollment.Course.Modules
            .SelectMany(m => m.Lessons)
            .Where(l => l.Status == "PUBLISHED" || l.Status == "ACTIVE")
            .ToList();

        // Gather the updated set of progress records
        var allProgress = await _context.LessonProgresses
            .Where(lp => lp.EnrollmentId == enrollmentId)
            .ToListAsync();

        // Include the new/updated progress record
        if (progress.Id == default)
            allProgress.Add(progress);
        else
        {
            var existingIdx = allProgress.FindIndex(lp => lp.Id == progress.Id);
            if (existingIdx >= 0)
                allProgress[existingIdx] = progress;
        }

        var requiredLessons = allLessons.Where(l => l.IsRequired).ToList();
        var totalLessons = requiredLessons.Count;
        var completedLessons = allProgress.Count(lp =>
            lp.Status == "COMPLETED" && requiredLessons.Any(l => l.Id == lp.LessonId));

        enrollment.ProgressPercentage = totalLessons > 0
            ? Math.Round((decimal)completedLessons / totalLessons * 100, 2)
            : 0;

        // Auto-complete enrollment if all required lessons are done
        if (enrollment.ProgressPercentage >= 100 && enrollment.Status != "COMPLETED")
        {
            enrollment.Status = "COMPLETED";
            enrollment.CompletedAt = DateTimeOffset.UtcNow;
        }
        else if (enrollment.Status == "ASSIGNED")
        {
            enrollment.Status = "IN_PROGRESS";
        }

        await _context.SaveChangesAsync(default);

        return new LessonProgressResponse
        {
            Id = progress.Id,
            EnrollmentId = progress.EnrollmentId,
            LessonId = progress.LessonId,
            LessonTitle = lesson.Title,
            Status = progress.Status,
            ProgressPercent = progress.ProgressPercent,
            LastAccessedAt = progress.LastAccessedAt,
            CompletedAt = progress.CompletedAt,
        };
    }
}

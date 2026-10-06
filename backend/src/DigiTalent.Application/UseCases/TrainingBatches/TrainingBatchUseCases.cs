using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrainingBatches;

// ── GET list ──
public class GetTrainingBatchesUseCase : IUseCase<GetTrainingBatchesInput, GetTrainingBatchesOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetTrainingBatchesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetTrainingBatchesOutput> ExecuteAsync(GetTrainingBatchesInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var query = _context.TrainingBatches.AsNoTracking()
            .Where(b => b.OrganizationId == orgId);

        if (!string.IsNullOrWhiteSpace(input.Status))
            query = query.Where(b => b.Status == input.Status.Trim().ToUpper());

        if (input.CourseId.HasValue)
            query = query.Where(b => b.CourseId == input.CourseId.Value);

        if (input.DepartmentId.HasValue)
            query = query.Where(b => b.DepartmentId == input.DepartmentId.Value);

        if (!string.IsNullOrWhiteSpace(input.Search))
        {
            var search = input.Search.Trim().ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(search) ||
                b.Code.ToLower().Contains(search));
        }

        var totalItems = await query.CountAsync();
        var pageIndex = Math.Max(1, input.PageIndex);
        var pageSize = Math.Max(1, input.PageSize);

        var batchEmployees = _context.TrainingBatchEmployees.AsNoTracking();
        var courses = _context.Courses.AsNoTracking();
        var departments = _context.Departments.AsNoTracking();

        var items = await query
            .OrderByDescending(b => b.CreatedAt)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(b => new TrainingBatchListItem
            {
                Id = b.Id,
                Code = b.Code,
                Title = b.Title,
                CourseName = courses.Where(c => c.Id == b.CourseId).Select(c => c.Title).FirstOrDefault(),
                DepartmentName = b.DepartmentId.HasValue
                    ? departments.Where(d => d.Id == b.DepartmentId.Value).Select(d => d.Name).FirstOrDefault()
                    : null,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                DueDate = b.DueDate,
                Status = b.Status,
                TotalEmployees = batchEmployees.Count(be => be.TrainingBatchId == b.Id),
                CompletedCount = batchEmployees.Count(be => be.TrainingBatchId == b.Id && be.Status == "COMPLETED"),
                CreatedAt = b.CreatedAt,
            })
            .ToListAsync();

        return new GetTrainingBatchesOutput
        {
            Items = items,
            TotalItems = totalItems,
            PageIndex = pageIndex,
            PageSize = pageSize,
        };
    }
}

// ── GET by id ──
public class GetTrainingBatchByIdUseCase : IUseCase<GetTrainingBatchByIdInput, TrainingBatchDetailDto>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetTrainingBatchByIdUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<TrainingBatchDetailDto> ExecuteAsync(GetTrainingBatchByIdInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var batch = await _context.TrainingBatches.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == orgId)
            ?? throw new NotFoundException("Training batch not found.");

        var course = await _context.Courses.AsNoTracking()
            .Where(c => c.Id == batch.CourseId)
            .Select(c => new { c.Title })
            .FirstOrDefaultAsync();

        var department = batch.DepartmentId.HasValue
            ? await _context.Departments.AsNoTracking()
                .Where(d => d.Id == batch.DepartmentId.Value)
                .Select(d => new { d.Name })
                .FirstOrDefaultAsync()
            : null;

        var jobPosition = batch.JobPositionId.HasValue
            ? await _context.JobPositions.AsNoTracking()
                .Where(j => j.Id == batch.JobPositionId.Value)
                .Select(j => new { j.Name })
                .FirstOrDefaultAsync()
            : null;

        var createdBy = await _context.Users.AsNoTracking()
            .Where(u => u.Id == batch.CreatedByUserId)
            .Select(u => u.DisplayName)
            .FirstOrDefaultAsync();

        var employees = await (
            from be in _context.TrainingBatchEmployees.AsNoTracking()
            join emp in _context.Employees.AsNoTracking() on be.EmployeeId equals emp.Id
            join dept in _context.Departments.AsNoTracking() on emp.DepartmentId equals dept.Id into deptJoin
            from dept in deptJoin.DefaultIfEmpty()
            join enr in _context.Enrollments.AsNoTracking() on be.CourseAssignmentId equals enr.CourseAssignmentId into enrJoin
            from enr in enrJoin.DefaultIfEmpty()
            where be.TrainingBatchId == input.Id
            select new BatchEmployeeDto
            {
                Id = be.Id,
                EmployeeId = be.EmployeeId,
                EmployeeName = emp.FullName,
                EmployeeCode = emp.EmployeeCode,
                DepartmentName = dept != null ? dept.Name : null,
                Status = be.Status,
                CourseAssignmentId = be.CourseAssignmentId,
                ProgressPercent = enr != null ? (int)enr.ProgressPercent : 0,
            }).ToListAsync();

        return new TrainingBatchDetailDto
        {
            Id = batch.Id,
            Code = batch.Code,
            Title = batch.Title,
            Description = batch.Description,
            CourseId = batch.CourseId,
            CourseName = course?.Title,
            DepartmentId = batch.DepartmentId,
            DepartmentName = department?.Name,
            JobPositionId = batch.JobPositionId,
            JobPositionName = jobPosition?.Name,
            StartDate = batch.StartDate,
            EndDate = batch.EndDate,
            DueDate = batch.DueDate,
            Status = batch.Status,
            CreatedByName = createdBy,
            CreatedAt = batch.CreatedAt,
            Employees = employees,
        };
    }
}

// ── Create ──
public class CreateTrainingBatchUseCase : IUseCase<CreateTrainingBatchInput, CreateTrainingBatchOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateTrainingBatchUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateTrainingBatchOutput> ExecuteAsync(CreateTrainingBatchInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();
        var userId = _currentUser.UserId ?? throw new ForbiddenException("User not authenticated.");

        var courseExists = await _context.Courses.AsNoTracking()
            .AnyAsync(c => c.Id == input.CourseId && c.OrganizationId == orgId);
        if (!courseExists)
            throw new BadRequestException("Course not found.");

        var codeExists = await _context.TrainingBatches.AsNoTracking()
            .AnyAsync(b => b.OrganizationId == orgId && b.Code == input.Code.Trim());
        if (codeExists)
            throw new ConflictException("Batch code already exists.");

        var batch = new TrainingBatch
        {
            OrganizationId = orgId,
            Code = input.Code.Trim(),
            Title = input.Title.Trim(),
            Description = input.Description?.Trim(),
            CourseId = input.CourseId,
            DepartmentId = input.DepartmentId,
            JobPositionId = input.JobPositionId,
            StartDate = input.StartDate,
            EndDate = input.EndDate,
            DueDate = input.DueDate,
            Status = "DRAFT",
            CreatedByUserId = userId,
        };

        _context.TrainingBatches.Add(batch);

        var addedCount = 0;
        foreach (var empId in input.EmployeeIds.Distinct())
        {
            var empExists = await _context.Employees.AsNoTracking()
                .AnyAsync(e => e.Id == empId && e.OrganizationId == orgId);
            if (!empExists) continue;

            _context.TrainingBatchEmployees.Add(new TrainingBatchEmployee
            {
                TrainingBatchId = batch.Id,
                EmployeeId = empId,
                Status = "ENROLLED",
            });
            addedCount++;
        }

        await _context.SaveChangesAsync();

        return new CreateTrainingBatchOutput
        {
            Id = batch.Id,
            EmployeesAdded = addedCount,
        };
    }
}

// ── Update ──
public class UpdateTrainingBatchUseCase : IUseCase<UpdateTrainingBatchInput, UpdateTrainingBatchOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateTrainingBatchUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateTrainingBatchOutput> ExecuteAsync(UpdateTrainingBatchInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var batch = await _context.TrainingBatches
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == orgId)
            ?? throw new NotFoundException("Training batch not found.");

        if (batch.Status is "COMPLETED" or "CANCELLED")
            throw new BadRequestException("Cannot update a completed or cancelled batch.");

        batch.Title = input.Title.Trim();
        batch.Description = input.Description?.Trim();
        batch.EndDate = input.EndDate;
        batch.DueDate = input.DueDate;

        await _context.SaveChangesAsync();
        return new UpdateTrainingBatchOutput { Success = true };
    }
}

// ── Cancel ──
public class CancelTrainingBatchUseCase : IUseCase<CancelTrainingBatchInput, CancelTrainingBatchOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CancelTrainingBatchUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CancelTrainingBatchOutput> ExecuteAsync(CancelTrainingBatchInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var batch = await _context.TrainingBatches
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == orgId)
            ?? throw new NotFoundException("Training batch not found.");

        if (batch.Status is "COMPLETED" or "CANCELLED")
            throw new BadRequestException("Batch is already completed or cancelled.");

        batch.Status = "CANCELLED";
        await _context.SaveChangesAsync();
        return new CancelTrainingBatchOutput { Success = true };
    }
}

// ── Complete ──
public class CompleteTrainingBatchUseCase : IUseCase<CompleteTrainingBatchInput, CompleteTrainingBatchOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CompleteTrainingBatchUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CompleteTrainingBatchOutput> ExecuteAsync(CompleteTrainingBatchInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var batch = await _context.TrainingBatches
            .FirstOrDefaultAsync(b => b.Id == input.Id && b.OrganizationId == orgId)
            ?? throw new NotFoundException("Training batch not found.");

        if (batch.Status != "ACTIVE")
            throw new BadRequestException("Only active batches can be completed.");

        batch.Status = "COMPLETED";
        await _context.SaveChangesAsync();
        return new CompleteTrainingBatchOutput { Success = true };
    }
}

// ── Add employees ──
public class AddBatchEmployeesUseCase : IUseCase<AddBatchEmployeesInput, AddBatchEmployeesOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public AddBatchEmployeesUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<AddBatchEmployeesOutput> ExecuteAsync(AddBatchEmployeesInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var batch = await _context.TrainingBatches.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == input.BatchId && b.OrganizationId == orgId)
            ?? throw new NotFoundException("Training batch not found.");

        if (batch.Status is "COMPLETED" or "CANCELLED")
            throw new BadRequestException("Cannot add employees to a completed or cancelled batch.");

        var existingEmpIds = (await _context.TrainingBatchEmployees.AsNoTracking()
            .Where(be => be.TrainingBatchId == input.BatchId)
            .Select(be => be.EmployeeId)
            .ToListAsync()).ToHashSet();

        var added = 0;
        foreach (var empId in input.EmployeeIds.Distinct())
        {
            if (existingEmpIds.Contains(empId)) continue;

            var empExists = await _context.Employees.AsNoTracking()
                .AnyAsync(e => e.Id == empId && e.OrganizationId == orgId);
            if (!empExists) continue;

            _context.TrainingBatchEmployees.Add(new TrainingBatchEmployee
            {
                TrainingBatchId = input.BatchId,
                EmployeeId = empId,
                Status = "ENROLLED",
            });
            added++;
        }

        if (added > 0)
            await _context.SaveChangesAsync();

        return new AddBatchEmployeesOutput { Added = added };
    }
}

// ── Remove employee ──
public class RemoveBatchEmployeeUseCase : IUseCase<RemoveBatchEmployeeInput, RemoveBatchEmployeeOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public RemoveBatchEmployeeUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<RemoveBatchEmployeeOutput> ExecuteAsync(RemoveBatchEmployeeInput input)
    {
        var orgId = _currentUser.GetRequiredOrganizationId();

        var batch = await _context.TrainingBatches.AsNoTracking()
            .FirstOrDefaultAsync(b => b.Id == input.BatchId && b.OrganizationId == orgId)
            ?? throw new NotFoundException("Training batch not found.");

        if (batch.Status is "COMPLETED" or "CANCELLED")
            throw new BadRequestException("Cannot remove employees from a completed or cancelled batch.");

        var entry = await _context.TrainingBatchEmployees
            .FirstOrDefaultAsync(be => be.TrainingBatchId == input.BatchId && be.EmployeeId == input.EmployeeId)
            ?? throw new NotFoundException("Employee not found in this batch.");

        _context.TrainingBatchEmployees.Remove(entry);
        await _context.SaveChangesAsync();

        return new RemoveBatchEmployeeOutput { Success = true };
    }
}

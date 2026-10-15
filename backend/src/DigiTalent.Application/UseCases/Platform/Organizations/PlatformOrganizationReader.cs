using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Platform.Common;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Platform.Organizations;

public static class PlatformOrganizationReader
{
    /// <summary>
    /// Every organization with its owner, people counts and seat totals (in-memory aggregation:
    /// the number of organizations is small).
    /// </summary>
    public static async Task<List<PlatformOrganizationItem>> ReadAllAsync(IApplicationDbContext context)
    {
        var organizations = await context.Organizations.AsNoTracking().ToListAsync();
        var departmentCounts = await context.Departments.AsNoTracking()
            .Where(d => d.Status != Statuses.MasterData.Archived)
            .GroupBy(d => d.OrganizationId)
            .Select(g => new { OrganizationId = g.Key, Count = g.Count() })
            .ToListAsync();
        var employeeCounts = await context.Employees.AsNoTracking()
            .Where(e => e.Status != Statuses.Employee.Archived)
            .GroupBy(e => e.OrganizationId)
            .Select(g => new { OrganizationId = g.Key, Count = g.Count() })
            .ToListAsync();
        var userRoles = await (
            from user in context.Users.AsNoTracking()
            join userRole in context.UserRoles on user.Id equals userRole.UserId into roles
            from userRole in roles.DefaultIfEmpty()
            join role in context.Roles on userRole.RoleId equals role.Id into roleRows
            from role in roleRows.DefaultIfEmpty()
            where user.OrganizationId != null
            select new { user.Id, user.OrganizationId, user.DisplayName, user.Email, user.CreatedAt, RoleCode = role == null ? null : role.Code })
            .ToListAsync();
        var seatTotals = await context.CourseSeatOrders.AsNoTracking()
            .GroupBy(o => new { o.OrganizationId, o.Kind })
            .Select(g => new { g.Key.OrganizationId, g.Key.Kind, Seats = g.Sum(o => o.Seats), Amount = g.Sum(o => o.TotalAmount) })
            .ToListAsync();
        var subscriptions = (await context.Subscriptions.AsNoTracking().ToListAsync())
            .GroupBy(s => s.OrganizationId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(s => s.CreatedAt).First());
        var usage = await ReadCourseUsageAsync(context, null);

        return organizations.Select(o =>
        {
            var members = userRoles.Where(u => u.OrganizationId == o.Id).ToList();
            var owner = members.Where(u => u.RoleCode == Roles.Owner).OrderBy(u => u.CreatedAt).FirstOrDefault();
            var purchased = seatTotals.Where(s => s.OrganizationId == o.Id && s.Kind == PlatformCatalog.SeatOrderKind.Purchase).ToList();
            var subscription = subscriptions.GetValueOrDefault(o.Id);
            var used = usage.Where(u => u.OrganizationId == o.Id).ToList();
            return new PlatformOrganizationItem
            {
                Id = o.Id,
                Code = o.Code,
                Name = o.Name,
                Status = o.Status,
                Stage = purchased.Sum(s => s.Seats) > 0 ? PlatformOrganizationStages.Paid : PlatformOrganizationStages.Trial,
                OwnerName = owner?.DisplayName,
                OwnerEmail = owner?.Email,
                DepartmentCount = departmentCounts.FirstOrDefault(d => d.OrganizationId == o.Id)?.Count ?? 0,
                EmployeeCount = employeeCounts.FirstOrDefault(e => e.OrganizationId == o.Id)?.Count ?? 0,
                ManagerCount = members.Where(u => u.RoleCode == Roles.Manager).Select(u => u.Id).Distinct().Count(),
                UserCount = members.Select(u => u.Id).Distinct().Count(),
                SeatsPurchased = purchased.Sum(s => s.Seats),
                SeatsGranted = seatTotals.Where(s => s.OrganizationId == o.Id && s.Kind == PlatformCatalog.SeatOrderKind.AdminGrant).Sum(s => s.Seats),
                Revenue = purchased.Sum(s => s.Amount),
                SetupCompleted = o.SetupCompletedAt != null,
                CreatedAt = o.CreatedAt,
                PlanCode = subscription?.PlanCode,
                PlanName = subscription?.PlanName,
                PlanStatus = subscription?.Status,
                PlanCycle = subscription?.Cycle,
                SeatLimit = subscription?.SeatLimit,
                PlanRenewsAt = subscription?.RenewsAt,
                CoursesInUseByLevel = Enumerable.Range(PlatformCatalog.MinLevel, PlatformCatalog.MaxLevel)
                    .Select(level => used.Where(u => u.Level == level).Select(u => u.CourseCode).Distinct().Count())
                    .ToArray(),
                ParticipantCount = used.Select(u => u.EmployeeId).Distinct().Count(),
            };
        }).ToList();
    }

    private sealed record CourseUsageRow(Guid OrganizationId, Guid EmployeeId, string CourseCode, string CourseTitle, int Level, string Status);

    /// <summary>
    /// Enrollments of employees in platform courses (matched by course code; cancelled ones and archived employees
    /// left out), for one organization or all of them.
    /// </summary>
    private static async Task<List<CourseUsageRow>> ReadCourseUsageAsync(IApplicationDbContext context, Guid? organizationId)
    {
        var rows = await (
                from enrollment in context.Enrollments.AsNoTracking()
                join employee in context.Employees on enrollment.EmployeeId equals employee.Id
                join course in context.Courses on enrollment.CourseId equals course.Id
                join platformCourse in context.PlatformCourses on course.Code equals platformCourse.Code
                where enrollment.Status != Statuses.Enrollment.Cancelled
                      && employee.Status != Statuses.Employee.Archived
                      && (organizationId == null || employee.OrganizationId == organizationId)
                select new { employee.OrganizationId, EmployeeId = employee.Id, platformCourse.Code, platformCourse.Title, platformCourse.Level, enrollment.Status })
            .ToListAsync();
        return rows.Select(r => new CourseUsageRow(r.OrganizationId, r.EmployeeId, r.Code, r.Title, r.Level, r.Status)).ToList();
    }

    public static async Task<PlatformOrganizationDetailOutput> ReadDetailAsync(IApplicationDbContext context, Guid organizationId)
    {
        var organization = (await ReadAllAsync(context)).FirstOrDefault(o => o.Id == organizationId)
            ?? throw new NotFoundException($"Organization '{organizationId}' not found.");

        var departments = await context.Departments.AsNoTracking()
            .Where(d => d.OrganizationId == organizationId && d.Status != Statuses.MasterData.Archived)
            .OrderBy(d => d.Name)
            .ToListAsync();
        var employees = await context.Employees.AsNoTracking()
            .Where(e => e.OrganizationId == organizationId && e.Status != Statuses.Employee.Archived)
            .ToListAsync();
        var positions = await context.JobPositions.AsNoTracking()
            .Where(p => p.OrganizationId == organizationId)
            .Select(p => new { p.Id, p.Name })
            .ToListAsync();
        var users = await (
            from user in context.Users.AsNoTracking()
            join userRole in context.UserRoles on user.Id equals userRole.UserId into roles
            from userRole in roles.DefaultIfEmpty()
            join role in context.Roles on userRole.RoleId equals role.Id into roleRows
            from role in roleRows.DefaultIfEmpty()
            where user.OrganizationId == organizationId
            select new { user.Id, user.DisplayName, user.Email, user.Status, RoleCode = role == null ? null : role.Code })
            .ToListAsync();

        var people = users.GroupBy(u => u.Id).Select(g =>
        {
            var user = g.First();
            var roleCodes = g.Select(u => u.RoleCode).Where(r => r != null).ToList();
            var employee = employees.FirstOrDefault(e => e.UserId == user.Id);
            return new PlatformOrganizationPersonItem
            {
                UserId = user.Id,
                FullName = employee?.FullName ?? user.DisplayName,
                Email = user.Email,
                Role = roleCodes.Contains(Roles.Owner) ? Roles.Owner
                    : roleCodes.Contains(Roles.Manager) ? Roles.Manager
                    : Roles.Employee,
                DepartmentName = employee == null ? null : departments.FirstOrDefault(d => d.Id == employee.DepartmentId)?.Name,
                PositionName = employee?.JobPositionId == null ? null : positions.FirstOrDefault(p => p.Id == employee.JobPositionId)?.Name,
                Status = user.Status,
            };
        })
        // Employee profiles that have no login account yet (invited later)
        .Concat(employees.Where(e => e.UserId == null).Select(e => new PlatformOrganizationPersonItem
        {
            FullName = e.FullName,
            Email = e.WorkEmail,
            Role = Roles.Employee,
            DepartmentName = departments.FirstOrDefault(d => d.Id == e.DepartmentId)?.Name,
            PositionName = e.JobPositionId == null ? null : positions.FirstOrDefault(p => p.Id == e.JobPositionId)?.Name,
            Status = e.Status,
        }))
        .OrderBy(p => p.Role == Roles.Owner ? 0 : p.Role == Roles.Manager ? 1 : 2)
        .ThenBy(p => p.FullName)
        .ToList();

        var seats = (await PlatformCatalogReader.ReadCoursesAsync(context, organizationId))
            .Where(c => c.SeatsPurchased > 0 || c.SeatsGranted > 0)
            .Select(c => new PlatformOrganizationSeatItem
            {
                CourseCode = c.Code,
                CourseTitle = c.Title,
                SeatsPurchased = c.SeatsPurchased,
                SeatsGranted = c.SeatsGranted,
            }).ToList();

        var orders = await PlatformCatalogReader.QueryOrders(context)
            .Where(o => o.OrganizationId == organizationId)
            .Take(50)
            .ToListAsync();

        var coursesInUse = (await ReadCourseUsageAsync(context, organizationId))
            .GroupBy(u => u.CourseCode)
            .Select(g => new PlatformOrganizationCourseUsageItem
            {
                CourseCode = g.Key,
                CourseTitle = g.First().CourseTitle,
                Level = g.First().Level,
                LevelName = PlatformCatalog.LevelName((short)g.First().Level),
                Participants = g.Select(u => u.EmployeeId).Distinct().Count(),
                Completed = g.Where(u => u.Status == Statuses.Enrollment.Completed).Select(u => u.EmployeeId).Distinct().Count(),
            })
            .OrderBy(c => c.Level).ThenBy(c => c.CourseCode)
            .ToList();

        return new PlatformOrganizationDetailOutput
        {
            Organization = organization,
            Departments = departments.Select(d => new PlatformOrganizationDepartmentItem
            {
                Id = d.Id,
                Name = d.Name,
                ManagerName = d.ManagerEmployeeId == null ? null : employees.FirstOrDefault(e => e.Id == d.ManagerEmployeeId)?.FullName,
                EmployeeCount = employees.Count(e => e.DepartmentId == d.Id),
            }).ToList(),
            People = people,
            Seats = seats,
            Orders = orders,
            CoursesInUse = coursesInUse,
        };
    }
}

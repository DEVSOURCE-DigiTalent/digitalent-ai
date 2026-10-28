using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Constants;
using DigiTalent.Domain.Constants.Authorization;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>POST /platform/mentors — tạo tài khoản mentor (nhân sự nền tảng, không thuộc tổ chức, role MENTOR).</summary>
public class CreateMentorUseCase : IUseCase<CreateMentorUseCaseInput, CreateMentorUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly IPasswordHasher _passwords;
    private readonly IAuditService _audit;
    private readonly TimeProvider _clock;

    public CreateMentorUseCase(IApplicationDbContext context, IPasswordHasher passwords, IAuditService audit, TimeProvider clock)
    {
        _context = context;
        _passwords = passwords;
        _audit = audit;
        _clock = clock;
    }

    public async Task<CreateMentorUseCaseOutput> ExecuteAsync(CreateMentorUseCaseInput input)
    {
        var email = input.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            throw new ConflictException("Email này đã có tài khoản.");
        }

        var roleId = await _context.Roles.Where(r => r.Code == Roles.Mentor).Select(r => (Guid?)r.Id).FirstOrDefaultAsync()
                     ?? throw new BadRequestException("Chưa có vai trò MENTOR trong hệ thống.", "email", "MENTOR_ROLE_MISSING");
        var now = _clock.GetUtcNow();
        var user = new User
        {
            Email = email,
            DisplayName = input.FullName.Trim(),
            PasswordHash = _passwords.Hash(input.Password),
            EmailVerifiedAt = now,
            Status = Statuses.User.Active,
        };
        user.UserRoles.Add(new UserRole { RoleId = roleId, AssignedAt = now });
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        await _audit.LogAsync("MENTOR_CREATED", "users", user.Id, newValues: new { email }, entityLabel: user.DisplayName);

        return new CreateMentorUseCaseOutput
        {
            Mentor = new MentorItem { UserId = user.Id, FullName = user.DisplayName, Email = email, Status = user.Status, CreatedAt = user.CreatedAt },
        };
    }
}

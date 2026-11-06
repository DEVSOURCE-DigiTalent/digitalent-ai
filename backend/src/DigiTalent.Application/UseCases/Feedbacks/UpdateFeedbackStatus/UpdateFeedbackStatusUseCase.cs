using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class UpdateFeedbackStatusInput
{
    public Guid Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? AdminNote { get; set; }
}

public class UpdateFeedbackStatusOutput
{
    public bool Success { get; set; }
}

public class UpdateFeedbackStatusUseCase : IUseCase<UpdateFeedbackStatusInput, UpdateFeedbackStatusOutput>
{
    private static readonly string[] ValidStatuses = { "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED" };

    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public UpdateFeedbackStatusUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<UpdateFeedbackStatusOutput> ExecuteAsync(UpdateFeedbackStatusInput input)
    {
        if (!ValidStatuses.Contains(input.Status))
            throw new BadRequestException("Invalid status.", "status", "INVALID_STATUS");

        var feedback = await _context.UserFeedbacks
            .FirstOrDefaultAsync(f => f.Id == input.Id)
            ?? throw new NotFoundException($"Feedback '{input.Id}' not found.");

        feedback.Status = input.Status;
        feedback.AdminNote = input.AdminNote;

        if (input.Status is "RESOLVED" or "CLOSED")
        {
            feedback.ResolvedByUserId = _currentUser.UserId!.Value;
            feedback.ResolvedAt = DateTimeOffset.UtcNow;
        }
        else
        {
            feedback.ResolvedByUserId = null;
            feedback.ResolvedAt = null;
        }

        await _context.SaveChangesAsync();

        return new UpdateFeedbackStatusOutput { Success = true };
    }
}

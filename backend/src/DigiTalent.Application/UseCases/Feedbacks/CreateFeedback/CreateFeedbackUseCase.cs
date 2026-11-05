using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;

namespace DigiTalent.Application.UseCases.Feedbacks;

public class CreateFeedbackUseCase : IUseCase<CreateFeedbackInput, CreateFeedbackOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateFeedbackUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateFeedbackOutput> ExecuteAsync(CreateFeedbackInput input)
    {
        var feedback = new UserFeedback
        {
            UserId = _currentUser.UserId!.Value,
            OrganizationId = _currentUser.OrganizationId,
            Type = input.Type,
            Title = input.Title.Trim(),
            Description = input.Description.Trim(),
            PageUrl = input.PageUrl,
            Rating = input.Rating,
            Screenshots = input.Screenshots,
            Status = "OPEN",
        };

        _context.UserFeedbacks.Add(feedback);
        await _context.SaveChangesAsync();

        return new CreateFeedbackOutput { Id = feedback.Id };
    }
}

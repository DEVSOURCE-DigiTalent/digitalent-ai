using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Assessment.QuestionTags;

public class GetQuestionTagsUseCase : IUseCase<GetQuestionTagsUseCaseInput, GetQuestionTagsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetQuestionTagsUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<GetQuestionTagsUseCaseOutput> ExecuteAsync(GetQuestionTagsUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();

        var items = await _context.QuestionTags
            .AsNoTracking()
            .Where(t => t.OrganizationId == organizationId)
            .OrderBy(t => t.Category).ThenBy(t => t.Name)
            .Select(t => new QuestionTagDto { Id = t.Id, Name = t.Name, Category = t.Category })
            .ToListAsync();

        return new GetQuestionTagsUseCaseOutput { Items = items };
    }
}

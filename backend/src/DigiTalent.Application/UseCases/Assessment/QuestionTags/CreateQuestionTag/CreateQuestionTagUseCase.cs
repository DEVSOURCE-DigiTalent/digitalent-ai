using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using Microsoft.EntityFrameworkCore;
using QuestionTagEntity = DigiTalent.Domain.Entities.QuestionTag;

namespace DigiTalent.Application.UseCases.Assessment.QuestionTags;

public class CreateQuestionTagUseCase : IUseCase<CreateQuestionTagUseCaseInput, CreateQuestionTagUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateQuestionTagUseCase(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<CreateQuestionTagUseCaseOutput> ExecuteAsync(CreateQuestionTagUseCaseInput input)
    {
        var organizationId = _currentUser.GetRequiredOrganizationId();
        var name = input.Name.Trim();

        var exists = await _context.QuestionTags
            .AnyAsync(t => t.OrganizationId == organizationId && t.Name.ToLower() == name.ToLower());
        if (exists)
        {
            throw new ConflictException($"Tag '{name}' already exists in your organization.");
        }

        var tag = new QuestionTagEntity
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Name = name,
            Category = input.Category.Trim().ToUpperInvariant()
        };

        _context.QuestionTags.Add(tag);
        await _context.SaveChangesAsync();

        return new CreateQuestionTagUseCaseOutput { Id = tag.Id, Name = tag.Name, Category = tag.Category };
    }
}

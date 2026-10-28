using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;

namespace DigiTalent.Application.UseCases.TrialProgram;

/// <summary>GET /mentor/trials — các doanh nghiệp dùng thử được phân công cho mentor đang đăng nhập.</summary>
public class GetMentorTrialsUseCase : IUseCase<GetMentorTrialsUseCaseInput, GetMentorTrialsUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly TrialProgramReader _reader;

    public GetMentorTrialsUseCase(IApplicationDbContext context, TrialProgramReader reader)
    {
        _context = context;
        _reader = reader;
    }

    public async Task<GetMentorTrialsUseCaseOutput> ExecuteAsync(GetMentorTrialsUseCaseInput input) =>
        new() { Items = await GetPlatformTrialsUseCase.LoadAsync(_context, _reader.UserId, null) };
}

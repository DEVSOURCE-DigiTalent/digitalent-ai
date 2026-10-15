using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.UseCases;
using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// POST /me/pulse/baseline — nộp bài đầu vào (§7.1). Phải trả lời đủ mọi câu được phục vụ. Mức đầu vào của một
/// lĩnh vực là mức cao nhất trả lời đúng liên tiếp từ L1; câu sai chặn các mức cao hơn. Ghi một lần, không làm lại.
/// </summary>
public class SubmitPulseBaselineUseCase : IUseCase<SubmitPulseBaselineUseCaseInput, SubmitPulseBaselineUseCaseOutput>
{
    private readonly IApplicationDbContext _context;
    private readonly PulseLearnerReader _learner;
    private readonly PulseBaselineReader _questions;

    public SubmitPulseBaselineUseCase(IApplicationDbContext context, PulseLearnerReader learner, PulseBaselineReader questions)
    {
        _context = context;
        _learner = learner;
        _questions = questions;
    }

    public async Task<SubmitPulseBaselineUseCaseOutput> ExecuteAsync(SubmitPulseBaselineUseCaseInput input)
    {
        var snapshot = await _learner.LoadAsync();
        if (snapshot.Assessed)
        {
            throw new ConflictException("Bạn đã hoàn thành bài kiểm tra đầu vào.");
        }

        if (!snapshot.HasPosition)
        {
            throw new BadRequestException("Bạn chưa được gán vị trí công việc nên chưa có mục tiêu để kiểm tra.", "position", PulseBlockReason.NoPosition);
        }

        var targetDomains = snapshot.Domains.Where(d => d.Target > 0).ToList();
        var questions = await _questions.LoadAsync(snapshot.Employee.OrganizationId, targetDomains.ToDictionary(d => d.CategoryId, d => d.Target));
        var served = questions.Values.SelectMany(q => q).ToDictionary(q => q.QuestionId);
        if (served.Count == 0)
        {
            throw new BadRequestException("Doanh nghiệp chưa có bộ câu hỏi đầu vào cho vị trí của bạn.", "answers", GetPulseBaselineUseCase.NoQuestions);
        }

        var answers = input.Answers.ToDictionary(a => a.QuestionId, a => a.OptionId);
        if (answers.Count != served.Count || served.Keys.Any(id => !answers.ContainsKey(id)))
        {
            throw new BadRequestException("Hãy trả lời đủ tất cả câu hỏi trước khi nộp bài.", "answers", "INCOMPLETE_ANSWERS");
        }

        var now = _learner.Now;
        var employeeId = snapshot.Employee.Id;
        var correct = new Dictionary<Guid, bool>();
        foreach (var (questionId, optionId) in answers)
        {
            var option = served[questionId].Options.FirstOrDefault(o => o.OptionId == optionId)
                ?? throw new BadRequestException("Phương án trả lời không thuộc câu hỏi.", "answers", "INVALID_OPTION");
            correct[questionId] = option.IsCorrect;
            _context.CapabilityBaselineAnswers.Add(new CapabilityBaselineAnswer
            {
                EmployeeId = employeeId,
                QuestionId = questionId,
                SelectedOptionId = optionId,
                IsCorrect = option.IsCorrect,
                AnsweredAt = now,
            });
        }

        var results = new List<PulseBaselineDomainDto>();
        foreach (var domain in targetDomains)
        {
            var byLevel = Enumerable.Range(1, domain.Target)
                .Select(level => questions[domain.CategoryId].FirstOrDefault(q => q.Level == level) is { } q && correct[q.QuestionId])
                .ToList();
            var baseline = PulseRules.ChainLevel(byLevel, domain.Target);
            _context.CapabilityBaselines.Add(new CapabilityBaseline
            {
                EmployeeId = employeeId,
                CompetencyCategoryId = domain.CategoryId,
                TargetLevel = (short)domain.Target,
                BaselineLevel = (short)baseline,
                AssessedAt = now,
            });
            results.Add(new PulseBaselineDomainDto
            {
                CategoryId = domain.CategoryId,
                Number = domain.Number,
                Name = domain.Name,
                Target = domain.Target,
                Baseline = baseline,
            });
        }

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            // uq_capability_baselines_employee_category: hai lần nộp cùng lúc
            throw new ConflictException("Bạn đã hoàn thành bài kiểm tra đầu vào.");
        }

        return new SubmitPulseBaselineUseCaseOutput { AssessedAt = now, Domains = results };
    }
}

using FluentValidation;

namespace DigiTalent.Application.UseCases.Assistant.Chat;

public class ChatWithAssistantUseCaseValidator : AbstractValidator<ChatWithAssistantUseCaseInput>
{
    public const int MaxMessages = 40;
    public const int MaxContentLength = 4000;

    public ChatWithAssistantUseCaseValidator()
    {
        RuleFor(x => x.Messages)
            .NotEmpty()
            .Must(m => m.Count <= MaxMessages).WithMessage($"At most {MaxMessages} messages per conversation.")
            .Must(m => m.Count > 0 && m[^1].Role == "user").WithMessage("The last message must come from the user.")
            .Must(Alternates).WithMessage("Messages must alternate between user and assistant, starting with user.");

        RuleForEach(x => x.Messages).ChildRules(message =>
        {
            message.RuleFor(m => m.Role).Must(r => r is "user" or "assistant");
            message.RuleFor(m => m.Content).NotEmpty().MaximumLength(MaxContentLength);
        });
    }

    private static bool Alternates(List<ChatWithAssistantMessage> messages) =>
        messages.Select((m, i) => m.Role == (i % 2 == 0 ? "user" : "assistant")).All(ok => ok);
}

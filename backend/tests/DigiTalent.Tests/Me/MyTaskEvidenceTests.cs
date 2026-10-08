using System.Text;
using DigiTalent.Application.Common.Exceptions;
using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.UseCases.Me;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Moq;
using Xunit;

namespace DigiTalent.Tests.Me;

/// <summary>EM-15 Chi tiết nhiệm vụ, EM-16 Nộp minh chứng kèm tệp, EM-17 tải lại tệp đã nộp — trên PostgreSQL thật.</summary>
[Collection("PostgresIntegration")]
public class MyTaskEvidenceTests
{
    /// <summary>Kho tệp giả: lưu nội dung theo đường dẫn, đường dẫn nằm trong thư mục use case truyền vào.</summary>
    private static Mock<IFileStorageService> FakeStorage()
    {
        var stored = new Dictionary<string, byte[]>();
        var storage = new Mock<IFileStorageService>();
        storage.Setup(f => f.UploadAsync(It.IsAny<Stream>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Stream content, string name, string _, string folder, CancellationToken _) =>
            {
                using var buffer = new MemoryStream();
                content.CopyTo(buffer);
                var path = $"{folder}/{Guid.NewGuid():N}{Path.GetExtension(name)}";
                stored[path] = buffer.ToArray();
                return path;
            });
        storage.Setup(f => f.DownloadAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((string path, CancellationToken _) => new MemoryStream(stored[path]));
        return storage;
    }

    private static UploadMyTaskAttachmentUseCaseInput Pdf(Guid assignmentId, string text = "evidence") => new()
    {
        AssignmentId = assignmentId,
        FileName = "bang-phan-quyen.pdf",
        ContentType = "application/pdf",
        SizeBytes = Encoding.UTF8.GetByteCount(text),
        Content = new MemoryStream(Encoding.UTF8.GetBytes(text)),
    };

    [Fact]
    [Trait("Category", "Integration")]
    public async Task TaskDetail_ShowsTargetsAndTheAttachmentRules()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var detail = await new GetMyTaskDetailUseCase(s.Me, s.Tasks).ExecuteAsync(new GetMyTaskDetailUseCaseInput { AssignmentId = world.MyTask.Id });

        detail.CanSubmit.Should().BeTrue();
        detail.Status.Should().Be(Statuses.TaskAssignment.Assigned);
        detail.Targets.Should().ContainSingle().Which.TargetLevel.Should().Be(2);
        detail.Submissions.Should().BeEmpty();
        detail.MaxAttachments.Should().Be(MyTaskAttachmentRules.MaxFilesPerSubmission);
        detail.MaxAttachmentBytes.Should().Be(20L * 1024 * 1024);
        detail.AllowedExtensions.Should().Contain(new[] { ".pdf", ".docx", ".xlsx", ".png" }).And.NotContain(".exe");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task UploadedFile_IsStoredInTheTaskFolder_SubmittedAndDownloadable()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        var storage = FakeStorage();

        var file = await new UploadMyTaskAttachmentUseCase(world.Context, s.Me, storage.Object).ExecuteAsync(Pdf(world.MyTask.Id, "nội dung minh chứng"));
        await new SubmitMyTaskUseCase(world.Context, s.Me).ExecuteAsync(new SubmitMyTaskUseCaseInput
        {
            AssignmentId = world.MyTask.Id,
            Content = "Đính kèm bảng phân quyền thư mục chứng từ.",
            AttachmentIds = new() { file.Id },
        });
        var detail = await new GetMyTaskDetailUseCase(s.Me, s.Tasks).ExecuteAsync(new GetMyTaskDetailUseCaseInput { AssignmentId = world.MyTask.Id });
        var download = await new DownloadMyTaskAttachmentUseCase(world.Context, s.Me, storage.Object)
            .ExecuteAsync(new DownloadMyTaskAttachmentUseCaseInput { AssignmentId = world.MyTask.Id, FileId = file.Id });

        storage.Verify(f => f.UploadAsync(It.IsAny<Stream>(), "bang-phan-quyen.pdf", "application/pdf",
            MyTaskAttachmentRules.FolderFor(world.MyTask.Id), It.IsAny<CancellationToken>()), Times.Once);
        detail.Submissions.Single().Files.Should().ContainSingle().Which.FileName.Should().Be("bang-phan-quyen.pdf");
        download.FileName.Should().Be("bang-phan-quyen.pdf");
        new StreamReader(download.Content).ReadToEnd().Should().Be("nội dung minh chứng");
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Upload_ToAColleaguesTask_IsNotFound()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);

        var act = () => new UploadMyTaskAttachmentUseCase(world.Context, s.Me, FakeStorage().Object).ExecuteAsync(Pdf(world.PeerTask.Id));

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Upload_WhileWaitingForReview_IsRejected()
    {
        var world = await MeTestWorld.CreateAsync();
        var s = world.For(world.MeUser);
        await new SubmitMyTaskUseCase(world.Context, s.Me).ExecuteAsync(new SubmitMyTaskUseCaseInput
        {
            AssignmentId = world.MyTask.Id,
            Content = "Bài nộp đang chờ người chấm đánh giá.",
        });

        var act = () => new UploadMyTaskAttachmentUseCase(world.Context, s.Me, FakeStorage().Object).ExecuteAsync(Pdf(world.MyTask.Id));

        await act.Should().ThrowAsync<ConflictException>();
    }

    [Fact]
    [Trait("Category", "Integration")]
    public async Task Download_OfAColleaguesFile_IsNotFound()
    {
        var world = await MeTestWorld.CreateAsync();
        var storage = FakeStorage();
        var peer = world.For(world.PeerUser);
        var peerFile = await new UploadMyTaskAttachmentUseCase(world.Context, peer.Me, storage.Object).ExecuteAsync(Pdf(world.PeerTask.Id));
        var mine = world.For(world.MeUser);
        var download = new DownloadMyTaskAttachmentUseCase(world.Context, mine.Me, storage.Object);

        var throughPeerTask = () => download.ExecuteAsync(new DownloadMyTaskAttachmentUseCaseInput { AssignmentId = world.PeerTask.Id, FileId = peerFile.Id });
        var throughMyTask = () => download.ExecuteAsync(new DownloadMyTaskAttachmentUseCaseInput { AssignmentId = world.MyTask.Id, FileId = peerFile.Id });

        await throughPeerTask.Should().ThrowAsync<NotFoundException>();
        await throughMyTask.Should().ThrowAsync<NotFoundException>();
    }
}

/// <summary>EM-16: kiểm tra dữ liệu nhập trước khi gọi use case (FluentValidation, chạy tự động bởi decorator).</summary>
public class MyTaskInputValidationTests
{
    private static SubmitMyTaskUseCaseInput Submission(string content = "Mô tả giải pháp đủ hai mươi ký tự.", params string[] links) => new()
    {
        AssignmentId = Guid.NewGuid(),
        Content = content,
        LinkUrls = links.ToList(),
    };

    [Fact]
    public void ValidSubmission_Passes() =>
        new SubmitMyTaskUseCaseValidator().Validate(Submission(links: "https://drive.example.com/a")).IsValid.Should().BeTrue();

    [Theory]
    [InlineData("")]
    [InlineData("Quá ngắn")]
    public void ShortDescription_IsRejected(string content) =>
        new SubmitMyTaskUseCaseValidator().Validate(Submission(content)).Errors
            .Should().Contain(e => e.PropertyName == nameof(SubmitMyTaskUseCaseInput.Content));

    [Theory]
    [InlineData("ftp://files.example.com/report.pdf")]
    [InlineData("drive.example.com/report")]
    [InlineData("https://example.com/a;https://example.com/b")]
    public void LinkThatIsNotASingleHttpUrl_IsRejected(string link) =>
        new SubmitMyTaskUseCaseValidator().Validate(Submission(links: link)).IsValid.Should().BeFalse();

    [Fact]
    public void MoreThanTenLinks_OrDuplicateAttachments_AreRejected()
    {
        var validator = new SubmitMyTaskUseCaseValidator();
        var tooManyLinks = Submission(links: Enumerable.Range(1, 11).Select(i => $"https://example.com/{i}").ToArray());
        var file = Guid.NewGuid();
        var duplicateFiles = Submission();
        duplicateFiles.AttachmentIds = new() { file, file };

        validator.Validate(tooManyLinks).IsValid.Should().BeFalse();
        validator.Validate(duplicateFiles).IsValid.Should().BeFalse();
    }

    [Theory]
    [InlineData("bao-cao.pdf", 1024, true)]
    [InlineData("anh-chup.PNG", 2048, true)]
    [InlineData("virus.exe", 1024, false)]
    [InlineData("rong.pdf", 0, false)]
    [InlineData("qua-lon.zip", 20L * 1024 * 1024 + 1, false)]
    public void Attachment_ExtensionAndSizeRules(string fileName, long sizeBytes, bool valid) =>
        new UploadMyTaskAttachmentUseCaseValidator().Validate(new UploadMyTaskAttachmentUseCaseInput
        {
            AssignmentId = Guid.NewGuid(),
            FileName = fileName,
            SizeBytes = sizeBytes,
            Content = new MemoryStream(new byte[1]),
        }).IsValid.Should().Be(valid);
}

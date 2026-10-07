namespace DigiTalent.Application.UseCases.Me;

/// <summary>Nội dung tệp để controller trả về (FileResult của controller dispose stream).</summary>
public class MyFileContentDto
{
    public Stream Content { get; set; } = Stream.Null;
    public string FileName { get; set; } = string.Empty;
    public string ContentType { get; set; } = "application/octet-stream";
}

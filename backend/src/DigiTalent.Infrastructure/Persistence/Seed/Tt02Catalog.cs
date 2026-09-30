using DigiTalent.Domain.Constants;

namespace DigiTalent.Infrastructure.Persistence.Seed;

/// <summary>
/// Dữ liệu tham chiếu Khung năng lực số — Thông tư 02/2025/TT-BGDĐT (6 miền, 24 năng lực thành phần)
/// và 18 khóa học của khung chương trình (tai lieu/khung-chuong-trinh-15-khoa-digcomp, giaotrinh-mien6-AI).
/// Nguồn quyết định: docs/specs/2026-09-29-tt02-position-competency-matrix.md §2–§7.
/// </summary>
public static class Tt02Catalog
{
    public const string FrameworkCode = CompetencyFrameworks.Tt02.Code;
    public const string FrameworkVersion = CompetencyFrameworks.Tt02.Version;
    public const string FrameworkName = "Khung năng lực số cho người học";
    public const string FrameworkAuthority = "Bộ Giáo dục và Đào tạo";
    public const string FrameworkSourceUrl = "https://datafiles.chinhphu.vn/cpp/files/vbpq/2025/01/02-bgddt.pdf";
    public const string MappingNote =
        "Vận dụng cho doanh nghiệp — Thông tư áp dụng cho người học trong hệ thống giáo dục quốc dân";

    /// <summary>Mức hệ thống 1–3 ↔ bậc Thông tư (§2). Bậc 7–8 ngoài phạm vi.</summary>
    public const string SourceLevelText = "Bậc 1–2 / 3–4 / 5–6";

    public static readonly string[] LevelNames = { "Cơ bản", "Trung bình", "Nâng cao" };

    /// <summary>Hậu tố mã khóa học theo mức: F = Cơ bản, I = Trung bình, A = Nâng cao.</summary>
    private static readonly string[] LevelSuffixes = { "F", "I", "A" };

    /// <summary>Thời lượng chuẩn mỗi module (phút) theo mức — khung chương trình mục A5.</summary>
    private static readonly int[] ModuleMinutes = { 120, 150, 180 };

    public sealed record CompetencyDefinition(string SourceCode, string Name, string[] ModuleTitles);

    public sealed record DomainDefinition(int Number, string Name, string CoursePrefix, string[] CourseTitles, CompetencyDefinition[] Competencies)
    {
        public string CategoryCode => $"TT02_D{Number}";

        public string CourseCode(int level) => $"{CoursePrefix}-{LevelSuffixes[level - 1]}";

        public int CourseMinutes(int level) => Competencies.Length * ModuleMinutes[level - 1];
    }

    public static readonly DomainDefinition[] Domains =
    {
        new(1, "Khai thác dữ liệu và thông tin", "A1",
            new[] { "Tìm kiếm và lưu trữ thông tin cơ bản", "Chiến lược tìm kiếm và quản lý thông tin", "Phân tích thông tin và quản trị dữ liệu" },
            new CompetencyDefinition[]
            {
                new("1.1", "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số",
                    new[] { "Tìm kiếm thông tin bằng từ khóa", "Chiến lược tìm kiếm và toán tử", "Nghiên cứu phức hợp đa nguồn" }),
                new("1.2", "Đánh giá dữ liệu, thông tin và nội dung số",
                    new[] { "Nhận biết nguồn tin đáng tin cậy", "Đánh giá và so sánh nguồn tin", "Đánh giá chất lượng dữ liệu" }),
                new("1.3", "Quản lý dữ liệu, thông tin và nội dung số",
                    new[] { "Lưu trữ và sắp xếp tài liệu", "Tổ chức và quản lý khối lượng thông tin lớn", "Quản trị dữ liệu và vòng đời thông tin" }),
            }),
        new(2, "Giao tiếp và hợp tác trong môi trường số", "A2",
            new[] { "Giao tiếp số cơ bản nơi công sở", "Giao tiếp và cộng tác chuyên nghiệp", "Lãnh đạo giao tiếp và cộng tác số" },
            new CompetencyDefinition[]
            {
                new("2.1", "Tương tác thông qua công nghệ số",
                    new[] { "Công cụ giao tiếp cơ bản", "Giao tiếp hiệu quả theo tình huống", "Chiến lược giao tiếp tổ chức" }),
                new("2.2", "Chia sẻ thông tin và nội dung thông qua công nghệ số",
                    new[] { "Chia sẻ tài liệu và thông tin", "Chia sẻ thông tin có kiểm soát", "Quản trị luồng chia sẻ thông tin" }),
                new("2.3", "Sử dụng công nghệ số để thực hiện trách nhiệm công dân",
                    new[] { "Dịch vụ công trực tuyến", "Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp", "Doanh nghiệp trong môi trường số công cộng" }),
                new("2.4", "Hợp tác thông qua công nghệ số",
                    new[] { "Làm việc nhóm trên công cụ số", "Điều phối công việc nhóm", "Dẫn dắt cộng tác nhóm phân tán" }),
                new("2.5", "Thực hiện quy tắc ứng xử trên mạng",
                    new[] { "Ứng xử trên môi trường số", "Chuẩn mực ứng xử và xử lý tình huống khó", "Văn hóa ứng xử số và xử lý khủng hoảng" }),
                new("2.6", "Quản lý danh tính số",
                    new[] { "Danh tính số cá nhân", "Quản lý danh tính nghề nghiệp", "Danh tính số của tổ chức" }),
            }),
        new(3, "Sáng tạo nội dung số", "A3",
            new[] { "Tạo lập nội dung số cơ bản", "Tạo lập nội dung chuyên nghiệp", "Chiến lược nội dung và giải pháp số" },
            new CompetencyDefinition[]
            {
                new("3.1", "Phát triển nội dung số",
                    new[] { "Tạo tài liệu công việc cơ bản", "Sản xuất nội dung đa định dạng", "Chiến lược và hệ thống sản xuất nội dung" }),
                new("3.2", "Tích hợp và tạo lập lại nội dung số",
                    new[] { "Chỉnh sửa và tái sử dụng nội dung", "Tích hợp và chuyển đổi nội dung", "Quản trị và tái sử dụng tài sản nội dung" }),
                new("3.3", "Thực thi bản quyền và giấy phép",
                    new[] { "Nguyên tắc bản quyền cơ bản", "Bản quyền, giấy phép và sử dụng hợp pháp", "Quản trị rủi ro pháp lý về nội dung" }),
                new("3.4", "Lập trình",
                    new[] { "Làm quen tư duy tính toán", "Tự động hóa công việc lặp lại", "Thiết kế giải pháp số cho nghiệp vụ" }),
            }),
        new(4, "An toàn", "A4",
            new[] { "An toàn số cơ bản", "An toàn thông tin trong công việc", "Quản trị an toàn và trách nhiệm số" },
            new CompetencyDefinition[]
            {
                new("4.1", "Bảo vệ thiết bị",
                    new[] { "Bảo vệ thiết bị và tài khoản", "Bảo mật trong môi trường làm việc", "Quản trị an toàn thông tin doanh nghiệp" }),
                new("4.2", "Bảo vệ dữ liệu cá nhân và quyền riêng tư",
                    new[] { "Bảo vệ thông tin cá nhân", "Xử lý dữ liệu cá nhân trong công việc", "Tuân thủ bảo vệ dữ liệu cá nhân" }),
                new("4.3", "Bảo vệ sức khỏe và an sinh số",
                    new[] { "Sức khỏe khi làm việc với thiết bị số", "Cân bằng số và sức khỏe nghề nghiệp", "Chính sách phúc lợi số của tổ chức" }),
                new("4.4", "Bảo vệ môi trường",
                    new[] { "Sử dụng công nghệ có ý thức môi trường", "Vận hành số bền vững", "Chiến lược bền vững số" }),
            }),
        new(5, "Giải quyết vấn đề", "A5",
            new[] { "Xử lý sự cố và tự học công nghệ", "Giải quyết vấn đề trong công việc số", "Đổi mới và dẫn dắt chuyển đổi số" },
            new CompetencyDefinition[]
            {
                new("5.1", "Giải quyết các vấn đề kỹ thuật",
                    new[] { "Xử lý sự cố thường gặp", "Chẩn đoán và xử lý vấn đề kỹ thuật", "Xây dựng năng lực xử lý vấn đề của tổ chức" }),
                new("5.2", "Xác định nhu cầu và giải pháp công nghệ",
                    new[] { "Chọn công cụ phù hợp với công việc", "Đánh giá và lựa chọn giải pháp công nghệ", "Chiến lược công nghệ và triển khai thay đổi" }),
                new("5.3", "Sử dụng sáng tạo công nghệ số",
                    new[] { "Cải tiến công việc bằng công cụ số", "Cải tiến quy trình bằng công cụ số", "Đổi mới sáng tạo bằng công nghệ số" }),
                new("5.4", "Xác định các vấn đề cần cải thiện về năng lực số",
                    new[] { "Nhận biết và bù đắp khoảng trống năng lực", "Phát triển năng lực số cho bản thân và nhóm", "Phát triển năng lực số toàn tổ chức" }),
            }),
        new(6, "Ứng dụng trí tuệ nhân tạo", "M6",
            new[] { "Ứng dụng AI cơ bản", "Ứng dụng AI trung cấp", "Ứng dụng AI nâng cao" },
            new CompetencyDefinition[]
            {
                new("6.1", "Hiểu biết về AI (trong đó có Gen AI)",
                    new[] { "Hiểu biết cơ bản về AI", "Hiểu biết AI ứng dụng vào công việc", "Đánh giá và định hướng ứng dụng AI" }),
                new("6.2", "Sử dụng AI có đạo đức và trách nhiệm",
                    new[] { "Sử dụng công cụ AI cơ bản", "Sử dụng AI có đạo đức và trách nhiệm trong công việc", "Lãnh đạo ứng dụng AI có trách nhiệm" }),
                new("6.3", "Đánh giá các công cụ AI",
                    new[] { "Nhận biết cơ bản về đánh giá AI", "Đánh giá công cụ AI trong công việc", "Xây dựng năng lực đánh giá AI cho tổ chức" }),
            }),
    };

    public static IEnumerable<string> CompetencyCodes => Domains.SelectMany(d => d.Competencies).Select(c => c.SourceCode);

    public static string CompetencyCode(string sourceCode) => $"TT02-{sourceCode}";

    /// <summary>
    /// Vị trí × mức yêu cầu của từng năng lực theo thứ tự 1.1 … 6.3 (0 = không yêu cầu, 1–3 = Cơ bản / Trung bình / Nâng cao).
    /// Quyết định D-B7 (30/09/2026): mỗi vị trí chọn năng lực phù hợp công việc, mức khác nhau theo từng năng lực.
    /// Mức chủ đạo của mỗi miền vẫn bám bảng A8 của khung chương trình; lý do từng ô ở tài liệu ma trận §4.
    /// </summary>
    public sealed record PositionDefinition(string Code, string Name, int[] Levels)
    {
        public int Level(string sourceCode) => Levels[Array.IndexOf(AllCodes, sourceCode)];

        /// <summary>D-B2 (theo năng lực): bắt buộc = năng lực cần mức Nâng cao + năng lực lõi 4.1, 4.2 cho mọi vị trí.</summary>
        public bool IsMandatory(string sourceCode) =>
            Level(sourceCode) == 3 || CompetencyFrameworks.Tt02.CoreCompetencyCodes.Contains(sourceCode);
    }

    private static readonly string[] AllCodes = CompetencyFrameworks.Tt02.CompetencyCodes.ToArray();

    public static readonly PositionDefinition[] Positions =
    {
        //                                      1.1 1.2 1.3  2.1 2.2 2.3 2.4 2.5 2.6  3.1 3.2 3.3 3.4  4.1 4.2 4.3 4.4  5.1 5.2 5.3 5.4  6.1 6.2 6.3
        new("CEO", "CEO / Giám đốc", new[]      { 2, 3, 3,    3, 3, 2, 3, 3, 3,        2, 0, 2, 0,      3, 3, 2, 2,      0, 3, 3, 3,      3, 3, 3 }),
        new("HR", "Nhân sự (HR)", new[]         { 2, 2, 2,    3, 2, 2, 3, 3, 2,        2, 1, 1, 0,      2, 3, 3, 1,      1, 2, 2, 3,      2, 2, 1 }),
        new("MARKETING", "Marketing", new[]     { 3, 3, 2,    3, 3, 0, 3, 3, 3,        3, 3, 3, 2,      2, 2, 1, 0,      1, 2, 3, 2,      3, 3, 3 }),
        new("SALES_CRM", "Sales / CRM", new[]   { 2, 2, 3,    3, 3, 0, 3, 3, 2,        2, 1, 0, 0,      2, 3, 1, 0,      1, 2, 2, 1,      2, 2, 1 }),
        new("ACCOUNTANT", "Kế toán", new[]      { 2, 3, 3,    2, 2, 3, 2, 1, 2,        1, 0, 0, 2,      2, 3, 1, 0,      1, 2, 2, 1,      1, 2, 2 }),
    };

    /// <summary>1 dòng yêu cầu của vị trí, đã có trọng số và cờ bắt buộc.</summary>
    public sealed record RequirementLine(string SourceCode, int DomainNumber, int RequiredLevel, decimal WeightPercent, bool Mandatory);

    /// <summary>
    /// Các dòng yêu cầu của vị trí (bỏ năng lực mức 0). Trọng số: 100% chia đều cho các miền có yêu cầu,
    /// trong miền chia đều cho các năng lực được yêu cầu.
    /// </summary>
    public static IReadOnlyList<RequirementLine> RequirementsFor(PositionDefinition position)
    {
        var byDomain = Domains
            .Select(d => (Domain: d, Codes: d.Competencies.Select(c => c.SourceCode).Where(code => position.Level(code) > 0).ToList()))
            .Where(x => x.Codes.Count > 0)
            .ToList();
        var weights = WeightsByDomain(byDomain.Select(x => x.Codes.Count).ToList());

        return byDomain
            .SelectMany((x, d) => x.Codes.Select((code, i) =>
                new RequirementLine(code, x.Domain.Number, position.Level(code), weights[d][i], position.IsMandatory(code))))
            .ToList();
    }

    /// <summary>
    /// Trọng số chia đều theo miền: 100 chia cho các miền, mỗi miền chia đều cho các năng lực của miền.
    /// Làm tròn 2 chữ số, phần dư dồn vào phần tử cuối — ở cả hai tầng — nên tổng luôn đúng 100.00.
    /// Giống hàm distributeWeightsByDomain ở FE (PositionRequirementsPage).
    /// </summary>
    public static decimal[][] WeightsByDomain(IReadOnlyList<int> competencyCountPerDomain)
    {
        var domainCents = SplitEvenly(10000, competencyCountPerDomain.Count);
        return competencyCountPerDomain
            .Select((count, index) => SplitEvenly(domainCents[index], count).Select(c => c / 100m).ToArray())
            .ToArray();
    }

    private static int[] SplitEvenly(int totalCents, int parts)
    {
        var share = (int)Math.Round((decimal)totalCents / parts, MidpointRounding.AwayFromZero);
        var result = Enumerable.Repeat(share, parts).ToArray();
        result[^1] = totalCents - share * (parts - 1);
        return result;
    }
}

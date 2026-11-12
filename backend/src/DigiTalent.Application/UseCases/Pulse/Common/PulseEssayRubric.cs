using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using DigiTalent.Domain.Constants;

namespace DigiTalent.Application.UseCases.Pulse;

/// <summary>
/// Rubric tự luận V2 theo Lĩnh vực (TT02 Domains 1–6) × Cấp độ (Cơ bản / Trung cấp / Nâng cao)
/// và bộ kiểm tra sao chép lại nguyên văn đề bài (không cần thay đổi schema DB).
/// </summary>
public static partial class PulseEssayRubric
{
    public const int EssayPassPercent = 70;

    private static readonly string[] CanonicalPromptStems =
    {
        "mo ta mot nhiem vu thuc te",
        "nguoi khac kiem tra lai duoc",
        "neu nguon hanh dong hoac phep tinh",
        "neu ro nguon du lieu hanh dong hoac phep tinh",
        "trong vi tri cua ban co dung nang luc",
        "thuc hien bai danh gia de chung minh",
    };

    private static readonly HashSet<string> CanonicalPromptTokens = BuildTokenSet(string.Join(" ",
        "mo ta mot nhiem vu thuc te cua vi tri trong ban co dung nang luc thuoc linh vuc",
        "neu ro nguon du lieu hanh dong hoac phep tinh nguoi khac kiem tra lai duoc",
        "ket luan va buoc tiep theo o muc do co ban trung cap nang cao hien tai",
        "khai thac du lieu va thong tin giao tiep hop tac cong tac sang tao noi dung so",
        "an toan giai quyet van de ung dung tri tue nhan tao ai",
        "va la o voi theo trong cho tu nhung cac mot hai ba bon"));

    public sealed record PromptCopyAnalysis(
        bool IsPromptCopy,
        int EvidenceTokenCount,
        int OriginalTokenCount,
        double PromptOverlapRatio,
        double CanonicalOverlapRatio);

    public sealed record RubricAuditMetrics(
        int WeightedScorePercent,
        bool GateFailed,
        bool PassedThreshold);

    /// <summary>Xác định số lĩnh vực TT02 (1..6) từ domainNumber, mã khóa học hoặc tên lĩnh vực.</summary>
    public static int ResolveDomainNumber(int? domainNumber, string? domainName, string? courseCode = null)
    {
        if (domainNumber is >= 1 and <= 6)
        {
            return domainNumber.Value;
        }

        if (!string.IsNullOrWhiteSpace(courseCode))
        {
            var code = courseCode.Trim().ToUpperInvariant();
            if (code.Length >= 2 && (code[0] is 'A' or 'M') && char.IsDigit(code[1]))
            {
                var digit = code[1] - '0';
                if (digit is >= 1 and <= 6)
                {
                    return digit;
                }
            }
        }

        var folded = NormalizeFold(domainName);
        if (folded.Contains("tri tue nhan tao", StringComparison.Ordinal) || Regex.IsMatch(folded, @"\bai\b"))
        {
            return 6;
        }

        if (folded.Contains("giai quyet van de", StringComparison.Ordinal))
        {
            return 5;
        }

        if (folded.Contains("an toan", StringComparison.Ordinal))
        {
            return 4;
        }

        if (folded.Contains("sang tao noi dung", StringComparison.Ordinal))
        {
            return 3;
        }

        if (folded.Contains("giao tiep", StringComparison.Ordinal) || folded.Contains("hop tac", StringComparison.Ordinal))
        {
            return 2;
        }

        if (folded.Contains("khai thac du lieu", StringComparison.Ordinal) || folded.Contains("du lieu va thong tin", StringComparison.Ordinal))
        {
            return 1;
        }

        return 1;
    }

    public static bool IsDefaultFinalCriteria(IReadOnlyList<string>? criteria)
    {
        if (criteria == null || criteria.Count == 0)
        {
            return true;
        }

        var cleaned = criteria.Select(c => (c ?? string.Empty).Trim()).Where(c => c.Length > 0).ToList();
        if (cleaned.Count == 0)
        {
            return true;
        }

        if (cleaned.Count != PlatformCatalog.DefaultFinalCriteria.Length)
        {
            return false;
        }

        return cleaned.All(c => PlatformCatalog.DefaultFinalCriteria.Any(d => string.Equals(d, c, StringComparison.OrdinalIgnoreCase)));
    }

    /// <summary>
    /// Xây dựng bộ tiêu chí có trọng số cho một bài nộp:
    /// nếu khóa có tiêu chí tùy chỉnh riêng thì giữ nguyên và phân bổ đều 100%;
    /// ngược lại dùng rubric V2 gồm 4 tiêu chí (20% / 20% / 20% / 40% Gate) theo Lĩnh vực × Cấp độ.
    /// </summary>
    public static List<PulseCriterionDto> Build(
        int? domainNumber,
        string? domainName,
        int? tier,
        IReadOnlyList<string>? customCriteria = null,
        string? courseCode = null)
    {
        if (customCriteria is { Count: > 0 } && !IsDefaultFinalCriteria(customCriteria))
        {
            var cleaned = customCriteria
                .Select(c => (c ?? string.Empty).Trim())
                .Where(c => c.Length > 0)
                .ToList();
            if (cleaned.Count > 0)
            {
                var baseWeight = 100 / cleaned.Count;
                var remainder = 100 % cleaned.Count;
                return cleaned
                    .Select((title, idx) => new PulseCriterionDto(
                        (idx + 1).ToString("D2", CultureInfo.InvariantCulture),
                        title,
                        "Tiêu chí đánh giá thực hành riêng của khóa học.")
                    {
                        WeightPercent = baseWeight + (idx == cleaned.Count - 1 ? remainder : 0),
                        IsRequired = false,
                    })
                    .ToList();
            }
        }

        var resolvedDomain = ResolveDomainNumber(domainNumber, domainName, courseCode);
        var clampedTier = tier.HasValue ? Math.Clamp(tier.Value, 1, PulseRules.MaxLevel) : 2;
        var (tierSourceHint, tierProcessHint, tierConclusionHint) = clampedTier switch
        {
            1 => (
                "Nêu rõ tên tài liệu, tệp, hệ thống hoặc tình huống hằng ngày đang xử lý.",
                "Mô tả từng bước thao tác hoặc phép kiểm tra cụ thể để đồng nghiệp làm lại được.",
                "Nêu kết quả thu được và một việc cụ thể cần thực hiện tiếp theo."),
            2 => (
                "Nêu rõ nhiều nguồn hoặc ngữ cảnh phối hợp trong bộ phận và đối tượng liên quan.",
                "Trình bày cách đối chiếu chéo, xử lý ngoại lệ hoặc kiểm soát sai số trong quy trình.",
                "Đưa ra kết luận có dẫn chứng, đánh giá rủi ro và hành động phòng ngừa."),
            _ => (
                "Xác định rõ hệ thống dữ liệu, luồng thông tin liên bộ phận và chuẩn đầu vào.",
                "Nêu rõ phương pháp kiểm chứng đa chiều, công thức/quy chuẩn và tiêu chí đo lường.",
                "Nêu quyết định cải tiến quy trình, người chịu trách nhiệm và cách đo hiệu quả sau áp dụng."),
        };

        var (gateTitle, gateDescription, _) = GateDefinition(resolvedDomain, clampedTier);

        return new List<PulseCriterionDto>
        {
            new("01", "Nguồn & bối cảnh công việc thực tế", tierSourceHint)
            {
                WeightPercent = 20,
                IsRequired = false,
            },
            new("02", "Quy trình thực hiện & kiểm chứng", tierProcessHint)
            {
                WeightPercent = 20,
                IsRequired = false,
            },
            new("03", "Kết luận & bước tiếp theo", tierConclusionHint)
            {
                WeightPercent = 20,
                IsRequired = false,
            },
            new("04", gateTitle, gateDescription)
            {
                WeightPercent = 40,
                IsRequired = true,
            },
        };
    }

    public static string[] GateKeywordsForDomain(int domainNumber) =>
        GateDefinition(Math.Clamp(domainNumber, 1, 6), 2).Keywords;

    public static string TierExpectationLabel(int? tier) => tier switch
    {
        1 => "Cơ bản (Mức 1): làm đúng việc số hằng ngày với nguồn/công cụ thật của bản thân.",
        2 => "Trung cấp (Mức 2): tự phối hợp quy trình, đối chiếu chéo và xử lý ngoại lệ trong nhóm.",
        3 => "Nâng cao (Mức 3): chuẩn hóa quy trình, kiểm soát rủi ro và đo lường hiệu quả cải tiến.",
        _ => "Cấp độ tiêu chuẩn: nêu rõ tình huống, nguồn dữ liệu, cách kiểm chứng và bước tiếp theo.",
    };

    /// <summary>Phát hiện trường hợp nhân viên chép lại nội dung đề bài thay vì viết minh chứng công việc thực tế.</summary>
    public static PromptCopyAnalysis AnalyzePromptCopy(string? evidence, string? promptHtml)
    {
        if (string.IsNullOrWhiteSpace(evidence))
        {
            return new PromptCopyAnalysis(false, 0, 0, 0, 0);
        }

        var normalizedEvidence = NormalizeFold(evidence);
        var evidenceTokens = ExtractTokens(normalizedEvidence);
        if (evidenceTokens.Count == 0)
        {
            return new PromptCopyAnalysis(false, 0, 0, 0, 0);
        }

        var strippedPrompt = StripHtml(promptHtml ?? string.Empty);
        var normalizedPrompt = NormalizeFold(strippedPrompt);
        var promptTokens = BuildTokenSet(normalizedPrompt);

        var promptMatches = promptTokens.Count > 0 ? evidenceTokens.Count(t => promptTokens.Contains(t)) : 0;
        var canonicalMatches = evidenceTokens.Count(t => CanonicalPromptTokens.Contains(t) || promptTokens.Contains(t));
        var originalTokens = evidenceTokens.Where(t => !CanonicalPromptTokens.Contains(t) && !promptTokens.Contains(t)).ToList();
        var distinctOriginalCount = originalTokens.Distinct().Count();

        var promptOverlap = (double)promptMatches / evidenceTokens.Count;
        var canonicalOverlap = (double)canonicalMatches / evidenceTokens.Count;
        var hasCanonicalStem = CanonicalPromptStems.Any(stem => normalizedEvidence.Contains(stem, StringComparison.Ordinal));

        var matchesExplicitPrompt = promptTokens.Count >= 8 && promptOverlap >= 0.68 && distinctOriginalCount < 6;
        var matchesCanonicalPrompt = hasCanonicalStem && (canonicalOverlap >= 0.62 || distinctOriginalCount < 8);
        var overwhelmedByBoilerplate = canonicalOverlap >= 0.78 && distinctOriginalCount < 6;

        var isCopy = matchesExplicitPrompt || matchesCanonicalPrompt || overwhelmedByBoilerplate;
        return new PromptCopyAnalysis(isCopy, evidenceTokens.Count, distinctOriginalCount, promptOverlap, canonicalOverlap);
    }

    /// <summary>Tính điểm trọng số (%) và trạng thái Gate để lưu vết vào AuditLog.</summary>
    public static RubricAuditMetrics ComputeAuditMetrics(IReadOnlyList<PulseCriterionEvaluationInput>? evaluations)
    {
        if (evaluations == null || evaluations.Count == 0)
        {
            return new RubricAuditMetrics(0, false, false);
        }

        var hasExplicitWeights = evaluations.Any(e => (e.WeightPercent ?? 0) > 0);
        decimal totalWeight = 0m;
        decimal earned = 0m;
        var gateFailed = false;

        foreach (var item in evaluations)
        {
            var status = (item.Status ?? string.Empty).Trim().ToUpperInvariant();
            if (item.IsRequired == true && status == "FAIL")
            {
                gateFailed = true;
            }

            var weight = hasExplicitWeights ? Math.Max(0, item.WeightPercent ?? 0) : 1m;
            if (weight <= 0)
            {
                continue;
            }

            totalWeight += weight;
            earned += status switch
            {
                "PASS" => weight,
                "PARTIAL" => weight * 0.5m,
                _ => 0m,
            };
        }

        var scorePercent = totalWeight > 0m
            ? (int)Math.Round(earned * 100m / totalWeight, MidpointRounding.AwayFromZero)
            : 0;
        return new RubricAuditMetrics(scorePercent, gateFailed, !gateFailed && scorePercent >= EssayPassPercent);
    }

    public static string NormalizeFold(string? input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var decomposed = input.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        foreach (var ch in decomposed)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(ch) == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            sb.Append(ch switch
            {
                'đ' or 'Đ' => 'd',
                _ => char.ToLowerInvariant(ch),
            });
        }

        return Regex.Replace(sb.ToString().Normalize(NormalizationForm.FormC), @"\s+", " ").Trim();
    }

    public static string StripHtml(string html)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return string.Empty;
        }

        var noTags = HtmlTagRegex().Replace(html, " ");
        return System.Net.WebUtility.HtmlDecode(noTags).Trim();
    }

    private static List<string> ExtractTokens(string normalizedText)
    {
        return WordTokenRegex()
            .Matches(normalizedText)
            .Select(m => m.Value)
            .Where(t => t.Length >= 2)
            .ToList();
    }

    private static HashSet<string> BuildTokenSet(string normalizedText)
    {
        var tokens = new HashSet<string>(StringComparer.Ordinal);
        foreach (var token in ExtractTokens(normalizedText))
        {
            tokens.Add(token);
        }

        return tokens;
    }

    private static (string Title, string Description, string[] Keywords) GateDefinition(int domainNumber, int tier)
    {
        var advancedSuffix = tier >= 3 ? " Đáp ứng chuẩn kiểm soát ở cấp Nâng cao." : string.Empty;
        return domainNumber switch
        {
            1 => (
                "Độ tin cậy nguồn, công thức & phân quyền dữ liệu",
                "Kiểm chứng nguồn dữ liệu gốc, phép tính hoặc lọc trùng chính xác và lưu trữ đúng quyền truy cập/sao lưu." + advancedSuffix,
                new[] { "so cai", "bao cao goc", "goc", "doi chieu", "cong thuc", "pivot", "loc trung", "tin cay", "xac thuc", "phan quyen", "sao luu", "chinh xac", "excel", "crm", "csdl" }),
            2 => (
                "Kênh giao tiếp, chuẩn mực ứng xử & kiểm soát chia sẻ",
                "Chọn đúng kênh trao đổi, đúng nhóm người nhận, văn phong nghề nghiệp và kiểm soát quyền xem khi chia sẻ tài liệu." + advancedSuffix,
                new[] { "kenh", "email", "zalo", "teams", "slack", "quyen xem", "chia se", "link", "nguoi nhan", "bien ban", "phan hoi", "giao tiep", "chuan muc" }),
            3 => (
                "Định dạng, tái sử dụng & bản quyền nội dung số",
                "Chọn đúng định dạng xuất bản, bố cục cho phép tái sử dụng và ghi rõ nguồn hoặc bản quyền tài nguyên." + advancedSuffix,
                new[] { "dinh dang", "pdf", "docx", "slide", "video", "canva", "mau", "tai su dung", "ban quyen", "nguon anh", "giay phep", "chinh sua", "xuat ban" }),
            4 => (
                "An toàn thiết bị, bảo vệ dữ liệu nhạy cảm & ứng phó",
                "Tuân thủ xác thực/mật khẩu, che chắn dữ liệu cá nhân hoặc nội bộ (PII) và nêu cách xử lý khi có rủi ro an toàn số." + advancedSuffix,
                new[] { "mat khau", "2fa", "xac thuc", "pii", "nhay cam", "bao mat", "an toan", "phan quyen", "su co", "lua dao", "phishing", "ma hoa", "rieng tu", "sao luu" }),
            5 => (
                "Chẩn đoán nguyên nhân, chọn công cụ & phương án dự phòng",
                "Xác định đúng nguyên nhân sự cố hoặc điểm nghẽn công việc, chọn công cụ phù hợp và có phương án dự phòng." + advancedSuffix,
                new[] { "nguyen nhan", "su co", "loi", "khac phuc", "cong cu", "tu dong", "du phong", "quy trinh", "diem nghen", "giai phap", "xu ly" }),
            _ => (
                "Kiểm chứng AI, bảo mật dữ liệu đầu vào & trách nhiệm bàn giao",
                "Không đưa dữ liệu mật/PII lên AI công khai, tự đối chiếu đầu ra AI với nguồn tin cậy trước khi bàn giao." + advancedSuffix,
                new[] { "ai", "chatgpt", "gemini", "copilot", "prompt", "kiem chung", "doi chieu", "pii", "du lieu mat", "an danh", "ban giao", "trach nhiem" }),
        };
    }

    [GeneratedRegex("<[^>]+>")]
    private static partial Regex HtmlTagRegex();

    [GeneratedRegex("[a-z0-9]+")]
    private static partial Regex WordTokenRegex();
}

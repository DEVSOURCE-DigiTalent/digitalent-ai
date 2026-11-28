using DigiTalent.Application.UseCases.Platform.SignLanguageVideo;
using DigiTalent.Domain.Constants;
using FluentAssertions;
using Xunit;

namespace DigiTalent.Tests.Platform;

/// <summary>
/// Matching captions to the sign dictionary (docs/specs/2026-11-24-sign-language-video.md §7): normalization, the
/// order of the tiers, variants, and that a word without a sign is always reported, never dropped.
/// </summary>
public class SignGlossMatcherTests
{
    private readonly SignGlossMatcher _matcher = new();

    private static SignDictionaryEntry Sign(string gloss, string region = SignLanguage.Region.National, string? variant = null, bool preferred = false,
        short priority = 0, string kind = SignLanguage.Kind.Word, params string[] synonyms) => new()
    {
        Id = Guid.NewGuid(),
        Gloss = gloss,
        Key = SignTextNormalizer.DictionaryKey(gloss),
        Kind = kind,
        Region = region,
        Variant = variant,
        IsPreferred = preferred,
        Priority = priority,
        SynonymKeys = synonyms.Select(SignTextNormalizer.Key).ToList(),
        VideoAssetId = Guid.NewGuid(),
        Licensed = true,
    };

    private IReadOnlyList<SignMatch> Match(string text, params SignDictionaryEntry[] signs) =>
        _matcher.MatchSentence(text, SignDictionaryIndex.Build(signs), SignMatchPreferences.Default);

    [Fact]
    public void Normalize_FoldsCaseUnicodeFormsPunctuationSpacesAndNonSpeech()
    {
        // "dữ liệu" written with decomposed accents (macOS) is the same word.
        var decomposed = "Dữ   LIỆU!".Normalize(System.Text.NormalizationForm.FormD);
        SignTextNormalizer.Key(decomposed).Should().Be("dữ liệu");
        SignTextNormalizer.Key("  Xin chào, các bạn... ").Should().Be("xin chào các bạn");
        SignTextNormalizer.Tokenize("[nhạc nền] Bắt đầu nào").Select(t => t.Key).Should().Equal("bắt", "đầu", "nào");
        SignTextNormalizer.DictionaryKey("cạnh (môn Toán)").Should().Be("cạnh");
        SignTextNormalizer.QualifierOf("cạnh (môn Toán)").Should().Be("môn Toán");
        SignTextNormalizer.Fold("Đường dữ liệu").Should().Be("Duong du lieu");
        SignTextNormalizer.Singulars("emails").Should().Contain("email");
        SignTextNormalizer.Singulars("bàn").Should().BeEmpty("không đổi số nhiều cho từ tiếng Việt");
    }

    [Fact]
    public void ExactSentence_WinsOverItsWords()
    {
        var result = Match("Xin chào!", Sign("xin chào"), Sign("xin"), Sign("chào"));

        result.Should().ContainSingle();
        result[0].MatchType.Should().Be(SignVideo.Match.ExactSentence);
        result[0].Entry!.Gloss.Should().Be("xin chào");
        result[0].Confidence.Should().Be(SignGlossMatcher.ExactSentenceConfidence);
    }

    [Fact]
    public void LongestPhrase_IsTakenFirst_ThenWords_AndMissingWordsAreReportedInOrder()
    {
        var result = Match(
            "Hôm nay chúng ta sẽ tìm hiểu về kiến trúc dữ liệu.",
            Sign("hôm nay"), Sign("chúng ta"), Sign("tìm hiểu"), Sign("kiến trúc dữ liệu"), Sign("kiến trúc"), Sign("dữ liệu"));

        result.Select(m => m.SourceText).Should().Equal("Hôm nay", "chúng ta", "sẽ", "tìm hiểu", "về", "kiến trúc dữ liệu");
        result.Select(m => m.MatchType).Should().Equal(
            SignVideo.Match.Phrase, SignVideo.Match.Phrase, SignVideo.Match.Missing, SignVideo.Match.Phrase, SignVideo.Match.Missing, SignVideo.Match.Phrase);
        result.Where(m => m.IsMissing).Select(m => m.SourceText).Should().Equal(new[] { "sẽ", "về" }, "từ thiếu ký hiệu không bị bỏ qua âm thầm");
        result.Where(m => m.IsMissing).Should().OnlyContain(m => m.Hint == "FUNCTION_WORD", "hư từ được gợi ý cho người duyệt, không tự bỏ");
    }

    [Fact]
    public void SingleWord_IsMatchedWhenNoPhraseFits()
    {
        var result = Match("Học marketing", Sign("học"));

        result.Select(m => (m.SourceText, m.MatchType)).Should().Equal(("Học", SignVideo.Match.Word), ("marketing", SignVideo.Match.Missing));
        result[1].Hint.Should().BeNull();
    }

    [Fact]
    public void Accents_SignTypedWithoutAccentsMatches_ButAccentedSignsNeverMatchOtherAccents()
    {
        var typedWithoutAccents = Sign("xin chao");
        Match("Xin chào", typedWithoutAccents).Single().Should().Match<SignMatch>(m =>
            m.Entry == typedWithoutAccents && m.MatchType == SignVideo.Match.Unaccented && m.Confidence == SignGlossMatcher.UnaccentedConfidence);

        // "bán" (sell) must not become "bàn" (table): both are written with accents.
        Match("bán", Sign("bàn"), Sign("bạn")).Single().IsMissing.Should().BeTrue();

        // A caption typed without accents may match an accented sign; two candidates tie → the reviewer chooses.
        Match("du lieu", Sign("dữ liệu")).Single().Entry!.Gloss.Should().Be("dữ liệu");
        var tie = Match("ban", Sign("bàn"), Sign("bạn")).Single();
        tie.MatchType.Should().Be(SignVideo.Match.Ambiguous);
        tie.Entry.Should().BeNull();
        tie.Candidates.Should().HaveCount(2);
    }

    [Fact]
    public void Synonyms_AreUsedOnlyAfterExactAndUnaccentedMatches()
    {
        var hello = Sign("xin chào", synonyms: new[] { "chào bạn", "hello" });
        var result = Match("Chào bạn, hello", hello);

        result.Select(m => (m.SourceText, m.MatchType)).Should().Equal(("Chào bạn", SignVideo.Match.Synonym), ("hello", SignVideo.Match.Synonym));
        result.Should().OnlyContain(m => m.Entry == hello && m.Confidence == SignGlossMatcher.SynonymConfidence);

        var exact = Sign("chào bạn");
        Match("Chào bạn", hello, exact).Single().Entry.Should().Be(exact, "khớp chính xác đứng trước từ đồng nghĩa");
    }

    [Fact]
    public void ForeignPluralsAndNumbers_AreNormalized()
    {
        var email = Sign("email");
        Match("emails", email).Single().Should().Match<SignMatch>(m => m.Entry == email && m.MatchType == SignVideo.Match.Normalized);

        var two = Sign("2", kind: SignLanguage.Kind.Digit);
        var four = Sign("4", kind: SignLanguage.Kind.Digit);
        var digits = Match("24", two, four);
        digits.Select(m => m.Entry).Should().Equal(two, four);
        digits.Should().OnlyContain(m => m.MatchType == SignVideo.Match.Digits);
        Match("25", two).Single().IsMissing.Should().BeTrue("thiếu một chữ số thì báo thiếu cả số");
    }

    [Fact]
    public void Variants_RegionThenVariantThenDefaultThenPriority_AndATiePicksNone()
    {
        var north = Sign("cảm ơn", SignLanguage.Region.North);
        var south = Sign("cảm ơn", SignLanguage.Region.South);
        var national = Sign("cảm ơn");

        _matcher.MatchSentence("cảm ơn", SignDictionaryIndex.Build(new[] { north, south }), new SignMatchPreferences("VSL", SignLanguage.Region.South, null))
            .Single().Entry.Should().Be(south, "ưu tiên vùng của video");
        _matcher.MatchSentence("cảm ơn", SignDictionaryIndex.Build(new[] { north, national }), new SignMatchPreferences("VSL", SignLanguage.Region.South, null))
            .Single().Entry.Should().Be(national, "không có vùng đó thì lấy ký hiệu cả nước");

        var tie = Match("cảm ơn", north, south).Single();
        tie.MatchType.Should().Be(SignVideo.Match.Ambiguous, "hai biến thể ngang nhau: không tự chọn ngẫu nhiên");
        tie.Candidates.Should().BeEquivalentTo(new[] { north, south });

        var preferred = Sign("cảm ơn", SignLanguage.Region.South, preferred: true);
        Match("cảm ơn", north, preferred).Single().Entry.Should().Be(preferred, "ký hiệu mặc định do quản trị viên chọn");
        var important = Sign("cảm ơn", SignLanguage.Region.North, variant: "người ra dấu B", priority: 5);
        Match("cảm ơn", north, important).Single().Entry.Should().Be(important);

        var byVariant = _matcher.MatchSentence("cảm ơn", SignDictionaryIndex.Build(new[] { north, important }),
            new SignMatchPreferences("VSL", SignLanguage.Region.North, "người ra dấu B"));
        byVariant.Single().Entry.Should().Be(important);
    }

    [Fact]
    public void ASignThatCanBeShown_WinsOverOneStillWaitingForItsVideo()
    {
        // A word of the national standard entered without a video (Thông tư 17 list) and the same word imported with
        // the video of a region: the one that can be shown is chosen, even though the other is "cả nước".
        var placeholder = Sign("bạn") with { VideoAssetId = null, Licensed = false };
        var north = Sign("bạn", SignLanguage.Region.North, variant: "QIPEDC W00123");
        var result = Match("bạn", placeholder, north).Single();
        result.Entry.Should().Be(north);
        result.Candidates.Should().Equal(north, placeholder);

        var withoutRights = Sign("bạn", variant: "khác") with { Licensed = false };
        Match("bạn", withoutRights, north).Single().Entry.Should().Be(north, "video chưa ghi quyền sử dụng cũng không dựng được");

        var otherPlaceholder = Sign("bạn", SignLanguage.Region.South) with { VideoAssetId = null, Licensed = false };
        Match("bạn", placeholder, otherPlaceholder).Single().Entry.Should().Be(placeholder, "giữa hai ký hiệu chưa có video, vẫn xếp theo vùng");
    }

    [Fact]
    public void WordsInCapitals_MatchOnlySignsWrittenTheSameWay()
    {
        var who = Sign("ai");
        var artificialIntelligence = Sign("AI (trí tuệ nhân tạo)");

        var course = Match("khóa học DigiTalent AI", who, Sign("khóa học"));
        course.Last().SourceText.Should().Be("AI");
        course.Last().IsMissing.Should().BeTrue("“AI” viết hoa là chữ viết tắt, không phải đại từ “ai”");

        Match("học AI", Sign("học"), who, artificialIntelligence).Last().Entry.Should().Be(artificialIntelligence);
        Match("Ai biết?", who, artificialIntelligence).First().Entry.Should().Be(who, "chữ hoa đầu câu không phải chữ viết tắt");
        Match("ai", artificialIntelligence).Single().IsMissing.Should().BeTrue();
        Match("AI", Sign("ái")).Single().IsMissing.Should().BeTrue("cả bước bỏ dấu cũng giữ chữ hoa");

        var shouted = Match("XIN CHÀO CÁC BẠN", Sign("xin chào"), Sign("các bạn"));
        shouted.Should().OnlyContain(m => !m.IsMissing, "câu viết hoa toàn bộ là chữ thường, không phải chữ viết tắt");

        SignTextNormalizer.IsCapitalized("CRM").Should().BeTrue();
        SignTextNormalizer.IsCapitalized("Học").Should().BeFalse();
        SignTextNormalizer.IsCapitalized("A").Should().BeFalse();
    }

    [Fact]
    public void QualifiedSigns_OfTheSameWord_AreOfferedToTheReviewer()
    {
        var noun = Sign("bảo vệ (danh từ)");
        var verb = Sign("bảo vệ (động từ)");

        var result = Match("bảo vệ dữ liệu", noun, verb, Sign("dữ liệu"));
        result[0].MatchType.Should().Be(SignVideo.Match.Ambiguous);
        result[0].Candidates.Select(c => c.Gloss).Should().BeEquivalentTo("bảo vệ (danh từ)", "bảo vệ (động từ)");
        result[1].Entry!.Gloss.Should().Be("dữ liệu");
    }

    [Fact]
    public void MatchPhrase_ReadsJoinedWordsAsOneSign()
    {
        var index = SignDictionaryIndex.Build(new[] { Sign("kiến trúc dữ liệu"), Sign("kiến trúc") });

        _matcher.MatchPhrase("kiến  trúc dữ liệu", index, SignMatchPreferences.Default).Entry!.Gloss.Should().Be("kiến trúc dữ liệu");
        _matcher.MatchPhrase("trúc dữ", index, SignMatchPreferences.Default).IsMissing.Should().BeTrue();
    }

    [Fact]
    public void ArchivedSignsAndOtherSignLanguages_AreNeverMatched()
    {
        var archived = Sign("học") with { Status = Statuses.SignGloss.Archived };
        Match("học", archived).Single().IsMissing.Should().BeTrue();

        var other = Sign("học") with { SignLanguage = "ASL" };
        Match("học", other).Single().IsMissing.Should().BeTrue();
    }

    [Fact]
    public void TheSpeakerInRoundBrackets_IsNotSigned()
    {
        var result = Match("(Giảng viên) Chào mừng bạn", Sign("chào mừng"), Sign("bạn"), Sign("giảng viên"));

        result.Select(m => m.SourceText).Should().Equal(new[] { "Chào mừng", "bạn" }, "nhãn người nói trong phụ đề không phải lời nói");
    }

    [Fact]
    public void AWordWithoutAccents_NeverStandsForAnAccentedWord()
    {
        Match("tổ chức", Sign("to")).Should().OnlyContain(m => m.IsMissing, "“tổ” không phải “to”");
        Match("bà", Sign("ba")).Single().IsMissing.Should().BeTrue();
        Match("Xin chào", Sign("xin chao")).Single().MatchType.Should().Be(SignVideo.Match.Unaccented, "cụm gõ không dấu vẫn khớp");
    }

    [Fact]
    public void ASignKeptForOneMeaning_IsOffered_NotChosen_UnlessItIsTheDefaultOrASynonym()
    {
        var maths = Sign("hiệu (môn Toán)");
        var offered = Match("hiệu quả", maths)[0];
        offered.Entry.Should().BeNull("“hiệu” của “hiệu quả” không phải phép trừ");
        offered.MatchType.Should().Be(SignVideo.Match.Ambiguous);
        offered.Hint.Should().Be(SignGlossMatcher.SenseCheckHint);
        offered.Candidates.Should().ContainSingle().Which.Should().Be(maths);

        var byDefault = Sign("hiệu (môn Toán)", preferred: true);
        Match("hiệu", byDefault).Single().Entry.Should().Be(byDefault, "quản trị viên đặt làm ký hiệu mặc định");
        var preposition = Sign("cùng (giới từ)", synonyms: new[] { "với" });
        Match("với", preposition).Single().Entry.Should().Be(preposition, "từ đồng nghĩa do quản trị viên khai báo");
    }
}

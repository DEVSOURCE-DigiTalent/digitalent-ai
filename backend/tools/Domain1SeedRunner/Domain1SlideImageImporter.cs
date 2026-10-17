using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using DigiTalent.Domain.Entities;
using DigiTalent.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

/// <summary>One-time, repeatable conversion of reviewed slide illustrations into real catalog assets.
/// Only adds missing media to Domain I draft blocks and the already seeded Learning v2; never publishes a draft,
/// rewrites text/questions, replaces uploads, or moves an enrollment.</summary>
internal static class Domain1SlideImageImporter
{
    private sealed record Artwork(string Course, int ModuleIndex, string ModuleTitle, string Title, string Image, string Alt);
    private static string Plain(string text) => WebUtility.HtmlDecode(Regex.Replace(text, "<[^>]*>", " ")).Normalize().Trim();
    private static string Title(string? body)
    {
        var match = Regex.Match(body ?? "", @"<h[234]\b[^>]*>(.*?)</h[234]>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
        return match.Success ? Plain(match.Groups[1].Value) : "";
    }
    private static Guid Id(string key) => new(SHA256.HashData(Encoding.UTF8.GetBytes(key)).AsSpan(0, 16));

    public static async Task RunAsync(AppDbContext db, string manifestPath, bool apply)
    {
        var root = Environment.GetEnvironmentVariable("DIGITALENT_ASSET_ROOT");
        if (string.IsNullOrWhiteSpace(root) || !Path.IsPathFullyQualified(root))
            throw new InvalidOperationException("Set DIGITALENT_ASSET_ROOT to the API's absolute LocalBasePath (uploads directory).");
        root = Path.GetFullPath(root);
        await using var manifestStream = File.OpenRead(manifestPath);
        var manifest = await JsonSerializer.DeserializeAsync<List<Artwork>>(manifestStream, new JsonSerializerOptions { PropertyNameCaseInsensitive = true })
            ?? throw new InvalidOperationException("Empty artwork manifest.");
        // The manifest lives in frontend/src/features/pulse-employee/lib.
        var repo = Path.GetFullPath(Path.Combine(Path.GetDirectoryName(Path.GetFullPath(manifestPath))!, "../../../../.."));
        var sourceRoot = Path.Combine(repo, "docs", "ui-redesign", "assets");
        var files = new Dictionary<string, (Guid Id, string Path, string Key, long Length)>();
        foreach (var art in manifest)
        {
            var source = Path.GetFullPath(Path.Combine(sourceRoot, art.Image));
            if (!source.StartsWith(sourceRoot + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase) || !File.Exists(source))
                throw new InvalidOperationException($"Missing or invalid reviewed image: {art.Image}");
            var bytes = await File.ReadAllBytesAsync(source);
            if (bytes.Length > 10 * 1024 * 1024 || !bytes.AsSpan(0, Math.Min(8, bytes.Length)).SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }))
                throw new InvalidOperationException($"Expected a PNG below 10 MB: {art.Image}");
            var hash = Convert.ToHexString(SHA256.HashData(bytes)).ToLowerInvariant();
            var id = Id("domain1-image:" + hash);
            files[art.Image] = (id, source, $"platform-assets/domain1/{hash}.png", bytes.LongLength);
        }

        Artwork? Match(string code, string moduleTitle, string title, string? body)
        {
            code = code.Replace("M1-", "A1-", StringComparison.Ordinal);
            var moduleRows = manifest.Where(a => a.Course == code && Plain(a.ModuleTitle) == Plain(moduleTitle)).ToList();
            var candidates = moduleRows.Where(a => Plain(a.Title) == Plain(title)).ToList();
            if (candidates.Count == 1) return candidates[0];
            var byCaption = moduleRows.Where(a => a.Alt.Length > 0 && Plain(body ?? "").Contains(Plain(a.Alt), StringComparison.Ordinal)).ToList();
            if (byCaption.Count > 1) throw new InvalidOperationException($"Ambiguous image for {code}: {title}");
            return byCaption.SingleOrDefault();
        }

        await using var tx = await db.Database.BeginTransactionAsync();
        var now = DateTimeOffset.UtcNow;
        var assets = await db.PlatformAssets.ToDictionaryAsync(a => a.Id);
        var admin = await db.Users.Where(u => u.Email == "admin@digitalent.ai").Select(u => (Guid?)u.Id).FirstOrDefaultAsync();
        foreach (var file in files.Values.DistinctBy(f => f.Id))
        {
            if (assets.ContainsKey(file.Id)) continue;
            var asset = new PlatformAsset { Id = file.Id, Kind = "IMAGE", FileName = Path.GetFileName(file.Path), StorageKey = file.Key, ContentType = "image/png", SizeBytes = file.Length, UploadedByUserId = admin, CreatedAt = now, UpdatedAt = now };
            assets[file.Id] = asset;
            db.PlatformAssets.Add(asset);
        }
        var draftCourses = await (from c in db.PlatformCatalogCourses
                                  join v in db.PlatformCatalogVersions on c.VersionId equals v.Id
                                  join identity in db.PlatformCourses on c.CourseId equals identity.Id
                                  where v.Status == "DRAFT" && (identity.Code == "A1-F" || identity.Code == "A1-I" || identity.Code == "A1-A")
                                  select new { Row = c, identity.Code }).ToListAsync();
        var addedBlocks = 0;
        foreach (var course in draftCourses)
        {
            var modules = await db.PlatformCourseModules.Where(m => m.CatalogCourseId == course.Row.Id).ToListAsync();
            foreach (var module in modules)
            {
                var blocks = await db.PlatformModuleBlocks.Where(b => b.ModuleId == module.Id).OrderBy(b => b.SortOrder).ToListAsync();
                var inserts = new Dictionary<Guid, PlatformModuleBlock>();
                foreach (var (block, index) in blocks.Select((b, i) => (b, i)))
                {
                    if (block.BlockType != "TEXT" || block.AssetId != null) continue;
                    // A real adjacent media block wins over the reviewed seed artwork.
                    if (index + 1 < blocks.Count && blocks[index + 1].BlockType != "TEXT") continue;
                    var art = Match(course.Code, module.Title, Title(block.BodyHtml), block.BodyHtml);
                    if (art == null) continue;
                    var blockId = Id($"domain1-image-block:{block.Id:D}");
                    if (blocks.Any(b => b.Id == blockId)) continue;
                    inserts[block.Id] = new PlatformModuleBlock { Id = blockId, ModuleId = module.Id, BlockType = "IMAGE", AssetId = files[art.Image].Id, AltText = art.Alt, Caption = art.Title, CreatedAt = now, UpdatedAt = now };
                }
                if (inserts.Count == 0) continue;
                // Vacate the unique sort positions before interleaving, in the same transaction.
                foreach (var block in blocks) block.SortOrder += 1_000_000;
                await db.SaveChangesAsync();
                var order = 0;
                foreach (var block in blocks)
                {
                    block.SortOrder = ++order;
                    if (!inserts.TryGetValue(block.Id, out var image)) continue;
                    image.SortOrder = ++order;
                    db.PlatformModuleBlocks.Add(image);
                    addedBlocks++;
                }
                course.Row.ChangeKind = course.Row.ChangeKind == "NEW" ? "NEW" : "EDITED";
                course.Row.UpdatedAt = now;
                await db.SaveChangesAsync();
            }
        }

        // Backfill media only on the v2 content imported earlier. Progress, assessments and course ids stay intact.
        var lessons = await (from l in db.Lessons join m in db.CourseModules on l.ModuleId equals m.Id join c in db.Courses on m.CourseId equals c.Id
                             where c.VersionNo == 2 && (c.Code == "M1-F" || c.Code == "M1-I" || c.Code == "M1-A" || c.Code == "A1-F" || c.Code == "A1-I" || c.Code == "A1-A")
                             select new { Lesson = l, c.Code, ModuleTitle = m.Title }).ToListAsync();
        var lessonIds = lessons.Select(l => l.Lesson.Id).ToList();
        var existingMedia = await db.LearningMaterials.Where(m => lessonIds.Contains(m.LessonId)).Select(m => m.LessonId).ToListAsync();
        var addedMaterials = 0;
        foreach (var row in lessons)
        {
            if (existingMedia.Contains(row.Lesson.Id)) continue;
            var art = Match(row.Code, row.ModuleTitle, row.Lesson.Title, row.Lesson.ContentBody);
            if (art == null) continue;
            db.LearningMaterials.Add(new LearningMaterial { Id = Id($"domain1-image-material:{row.Lesson.Id:D}"), LessonId = row.Lesson.Id, Title = art.Alt[..Math.Min(250, art.Alt.Length)], MaterialType = "LINK", ExternalUrl = $"platform-asset:{files[art.Image].Id:D}", SortOrder = 1, CreatedAt = now, UpdatedAt = now });
            addedMaterials++;
        }
        await db.SaveChangesAsync();
        if (apply)
        {
            foreach (var file in files.Values.DistinctBy(f => f.Id))
            {
                var destination = Path.GetFullPath(Path.Combine(root, file.Key));
                if (!destination.StartsWith(root.TrimEnd(Path.DirectorySeparatorChar) + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
                    throw new InvalidOperationException("Asset path escaped the configured root.");
                Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
                File.Copy(file.Path, destination, overwrite: true);
            }
            await tx.CommitAsync();
        }
        else await tx.RollbackAsync();
        Console.WriteLine($"{(apply ? "APPLIED" : "ROLLBACK")}: {files.Values.DistinctBy(f => f.Id).Count()} reviewed images, {addedBlocks} draft IMAGE blocks, {addedMaterials} Learning v2 media links. No publication; no enrollment changes.");
    }
}

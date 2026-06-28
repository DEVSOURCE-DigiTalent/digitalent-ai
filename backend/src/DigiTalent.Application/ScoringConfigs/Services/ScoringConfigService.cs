using DigiTalent.Application.Common.Interfaces;
using DigiTalent.Application.Common.Services;
using DigiTalent.Application.ScoringConfigs.DTOs;
using Microsoft.EntityFrameworkCore;

namespace DigiTalent.Application.ScoringConfigs.Services;

public class ScoringConfigService
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUserService _currentUser;
    private readonly AuditLogService _auditLog;

    public ScoringConfigService(
        IApplicationDbContext context,
        ICurrentUserService currentUser,
        AuditLogService auditLog)
    {
        _context = context;
        _currentUser = currentUser;
        _auditLog = auditLog;
    }

    /// <summary>
    /// List all scoring configs with their items.
    /// </summary>
    public async Task<List<ScoringConfigResponse>> GetAllAsync()
    {
        var configs = await _context.ScoringConfigs
            .Include(c => c.Items)
            .OrderByDescending(c => c.IsActive)
            .ThenBy(c => c.ConfigType)
            .ToListAsync();

        return configs.Select(MapToResponse).ToList();
    }

    /// <summary>
    /// Get a single scoring config by its config type key (e.g., "SKILL_GAP", "READINESS").
    /// </summary>
    public async Task<ScoringConfigResponse> GetByConfigTypeAsync(string configType)
    {
        var config = await _context.ScoringConfigs
            .Include(c => c.Items)
            .Where(c => c.ConfigType == configType && c.IsActive)
            .OrderByDescending(c => c.Version)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"No active scoring config found for '{configType}'.");

        return MapToResponse(config);
    }

    /// <summary>
    /// Update a scoring config and its items.
    /// </summary>
    public async Task<ScoringConfigResponse> UpdateAsync(string configKey, UpdateScoringConfigRequest request)
    {
        var config = await _context.ScoringConfigs
            .Include(c => c.Items)
            .Where(c => c.ConfigType == configKey)
            .OrderByDescending(c => c.Version)
            .FirstOrDefaultAsync()
            ?? throw new KeyNotFoundException($"Scoring config '{configKey}' not found.");

        var oldValuesJson = System.Text.Json.JsonSerializer.Serialize(new
        {
            config.Description,
            config.IsActive,
            Items = config.Items.Select(i => new { i.ComponentCode, i.Weight }).ToList(),
        });

        if (request.Description != null)
            config.Description = request.Description;
        if (request.IsActive.HasValue)
            config.IsActive = request.IsActive.Value;

        if (request.Items.Count > 0)
        {
            _context.ScoringConfigItems.RemoveRange(config.Items);

            var newItems = request.Items.Select(i => new DigiTalent.Domain.Entities.Shared.ScoringConfigItem
            {
                ScoringConfigId = config.Id,
                ComponentCode = i.ComponentCode,
                Weight = i.Weight,
                MinValue = i.MinValue,
                MaxValue = i.MaxValue,
                Notes = i.Notes,
            }).ToList();

            _context.ScoringConfigItems.AddRange(newItems);
        }

        await _context.SaveChangesAsync(default);

        await _auditLog.LogAsync(
            "SCORING_CONFIG_UPDATE", "ScoringConfig", config.Id,
            oldValuesJson: oldValuesJson,
            newValuesJson: System.Text.Json.JsonSerializer.Serialize(new
            {
                config.Description,
                config.IsActive,
                Items = request.Items.Select(i => new { i.ComponentCode, i.Weight }).ToList(),
            }));

        return MapToResponse(config);
    }

    private static ScoringConfigResponse MapToResponse(DigiTalent.Domain.Entities.Shared.ScoringConfig entity)
    {
        return new ScoringConfigResponse
        {
            Id = entity.Id,
            OrganizationId = entity.OrganizationId,
            ConfigType = entity.ConfigType,
            Version = entity.Version,
            IsActive = entity.IsActive,
            Description = entity.Description,
            Items = entity.Items.Select(i => new ScoringConfigItemResponse
            {
                Id = i.Id,
                ComponentCode = i.ComponentCode,
                Weight = i.Weight,
                MinValue = i.MinValue,
                MaxValue = i.MaxValue,
                Notes = i.Notes,
            }).ToList(),
        };
    }
}

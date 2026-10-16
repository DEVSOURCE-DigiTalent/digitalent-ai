using DigiTalent.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DigiTalent.Infrastructure.Persistence.Configurations;

/// <summary>Map ProctoringSession với bảng "proctoring_sessions" (canonical v3.3 §20.1).</summary>
public class ProctoringSessionConfiguration : IEntityTypeConfiguration<ProctoringSession>
{
    public void Configure(EntityTypeBuilder<ProctoringSession> builder)
    {
        builder.ToTable("proctoring_sessions", table =>
        {
            table.HasCheckConstraint("ck_proctoring_sessions_kind", "kind IN ('PRE_ASSESSMENT', 'FINAL')");
            table.HasCheckConstraint("ck_proctoring_sessions_status", "status IN ('RECORDING', 'SUBMITTED', 'ABANDONED')");
            table.HasCheckConstraint("ck_proctoring_sessions_ended",
                "(status = 'RECORDING' AND ended_at IS NULL) " +
                "OR (status <> 'RECORDING' AND ended_at IS NOT NULL AND ended_at >= started_at)");
            table.HasCheckConstraint("ck_proctoring_sessions_duration", "duration_ms IS NULL OR duration_ms >= 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Kind).HasMaxLength(20).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);

        builder.HasIndex(x => new { x.EmployeeId, x.CourseId })
            .HasDatabaseName("ix_proctoring_sessions_employee_course");
        builder.HasIndex(x => x.CourseId)
            .HasDatabaseName("ix_proctoring_sessions_course_id");
    }
}

/// <summary>Map ProctoringRecording với bảng "proctoring_recordings" (canonical v3.3 §20.2).</summary>
public class ProctoringRecordingConfiguration : IEntityTypeConfiguration<ProctoringRecording>
{
    public void Configure(EntityTypeBuilder<ProctoringRecording> builder)
    {
        builder.ToTable("proctoring_recordings", table =>
        {
            table.HasCheckConstraint("ck_proctoring_recordings_track", "track IN ('SCREEN', 'CAMERA')");
            table.HasCheckConstraint("ck_proctoring_recordings_segment_no", "segment_no BETWEEN 1 AND 50");
            table.HasCheckConstraint("ck_proctoring_recordings_offsets",
                "start_offset_ms >= 0 AND (end_offset_ms IS NULL OR end_offset_ms >= start_offset_ms)");
            table.HasCheckConstraint("ck_proctoring_recordings_size", "chunk_count >= 0 AND size_bytes >= 0");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Track).HasMaxLength(10).IsRequired();
        builder.Property(x => x.ContentType).HasMaxLength(100).IsRequired();
        builder.Property(x => x.DisplaySurface).HasMaxLength(20);
        builder.Property(x => x.StoragePath).HasMaxLength(500);
        builder.Property(x => x.ChunkCount).HasDefaultValue(0).IsConcurrencyToken();
        builder.Property(x => x.SizeBytes).HasDefaultValue(0L);

        builder.HasOne<ProctoringSession>().WithMany().HasForeignKey(x => x.SessionId);

        builder.HasIndex(x => new { x.SessionId, x.Track, x.SegmentNo })
            .IsUnique()
            .HasDatabaseName("uq_proctoring_recordings_session_track_segment");
    }
}

/// <summary>Map ProctoringEvent với bảng "proctoring_events" (canonical v3.3 §20.3).</summary>
public class ProctoringEventConfiguration : IEntityTypeConfiguration<ProctoringEvent>
{
    public void Configure(EntityTypeBuilder<ProctoringEvent> builder)
    {
        builder.ToTable("proctoring_events", table =>
        {
            table.HasCheckConstraint("ck_proctoring_events_kind",
                "kind IN ('STARTED', 'TAB_HIDDEN', 'FOCUS_LOST', 'SHARE_STOPPED', 'SHARE_RESUMED', " +
                "'CAMERA_STOPPED', 'CAMERA_RESUMED', 'MIC_STOPPED', 'MIC_RESUMED', 'SUBMITTED')");
            table.HasCheckConstraint("ck_proctoring_events_offsets",
                "offset_ms >= 0 AND (duration_ms IS NULL OR duration_ms >= 0)");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Kind).HasMaxLength(30).IsRequired();
        builder.Property(x => x.Detail).HasMaxLength(300);

        builder.HasOne<ProctoringSession>().WithMany().HasForeignKey(x => x.SessionId);

        builder.HasIndex(x => new { x.SessionId, x.OffsetMs })
            .HasDatabaseName("ix_proctoring_events_session_offset");
    }
}

/// <summary>Map CoursePreAssessment với bảng "course_pre_assessments" (canonical v3.3 §20.4).</summary>
public class CoursePreAssessmentConfiguration : IEntityTypeConfiguration<CoursePreAssessment>
{
    public void Configure(EntityTypeBuilder<CoursePreAssessment> builder)
    {
        builder.ToTable("course_pre_assessments", table =>
        {
            table.HasCheckConstraint("ck_course_pre_assessments_evidence", "char_length(evidence_text) BETWEEN 30 AND 8000");
            table.HasCheckConstraint("ck_course_pre_assessments_decision", "decision IS NULL OR decision IN ('PASSED', 'NOT_YET')");
            table.HasCheckConstraint("ck_course_pre_assessments_review_complete",
                "(decision IS NULL AND decision_reason IS NULL AND reviewed_by_user_id IS NULL AND reviewed_at IS NULL) " +
                "OR (decision IS NOT NULL AND char_length(decision_reason) >= 10 " +
                "AND reviewed_by_user_id IS NOT NULL AND reviewed_at IS NOT NULL)");
            table.HasCheckConstraint("ck_course_pre_assessments_reviewed_after_submit", "reviewed_at IS NULL OR reviewed_at >= submitted_at");
            table.HasCheckConstraint("ck_course_pre_assessments_enrollment", "enrollment_id IS NULL OR decision = 'PASSED'");
        });
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EvidenceText).IsRequired();
        builder.Property(x => x.Decision).HasMaxLength(20);

        builder.HasOne<Employee>().WithMany().HasForeignKey(x => x.EmployeeId);
        builder.HasOne<Course>().WithMany().HasForeignKey(x => x.CourseId);
        builder.HasOne<ProctoringSession>().WithMany().HasForeignKey(x => x.ProctoringSessionId);
        builder.HasOne<User>().WithMany().HasForeignKey(x => x.ReviewedByUserId);
        builder.HasOne<Enrollment>().WithMany().HasForeignKey(x => x.EnrollmentId);

        builder.HasIndex(x => new { x.EmployeeId, x.CourseId })
            .IsUnique()
            .HasDatabaseName("uq_course_pre_assessments_employee_course");
        builder.HasIndex(x => x.ProctoringSessionId)
            .IsUnique()
            .HasFilter("proctoring_session_id IS NOT NULL")
            .HasDatabaseName("uq_course_pre_assessments_session");
        builder.HasIndex(x => x.CourseId)
            .HasDatabaseName("ix_course_pre_assessments_course_id");
        builder.HasIndex(x => x.SubmittedAt)
            .HasFilter("decision IS NULL")
            .HasDatabaseName("ix_course_pre_assessments_pending");
        builder.HasIndex(x => x.ReviewedByUserId)
            .HasDatabaseName("ix_course_pre_assessments_reviewed_by_user_id");
        builder.HasIndex(x => x.EnrollmentId)
            .HasDatabaseName("ix_course_pre_assessments_enrollment_id");
    }
}

-- ============================================================================
-- DigiTalent AI — Canonical Database Schema v3.8
-- Target: PostgreSQL 16+
-- Source: DigiTalent_AI_Canonical_v3_7.sql + cờ câu trắc nghiệm cuối khóa của giáo trình
--
-- This file is the SINGLE SOURCE OF TRUTH for the data model in v3.8.
-- EF Core configurations and migrations are written to match it (migration AddFinalQuizQuestionFlag).
--
-- Changes v3.7 -> v3.8:
--   * platform_module_questions.is_final_quiz, questions.is_final_quiz: câu thuộc bài trắc nghiệm cuối khóa của giáo trình
--     6 lĩnh vực (20 câu mỗi khóa). Hệ thống không có ngân hàng riêng cho bài này, nên khi nạp giáo trình (catalog v6) các
--     câu được chia vào mô đun có nội dung khớp nhất, chung với 10 câu ôn tập của mô đun; cờ giữ lại nguồn gốc của câu.
--     Bản nháp catalog chép cờ từ bản đang dùng, công bố chép cờ sang câu hỏi của từng tổ chức.
--   * Bài khảo sát dùng thử rút câu cuối khóa trước câu ôn tập: câu tình huống bao quát cả khóa, không dựa vào nhân vật
--     của bài học mà người làm khảo sát chưa đọc. Ôn tập mô đun và bài cuối khóa có giám sát chưa đổi.
--   * Dữ liệu đã có được đánh dấu bằng md5(câu hỏi ‹US› các phương án xếp theo byte nối bằng ‹RS› ‹US› phương án đúng) của
--     360 câu cuối khóa (danh sách trong migration). So cả phương án vì giáo trình có câu ôn tập trùng chữ câu hỏi với câu
--     cuối khóa nhưng khác phương án. M2-A mô đun 6 có một câu ôn tập giống hệt câu cuối khóa số 17, nên được đánh dấu cả
--     hai: mỗi bản catalog và mỗi tổ chức có 361 dòng.
-- ============================================================================

BEGIN;

ALTER TABLE platform_module_questions ADD COLUMN is_final_quiz boolean NOT NULL DEFAULT false;
ALTER TABLE questions ADD COLUMN is_final_quiz boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN platform_module_questions.is_final_quiz IS
    'Câu của bài trắc nghiệm cuối khóa trong giáo trình, được xếp vào mô đun có nội dung khớp nhất.';
COMMENT ON COLUMN questions.is_final_quiz IS
    'Chép từ platform_module_questions.is_final_quiz khi công bố catalog.';

COMMIT;

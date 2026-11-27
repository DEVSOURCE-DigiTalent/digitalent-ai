import { AlertTriangle, CheckCircle2, CircleDashed, CircleHelp, Loader2, Plus, ShieldCheck, Sparkles, Wand2, XCircle } from 'lucide-react';
import type { ContentOutcomeStatus, ModuleContentCheck, PageReviewStatus } from '@/services/content-ai.service';
import type { CatalogBlock } from '@/services/platform-catalog.service';
import type { ModuleAi } from './use-module-ai';
import './module-ai-panel.css';

export { moduleAiInput, textPages, useModuleAi } from './use-module-ai';

const VERDICT: Record<ModuleContentCheck['verdict'], { label: string; tone: string }> = {
  DAT: { label: 'Đạt yêu cầu', tone: 'ok' },
  CAN_SUA: { label: 'Cần sửa', tone: 'warn' },
  CHUA_DAT: { label: 'Chưa đạt', tone: 'bad' },
};

const STATUS: Record<ContentOutcomeStatus, { label: string; tone: string; Icon: typeof CheckCircle2 }> = {
  MET: { label: 'Đạt', tone: 'ok', Icon: CheckCircle2 },
  PARTIAL: { label: 'Sơ sài', tone: 'warn', Icon: CircleDashed },
  MISSING: { label: 'Thiếu', tone: 'bad', Icon: XCircle },
  UNCHECKED: { label: 'AI chưa xét', tone: 'muted', Icon: CircleHelp },
};

const PAGE: Record<PageReviewStatus, { label: string; tone: string; Icon: typeof CheckCircle2 }> = {
  PROBLEM: { label: 'Cần sửa', tone: 'bad', Icon: XCircle },
  WEAK: { label: 'Còn sơ sài', tone: 'warn', Icon: AlertTriangle },
  OK: { label: 'Ổn', tone: 'ok', Icon: CheckCircle2 },
};

const ISSUE: Record<string, string> = {
  SAI_KIEN_THUC: 'Sai kiến thức',
  LAC_DE: 'Lạc đề',
  VUOT_MUC: 'Vượt mức',
  THIEU_VI_DU: 'Thiếu ví dụ',
  KHO_HIEU: 'Khó hiểu',
};

/** The AI sometimes numbers its pages ("Trang 4: …"); the builder numbers them itself. */
function pageTitle(title: string): string {
  return title.replace(/^\s*trang\s*\d+\s*[:.\-–]\s*/i, '').trim();
}

/**
 * "Trợ lý soạn nội dung theo Thông tư 02" at the top of a module (admin catalog draft and company R&D draft alike):
 * the two actions, the verdict with the checklist of the Circular's requirements and the AI's suggestions. The notes
 * of each page sit under the page itself (<see cref="BlockAiNote"/>), the question flags under each question.
 */
export function ModuleAiPanel({ ai, editable, moduleId }: { ai: ModuleAi; editable: boolean; moduleId: string }) {
  const { busy, check, suggestion } = ai;
  const competency = (check ?? suggestion)?.competencies;
  const flaggedPages = check ? [...ai.pageOf.values()].filter((p) => p.status !== 'OK').length : 0;
  const counts = check?.outcomes.reduce<Record<string, number>>((acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }), {});

  return (
    <section className="ai-panel" aria-labelledby={`ai-panel-${moduleId}`}>
      <header className="ai-panel__head">
        <div>
          <h3 id={`ai-panel-${moduleId}`}><Sparkles size={16} aria-hidden="true" />Trợ lý soạn nội dung theo Thông tư 02</h3>
          <p>
            {competency?.length === 1
              ? `Năng lực ${competency[0].code} ${competency[0].name} · mức ${competency[0].levelName} (bậc ${competency[0].bac})`
              : 'Kiểm tra để AI đánh dấu từng trang và từng câu hỏi ngay trong mô-đun. AI chỉ gợi ý, bạn quyết định.'}
          </p>
        </div>
        <div className="ai-panel__actions">
          {editable && (
            <button type="button" className="btn btn-ghost btn-small" onClick={() => void ai.runSuggest()} disabled={busy !== null}>
              {busy === 'suggest' ? <Loader2 size={14} className="ai-spin" aria-hidden="true" /> : <Sparkles size={14} aria-hidden="true" />}
              Gợi ý bằng AI
            </button>
          )}
          <button type="button" className="btn btn-primary btn-small" onClick={() => void ai.runCheck()} disabled={busy !== null}>
            {busy === 'check' ? <Loader2 size={14} className="ai-spin" aria-hidden="true" /> : <ShieldCheck size={14} aria-hidden="true" />}
            {check ? 'Kiểm tra lại' : 'Kiểm tra theo Thông tư'}
          </button>
        </div>
      </header>

      {busy && <p className="ai-panel__wait" role="status">AI đang đọc mô-đun và yêu cầu của Thông tư… thường mất 10–40 giây.</p>}

      {check && (
        <div className="ai-result" aria-label="Kết quả kiểm tra">
          <p className="ai-verdict" data-tone={VERDICT[check.verdict]?.tone}>
            <strong>{VERDICT[check.verdict]?.label ?? check.verdict}</strong>
            {check.summary && <span>{check.summary}</span>}
          </p>
          <p className="ai-legend">
            {flaggedPages > 0
              ? `${flaggedPages} trang cần xem lại${check.questionProblems.length ? `, ${check.questionProblems.length} câu hỏi cần sửa` : ''}: dải màu nằm ngay dưới từng trang và từng câu.`
              : check.questionProblems.length
                ? `${check.questionProblems.length} câu hỏi cần sửa: xem dải đỏ dưới từng câu.`
                : 'Các trang đều ổn theo AI.'}
          </p>

          <details className="ai-details">
            <summary>
              Yêu cầu của Thông tư ({check.outcomes.length})
              <span className="ai-counts">
                {(['MET', 'PARTIAL', 'MISSING'] as const).filter((s) => counts?.[s]).map((s) => (
                  <span key={s} data-tone={STATUS[s].tone}>{STATUS[s].label} {counts?.[s]}</span>
                ))}
              </span>
            </summary>
            <ul className="ai-outcomes">
              {check.outcomes.map((o) => {
                const s = STATUS[o.status] ?? STATUS.UNCHECKED;
                return (
                  <li key={o.id} data-tone={s.tone}>
                    <s.Icon size={16} aria-hidden="true" />
                    <div>
                      <p><span className="ai-tag">{s.label}</span> Bậc {o.bac} · {o.text}</p>
                      {o.evidence && <small>{o.evidence}</small>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </details>

          {(check.issues.length > 0 || check.suggestions.length > 0) && (
            <details className="ai-details">
              <summary>Vấn đề và gợi ý sửa ({check.issues.length + check.suggestions.length})</summary>
              {check.issues.length > 0 && (
                <ul className="ai-plain">{check.issues.map((i, n) => <li key={n}><strong>{ISSUE[i.kind] ?? i.kind}:</strong> {i.detail}</li>)}</ul>
              )}
              {check.suggestions.length > 0 && (
                <ul className="ai-plain">{check.suggestions.map((s, n) => <li key={n}>{s}</li>)}</ul>
              )}
            </details>
          )}
        </div>
      )}

      {suggestion && (
        <details className="ai-details ai-suggestions" open aria-label="Gợi ý của AI">
          <summary>Gợi ý của AI: {suggestion.lessons.length} trang · {suggestion.questions.length} câu hỏi</summary>
          {suggestion.note && <p className="ai-note">{suggestion.note}</p>}
          {suggestion.lessons.map((lesson, n) => {
            const key = `l${n}`;
            return (
              <article key={key} className="ai-suggest">
                <div className="ai-suggest__head">
                  <h4>Trang gợi ý: {pageTitle(lesson.title) || `Trang ${n + 1}`}</h4>
                  <button type="button" className="btn btn-ghost btn-small" disabled={!editable || ai.added.has(key)} onClick={() => void ai.addLesson(key, lesson.html)}>
                    <Plus size={14} aria-hidden="true" />{ai.added.has(key) ? 'Đã thêm' : 'Thêm thành trang mới'}
                  </button>
                </div>
                {/* The server cleaned this HTML with the same sanitizer as the TEXT blocks. */}
                <div className="ai-html" dangerouslySetInnerHTML={{ __html: lesson.html }} />
              </article>
            );
          })}
          {suggestion.questions.length > 0 && (
            <ol className="ai-questions">
              {suggestion.questions.map((q, n) => {
                const key = `q${n}`;
                return (
                  <li key={key}>
                    <p>{q.text}</p>
                    <ul>{q.options.map((o, i) => <li key={i} data-correct={o.isCorrect || undefined}>{String.fromCharCode(65 + i)}. {o.text}{o.isCorrect ? ' ✓' : ''}</li>)}</ul>
                    {q.explanation && <small>{q.explanation}</small>}
                    <button type="button" className="btn btn-ghost btn-small" disabled={!editable || ai.added.has(key)} onClick={() => void ai.addQuestion(key, q)}>
                      <Plus size={14} aria-hidden="true" />{ai.added.has(key) ? 'Đã thêm' : 'Thêm vào câu hỏi ôn tập'}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </details>
      )}
    </section>
  );
}

/**
 * Under a text page, once the module was checked: red (wrong / off topic), amber (thin) or green (fine), what to
 * fix, which requirements the page meets, and "Viết lại bằng AI" with the new version to compare and keep or not.
 */
export function BlockAiNote({ ai, block, editable }: { ai: ModuleAi; block: CatalogBlock; editable: boolean }) {
  if (!ai.check || block.type !== 'TEXT') return null;
  const review = ai.pageOf.get(block.blockId);
  const rewrite = ai.rewrites.get(block.blockId);
  const outcomes = new Map(ai.check.outcomes.map((o) => [o.id, o]));

  if (rewrite?.state === 'replaced') {
    return (
      <div className="ai-note-strip" data-tone="ok" role="note">
        <p className="ai-note-strip__title"><CheckCircle2 size={15} aria-hidden="true" />AI · Đã thay trang bằng bản AI. Bấm "Kiểm tra lại" để chấm lại.</p>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="ai-note-strip" data-tone="muted" role="note">
        <p className="ai-note-strip__title"><CircleHelp size={15} aria-hidden="true" />AI chưa xét trang này (trang mới thêm sau lần kiểm tra?)</p>
      </div>
    );
  }

  const page = PAGE[review.status] ?? PAGE.WEAK;
  return (
    <div className="ai-note-strip" data-tone={page.tone} role="note" aria-label={`AI nhận xét trang ${review.number}`}>
      <div className="ai-note-strip__head">
        <p className="ai-note-strip__title"><page.Icon size={15} aria-hidden="true" />AI · Trang {review.number}: {page.label}</p>
        {editable && review.status !== 'OK' && rewrite?.state !== 'ready' && (
          <button type="button" className="btn btn-ghost btn-small" disabled={rewrite?.state === 'loading'} onClick={() => void ai.rewritePage(block.blockId)}>
            {rewrite?.state === 'loading' ? <Loader2 size={14} className="ai-spin" aria-hidden="true" /> : <Wand2 size={14} aria-hidden="true" />}
            {rewrite?.state === 'loading' ? 'AI đang viết lại…' : 'Viết lại bằng AI'}
          </button>
        )}
      </div>
      {review.notes.length > 0 && <ul className="ai-plain">{review.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>}
      {review.covers.length > 0 && (
        <p className="ai-covers">
          Đáp ứng:{' '}
          {review.covers.map((id) => {
            const o = outcomes.get(id);
            return <span key={id} title={o?.text}>{o ? `Bậc ${o.bac} · ${o.text.slice(0, 48)}${o.text.length > 48 ? '…' : ''}` : id}</span>;
          })}
        </p>
      )}
      {rewrite?.state === 'ready' && (
        <div className="ai-rewrite">
          <p className="ai-rewrite__label"><Wand2 size={14} aria-hidden="true" />Bản AI viết lại{rewrite.page.title ? `: ${pageTitle(rewrite.page.title)}` : ''}</p>
          {rewrite.page.note && <p className="ai-note">{rewrite.page.note}</p>}
          <div className="ai-html" dangerouslySetInnerHTML={{ __html: rewrite.page.html }} />
          <div className="ai-rewrite__actions">
            <button type="button" className="btn btn-primary btn-small" onClick={() => void ai.replacePage(block.blockId)}>Thay trang này bằng bản AI</button>
            <button type="button" className="btn btn-ghost btn-small" onClick={() => ai.discardRewrite(block.blockId)}>Giữ bản cũ</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Under a review question the AI flagged in the last check. */
export function QuestionAiFlag({ problem }: { problem: string }) {
  return (
    <p className="ai-note-strip ai-note-strip--question" data-tone="bad" role="note">
      <AlertTriangle size={14} aria-hidden="true" /><span><strong>AI:</strong> {problem}</span>
    </p>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, HandMetal, Plus, ScanLine, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { signDictionaryKeys, useSignGlosses, useSignGlossSummary } from '@/hooks/use-sign-dictionary';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { SIGN_KIND_LABELS, signDictionaryService, type SignGloss, type SignGlossKind } from '@/services/sign-dictionary.service';
import { errorMessage } from '../components/pulse-format';
import { Footer, LoadError } from '../components/pulse-ui';
import { ProgressMeter } from '@/features/sign-language/ProgressMeter';
import { usePhaseStart } from '@/features/sign-language/use-phase-start';
import type { BatchProgressView } from '@/features/sign-language/batch-motion';
import { percentOf } from '@/lib/progress';
import { SignGlossEditor } from './SignGlossEditor';
import { SignImportDialog } from './SignImportDialog';
import { SIGN_VIEWS, isSignView, signMeta, signProgress, viewQuery, type SignView } from './sign-labels';
import './sign-dictionary.css';

const PAGE_SIZE = 50;
/** Where a sign with a video stands (signProgress().done), in the words of the tabs. */
const STEP_CHIPS: Record<number, string> = { 1: 'Cần chuyển động', 2: 'Chờ xuất bản', 3: 'Đã xuất bản' };


/**
 * PA-18 Từ điển ký hiệu (docs/specs/2026-11-24-sign-language-avatar.md): the signs the 3D avatar can make. Each sign
 * goes video → motion (taken in the browser) → checked on the avatar and published; the tabs follow those steps. The
 * selected tab and sign are in the address (?view=, ?sign=), ?new=<text> opens a new sign (from a lesson's sign map).
 */
export function SignDictionaryPage() {
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const [params, setParams] = useSearchParams();
  const view: SignView = isSignView(params.get('view')) ? (params.get('view') as SignView) : 'ALL';
  const selectedId = params.get('sign');
  const newGloss = params.get('new')?.trim() || undefined;

  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<SignGlossKind | ''>('');
  const [pageIndex, setPageIndex] = useState(1);
  const [creating, setCreating] = useState(Boolean(newGloss) && canManage);
  const [importing, setImporting] = useState(false);
  const list = useSignGlosses({ ...viewQuery(view), search, kind, pageIndex, pageSize: PAGE_SIZE });
  const summary = useSignGlossSummary(search, kind);
  const page = list.data;
  const queryClient = useQueryClient();
  const [taking, setTaking] = useState<BatchProgressView | null>(null);
  const takingStart = usePhaseStart(taking?.phase ?? null);
  const abortRef = useRef<AbortController | null>(null);
  useEffect(() => () => abortRef.current?.abort(), []);
  // The 3D library (three.js) is fetched as soon as the page opens: its download cannot report a percent, the model
  // download after it can, so opening a sign then only waits for what shows its progress.
  useEffect(() => { void import('@/features/sign-language/SignAvatarView').catch(() => undefined); }, []);

  // Typing filters the list after a short pause (no Enter needed).
  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchText.trim()); setPageIndex(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const setParam = (changes: Record<string, string | null>) => setParams((current) => {
    const next = new URLSearchParams(current);
    for (const [key, value] of Object.entries(changes)) {
      if (value == null) next.delete(key);
      else next.set(key, value);
    }
    return next;
  }, { replace: true });
  const select = (id: string | null) => { setCreating(false); setParam({ sign: id, new: null }); };
  const openView = (next: SignView) => { setPageIndex(1); setParam({ view: next === 'ALL' ? null : next }); };

  /** Every sign with a usable video and no motion: the motion is taken here, one sign after the other, and saved. */
  const takeAllMotions = async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    setTaking({ phase: 'find', label: 'Tìm các ký hiệu có video nhưng chưa có chuyển động', detail: '', percent: 0 });
    try {
      const { batchProgressView, canTakeMotion, takeMotions } = await import('@/features/sign-language/batch-motion');
      const signs: SignGloss[] = [];
      for (let index = 1; index <= 20; index += 1) {
        const result = await signDictionaryService.list({ stage: 'NEEDS_MOTION', pageIndex: index, pageSize: 100 });
        signs.push(...result.items.filter(canTakeMotion));
        setTaking({ phase: 'find', label: 'Tìm các ký hiệu có video nhưng chưa có chuyển động', detail: `Trang ${index}/${Math.max(1, result.totalPages)}`, percent: percentOf(index, Math.max(1, result.totalPages)) });
        if (index >= result.totalPages) break;
      }
      if (signs.length === 0) {
        toast.info('Các ký hiệu này chưa ghi đủ nguồn, giấy phép và sự đồng ý nên chưa lấy chuyển động được.');
        return;
      }
      const result = await takeMotions(signs, {
        signal: controller.signal,
        onProgress: (p) => setTaking(batchProgressView(p)),
      });
      await queryClient.invalidateQueries({ queryKey: signDictionaryKeys.all });
      if (result.saved.length > 0) toast.success(`Đã lấy chuyển động cho ${result.saved.length} ký hiệu. Xem lại trên nhân vật trước khi xuất bản.`);
      if (result.failed.length > 0) toast.warning(`Chưa lấy được ${result.failed.length} ký hiệu: ${result.failed.slice(0, 3).map((f) => `“${f.gloss}” (${f.reason})`).join(', ')}.`);
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') toast.info('Đã dừng lấy chuyển động.');
      else toast.error(errorMessage(err));
    } finally {
      abortRef.current = null;
      setTaking(null);
    }
  };

  const counts = summary.data;
  const filtered = Boolean(search || kind);
  const needsMotion = counts?.needsMotion ?? 0;

  return (
    <div className={`pa-ov-stage pa-sd${list.isFetching ? ' is-refreshing' : ''}`}>
      <header className="pa-sd-head">
        <div>
          <h1>Từ điển ký hiệu</h1>
          <p>Ký hiệu để nhân vật 3D ra dấu trong video bài giảng.</p>
        </div>
        {canManage && (
          <div className="pa-sd-head-actions">
            <button type="button" className="btn btn-outline btn-small" onClick={() => { setCreating(true); setParam({ sign: null }); }}>
              <Plus size={15} aria-hidden="true" /> Thêm ký hiệu
            </button>
            <button type="button" className="btn btn-primary btn-small" onClick={() => setImporting(true)}>
              <Upload size={15} aria-hidden="true" /> Nhập video
            </button>
          </div>
        )}
      </header>

      <nav className="pa-sd-tabs" aria-label="Lọc theo bước">
        {SIGN_VIEWS.map((tab) => (
          <button key={tab.id} type="button" aria-pressed={view === tab.id} onClick={() => openView(tab.id)}>
            {tab.label}
            {counts && <span className="pa-sd-count">{tab.count(counts).toLocaleString('vi-VN')}</span>}
          </button>
        ))}
      </nav>

      <div className="pa-sd-layout">
        <section className="pa-sd-list" aria-label="Danh sách ký hiệu">
          <div className="pa-sd-tools" role="search">
            <label className="pa-sd-search">
              <Search size={16} aria-hidden="true" />
              <input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Tìm ký hiệu" aria-label="Tìm ký hiệu" />
            </label>
            <select value={kind} onChange={(e) => { setKind(e.target.value as SignGlossKind | ''); setPageIndex(1); }} aria-label="Loại ký hiệu">
              <option value="">Mọi loại</option>
              {(Object.keys(SIGN_KIND_LABELS) as SignGlossKind[]).map((value) => <option key={value} value={value}>{SIGN_KIND_LABELS[value]}</option>)}
            </select>
          </div>

          {view === 'NEEDS_MOTION' && canManage && (needsMotion > 0 || taking) && (
            <div className="pa-sd-batch">
              {taking ? (
                <ProgressMeter
                  className="pa-sd-batch-meter"
                  label={taking.label}
                  percent={taking.percent}
                  detail={taking.detail}
                  startedAt={takingStart}
                  onStop={() => abortRef.current?.abort()}
                />
              ) : (
                <>
                  <span className="pa-sd-batch-text">Lấy chuyển động từ video của cả {needsMotion} ký hiệu, ngay trên trình duyệt.</span>
                  <button type="button" className="btn btn-primary btn-small" onClick={() => void takeAllMotions()}>
                    <ScanLine size={15} aria-hidden="true" /> Lấy tất cả
                  </button>
                </>
              )}
            </div>
          )}

          {list.isError && <LoadError error={list.error} />}
          {list.isLoading && <div className="pa-sd-none" role="status"><p>Đang tải danh sách ký hiệu…</p></div>}
          {page && page.items.length === 0 && (
            <div className="pa-sd-none">
              <p>{filtered ? 'Không có ký hiệu khớp tìm kiếm.' : 'Chưa có ký hiệu nào ở bước này.'}</p>
            </div>
          )}
          {page && page.items.length > 0 && (
            <ul className="pa-sd-rows">
              {page.items.map((gloss) => {
                const progress = signProgress(gloss);
                const meta = signMeta(gloss);
                const current = gloss.id === selectedId && !creating;
                return (
                  <li key={gloss.id}>
                    <button
                      type="button"
                      className={`pa-sd-row${current ? ' is-selected' : ''}`}
                      aria-current={current ? 'true' : undefined}
                      onClick={() => select(gloss.id)}
                    >
                      <span className="pa-sd-row-text">
                        <span className="pa-sd-gloss">{gloss.gloss}</span>
                        {meta && <span className="pa-sd-meta">{meta}</span>}
                      </span>
                      {/* Each tab already names its step: the step is only shown in "Tất cả", and only once a sign has one. */}
                      {view === 'ALL' && progress.done > 0 && (
                        <span className={`pa-sd-stage is-${progress.done}`} title={progress.label}>{STEP_CHIPS[progress.done]}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {page && page.totalItems > 0 && (
            <footer className="pa-sd-pager">
              <span>{page.totalItems.toLocaleString('vi-VN')} ký hiệu</span>
              {page.totalPages > 1 && (
                <span className="pa-sd-pages">
                  <button type="button" className="pa-sd-icon" disabled={page.pageIndex <= 1} onClick={() => setPageIndex(page.pageIndex - 1)} aria-label="Trang trước">
                    <ChevronLeft size={16} aria-hidden="true" />
                  </button>
                  {page.pageIndex}/{page.totalPages}
                  <button type="button" className="pa-sd-icon" disabled={page.pageIndex >= page.totalPages} onClick={() => setPageIndex(page.pageIndex + 1)} aria-label="Trang sau">
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </span>
              )}
            </footer>
          )}
        </section>

        <section className="pa-sd-panel" aria-label="Chi tiết ký hiệu">
          {creating || selectedId ? (
            <SignGlossEditor
              key={creating ? 'new' : selectedId}
              glossId={creating ? null : selectedId}
              canManage={canManage}
              initialGloss={creating ? newGloss : undefined}
              onCreated={(gloss) => select(gloss.id)}
              onArchived={() => select(null)}
              onCancel={creating ? () => { setCreating(false); setParam({ new: null }); } : undefined}
            />
          ) : (
            <div className="pa-sd-welcome">
              <span className="pa-sd-welcome-icon"><HandMetal size={26} aria-hidden="true" /></span>
              <h2>Chọn một ký hiệu để bắt đầu</h2>
              <ol className="pa-sd-flow">
                <li><b>1</b>Tải video người ra dấu</li>
                <li><b>2</b>Lấy chuyển động từ video</li>
                <li><b>3</b>Xem nhân vật ra dấu, xuất bản</li>
              </ol>
              <p>Chỉ dùng video mà bên sở hữu đã cho phép, và ghi nguồn, giấy phép cho từng ký hiệu.</p>
            </div>
          )}
        </section>
      </div>

      {importing && <SignImportDialog onClose={() => setImporting(false)} />}
      <Footer />
    </div>
  );
}

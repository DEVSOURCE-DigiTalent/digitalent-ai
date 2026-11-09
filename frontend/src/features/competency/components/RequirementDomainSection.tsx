import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import { levelWithTier } from '@/lib/competency-levels';
import {
  NOT_REQUIRED,
  domainTargetLevel,
  requiredRows,
  CORE_COMPETENCY_CODES,
  type DomainGroup,
  type DomainRow,
} from '../utils/requirement-domains';

export interface EditableRequirementRow extends DomainRow {
  tempId: string;
}

type EditableField = 'weightPercent' | 'isMandatory' | 'requiresPracticalEvidence' | 'note';

interface RequirementDomainSectionProps {
  group: DomainGroup<EditableRequirementRow>;
  canEdit: boolean;
  searchQuery?: string;
  onRowChange: (competencyId: string, field: EditableField, value: number | boolean | string) => void;
  onRowLevelChange: (competencyId: string, level: number) => void;
  onApplyDomainLevel: (categoryId: string, level: number) => void;
}

const levelOptionLabel = (level: number) => (level === NOT_REQUIRED ? 'Không yêu cầu' : levelWithTier(level));

export function RequirementDomainSection({
  group,
  canEdit,
  searchQuery = '',
  onRowChange,
  onRowLevelChange,
  onApplyDomainLevel,
}: RequirementDomainSectionProps) {
  useUiLanguage();
  const [openNotes, setOpenNotes] = useState<Record<string, boolean>>({});

  const toggleNote = (id: string) => {
    setOpenNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const required = requiredRows(group.rows);
  const currentDomainLevel = domainTargetLevel(group.rows);
  const subtotal = Math.round(required.reduce((sum, r) => sum + (Number(r.weightPercent) || 0), 0) * 100) / 100;
  const domainName = group.domain.name;

  // Filter rows if searchQuery is set
  const filteredRows = group.rows.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchName = (row.competencyName || '').toLowerCase().includes(q);
    const matchCode = (row.frameworkCode || row.competencyCode || '').toLowerCase().includes(q);
    return matchName || matchCode;
  });

  if (filteredRows.length === 0 && searchQuery.trim()) {
    return null;
  }

  return (
    <section className="pr-domain rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs space-y-4 transition-all">
      {/* ── Domain Header: Tiêu đề miền, chỉ số tổng, nút áp nhanh cả miền ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 font-black text-base border border-emerald-200 shrink-0">
            {group.domain.sortOrder || 'M'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-[-0.02em] text-slate-800">
                {domainName}
              </h3>
              {currentDomainLevel > 0 && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                  Giới hạn áp dụng: {levelOptionLabel(currentDomainLevel)}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500">
              {required.length}/{group.rows.length} năng lực áp dụng · <b>{subtotal}%</b> trọng số miền
            </span>
          </div>
        </div>

        {/* ── Nút áp dụng nhanh cả miền (1 chạm) ── */}
        {canEdit && (
          <div
            role="group"
            aria-label={`Áp mức cho cả miền ${domainName}`}
            className="flex items-center gap-1.5 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-200/80"
          >
            <span aria-hidden="true" className="text-[10px] font-bold text-slate-400 px-1.5 uppercase tracking-wider">
              Áp cả miền:
            </span>
            <button
              type="button"
              onClick={() => onApplyDomainLevel(group.domain.categoryId, 0)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Bỏ qua
            </button>
            <button
              type="button"
              onClick={() => onApplyDomainLevel(group.domain.categoryId, 1)}
              className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200 cursor-pointer"
            >{translateUi("Cơ bản")}</button>
            <button
              type="button"
              onClick={() => onApplyDomainLevel(group.domain.categoryId, 2)}
              className="px-2.5 py-1 text-[11px] font-semibold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors border border-teal-200 cursor-pointer"
            >{translateUi("Trung cấp")}</button>
            <button
              type="button"
              onClick={() => onApplyDomainLevel(group.domain.categoryId, 3)}
              className="px-2.5 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer"
            >{translateUi("Nâng cao")}</button>
          </div>
        )}
      </div>

      {/* ── Danh sách từng năng lực trong miền (Thẻ gọn gàng, nút bấm phân cấp 1-chạm) ── */}
      <div className="space-y-2.5 pt-1">
        {filteredRows.map((row) => {
          const isRequired = row.requiredLevel > NOT_REQUIRED;
          const isCore = !!row.frameworkCode && CORE_COMPETENCY_CODES.includes(row.frameworkCode);
          const isNoteOpen = openNotes[row.competencyId] || Boolean(row.note?.trim());
          // Accessible name of the row's controls: framework code and competency name.
          const rowName = `${row.frameworkCode || row.competencyCode} ${row.competencyName}`;

          return (
            <div
              key={row.tempId}
              className={`pr-row rounded-xl border p-4 transition-all ${
                isRequired
                  ? 'border-slate-200/80 bg-white shadow-2xs hover:border-emerald-300'
                  : 'border-slate-200/50 bg-slate-50/50 opacity-75 hover:opacity-100'
              }`}
            >
              <div className="pr-row-main flex flex-col xl:flex-row xl:items-center justify-between gap-3">
                {/* Cột 1: Mã chuẩn & Tên năng lực */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                        isRequired
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {row.frameworkCode || row.competencyCode}
                    </span>
                    <span className={`text-sm sm:text-[15px] font-semibold leading-snug ${isRequired ? 'text-slate-800' : 'text-slate-500'}`}>
                      {row.competencyName}
                    </span>
                    {isCore && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                        <ShieldCheck className="size-3" />
                        Cốt lõi bắt buộc
                      </span>
                    )}
                  </div>
                </div>

                {/* Cột 2: Chọn mức năng lực dạng Segmented Button (1 chạm chuyển ngay) */}
                <div
                  role="group"
                  aria-label={`Trình độ yêu cầu của ${rowName}`}
                  className="pr-level-selector inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/60 shrink-0 select-none"
                >
                  {[
                    { level: 0, label: 'Bỏ qua' },
                    { level: 1, label: 'Cơ bản (1–2)' },
                    { level: 2, label: 'Trung cấp (3–4)' },
                    { level: 3, label: 'Nâng cao (5–6)' },
                  ].map((opt) => {
                    const isSelected = row.requiredLevel === opt.level;
                    return (
                      <button
                        key={opt.level}
                        type="button"
                        onClick={() => onRowLevelChange(row.competencyId, opt.level)}
                        disabled={!canEdit}
                        aria-pressed={isSelected}
                        className={`rounded-lg px-2.5 sm:px-3 py-2 text-[13px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? opt.level === 0
                              ? 'bg-white text-slate-700 shadow-2xs font-bold border border-slate-200/80'
                              : opt.level === 1
                              ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                              : opt.level === 2
                              ? 'bg-teal-600 text-white shadow-2xs font-bold'
                              : 'bg-amber-600 text-white shadow-2xs font-bold'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/60'
                        }`}
                      >
                        {translateUi(opt.label)}
                      </button>
                    );
                  })}
                </div>

                {/* Cột 3: Trọng số & Tùy chọn Bắt buộc / Minh chứng / Ghi chú */}
                <div className="pr-row-actions flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Trọng số */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500">Trọng số:</span>
                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={row.weightPercent}
                        aria-label={`Trọng số của ${rowName}`}
                        onChange={(e) => onRowChange(row.competencyId, 'weightPercent', Number(e.target.value))}
                        disabled={!canEdit || !isRequired}
                        className="w-18 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm font-bold text-slate-800 text-right focus:border-emerald-600 focus:outline-hidden disabled:bg-slate-100 disabled:text-slate-400"
                      />
                      <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Toggle Bắt buộc */}
                  <button
                    type="button"
                    onClick={() => !isCore && onRowChange(row.competencyId, 'isMandatory', !row.isMandatory)}
                    disabled={!canEdit || !isRequired || isCore}
                    aria-pressed={row.isMandatory}
                    aria-label={`Bắt buộc: ${rowName}`}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                      row.isMandatory
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                    title={translateUi(isCore ? 'Năng lực cốt lõi luôn bắt buộc' : 'Bấm để chuyển đổi bắt buộc / tùy chọn')}
                  >
                    {row.isMandatory ? '✓ Bắt buộc' : translateUi('Tùy chọn')}
                  </button>

                  {/* Toggle Cần minh chứng thực tế */}
                  <button
                    type="button"
                    onClick={() => onRowChange(row.competencyId, 'requiresPracticalEvidence', !row.requiresPracticalEvidence)}
                    disabled={!canEdit || !isRequired}
                    aria-pressed={row.requiresPracticalEvidence}
                    aria-label={`Cần minh chứng thực tế: ${rowName}`}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold border transition-all cursor-pointer ${
                      row.requiresPracticalEvidence
                        ? 'bg-blue-50 text-blue-800 border-blue-300 font-bold'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                    }`}
                    title="Bấm để bật/tắt yêu cầu nộp minh chứng thực tế"
                  >
                    {row.requiresPracticalEvidence ? '✓ Minh chứng' : 'Không minh chứng'}
                  </button>

                  {/* Nút mở rộng Ghi chú / Lý do */}
                  <button
                    type="button"
                    onClick={() => toggleNote(row.competencyId)}
                    aria-expanded={isNoteOpen}
                    aria-label={`Ghi chú lý do: ${rowName}`}
                    className={`rounded-lg p-1.5 border transition-colors cursor-pointer ${
                      row.note?.trim()
                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                        : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100 hover:text-slate-700'
                    }`}
                    title="Thêm ghi chú / lý do yêu cầu (Rationale)"
                  >
                    <FileText className="size-3.5" />
                  </button>
                </div>
              </div>

              {/* Ô nhập ghi chú khi được mở */}
              {isNoteOpen && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-2 animate-in fade-in duration-100">
                  <span className="text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                    Lý do yêu cầu:
                  </span>
                  <input
                    type="text"
                    placeholder="Mô tả lý do hoặc bối cảnh năng lực này áp dụng cho vị trí..."
                    aria-label={`Lý do yêu cầu: ${rowName}`}
                    value={row.note || ''}
                    onChange={(e) => onRowChange(row.competencyId, 'note', e.target.value)}
                    disabled={!canEdit || !isRequired}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

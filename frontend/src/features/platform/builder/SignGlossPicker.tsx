import { useEffect, useId, useState } from 'react';
import { Search } from 'lucide-react';
import { useSignGlosses } from '@/hooks/use-sign-dictionary';
import type { SignCandidate, SignRendererKind } from '@/services/sign-language-video.service';
import { AVAILABILITY_LABELS, availabilityOf, glossToCandidate, variantLine } from '@/lib/sign-video';

/**
 * "Tìm ký hiệu trong từ điển": search the dictionary and attach a sign by hand. Each result says whether it can be
 * used by the renderer (video, rights) so the admin does not pick a sign that will block the render unknowingly.
 */
export function SignGlossPicker({ initialText, renderer, onPick }: {
  initialText: string;
  renderer: SignRendererKind;
  onPick: (sign: SignCandidate) => void;
}) {
  const inputId = useId();
  const [text, setText] = useState(initialText);
  const [search, setSearch] = useState(initialText.trim());
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(text.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [text]);
  const results = useSignGlosses({ search, pageSize: 8 });
  const items = (results.data?.items ?? []).filter((gloss) => gloss.kind === 'WORD' || gloss.kind === 'DIGIT');

  return (
    <div className="pa-sv-picker">
      <label htmlFor={inputId} className="pa-sv-picker-label">
        <Search size={14} aria-hidden="true" /> Tìm ký hiệu trong từ điển
      </label>
      <input id={inputId} className="pa-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Gõ chữ của ký hiệu" />
      {results.isLoading && <p className="pa-hint">Đang tìm…</p>}
      {!results.isLoading && search && items.length === 0 && <p className="pa-hint">Không có ký hiệu khớp “{search}”.</p>}
      {items.length > 0 && (
        <ul className="pa-sv-picker-list" aria-label="Kết quả tìm ký hiệu">
          {items.map((gloss) => {
            const candidate = glossToCandidate(gloss);
            const availability = availabilityOf(candidate, renderer);
            return (
              <li key={gloss.id}>
                <button type="button" className="pa-sv-picker-item" onClick={() => onPick(candidate)}>
                  <strong>{gloss.gloss}</strong>
                  <span className="pa-hint">{variantLine(candidate)}</span>
                  <span className={`pa-sv-state is-${availability.toLowerCase()}`}>{AVAILABILITY_LABELS[availability]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

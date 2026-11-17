import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Clock, Search, Users, X } from 'lucide-react';
import type { TrialParticipant, TrialParticipantStatus } from '@/services/trial-program.service';
import { formatWhen } from '../lib/trial-format';
import '../participation-overview.css';

/** Thứ tự từ xong đến chưa bắt đầu; màu trạng thái luôn đi kèm nhãn chữ. */
const STATUS_ORDER: TrialParticipantStatus[] = ['REVIEWED', 'SUBMITTED', 'ACTIVE', 'INVITED', 'INVITE_EXPIRED'];
const STATUS_META: Record<TrialParticipantStatus, { label: string; color: string; ink: string; tint: string }> = {
  REVIEWED: { label: 'Đã chấm', color: '#14936f', ink: '#ffffff', tint: '#e3f5ee' },
  SUBMITTED: { label: 'Đã nộp', color: '#3b82c4', ink: '#ffffff', tint: '#e6f0fa' },
  ACTIVE: { label: 'Chưa làm bài', color: '#d4952b', ink: '#2a1d05', tint: '#fbf1df' },
  INVITED: { label: 'Chưa kích hoạt', color: '#9aa8b6', ink: '#17243f', tint: '#eef2f5' },
  INVITE_EXPIRED: { label: 'Lời mời hết hạn', color: '#d0574a', ink: '#ffffff', tint: '#fbe9e7' },
};
const CARD_WIDTH = 296;
const NO_DEPARTMENT = 'Chưa có phòng ban';

const initials = (name: string) => name.trim().split(/\s+/).slice(-2).map((w) => w[0]).join('').toUpperCase();

function remaining(deadline?: string | null): { text: string; overdue: boolean } | null {
  if (!deadline) return null;
  const ms = Date.parse(deadline) - Date.now();
  if (!Number.isFinite(ms)) return null;
  if (ms <= 0) return { text: 'Đã hết hạn', overdue: true };
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.max(1, Math.floor(ms / 60_000));
  return { text: days >= 1 ? `Còn ${days} ngày` : hours >= 1 ? `Còn ${hours} giờ` : `Còn ${minutes} phút`, overdue: false };
}

type Card = { id: string; pinned: boolean; left: number; top: number; arrow: number };

/**
 * Tiến độ tham gia: tổng quan trước (vòng hoàn thành + thanh trạng thái + hạn nộp), rồi từng phòng ban dạng làn ảnh đại diện.
 * Rê chuột/focus một người để xem chi tiết, nhấp để ghim (và gửi lại lời mời).
 */
export function ParticipationOverview({ participants, reported, deadline, actions, panel, personActions }: {
  participants: TrialParticipant[];
  reported: boolean;
  deadline?: string | null;
  actions?: ReactNode;
  panel?: ReactNode;
  personActions?: (participant: TrialParticipant) => ReactNode;
}) {
  useUiLanguage();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [filter, setFilter] = useState<TrialParticipantStatus | null>(null);
  const [query, setQuery] = useState('');
  const [card, setCard] = useState<Card | null>(null);
  const lanesRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const avatarRefs = useRef(new Map<string, HTMLButtonElement>());

  const statusOf = (p: TrialParticipant): TrialParticipantStatus => (!reported && p.status === 'REVIEWED' ? 'SUBMITTED' : p.status);
  const total = participants.length;
  const counts = STATUS_ORDER.map((s) => participants.filter((p) => statusOf(p) === s).length);
  const submitted = participants.filter((p) => p.status === 'SUBMITTED' || p.status === 'REVIEWED').length;
  const share = total ? submitted / total : 0;
  const due = remaining(deadline);

  const q = query.trim().toLocaleLowerCase('vi');
  const matches = (p: TrialParticipant) => (!filter || statusOf(p) === filter) && (!q || [p.fullName, p.email, p.positionName, p.departmentName]
    .some((v) => v?.toLocaleLowerCase('vi').includes(q)));
  const lanes = [...participants.reduce((map, p) => {
    const key = p.departmentName?.trim() || NO_DEPARTMENT;
    map.set(key, [...(map.get(key) ?? []), p]);
    return map;
  }, new Map<string, TrialParticipant[]>())]
    .map(([name, people]) => ({
      name,
      people: [...people].sort((a, b) => STATUS_ORDER.indexOf(statusOf(a)) - STATUS_ORDER.indexOf(statusOf(b)) || a.fullName.localeCompare(b.fullName, 'vi')),
      done: people.filter((p) => p.status === 'SUBMITTED' || p.status === 'REVIEWED').length,
    }))
    .sort((a, b) => (a.name === NO_DEPARTMENT ? 1 : b.name === NO_DEPARTMENT ? -1 : a.name.localeCompare(b.name, 'vi')));
  const filtering = Boolean(filter || q);
  const matchCount = filtering ? participants.filter(matches).length : total;

  const place = (id: string, pinned: boolean) => {
    const host = lanesRef.current;
    const el = avatarRefs.current.get(id);
    if (!host || !el) { setCard({ id, pinned, left: 0, top: 0, arrow: 24 }); return; }
    const box = host.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const width = Math.min(CARD_WIDTH, box.width);
    const center = r.left - box.left + r.width / 2;
    const left = Math.max(0, Math.min(box.width - width, center - width / 2));
    setCard({ id, pinned, left, top: r.bottom - box.top + 10, arrow: center - left });
  };
  const peek = (id: string) => { if (!card?.pinned) place(id, false); };
  const hide = (id: string) => setCard((current) => (current && !current.pinned && current.id === id ? null : current));
  const togglePin = (id: string) => (card?.pinned && card.id === id ? setCard(null) : place(id, true));

  useEffect(() => {
    if (!card?.pinned) return;
    cardRef.current?.focus({ preventScroll: true });
    const id = card.id;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setCard(null);
      avatarRefs.current.get(id)?.focus();
    };
    const onDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (cardRef.current?.contains(target) || avatarRefs.current.get(id)?.contains(target)) return;
      setCard(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [card?.pinned, card?.id]);

  const person = card ? participants.find((p) => p.id === card.id) : undefined;
  const cardId = `${uid}-person`;

  return (
    <section className="tp-pg rounded-2xl border border-slate-200/90 bg-white/95 shadow-xs" aria-labelledby={`${uid}-title`}>
      <header className="tp-pg__head">
        <div className="tp-pg__title">
          <span className="tp-pg__title-icon" aria-hidden="true"><Users size={19} /></span>
          <h3 id={`${uid}-title`}>{translateUi('Tiến độ tham gia')}</h3>
        </div>
        <div className="tp-pg__head-side">
          <p className={`tp-pg__deadline${due?.overdue ? ' is-overdue' : ''}`}>
            <Clock size={15} aria-hidden="true" />
            <span>{translateUi('Hạn')}</span>
            <strong>{deadline ? formatWhen(deadline) : translateUi('Chưa đặt thời hạn')}</strong>
            {due && !reported && <em>{translateUi(due.text)}</em>}
          </p>
          {actions}
        </div>
      </header>

      {panel}

      {total === 0 ? (
        <p className="tp-pg__empty">{translateUi('Chưa có nhân sự nào được mời.')}</p>
      ) : (
        <>
          <div className="tp-pg__overview">
            <div className="tp-pg__ring" role="img" aria-label={translateUi(`${submitted}/${total} người đã nộp bài`)}>
              <svg viewBox="0 0 120 120" aria-hidden="true">
                <defs>
                  <linearGradient id={`${uid}-ring`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1d5d78" />
                    <stop offset="100%" stopColor="#00a291" />
                  </linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" className="tp-pg__ring-track" />
                <circle cx="60" cy="60" r="50" className="tp-pg__ring-value" stroke={`url(#${uid}-ring)`} pathLength={100}
                  strokeDasharray="100" style={{ strokeDashoffset: 100 - share * 100 }} transform="rotate(-90 60 60)" />
              </svg>
              <div className="tp-pg__ring-label" aria-hidden="true">
                <strong>{submitted}<small>/{total}</small></strong>
                <span>{translateUi('đã nộp bài')}</span>
              </div>
            </div>

            <div className="tp-pg__split">
              <div className="tp-pg__bar" role="img" aria-label={STATUS_ORDER.map((s, i) => `${translateUi(STATUS_META[s].label)}: ${counts[i]}`).join(', ')}>
                {STATUS_ORDER.map((s, i) => counts[i] > 0 && (
                  <span key={s} data-dim={Boolean(filter && filter !== s)}
                    style={{ flexGrow: counts[i], background: STATUS_META[s].color, color: STATUS_META[s].ink, animationDelay: `${i * 70}ms` }}
                    title={`${translateUi(STATUS_META[s].label)}: ${counts[i]}`}
                    onClick={() => setFilter((current) => (current === s ? null : s))}>
                    {counts[i] / total >= 0.07 ? counts[i] : null}
                  </span>
                ))}
              </div>
              <div className="tp-pg__chips" role="group" aria-label={translateUi('Lọc theo trạng thái')}>
                {STATUS_ORDER.map((s, i) => counts[i] > 0 && (
                  <button key={s} type="button" className="tp-pg__chip" aria-pressed={filter === s}
                    onClick={() => setFilter((current) => (current === s ? null : s))}>
                    <span style={{ background: STATUS_META[s].color }} aria-hidden="true" />
                    {translateUi(STATUS_META[s].label)}
                    <strong>{counts[i]}</strong>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="tp-pg__lanes" ref={lanesRef}>
            <div className="tp-pg__lanes-head">
              <h4>{translateUi('Theo phòng ban')}</h4>
              {filtering && <span className="tp-pg__match" role="status">{matchCount}/{total}</span>}
              <label className="tp-pg__search">
                <Search size={15} aria-hidden="true" />
                <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder={translateUi('Tìm nhân viên')} aria-label={translateUi('Tìm nhân viên')} />
              </label>
            </div>
            <ul className="tp-pg__lane-list">
              {lanes.map((lane) => (
                <li key={lane.name} className="tp-pg__lane" data-dim={filtering && !lane.people.some(matches)}>
                  <div className="tp-pg__lane-name">
                    <p>
                      <strong>{lane.name === NO_DEPARTMENT ? translateUi(NO_DEPARTMENT) : lane.name}</strong>
                      <span className="tp-pg__lane-count"><b>{lane.done}</b>/{lane.people.length}</span>
                    </p>
                    <span className="tp-pg__lane-meter" aria-hidden="true"><i style={{ width: `${(lane.done / lane.people.length) * 100}%` }} /></span>
                  </div>
                  <div className="tp-pg__people">
                    {lane.people.map((p) => {
                      const status = statusOf(p);
                      const meta = STATUS_META[status];
                      const open = card?.id === p.id;
                      return (
                        <button
                          key={p.id}
                          ref={(el) => { if (el) avatarRefs.current.set(p.id, el); else avatarRefs.current.delete(p.id); }}
                          type="button"
                          className="tp-pg__avatar"
                          data-dim={filtering && !matches(p)}
                          data-open={open}
                          style={{ '--pg-status': meta.color, '--pg-tint': meta.tint } as CSSProperties}
                          aria-label={`${p.fullName} · ${translateUi(meta.label)}`}
                          aria-haspopup="dialog"
                          aria-expanded={open && card?.pinned ? true : undefined}
                          aria-describedby={open && !card?.pinned ? cardId : undefined}
                          onPointerEnter={() => peek(p.id)}
                          onPointerLeave={() => hide(p.id)}
                          onFocus={() => peek(p.id)}
                          onBlur={() => hide(p.id)}
                          onClick={() => togglePin(p.id)}
                        >
                          {initials(p.fullName)}
                        </button>
                      );
                    })}
                  </div>
                </li>
              ))}
            </ul>

            {card && person && (
              <div
                ref={cardRef}
                id={cardId}
                role={card.pinned ? 'dialog' : 'tooltip'}
                aria-label={card.pinned ? person.fullName : undefined}
                tabIndex={card.pinned ? -1 : undefined}
                className="tp-pg__card"
                data-pinned={card.pinned}
                style={{ width: Math.min(CARD_WIDTH, lanesRef.current?.clientWidth || CARD_WIDTH), transform: `translate(${card.left}px, ${card.top}px)`, '--pg-arrow': `${card.arrow}px` } as CSSProperties}
              >
                <div className="tp-pg__card-head">
                  <span className="tp-pg__card-avatar" style={{ '--pg-status': STATUS_META[statusOf(person)].color, '--pg-tint': STATUS_META[statusOf(person)].tint } as CSSProperties} aria-hidden="true">
                    {initials(person.fullName)}
                  </span>
                  <div className="min-w-0">
                    <p className="tp-pg__card-name">{person.fullName}{person.isOwner ? ` (${translateUi('bạn')})` : ''}</p>
                    <p className="tp-pg__card-mail">{person.email}</p>
                  </div>
                  {card.pinned && (
                    <button type="button" className="tp-pg__card-close" aria-label={translateUi('Đóng')} onClick={() => { setCard(null); avatarRefs.current.get(person.id)?.focus(); }}>
                      <X size={14} aria-hidden="true" />
                    </button>
                  )}
                </div>
                <dl className="tp-pg__card-facts">
                  <div><dt>{translateUi('Vị trí')}</dt><dd>{[person.departmentName, person.positionName].filter(Boolean).join(' · ') || '—'}</dd></div>
                  <div>
                    <dt>{translateUi('Trạng thái')}</dt>
                    <dd><span className="tp-pg__status" style={{ '--pg-status': STATUS_META[statusOf(person)].color } as CSSProperties}>{translateUi(STATUS_META[statusOf(person)].label)}</span></dd>
                  </div>
                  {person.submittedAt && <div><dt>{translateUi('Nộp lúc')}</dt><dd>{formatWhen(person.submittedAt)}</dd></div>}
                </dl>
                {card.pinned && personActions && <div className="tp-pg__card-actions">{personActions(person)}</div>}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

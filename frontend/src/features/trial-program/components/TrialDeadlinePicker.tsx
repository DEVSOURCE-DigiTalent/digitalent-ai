import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { translateUi, useUiLanguage } from '@/lib/i18n';
import { toLocalInput } from '../lib/trial-format';
import './trial-deadline-picker.css';

const pad = (value: number) => String(value).padStart(2, '0');
const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const shiftMonth = (date: Date, offset: number) => new Date(date.getFullYear(), date.getMonth() + offset, 1);

export function TrialDeadlinePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const language = useUiLanguage();
  const locale = language === 'en' ? 'en-GB' : 'vi-VN';
  const now = new Date();
  const earliest = new Date(now.getTime() + 30 * 60_000);
  const latest = new Date(now.getTime() + 60 * 86_400_000);
  const [day, time = '17:00'] = value.split('T');
  const [hour, minute] = time.split(':');
  const selected = value ? new Date(value) : earliest;
  const firstDay = toLocalInput(earliest).slice(0, 10);
  const lastDay = toLocalInput(latest).slice(0, 10);
  const [month, setMonth] = useState(() => monthStart(selected < earliest ? earliest : selected));
  const offset = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const dateLabel = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const setTime = (next: string) => onChange(`${day || firstDay}T${next}`);

  return (
    <div className="trial-deadline-picker">
      <section className="trial-deadline-picker__calendar" aria-label={translateUi('Chọn ngày nộp bài')}>
        <header>
          <button type="button" aria-label={translateUi('Tháng trước')} disabled={month <= monthStart(earliest)} onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft size={18} /></button>
          <strong aria-live="polite">{month.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</strong>
          <button type="button" aria-label={translateUi('Tháng sau')} disabled={month >= monthStart(latest)} onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight size={18} /></button>
        </header>
        <div className="trial-deadline-picker__days">
          {Array.from({ length: 7 }, (_, index) => <span key={index}>{weekday.format(new Date(2024, 0, index + 1))}</span>)}
          {Array.from({ length: offset }, (_, index) => <span key={`blank-${index}`} aria-hidden="true" />)}
          {Array.from({ length: days }, (_, index) => {
            const date = new Date(month.getFullYear(), month.getMonth(), index + 1);
            const key = toLocalInput(date).slice(0, 10);
            return <button key={key} type="button" aria-label={dateLabel.format(date)} aria-pressed={key === day}
              disabled={key < firstDay || key > lastDay}
              onClick={() => onChange(`${key}T${time}`)}>{index + 1}</button>;
          })}
        </div>
      </section>
      <section className="trial-deadline-picker__time" aria-label={translateUi('Chọn giờ nộp bài')}>
        <h3><Clock3 size={17} aria-hidden="true" />{translateUi('Giờ nộp bài')}</h3>
        <div className="trial-deadline-picker__selectors">
          <label>{translateUi('Giờ')}<select value={hour} onChange={(event) => setTime(`${event.target.value}:${minute}`)}>{Array.from({ length: 24 }, (_, index) => <option key={index}>{pad(index)}</option>)}</select></label>
          <label>{translateUi('Phút')}<select value={minute} onChange={(event) => setTime(`${hour}:${event.target.value}`)}>{Array.from({ length: 60 }, (_, index) => <option key={index}>{pad(index)}</option>)}</select></label>
        </div>
        <p className="trial-deadline-picker__summary" aria-live="polite"><CalendarDays size={17} aria-hidden="true" />{value ? `${time} · ${dateLabel.format(selected)}` : translateUi('Chọn hạn làm bài.')}</p>
        <small>{translateUi('Theo múi giờ trên thiết bị của bạn')}</small>
      </section>
    </div>
  );
}

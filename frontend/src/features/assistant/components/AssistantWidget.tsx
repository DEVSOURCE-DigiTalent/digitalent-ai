import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import {
  ArrowUp,
  Award,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  ClipboardCheck,
  Copy,
  Database,
  Gauge,
  MessageSquarePlus,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useAssistantChat } from '../../../hooks/use-assistant-chat';
import { useCurrentUser } from '../../../hooks/use-current-user';
import { PERMISSIONS, usePermission } from '../../../hooks/use-permission';
import { ROLES } from '../../../lib/roles';
import { ASSISTANT_MAX_LENGTH } from '../../../services/assistant.service';
import { cleanReply, formatTime, sourceLabels } from '../assistant-format';
import { AssistantMarkdown } from './AssistantMarkdown';
import '../assistant.css';

interface Suggestion {
  icon: LucideIcon;
  text: string;
}

const SUGGESTIONS: Record<string, Suggestion[]> = {
  [ROLES.OWNER]: [
    { icon: Users, text: 'Số nhân viên theo từng phòng ban?' },
    { icon: TrendingUp, text: 'Tình hình học tập của toàn công ty thế nào?' },
    { icon: BarChart3, text: 'Khóa học nào có tỉ lệ hoàn thành thấp nhất?' },
    { icon: Award, text: 'Bao nhiêu chứng chỉ đang còn hiệu lực?' },
  ],
  [ROLES.MANAGER]: [
    { icon: TrendingUp, text: 'Tiến độ học tập của phòng tôi?' },
    { icon: ClipboardCheck, text: 'Những nhiệm vụ nào đang chờ chấm?' },
    { icon: Gauge, text: 'Mức năng lực trung bình của phòng tôi theo từng năng lực?' },
  ],
  [ROLES.EMPLOYEE]: [
    { icon: BookOpen, text: 'Khóa học tiếp theo của tôi?' },
    { icon: Gauge, text: 'Năng lực hiện tại của tôi ra sao?' },
    { icon: Award, text: 'Điểm bài thi vừa nộp?' },
  ],
};

function givenName(fullName: string | undefined): string {
  const parts = (fullName ?? '').trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? '';
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked: nothing to do */
    }
  };
  return (
    <button type="button" className="as-meta-btn" onClick={copy} aria-label={copied ? 'Đã sao chép' : 'Sao chép câu trả lời'} title="Sao chép">
      {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
    </button>
  );
}

/**
 * Floating AI assistant: answers questions about the organization's data within the caller's scope.
 * Mounted by the enterprise layouts for users holding assistant.chat; hidden during proctored exams.
 */
export function AssistantWidget() {
  const { can, is } = usePermission();
  const fullName = useCurrentUser((s) => s.user?.fullName);
  const chat = useAssistantChat();
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const { open, setOpen, entries, pending } = chat;

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length, pending]);

  if (!can(PERMISSIONS.ASSISTANT_CHAT)) return null;

  const role = is(ROLES.OWNER) ? ROLES.OWNER : is(ROLES.MANAGER) ? ROLES.MANAGER : ROLES.EMPLOYEE;
  const suggestions = SUGGESTIONS[role] ?? SUGGESTIONS[ROLES.EMPLOYEE];
  const name = givenName(fullName);

  const submit = (text: string) => {
    if (!text.trim() || pending) return;
    chat.send(text);
    setDraft('');
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    submit(draft);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit(draft);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        className="as-fab as-fab-compact"
        onClick={() => setOpen(true)}
        aria-label="Mở trợ lý hỗ trợ đào tạo"
        title="Trợ lý AI"
      >
        <Bot size={22} aria-hidden="true" />
      </button>
    );
  }

  return (
    <section
      className="as-panel"
      role="dialog"
      aria-label="Trợ lý AI DigiTalent"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      <header className="as-head">
        <span className="as-avatar as-avatar-lg" aria-hidden="true">
          <Bot size={18} />
        </span>
        <div className="as-head-text">
          <strong>Trợ lý DigiTalent</strong>
          <span>
            <i className="as-dot" aria-hidden="true" />
            Hỗ trợ tra cứu dữ liệu đào tạo
          </span>
        </div>
        {entries.length > 0 && (
          <button
            type="button"
            className="as-icon-btn"
            onClick={chat.clear}
            aria-label="Cuộc trò chuyện mới"
            title="Cuộc trò chuyện mới"
            disabled={pending}
          >
            <MessageSquarePlus size={17} />
          </button>
        )}
        <button type="button" className="as-icon-btn" onClick={() => setOpen(false)} aria-label="Đóng trợ lý" title="Đóng (Esc)">
          <X size={18} />
        </button>
      </header>

      <div className="as-list" ref={listRef} aria-live="polite">
        {entries.length === 0 && (
          <div className="as-empty">
            <span className="as-empty-mark" aria-hidden="true">
              <Bot size={26} />
            </span>
            <h3>{name ? `Xin chào, ${name}!` : 'Xin chào!'}</h3>
            <p>
              Tôi hỗ trợ giải đáp nhanh về khóa học, tiến độ học tập và bài thi của bạn.
            </p>
            <div className="as-suggest-label">Gợi ý cho bạn</div>
            <div className="as-suggestions">
              {suggestions.map(({ icon: Icon, text }) => (
                <button key={text} type="button" className="as-suggestion" onClick={() => submit(text)}>
                  <span className="as-suggestion-icon" aria-hidden="true">
                    <Icon size={15} />
                  </span>
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {entries.map((entry) => {
          if (entry.role === 'user') {
            return (
              <div key={entry.id} className="as-msg as-msg-user">
                <div className={`as-bubble${entry.failed ? ' as-bubble-failed' : ''}`}>{entry.content}</div>
                <div className="as-meta">
                  {entry.failed ? (
                    <button type="button" className="as-retry" onClick={() => chat.retry(entry)} disabled={pending}>
                      <RotateCcw size={12} aria-hidden="true" /> Chưa gửi được, gửi lại
                    </button>
                  ) : (
                    <time>{formatTime(entry.at)}</time>
                  )}
                </div>
              </div>
            );
          }
          const text = cleanReply(entry.content);
          const labels = sourceLabels(entry.sources);
          return (
            <div key={entry.id} className="as-msg as-msg-bot">
              <span className="as-avatar" aria-hidden="true">
                <Bot size={13} />
              </span>
              <div className="as-msg-body">
                <div className="as-bubble">
                  <AssistantMarkdown text={text} />
                  {labels.length > 0 && (
                    <div className="as-sources" aria-label="Dữ liệu đã tra cứu">
                      <Database size={12} aria-hidden="true" />
                      <span className="as-sources-label">Dựa trên</span>
                      {labels.map((label) => (
                        <span key={label} className="as-source">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="as-meta">
                  <time>{formatTime(entry.at)}</time>
                  <CopyButton text={text} />
                </div>
              </div>
            </div>
          );
        })}

        {pending && (
          <div className="as-msg as-msg-bot">
            <span className="as-avatar as-avatar-busy" aria-hidden="true">
              <Sparkles size={13} />
            </span>
            <div className="as-msg-body">
              <div className="as-bubble as-typing">
                <span />
                <span />
                <span />
                <em>Đang tra cứu dữ liệu...</em>
              </div>
            </div>
          </div>
        )}

        {chat.error && !pending && (
          <p className="as-error" role="alert">
            {chat.error}
          </p>
        )}
      </div>

      <form className="as-form" onSubmit={onSubmit}>
        <div className="as-composer">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Nhập câu hỏi cần hỗ trợ..."
            rows={1}
            maxLength={ASSISTANT_MAX_LENGTH}
            aria-label="Câu hỏi cho trợ lý AI"
          />
          <button type="submit" className="as-send" disabled={pending || !draft.trim()} aria-label="Gửi">
            <ArrowUp size={17} strokeWidth={2.4} />
          </button>
        </div>
        <p className="as-hint">Enter để gửi, Shift + Enter xuống dòng.</p>
      </form>
    </section>
  );
}

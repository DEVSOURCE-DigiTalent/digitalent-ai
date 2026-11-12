import { Check, Loader2 } from 'lucide-react';
import pulseMark from '@/assets/pulse/pulse-mark.svg';
import '@/features/public/pulse-landing/pulse-auth.css';

export type TrialLoadingStage = 0 | 1 | 2;

interface TrialWorkspaceLoadingScreenProps {
  email?: string;
  stage: TrialLoadingStage;
  mode?: 'trial' | 'accept';
}

const STAGE_COPY: Record<TrialLoadingStage, string> = {
  0: 'Đang xác thực mã bảo mật…',
  1: 'Đang khởi tạo phiên làm việc doanh nghiệp…',
  2: 'Không gian làm việc đã sẵn sàng, đang chuyển trang…',
};

const STAGE_PROGRESS: Record<TrialLoadingStage, number> = {
  0: 36,
  1: 74,
  2: 100,
};

export function TrialWorkspaceLoadingScreen({
  email,
  stage,
  mode = 'trial',
}: TrialWorkspaceLoadingScreenProps) {
  const steps =
    mode === 'accept'
      ? [
          'Xác nhận lời mời tham gia',
          'Thiết lập phiên làm việc cá nhân',
          'Mở trang làm bài đánh giá',
        ]
      : [
          'Xác thực email quản trị',
          'Khởi tạo phiên làm việc doanh nghiệp',
          'Mở trang điều phối dùng thử',
        ];

  const title =
    mode === 'accept'
      ? 'Đang mở không gian đánh giá'
      : 'Đang mở không gian dùng thử';

  return (
    <div
      className="pulse-auth-loading-stage"
      role="status"
      aria-live="polite"
      aria-busy="true"
      lang="vi"
    >
      <div className="pulse-auth-mesh" aria-hidden="true" />
      <div className="pulse-auth-glow-orb pulse-auth-glow-1" aria-hidden="true" />
      <div className="pulse-auth-glow-orb pulse-auth-glow-2" aria-hidden="true" />

      <div className="pulse-trial-loading-card">
        <div className="pulse-trial-loading-mark-wrap">
          <div className="pulse-trial-loading-halo" aria-hidden="true" />
          <div className="pulse-trial-loading-mark-inner">
            <img
              src={pulseMark}
              alt="DigiTalent AI"
              width="44"
              height="44"
              loading="eager"
              decoding="sync"
              className="pulse-trial-loading-logo"
            />
          </div>
        </div>

        {email && <span className="pulse-trial-loading-email">{email}</span>}

        <h1 className="pulse-trial-loading-title">{title}</h1>
        <p className="pulse-trial-loading-status">{STAGE_COPY[stage]}</p>

        <div
          className="pulse-trial-loading-track"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={STAGE_PROGRESS[stage]}
          aria-label="Tiến độ mở không gian làm việc"
        >
          <div
            className="pulse-trial-loading-fill"
            style={{ width: `${STAGE_PROGRESS[stage]}%` }}
          />
        </div>

        <ol className="pulse-trial-loading-steps" aria-label="Các bước chuẩn bị">
          {steps.map((label, idx) => {
            const isDone = stage > idx || (stage === 2 && idx === 2);
            const isActive = stage === idx && !(stage === 2 && idx === 2);

            return (
              <li
                key={label}
                className={`pulse-trial-loading-step${
                  isDone
                    ? ' pulse-trial-loading-step--done'
                    : isActive
                      ? ' pulse-trial-loading-step--active'
                      : ''
                }`}
              >
                <span className="pulse-trial-loading-step-icon" aria-hidden="true">
                  {isDone ? (
                    <Check size={12} strokeWidth={2.8} />
                  ) : isActive ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <span className="pulse-trial-loading-step-dot" />
                  )}
                </span>
                <span className="pulse-trial-loading-step-label">{label}</span>
              </li>
            );
          })}
        </ol>

        <p className="pulse-trial-loading-footer">
          DigiTalent AI · Đào tạo năng lực số theo vị trí công việc
        </p>
      </div>
    </div>
  );
}

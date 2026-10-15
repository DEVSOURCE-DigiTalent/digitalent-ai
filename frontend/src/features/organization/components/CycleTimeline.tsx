interface TimelineEvent {
  step: string;
  title: string;
  detail: string;
}

interface CycleTimelineProps {
  events: TimelineEvent[];
}

export function CycleTimeline({ events }: CycleTimelineProps) {
  return (
    <section
      className="rounded-[22px] border p-6"
      style={{
        borderColor: 'var(--po-line)',
        background: 'var(--po-surface)',
        boxShadow: '0 10px 35px rgba(29,48,102,.025)',
      }}
    >
      <span
        className="text-[10px] font-black uppercase tracking-[0.12em]"
        style={{ color: 'var(--po-accent)' }}
      >
        Quy trình học tập
      </span>
      <h2
        className="mt-2 text-xl font-semibold"
        style={{ color: 'var(--po-ink)', letterSpacing: '-0.045em' }}
      >
        Các quyết định dọc hành trình.
      </h2>

      <div className="mt-4">
        {events.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--po-muted)' }}>
            Hoạt động sẽ xuất hiện ở đây khi nhóm tiến triển qua quy trình.
          </p>
        ) : (
          events.map((event, i) => (
            <div
              key={event.step}
              className="grid items-start gap-x-4 py-4"
              style={{
                gridTemplateColumns: '20px 1fr',
                borderBottom:
                  i < events.length - 1
                    ? '1px solid var(--po-line)'
                    : 'none',
              }}
            >
              <i
                className="block rounded-full mt-1"
                style={{
                  width: 10,
                  height: 10,
                  background: 'var(--po-accent)',
                }}
              />
              <div>
                <strong
                  className="block text-[13px]"
                  style={{ color: 'var(--po-ink)' }}
                >
                  {event.title}
                </strong>
                <p
                  className="mt-1 text-[11px] leading-relaxed"
                  style={{ color: 'var(--po-muted)' }}
                >
                  {event.detail}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

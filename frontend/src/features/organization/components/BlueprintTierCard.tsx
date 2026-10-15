interface TierLevel {
  label: string;
  sublabel: string;
  percent: number;
}

interface BlueprintTierCardProps {
  levels: TierLevel[];
}

export function BlueprintTierCard({ levels }: BlueprintTierCardProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {levels.map((level) => (
        <div
          key={level.label}
          className="rounded-[13px] border p-[17px]"
          style={{
            borderColor: 'var(--po-line)',
            background: 'linear-gradient(145deg, #fff, #f8faff)',
          }}
        >
          <strong
            className="block text-sm"
            style={{ color: 'var(--po-ink)' }}
          >
            {level.label}
          </strong>
          <small
            className="block mt-0.5 text-[11px]"
            style={{ color: 'var(--po-muted)' }}
          >
            {level.sublabel}
          </small>
          <div
            className="mt-3 h-[5px] rounded-full overflow-hidden"
            style={{ background: 'var(--po-line)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${level.percent}%`,
                background: 'var(--po-accent)',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

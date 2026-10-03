import { PanelLeftClose, HelpCircle } from 'lucide-react';

interface SidebarFooterProps {
  isRail?: boolean;
  usedSeats?: number;
  totalSeats?: number;
  isOwner?: boolean;
  onToggleCollapsed?: () => void;
}

export function SidebarFooter({
  isRail,
  usedSeats,
  totalSeats,
  isOwner,
  onToggleCollapsed,
}: SidebarFooterProps) {
  const hasSeatsInfo = isOwner && usedSeats !== undefined && totalSeats !== undefined && totalSeats > 0;

  return (
    <div className="p-4 border-t border-ent-line flex flex-col gap-2 shrink-0">
      {!isRail && hasSeatsInfo && (
        <div className="text-xs text-ent-sidebar-muted mb-1">
          <div className="flex items-center justify-between mb-1">
            <span>Quyền sử dụng</span>
            <span className="tabular-nums font-medium text-ent-sidebar-fg">
              {usedSeats} / {totalSeats}
            </span>
          </div>
          <div className="w-full bg-ent-raised h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-ent-accent h-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, (usedSeats / totalSeats) * 100))}%` }}
            />
          </div>
        </div>
      )}

      <div className={`flex ${isRail ? 'flex-col items-center gap-3' : 'items-center justify-between'}`}>
        <a
          href="mailto:hotro@digitalent.ai?subject=Y%C3%AAu%20c%E1%BA%A7u%20h%E1%BB%97%20tr%E1%BB%A3%20DigiTalent%20AI"
          className={`text-ent-sidebar-muted hover:text-ent-sidebar-fg flex items-center gap-2 text-sm transition-colors ${
            isRail ? 'justify-center p-1 rounded hover:bg-[var(--ent-sidebar-hover)]' : ''
          }`}
          title={isRail ? 'Trợ giúp (hotro@digitalent.ai)' : 'Gửi yêu cầu hỗ trợ'}
        >
          <HelpCircle className="w-4 h-4 shrink-0" />
          {!isRail && <span>Trợ giúp</span>}
        </a>

        <button
          type="button"
          className="text-ent-sidebar-muted hover:text-ent-sidebar-fg p-1.5 rounded-md hover:bg-[var(--ent-sidebar-hover)] transition-colors"
          onClick={onToggleCollapsed}
          title={isRail ? 'Mở rộng thanh bên (Ctrl+B)' : 'Thu gọn thanh bên (Ctrl+B)'}
          aria-label={isRail ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
        >
          <PanelLeftClose className={`w-4 h-4 transition-transform duration-200 ${isRail ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
}

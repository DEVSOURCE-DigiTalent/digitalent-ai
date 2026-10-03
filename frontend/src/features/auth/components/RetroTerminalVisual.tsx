import type { BokehSceneName } from '../../public/landing/bokeh-scene';

interface RetroTerminalVisualProps {
  scene?: BokehSceneName;
}

/**
 * An artistic retro terminal display motif evoking the reference scene
 * (CRT computer monitor glowing on a hill under an atmospheric twilight/dusk sky).
 * Rendered with vector SVG and styling to remain crisp, fast, and responsive.
 */
export function RetroTerminalVisual({ scene = 'ember' }: RetroTerminalVisualProps) {
  const isEmber = scene === 'ember';
  const glowColor = isEmber ? 'rgba(255, 180, 50, 0.28)' : 'rgba(56, 189, 248, 0.25)';
  const screenBg = isEmber ? '#23180c' : '#071724';
  const screenText = isEmber ? '#fbd38d' : '#93c5fd';
  const screenAccent = isEmber ? '#f6ad55' : '#38bdf8';

  return (
    <div className="relative mx-auto my-auto flex w-full max-w-[340px] flex-col items-center select-none py-4" aria-hidden="true">
      {/* Ambient background bloom behind the CRT */}
      <div
        className="pointer-events-none absolute -top-8 size-64 rounded-full blur-3xl transition-colors duration-700"
        style={{ background: glowColor }}
      />

      {/* Retro CRT Monitor Enclosure */}
      <div className="relative z-10 w-60 rounded-[28px] border border-stone-700/60 bg-gradient-to-b from-[#3a3935] via-[#242320] to-[#181816] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)]">
        {/* Subtle top vents / bezel groove */}
        <div className="mb-2.5 flex justify-center gap-1.5 opacity-40">
          <div className="h-0.5 w-6 rounded bg-stone-400" />
          <div className="h-0.5 w-6 rounded bg-stone-400" />
          <div className="h-0.5 w-6 rounded bg-stone-400" />
        </div>

        {/* CRT Curved Screen Inset */}
        <div
          className="relative overflow-hidden rounded-[18px] border-2 border-stone-800 p-3 shadow-[inset_0_4px_16px_rgba(0,0,0,0.9)]"
          style={{ backgroundColor: screenBg }}
        >
          {/* Scanline overlay */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 3px)',
            }}
          />

          {/* CRT glass curved highlight / glare */}
          <div className="pointer-events-none absolute -top-10 -left-10 h-28 w-44 rounded-full bg-white/5 blur-md transform -rotate-12" />

          {/* Screen Content */}
          <div className="relative z-10 flex flex-col items-center py-2 text-center" style={{ color: screenText }}>
            {/* Logo Emblem on CRT */}
            <div className="mb-2 flex items-center gap-1 text-base font-bold tracking-tight">
              <span>DigiTalent</span>
              <span
                className="rounded px-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${screenAccent}25`, color: screenAccent }}
              >
                AI
              </span>
            </div>

            {/* Radar / Matrix icon */}
            <div className="my-1.5 size-12 rounded-full border border-current/30 p-1 flex items-center justify-center relative">
              <div className="size-full rounded-full border border-dashed border-current/40 animate-[spin_20s_linear_infinite]" />
              <div className="absolute size-2 rounded-full" style={{ backgroundColor: screenAccent }} />
              <div className="absolute top-1/2 left-0 right-0 h-px bg-current/25" />
              <div className="absolute top-0 bottom-0 left-1/2 w-px bg-current/25" />
            </div>

            {/* Status lines */}
            <div className="mt-1 font-mono text-[9px] tracking-wider uppercase opacity-85 leading-tight">
              <div>TT 02/2025/TT-BGDĐT</div>
              <div className="text-[8px] opacity-70 mt-0.5">● CORE ENGINE ACTIVE</div>
            </div>
          </div>
        </div>

        {/* Lower bezel: Brand badge, power LED and dials */}
        <div className="mt-3 flex items-center justify-between px-1.5">
          <span className="font-mono text-[9px] font-medium tracking-widest uppercase text-stone-400">
            DT-800
          </span>
          <div className="flex items-center gap-2">
            <div
              className="size-1.5 rounded-full animate-pulse shadow-[0_0_6px_currentColor]"
              style={{ backgroundColor: screenAccent, color: screenAccent }}
            />
            <div className="size-2 rounded-full bg-stone-900 border border-stone-600 shadow-inner" />
          </div>
        </div>
      </div>

      {/* Monitor base pedestal stand */}
      <div className="relative -mt-1 h-3.5 w-24 rounded-b-lg border-x border-b border-stone-800 bg-stone-900 shadow-lg" />
      <div className="h-1.5 w-32 rounded-full bg-stone-950 shadow-md" />

      {/* Atmospheric mound / hill contour underneath */}
      <div className="relative -mt-2 w-full h-8 flex justify-center">
        <svg
          viewBox="0 0 320 40"
          className="w-full text-stone-950 opacity-90 filter drop-shadow-[0_-3px_8px_rgba(0,0,0,0.6)]"
          fill="currentColor"
        >
          <path d="M0,40 Q160,0 320,40 L320,40 L0,40 Z" />
        </svg>
      </div>
    </div>
  );
}

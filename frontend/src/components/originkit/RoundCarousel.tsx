/* eslint-disable */
// Round Carousel — Originkit

import React, { useEffect, useRef, useCallback } from "react";

export interface RoundCarouselItem {
  src?: string;
  id?: string;
  num?: string;
  phase?: string;
  roleTag?: string;
  title?: string;
  desc?: string;
  metric?: string;
  icon?: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  accentColor?: string;
  uiSlice?: React.ReactNode;
  footerStatus?: string;
  footerStandard?: string;
}

export interface RoundCarouselProps {
  items?: RoundCarouselItem[];
  images?: { src: string }[];
  imageWidth?: number;
  imageHeight?: number;
  spacing?: number;
  speed?: number;
  direction?: "right" | "left";
  drag?: boolean;
  sensitivity?: number;
  tilt?: number;
  perspective?: number;
  cornerRadius?: number;
  innerDim?: number;
  background?: string;
  style?: React.CSSProperties;
  activeIndex?: number;
  onActiveIndexChange?: (index: number) => void;
}

const DEFAULT_IMAGES = [
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/e60dd7f7-a44f-40a7-df62-095b19cd8700/w=800" },
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/eec164e9-23f8-4f87-b48a-a208fa806100/w=800" },
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/859c75ea-953e-489e-be61-91a03a35d700/w=800" },
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/933a7615-f4b6-4eae-8ed1-705fa0e24400/w=800" },
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/7d4d2641-d6a8-4fef-e85c-b12ed100d500/w=800" },
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/ed7b1c40-3332-43d8-a9eb-4615ef341b00/w=800" },
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/31afae9c-5ba3-4ec3-2534-ed8198ed1100/w=800" },
  { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/bd541261-75be-469c-7dc0-dae0ce81c400/w=800" },
];

export default function RoundCarousel({
  items: propItems,
  images = DEFAULT_IMAGES,
  imageWidth = 260,
  imageHeight = 350,
  spacing = 5.6,
  speed = 1.2,
  direction = "left",
  drag = true,
  sensitivity = 4.5,
  tilt = -7,
  perspective = 2600,
  cornerRadius = 20,
  innerDim: _innerDim = 10,
  background = "transparent",
  style = {},
  activeIndex,
  onActiveIndexChange,
}: RoundCarouselProps) {
  // Use propItems if provided, otherwise fallback to images
  const rawList = propItems && propItems.length > 0 ? propItems : images;
  const items = rawList.length > 0 ? rawList : DEFAULT_IMAGES;
  const count = items.length;

  const ringRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const rotYRef = useRef(0);
  const targetRotYRef = useRef<number | null>(null);
  const velRef = useRef(0);
  const lastRef = useRef(0);
  const isHoveredRef = useRef(false);
  const pauseUntilRef = useRef(0);
  const lastReportedIdxRef = useRef<number | undefined>(activeIndex);
  const dragRef = useRef({ active: false, startX: 0, x: 0, moved: false });

  const angle = 360 / count;
  const factor = 1 + spacing * 0.15;
  const radius = (imageWidth * factor) / (2 * Math.tan(Math.PI / count));
  const radiusPx = cornerRadius;
  const degPerSec = speed * 6 * (direction === "left" ? -1 : 1);

  // Smooth rotate to specific index
  const rotateToIndex = useCallback(
    (targetIdx: number, pauseSec = 3.5) => {
      lastReportedIdxRef.current = targetIdx;
      const currentRot = rotYRef.current;
      const desiredAngle = -targetIdx * angle;
      const diff = ((desiredAngle - currentRot) % 360 + 540) % 360 - 180;
      targetRotYRef.current = currentRot + diff;
      velRef.current = 0;
      if (pauseSec > 0) {
        pauseUntilRef.current = Date.now() + pauseSec * 1000;
      }
    },
    [angle]
  );

  // Sync external activeIndex prop
  useEffect(() => {
    if (
      activeIndex !== undefined &&
      activeIndex !== lastReportedIdxRef.current &&
      activeIndex >= 0 &&
      activeIndex < count
    ) {
      rotateToIndex(activeIndex);
    }
  }, [activeIndex, count, rotateToIndex]);

  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;
    const apply = () => {
      ring.style.transform = `translateZ(${-radius}px) rotateY(${rotYRef.current}deg)`;

      // Determine front card index (only when not actively animating to a specific target)
      if (targetRotYRef.current === null) {
        const normalizedRot = ((-rotYRef.current % 360) + 360) % 360;
        const currentFrontIdx = Math.round(normalizedRot / angle) % count;
        if (currentFrontIdx !== lastReportedIdxRef.current) {
          lastReportedIdxRef.current = currentFrontIdx;
          onActiveIndexChange?.(currentFrontIdx);
        }
      }
    };
    apply();

    const draw = (now: number) => {
      const dt = lastRef.current ? (now - lastRef.current) / 1000 : 0;
      lastRef.current = now;
      const f = Math.min(dt, 0.1);
      const d = dragRef.current;
      const isPaused = Date.now() < pauseUntilRef.current;

      if (!d.active) {
        if (targetRotYRef.current !== null) {
          const diff = targetRotYRef.current - rotYRef.current;
          if (Math.abs(diff) < 0.05) {
            rotYRef.current = targetRotYRef.current;
            targetRotYRef.current = null;
            velRef.current = 0;
            const normalizedRot = ((-rotYRef.current % 360) + 360) % 360;
            const currentFrontIdx = Math.round(normalizedRot / angle) % count;
            if (currentFrontIdx !== lastReportedIdxRef.current) {
              lastReportedIdxRef.current = currentFrontIdx;
              onActiveIndexChange?.(currentFrontIdx);
            }
          } else {
            rotYRef.current += diff * Math.min(1, f * 7.5);
          }
        } else if (Math.abs(velRef.current) > 0.01) {
          rotYRef.current += velRef.current * f;
          velRef.current *= 0.94;
        } else if (!isHoveredRef.current && !isPaused) {
          rotYRef.current += degPerSec * f;
        }
      }
      apply();
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [radius, degPerSec, count, angle, onActiveIndexChange]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!drag) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current = { active: true, startX: e.clientX, x: e.clientX, moved: false };
    targetRotYRef.current = null;
    velRef.current = 0;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x;
    d.x = e.clientX;
    if (Math.abs(e.clientX - d.startX) > 4) {
      d.moved = true;
    }
    const k = 0.3 * sensitivity;
    rotYRef.current += dx * k;
    velRef.current = dx * k * 60;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current.active = false;
  };

  const faceBase: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    borderRadius: radiusPx,
    overflow: "hidden",
    backfaceVisibility: "hidden",
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  return (
    <div
      style={{
        ...style,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        background,
        perspective: `${perspective}px`,
        cursor: drag ? "grab" : "default",
        touchAction: "none",
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
    >
      <div
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt}deg)`,
        }}
      >
        <div
          ref={ringRef}
          style={{
            position: "relative",
            width: imageWidth,
            height: imageHeight,
            transformStyle: "preserve-3d",
          }}
        >
          {items.map((item: any, i) => {
            const hasMetadata = Boolean(item?.title || item?.phase || item?.metric);
            const accent = item?.accentColor || '#3b82f6';

            return (
              <div
                key={item?.id || i}
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                  transformStyle: "preserve-3d",
                }}
                onClick={() => {
                  if (!dragRef.current.moved) {
                    rotateToIndex(i);
                  }
                }}
              >
                {/* 1. FRONT FACE - Translucent Cyan/Blue Frosted Glass */}
                <div
                  style={{
                    ...faceBase,
                    background: 'linear-gradient(165deg, rgba(16, 58, 118, 0.48) 0%, rgba(12, 44, 92, 0.40) 50%, rgba(10, 38, 86, 0.50) 100%)',
                    boxShadow: "0 24px 60px rgba(6, 28, 72, 0.28), 0 0 35px rgba(56, 189, 248, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.55), inset 0 0 24px rgba(56, 189, 248, 0.16), 0 18px 28px -8px rgba(56, 189, 248, 0.35)",
                    border: "1.5px solid rgba(56, 189, 248, 0.45)",
                    backdropFilter: 'blur(12px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(140%)',
                  }}
                >
                  {/* Holographic Uplight Ambient Catch on Card Body (Soft, gentle glow) */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(0deg, rgba(56, 189, 248, 0.16) 0%, rgba(56, 189, 248, 0.04) 24%, transparent 55%)',
                      borderRadius: 'inherit',
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  />
                  {/* Holographic Uplight Reflection on Card Base (Soft ambient streak) */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: '8%',
                      right: '8%',
                      height: '2px',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(186, 230, 253, 0.75) 50%, transparent 100%)',
                      boxShadow: '0 0 12px 2px rgba(56, 189, 248, 0.5), 0 -1px 6px rgba(125, 211, 252, 0.4)',
                      borderRadius: '9999px',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}
                  />
                  {/* Watermark Numeral (Proposal 3 Monolith Typography in Luminous Cyan) */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '12px',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: imageHeight < 285 ? '2.5rem' : '3.4rem',
                      fontWeight: 800,
                      lineHeight: 1,
                      color: 'rgba(56, 189, 248, 0.12)',
                      userSelect: 'none',
                      pointerEvents: 'none',
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {item.num || `0${i + 1}`}
                  </div>

                  {/* If card metadata exists, render the modern high-end card overlay */}
                  {hasMetadata && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: imageHeight < 285 ? '9px 11px' : '12px 14px',
                        boxSizing: 'border-box',
                        color: '#ffffff',
                        pointerEvents: 'none',
                      }}
                    >
                      {/* Top Header Badge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-start',
                          zIndex: 2,
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: imageHeight < 285 ? '2px 7px' : '3px 9px',
                            borderRadius: '9999px',
                            background: 'rgba(255, 255, 255, 0.12)',
                            border: '1px solid rgba(255, 255, 255, 0.22)',
                            fontSize: imageHeight < 285 ? '0.62rem' : '0.68rem',
                            fontWeight: 700,
                            letterSpacing: '0.04em',
                          }}
                        >
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: accent,
                              boxShadow: `0 0 8px ${accent}`,
                            }}
                          />
                          <span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#93c5fd' }}>
                            {item.num || `0${i + 1}`}
                          </span>
                          <span style={{ opacity: 0.4 }}>·</span>
                          <span style={{ color: '#f8fafc' }}>{item.phase || 'Phân hệ'}</span>
                        </div>
                      </div>

                      {/* Title & Short Summary */}
                      <div style={{ zIndex: 2, marginTop: imageHeight < 285 ? '2px' : '4px', marginBottom: '2px' }}>
                        <h3
                          style={{
                            margin: '0 0 2px 0',
                            fontSize: imageHeight < 285 ? '0.84rem' : '0.98rem',
                            fontWeight: 800,
                            lineHeight: 1.25,
                            color: '#ffffff',
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {item.title}
                        </h3>
                        {item.desc && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: imageHeight < 285 ? '0.59rem' : '0.68rem',
                              lineHeight: 1.28,
                              letterSpacing: '-0.01em',
                              color: '#cbd5e1',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {item.desc}
                          </p>
                        )}
                      </div>

                      {/* Centerpiece: Proposal 2 Micro-UI Slice */}
                      <div
                        style={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          zIndex: 2,
                          minHeight: 0,
                          margin: '2px 0',
                          transform: imageHeight < 285 ? 'scale(0.92)' : 'none',
                          transformOrigin: 'center center',
                        }}
                      >
                        {item.uiSlice}
                      </div>

                      {/* Bottom Status & Standard Tag */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '6px',
                          paddingTop: imageHeight < 285 ? '3px' : '5px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                          fontSize: imageHeight < 285 ? '0.58rem' : '0.64rem',
                          color: '#94a3b8',
                          zIndex: 2,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span
                            style={{
                              width: '5px',
                              height: '5px',
                              borderRadius: '50%',
                              backgroundColor: '#10b981',
                              boxShadow: '0 0 6px #10b981',
                            }}
                          />
                          <span style={{ color: '#cbd5e1' }}>{item.footerStatus || 'Vận hành chuẩn hóa'}</span>
                        </div>
                        <span
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: imageHeight < 240 ? '0.56rem' : '0.62rem',
                            color: '#93c5fd',
                            background: 'rgba(56, 189, 248, 0.12)',
                            padding: imageHeight < 240 ? '1px 5px' : '2px 7px',
                            borderRadius: '4px',
                            border: '1px solid rgba(56, 189, 248, 0.22)',
                          }}
                        >
                          {item.footerStandard || item.metric || 'Chuẩn năng lực'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. BACK FACE (Translucent Sapphire/Cyan Frosted Glass Plate) */}
                <div
                  style={{
                    ...faceBase,
                    transform: "rotateY(180deg)",
                    background: 'linear-gradient(165deg, rgba(16, 56, 116, 0.48) 0%, rgba(12, 42, 92, 0.40) 60%, rgba(18, 64, 130, 0.50) 100%)',
                    boxShadow: "0 14px 35px rgba(6, 28, 68, 0.25), 0 0 25px rgba(56, 189, 248, 0.20), inset 0 1px 1px rgba(255, 255, 255, 0.40), inset 0 0 18px rgba(56, 189, 248, 0.12)",
                    border: "1.5px solid rgba(56, 189, 248, 0.40)",
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '2.5rem',
                      fontWeight: 800,
                      color: 'rgba(56, 189, 248, 0.22)',
                      letterSpacing: '-0.04em',
                    }}
                  >
                    {item.num || `0${i + 1}`}
                  </div>
                  <div
                    style={{
                      fontSize: '0.62rem',
                      fontWeight: 600,
                      color: 'rgba(186, 230, 253, 0.65)',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      marginTop: '4px',
                    }}
                  >
                    DIGITALENT AI
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

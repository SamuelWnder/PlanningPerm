"use client";

// Experian-style score gauge
// Segmented outer ring + solid inner arc + centered number + verdict pill

const START_ANGLE = 135;   // degrees from 12 o'clock, clockwise
const SWEEP       = 270;   // total degrees of arc
const TICK_COUNT  = 26;
const TICK_GAP    = 2.5;   // degrees gap between each tick

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const s = polarToXY(cx, cy, r, from);
  const e = polarToXY(cx, cy, r, to);
  const large = to - from > 180 ? 1 : 0;
  return `M ${s.x.toFixed(3)} ${s.y.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${e.x.toFixed(3)} ${e.y.toFixed(3)}`;
}

interface ScoreGaugeProps {
  score: number;      // 0–100
  size?: number;
  showVerdict?: boolean;
  showLabel?: boolean;
}

export function ScoreGauge({ score, size = 240, showVerdict = true, showLabel = true }: ScoreGaugeProps) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  const cx = 110;
  const cy = 112;
  const trackR    = 76;
  const tickOuter = 93;
  const fillDeg   = (s / 100) * SWEEP;

  const color   = s >= 70 ? "#10B981" : s >= 45 ? "#F59E0B" : "#EF4444";
  const verdict = s >= 70 ? "Likely Approved" : s >= 45 ? "Uncertain" : "High Risk";

  // Outer tick segments
  const tickStep = SWEEP / TICK_COUNT;
  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const tStart = START_ANGLE + i * tickStep;
    const tEnd   = tStart + tickStep - TICK_GAP;
    const mid    = (i + 0.5) / TICK_COUNT;
    return { tStart, tEnd, filled: mid * 100 <= s };
  });

  const pillW  = verdict === "Likely Approved" ? 110 : 84;
  const pillH  = 24;

  return (
    <svg
      viewBox="0 0 220 230"
      width={size}
      height={size * (230 / 220)}
      aria-label={`Score: ${s} out of 100 — ${verdict}`}
    >
      {/* Background circle */}
      <circle cx={cx} cy={cy} r={104} fill="#F3F4F6" />

      {/* Gray track (full sweep) */}
      <path
        d={arcPath(cx, cy, trackR, START_ANGLE, START_ANGLE + SWEEP)}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={10}
        strokeLinecap="round"
      />

      {/* Colored fill arc */}
      {s > 0 && (
        <path
          d={arcPath(cx, cy, trackR, START_ANGLE, START_ANGLE + fillDeg)}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.7s cubic-bezier(0.23,1,0.32,1)" }}
        />
      )}

      {/* Outer tick segments */}
      {ticks.map((t, i) => (
        <path
          key={i}
          d={arcPath(cx, cy, tickOuter, t.tStart, t.tEnd)}
          fill="none"
          stroke={t.filled ? color : "#D1D5DB"}
          strokeWidth={5}
          strokeLinecap="round"
          opacity={t.filled ? 0.55 : 0.5}
        />
      ))}

      {/* Score number */}
      <text
        x={cx}
        y={cy - 10}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#18181B"
        fontSize={46}
        fontWeight={800}
        fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        letterSpacing="-1"
      >
        {s}
      </text>

      {/* "out of 100" sub-label */}
      {showLabel && (
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fill="#71717A"
          fontSize={11}
          fontFamily="var(--font-geist-sans), system-ui, sans-serif"
        >
          out of 100
        </text>
      )}

      {/* Verdict pill */}
      {showVerdict && (
        <g transform={`translate(${cx}, ${cy + 46})`}>
          <rect
            x={-pillW / 2}
            y={-pillH / 2}
            width={pillW}
            height={pillH}
            rx={pillH / 2}
            fill="white"
            stroke={color}
            strokeWidth={1.5}
          />
          <text
            x={0}
            y={0}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize={11}
            fontWeight={600}
            fontFamily="var(--font-geist-sans), system-ui, sans-serif"
          >
            {verdict}
          </text>
        </g>
      )}
    </svg>
  );
}

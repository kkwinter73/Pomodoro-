import { formatTime } from "./formatTime";
import styles from "./AnalogClock.module.css";

interface Props {
  /** 経過割合 0..1。針はこの割合だけ時計回りに回り、満了で一周する。 */
  progress: number;
  /** スクリーンリーダー用の残り時間（視覚的には数字を出さない）。 */
  remainingMs: number;
  /** 計測中は振り子を揺らす。 */
  running?: boolean;
}

const CENTER = 100;
const NUMERAL_RADIUS = 66;
const HAND_TIP = 42; // 針先の y（上方向）
const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// 分目盛り（5 分ごとに太く長く）
const TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0;
  const a = (i * 6 * Math.PI) / 180;
  const outer = 87;
  const inner = major ? 79 : 84;
  return {
    i,
    major,
    x1: CENTER + outer * Math.sin(a),
    y1: CENTER - outer * Math.cos(a),
    x2: CENTER + inner * Math.sin(a),
    y2: CENTER - inner * Math.cos(a),
  };
});

export function AnalogClock({ progress, remainingMs, running = false }: Props) {
  const angle = Math.min(1, Math.max(0, progress)) * 360;

  return (
    <svg
      viewBox="0 0 200 200"
      className={styles.clock}
      role="timer"
      aria-label={`残り ${formatTime(remainingMs)}`}
    >
      <defs>
        <radialGradient id="dialFace" cx="50%" cy="40%" r="68%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f1f2" />
        </radialGradient>
      </defs>

      {/* 文字盤と細いベゼル（二重） */}
      <circle cx={CENTER} cy={CENTER} r={96} className={styles.bezel} />
      <circle cx={CENTER} cy={CENTER} r={90} className={styles.dial} />
      <circle cx={CENTER} cy={CENTER} r={90} className={styles.dialRing} />

      {/* 分目盛り */}
      {TICKS.map((t) => (
        <line
          key={t.i}
          x1={t.x1}
          y1={t.y1}
          x2={t.x2}
          y2={t.y2}
          className={t.major ? styles.tickMajor : styles.tickMinor}
        />
      ))}

      {/* ローマ数字（XII を上に） */}
      {NUMERALS.map((label, i) => {
        const a = ((i + 1) * 30 * Math.PI) / 180;
        const x = CENTER + NUMERAL_RADIUS * Math.sin(a);
        const y = CENTER - NUMERAL_RADIUS * Math.cos(a);
        return (
          <text
            key={label}
            x={x}
            y={y}
            className={styles.numeral}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {label}
          </text>
        );
      })}

      {/* 振り子（計測中だけ揺れる・装飾） */}
      <g className={`${styles.pendulum} ${running ? styles.swing : ""}`} aria-hidden="true">
        <line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER + 48} className={styles.rod} />
        <circle cx={CENTER} cy={CENTER + 56} r={8} className={styles.bob} />
        <circle cx={CENTER} cy={CENTER + 56} r={2.5} className={styles.bobDot} />
      </g>

      {/* 針：テーパー＋カウンターウェイト。CSS でなめらかに運針 */}
      <g
        className={styles.handGroup}
        data-testid="clock-hand"
        data-angle={angle}
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <line x1={CENTER} y1={CENTER} x2={CENTER} y2={CENTER + 18} className={styles.handTail} />
        <circle cx={CENTER} cy={CENTER + 18} r={4} className={styles.counterweight} />
        <polygon
          className={styles.hand}
          points={`${CENTER},${HAND_TIP} ${CENTER + 1.6},${CENTER} ${CENTER - 1.6},${CENTER}`}
        />
      </g>

      {/* ハブ（中心） */}
      <circle cx={CENTER} cy={CENTER} r={6.5} className={styles.hubRing} />
      <circle cx={CENTER} cy={CENTER} r={3.5} className={styles.hub} />
    </svg>
  );
}

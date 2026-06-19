import { formatTime } from "./formatTime";
import styles from "./AnalogClock.module.css";

interface Props {
  /** 経過割合 0..1。針はこの割合だけ時計回りに回り、満了で一周する。 */
  progress: number;
  /** スクリーンリーダー用の残り時間（視覚的には数字を出さない）。 */
  remainingMs: number;
}

const CENTER = 100;
const NUMERAL_RADIUS = 76;
const FACE_RADIUS = 92;
const HAND_LENGTH = 64;

const NUMERALS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export function AnalogClock({ progress, remainingMs }: Props) {
  const angle = Math.min(1, Math.max(0, progress)) * 360;

  return (
    <svg
      viewBox="0 0 200 200"
      className={styles.clock}
      role="timer"
      aria-label={`残り ${formatTime(remainingMs)}`}
    >
      {/* 文字盤の枠（細線のみ） */}
      <circle cx={CENTER} cy={CENTER} r={FACE_RADIUS} className={styles.face} />
      <circle cx={CENTER} cy={CENTER} r={FACE_RADIUS - 5} className={styles.faceInner} />

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

      {/* 針（上=XII を起点に時計回り） */}
      <g transform={`rotate(${angle} ${CENTER} ${CENTER})`} data-testid="clock-hand">
        <line
          x1={CENTER}
          y1={CENTER}
          x2={CENTER}
          y2={CENTER - HAND_LENGTH}
          className={styles.hand}
        />
      </g>
      <circle cx={CENTER} cy={CENTER} r={4} className={styles.hub} />
    </svg>
  );
}

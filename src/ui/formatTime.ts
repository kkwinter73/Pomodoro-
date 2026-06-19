// 残り時間(ms)を mm:ss 表示に整形する純粋関数。
// 秒は切り上げ（開始直後に満了値ちょうどを表示し、0 まで自然にカウントダウンするため）。
export function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

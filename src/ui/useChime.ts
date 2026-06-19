import { useCallback, useRef } from "react";

// Web Audio で短いチャイムを生成する（音声アセット不要）。
// 自動再生制約に配慮し、AudioContext はユーザー操作起点の ensure() で生成/解放する。

type AudioCtor = typeof AudioContext;

function getAudioCtor(): AudioCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioCtor; webkitAudioContext?: AudioCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

export interface Chime {
  /** ユーザー操作起点で呼び、AudioContext を生成・resume する（自動再生のアンロック）。 */
  ensure: () => void;
  /** enabled かつ ensure 済みのときだけチャイムを鳴らす。 */
  play: () => void;
}

export function useChime(enabled: boolean): Chime {
  const ctxRef = useRef<AudioContext | null>(null);

  const ensure = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = getAudioCtor();
      if (!Ctor) return;
      try {
        ctxRef.current = new Ctor();
      } catch {
        ctxRef.current = null;
        return;
      }
    }
    void ctxRef.current?.resume();
  }, []);

  const play = useCallback(() => {
    if (!enabled) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = 880;
      // 短いポーンという減衰音
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // 再生失敗はタイマー機能を止めないため無視
    }
  }, [enabled]);

  return { ensure, play };
}

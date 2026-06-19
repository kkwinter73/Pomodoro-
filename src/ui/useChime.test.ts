import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useChime } from "./useChime";

function makeMockCtx() {
  const osc = {
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    frequency: { value: 0 },
    type: "sine",
  };
  const gain = {
    connect: vi.fn(),
    gain: {
      setValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
  };
  return {
    currentTime: 0,
    state: "running" as const,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    createOscillator: vi.fn(() => osc),
    createGain: vi.fn(() => gain),
    _osc: osc,
  };
}

afterEach(() => vi.unstubAllGlobals());

describe("useChime", () => {
  it("enabled なら ensure 後の play でオシレータが鳴る", () => {
    const ctx = makeMockCtx();
    vi.stubGlobal("AudioContext", vi.fn(() => ctx));

    const { result } = renderHook(() => useChime(true));
    act(() => result.current.ensure());
    act(() => result.current.play());

    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
    expect(ctx._osc.start).toHaveBeenCalled();
    expect(ctx._osc.stop).toHaveBeenCalled();
  });

  it("disabled なら play しても鳴らない", () => {
    const ctx = makeMockCtx();
    vi.stubGlobal("AudioContext", vi.fn(() => ctx));

    const { result } = renderHook(() => useChime(false));
    act(() => result.current.ensure());
    act(() => result.current.play());

    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it("ensure 前の play は何もせず例外も投げない", () => {
    vi.stubGlobal("AudioContext", vi.fn(() => makeMockCtx()));
    const { result } = renderHook(() => useChime(true));
    expect(() => act(() => result.current.play())).not.toThrow();
  });

  it("AudioContext 非対応環境でも ensure/play で例外を投げない", () => {
    vi.stubGlobal("AudioContext", undefined);
    const { result } = renderHook(() => useChime(true));
    expect(() => {
      act(() => result.current.ensure());
      act(() => result.current.play());
    }).not.toThrow();
  });
});

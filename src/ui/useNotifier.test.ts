import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useNotifier } from "./useNotifier";

class MockNotification {
  static permission: NotificationPermission = "granted";
  static requestPermission = vi.fn(async () => MockNotification.permission);
  static instances: MockNotification[] = [];
  constructor(
    public title: string,
    public options?: NotificationOptions,
  ) {
    MockNotification.instances.push(this);
  }
}

beforeEach(() => {
  MockNotification.permission = "granted";
  MockNotification.instances = [];
  MockNotification.requestPermission = vi.fn(async () => MockNotification.permission);
  vi.stubGlobal("Notification", MockNotification);
});

afterEach(() => vi.unstubAllGlobals());

describe("useNotifier", () => {
  it("enabled かつ granted で notify すると通知が作られる", () => {
    const { result } = renderHook(() => useNotifier(true));
    act(() => result.current.notify("タイトル", { body: "本文" }));
    expect(MockNotification.instances).toHaveLength(1);
    expect(MockNotification.instances[0].title).toBe("タイトル");
  });

  it("disabled なら notify しても通知しない", () => {
    const { result } = renderHook(() => useNotifier(false));
    act(() => result.current.notify("x"));
    expect(MockNotification.instances).toHaveLength(0);
  });

  it("permission が granted 以外なら通知しない", () => {
    MockNotification.permission = "default";
    const { result } = renderHook(() => useNotifier(true));
    act(() => result.current.notify("x"));
    expect(MockNotification.instances).toHaveLength(0);
  });

  it("requestPermission は結果を permission に反映する", async () => {
    MockNotification.permission = "denied";
    const { result } = renderHook(() => useNotifier(true));
    let returned: string | undefined;
    await act(async () => {
      returned = await result.current.requestPermission();
    });
    expect(returned).toBe("denied");
    expect(result.current.permission).toBe("denied");
  });

  it("Notification 非対応環境でも例外を投げず unsupported を返す", async () => {
    vi.stubGlobal("Notification", undefined);
    const { result } = renderHook(() => useNotifier(true));
    expect(result.current.permission).toBe("unsupported");
    await act(async () => {
      const p = await result.current.requestPermission();
      expect(p).toBe("unsupported");
    });
    expect(() => act(() => result.current.notify("x"))).not.toThrow();
  });
});

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { PomodoroTimer } from "./PomodoroTimer";

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(0);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  localStorage.clear();
});

// 数字表示は出さない設計のため、残り時間は時計の aria-label で確認する
const remaining = () => screen.getByRole("timer").getAttribute("aria-label");
const openSettings = () => fireEvent.click(screen.getByRole("button", { name: "設定" }));

describe("PomodoroTimer", () => {
  it("初期表示は 作業 / 残り25:00 / 開始ボタン", () => {
    render(<PomodoroTimer />);
    expect(screen.getByText("作業")).toBeInTheDocument();
    expect(remaining()).toBe("残り 25:00");
    expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("開始すると主ボタンが一時停止になり、時間が経つと残りが減る", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    expect(screen.getByRole("button", { name: "一時停止" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5_000));
    expect(remaining()).toBe("残り 24:55");
  });

  it("一時停止 → 再開 で計測が止まり再開する", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    act(() => vi.advanceTimersByTime(5_000));

    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    act(() => vi.advanceTimersByTime(10_000)); // 停止中は進まない
    expect(remaining()).toBe("残り 24:55");

    fireEvent.click(screen.getByRole("button", { name: "再開" }));
    act(() => vi.advanceTimersByTime(5_000));
    expect(remaining()).toBe("残り 24:50");
  });

  it("リセットで現フェーズの満了値に戻る", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    act(() => vi.advanceTimersByTime(30_000));
    expect(remaining()).toBe("残り 24:30");

    fireEvent.click(screen.getByRole("button", { name: "リセット" }));
    expect(remaining()).toBe("残り 25:00");
    expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("スキップで次フェーズ（小休憩 05:00）へ移る", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "スキップ" }));
    expect(screen.getByText("小休憩")).toBeInTheDocument();
    expect(remaining()).toBe("残り 05:00");
  });

  it("満了すると次フェーズへ遷移する", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    act(() => vi.advanceTimersByTime(25 * 60_000)); // work 満了

    expect(screen.getByText("小休憩")).toBeInTheDocument();
    expect(remaining()).toBe("残り 05:00");
  });

  it("設定を開いて作業時間を変えると idle 表示に即反映される", () => {
    render(<PomodoroTimer />);
    expect(remaining()).toBe("残り 25:00");
    openSettings();
    fireEvent.change(screen.getByLabelText("作業 (分)"), { target: { value: "30" } });
    expect(remaining()).toBe("残り 30:00");
  });

  it("通知が拒否済みなら通知トグルが無効化される", () => {
    vi.stubGlobal(
      "Notification",
      class {
        static permission: NotificationPermission = "denied";
        static requestPermission = vi.fn(async () => "denied" as NotificationPermission);
      },
    );
    render(<PomodoroTimer />);
    openSettings();
    expect(screen.getByLabelText("デスクトップ通知")).toBeDisabled();
  });
});

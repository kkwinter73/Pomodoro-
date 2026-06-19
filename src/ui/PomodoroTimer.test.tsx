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

const time = () => screen.getByRole("timer").textContent;

describe("PomodoroTimer", () => {
  it("初期表示は 作業 / 25:00 / 開始ボタン", () => {
    render(<PomodoroTimer />);
    expect(screen.getByText("作業")).toBeInTheDocument();
    expect(time()).toBe("25:00");
    expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("開始すると主ボタンが一時停止になり、時間が経つと表示が減る", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    expect(screen.getByRole("button", { name: "一時停止" })).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(5_000));
    expect(time()).toBe("24:55");
  });

  it("一時停止 → 再開 で計測が止まり再開する", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    act(() => vi.advanceTimersByTime(5_000));

    fireEvent.click(screen.getByRole("button", { name: "一時停止" }));
    act(() => vi.advanceTimersByTime(10_000)); // 停止中は進まない
    expect(time()).toBe("24:55");

    fireEvent.click(screen.getByRole("button", { name: "再開" }));
    act(() => vi.advanceTimersByTime(5_000));
    expect(time()).toBe("24:50");
  });

  it("リセットで現フェーズの満了値に戻る", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    act(() => vi.advanceTimersByTime(30_000));
    expect(time()).toBe("24:30");

    fireEvent.click(screen.getByRole("button", { name: "リセット" }));
    expect(time()).toBe("25:00");
    expect(screen.getByRole("button", { name: "開始" })).toBeInTheDocument();
  });

  it("スキップで次フェーズ（小休憩 05:00）へ移る", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "スキップ" }));
    expect(screen.getByText("小休憩")).toBeInTheDocument();
    expect(time()).toBe("05:00");
  });

  it("満了すると次フェーズへ遷移し完了数が増える", () => {
    render(<PomodoroTimer />);
    fireEvent.click(screen.getByRole("button", { name: "開始" }));
    act(() => vi.advanceTimersByTime(25 * 60_000)); // work 満了

    expect(screen.getByText("小休憩")).toBeInTheDocument();
    expect(screen.getByText("完了ポモドーロ: 1")).toBeInTheDocument();
  });

  it("設定で作業時間を変えると idle 表示に即反映される（#3）", () => {
    render(<PomodoroTimer />);
    expect(time()).toBe("25:00");
    fireEvent.change(screen.getByLabelText("作業 (分)"), { target: { value: "30" } });
    expect(time()).toBe("30:00");
  });

  it("通知が拒否済みなら通知トグルが無効化される（#6）", () => {
    vi.stubGlobal(
      "Notification",
      class {
        static permission: NotificationPermission = "denied";
        static requestPermission = vi.fn(async () => "denied" as NotificationPermission);
      },
    );
    render(<PomodoroTimer />);
    expect(screen.getByLabelText("デスクトップ通知")).toBeDisabled();
  });
});

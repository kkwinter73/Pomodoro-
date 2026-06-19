import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnalogClock } from "./AnalogClock";

const hand = () => screen.getByTestId("clock-hand").getAttribute("transform");

describe("AnalogClock", () => {
  it("残り時間を aria-label で公開する（数字は視覚表示しない）", () => {
    render(<AnalogClock progress={0} remainingMs={25 * 60_000} />);
    expect(screen.getByRole("timer").getAttribute("aria-label")).toBe("残り 25:00");
  });

  it("ローマ数字の文字盤を描画する", () => {
    render(<AnalogClock progress={0} remainingMs={0} />);
    expect(screen.getByText("XII")).toBeInTheDocument();
    expect(screen.getByText("III")).toBeInTheDocument();
  });

  it("針は経過割合に応じて時計回りに回る", () => {
    const { rerender } = render(<AnalogClock progress={0} remainingMs={0} />);
    expect(hand()).toBe("rotate(0 100 100)");
    rerender(<AnalogClock progress={0.25} remainingMs={0} />);
    expect(hand()).toBe("rotate(90 100 100)");
    rerender(<AnalogClock progress={0.5} remainingMs={0} />);
    expect(hand()).toBe("rotate(180 100 100)");
  });

  it("progress は 0..1 にクランプされる", () => {
    const { rerender } = render(<AnalogClock progress={1.5} remainingMs={0} />);
    expect(hand()).toBe("rotate(360 100 100)");
    rerender(<AnalogClock progress={-1} remainingMs={0} />);
    expect(hand()).toBe("rotate(0 100 100)");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DEFAULT_SETTINGS } from "../timer";
import { SettingsPanel } from "./SettingsPanel";

const input = (label: string) => screen.getByLabelText(label) as HTMLInputElement;

describe("SettingsPanel", () => {
  it("現在の設定値を表示する", () => {
    render(<SettingsPanel settings={DEFAULT_SETTINGS} onChange={() => {}} />);
    expect(input("作業 (分)").value).toBe("25");
    expect(input("長休憩までの回数").value).toBe("4");
    expect(input("音を鳴らす").checked).toBe(true);
    expect(input("デスクトップ通知").checked).toBe(false);
  });

  it("数値変更で onChange が更新後の設定を受け取る", () => {
    const onChange = vi.fn();
    render(<SettingsPanel settings={DEFAULT_SETTINGS} onChange={onChange} />);
    fireEvent.change(input("作業 (分)"), { target: { value: "30" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ workMin: 30 }));
  });

  it("範囲外の入力はクランプされる", () => {
    const onChange = vi.fn();
    render(<SettingsPanel settings={DEFAULT_SETTINGS} onChange={onChange} />);
    fireEvent.change(input("作業 (分)"), { target: { value: "999" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ workMin: 180 }));
    fireEvent.change(input("小休憩 (分)"), { target: { value: "0" } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ shortBreakMin: 1 }));
  });

  it("トグルで真偽値が反転する", () => {
    const onChange = vi.fn();
    render(<SettingsPanel settings={DEFAULT_SETTINGS} onChange={onChange} />);
    fireEvent.click(input("音を鳴らす"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ soundEnabled: false }));
    fireEvent.click(input("休憩を自動開始"));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ autoStartBreaks: true }));
  });
});

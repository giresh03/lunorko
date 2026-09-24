import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WebsiteGeneratorPanel from "@/components/editor/WebsiteGeneratorPanel";

const themeColors = {
  bg: "#111",
  card: "#222",
  text: "#eee",
  muted: "#999",
  border: "#333",
  accent: "#7c9cff",
};

describe("WebsiteGeneratorPanel", () => {
  it("shows the website generator control", () => {
    render(
      <WebsiteGeneratorPanel
        open={false}
        onToggle={vi.fn()}
        themeColors={themeColors}
        onGenerate={vi.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: /website generator/i })).toBeInTheDocument();
    expect(screen.queryByText(/full-stack website automation/i)).not.toBeInTheDocument();
  });

  it("sends the blueprint and brief", () => {
    const onGenerate = vi.fn();
    render(
      <WebsiteGeneratorPanel
        open
        onToggle={vi.fn()}
        themeColors={themeColors}
        onGenerate={onGenerate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /store/i }));
    fireEvent.change(screen.getByPlaceholderText(/bakery in lisbon/i), { target: { value: "Ceramic shop" } });
    fireEvent.click(screen.getByRole("button", { name: /generate website/i }));

    expect(onGenerate).toHaveBeenCalledWith("store", "Ceramic shop");
  });
});

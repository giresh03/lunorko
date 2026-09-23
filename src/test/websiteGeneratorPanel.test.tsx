import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebsiteGeneratorPanel } from "@/components/editor/WebsiteGeneratorPanel";

const theme = {
  text: "#fff",
  muted: "#aaa",
  accent: "#7c5cff",
  border: "#333",
  bg: "#111",
  card: "#222",
};

describe("WebsiteGeneratorPanel", () => {
  it("sends a blueprint and a custom brief to the assistant", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorPanel theme={theme} onGenerate={onGenerate} />);

    fireEvent.click(screen.getByRole("button", { name: /restaurant/i }));
    expect(onGenerate).toHaveBeenCalledWith("Generate a full-stack website for a coffee shop", "restaurant");

    fireEvent.change(screen.getByLabelText("Website brief"), { target: { value: "Build a blog called Field Notes" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));
    expect(onGenerate).toHaveBeenLastCalledWith("Build a blog called Field Notes");
  });
});
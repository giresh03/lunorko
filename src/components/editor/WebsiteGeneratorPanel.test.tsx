import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebsiteGeneratorPanel } from "./WebsiteGeneratorPanel";

const colors = {
  accent: "#1f6f5b",
  text: "#111",
  muted: "#666",
  border: "#ddd",
  card: "#fff",
  background: "#fafafa",
};

describe("WebsiteGeneratorPanel", () => {
  it("applies a blueprint and sends a custom brief to the assistant", () => {
    const onApplyBlueprint = vi.fn();
    const onGenerate = vi.fn();

    render(
      <WebsiteGeneratorPanel
        {...colors}
        onApplyBlueprint={onApplyBlueprint}
        onGenerate={onGenerate}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /portfolio/i }));
    expect(onApplyBlueprint).toHaveBeenCalledWith("portfolio");

    fireEvent.change(screen.getByPlaceholderText(/describe a site/i), { target: { value: "a bakery in Lisbon" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));
    expect(onGenerate).toHaveBeenCalledWith("a bakery in Lisbon", "portfolio");
  });
});

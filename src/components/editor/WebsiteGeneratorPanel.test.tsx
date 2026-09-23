import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebsiteGeneratorPanel } from "./WebsiteGeneratorPanel";

const theme = {
  accent: "#007acc",
  text: "#cccccc",
  muted: "#858585",
  border: "#3c3c3c",
  card: "#252526",
  bg: "#1e1e1e",
};

describe("WebsiteGeneratorPanel", () => {
  it("asks the assistant to generate the chosen site", async () => {
    const onGenerate = vi.fn();
    render(
      <WebsiteGeneratorPanel
        siteName=""
        onSiteNameChange={() => {}}
        onGenerate={onGenerate}
        themeColors={theme}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /portfolio/i }));
    expect(onGenerate).toHaveBeenCalledWith("portfolio");
  });
});

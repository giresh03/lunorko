import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebsiteGeneratorPanel } from "./WebsiteGeneratorPanel";
import { WEBSITE_BLUEPRINTS } from "@/lib/websiteGenerator";

const theme = {
  accent: "#7c5cff",
  text: "#f4f7fb",
  muted: "#9aa6bd",
  border: "#2a3148",
  card: "#151b2e",
  bg: "#0b1020",
};

describe("WebsiteGeneratorPanel", () => {
  it("sends the selected blueprint and brief to the assistant", async () => {
    const onGenerate = vi.fn();
    const onSelect = vi.fn();
    const onBriefChange = vi.fn();

    render(
      <WebsiteGeneratorPanel
        blueprints={WEBSITE_BLUEPRINTS}
        selectedId="restaurant"
        brief=""
        busy={false}
        themeColors={theme}
        onSelect={onSelect}
        onBriefChange={onBriefChange}
        onGenerate={onGenerate}
      />
    );

    expect(screen.getByText("Full-stack website")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Online store/i }));
    expect(onSelect).toHaveBeenCalledWith("store");

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ceramic shop" } });
    expect(onBriefChange).toHaveBeenCalledWith("Ceramic shop");

    fireEvent.click(screen.getByRole("button", { name: "Generate website" }));
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });
});
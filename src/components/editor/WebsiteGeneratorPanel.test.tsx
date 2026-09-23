import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WebsiteGeneratorPanel from "@/components/editor/WebsiteGeneratorPanel";

const theme = {
  bg: "#111",
  text: "#eee",
  muted: "#999",
  accent: "#5b8cff",
  border: "#333",
  card: "#1b1b1b",
};

describe("WebsiteGeneratorPanel", () => {
  it("sends the chosen blueprint to the assistant", () => {
    const onGenerate = vi.fn();
    const onSiteNameChange = vi.fn();
    render(
      <WebsiteGeneratorPanel
        siteName="Lunor Studio"
        onSiteNameChange={onSiteNameChange}
        onGenerate={onGenerate}
        themeColors={theme}
      />,
    );

    expect(screen.getByText("Full-stack website generator")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Store/ }));
    expect(onGenerate).toHaveBeenCalledWith("store");

    fireEvent.change(screen.getByLabelText("Site name"), { target: { value: "Field Shop" } });
    expect(onSiteNameChange).toHaveBeenCalledWith("Field Shop");
  });
});

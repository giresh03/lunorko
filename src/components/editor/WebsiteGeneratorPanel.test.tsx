import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebsiteGeneratorPanel } from "./WebsiteGeneratorPanel";

const theme = {
  accent: "#3ee0b0",
  text: "#fff",
  muted: "#999",
  border: "#333",
  card: "#111",
  bg: "#000",
};

describe("WebsiteGeneratorPanel", () => {
  it("builds the blueprint the user picks and passes the brief", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorPanel themeColors={theme} onGenerate={onGenerate} />);

    fireEvent.change(screen.getByLabelText("Website brief"), { target: { value: "Harbor Table reservations" } });
    fireEvent.click(screen.getByRole("button", { name: /Restaurant/ }));

    expect(onGenerate).toHaveBeenCalledWith("restaurant", "Harbor Table reservations");
  });

  it("matches a custom brief when Build is clicked", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorPanel themeColors={theme} onGenerate={onGenerate} />);

    fireEvent.change(screen.getByLabelText("Website brief"), { target: { value: "a bookstore website with an express api" } });
    fireEvent.click(screen.getByRole("button", { name: "Build" }));

    expect(onGenerate).toHaveBeenCalledWith("match", "a bookstore website with an express api");
  });
});

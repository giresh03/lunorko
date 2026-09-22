import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WebsiteGeneratorBar } from "./WebsiteGeneratorBar";

describe("WebsiteGeneratorBar", () => {
  it("sends the typed name with the chosen website", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorBar onGenerate={onGenerate} />);

    fireEvent.change(screen.getByPlaceholderText("Site name (optional)"), { target: { value: "Harbor Table" } });
    fireEvent.click(screen.getByRole("button", { name: "Restaurant" }));

    expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({
      kind: "restaurant",
      name: "Harbor Table",
    }));
  });

  it("uses the blueprint name when the field is empty", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorBar onGenerate={onGenerate} />);

    fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));

    expect(onGenerate).toHaveBeenCalledWith(expect.objectContaining({
      kind: "portfolio",
      name: "Northstar Studio",
    }));
  });
});

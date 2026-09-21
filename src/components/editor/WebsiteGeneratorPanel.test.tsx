import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WebsiteGeneratorPanel from "./WebsiteGeneratorPanel";

describe("WebsiteGeneratorPanel", () => {
  it("asks the assistant to generate the selected website", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorPanel onGenerate={onGenerate} />);

    fireEvent.click(screen.getByRole("button", { name: /portfolio/i }));

    expect(onGenerate).toHaveBeenCalledWith("Generate a full-stack portfolio website");
  });

  it("does not generate while the assistant is busy", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorPanel disabled onGenerate={onGenerate} />);

    const button = screen.getByRole("button", { name: /online store/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);

    expect(onGenerate).not.toHaveBeenCalled();
  });
});

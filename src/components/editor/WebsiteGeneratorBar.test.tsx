import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import WebsiteGeneratorBar from "@/components/editor/WebsiteGeneratorBar";

describe("WebsiteGeneratorBar", () => {
  it("offers each website automation and reports the chosen kind", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorBar onGenerate={onGenerate} />);

    for (const label of ["Landing", "Portfolio", "Blog", "Store", "Dashboard"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    fireEvent.click(screen.getByRole("button", { name: "Blog" }));
    expect(onGenerate).toHaveBeenCalledWith("blog");
  });

  it("does not fire while the assistant is busy", () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorBar disabled onGenerate={onGenerate} />);
    fireEvent.click(screen.getByRole("button", { name: "Landing" }));
    expect(onGenerate).not.toHaveBeenCalled();
  });
});

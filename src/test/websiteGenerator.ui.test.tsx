import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CodeEditorComponent from "@/components/CodeEditor";

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco" />,
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }) },
}));

describe("web development assistant website generator", () => {
  it("shows the full-stack generator and applies a site", async () => {
    Element.prototype.scrollIntoView = () => undefined;
    render(<CodeEditorComponent domainName="Web Development" />);

    expect(screen.getAllByText("Full-stack websites").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Restaurant" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Restaurant" }));

    expect(await screen.findByText(/Full-stack website ready — Luna Bistro/)).toBeInTheDocument();
    expect(screen.getAllByText("server.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText("api.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    const previews = Array.from(document.querySelectorAll("iframe")).map((frame) => frame.getAttribute("srcdoc") || "");
    expect(previews.some((html) => html.includes("Reserve a table"))).toBe(true);
    expect(previews.some((html) => html.includes("Citrus fennel salad"))).toBe(true);
  });

  it("does not show the generator in other domains", () => {
    Element.prototype.scrollIntoView = () => undefined;
    render(<CodeEditorComponent domainName="Data Science & ML" />);
    expect(screen.queryByText("Full-stack websites")).not.toBeInTheDocument();
  });
});

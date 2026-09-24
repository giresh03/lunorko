import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CodeEditor from "./CodeEditor";

vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => {} } }) },
}));

describe("web development website generator", () => {
  it("scaffolds a full-stack site from the assistant panel", async () => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    render(<CodeEditor domainName="Web Development" />);

    expect(screen.getAllByText("Website generator").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByPlaceholderText("Site name"), { target: { value: "Harbor Goods" } });
    fireEvent.click(screen.getByRole("button", { name: /Store/i }));

    expect(screen.getAllByText(/Harbor Goods/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/server\/server\.js/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getAllByText("server.js").length).toBeGreaterThan(0);
  });

  it("stays off the assistant in other domains", () => {
    window.HTMLElement.prototype.scrollIntoView = () => {};
    render(<CodeEditor domainName="Data Science" />);
    expect(screen.queryByPlaceholderText("Site name")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco" />,
  loader: {
    init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }),
  },
}));

import CodeEditor from "./CodeEditor";

describe("web development website generator panel", () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = () => undefined;
  });

  it("shows the generator only for Web Development and scaffolds a site", () => {
    const { unmount } = render(<CodeEditor domainName="Data Science" />);
    expect(screen.queryByText("Full-stack website generator")).not.toBeInTheDocument();
    unmount();

    render(<CodeEditor domainName="Web Development" />);
    expect(screen.getByText("Full-stack website generator")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Portfolio/i }));

    expect(screen.getAllByText(/Northline/).length).toBeGreaterThan(0);
    expect(screen.getByText(/client\/index.html/)).toBeInTheDocument();
    expect(screen.getByTitle("Web Preview")).toBeInTheDocument();
  });

  it("keeps a plain website request on the chat path", () => {
    render(<CodeEditor domainName="Web Development" />);
    const input = screen.getByPlaceholderText("Ask about web development...");
    fireEvent.change(input, { target: { value: "build a todo website" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.queryByText(/Generated a full-stack/)).not.toBeInTheDocument();
  });
});

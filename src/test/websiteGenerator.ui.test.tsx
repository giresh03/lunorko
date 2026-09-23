import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco" />,
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }) },
}));

import CodeEditor from "@/components/CodeEditor";

describe("web development assistant", () => {
  it("adds the website generator and applies a landing site", async () => {
    Element.prototype.scrollIntoView = () => undefined;
    render(<CodeEditor domainName="Web Development" />);
    expect((await screen.findAllByText("Website Generator")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Landing/i }));
    expect(await screen.findByText("Landing website ready:")).toBeInTheDocument();
    expect(screen.getAllByText("Lumina").length).toBeGreaterThan(0);
    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getAllByText("server.cjs").length).toBeGreaterThan(0);
  });

  it("keeps the generator off other domains", () => {
    Element.prototype.scrollIntoView = () => undefined;
    render(<CodeEditor domainName="App Development" />);
    expect(screen.queryByText("Website Generator")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  loader: {
    init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }),
  },
}));

vi.mock("@/components/editor/SandpackPreviewPanel", () => ({
  default: () => null,
}));

import CodeEditor from "./CodeEditor";

describe("web development website generator", () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("adds the generator to the web development assistant and writes the site", async () => {
    render(<CodeEditor domainName="Web Development" />);

    expect(screen.getByText(/Website generator/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Website" }));
    fireEvent.change(screen.getByPlaceholderText("Brand or project name"), {
      target: { value: "Harbor" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Portfolio/ }));
    fireEvent.click(screen.getByRole("button", { name: "Generate website" }));

    expect(await screen.findByText(/Portfolio generated for Harbor/)).toBeInTheDocument();
    expect(screen.getByText("index.js")).toBeInTheDocument();
    expect(screen.getByText(/cd server && npm install && npm start/)).toBeInTheDocument();

    const input = screen.getByPlaceholderText(/Ask about web development/i);
    fireEvent.change(input, { target: { value: "Build a restaurant called Olive" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(await screen.findByText(/Restaurant generated for Olive/)).toBeInTheDocument();
  });

  it("keeps the generator off other domain assistants", () => {
    render(<CodeEditor domainName="App Development" />);
    expect(screen.queryByRole("button", { name: "Website" })).not.toBeInTheDocument();
  });
});

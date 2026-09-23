import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CodeEditor from "./CodeEditor";

vi.mock("@monaco-editor/react", () => ({
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }) },
  default: () => <div data-testid="monaco" />,
}));

describe("web development website generator", () => {
  it("adds a restaurant site from the assistant preset", async () => {
    render(<CodeEditor domainName="Web Development" />);

    expect(screen.getByText("Full-stack website")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Restaurant" }));

    expect((await screen.findAllByText(/Luna Bistro/)).length).toBeGreaterThan(0);
    expect(screen.getByText("client")).toBeInTheDocument();
    expect(screen.getByText("server")).toBeInTheDocument();
    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getByText("routes.js")).toBeInTheDocument();
  });

  it("sends explain prompts to the model instead of generating a site", async () => {
    render(<CodeEditor domainName="Web Development" />);
    fireEvent.change(screen.getByPlaceholderText(/ask about web development/i), {
      target: { value: "Explain how CSS grid works" },
    });
    fireEvent.click(screen.getByTitle("Send message"));

    expect(await screen.findByText(/sign in to use the AI assistant/i)).toBeInTheDocument();
    expect(screen.queryByText("routes.js")).not.toBeInTheDocument();
  });
});

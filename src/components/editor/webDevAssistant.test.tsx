import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }) },
}));

import CodeEditor from "@/components/CodeEditor";

describe("web development assistant", () => {
  it("shows the website generator and writes the project into the editor", async () => {
    Element.prototype.scrollIntoView = () => undefined;
    render(<CodeEditor domainName="Web Development" />);

    expect(screen.getAllByText("Website generator").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Restaurant" }));

    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getAllByText("server.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Harbor Table/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("client").length).toBeGreaterThan(0);
    expect(screen.getAllByText("server").length).toBeGreaterThan(0);

    await waitFor(() => {
      const preview = document.querySelector("iframe[title='Web Preview']");
      expect(preview?.getAttribute("srcdoc") || "").toContain("Harbor Table");
      expect(preview?.getAttribute("srcdoc") || "").not.toContain('require("http")');
    });
  });

  it("keeps the generator off other domains", () => {
    Element.prototype.scrollIntoView = () => undefined;
    render(<CodeEditor domainName="Data Science & ML" />);
    expect(screen.queryByText("Website generator")).not.toBeInTheDocument();
  });
});

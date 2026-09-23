import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it } from "vitest";
import CodeEditor from "./CodeEditor";

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

describe("web development assistant", () => {
  it("builds a restaurant site from the full-stack websites grid", () => {
    render(<CodeEditor domainName="Web Development" />);
    expect(screen.getAllByText("Full-stack websites").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Restaurant/i }));
    expect(screen.getByText('🌐 Generated full-stack restaurant website "Hearth & Rye".')).toBeInTheDocument();
    expect(screen.getByText("server.js")).toBeInTheDocument();
    expect(screen.getByText("app.js")).toBeInTheDocument();
    const preview = Array.from(document.querySelectorAll("iframe"))
      .map((frame) => frame.getAttribute("srcdoc") || "")
      .find((html) => html.includes("data-themed"));
    expect(preview).toBeTruthy();
    expect(preview).toContain("const SEED");
    expect(preview).not.toContain("@lunor-runtime server");
    expect(preview).toContain("Tonight's menu");
  });

  it("keeps the generator off other domains", () => {
    render(<CodeEditor domainName="Cybersecurity" />);
    expect(screen.queryByText("Full-stack websites")).not.toBeInTheDocument();
  });
});

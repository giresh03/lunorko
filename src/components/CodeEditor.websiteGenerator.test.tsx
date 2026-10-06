import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import CodeEditor from "./CodeEditor";

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

describe("web development website generator", () => {
  it("shows the full-stack website automation only for web development", () => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.reject(new Error("offline"))));
    const { unmount } = render(<CodeEditor domainName="Web Development" />);

    expect(screen.getAllByText("Website Generator").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Build full-stack website" })).toBeInTheDocument();
    expect(screen.getByText("Landing page")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Store/ }));
    expect(screen.getByDisplayValue(/handmade ceramics/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Site name"), { target: { value: "Harbor Studio" } });
    fireEvent.click(screen.getByRole("button", { name: "Build full-stack website" }));

    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getByText("routes.js")).toBeInTheDocument();
    expect(screen.getAllByText("package.json").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Harbor Studio/).length).toBeGreaterThan(0);
    const preview = screen.getByTitle("Web Preview");
    const srcDoc = preview.getAttribute("srcdoc") || "";
    expect(srcDoc).toContain("Harbor Studio");
    expect(srcDoc).toContain("Speckled mug");
    expect(srcDoc).not.toContain("module.exports");

    unmount();
    render(<CodeEditor domainName="Data Science" />);
    expect(screen.queryByRole("button", { name: "Build full-stack website" })).not.toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});

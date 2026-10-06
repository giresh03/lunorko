import { fireEvent, render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import CodeEditor from "@/components/CodeEditor";

vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  loader: { init: () => Promise.resolve({ editor: { defineTheme() {} } }) },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  },
}));

beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
});

describe("web development website generator", () => {
  it("builds a full-stack site into the editor from the assistant", () => {
    render(<CodeEditor domainName="Web Development" />);

    expect(screen.getAllByText("Website Generator").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Restaurant" }));
    fireEvent.change(screen.getByPlaceholderText("Olive & Oak"), { target: { value: "Olive & Oak" } });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getAllByText("api.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cd server/).length).toBeGreaterThan(0);

    const preview = document.querySelector("iframe[title='Web Preview']") as HTMLIFrameElement | null;
    expect(preview?.getAttribute("srcdoc")).toContain("Olive &amp; Oak");
    expect(preview?.getAttribute("srcdoc")).toContain("Reserve a table");
    expect(preview?.getAttribute("srcdoc")).not.toContain("server/index.js");
  });

  it("builds a site when the assistant is asked to create a website", () => {
    render(<CodeEditor domainName="Web Development" />);
    const input = screen.getByPlaceholderText("Ask about web development...");
    fireEvent.change(input, { target: { value: "Build a store website called Harbor Goods" } });
    fireEvent.keyDown(input, { key: "Enter" });

    const preview = document.querySelector("iframe[title='Web Preview']") as HTMLIFrameElement | null;
    expect(preview?.getAttribute("srcdoc")).toContain("Harbor Goods");
    expect(preview?.getAttribute("srcdoc")).toContain("Add to cart");
    expect(screen.getAllByText("api.js").length).toBeGreaterThan(0);
  });

  it("does not show the website generator in other domains", () => {
    render(<CodeEditor domainName="Data Science" />);
    expect(screen.queryByText("Website Generator")).not.toBeInTheDocument();
  });
});

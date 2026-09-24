import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CodeEditor from "@/components/CodeEditor";

vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  loader: {
    init: () => Promise.resolve({ editor: { defineTheme: () => {} } }),
    config: () => {},
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
    },
  },
}));

describe("web development website generator", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = () => {};
  });

  it("adds the generator to the assistant and applies a full-stack site", async () => {
    render(<CodeEditor domainName="Web Development" />);

    expect(screen.getAllByText("Website Generator").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Restaurant" }));
    const brief = screen.getByPlaceholderText(/restaurant website/i);
    fireEvent.change(brief, { target: { value: 'Create a restaurant website called "Oak & Pine"' } });
    fireEvent.click(screen.getByRole("button", { name: "Generate" }));

    expect(screen.getByText(/full-stack restaurant website/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Oak & Pine/).length).toBeGreaterThan(0);
    expect(screen.getAllByText("server.js").length).toBeGreaterThan(0);
    expect(screen.getAllByText("styles.css").length).toBeGreaterThan(0);
    await waitFor(() => {
      const frame = document.querySelector("iframe");
      expect(frame?.getAttribute("srcdoc") || "").toContain("Oak &amp; Pine");
      expect(frame?.getAttribute("srcdoc") || "").toContain("Tonight");
      expect(frame?.getAttribute("srcdoc") || "").not.toContain("require(\"express\")");
    });
  });

  it("does not show the generator in other domains", () => {
    render(<CodeEditor domainName="Data Science" />);
    expect(screen.queryByText("Website Generator")).not.toBeInTheDocument();
  });
});

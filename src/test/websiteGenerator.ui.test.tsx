import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco" />,
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }) },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getSession: async () => ({ data: { session: null } }) } },
}));

vi.mock("@/components/editor/SandpackPreviewPanel", () => ({
  default: () => null,
}));

import CodeEditor from "@/components/CodeEditor";

describe("web development website generator", () => {
  it("writes a full-stack landing site from the assistant", () => {
    render(<CodeEditor domainName="Web Development" />);

    expect(screen.getAllByText("Website Generator").length).toBeGreaterThan(0);
    fireEvent.change(screen.getByPlaceholderText("Site name"), { target: { value: "Harbor & Co" } });
    fireEvent.click(screen.getByRole("button", { name: /Landing/i }));

    expect(screen.getByText(/Landing page generated for Harbor & Co/i)).toBeInTheDocument();
    expect(screen.getAllByText("index.html").length).toBeGreaterThan(0);
    expect(screen.getAllByText("server.js").length).toBeGreaterThan(0);
    expect(screen.getByText("client")).toBeInTheDocument();
    expect(screen.getByText("server")).toBeInTheDocument();
  });

  it("stays hidden outside web development", () => {
    render(<CodeEditor domainName="Data Science" />);
    expect(screen.queryByText("Website Generator")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@monaco-editor/react", () => ({
  default: () => null,
  loader: { init: () => Promise.resolve({ editor: { defineTheme: () => undefined } }) },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: null } }),
    },
  },
}));

vi.mock("@/components/editor/RunLocallyDialog", () => ({
  default: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/editor/SandpackPreviewPanel", () => ({
  default: () => null,
}));

import CodeEditor from "./CodeEditor";

describe("web development website generator", () => {
  beforeEach(() => {
    localStorage.clear();
    Element.prototype.scrollIntoView = () => undefined;
  });

  it("adds a generated site from the assistant panel", () => {
    render(<CodeEditor domainName="Web Development" />);
    expect(screen.getByText(/Website Generator/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /websites/i }));
    fireEvent.click(screen.getByRole("button", { name: /store/i }));
    fireEvent.change(screen.getByPlaceholderText("Site name"), { target: { value: "Field Goods" } });
    fireEvent.click(screen.getByRole("button", { name: /generate website/i }));

    expect(screen.getAllByText(/Field Goods/).length).toBeGreaterThan(0);
    expect(screen.getByText(/POST \/api\/orders/)).toBeInTheDocument();
    expect(screen.getAllByText("server.js").length).toBeGreaterThan(0);
  });

  it("does not show the website automation for other domains", () => {
    render(<CodeEditor domainName="Cybersecurity" />);
    expect(screen.queryByRole("button", { name: /websites/i })).not.toBeInTheDocument();
  });
});

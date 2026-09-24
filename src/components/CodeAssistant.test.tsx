import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import CodeAssistant from "@/components/CodeAssistant";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null } })),
    },
  },
}));

describe("Web Development assistant website generator", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_SUPABASE_URL", "http://localhost:54321");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "test-key");
  });

  it("scaffolds a full-stack store from the assistant automation", () => {
    const onSendToEditor = vi.fn();
    render(<CodeAssistant domainName="Web Development" onSendToEditor={onSendToEditor} />);

    expect(screen.getAllByText(/website generator/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Store" }));

    expect(screen.getAllByText(/Harbor Goods/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/POST \/api\/orders/).length).toBeGreaterThan(0);
    expect(onSendToEditor).toHaveBeenCalledTimes(1);
    const [html, language] = onSendToEditor.mock.calls[0];
    expect(language).toBe("html");
    expect(String(html)).toContain("<!DOCTYPE html>");
    expect(String(html)).toContain("Harbor Goods");
    expect(String(html)).toContain("Add to cart");
  });

  it("keeps the generator off other domain assistants", () => {
    render(<CodeAssistant domainName="Data Science & ML" />);
    expect(screen.queryByText(/website generator/i)).not.toBeInTheDocument();
  });
});

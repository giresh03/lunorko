import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import WebsiteGeneratorPanel from "./WebsiteGeneratorPanel";

const ui = {
  text: "#fff",
  muted: "#aaa",
  accent: "#8b7cff",
  border: "#333",
  card: "#111",
  bg: "#000",
};

describe("WebsiteGeneratorPanel", () => {
  it("generates the selected full-stack site", async () => {
    const onGenerate = vi.fn();
    render(<WebsiteGeneratorPanel ui={ui} onGenerate={onGenerate} />);

    fireEvent.click(screen.getByRole("option", { name: /restaurant/i }));
    fireEvent.change(screen.getByLabelText(/site name/i), { target: { value: "Evening Room" } });
    fireEvent.click(screen.getByRole("button", { name: /generate website code/i }));

    expect(onGenerate).toHaveBeenCalledTimes(1);
    const project = onGenerate.mock.calls[0][0];
    expect(project.kind).toBe("restaurant");
    expect(project.name).toBe("Evening Room");
    expect(project.files.some((f: { path: string }) => f.path === "server/src/modules/site/site.routes.js")).toBe(true);
    expect(project.files.find((f: { path: string }) => f.path === "client/index.html").content).toContain("Evening Room");
  });
});

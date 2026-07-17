// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LogForm } from "../src/components/LogForm";
import { sampleLogs } from "../src/health";

describe("LogForm", () => {
  it("renders the controlled daily-log fields and save action", () => {
    render(<LogForm value={sampleLogs[0]} editingId={null} onChange={vi.fn()} onSave={vi.fn()} onCancel={vi.fn()} busy={false} />);
    expect(screen.getByLabelText("Mood")).toHaveValue(6);
    expect(screen.getByRole("button", { name: "Save Daily Log" })).toBeInTheDocument();
  });
});

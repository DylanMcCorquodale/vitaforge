// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthCard } from "../src/components/AuthCard";
import { api } from "../src/api";

vi.mock("../src/api", () => ({ api: vi.fn() }));

const mockedApi = vi.mocked(api);

describe("AuthCard", () => {
  beforeEach(() => mockedApi.mockReset());
  afterEach(cleanup);

  it("switches between login and registration modes", () => {
    render(<AuthCard onAuthenticated={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /sign in to your dashboard/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /create an account/i }));

    expect(screen.getByRole("heading", { name: /create your vitaforge account/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });

  it("shows an API authentication error", async () => {
    mockedApi.mockRejectedValueOnce(new Error("Email or password is incorrect."));
    render(<AuthCard onAuthenticated={vi.fn()} />);

    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "dylan@example.com" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "incorrect-password" } });
    fireEvent.submit(screen.getByRole("button", { name: "Sign In" }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Email or password is incorrect."));
  });
});

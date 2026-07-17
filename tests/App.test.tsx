// @vitest-environment jsdom

import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "../src/App";
import { buildInsights, sampleLogs } from "../src/health";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}));

const navigation = vi.hoisted(() => ({ pathname: "/", router: { replace: vi.fn() } }));
vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => navigation.router
}));

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "content-type": "application/json" }
});

describe("App dashboard state", () => {
  beforeEach(() => {
    navigation.pathname = "/";
    navigation.router.replace.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("renders preview mode when no authenticated session exists", async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: "Sign in to continue." }, 401));
    render(<App />);

    await waitFor(() => expect(screen.getByText("Preview mode")).toBeInTheDocument());
    expect(screen.getByText(/dashboard below uses sample data/i)).toBeInTheDocument();
  });

  it("renders the authenticated dashboard with server insights", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const path = String(input);
      if (path === "/api/me") return jsonResponse({ user: { id: "USR-1", name: "Dylan", email: "dylan@example.com" } });
      if (path === "/api/logs") return jsonResponse({ logs: sampleLogs });
      if (path === "/api/insights") return jsonResponse(buildInsights(sampleLogs));
      if (path.startsWith("/api/foods/search")) return jsonResponse({ foods: [] });
      if (path.startsWith("/api/exercises/search")) return jsonResponse({ exercises: [] });
      return jsonResponse({ error: `Unexpected API path: ${path}` }, 500);
    });

    render(<App />);

    await waitFor(() => expect(screen.getByText("Welcome back, Dylan.")).toBeInTheDocument());
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    expect(screen.queryByText("Preview mode")).not.toBeInTheDocument();
  });

  it("redirects an unauthenticated dashboard request to login", async () => {
    navigation.pathname = "/dashboard";
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ error: "Sign in to continue." }, 401));

    render(<App />);

    await waitFor(() => expect(navigation.router.replace).toHaveBeenCalledWith("/login"));
  });
});

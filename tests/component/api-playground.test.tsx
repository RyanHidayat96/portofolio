import { ApiPlayground } from "@/features/api-playground/components/ApiPlayground";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("ApiPlayground", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders endpoint contract metadata", () => {
    render(<ApiPlayground />);

    expect(screen.getByText("GET /api/ryan")).toBeInTheDocument();
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("Endpoint")).toBeInTheDocument();
    expect(screen.getByText("Content-Type")).toBeInTheDocument();
    expect(screen.getByText("yearsOfExperience")).toBeInTheDocument();
  });

  it("sends request and displays measured response metadata", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ name: "Ryan Hidayat" }), {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ApiPlayground />);

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByText("200 OK")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith("/api/ryan", {
      headers: { Accept: "application/json" }
    });
    expect(screen.getAllByText("application/json").length).toBeGreaterThan(0);
    expect(screen.getByText(/Ryan Hidayat/)).toBeInTheDocument();
  });

  it("switches endpoint contract without duplicating response data", async () => {
    const user = userEvent.setup();
    render(<ApiPlayground />);

    await user.click(screen.getByRole("button", { name: /GET \/api\/skills/ }));

    expect(screen.getByText("skillGroups[].skills[].name")).toBeInTheDocument();
    expect(screen.getByText("// Response appears here")).toBeInTheDocument();
  });

  it("shows API failure state without stale success response", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("Network unavailable");
      })
    );
    render(<ApiPlayground />);

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByText("request failed")).toBeInTheDocument());
    expect(screen.getByText("Network unavailable")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(screen.queryByText("200 OK")).not.toBeInTheDocument();
  });
});

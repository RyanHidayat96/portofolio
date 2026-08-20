import { ApiPlayground } from "@/features/api-playground/components/ApiPlayground";
import { apiEndpoints } from "@/data/api-endpoints";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

describe("ApiPlayground", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders endpoint contract metadata", () => {
    const firstEndpoint = apiEndpoints[0];
    render(<ApiPlayground />);

    if (!firstEndpoint) {
      expect(screen.getByText("No API endpoints configured.")).toBeInTheDocument();
      return;
    }

    expect(screen.getByText(`${firstEndpoint.method} ${firstEndpoint.path}`)).toBeInTheDocument();
    expect(screen.getByText("Method")).toBeInTheDocument();
    expect(screen.getByText("Endpoint")).toBeInTheDocument();
    expect(screen.getByText("Content-Type")).toBeInTheDocument();
    expect(screen.getByText(firstEndpoint.responseShape[0] ?? "")).toBeInTheDocument();
  });

  it("sends request and displays measured response metadata", async () => {
    const user = userEvent.setup();
    const firstEndpoint = apiEndpoints[0];
    const fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({ name: "Portfolio Owner" }), {
        status: 200,
        statusText: "OK",
        headers: { "content-type": "application/json; charset=utf-8" }
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<ApiPlayground />);

    if (!firstEndpoint) {
      expect(screen.getByText("No API endpoints configured.")).toBeInTheDocument();
      return;
    }

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByText("200 OK")).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledWith(firstEndpoint.path, {
      headers: { Accept: "application/json" }
    });
    expect(screen.getAllByText("application/json").length).toBeGreaterThan(0);
    expect(screen.getByText(/Portfolio Owner/)).toBeInTheDocument();
  });

  it("switches endpoint contract without duplicating response data", async () => {
    const user = userEvent.setup();
    const secondEndpoint = apiEndpoints[1];
    render(<ApiPlayground />);

    if (!secondEndpoint) {
      expect(screen.getByText("No API endpoints configured.")).toBeInTheDocument();
      return;
    }

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`${secondEndpoint.method} ${secondEndpoint.path}`)
      })
    );

    expect(screen.getByText(secondEndpoint.responseShape[0] ?? "")).toBeInTheDocument();
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

    if (!apiEndpoints[0]) {
      expect(screen.getByText("No API endpoints configured.")).toBeInTheDocument();
      return;
    }

    await user.click(screen.getByRole("button", { name: "Send" }));

    await waitFor(() => expect(screen.getByText("request failed")).toBeInTheDocument());
    expect(screen.getByText("Network unavailable")).toBeInTheDocument();
    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(screen.queryByText("200 OK")).not.toBeInTheDocument();
  });
});

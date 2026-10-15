import { PortfolioApp } from "@/features/workspace/components/PortfolioApp";
import { resolveWorkspaceRouteFromPathname } from "@/features/workspace/routing";
import { projects } from "@/data/projects";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("PortfolioApp mode switching", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("keeps landing SSR CTA stable when browser boot state is persisted", () => {
    window.sessionStorage.setItem("portfolio.booted", "true");

    const html = renderToString(<PortfolioApp />);

    expect(html).toContain("Open Portfolio");
    expect(html).not.toContain("INITIALIZE PORTFOLIO");
    expect(html).not.toContain("ENTER WORKSPACE");
  });

  it("renders the recruiter overview and switches to the engineer playground", async () => {
    window.history.replaceState(null, "", "/overview");

    const view = render(
      <PortfolioApp initialRoute={resolveWorkspaceRouteFromPathname(window.location.pathname)} />
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: "Ryan Hidayat" })
    ).toBeInTheDocument();
    expect(screen.getByText("Professional Summary")).toBeInTheDocument();

    view.unmount();

    // The mode switch is expressed through routing now: engineer mode lives at /labs.
    window.history.replaceState(null, "", "/labs");

    render(
      <PortfolioApp initialRoute={resolveWorkspaceRouteFromPathname(window.location.pathname)} />
    );

    expect(
      await screen.findByRole("heading", {
        name: /Developer playground for the full portfolio system/i
      })
    ).toBeInTheDocument();
  }, 10_000);

  it("opens known deep links directly into the workspace", async () => {
    window.history.replaceState(null, "", "/labs/performance");

    render(
      <PortfolioApp initialRoute={resolveWorkspaceRouteFromPathname(window.location.pathname)} />
    );

    expect(await screen.findByText("Performance Lab")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/labs/performance");
  });

  it("syncs project slugs into browser history", async () => {
    const user = userEvent.setup();
    const initialProject = projects[0];
    const nextProject = projects[1] ?? initialProject;

    if (!initialProject || !nextProject) {
      return;
    }

    window.history.replaceState(null, "", `/projects/${initialProject.slug}`);

    render(
      <PortfolioApp initialRoute={resolveWorkspaceRouteFromPathname(window.location.pathname)} />
    );

    expect(await screen.findByRole("heading", { name: initialProject.title })).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: new RegExp(escapeRegExp(nextProject.title)) })
    );

    // Section changes run through the scene transition timers, so the URL is
    // written a frame later rather than synchronously.
    await waitFor(() => expect(window.location.pathname).toBe(`/projects/${nextProject.slug}`));
  });
});

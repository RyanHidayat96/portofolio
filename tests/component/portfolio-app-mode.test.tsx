import { PortfolioApp } from "@/features/workspace/components/PortfolioApp";
import { resolveWorkspaceRouteFromPathname } from "@/features/workspace/routing";
import { projects } from "@/data/projects";
import { render, screen } from "@testing-library/react";
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

  it("uses recruiter and engineer mode defaults from one mode state", async () => {
    const user = userEvent.setup();

    render(<PortfolioApp />);

    await user.click(screen.getByRole("button", { name: "Recruiter Mode" }));
    expect(
      screen.getByRole("heading", { name: /60-second overview for hiring teams/i })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/overview");

    await user.click(screen.getByRole("button", { name: /^Engineer\b/i }));
    expect(
      await screen.findByRole("heading", {
        name: /Developer playground for the full portfolio system/i
      })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/labs");

    await user.click(screen.getByRole("button", { name: /^Recruiter\b/i }));
    expect(
      await screen.findByRole("heading", { name: /60-second overview for hiring teams/i })
    ).toBeInTheDocument();
    expect(window.location.pathname).toBe("/overview");
  }, 10_000);

  it("opens known deep links directly into the workspace", async () => {
    window.history.replaceState(null, "", "/labs/performance");

    render(
      <PortfolioApp initialRoute={resolveWorkspaceRouteFromPathname(window.location.pathname)} />
    );

    expect(await screen.findByText("Performance Lab")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Engineer\b/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
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

    expect(window.location.pathname).toBe(`/projects/${nextProject.slug}`);
  });
});

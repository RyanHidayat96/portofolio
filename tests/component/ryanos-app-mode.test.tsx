import { RyanOSApp } from "@/features/workspace/components/RyanOSApp";
import { resolveWorkspaceRouteFromPathname } from "@/features/workspace/routing";
import { projects } from "@/data/projects";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("RyanOSApp mode switching", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("keeps landing SSR stable when browser boot state is persisted", () => {
    window.sessionStorage.setItem("ryanos.booted", "true");

    const html = renderToString(<RyanOSApp />);

    expect(html).toContain("INITIALIZE PORTFOLIO");
    expect(html).not.toContain("ENTER WORKSPACE");
  });

  it("uses recruiter and engineer mode defaults from one mode state", async () => {
    const user = userEvent.setup();

    render(<RyanOSApp />);

    await user.click(screen.getByRole("button", { name: "VIEW PROFILE" }));
    expect(screen.getByText("Education")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/profile");

    await user.click(screen.getByRole("button", { name: "engineer" }));
    expect(await screen.findByText("Break My Automation")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/labs/automation");

    await user.click(screen.getByRole("button", { name: "recruiter" }));
    expect(await screen.findByText("Professional Snapshot")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/overview");
  }, 10_000);

  it("opens known deep links directly into the workspace", async () => {
    window.history.replaceState(null, "", "/labs/performance");

    render(
      <RyanOSApp initialRoute={resolveWorkspaceRouteFromPathname(window.location.pathname)} />
    );

    expect(await screen.findByText("Performance Lab")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "engineer" })).toHaveAttribute(
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
      <RyanOSApp initialRoute={resolveWorkspaceRouteFromPathname(window.location.pathname)} />
    );

    expect(await screen.findByRole("heading", { name: initialProject.title })).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: new RegExp(escapeRegExp(nextProject.title)) })
    );

    expect(window.location.pathname).toBe(`/projects/${nextProject.slug}`);
  });
});

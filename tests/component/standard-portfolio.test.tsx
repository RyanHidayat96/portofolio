import { capabilities } from "@/data/capabilities";
import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { professionalExperience, skillApplications } from "@/data/professional-summary";
import { profile } from "@/data/profile";
import { ExperienceArtworkScreen } from "@/features/portfolio-3d/components/ExperienceArtworkScreen";
import { ArchitectureEmbeddedScreen, ContactEmbeddedScreen } from "@/features/portfolio-3d/components/PortfolioExperience";
import { ProfileArtworkScreen } from "@/features/portfolio-3d/components/ProfileArtworkScreen";
import { ExperiencePanel } from "@/features/workspace/components/ExperiencePanel";
import { OverviewPanel } from "@/features/workspace/components/OverviewPanel";
import { ProfilePanel } from "@/features/workspace/components/ProfilePanel";
import { WorkspaceShell } from "@/features/workspace/components/WorkspaceShell";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollTo", {
    configurable: true,
    value: vi.fn()
  });
});

describe("Standard portfolio hiring flow", () => {
  it("keeps profile, experience, contact, and CV reachable from the overview", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    render(<OverviewPanel mode="recruiter" onNavigate={navigate} />);
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute(
      "href",
      profile.contact.cv.href
    );
    for (const [label, section] of [
      ["View Profile", "profile"],
      ["View Experience", "experience"],
      ["Contact", "contact"]
    ]) {
      await user.click(screen.getByRole("button", { name: label }));
      expect(navigate).toHaveBeenLastCalledWith(section);
    }
  });

  it("shows education and lets readers reveal every technology on the profile", async () => {
    const user = userEvent.setup();
    const { container } = render(<ProfilePanel />);
    for (const credential of education) {
      expect(screen.getByText(credential.institution)).toBeVisible();
      expect(screen.getByText(credential.degree)).toBeVisible();
    }
    expect(screen.getByRole("link", { name: "Download CV" })).toHaveAttribute("download", "cv.pdf");
    expect(screen.getByRole("link", { name: "Email Ryan" })).toHaveAttribute(
      "href",
      profile.contact.email.href
    );
    for (const details of container.querySelectorAll("details")) {
      const summary = details.querySelector("summary")!;
      await user.click(summary);
      expect(details).toHaveAttribute("open");
    }
    for (const technology of new Set(
      capabilities.flatMap((capability) => capability.technologies)
    )) {
      expect(screen.getAllByText(technology).some((element) => element.closest("li"))).toBe(true);
    }
    const firstDetails = container.querySelector("details")!;
    await user.click(firstDetails.querySelector("summary")!);
    expect(firstDetails).not.toHaveAttribute("open");
  });

  it("shows all source roles with company, dates, and contributions in source order", () => {
    render(<ExperiencePanel />);
    const roles = within(
      screen.getByRole("list", { name: /Work experience, most recent first/ })
    ).getAllByRole("article");
    expect(roles).toHaveLength(experience.length);
    roles.forEach((article, index) => {
      const role = experience[index];
      expect(within(article).getByRole("heading", { name: role.role })).toBeVisible();
      expect(within(article).getByText(role.company)).toBeVisible();
      expect(within(article).getByText(role.period)).toBeVisible();
      expect(article.querySelectorAll(".professional-contributions > li").length).toBeGreaterThan(
        0
      );
    });
  });

  it("keeps room profile and experience screens synced with the standard portfolio data", () => {
    const { unmount } = render(<ProfileArtworkScreen interactive={false} />);
    expect(screen.getByRole("heading", { name: "Profile" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Professional Profile" })).toBeVisible();
    expect(screen.getByText("Development With a Quality Background")).toBeVisible();
    for (const credential of education) {
      expect(screen.getByText(credential.institution)).toBeVisible();
      expect(screen.getByText(credential.degree)).toBeVisible();
    }
    for (const application of Object.values(skillApplications)) {
      expect(screen.getByText(application.title)).toBeVisible();
    }
    expect(screen.queryByText("Public profile summary")).not.toBeInTheDocument();
    expect(screen.queryByText("Engineering Capability Matrix")).not.toBeInTheDocument();
    unmount();

    render(<ExperienceArtworkScreen interactive={false} />);
    expect(screen.getByRole("heading", { name: "Experience" })).toBeVisible();
    expect(screen.getByRole("heading", { name: "Work Experience" })).toBeVisible();
    const roomRoles = within(
      screen.getByRole("list", { name: /Work experience, most recent first/ })
    ).getAllByRole("article");
    expect(roomRoles).toHaveLength(professionalExperience.length);
    roomRoles.forEach((article, index) => {
      const role = professionalExperience[index];
      expect(within(article).getByRole("heading", { name: role.role })).toBeVisible();
      expect(within(article).getByText(role.company)).toBeVisible();
      expect(within(article).getByText(role.period)).toBeVisible();
      expect(article.querySelectorAll(".experience-artwork-contributions > li")).toHaveLength(
        role.contributions.length
      );
    });
    expect(screen.queryByText("Career shape, not resume detail.")).not.toBeInTheDocument();
    expect(screen.queryByText("CV has detail")).not.toBeInTheDocument();
  });

  it("labels room architecture and contact frame screens like the monitor screens", () => {
    const { unmount } = render(<ArchitectureEmbeddedScreen interactive={false} />);
    expect(screen.getByRole("heading", { name: "Architecture" })).toBeVisible();
    expect(screen.getByText("System topology")).toBeVisible();
    unmount();

    render(<ContactEmbeddedScreen interactive={false} />);
    expect(screen.getByRole("heading", { name: "Contact" })).toBeVisible();
    expect(screen.getByText("CV & channels")).toBeVisible();
  });

  it("preserves mobile section selection, room link, and command palette access", async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();
    const openPalette = vi.fn();
    render(
      <WorkspaceShell
        section="overview"
        onSectionChange={navigate}
        onOpenCommandPalette={openPalette}
        sceneKey="overview:recruiter"
        sceneTransition={{ phase: "idle", targetLabel: "Overview", sequence: 0 }}
      >
        <h1>Ryan Hidayat</h1>
      </WorkspaceShell>
    );
    const selector = screen.getByRole("combobox", { name: "Select workspace section" });
    for (const section of ["profile", "experience", "pipeline", "terminal"]) {
      await user.selectOptions(selector, section);
      expect(navigate).toHaveBeenLastCalledWith(section);
    }
    await user.click(screen.getByRole("button", { name: "Open command palette" }));
    expect(openPalette).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: /Back to room/i })).toHaveAttribute("href", "/");
  });
});

"use client";

import { Panel } from "@/components/ui/Panel";
import { BootSequence } from "@/features/workspace/components/BootSequence";
import { CommandPalette } from "@/features/workspace/components/CommandPalette";
import { ContactPanel } from "@/features/workspace/components/ContactPanel";
import { ExperiencePanel } from "@/features/workspace/components/ExperiencePanel";
import { Landing } from "@/features/workspace/components/Landing";
import { OverviewPanel } from "@/features/workspace/components/OverviewPanel";
import { ProfilePanel } from "@/features/workspace/components/ProfilePanel";
import { ProjectsPanel } from "@/features/workspace/components/ProjectsPanel";
import { WorkspaceShell } from "@/features/workspace/components/WorkspaceShell";
import { getPaletteActions, modeDefaultSection } from "@/features/workspace/navigation";
import {
  createRouteForSection,
  getWorkspacePath,
  homeWorkspaceRoute,
  resolveWorkspaceRouteFromPathname,
  type WorkspaceRouteState
} from "@/features/workspace/routing";
import type { WorkspaceMode, WorkspaceSection } from "@/features/workspace/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";

type AppPhase = "landing" | "boot" | "workspace";

const bootStorageKey = "ryanos.booted";
const bootStateChangeEvent = "ryanos.boot-state-change";

const AutomationLab = dynamic(
  () =>
    import("@/features/automation-lab/components/AutomationLab").then(
      (module) => module.AutomationLab
    ),
  {
    loading: () => <WorkspacePanelLoading label="Automation Lab" />
  }
);

const PipelineSimulatorPanel = dynamic(
  () =>
    import("@/features/pipeline/components/PipelineSimulatorPanel").then(
      (module) => module.PipelineSimulatorPanel
    ),
  {
    loading: () => <WorkspacePanelLoading label="Pipeline" />
  }
);

const PerformanceLab = dynamic(
  () =>
    import("@/features/performance-lab/components/PerformanceLab").then(
      (module) => module.PerformanceLab
    ),
  {
    loading: () => <WorkspacePanelLoading label="Performance Lab" />
  }
);

const ApiPlayground = dynamic(
  () =>
    import("@/features/api-playground/components/ApiPlayground").then(
      (module) => module.ApiPlayground
    ),
  {
    loading: () => <WorkspacePanelLoading label="API Lab" />
  }
);

const ArchitectureExplorer = dynamic(
  () =>
    import("@/features/architecture/components/ArchitectureExplorer").then(
      (module) => module.ArchitectureExplorer
    ),
  {
    loading: () => <WorkspacePanelLoading label="Architecture" />
  }
);

const TerminalPanel = dynamic<{
  readonly onNavigate: (section: WorkspaceSection) => void;
}>(
  () =>
    import("@/features/terminal/components/TerminalPanel").then((module) => module.TerminalPanel),
  {
    loading: () => <WorkspacePanelLoading label="Terminal" />
  }
);

const ChallengePanel = dynamic(
  () =>
    import("@/features/challenges/components/ChallengePanel").then(
      (module) => module.ChallengePanel
    ),
  {
    loading: () => <WorkspacePanelLoading label="Test Me" />
  }
);

export function RyanOSApp({
  initialRoute = homeWorkspaceRoute
}: Readonly<{
  initialRoute?: WorkspaceRouteState;
}>): React.ReactElement {
  const [phase, setPhase] = useState<AppPhase>(initialRoute.isDeepLink ? "workspace" : "landing");
  const hasBooted = useSyncExternalStore(
    subscribeToBootState,
    getClientBootState,
    getServerBootState
  );
  const [section, setSection] = useState<WorkspaceSection>(initialRoute.section);
  const [mode, setMode] = useState<WorkspaceMode>(initialRoute.mode);
  const [projectSlug, setProjectSlug] = useState<string | undefined>(initialRoute.projectSlug);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const paletteActions = useMemo(() => getPaletteActions(mode), [mode]);

  const writeBrowserRoute = useCallback(
    (route: WorkspaceRouteState, action: "push" | "replace") => {
      if (typeof window === "undefined") {
        return;
      }

      const path = getWorkspacePath(route);
      if (window.location.pathname === path) {
        return;
      }

      window.history[action === "push" ? "pushState" : "replaceState"](
        { section: route.section, mode: route.mode, projectSlug: route.projectSlug },
        "",
        path
      );
    },
    []
  );

  const applyWorkspaceRoute = useCallback(
    (
      route: WorkspaceRouteState,
      options: Readonly<{
        history?: "push" | "replace" | "none";
      }> = {}
    ) => {
      setSection(route.section);
      setMode(route.mode);
      setProjectSlug(route.projectSlug);
      setPhase(route.isDeepLink ? "workspace" : "landing");

      const historyAction = options.history ?? "push";
      if (historyAction !== "none") {
        writeBrowserRoute(route, historyAction);
      }
    },
    [writeBrowserRoute]
  );

  const navigateToSection = useCallback(
    (targetSection: WorkspaceSection) => {
      const nextRoute = createRouteForSection(targetSection, {
        mode:
          targetSection === "overview" && mode === "engineer"
            ? "engineer"
            : targetSection === "projects"
              ? "recruiter"
              : undefined,
        projectSlug: targetSection === "projects" ? projectSlug : undefined
      });

      applyWorkspaceRoute(nextRoute);
    },
    [applyWorkspaceRoute, mode, projectSlug]
  );

  const navigateToProject = useCallback(
    (targetProjectSlug: string) => {
      applyWorkspaceRoute(
        createRouteForSection("projects", {
          mode: "recruiter",
          projectSlug: targetProjectSlug
        })
      );
    },
    [applyWorkspaceRoute]
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      const isCommandPaletteShortcut =
        (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";
      if (isCommandPaletteShortcut) {
        event.preventDefault();
        setIsPaletteOpen(true);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onPopState = (): void => {
      const route = resolveWorkspaceRouteFromPathname(window.location.pathname);
      if (route.isKnownRoute) {
        applyWorkspaceRoute(route, { history: "none" });
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [applyWorkspaceRoute]);

  const enterWorkspace = useCallback(
    (targetSection: WorkspaceSection = "overview") => {
      applyWorkspaceRoute(createRouteForSection(targetSection));
    },
    [applyWorkspaceRoute]
  );

  const completeBoot = useCallback(() => {
    persistBootState();
    applyWorkspaceRoute(createRouteForSection("overview"), { history: "replace" });
  }, [applyWorkspaceRoute]);

  const changeMode = useCallback(
    (nextMode: WorkspaceMode) => {
      applyWorkspaceRoute(
        createRouteForSection(modeDefaultSection[nextMode], {
          mode: nextMode
        })
      );
    },
    [applyWorkspaceRoute]
  );

  const renderedSection = useMemo(() => {
    switch (section) {
      case "overview":
        return <OverviewPanel mode={mode} onNavigate={navigateToSection} />;
      case "profile":
        return <ProfilePanel />;
      case "experience":
        return <ExperiencePanel />;
      case "projects":
        return <ProjectsPanel activeSlug={projectSlug} onActiveSlugChange={navigateToProject} />;
      case "automation":
        return <AutomationLab />;
      case "pipeline":
        return <PipelineSimulatorPanel />;
      case "performance":
        return <PerformanceLab />;
      case "api":
        return <ApiPlayground />;
      case "architecture":
        return <ArchitectureExplorer />;
      case "terminal":
        return <TerminalPanel onNavigate={navigateToSection} />;
      case "challenge":
        return <ChallengePanel />;
      case "contact":
        return <ContactPanel />;
    }
  }, [mode, navigateToProject, navigateToSection, projectSlug, section]);

  if (phase === "landing") {
    return (
      <Landing
        hasBooted={hasBooted}
        onInitialize={() => {
          if (hasBooted) {
            enterWorkspace("overview");
          } else {
            setPhase("boot");
          }
        }}
        onViewProfile={() => enterWorkspace("profile")}
      />
    );
  }

  if (phase === "boot") {
    return <BootSequence onComplete={completeBoot} />;
  }

  return (
    <>
      <WorkspaceShell
        section={section}
        mode={mode}
        onSectionChange={navigateToSection}
        onModeChange={changeMode}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
      >
        {renderedSection}
      </WorkspaceShell>
      <CommandPalette
        isOpen={isPaletteOpen}
        actions={paletteActions}
        onClose={() => setIsPaletteOpen(false)}
        onSelect={navigateToSection}
      />
    </>
  );
}

function subscribeToBootState(onStoreChange: () => void): () => void {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(bootStateChangeEvent, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(bootStateChangeEvent, onStoreChange);
  };
}

function getClientBootState(): boolean {
  return window.sessionStorage.getItem(bootStorageKey) === "true";
}

function getServerBootState(): boolean {
  return false;
}

function persistBootState(): void {
  window.sessionStorage.setItem(bootStorageKey, "true");
  window.dispatchEvent(new Event(bootStateChangeEvent));
}

function WorkspacePanelLoading({ label }: Readonly<{ label: string }>): React.ReactElement {
  return (
    <Panel className="p-5 sm:p-7">
      <p className="mono text-sm text-[var(--accent)]">{label.toLowerCase()}.loading</p>
      <div className="mt-5 h-2 w-full overflow-hidden bg-[var(--surface)]">
        <div className="h-full w-1/3 bg-[var(--accent)]" />
      </div>
    </Panel>
  );
}

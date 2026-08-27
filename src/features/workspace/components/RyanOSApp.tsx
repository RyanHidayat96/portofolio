"use client";

import { Panel } from "@/components/ui/Panel";
import { CustomCursor } from "@/features/interaction/components/CustomCursor";
import { useReducedMotion } from "@/features/interaction/hooks/useReducedMotion";
import { BootSequence } from "@/features/workspace/components/BootSequence";
import { Landing } from "@/features/workspace/components/Landing";
import { OverviewPanel } from "@/features/workspace/components/OverviewPanel";
import { WorkspaceShell } from "@/features/workspace/components/WorkspaceShell";
import { getNavigationItem, getPaletteActions, type PaletteAction } from "@/features/workspace/navigation";
import {
  createRouteForSection,
  getWorkspacePath,
  homeWorkspaceRoute,
  resolveWorkspaceRouteFromPathname,
  type WorkspaceRouteState
} from "@/features/workspace/routing";
import type { WorkspaceSceneTransition, WorkspaceSection } from "@/features/workspace/types";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";

type AppPhase = "landing" | "boot" | "workspace";

const bootStorageKey = "ryanos.booted";
const bootStateChangeEvent = "ryanos.boot-state-change";
const sceneTransitionExitMs = 110;
const sceneTransitionEnterMs = 240;
const idleSceneTransition: WorkspaceSceneTransition = {
  phase: "idle",
  targetLabel: "Overview",
  sequence: 0
};

const CommandPalette = dynamic<{
  readonly isOpen: boolean;
  readonly actions: readonly PaletteAction[];
  readonly onClose: () => void;
  readonly onSelect: (action: PaletteAction) => void;
}>(
  () =>
    import("@/features/workspace/components/CommandPalette").then(
      (module) => module.CommandPalette
    ),
  {
    loading: () => null
  }
);

const ContactPanel = dynamic(
  () =>
    import("@/features/workspace/components/ContactPanel").then((module) => module.ContactPanel),
  {
    loading: () => <WorkspacePanelLoading label="Contact" />
  }
);

const ExperiencePanel = dynamic(
  () =>
    import("@/features/workspace/components/ExperiencePanel").then(
      (module) => module.ExperiencePanel
    ),
  {
    loading: () => <WorkspacePanelLoading label="Experience" />
  }
);

const ProfilePanel = dynamic(
  () =>
    import("@/features/workspace/components/ProfilePanel").then((module) => module.ProfilePanel),
  {
    loading: () => <WorkspacePanelLoading label="Profile" />
  }
);

const ProjectsPanel = dynamic<{
  readonly activeSlug?: string;
  readonly onActiveSlugChange?: (slug: string) => void;
  readonly onExploreArchitecture?: () => void;
}>(
  () =>
    import("@/features/workspace/components/ProjectsPanel").then((module) => module.ProjectsPanel),
  {
    loading: () => <WorkspacePanelLoading label="Projects" />
  }
);

const QualityEngineeringHub = dynamic(
  () =>
    import("@/features/quality/components/QualityEngineeringHub").then(
      (module) => module.QualityEngineeringHub
    ),
  {
    loading: () => <WorkspacePanelLoading label="Quality Lab" />
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
  const [mode, setMode] = useState(initialRoute.mode);
  const [projectSlug, setProjectSlug] = useState<string | undefined>(initialRoute.projectSlug);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [sceneTransition, setSceneTransition] =
    useState<WorkspaceSceneTransition>(idleSceneTransition);
  const prefersReducedMotion = useReducedMotion();
  const transitionSequenceRef = useRef(0);
  const sceneTransitionTimerIdsRef = useRef<number[]>([]);
  const paletteActions = useMemo(() => getPaletteActions(), []);

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

  const clearSceneTransitionTimers = useCallback((): void => {
    sceneTransitionTimerIdsRef.current.forEach((timerId) => window.clearTimeout(timerId));
    sceneTransitionTimerIdsRef.current = [];
  }, []);

  const scheduleSceneTransitionTimer = useCallback(
    (callback: () => void, delayMs: number): void => {
      const timerId = window.setTimeout(() => {
        sceneTransitionTimerIdsRef.current = sceneTransitionTimerIdsRef.current.filter(
          (storedTimerId) => storedTimerId !== timerId
        );
        callback();
      }, delayMs);

      sceneTransitionTimerIdsRef.current.push(timerId);
    },
    []
  );

  const runWorkspaceTransition = useCallback(
    (
      route: WorkspaceRouteState,
      options: Readonly<{
        history?: "push" | "replace" | "none";
      }> = {}
    ) => {
      const isSameRoute =
        phase === "workspace" &&
        route.section === section &&
        route.mode === mode &&
        (route.projectSlug ?? "") === (projectSlug ?? "");

      if (prefersReducedMotion || phase !== "workspace" || isSameRoute) {
        clearSceneTransitionTimers();
        setSceneTransition((current) => ({
          phase: "idle",
          targetLabel: getNavigationItem(route.section).label,
          sequence: current.sequence
        }));
        applyWorkspaceRoute(route, options);
        return;
      }

      clearSceneTransitionTimers();
      const targetLabel = getNavigationItem(route.section).label;
      transitionSequenceRef.current += 1;
      const exitSequence = transitionSequenceRef.current;

      setSceneTransition({ phase: "exit", targetLabel, sequence: exitSequence });

      scheduleSceneTransitionTimer(() => {
        applyWorkspaceRoute(route, options);
        transitionSequenceRef.current += 1;
        const enterSequence = transitionSequenceRef.current;
        setSceneTransition({ phase: "enter", targetLabel, sequence: enterSequence });

        scheduleSceneTransitionTimer(() => {
          setSceneTransition({ phase: "idle", targetLabel, sequence: enterSequence });
        }, sceneTransitionEnterMs);
      }, sceneTransitionExitMs);
    },
    [
      applyWorkspaceRoute,
      clearSceneTransitionTimers,
      mode,
      phase,
      prefersReducedMotion,
      projectSlug,
      scheduleSceneTransitionTimer,
      section
    ]
  );

  useEffect(() => clearSceneTransitionTimers, [clearSceneTransitionTimers]);
  const navigateToSection = useCallback(
    (targetSection: WorkspaceSection) => {
      runWorkspaceTransition(
        createRouteForSection(targetSection, {
          projectSlug: targetSection === "projects" ? projectSlug : undefined
        })
      );
    },
    [projectSlug, runWorkspaceTransition]
  );

  const navigateToProject = useCallback(
    (targetProjectSlug: string) => {
      runWorkspaceTransition(
        createRouteForSection("projects", {
          projectSlug: targetProjectSlug
        })
      );
    },
    [runWorkspaceTransition]
  );

  const runPaletteAction = useCallback(
    (action: PaletteAction) => {
      if (action.href) {
        if (action.isExternal) {
          window.open(action.href, "_blank", "noopener,noreferrer");
        } else {
          window.location.assign(action.href);
        }
        return;
      }

      if (!action.section) {
        return;
      }

      runWorkspaceTransition(
        createRouteForSection(action.section, {
          mode: action.mode,
          projectSlug: action.section === "projects" ? action.projectSlug : undefined
        })
      );
    },
    [runWorkspaceTransition]
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

  const enterWorkspace = useCallback(() => {
    persistBootState();
    applyWorkspaceRoute(createRouteForSection("overview"), { history: "push" });
  }, [applyWorkspaceRoute]);

  const completeBoot = useCallback(() => {
    persistBootState();
    applyWorkspaceRoute(createRouteForSection("overview"), { history: "replace" });
  }, [applyWorkspaceRoute]);

  const renderedSection = useMemo(() => {
    switch (section) {
      case "overview":
        return <OverviewPanel mode={mode} onNavigate={navigateToSection} />;
      case "profile":
        return <ProfilePanel />;
      case "experience":
        return <ExperiencePanel />;
      case "projects":
        return (
          <ProjectsPanel
            activeSlug={projectSlug}
            onActiveSlugChange={navigateToProject}
            onExploreArchitecture={() => navigateToSection("architecture")}
          />
        );
      case "automation":
        return <QualityEngineeringHub />;
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
      <>
        <CustomCursor />
        <Landing
          onInitialize={() => {
            if (hasBooted) {
              enterWorkspace();
            } else {
              setPhase("boot");
            }
          }}
        />
      </>
    );
  }

  if (phase === "boot") {
    return (
      <>
        <CustomCursor />
        <BootSequence onComplete={completeBoot} />
      </>
    );
  }

  return (
    <>
      <CustomCursor />
      <WorkspaceShell
        section={section}
        onSectionChange={navigateToSection}
        onOpenCommandPalette={() => setIsPaletteOpen(true)}
        sceneTransition={sceneTransition}
        sceneKey={`${section}:${projectSlug ?? "index"}`}
      >
        {renderedSection}
      </WorkspaceShell>
      <CommandPalette
        isOpen={isPaletteOpen}
        actions={paletteActions}
        onClose={() => setIsPaletteOpen(false)}
        onSelect={runPaletteAction}
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

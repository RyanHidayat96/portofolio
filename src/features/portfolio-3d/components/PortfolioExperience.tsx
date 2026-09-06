'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { Activity, Briefcase, ExternalLink, FolderKanban, Gauge, GitBranch, House, Monitor, Network, Server, ShieldCheck, Terminal, UserRound, Workflow, type LucideIcon } from 'lucide-react';
import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { withPortfolio3dBasePath } from '../asset-url';
import type { EmbeddedScreenId } from '../arcade-screen';
import type {
  Portfolio3dHotspotDefinition,
  Portfolio3dHotspotId,
  Portfolio3dLoadingProgress,
  Portfolio3dQualityTier,
  Portfolio3dSectionId
} from '../types';
import {
  configurePortfolio3dRenderer,
  getInitialPortfolio3dDpr,
  portfolio3dDefaultCamera,
  portfolio3dRendererOptions,
  portfolio3dRendererPerformance
} from '../renderer-config';
import {
  createPortfolio3dLocationPath,
  isPortfolio3dRouteQueryValue,
  portfolio3dSectionQueryParam,
  resolvePortfolio3dSectionFromLocation
} from '../route-map';
import { portfolio3dHotspots } from '../scene-manifest';
import { portfolio3dSectionContracts } from '../section-contracts';
import {
  getPortfolio3dPanelContent,
  isPortfolio3dSafeHref,
  type Portfolio3dPanelBlock
} from '../screen-content';
import { ArcadePipelineControls, ArcadePipelineScreen } from './ArcadePipelineScreen';
import { ApiMonitorControls, ApiMonitorScreen } from './ApiMonitorScreen';
import { AutomationMonitorControls, AutomationMonitorScreen } from './AutomationMonitorScreen';
import { ExperienceArtworkControls, ExperienceArtworkScreen } from './ExperienceArtworkScreen';
import { PerformanceMonitorControls, PerformanceMonitorScreen } from './PerformanceMonitorScreen';
import { ProfileArtworkControls, ProfileArtworkScreen } from './ProfileArtworkScreen';
import { TerminalMonitorControls, TerminalMonitorScreen } from './TerminalMonitorScreen';
import { ExperienceShell } from './ExperienceShell';
import { Portfolio3dHtmlFallback } from './Portfolio3dHtmlFallback';
import { useDocumentVisibility } from '../hooks/useDocumentVisibility';
import { useWebGLSupport } from '../hooks/useWebGLSupport';
import { Portfolio3dProvider, usePortfolio3dState } from '../state/Portfolio3dState';
import { RoomShellStage } from './RoomShellStage';

interface Portfolio3dErrorBoundaryState {
  readonly hasError: boolean;
}

const portfolio3dAreaLabels = {
  overview: 'Overview',
  profile: 'About Me',
  experience: 'Experience',
  projects: 'Projects',
  fullstack: 'Full Stack',
  backend: 'Backend/API',
  architecture: 'Architecture',
  automation: 'Automation',
  performance: 'Performance Lab',
  pipeline: 'CI/CD Pipeline',
  terminal: 'Terminal',
  contact: 'Contact'
} satisfies Partial<Record<Portfolio3dSectionId, string>>;

const portfolio3dAreaIcons = {
  overview: House,
  profile: UserRound,
  experience: Briefcase,
  projects: FolderKanban,
  fullstack: Workflow,
  backend: Server,
  architecture: Network,
  automation: ShieldCheck,
  performance: Gauge,
  pipeline: GitBranch,
  terminal: Terminal,
  contact: Activity
} satisfies Partial<Record<Portfolio3dSectionId, LucideIcon>>;

export function PortfolioExperience(): React.ReactElement {
  const fallback = <Portfolio3dHtmlFallback />;

  return (
    <Portfolio3dErrorBoundary fallback={fallback}>
      <Portfolio3dProvider>
        <PortfolioExperienceContent fallback={fallback} />
      </Portfolio3dProvider>
    </Portfolio3dErrorBoundary>
  );
}

function PortfolioExperienceContent({
  fallback
}: Readonly<{
  fallback: React.ReactNode;
}>): React.ReactElement {
  const webglStatus = useWebGLSupport();
  const { state } = usePortfolio3dState();
  const [assetProgress, setAssetProgress] = useState<Portfolio3dLoadingProgress>();
  const [embeddedScreenElements, setEmbeddedScreenElements] = useState<Partial<Record<EmbeddedScreenId, HTMLElement>>>({});
  const isPipelineActive = state.activeSectionId === 'pipeline';
  const isAutomationActive = state.activeSectionId === 'automation';
  const isPerformanceActive = state.activeSectionId === 'performance';
  const isBackendActive = state.activeSectionId === 'backend';
  const isTerminalActive = state.activeSectionId === 'terminal';
  const isProfileActive = state.activeSectionId === 'profile';
  const isExperienceActive = state.activeSectionId === 'experience';
  const isSettledAtSection = state.navigationState === 'section-open';
  const activeEmbeddedScreenId = getEmbeddedScreenId(state.activeSectionId);
  const isScreenFocusView = Boolean(
    activeEmbeddedScreenId &&
    embeddedScreenElements[activeEmbeddedScreenId] &&
    isSettledAtSection
  );
  const handleEmbeddedScreenReady = useCallback(
    (screenId: EmbeddedScreenId, element: HTMLElement | null): void => {
      setEmbeddedScreenElements((current) => {
        if (current[screenId] === element) return current;

        const next = { ...current };
        if (element) {
          next[screenId] = element;
        } else {
          delete next[screenId];
        }
        return next;
      });
    },
    []
  );

  return (
    <>
      <Portfolio3dRouteController />
      <ExperienceShell
        webglStatus={webglStatus}
        fallbackSlot={fallback}
        canvasSlot={
          webglStatus === 'supported' ? (
            <FoundationCanvas
              qualityTier={state.qualityTier}
              onCriticalProgressChange={setAssetProgress}
              onEmbeddedScreenReady={handleEmbeddedScreenReady}
            />
          ) : null
        }
        navigationSlot={<Portfolio3dNavigation />}
        sectionPanelSlot={
          state.activeSectionId === 'overview'
            ? null
            : isScreenFocusView
              ? null
              : <Portfolio3dSectionPanel />
        }
        focusControlsSlot={
          isScreenFocusView
            ? isProfileActive
              ? <ProfileArtworkControls />
              : isExperienceActive
                ? <ExperienceArtworkControls />
                : isPipelineActive
                  ? <ArcadePipelineControls />
                  : isAutomationActive
                    ? <AutomationMonitorControls />
                    : isPerformanceActive
                      ? <PerformanceMonitorControls />
                      : isBackendActive
                        ? <ApiMonitorControls />
                        : isTerminalActive
                          ? <TerminalMonitorControls />
                          : null
            : null
        }
        instructionHintSlot={<Portfolio3dInstructionHint />}
        assetProgress={assetProgress}
        isScreenFocusView={isScreenFocusView}
      />
      {embeddedScreenElements.pipeline
        ? createPortal(<ArcadePipelineScreen interactive={isScreenFocusView && isPipelineActive} />, embeddedScreenElements.pipeline)
        : null}
      {embeddedScreenElements.automation
        ? createPortal(<AutomationMonitorScreen interactive={isScreenFocusView && isAutomationActive} />, embeddedScreenElements.automation)
        : null}
      {embeddedScreenElements.performance
        ? createPortal(<PerformanceMonitorScreen interactive={isScreenFocusView && isPerformanceActive} />, embeddedScreenElements.performance)
        : null}
      {embeddedScreenElements.backend
        ? createPortal(<ApiMonitorScreen interactive={isScreenFocusView && isBackendActive} />, embeddedScreenElements.backend)
        : null}
      {embeddedScreenElements.terminal
        ? createPortal(<TerminalMonitorScreen interactive={isScreenFocusView && isTerminalActive} />, embeddedScreenElements.terminal)
        : null}
      {embeddedScreenElements.profile
        ? createPortal(<ProfileArtworkScreen interactive={isScreenFocusView && isProfileActive} />, embeddedScreenElements.profile)
        : null}
      {embeddedScreenElements.experience
        ? createPortal(<ExperienceArtworkScreen interactive={isScreenFocusView && isExperienceActive} />, embeddedScreenElements.experience)
        : null}
    </>
  );
}

function Portfolio3dRouteController(): null {
  const { state, setActiveSection } = usePortfolio3dState();
  const initialLocationSyncedRef = useRef(false);
  const historySyncRef = useRef(false);

  useEffect(() => {
    const syncFromLocation = (): void => {
      const searchParams = new URLSearchParams(window.location.search);
      const queryValue = searchParams.get(portfolio3dSectionQueryParam)?.trim();
      const hashValue = window.location.hash.replace(/^#/, '').trim();

      if (!queryValue && hashValue && !isPortfolio3dRouteQueryValue(hashValue)) {
        return;
      }

      const sectionId = resolvePortfolio3dSectionFromLocation(window.location.search, window.location.hash);
      historySyncRef.current = true;
      setActiveSection(sectionId);
      window.setTimeout(() => {
        historySyncRef.current = false;
      }, 0);
    };

    syncFromLocation();
    window.queueMicrotask(() => {
      initialLocationSyncedRef.current = true;
    });

    window.addEventListener('popstate', syncFromLocation);
    window.addEventListener('hashchange', syncFromLocation);

    return () => {
      window.removeEventListener('popstate', syncFromLocation);
      window.removeEventListener('hashchange', syncFromLocation);
    };
  }, [setActiveSection]);

  useEffect(() => {
    if (!initialLocationSyncedRef.current) {
      return;
    }

    const nextPath = createPortfolio3dLocationPath(
      state.activeSectionId,
      window.location.pathname,
      window.location.search
    );
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (nextPath === currentPath && !window.location.hash) {
      return;
    }

    const nextState = {
      ...(window.history.state ?? {}),
      portfolio3dSection: state.activeSectionId
    };
    const method = historySyncRef.current ? 'replaceState' : 'pushState';
    window.history[method](nextState, '', nextPath);
    historySyncRef.current = false;
  }, [state.activeSectionId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || state.activeSectionId === 'overview') {
        return;
      }

      event.preventDefault();
      setActiveSection('overview');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setActiveSection, state.activeSectionId]);

  return null;
}

function FoundationCanvas({
  qualityTier,
  onCriticalProgressChange,
  onEmbeddedScreenReady
}: Readonly<{
  qualityTier: Portfolio3dQualityTier;
  onCriticalProgressChange?: (progress: Portfolio3dLoadingProgress) => void;
  onEmbeddedScreenReady?: (screenId: EmbeddedScreenId, element: HTMLElement | null) => void;
}>): React.ReactElement {
  const isDocumentVisible = useDocumentVisibility();
  const dpr = useMemo(() => getInitialPortfolio3dDpr(qualityTier), [qualityTier]);

  return (
    <Canvas
      className="absolute inset-0 h-full w-full"
      dpr={dpr}
      frameloop={isDocumentVisible ? 'demand' : 'never'}
      camera={portfolio3dDefaultCamera}
      gl={portfolio3dRendererOptions}
      performance={portfolio3dRendererPerformance}
      resize={{ scroll: false }}
      onCreated={({ gl }) => {
        configurePortfolio3dRenderer(gl);
        gl.domElement.setAttribute('aria-hidden', 'true');
        gl.domElement.tabIndex = -1;
      }}
    >
      <CanvasVisibilityInvalidator isVisible={isDocumentVisible} qualityTier={qualityTier} />
      <Suspense fallback={null}>
        <FoundationScene
          qualityTier={qualityTier}
          onCriticalProgressChange={onCriticalProgressChange}
          onEmbeddedScreenReady={onEmbeddedScreenReady}
        />
      </Suspense>
    </Canvas>
  );
}

function CanvasVisibilityInvalidator({
  isVisible,
  qualityTier
}: Readonly<{
  isVisible: boolean;
  qualityTier: Portfolio3dQualityTier;
}>): null {
  const { invalidate } = useThree();

  useEffect(() => {
    if (isVisible) {
      invalidate();
    }
  }, [invalidate, isVisible, qualityTier]);

  return null;
}

function FoundationScene({
  qualityTier,
  onCriticalProgressChange,
  onEmbeddedScreenReady
}: Readonly<{
  qualityTier: Portfolio3dQualityTier;
  onCriticalProgressChange?: (progress: Portfolio3dLoadingProgress) => void;
  onEmbeddedScreenReady?: (screenId: EmbeddedScreenId, element: HTMLElement | null) => void;
}>): React.ReactElement {
  return (
    <RoomShellStage
      qualityTier={qualityTier}
      onCriticalProgressChange={onCriticalProgressChange}
      onEmbeddedScreenReady={onEmbeddedScreenReady}
    />
  );
}

function getEmbeddedScreenId(sectionId: Portfolio3dSectionId): EmbeddedScreenId | undefined {
  return sectionId === 'profile' || sectionId === 'experience' || sectionId === 'pipeline' || sectionId === 'automation' || sectionId === 'performance' || sectionId === 'backend' || sectionId === 'terminal'
    ? sectionId
    : undefined;
}

function Portfolio3dNavigation(): React.ReactElement {
  const navigationRef = useRef<HTMLElement | null>(null);
  const restoreEmbeddedScreenFocusRef = useRef<EmbeddedScreenId | undefined>(undefined);
  const {
    state,
    setActiveSection,
    setFocusedHotspot,
    activateHotspot
  } = usePortfolio3dState();
  const isTransitioning = state.navigationState === 'focusing' || state.navigationState === 'returning';

  useEffect(() => {
    const embeddedScreenId = getEmbeddedScreenId(state.activeSectionId);
    if (embeddedScreenId) restoreEmbeddedScreenFocusRef.current = embeddedScreenId;
    if (restoreEmbeddedScreenFocusRef.current && state.navigationState === 'overview') {
      const sectionId = restoreEmbeddedScreenFocusRef.current;
      restoreEmbeddedScreenFocusRef.current = undefined;
      navigationRef.current?.querySelector<HTMLButtonElement>(`[data-portfolio-section="${sectionId}"]`)?.focus({ preventScroll: true });
    }
  }, [state.activeSectionId, state.navigationState]);

  return (
    <nav ref={navigationRef} className="space-y-3" aria-label="3D portfolio areas">
      <div>
        <p className="mono mb-2 text-[10px] uppercase tracking-[0.24em] text-[rgba(219,235,247,0.72)]">
          Areas
        </p>
        <div className="grid gap-1.5">
          {portfolio3dSectionContracts.map((contract) => {
            const isActive = state.activeSectionId === contract.id;
            const isLocked = isTransitioning && !isActive && contract.id !== 'overview';
            const hotspot = getHotspotById(contract.hotspotId);
            const Icon = portfolio3dAreaIcons[contract.id] ?? Monitor;

            return (
              <button
                key={contract.id}
                type="button"
                className="portfolio-3d-area-button"
                data-active={isActive}
                data-portfolio-section={contract.id}
                aria-pressed={isActive}
                disabled={isLocked}
                onFocus={() => setFocusedHotspot(hotspot?.id, 'keyboard')}
                onBlur={() => setFocusedHotspot(undefined)}
                onClick={() => {
                  if (isLocked) {
                    return;
                  }

                  if (hotspot) {
                    activateHotspot(hotspot, 'keyboard');
                    return;
                  }

                  setActiveSection(contract.id);
                }}
              >
                <span className="portfolio-3d-area-icon" aria-hidden="true">
                  <Icon size={17} strokeWidth={1.9} />
                </span>
                <span>{portfolio3dAreaLabels[contract.id] ?? contract.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
function Portfolio3dInstructionHint(): React.ReactElement | null {
  const { state, setInstructionHintDismissed } = usePortfolio3dState();

  if (state.isInstructionHintDismissed) {
    return null;
  }

  return (
    <div className="portfolio-3d-instruction-hint absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 px-3 py-2 md:flex">
      <p className="text-xs leading-5 text-[rgba(219,235,247,0.72)]">
        Use Areas menu. Single 3D room preview active.
      </p>
      <button
        type="button"
        className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]"
        aria-label="Dismiss 3D portfolio hint"
        onClick={() => setInstructionHintDismissed(true)}
      >
        Dismiss
      </button>
    </div>
  );
}
function Portfolio3dSectionPanel(): React.ReactElement {
  const { state, setActiveSection } = usePortfolio3dState();
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const activeContract =
    portfolio3dSectionContracts.find((contract) => contract.id === state.activeSectionId) ??
    portfolio3dSectionContracts[0];
  const content =
    getPortfolio3dPanelContent(state.activeSectionId) ?? getPortfolio3dPanelContent('overview');
  const isOverview = state.activeSectionId === 'overview';

  useEffect(() => {
    const handle = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 0);
    return () => window.clearTimeout(handle);
  }, [state.activeSectionId]);

  if (!content) {
    return (
      <section className="portfolio-3d-detail-card">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
          Content
        </p>
        <h2 className="mt-2 text-lg font-semibold">Content unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">
          No public portfolio data is mapped for this section yet.
        </p>
      </section>
    );
  }

  return (
    <section className="portfolio-3d-detail-card" aria-labelledby="portfolio-3d-panel-heading">
      <div className="flex items-center justify-between gap-3">
        <p className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
          {content.eyebrow}
        </p>
        <span className="mono rounded-full border border-[rgba(83,216,255,0.35)] bg-[rgba(83,216,255,0.08)] px-2 py-1 text-[9px] uppercase tracking-[0.16em] text-[rgba(219,235,247,0.74)]">
          {portfolio3dAreaLabels[activeContract.id] ?? activeContract.label}
        </span>
      </div>

      <h2
        id="portfolio-3d-panel-heading"
        ref={headingRef}
        tabIndex={-1}
        className="mt-2 text-lg font-semibold leading-tight text-white outline-none sm:text-xl"
      >
        {content.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-[rgba(219,235,247,0.72)]">{content.summary}</p>

      {content.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Related tags">
          {content.tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[rgba(148,163,184,0.24)] bg-[rgba(15,23,42,0.52)] px-2 py-1 text-[10px] font-semibold text-[rgba(219,235,247,0.64)]"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-[var(--text-subtle)]">{content.emptyLabel}</p>
      )}

      <div className="mt-4 grid gap-2">
        {content.blocks.length > 0 ? (
          content.blocks.slice(0, 2).map((block) => <Portfolio3dContentBlock key={block.heading} block={block} />)
        ) : (
          <p className="text-sm text-[var(--text-muted)]">{content.emptyLabel}</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {isPortfolio3dSafeHref(activeContract.routePath) ? (
          <a
            className="button-base button-secondary justify-center text-xs"
            href={getPortfolio3dPanelHref(activeContract.routePath)}
          >
            Open page
          </a>
        ) : null}
        {content.links.slice(0, 2).map((link) => (
          <a
            key={link.label + '-' + link.href}
            className="button-base button-secondary justify-center text-xs"
            href={getPortfolio3dPanelHref(link.href)}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <ExternalLink aria-hidden="true" size={14} />
            {link.label}
          </a>
        ))}
      </div>

      {!isOverview ? (
        <button
          type="button"
          className="button-base button-secondary mt-3 w-full justify-center text-xs"
          onClick={() => setActiveSection('overview')}
        >
          Back to overview
        </button>
      ) : null}
    </section>
  );
}
function Portfolio3dContentBlock({
  block
}: Readonly<{
  block: Portfolio3dPanelBlock;
}>): React.ReactElement {
  return (
    <article className="portfolio-3d-content-strip">
      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{block.heading}</h3>
      {block.body ? (
        <p className="mt-1.5 text-xs leading-5 text-[rgba(219,235,247,0.66)]">{block.body}</p>
      ) : null}
      {block.items && block.items.length > 0 ? (
        <ul className="mt-2 grid gap-1.5">
          {block.items.slice(0, 3).map((item) => (
            <li key={item} className="flex gap-2 text-xs leading-5 text-[rgba(219,235,247,0.64)]">
              <span
                className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
function getPortfolio3dPanelHref(href: string): string {
  return href.startsWith('/') ? withPortfolio3dBasePath(href) : href;
}

function getHotspotById(hotspotId: Portfolio3dHotspotId | undefined): Portfolio3dHotspotDefinition | undefined {
  return hotspotId ? portfolio3dHotspots.find((hotspot) => hotspot.id === hotspotId) : undefined;
}


class Portfolio3dErrorBoundary extends Component<
  Readonly<{ children: React.ReactNode; fallback: React.ReactNode }>,
  Portfolio3dErrorBoundaryState
> {
  readonly state: Portfolio3dErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): Portfolio3dErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[portfolio-3d] Runtime failed. Rendering HTML portfolio fallback.', error);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

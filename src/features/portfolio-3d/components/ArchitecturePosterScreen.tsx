"use client";

import { Braces, Database, Factory, Network, ShieldCheck, Workflow } from "lucide-react";
import { useEffect } from "react";
import { architectureNodes, architecturePresets } from "@/data/architecture";
import { useEmbeddedScreenScrollSession } from "../hooks/useEmbeddedScreenScrollSession";

const posterNodes = architectureNodes.map((node, index) => ({
  ...node,
  index: String(index + 1).padStart(2, "0")
}));

const posterIcons = [Braces, Network, Factory, Database, ShieldCheck, Workflow] as const;

export function ArchitecturePosterScreen({
  interactive
}: Readonly<{ interactive: boolean }>): React.ReactElement {
  const { scrollRef, onScroll } = useEmbeddedScreenScrollSession(interactive);

  useEffect(() => {
    if (interactive) scrollRef.current?.focus({ preventScroll: true });
  }, [interactive, scrollRef]);

  return (
    <section className="architecture-poster-screen" aria-label="Architecture poster">
      <header className="architecture-poster-heading">
        <Network size={22} aria-hidden="true" />
        <h2>Architecture</h2>
        <span>System atlas</span>
      </header>
      <div
        ref={scrollRef}
        className="architecture-poster-content"
        tabIndex={interactive ? 0 : -1}
        onWheel={(event) => event.stopPropagation()}
        onScroll={onScroll}
      >
        <article className="architecture-poster-page">
          <div className="architecture-poster-grain" aria-hidden="true" />
          <div className="architecture-poster-fold" aria-hidden="true" />

          <header className="architecture-poster-masthead">
            <div className="architecture-poster-topline">
              <span>RYANOS TECHNICAL PRINT / NO. 04</span>
              <span>BUILD WITH INTENT</span>
            </div>
            <div className="architecture-poster-title-row">
              <div>
                <p>FROM WORKFLOW TO RELEASE</p>
                <h1>
                  SYSTEM
                  <br />
                  ATLAS
                </h1>
              </div>
              <div className="architecture-poster-seal" aria-label="Full cycle engineering">
                <span>FULL</span>
                <strong>CYCLE</strong>
                <span>ENGINEERING</span>
              </div>
            </div>
          </header>

          <section className="architecture-poster-manifesto" aria-label="Architecture approach">
            <p>
              Product workflows, service boundaries, data integrity, quality signals, and delivery
              gates arranged as one accountable system.
            </p>
            <div className="architecture-poster-raymark" aria-hidden="true">
              <span />
              <span />
              <span />
              <span />
              <Network size={42} strokeWidth={1.55} />
            </div>
          </section>

          <section className="architecture-poster-topology" aria-labelledby="architecture-poster-topology">
            <header>
              <p id="architecture-poster-topology">System topology</p>
              <span>{posterNodes.length} connected layers</span>
            </header>
            <ol>
              {posterNodes.map((node, index) => {
                const Icon = posterIcons[index % posterIcons.length];

                return (
                  <li key={node.id}>
                    <span className="architecture-poster-node-index">{node.index}</span>
                    <Icon aria-hidden="true" size={19} strokeWidth={1.7} />
                    <div>
                      <strong>{node.label}</strong>
                      <span>{node.layer}</span>
                    </div>
                    <p>{node.purpose}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="architecture-poster-editions" aria-labelledby="architecture-poster-editions">
            <header>
              <p id="architecture-poster-editions">Field editions</p>
              <span>Public-safe patterns</span>
            </header>
            <div>
              {architecturePresets.map((preset, index) => (
                <article key={preset.id}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{preset.title}</h3>
                  <p>{preset.description}</p>
                </article>
              ))}
            </div>
          </section>

          <footer className="architecture-poster-footer" aria-hidden="true">
            <span>INTERFACES / SERVICES / DATA / QUALITY / DELIVERY</span>
            <span>JAKARTA EDITION</span>
          </footer>
        </article>
      </div>
    </section>
  );
}

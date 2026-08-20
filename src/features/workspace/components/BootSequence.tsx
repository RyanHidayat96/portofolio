"use client";

import { Button } from "@/components/ui/Button";
import { branding } from "@/data/branding";
import { CheckCircle2, FastForward } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const bootSteps = [
  "Frontend systems",
  "Backend services",
  "API boundary",
  "Data layer",
  "Quality engineering",
  "Performance engineering",
  "CI/CD delivery"
] as const;

export function BootSequence({
  onComplete
}: Readonly<{
  onComplete: () => void;
}>): React.ReactElement {
  const [completedCount, setCompletedCount] = useState(0);
  const rows = useMemo(
    () => bootSteps.map((label, index) => ({ label, isDone: index < completedCount })),
    [completedCount]
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      const completeImmediatelyId = window.setTimeout(() => setCompletedCount(bootSteps.length), 0);
      const timeoutId = window.setTimeout(onComplete, 180);
      return () => {
        window.clearTimeout(completeImmediatelyId);
        window.clearTimeout(timeoutId);
      };
    }

    const intervalId = window.setInterval(() => {
      setCompletedCount((current) => Math.min(current + 1, bootSteps.length));
    }, 120);

    return () => window.clearInterval(intervalId);
  }, [onComplete]);

  useEffect(() => {
    if (completedCount >= bootSteps.length) {
      const timeoutId = window.setTimeout(onComplete, 280);
      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [completedCount, onComplete]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-5 text-[var(--text-primary)]">
      <section className="w-full max-w-2xl rounded-[var(--radius-panel)] border border-[var(--border)] bg-[#0d1119] p-5 shadow-[var(--shadow-panel)] sm:p-8">
        <div className="mb-7 flex items-center justify-between gap-4">
          <div>
            <p className="mono text-sm text-[var(--accent)]">Initializing {branding.appName}...</p>
            <h1 className="mt-2 text-2xl font-semibold">Full-cycle workspace boot</h1>
          </div>
          <Button
            variant="ghost"
            icon={<FastForward aria-hidden="true" size={18} />}
            onClick={onComplete}
          >
            Skip
          </Button>
        </div>

        <ul className="space-y-3" aria-live="polite">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-4 rounded-[var(--radius-control)] border border-[var(--border)] bg-[var(--surface-elevated)] p-3"
            >
              <span className="mono text-sm text-[#c8d4e6]">{row.label.padEnd(32, ".")}</span>
              {row.isDone ? (
                <CheckCircle2 aria-label="loaded" className="text-[var(--success)]" size={18} />
              ) : (
                <span className="mono text-xs text-[var(--text-muted)]">pending</span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-7 border-t border-[var(--border)] pt-5">
          <p className="mono text-sm text-[var(--success)]">
            {completedCount >= bootSteps.length ? "SYSTEM READY" : "Running checks..."}
          </p>
          <p className="mono mt-2 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            Full Stack × Quality Engineering
          </p>
        </div>
      </section>
    </main>
  );
}

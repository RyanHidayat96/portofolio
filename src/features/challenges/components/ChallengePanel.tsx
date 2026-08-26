"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { challengeScenarios } from "@/data/challenges";
import { profile } from "@/data/profile";
import type { ChallengeScenario } from "@/data/types";
import { Brain, CheckCircle2, RotateCcw, Route, XCircle } from "lucide-react";
import { useState } from "react";

export function ChallengePanel(): React.ReactElement {
  const [scenarioId, setScenarioId] = useState(challengeScenarios[0]?.id ?? "");
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const scenario =
    challengeScenarios.find((item) => item.id === scenarioId) ?? challengeScenarios[0];
  const selectedChoice = scenario?.choices.find((choice) => choice.id === choiceId);

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="challenge-index-panel p-4">
        <p className="mono px-1 py-2 text-sm text-[#55d7ff]">test.me</p>
        <h1 className="px-1 pb-3 text-2xl font-semibold">Engineering Challenge</h1>
        <p className="px-1 pb-4 text-sm leading-6 text-[#8a96a8]">
          Public-safe decision scenarios for build, quality, data, and delivery thinking.
        </p>
        <div className="space-y-2">
          {challengeScenarios.map((item) => (
            <ChallengeScenarioButton
              key={item.id}
              scenario={item}
              isActive={scenarioId === item.id}
              onSelect={() => {
                setScenarioId(item.id);
                setChoiceId(null);
              }}
            />
          ))}
        </div>
      </Panel>

      <Panel className="challenge-workbench p-5 sm:p-7">
        {scenario ? (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="info">{scenario.domain}</Badge>
                  <Badge>{scenario.difficulty}</Badge>
                </div>
                <h2 className="mt-4 text-3xl font-semibold">
                  You know I test software. Now test how I think.
                </h2>
                <p className="mt-5 text-lg leading-8 text-[#c8d4e6]">{scenario.prompt}</p>
              </div>
              <Brain aria-hidden="true" className="hidden text-[#55d7ff] sm:block" size={28} />
            </div>

            <ChallengeDecisionTrace scenario={scenario} selectedChoice={selectedChoice} />

            <section className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a96a8]">
                Signals
              </h3>
              <div className="challenge-signal-grid mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {scenario.metrics.map((metric) => (
                  <div key={metric} className="mono text-sm text-[#c8d4e6]">
                    {metric}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a96a8]">
                Decision
              </h3>
              <div className="mt-3 grid gap-3">
                {scenario.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={choiceId === choice.id}
                    onClick={() => setChoiceId(choice.id)}
                    className="challenge-choice-button"
                    data-selected={choiceId === choice.id}
                    data-cursor-intent="button"
                    data-cursor-label="DECIDE"
                  >
                    <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                    <strong>{choice.label}</strong>
                  </button>
                ))}
              </div>
            </section>

            {selectedChoice ? (
              <section
                className="challenge-feedback-card mt-7"
                data-outcome={selectedChoice.isPreferred ? "preferred" : "secondary"}
                aria-live="polite"
              >
                <Badge tone={selectedChoice.isPreferred ? "success" : "warning"}>
                  {selectedChoice.isPreferred ? "preferred path" : "useful signal, not first"}
                </Badge>
                <p className="mt-4 leading-7 text-[#c8d4e6]">{selectedChoice.feedback}</p>
                <h3 className="mt-6 font-semibold">{profile.name}&apos;s Approach</h3>
                <ol className="mt-3 grid gap-2 text-sm leading-6 text-[#b7c2d2]">
                  {scenario.approach.map((step, index) => (
                    <li key={step} className="grid grid-cols-[28px_1fr] gap-3">
                      <span className="mono text-[#55d7ff]">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
                <Button
                  className="mt-5"
                  icon={<RotateCcw aria-hidden="true" size={17} />}
                  onClick={() => setChoiceId(null)}
                  cursorLabel="RESET"
                  magnetic
                >
                  Try Again
                </Button>
              </section>
            ) : null}
          </>
        ) : (
          <p>No challenge data configured.</p>
        )}
      </Panel>
    </div>
  );
}

function ChallengeDecisionTrace({
  scenario,
  selectedChoice
}: Readonly<{
  scenario: ChallengeScenario;
  selectedChoice: ChallengeScenario["choices"][number] | undefined;
}>): React.ReactElement {
  return (
    <section className="challenge-decision-trace" aria-label="Decision trace">
      <article data-status="complete">
        <Route aria-hidden="true" size={16} />
        <span>Context</span>
        <strong>{scenario.domain}</strong>
      </article>
      <article data-status="complete">
        <CheckCircle2 aria-hidden="true" size={16} />
        <span>Signals</span>
        <strong>{scenario.metrics.length} checked</strong>
      </article>
      <article data-status={selectedChoice ? "complete" : "idle"}>
        {selectedChoice?.isPreferred === false ? (
          <XCircle aria-hidden="true" size={16} />
        ) : (
          <CheckCircle2 aria-hidden="true" size={16} />
        )}
        <span>Decision</span>
        <strong>{selectedChoice ? selectedChoice.label : "waiting"}</strong>
      </article>
      <article data-status={selectedChoice?.isPreferred ? "complete" : selectedChoice ? "warning" : "idle"}>
        {selectedChoice?.isPreferred ? (
          <CheckCircle2 aria-hidden="true" size={16} />
        ) : (
          <XCircle aria-hidden="true" size={16} />
        )}
        <span>Path</span>
        <strong>{selectedChoice?.isPreferred ? "preferred" : selectedChoice ? "reconsider" : "pending"}</strong>
      </article>
    </section>
  );
}

function ChallengeScenarioButton({
  scenario,
  isActive,
  onSelect
}: Readonly<{
  scenario: ChallengeScenario;
  isActive: boolean;
  onSelect: () => void;
}>): React.ReactElement {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onSelect}
      className="challenge-scenario-button"
      data-active={isActive}
      data-cursor-intent="button"
      data-cursor-label="LOAD"
    >
      <span className="font-semibold">{scenario.title}</span>
      <span className="mt-2 flex flex-wrap gap-2">
        <Badge tone="info">{scenario.domain}</Badge>
        <Badge>{scenario.difficulty}</Badge>
      </span>
    </button>
  );
}

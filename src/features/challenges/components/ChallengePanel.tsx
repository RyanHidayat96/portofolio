"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { challengeScenarios } from "@/data/challenges";
import type { ChallengeScenario } from "@/data/types";
import { Brain, RotateCcw } from "lucide-react";
import { useState } from "react";

export function ChallengePanel(): React.ReactElement {
  const [scenarioId, setScenarioId] = useState(challengeScenarios[0]?.id ?? "");
  const [choiceId, setChoiceId] = useState<string | null>(null);
  const scenario =
    challengeScenarios.find((item) => item.id === scenarioId) ?? challengeScenarios[0];
  const selectedChoice = scenario?.choices.find((choice) => choice.id === choiceId);

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <Panel className="p-4">
        <p className="mono px-1 py-2 text-sm text-[#55d7ff]">test.me</p>
        <h1 className="px-1 pb-4 text-2xl font-semibold">Engineering Challenge</h1>
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

      <Panel className="p-5 sm:p-7">
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

            <section className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a96a8]">
                Signals
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {scenario.metrics.map((metric) => (
                  <div
                    key={metric}
                    className="mono border border-[var(--border)] bg-[#10141d] p-3 text-sm text-[#c8d4e6]"
                  >
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
                {scenario.choices.map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    aria-pressed={choiceId === choice.id}
                    onClick={() => setChoiceId(choice.id)}
                    className={`border p-4 text-left transition ${
                      choiceId === choice.id
                        ? "border-[#55d7ff] bg-[#55d7ff]/12"
                        : "border-[var(--border)] bg-[#10141d] hover:border-[#55d7ff]/50"
                    }`}
                  >
                    <span className="font-semibold">{choice.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {selectedChoice ? (
              <section className="mt-7 border border-[var(--border)] bg-[#0b0f16] p-5">
                <Badge tone={selectedChoice.isPreferred ? "success" : "warning"}>
                  {selectedChoice.isPreferred ? "preferred path" : "useful signal, not first"}
                </Badge>
                <p className="mt-4 leading-7 text-[#c8d4e6]">{selectedChoice.feedback}</p>
                <h3 className="mt-6 font-semibold">Ryan&apos;s Approach</h3>
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
      className={`w-full border p-4 text-left transition ${
        isActive
          ? "border-[#55d7ff]/60 bg-[#55d7ff]/12"
          : "border-[var(--border)] bg-[#10141d] hover:border-[#55d7ff]/50"
      }`}
    >
      <span className="font-semibold">{scenario.title}</span>
      <span className="mt-2 flex flex-wrap gap-2">
        <Badge tone="info">{scenario.domain}</Badge>
        <Badge>{scenario.difficulty}</Badge>
      </span>
    </button>
  );
}

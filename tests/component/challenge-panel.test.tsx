import { challengeScenarios } from "@/data/challenges";
import { ChallengePanel } from "@/features/challenges/components/ChallengePanel";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("ChallengePanel", () => {
  it("lists portfolio-safe engineering scenario domains", () => {
    render(<ChallengePanel />);

    for (const scenario of challengeScenarios) {
      expect(
        screen.getByRole("button", { name: new RegExp(escapeRegExp(scenario.title)) })
      ).toBeInTheDocument();
    }
  });

  it("shows preferred reasoning path for quality gate scenario", async () => {
    const user = userEvent.setup();
    const scenario = challengeScenarios.find((item) =>
      item.choices.some((choice) => choice.isPreferred)
    );
    const preferredChoice = scenario?.choices.find((choice) => choice.isPreferred);
    render(<ChallengePanel />);

    if (!scenario || !preferredChoice) {
      return;
    }

    await user.click(
      screen.getByRole("button", { name: new RegExp(escapeRegExp(scenario.title)) })
    );
    await user.click(screen.getByRole("button", { name: preferredChoice.label }));

    expect(screen.getByText("preferred path")).toBeInTheDocument();
    expect(screen.getByText(scenario.approach[0] ?? "")).toBeInTheDocument();
  });
});

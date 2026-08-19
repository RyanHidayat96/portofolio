import { ChallengePanel } from "@/features/challenges/components/ChallengePanel";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("ChallengePanel", () => {
  it("lists portfolio-safe engineering scenario domains", () => {
    render(<ChallengePanel />);

    expect(screen.getByRole("button", { name: /API Performance Diagnosis/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Flaky Automation/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /CI\/CD Failure/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Database Bottleneck/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mobile Automation/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Regression Strategy/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Quality Gates/ })).toBeInTheDocument();
  });

  it("shows preferred reasoning path for quality gate scenario", async () => {
    const user = userEvent.setup();
    render(<ChallengePanel />);

    await user.click(screen.getByRole("button", { name: /Quality Gates/ }));
    await user.click(screen.getByRole("button", { name: "Block deployment and attach evidence" }));

    expect(screen.getByText("preferred path")).toBeInTheDocument();
    expect(screen.getByText("Keep quality gate rule consistent.")).toBeInTheDocument();
  });
});

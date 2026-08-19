import { PipelineSimulatorPanel } from "@/features/pipeline/components/PipelineSimulatorPanel";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("PipelineSimulatorPanel", () => {
  it("lists supported pipeline scenarios", () => {
    render(<PipelineSimulatorPanel />);

    expect(screen.getByRole("option", { name: "Successful Pipeline" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Regression Failure" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Performance Gate Failure" })).toBeInTheDocument();
  });

  it("runs successful pipeline through deploy", async () => {
    const user = userEvent.setup();
    render(<PipelineSimulatorPanel />);

    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("PIPELINE PASSED")).toBeInTheDocument(), {
      timeout: 4_000
    });
    expect(
      screen.getAllByText("Quality gate passed. Deployment can continue.").length
    ).toBeGreaterThan(0);
  });

  it("blocks regression failure and skips deploy", async () => {
    const user = userEvent.setup();
    render(<PipelineSimulatorPanel />);

    await user.selectOptions(screen.getByLabelText("Pipeline Scenario"), "regression-failure");
    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("PIPELINE BLOCKED")).toBeInTheDocument(), {
      timeout: 4_000
    });
    expect(screen.getByText("SKIPPED DEPLOY")).toBeInTheDocument();
    expect(
      screen.getAllByText("Quality gate blocked deployment because regression test failed.").length
    ).toBeGreaterThan(0);
  });

  it("blocks performance gate failure", async () => {
    const user = userEvent.setup();
    render(<PipelineSimulatorPanel />);

    await user.selectOptions(
      screen.getByLabelText("Pipeline Scenario"),
      "performance-gate-failure"
    );
    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("PIPELINE BLOCKED")).toBeInTheDocument(), {
      timeout: 4_000
    });
    expect(
      screen.getAllByText("Quality gate blocked deployment because performance threshold failed.")
        .length
    ).toBeGreaterThan(0);
  });

  it("resets blocked pipeline back to idle success scenario", async () => {
    const user = userEvent.setup();
    render(<PipelineSimulatorPanel />);

    await user.selectOptions(screen.getByLabelText("Pipeline Scenario"), "regression-failure");
    await user.click(screen.getByRole("button", { name: "Run" }));
    await waitFor(() => expect(screen.getByText("PIPELINE BLOCKED")).toBeInTheDocument(), {
      timeout: 4_000
    });

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByLabelText("Pipeline Scenario")).toHaveValue("success");
    expect(screen.getByText("Pipeline idle.")).toBeInTheDocument();
    expect(screen.getByText("Run pipeline to stream stage events.")).toBeInTheDocument();
  });
});

import { AutomationLab } from "@/features/automation-lab/components/AutomationLab";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("AutomationLab", () => {
  it("lists meaningful failure scenarios", () => {
    render(<AutomationLab />);

    expect(screen.getByRole("option", { name: "Locator Change" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "API 500" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Network Timeout" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Element Disappears" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Slow Response" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Invalid Authentication" })).toBeInTheDocument();
  });

  it("runs default automation simulation to passed state", async () => {
    const user = userEvent.setup();
    render(<AutomationLab />);

    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("TEST PASSED")).toBeInTheDocument(), {
      timeout: 4_000
    });
  });

  it("shows locator recovery in the healing engine", async () => {
    const user = userEvent.setup();
    render(<AutomationLab />);

    await user.selectOptions(screen.getByLabelText("Failure Scenario"), "locator");
    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("HEALED 97%")).toBeInTheDocument(), {
      timeout: 4_000
    });
    await waitFor(() => expect(screen.getByText("TEST PASSED")).toBeInTheDocument(), {
      timeout: 4_000
    });
  });

  it("shows API 500 as blocked instead of self-healed", async () => {
    const user = userEvent.setup();
    render(<AutomationLab />);

    await user.selectOptions(screen.getByLabelText("Failure Scenario"), "api");
    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("TEST FAILED")).toBeInTheDocument(), {
      timeout: 4_000
    });
    expect(screen.getByText("QUALITY GATE BLOCKED")).toBeInTheDocument();
    expect(screen.getByText("SELF-HEALING NOT AVAILABLE")).toBeInTheDocument();
  });

  it("replays missing-element recovery and then resets to idle", async () => {
    const user = userEvent.setup();
    render(<AutomationLab />);

    await user.selectOptions(screen.getByLabelText("Failure Scenario"), "missing-element");
    await user.click(screen.getByRole("button", { name: "Replay" }));

    await waitFor(() => expect(screen.getByText("HEALED 93%")).toBeInTheDocument(), {
      timeout: 4_000
    });
    await waitFor(() => expect(screen.getByText("TEST PASSED")).toBeInTheDocument(), {
      timeout: 4_000
    });

    await user.click(screen.getByRole("button", { name: "Reset" }));

    expect(screen.getByText("Idle runner timeline.")).toBeInTheDocument();
    expect(screen.queryByText("TEST PASSED")).not.toBeInTheDocument();
  });

  it("classifies invalid authentication as unrecoverable", async () => {
    const user = userEvent.setup();
    render(<AutomationLab />);

    await user.selectOptions(screen.getByLabelText("Failure Scenario"), "auth");
    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("TEST FAILED")).toBeInTheDocument(), {
      timeout: 4_000
    });
    expect(screen.getByText("CLASSIFIED invalid-authentication")).toBeInTheDocument();
    expect(screen.getByText("SELF-HEALING NOT AVAILABLE")).toBeInTheDocument();
  });

  it("allows slow-response pass with warning but no healing", async () => {
    const user = userEvent.setup();
    render(<AutomationLab />);

    await user.selectOptions(screen.getByLabelText("Failure Scenario"), "slow-response");
    await user.click(screen.getByRole("button", { name: "Run" }));

    await waitFor(() => expect(screen.getByText("TEST PASSED")).toBeInTheDocument(), {
      timeout: 4_000
    });
    expect(screen.getByText("QUALITY GATE WARNING")).toBeInTheDocument();
    expect(screen.queryByText(/HEALED/)).not.toBeInTheDocument();
  });
});

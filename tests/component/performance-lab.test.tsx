import { PerformanceLab } from "@/features/performance-lab/components/PerformanceLab";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("PerformanceLab", () => {
  it("renders core performance controls and metrics", () => {
    render(<PerformanceLab />);

    expect(screen.getByRole("option", { name: "Normal Load" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Peak Load" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Stress Test" })).toBeInTheDocument();
    expect(screen.getByLabelText("Virtual Users value")).toHaveValue(25);
    expect(screen.getByLabelText("Duration value")).toHaveValue(30);
    expect(screen.getAllByText("Check Rate").length).toBeGreaterThan(0);
    expect(screen.getByText("thresholds passed")).toBeInTheDocument();
  });

  it("updates scenario defaults and failed thresholds", async () => {
    const user = userEvent.setup();
    render(<PerformanceLab />);

    await user.selectOptions(screen.getByLabelText("Scenario"), "stress");

    expect(screen.getByLabelText("Virtual Users value")).toHaveValue(100);
    expect(screen.getByLabelText("Duration value")).toHaveValue(30);
    expect(screen.getByText("thresholds failed")).toBeInTheDocument();
    expect(screen.getByText("4 Threshold Failures")).toBeInTheDocument();
  });

  it("updates metrics when virtual users change", () => {
    render(<PerformanceLab />);

    fireEvent.change(screen.getByLabelText("Virtual Users"), { target: { value: "80" } });

    expect(screen.getByLabelText("Virtual Users value")).toHaveValue(80);
    expect(screen.getByText("VU: 80 | Duration: 30s")).toBeInTheDocument();
  });

  it("passes peak defaults and resets changed controls", async () => {
    const user = userEvent.setup();
    render(<PerformanceLab />);

    await user.selectOptions(screen.getByLabelText("Scenario"), "peak");

    expect(screen.getByLabelText("Virtual Users value")).toHaveValue(50);
    expect(screen.getByText("thresholds passed")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Duration"), { target: { value: "180" } });
    expect(screen.getByLabelText("Duration value")).toHaveValue(180);

    await user.click(screen.getByRole("button", { name: "Reset Scenario" }));

    expect(screen.getByLabelText("Duration value")).toHaveValue(30);
    expect(screen.getByText("VU: 50 | Duration: 30s")).toBeInTheDocument();
  });
});

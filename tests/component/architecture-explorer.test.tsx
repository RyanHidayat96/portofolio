import { ArchitectureExplorer } from "@/features/architecture/components/ArchitectureExplorer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("ArchitectureExplorer", () => {
  it("renders topology with clickable architecture nodes", () => {
    render(<ArchitectureExplorer />);

    expect(screen.getByLabelText("Architecture topology map")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "GitLab CI/CD architecture node" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("button", { name: "Quality Gate architecture node" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Allure / JUnit architecture node" })
    ).toBeInTheDocument();
  });

  it("shows connected nodes, skills, and engineering highlights after selection", async () => {
    const user = userEvent.setup();
    render(<ArchitectureExplorer />);

    await user.click(screen.getByRole("button", { name: "K6 architecture node" }));

    expect(screen.getByRole("button", { name: "K6 architecture node" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(screen.getByRole("button", { name: "Performance" })).toBeInTheDocument();
    expect(screen.getByText("Performance & Load Testing")).toBeInTheDocument();
    expect(screen.getByText("JMeter")).toBeInTheDocument();
  });
});

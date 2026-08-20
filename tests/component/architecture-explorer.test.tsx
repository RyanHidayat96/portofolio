import { architectureNodes, getConnectedArchitectureNodeIds } from "@/data/architecture";
import { ArchitectureExplorer } from "@/features/architecture/components/ArchitectureExplorer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("ArchitectureExplorer", () => {
  it("renders topology with clickable architecture nodes", () => {
    const firstNode = architectureNodes[0];
    const secondNode = architectureNodes[1];
    const lastNode = architectureNodes.at(-1);

    render(<ArchitectureExplorer />);

    expect(screen.getByLabelText("Architecture topology map")).toBeInTheDocument();
    if (!firstNode || !secondNode || !lastNode) {
      return;
    }

    expect(
      screen.getByRole("button", { name: `${firstNode.label} architecture node` })
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: `${secondNode.label} architecture node` })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `${lastNode.label} architecture node` })
    ).toBeInTheDocument();
  });

  it("shows connected nodes, skills, and engineering highlights after selection", async () => {
    const user = userEvent.setup();
    const selectedNode =
      architectureNodes.find(
        (node) => node.relatedProjects.length > 0 && node.relatedSkills.length > 0
      ) ?? architectureNodes[0];
    const connectedNodeId = selectedNode ? getConnectedArchitectureNodeIds(selectedNode.id)[0] : "";
    const connectedNode = architectureNodes.find((node) => node.id === connectedNodeId);

    render(<ArchitectureExplorer />);

    if (!selectedNode || !connectedNode) {
      return;
    }

    await user.click(
      screen.getByRole("button", { name: `${selectedNode.label} architecture node` })
    );

    expect(
      screen.getByRole("button", { name: `${selectedNode.label} architecture node` })
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: connectedNode.label })).toBeInTheDocument();
    expect(screen.getAllByText(selectedNode.relatedProjects[0] ?? "").length).toBeGreaterThan(0);
    expect(screen.getAllByText(selectedNode.relatedSkills[0] ?? "").length).toBeGreaterThan(0);
  });
});

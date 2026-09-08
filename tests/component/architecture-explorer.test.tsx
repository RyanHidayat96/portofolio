import { architecturePresets, getConnectedArchitectureNodeIds } from "@/data/architecture";
import { ArchitectureExplorer } from "@/features/architecture/components/ArchitectureExplorer";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

describe("ArchitectureExplorer", () => {
  it("renders topology with clickable architecture nodes", () => {
    const activePreset = architecturePresets[0];
    const firstNode = activePreset?.nodes[0];
    const secondNode = activePreset?.nodes[1];
    const lastNode = activePreset?.nodes.at(-1);

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
    const activePreset = architecturePresets[0];
    const nodes = activePreset?.nodes ?? [];
    const edges = activePreset?.edges ?? [];
    const selectedNode =
      nodes.find(
        (node) => node.relatedProjects.length > 0 && node.relatedSkills.length > 0
      ) ?? nodes[0];
    const connectedNodeId = selectedNode
      ? getConnectedArchitectureNodeIds(selectedNode.id, edges)[0]
      : "";
    const connectedNode = nodes.find((node) => node.id === connectedNodeId);

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
    expect(
      screen.getByRole("button", {
        name: `Select connected architecture node ${connectedNode.label}`
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText(selectedNode.relatedProjects[0] ?? "").length).toBeGreaterThan(0);
    expect(screen.getAllByText(selectedNode.relatedSkills[0] ?? "").length).toBeGreaterThan(0);
  });

  it("draws topology edges between card borders instead of through card centers", () => {
    const activePreset = architecturePresets[0];
    const firstEdge = activePreset?.edges[0];
    const source = activePreset?.nodes.find((node) => node.id === firstEdge?.source);
    const target = activePreset?.nodes.find((node) => node.id === firstEdge?.target);

    const { container } = render(<ArchitectureExplorer />);

    if (!firstEdge || !source || !target) {
      return;
    }

    const edgeGroup = container.querySelector(`[data-edge-id="${firstEdge.id}"]`);
    const path = edgeGroup?.querySelector(".architecture-edge-line")?.getAttribute("d");

    expect(edgeGroup?.querySelector(".architecture-edge-glow")).toBeInTheDocument();
    expect(edgeGroup?.querySelector(".architecture-edge-line")).toBeInTheDocument();
    const coordinates = path?.match(/-?\d+(?:\.\d+)?/g)?.map(Number);

    expect(coordinates).toBeDefined();
    expect(coordinates?.[0]).toBe(source.x);
    expect(coordinates?.[1]).toBeGreaterThan(source.y);
    expect(coordinates?.[6]).toBe(target.x);
    expect(coordinates?.[7]).toBeLessThan(target.y);
  });
});

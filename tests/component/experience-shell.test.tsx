import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ExperienceShell } from "@/features/portfolio-3d/components/ExperienceShell";

describe("ExperienceShell room header", () => {
  it("uses the room title as a reset button", async () => {
    const user = userEvent.setup();
    const onRoomReset = vi.fn();

    render(
      <ExperienceShell
        webglStatus="supported"
        canvasSlot={<div data-testid="canvas-slot" />}
        fallbackSlot={null}
        navigationSlot={<button type="button">Overview</button>}
        assetProgress={{
          isCriticalComplete: true,
          loadedCriticalAssets: 1,
          totalCriticalAssets: 1,
          failedCriticalAssets: 0
        }}
        onRoomReset={onRoomReset}
      />
    );

    const titleButton = screen.getByRole("button", { name: "Ryan Hidayat" });
    expect(titleButton).toHaveClass("button-base", "button-secondary");
    expect(titleButton).toHaveAttribute("id", "portfolio-3d-scene-title");

    await user.click(titleButton);

    expect(onRoomReset).toHaveBeenCalledOnce();
  });
});

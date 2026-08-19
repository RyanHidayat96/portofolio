import { CommandPalette } from "@/features/workspace/components/CommandPalette";
import type { PaletteAction } from "@/features/workspace/navigation";
import { RyanOSApp } from "@/features/workspace/components/RyanOSApp";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const actions: readonly PaletteAction[] = [
  {
    id: "test-overview",
    label: "Go to Overview",
    section: "overview",
    description: "Open professional snapshot."
  },
  {
    id: "test-profile",
    label: "Go to Profile",
    section: "profile",
    description: "Open profile details."
  },
  {
    id: "test-contact",
    label: "Contact Ryan",
    section: "contact",
    description: "Open contact panel."
  }
];

describe("CommandPalette", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("supports ArrowDown and Enter for active option selection", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<CommandPalette isOpen actions={actions} onClose={vi.fn()} onSelect={onSelect} />);

    const input = screen.getByRole("combobox", { name: "Search commands" });
    await waitFor(() => expect(input).toHaveFocus());

    expect(input).toHaveAttribute(
      "aria-activedescendant",
      "command-palette-option-0-test-overview"
    );

    await user.keyboard("{ArrowDown}{Enter}");

    expect(onSelect).toHaveBeenCalledWith("profile");
  });

  it("filters commands, exposes active option, and ignores Enter without a match", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    render(<CommandPalette isOpen actions={actions} onClose={vi.fn()} onSelect={onSelect} />);

    const input = screen.getByRole("combobox", { name: "Search commands" });
    await waitFor(() => expect(input).toHaveFocus());

    await user.type(input, "contact");

    expect(screen.getByRole("option", { name: /Contact Ryan/ })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(input).toHaveAttribute("aria-activedescendant", "command-palette-option-0-test-contact");

    await user.clear(input);
    await user.type(input, "zzzz");

    expect(screen.getByText("No matching command.")).toBeInTheDocument();
    expect(input).not.toHaveAttribute("aria-activedescendant");

    await user.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("supports ArrowUp wraparound and Escape close", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSelect = vi.fn();

    render(<CommandPalette isOpen actions={actions} onClose={onClose} onSelect={onSelect} />);

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Search commands" })).toHaveFocus()
    );
    await user.keyboard("{ArrowUp}{Enter}");

    expect(onSelect).toHaveBeenCalledWith("contact");

    onClose.mockClear();
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("opens from RyanOS with Ctrl+K and follows keyboard selection", async () => {
    const user = userEvent.setup();
    window.sessionStorage.setItem("ryanos.booted", "true");

    render(<RyanOSApp />);

    await user.click(screen.getByRole("button", { name: "ENTER WORKSPACE" }));
    await user.keyboard("{Control>}k{/Control}");

    expect(screen.getByRole("dialog", { name: "Command palette" })).toBeInTheDocument();

    await user.keyboard("{ArrowDown}{Enter}");

    expect(await screen.findByText("Education")).toBeInTheDocument();
    expect(window.location.pathname).toBe("/profile");
  });
});

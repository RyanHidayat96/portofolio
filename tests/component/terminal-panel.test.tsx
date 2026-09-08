import { TerminalPanel } from "@/features/terminal/components/TerminalPanel";
import { profile } from "@/data/profile";
import { createRef } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("TerminalPanel", () => {
  it("executes whoami command and renders profile output", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<TerminalPanel onNavigate={onNavigate} />);

    await user.type(screen.getByLabelText("Terminal command"), "whoami{enter}");

    expect(await screen.findByText(profile.name)).toBeInTheDocument();
    expect(screen.getByText(profile.headline)).toBeInTheDocument();
  });

  it("navigates when a route command is executed", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<TerminalPanel onNavigate={onNavigate} />);

    await user.type(screen.getByLabelText("Terminal command"), "pipeline{enter}");

    expect(onNavigate).toHaveBeenCalledWith("pipeline");
  });

  it("renders help and unknown command feedback", async () => {
    const user = userEvent.setup();
    render(<TerminalPanel onNavigate={vi.fn()} />);

    await user.type(screen.getByLabelText("Terminal command"), "help{enter}");

    expect(
      await screen.findByText(/whoami\s+Show Full Stack x SDET identity\./)
    ).toBeInTheDocument();
    expect(screen.getByText(/pipeline\s+Open pipeline simulator\./)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Terminal command"), "wat{enter}");

    expect(await screen.findByText('Command not found: wat. Type "help".')).toBeInTheDocument();
  });

  it("supports clear command without leaving stale output", async () => {
    const user = userEvent.setup();
    render(<TerminalPanel onNavigate={vi.fn()} />);

    await user.type(screen.getByLabelText("Terminal command"), "whoami{enter}");
    expect(await screen.findByText(profile.name)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Terminal command"), "clear{enter}");

    await waitFor(() => expect(screen.queryByText(profile.name)).not.toBeInTheDocument());
    expect(screen.getByLabelText("Terminal command")).toHaveValue("");
  });

  it("supports command history navigation and autocomplete", async () => {
    const user = userEvent.setup();
    render(<TerminalPanel onNavigate={vi.fn()} />);
    const input = screen.getByLabelText("Terminal command");

    await user.type(input, "whoami{enter}");
    await screen.findByText(profile.name);
    await user.type(input, "pipeline{enter}");
    await screen.findByText("Software delivery pipeline ready.");

    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("pipeline");
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("whoami");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("pipeline");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("");

    await user.type(input, "per{Tab}");
    expect(input).toHaveValue("performance");
  });

  it("exposes the terminal output scroll surface for embedded screen sessions", () => {
    const outputRef = createRef<HTMLDivElement>();
    const onOutputScroll = vi.fn();
    render(
      <TerminalPanel
        variant="screen"
        onNavigate={vi.fn()}
        terminalOutputRef={outputRef}
        onTerminalOutputScroll={onOutputScroll}
      />
    );

    expect(outputRef.current).toHaveClass("terminal-screen");
    fireEvent.scroll(outputRef.current!);
    expect(onOutputScroll).toHaveBeenCalledOnce();
  });
});

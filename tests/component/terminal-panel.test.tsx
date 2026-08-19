import { TerminalPanel } from "@/features/terminal/components/TerminalPanel";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

describe("TerminalPanel", () => {
  it("executes whoami command and renders profile output", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<TerminalPanel onNavigate={onNavigate} />);

    await user.type(screen.getByLabelText("Terminal command"), "whoami{enter}");

    expect(await screen.findByText("Ryan Hidayat")).toBeInTheDocument();
    expect(
      screen.getByText("Software Development Engineer in Test (SDET) | QA Automation Engineer")
    ).toBeInTheDocument();
  });

  it("navigates when project command is executed", async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();

    render(<TerminalPanel onNavigate={onNavigate} />);

    await user.type(screen.getByLabelText("Terminal command"), "projects{enter}");

    expect(onNavigate).toHaveBeenCalledWith("projects");
  });

  it("renders help and unknown command feedback", async () => {
    const user = userEvent.setup();
    render(<TerminalPanel onNavigate={vi.fn()} />);

    await user.type(screen.getByLabelText("Terminal command"), "help{enter}");

    expect(await screen.findByText(/whoami\s+Show Ryan profile\./)).toBeInTheDocument();
    expect(screen.getByText(/pipeline\s+Open pipeline simulator\./)).toBeInTheDocument();

    await user.type(screen.getByLabelText("Terminal command"), "wat{enter}");

    expect(await screen.findByText('Command not found: wat. Type "help".')).toBeInTheDocument();
  });

  it("supports clear command without leaving stale output", async () => {
    const user = userEvent.setup();
    render(<TerminalPanel onNavigate={vi.fn()} />);

    await user.type(screen.getByLabelText("Terminal command"), "whoami{enter}");
    expect(await screen.findByText("Ryan Hidayat")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Terminal command"), "clear{enter}");

    await waitFor(() => expect(screen.queryByText("Ryan Hidayat")).not.toBeInTheDocument());
    expect(screen.getByLabelText("Terminal command")).toHaveValue("");
  });

  it("supports command history navigation and autocomplete", async () => {
    const user = userEvent.setup();
    render(<TerminalPanel onNavigate={vi.fn()} />);
    const input = screen.getByLabelText("Terminal command");

    await user.type(input, "whoami{enter}");
    await screen.findByText("Ryan Hidayat");
    await user.type(input, "projects{enter}");
    await screen.findByText("Enterprise Web Automation Ecosystem");

    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("projects");
    await user.keyboard("{ArrowUp}");
    expect(input).toHaveValue("whoami");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("projects");
    await user.keyboard("{ArrowDown}");
    expect(input).toHaveValue("");

    await user.type(input, "per{Tab}");
    expect(input).toHaveValue("performance");
  });
});

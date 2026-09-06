"use client";

import { Panel } from "@/components/ui/Panel";
import { architecturePresets } from "@/data/architecture";
import { branding } from "@/data/branding";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { createPortfolioCommandRegistry } from "@/features/terminal/domain/commands";
import { parseTerminalInput } from "@/features/terminal/domain/parser";
import type { TerminalCommand, TerminalLine, TerminalLineKind } from "@/features/terminal/domain/types";
import type { WorkspaceSection } from "@/features/workspace/types";
import { useMemo, useRef, useState } from "react";

let lineCounter = 0;

const suggestedCommandNames = [
  "help",
  "whoami",
  "stack",
  "architecture",
  "api",
  "quality",
  "performance",
  "pipeline",
  "hire"
] as const;

function createLine(kind: TerminalLineKind, value: string): TerminalLine {
  lineCounter += 1;
  return {
    id: `terminal-line-${lineCounter}`,
    kind,
    value
  };
}

interface TerminalPanelProps {
  onNavigate: (section: WorkspaceSection) => void;
  readonly variant?: "workspace" | "screen";
}

export function TerminalPanel({
  onNavigate,
  variant = "workspace"
}: Readonly<TerminalPanelProps>): React.ReactElement {
  const registry = useMemo(() => createPortfolioCommandRegistry(), []);
  const registryCommands = useMemo(() => registry.list(), [registry]);
  const suggestedCommands = useMemo(
    () =>
      suggestedCommandNames
        .map((commandName) => registry.find(commandName))
        .filter((command): command is TerminalCommand => Boolean(command)),
    [registry]
  );
  const [lines, setLines] = useState<readonly TerminalLine[]>([
    createLine("system", `${branding.appName} terminal ready. Type "help", "whoami", or "career".`)
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<readonly string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isScreenMode = variant === "screen";
  const autocompleteMatch = getAutocompleteMatch(input, registryCommands);
  const routeCommandCount = registryCommands.filter((command) =>
    ["about", "skills", "career", "experience", "quality", "architecture", "api"].includes(
      command.name
    )
  ).length;

  async function executeInput(rawInput: string): Promise<void> {
    const trimmedInput = rawInput.trim();
    if (!trimmedInput) {
      return;
    }

    const parsed = parseTerminalInput(trimmedInput);
    const command = parsed ? registry.find(parsed.commandName) : null;
    const inputLine = createLine("input", `$ ${trimmedInput}`);
    const nextHistory = [...history, trimmedInput];
    setHistory(nextHistory);
    setHistoryCursor(null);
    setInput("");

    if (!parsed || !command) {
      setLines((current) => [
        ...current,
        inputLine,
        createLine(
          "error",
          `Command not found: ${parsed?.commandName ?? trimmedInput}. Type "help".`
        )
      ]);
      return;
    }

    const output = await command.execute(parsed.args, {
      profile,
      skillGroups,
      projects,
      experience,
      architecturePresets,
      history: nextHistory
    });

    if (output.clear) {
      setLines([]);
    } else {
      setLines((current) => [
        ...current,
        inputLine,
        ...output.lines.map((line) => createLine(output.kind ?? "output", line))
      ]);
    }

    if (output.action?.type === "navigate") {
      onNavigate(output.action.section);
    }

    if (output.action?.type === "open-link") {
      window.open(output.action.href, "_blank", "noopener,noreferrer");
    }
  }

  function handleHistory(direction: "up" | "down"): void {
    if (history.length === 0) {
      return;
    }

    const nextCursor =
      direction === "up"
        ? historyCursor === null
          ? history.length - 1
          : Math.max(0, historyCursor - 1)
        : historyCursor === null
          ? null
          : historyCursor >= history.length - 1
            ? null
            : historyCursor + 1;

    setHistoryCursor(nextCursor);
    setInput(nextCursor === null ? "" : (history[nextCursor] ?? ""));
  }

  function autocomplete(): void {
    if (autocompleteMatch) {
      setInput(autocompleteMatch.name);
    }
  }

  const visibleSuggestedCommands = isScreenMode ? suggestedCommands.slice(0, 6) : suggestedCommands;

  return (
    <Panel className={`terminal-panel ${isScreenMode ? "terminal-panel-screen" : ""} overflow-hidden`}>
      <div className="terminal-header">
        <div>
          <p className="mono text-sm text-[#55d7ff]">terminal.proof</p>
          <h1>Command Interface</h1>
          <p>
            Fast keyboard path into portfolio evidence: profile, architecture, API routes,
            simulations, and hiring contact.
          </p>
        </div>
        <div className="terminal-proof-grid" aria-label="Terminal proof metrics">
          <TerminalProofMetric label="commands" value={registryCommands.length.toString()} />
          <TerminalProofMetric label="routes" value={routeCommandCount.toString()} />
          <TerminalProofMetric label="history" value={history.length.toString()} />
        </div>
        <button
          type="button"
          className="terminal-focus-button"
          onClick={() => inputRef.current?.focus()}
          data-cursor-intent="button"
          data-cursor-label="FOCUS"
        >
          focus
        </button>
      </div>

      <div className="terminal-command-rail" aria-label="Quick terminal commands">
        {visibleSuggestedCommands.map((command) => (
          <button
            key={command.name}
            type="button"
            aria-label={`Run terminal command ${command.name}`}
            onClick={() => {
              void executeInput(command.name);
            }}
            data-cursor-intent="button"
            data-cursor-label="RUN"
          >
            <span>{command.name}</span>
            <small>{command.description}</small>
          </button>
        ))}
      </div>

      <div
        className="terminal-screen mono"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className={`${lineClass(line.kind)} whitespace-pre-wrap break-words`}>
            {line.value === "" ? "\u00a0" : line.value}
          </div>
        ))}

        <p id="terminal-command-help" className="sr-only">
          Use ArrowUp and ArrowDown for command history. Use Tab for autocomplete.
        </p>
        <form
          className="terminal-input-row"
          onSubmit={(event) => {
            event.preventDefault();
            void executeInput(input);
          }}
        >
          <label className="terminal-prompt" htmlFor="terminal-input">
            $
          </label>
          <div className="terminal-input-stack">
            <input
              ref={inputRef}
              id="terminal-input"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  handleHistory("up");
                }
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  handleHistory("down");
                }
                if (event.key === "Tab") {
                  event.preventDefault();
                  autocomplete();
                }
              }}
              className="terminal-command-input"
              placeholder="help"
              aria-label="Terminal command"
              aria-describedby="terminal-command-help terminal-autocomplete-hint"
              autoComplete="off"
            />
            <span id="terminal-autocomplete-hint" className="terminal-autocomplete-hint">
              {autocompleteMatch
                ? `Tab completes to ${autocompleteMatch.name}`
                : "Try: architecture, api, quality, pipeline, challenge"}
            </span>
          </div>
        </form>
      </div>
    </Panel>
  );
}

function TerminalProofMetric({
  label,
  value
}: Readonly<{ label: string; value: string }>): React.ReactElement {
  return (
    <section>
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function getAutocompleteMatch(
  input: string,
  commands: readonly TerminalCommand[]
): TerminalCommand | undefined {
  const parsed = parseTerminalInput(input);
  if (!parsed || parsed.args.length > 0 || parsed.commandName.length === 0) {
    return undefined;
  }

  return commands.find(
    (command) => command.name.startsWith(parsed.commandName) && command.name !== parsed.commandName
  );
}

function lineClass(kind: TerminalLineKind): string {
  const classByKind: Record<TerminalLineKind, string> = {
    input: "text-[#eef5ff]",
    output: "text-[#b7c2d2]",
    error: "text-[#ff6f7d]",
    system: "text-[#6ee7a8]"
  };

  return classByKind[kind];
}

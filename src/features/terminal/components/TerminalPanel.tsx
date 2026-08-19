"use client";

import { Panel } from "@/components/ui/Panel";
import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import type { WorkspaceSection } from "@/features/workspace/types";
import { createPortfolioCommandRegistry } from "@/features/terminal/domain/commands";
import { parseTerminalInput } from "@/features/terminal/domain/parser";
import type { TerminalLine, TerminalLineKind } from "@/features/terminal/domain/types";
import { useMemo, useRef, useState } from "react";

let lineCounter = 0;

function createLine(kind: TerminalLineKind, value: string): TerminalLine {
  lineCounter += 1;
  return {
    id: `terminal-line-${lineCounter}`,
    kind,
    value
  };
}

export function TerminalPanel({
  onNavigate
}: Readonly<{
  onNavigate: (section: WorkspaceSection) => void;
}>): React.ReactElement {
  const registry = useMemo(() => createPortfolioCommandRegistry(), []);
  const [lines, setLines] = useState<readonly TerminalLine[]>([
    createLine("system", 'RyanOS terminal ready. Type "help" or "hire ryan".')
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<readonly string[]>([]);
  const [historyCursor, setHistoryCursor] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function executeInput(rawInput: string): Promise<void> {
    const trimmedInput = rawInput.trim();
    if (!trimmedInput) {
      return;
    }

    const parsed = parseTerminalInput(trimmedInput);
    const command = parsed ? registry.find(parsed.commandName) : null;
    const inputLine = createLine("input", `$ ${trimmedInput}`);
    setHistory((current) => [...current, trimmedInput]);
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
      history
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
    const parsed = parseTerminalInput(input);
    if (!parsed || parsed.args.length > 0) {
      return;
    }

    const match = registry.list().find((command) => command.name.startsWith(parsed.commandName));
    if (match) {
      setInput(match.name);
    }
  }

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[#0b0f16] px-4 py-3">
        <div>
          <p className="mono text-sm text-[#55d7ff]">terminal</p>
          <h1 className="text-xl font-semibold">Command Interface</h1>
        </div>
        <button
          type="button"
          className="mono text-xs text-[#8a96a8] hover:text-[#55d7ff]"
          onClick={() => inputRef.current?.focus()}
        >
          focus
        </button>
      </div>

      <div
        className="mono min-h-[520px] overflow-auto bg-[#05070b] p-4 text-sm leading-6"
        role="log"
        aria-live="polite"
        aria-label="Terminal output"
        onClick={() => inputRef.current?.focus()}
      >
        {lines.map((line) => (
          <div key={line.id} className={lineClass(line.kind)}>
            {line.value === "" ? "\u00a0" : line.value}
          </div>
        ))}

        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            void executeInput(input);
          }}
        >
          <label className="text-[#55d7ff]" htmlFor="terminal-input">
            $
          </label>
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
            className="min-h-8 flex-1 bg-transparent text-[#eef5ff] outline-none placeholder:text-[#556174]"
            placeholder="help"
            aria-label="Terminal command"
            autoComplete="off"
          />
        </form>
      </div>
    </Panel>
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

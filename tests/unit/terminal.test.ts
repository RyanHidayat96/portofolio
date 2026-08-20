import { experience } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skillGroups } from "@/data/skills";
import { createPortfolioCommandRegistry } from "@/features/terminal/domain/commands";
import { parseTerminalInput } from "@/features/terminal/domain/parser";
import type { TerminalContext } from "@/features/terminal/domain/types";
import { describe, expect, it } from "vitest";

function createTerminalContext(history: readonly string[] = []): TerminalContext {
  return {
    profile,
    skillGroups,
    projects,
    experience,
    history
  };
}

describe("terminal parser", () => {
  it("parses command names and quoted args", () => {
    expect(parseTerminalInput('hire "portfolio owner"')).toEqual({
      commandName: "hire",
      args: ["portfolio owner"]
    });
  });

  it("returns null for empty input", () => {
    expect(parseTerminalInput("   ")).toBeNull();
  });

  it("normalizes command casing and preserves single-quoted args", () => {
    expect(parseTerminalInput("  ABOUT   'profile summary' stack  ")).toEqual({
      commandName: "about",
      args: ["profile summary", "stack"]
    });
  });
});

describe("portfolio command registry", () => {
  it("lists help commands once in stable alphabetical order", async () => {
    const registry = createPortfolioCommandRegistry();
    const output = await registry.find("help")?.execute([], createTerminalContext());
    const commandNames = output?.lines.map((line) => line.trim().split(/\s+/)[0]);

    expect(commandNames).toEqual([
      "about",
      "architecture",
      "clear",
      "contact",
      "experience",
      "help",
      "hire",
      "history",
      "performance",
      "pipeline",
      "projects",
      "skills",
      "stack",
      "test",
      "whoami"
    ]);
    expect(new Set(commandNames).size).toBe(commandNames?.length);
  });

  it("executes whoami command from centralized profile data", async () => {
    const registry = createPortfolioCommandRegistry();
    const output = await registry.find("whoami")?.execute([], createTerminalContext());

    expect(output?.lines).toContain(profile.name);
    expect(output?.lines).toContain(profile.headline);
  });

  it("hire command opens contact section", async () => {
    const registry = createPortfolioCommandRegistry();
    const output = await registry.find("hire")?.execute(["owner"], createTerminalContext());

    expect(output?.action).toEqual({ type: "navigate", section: "contact" });
    expect(output?.lines.join("\n")).toContain("Strong Match");
  });

  it("routes navigation commands to expected workspace sections", async () => {
    const registry = createPortfolioCommandRegistry();
    const expectedRoutes = new Map([
      ["about", "profile"],
      ["skills", "profile"],
      ["experience", "experience"],
      ["projects", "projects"],
      ["contact", "contact"],
      ["architecture", "architecture"],
      ["test", "automation"],
      ["pipeline", "pipeline"],
      ["performance", "performance"]
    ]);

    for (const [commandName, section] of expectedRoutes) {
      const output = await registry.find(commandName)?.execute([], createTerminalContext());
      expect(output?.action).toEqual({ type: "navigate", section });
    }
  });

  it("supports clear, history, stack, and unknown command lookup", async () => {
    const registry = createPortfolioCommandRegistry();
    const emptyHistory = await registry.find("history")?.execute([], createTerminalContext());
    const populatedHistory = await registry
      .find("history")
      ?.execute([], createTerminalContext(["whoami", "projects"]));
    const clearOutput = await registry.find("clear")?.execute([], createTerminalContext());
    const stackOutput = await registry.find("stack")?.execute([], createTerminalContext());

    expect(clearOutput).toEqual({
      lines: [],
      clear: true
    });
    expect(emptyHistory?.lines).toEqual(["No command history yet."]);
    expect(populatedHistory?.lines).toEqual(["whoami", "projects"]);
    expect(stackOutput?.lines).toEqual(
      expect.arrayContaining(["Next.js", "React Testing Library"])
    );
    expect(registry.find("not-real")).toBeNull();
  });
});

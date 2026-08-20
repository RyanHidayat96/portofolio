import type { WorkspaceSection } from "@/features/workspace/types";
import type { TerminalCommand, TerminalContext, TerminalOutput } from "./types";

function lines(...values: readonly string[]): TerminalOutput {
  return { lines: values };
}

function navigate(section: WorkspaceSection, ...values: readonly string[]): TerminalOutput {
  return {
    lines: values,
    action: {
      type: "navigate",
      section
    }
  };
}

class StaticCommand implements TerminalCommand {
  constructor(
    readonly name: string,
    readonly description: string,
    private readonly run: (args: readonly string[], context: TerminalContext) => TerminalOutput
  ) {}

  execute(args: readonly string[], context: TerminalContext): TerminalOutput {
    return this.run(args, context);
  }
}

class ClearCommand implements TerminalCommand {
  readonly name = "clear";
  readonly description = "Clear terminal output.";

  execute(): TerminalOutput {
    return { lines: [], clear: true };
  }
}

class HelpCommand implements TerminalCommand {
  readonly name = "help";
  readonly description = "List available commands.";

  constructor(private readonly getCommands: () => readonly TerminalCommand[]) {}

  execute(): TerminalOutput {
    return {
      lines: this.getCommands().map(
        (command) => `${command.name.padEnd(12)} ${command.description}`
      )
    };
  }
}

export class TerminalCommandRegistry {
  private readonly commands = new Map<string, TerminalCommand>();

  register(command: TerminalCommand): void {
    this.commands.set(command.name, command);
    for (const alias of command.aliases ?? []) {
      this.commands.set(alias, command);
    }
  }

  list(): readonly TerminalCommand[] {
    return Array.from(new Set(this.commands.values())).sort((a, b) => a.name.localeCompare(b.name));
  }

  find(name: string): TerminalCommand | null {
    return this.commands.get(name.toLowerCase()) ?? null;
  }
}

export function createPortfolioCommandRegistry(): TerminalCommandRegistry {
  const registry = new TerminalCommandRegistry();

  registry.register(new HelpCommand(() => registry.list()));
  registry.register(new ClearCommand());

  registry.register(
    new StaticCommand("whoami", "Show profile.", (_args, context) =>
      lines(context.profile.name, context.profile.headline, context.profile.tagline)
    )
  );

  registry.register(
    new StaticCommand("about", "Open profile summary.", (_args, context) =>
      navigate("profile", context.profile.summary)
    )
  );

  registry.register(
    new StaticCommand("skills", "List grouped skills.", (_args, context) =>
      navigate(
        "profile",
        ...context.skillGroups.map(
          (group) => `${group.title}: ${group.skills.map((skill) => skill.name).join(", ")}`
        )
      )
    )
  );

  registry.register(
    new StaticCommand("experience", "Open experience timeline.", (_args, context) =>
      navigate(
        "experience",
        ...context.experience.map((role) => `${role.role} at ${role.company} (${role.period})`)
      )
    )
  );

  registry.register(
    new StaticCommand("projects", "Open project case studies.", (_args, context) =>
      navigate("projects", ...context.projects.map((project) => project.title))
    )
  );

  registry.register(
    new StaticCommand("stack", "Show core stack.", () =>
      lines("Next.js", "React", "TypeScript", "Tailwind CSS", "Vitest", "React Testing Library")
    )
  );

  registry.register(
    new StaticCommand("contact", "Open contact channel.", () =>
      navigate("contact", "Opening contact workspace...")
    )
  );

  registry.register(
    new StaticCommand("architecture", "Open architecture explorer.", () =>
      navigate("architecture", "Opening engineering topology...")
    )
  );

  registry.register(
    new StaticCommand("test", "Open automation lab.", () =>
      navigate("automation", "Automation lab ready. Run or break demo suite.")
    )
  );

  registry.register(
    new StaticCommand("pipeline", "Open pipeline simulator.", () =>
      navigate("pipeline", "Quality pipeline console ready.")
    )
  );

  registry.register(
    new StaticCommand("performance", "Open performance lab.", () =>
      navigate("performance", "Performance thresholds loaded.")
    )
  );

  registry.register(
    new StaticCommand("hire", "Run candidate evaluation.", (_args, context) => {
      const evidenceLines = context.skillGroups
        .flatMap((group) => group.skills.map((skill) => `${skill.name.padEnd(24)} strong`))
        .slice(0, 5);

      return navigate(
        "contact",
        "Running candidate evaluation...",
        "",
        `Identity              ${context.profile.name}`,
        ...evidenceLines,
        "",
        "Result: Strong Match",
        "Opening contact channel..."
      );
    })
  );

  registry.register(
    new StaticCommand("history", "Show command history.", (_args, context) =>
      context.history.length > 0 ? lines(...context.history) : lines("No command history yet.")
    )
  );

  return registry;
}

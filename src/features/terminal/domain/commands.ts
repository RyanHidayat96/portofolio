import type { WorkspaceSection } from "@/features/workspace/types";
import { isPortfolioValueConfigured } from "@/lib/portfolio-values";
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

function openLink(href: string, label: string, ...values: readonly string[]): TerminalOutput {
  return {
    lines: values,
    action: {
      type: "open-link",
      href,
      label
    }
  };
}

class StaticCommand implements TerminalCommand {
  constructor(
    readonly name: string,
    readonly description: string,
    private readonly run: (args: readonly string[], context: TerminalContext) => TerminalOutput,
    readonly aliases?: readonly string[]
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
    new StaticCommand("whoami", "Show Full Stack x SDET identity.", (_args, context) =>
      lines(
        context.profile.name,
        context.profile.headline,
        "",
        "Current focus:",
        "Building enterprise applications while applying quality engineering across delivery.",
        "",
        `Current role: ${context.profile.role}`,
        `Location: ${context.profile.location}`
      )
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
    new StaticCommand("career", "Show public career summary.", () =>
      navigate(
        "experience",
        "Public career summary:",
        "Build: Full Stack Development",
        "Quality: SDET and automation depth",
        "Ship: CI/CD, release gates, and production readiness",
        "",
        "Full company timeline and responsibilities are in the CV."
      )
    )
  );
  registry.register(
    new StaticCommand("experience", "Open public experience summary.", () =>
      navigate(
        "experience",
        "Public experience view:",
        "Full Stack Development: application, API, backend, and data workflows.",
        "Quality Engineering: automation, API testing, mobile checks, and release gates.",
        "Delivery Systems: CI/CD, Docker, reporting, and production readiness.",
        "",
        "Detailed companies, dates, and responsibilities stay in the CV."
      )
    )
  );
  registry.register(
    new StaticCommand("projects", "Open project case studies.", (_args, context) =>
      navigate(
        "projects",
        ...context.projects.map((project) => `${project.title} [${project.categories.join(", ")}]`)
      )
    )
  );

  registry.register(
    new StaticCommand("stack", "Show build, quality, data, and delivery stack.", (_args, context) =>
      lines(
        `Build: ${getTechnologiesForCategory(context, "build").join(", ")}`,
        `Quality: ${getTechnologiesForCategory(context, "quality").join(", ")}`,
        `Delivery: ${getTechnologiesForCategory(context, "devops").join(", ")}`
      )
    )
  );

  registry.register(
    new StaticCommand("build", "Show build-side capability.", (_args, context) => {
      const buildGroup = context.skillGroups.find((group) => group.id === "build");

      return navigate(
        "projects",
        "Build capability:",
        ...(buildGroup?.skills.map((skill) => `${skill.name}: ${skill.purpose}`) ?? []),
        "",
        "Project names and role details are summarized visually. Full detail stays in the CV."
      );
    })
  );
  registry.register(
    new StaticCommand("quality", "Show quality engineering capability.", (_args, context) => {
      const qualityGroup = context.skillGroups.find((group) => group.id === "quality");
      const deliveryGroup = context.skillGroups.find((group) => group.id === "delivery");

      return navigate(
        "automation",
        "Quality capability:",
        ...(qualityGroup?.skills.map((skill) => `${skill.name}: ${skill.purpose}`) ?? []),
        ...(deliveryGroup?.skills.map((skill) => `${skill.name}: ${skill.purpose}`) ?? []),
        "",
        "Public portfolio shows capability patterns; CV holds full work detail."
      );
    })
  );
  registry.register(
    new StaticCommand("contact", "Open contact channel.", (_args, context) =>
      navigate(
        "contact",
        "Opening contact workspace...",
        ...Object.values(context.profile.contact)
          .filter(
            (link) =>
              isPortfolioValueConfigured(link.href) && isPortfolioValueConfigured(link.value)
          )
          .map((link) => `${link.label}: ${link.value}`)
      )
    )
  );

  registry.register(
    new StaticCommand("cv", "Open CV download.", (_args, context) => {
      const cv = context.profile.contact.cv;

      if (!isPortfolioValueConfigured(cv.href)) {
        return navigate("contact", "CV download not configured. Opening contact workspace.");
      }

      return openLink(cv.href, cv.label, `Opening ${cv.value}...`, cv.href);
    })
  );

  registry.register(
    new StaticCommand("architecture", "Open architecture explorer.", (_args, context) =>
      navigate(
        "architecture",
        "Opening engineering topology...",
        ...context.architecturePresets.map((preset) => preset.title)
      )
    )
  );

  registry.register(
    new StaticCommand(
      "test",
      "Open automation lab.",
      () => navigate("automation", "Automation lab ready. Run or break demo suite."),
      ["automation"]
    )
  );

  registry.register(
    new StaticCommand("pipeline", "Open pipeline simulator.", () =>
      navigate("pipeline", "Software delivery pipeline ready.")
    )
  );

  registry.register(
    new StaticCommand("performance", "Open performance lab.", () =>
      navigate("performance", "Performance thresholds loaded.")
    )
  );

  registry.register(
    new StaticCommand("api", "Open API playground.", () =>
      navigate("api", "API playground ready. Public route handlers available.")
    )
  );

  registry.register(
    new StaticCommand(
      "challenge",
      "Open engineering challenge.",
      () => navigate("challenge", "Engineering challenge ready. Pick a scenario."),
      ["test-me"]
    )
  );

  registry.register(
    new StaticCommand("hire", "Run candidate evaluation.", (_args, context) => {
      const capabilityLines = context.skillGroups
        .flatMap((group) => group.skills.map((skill) => `${skill.name.padEnd(24)} strong`))
        .slice(0, 5);

      return navigate(
        "contact",
        "Running candidate evaluation...",
        "",
        `Identity              ${context.profile.name}`,
        ...capabilityLines,
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


function getTechnologiesForCategory(
  context: TerminalContext,
  category: "build" | "quality" | "devops"
): readonly string[] {
  return [
    ...new Set(
      context.projects
        .filter((project) => project.categories.includes(category))
        .flatMap((project) => project.technologies)
    )
  ].slice(0, 12);
}

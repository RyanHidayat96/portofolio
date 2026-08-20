import type { WorkspaceSection } from "@/features/workspace/types";
import type {
  ArchitecturePreset,
  ExperienceRole,
  Profile,
  ProjectCaseStudy,
  SkillGroup
} from "@/data/types";

export interface ParsedTerminalInput {
  readonly commandName: string;
  readonly args: readonly string[];
}

export type TerminalLineKind = "input" | "output" | "error" | "system";

export interface TerminalLine {
  readonly id: string;
  readonly kind: TerminalLineKind;
  readonly value: string;
}

export type TerminalAction =
  | {
      readonly type: "navigate";
      readonly section: WorkspaceSection;
    }
  | {
      readonly type: "open-link";
      readonly href: string;
      readonly label: string;
    };

export interface TerminalOutput {
  readonly lines: readonly string[];
  readonly kind?: Exclude<TerminalLineKind, "input">;
  readonly clear?: boolean;
  readonly action?: TerminalAction;
}

export interface TerminalContext {
  readonly profile: Profile;
  readonly skillGroups: readonly SkillGroup[];
  readonly projects: readonly ProjectCaseStudy[];
  readonly experience: readonly ExperienceRole[];
  readonly architecturePresets: readonly ArchitecturePreset[];
  readonly history: readonly string[];
}

export interface TerminalCommand {
  readonly name: string;
  readonly aliases?: readonly string[];
  readonly description: string;
  execute(
    args: readonly string[],
    context: TerminalContext
  ): TerminalOutput | Promise<TerminalOutput>;
}

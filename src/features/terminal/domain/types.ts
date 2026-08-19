import type { WorkspaceSection } from "@/features/workspace/types";
import type { ExperienceRole, Profile, ProjectCaseStudy, SkillGroup } from "@/data/types";

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

export interface TerminalAction {
  readonly type: "navigate";
  readonly section: WorkspaceSection;
}

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

export type WorkspaceMode = "recruiter" | "engineer";

export type WorkspaceSection =
  | "overview"
  | "profile"
  | "experience"
  | "projects"
  | "automation"
  | "pipeline"
  | "performance"
  | "api"
  | "architecture"
  | "terminal"
  | "challenge"
  | "contact";

export type WorkspaceSceneTransitionPhase = "idle" | "exit" | "enter";

export interface WorkspaceSceneTransition {
  readonly phase: WorkspaceSceneTransitionPhase;
  readonly targetLabel: string;
  readonly sequence: number;
}
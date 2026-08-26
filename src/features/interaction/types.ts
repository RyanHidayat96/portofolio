export type CursorIntent = "default" | "hover" | "link" | "button" | "node" | "project" | "drag" | "view";

export interface CursorPresentation {
  readonly intent: CursorIntent;
  readonly label?: string;
}

export interface CursorState extends CursorPresentation {
  readonly isPressed: boolean;
  readonly isVisible: boolean;
}

export const cursorIntentLabels: Partial<Record<CursorIntent, string>> = {
  link: "OPEN",
  button: "SELECT",
  node: "NODE",
  project: "OPEN",
  drag: "DRAG",
  view: "VIEW"
};

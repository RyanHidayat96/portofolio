"use client";

import {
  cursorIntentLabels,
  type CursorIntent,
  type CursorPresentation,
  type CursorState
} from "@/features/interaction/types";
import { supportsFinePointer } from "@/lib/motion";
import { useCallback, useEffect, useRef, useState } from "react";

const interactiveSelector = [
  "[data-cursor-intent]",
  ".project-card-button",
  ".hero-core-node",
  ".architecture-node",
  "a[href]",
  "button:not(:disabled)",
  '[role="button"]'
].join(",");

const initialCursorState: CursorState = {
  intent: "default",
  isPressed: false,
  isVisible: false
};

export function CustomCursor(): React.ReactElement | null {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingPositionRef = useRef({ x: -100, y: -100 });
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorState, setCursorState] = useState<CursorState>(initialCursorState);

  const setCursorPosition = useCallback((x: number, y: number): void => {
    pendingPositionRef.current = { x, y };

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const cursor = cursorRef.current;

      if (!cursor) {
        return;
      }

      cursor.style.setProperty("--cursor-x", `${pendingPositionRef.current.x}px`);
      cursor.style.setProperty("--cursor-y", `${pendingPositionRef.current.y}px`);
    });
  }, []);

  const updateCursorState = useCallback((nextState: Partial<CursorState>): void => {
    setCursorState((currentState) => {
      const mergedState = { ...currentState, ...nextState };
      const unchanged =
        mergedState.intent === currentState.intent &&
        mergedState.label === currentState.label &&
        mergedState.isPressed === currentState.isPressed &&
        mergedState.isVisible === currentState.isVisible;

      return unchanged ? currentState : mergedState;
    });
  }, []);

  useEffect(() => {
    const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updateEnabledState = (): void => {
      setIsEnabled(supportsFinePointer() && !reduceMotionQuery.matches && finePointerQuery.matches);
    };

    updateEnabledState();
    reduceMotionQuery.addEventListener("change", updateEnabledState);
    finePointerQuery.addEventListener("change", updateEnabledState);

    return () => {
      reduceMotionQuery.removeEventListener("change", updateEnabledState);
      finePointerQuery.removeEventListener("change", updateEnabledState);
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }

    const onPointerMove = (event: PointerEvent): void => {
      setCursorPosition(event.clientX, event.clientY);
      const presentation = getCursorPresentation(event.target);
      updateCursorState({
        intent: presentation.intent,
        label: presentation.label,
        isVisible: true
      });
    };
    const onPointerDown = (): void => updateCursorState({ isPressed: true });
    const onPointerUp = (): void => updateCursorState({ isPressed: false });
    const onPointerLeave = (): void => updateCursorState({ isVisible: false, isPressed: false });

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [isEnabled, setCursorPosition, updateCursorState]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      data-intent={cursorState.intent}
      data-pressed={cursorState.isPressed}
      data-visible={cursorState.isVisible}
      aria-hidden="true"
    >
      <span className="custom-cursor-ring" />
      <span className="custom-cursor-dot" />
      {cursorState.label ? <span className="custom-cursor-label">{cursorState.label}</span> : null}
    </div>
  );
}

function getCursorPresentation(target: EventTarget | null): CursorPresentation {
  if (!(target instanceof Element)) {
    return { intent: "default" };
  }

  const element = target.closest<HTMLElement>(interactiveSelector);
  if (!element) {
    return { intent: "default" };
  }

  const explicitIntent = normalizeCursorIntent(element.dataset.cursorIntent);
  if (explicitIntent) {
    return {
      intent: explicitIntent,
      label: element.dataset.cursorLabel ?? cursorIntentLabels[explicitIntent]
    };
  }

  if (element.classList.contains("project-card-button")) {
    return { intent: "project", label: cursorIntentLabels.project };
  }

  if (element.classList.contains("hero-core-node") || element.classList.contains("architecture-node")) {
    return { intent: "node", label: cursorIntentLabels.node };
  }

  if (element.matches("a[href]")) {
    return { intent: "link", label: element.hasAttribute("download") ? "CV" : cursorIntentLabels.link };
  }

  if (element.matches("button:not(:disabled), [role='button']")) {
    return { intent: "button", label: cursorIntentLabels.button };
  }

  return { intent: "hover" };
}

function normalizeCursorIntent(value: string | undefined): CursorIntent | undefined {
  const validIntents: readonly CursorIntent[] = [
    "default",
    "hover",
    "link",
    "button",
    "node",
    "project",
    "drag",
    "view"
  ];

  return validIntents.find((intent) => intent === value);
}

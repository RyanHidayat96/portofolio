"use client";

import { useReducedMotion } from "@/features/interaction/hooks/useReducedMotion";
import type { FocusEventHandler, PointerEventHandler, RefCallback } from "react";
import { useCallback, useEffect, useRef } from "react";

export interface MagneticInteractionOptions {
  readonly enabled?: boolean;
  readonly maxOffset?: number;
  readonly strength?: number;
}

export interface MagneticInteractionHandlers<T extends HTMLElement> {
  readonly setMagneticElement: RefCallback<T>;
  readonly onPointerMove: PointerEventHandler<T>;
  readonly onPointerLeave: PointerEventHandler<T>;
  readonly onBlur: FocusEventHandler<T>;
}

interface PendingMagneticOffset {
  readonly x: number;
  readonly y: number;
}

const defaultMaxOffset = 8;
const defaultStrength = 0.14;

export function useMagneticInteraction<T extends HTMLElement>({
  enabled = false,
  maxOffset = defaultMaxOffset,
  strength = defaultStrength
}: MagneticInteractionOptions = {}): MagneticInteractionHandlers<T> {
  const elementRef = useRef<T | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingOffsetRef = useRef<PendingMagneticOffset | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const cancelFrame = useCallback((): void => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const setMagneticElement = useCallback<RefCallback<T>>((element) => {
    elementRef.current = element;
  }, []);

  const reset = useCallback((): void => {
    cancelFrame();
    pendingOffsetRef.current = null;
    const element = elementRef.current;
    element?.style.setProperty("--magnetic-x", "0px");
    element?.style.setProperty("--magnetic-y", "0px");
  }, [cancelFrame]);

  const scheduleOffset = useCallback((offset: PendingMagneticOffset): void => {
    pendingOffsetRef.current = offset;

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      const nextOffset = pendingOffsetRef.current;
      const element = elementRef.current;

      if (!nextOffset || !element) {
        return;
      }

      element.style.setProperty("--magnetic-x", `${nextOffset.x.toFixed(2)}px`);
      element.style.setProperty("--magnetic-y", `${nextOffset.y.toFixed(2)}px`);
    });
  }, []);

  const onPointerMove = useCallback<PointerEventHandler<T>>(
    (event) => {
      if (!enabled || prefersReducedMotion || event.pointerType !== "mouse") {
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = clamp((event.clientX - centerX) * strength, -maxOffset, maxOffset);
      const y = clamp((event.clientY - centerY) * strength, -maxOffset, maxOffset);

      scheduleOffset({ x, y });
    },
    [enabled, maxOffset, prefersReducedMotion, scheduleOffset, strength]
  );

  const onPointerLeave = useCallback<PointerEventHandler<T>>(() => reset(), [reset]);
  const onBlur = useCallback<FocusEventHandler<T>>(() => reset(), [reset]);

  useEffect(() => reset, [reset]);

  return {
    setMagneticElement,
    onPointerMove,
    onPointerLeave,
    onBlur
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

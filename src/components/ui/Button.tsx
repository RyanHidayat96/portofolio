"use client";

import { useMagneticInteraction } from "@/features/interaction/hooks/useMagneticInteraction";
import type { CursorIntent } from "@/features/interaction/types";
import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly icon?: ReactNode;
  readonly cursorIntent?: CursorIntent;
  readonly cursorLabel?: string;
  readonly magnetic?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: "button-primary",
  secondary: "button-secondary",
  ghost: "button-ghost",
  danger: "button-danger"
};

export function Button({
  className,
  variant = "secondary",
  icon,
  children,
  type = "button",
  cursorIntent = "button",
  cursorLabel,
  magnetic = false,
  onBlur,
  onPointerLeave,
  onPointerMove,
  ...props
}: ButtonProps): React.ReactElement {
  const {
    setMagneticElement,
    onBlur: onMagneticBlur,
    onPointerLeave: onMagneticPointerLeave,
    onPointerMove: onMagneticPointerMove
  } = useMagneticInteraction<HTMLButtonElement>({ enabled: magnetic });

  return (
    <button
      ref={setMagneticElement}
      type={type}
      className={cn("button-base", variantClass[variant], magnetic && "magnetic-surface", className)}
      data-cursor-intent={cursorIntent}
      data-cursor-label={cursorLabel}
      onBlur={(event) => {
        onMagneticBlur(event);
        onBlur?.(event);
      }}
      onPointerLeave={(event) => {
        onMagneticPointerLeave(event);
        onPointerLeave?.(event);
      }}
      onPointerMove={(event) => {
        onMagneticPointerMove(event);
        onPointerMove?.(event);
      }}
      {...props}
    >
      {icon}
      <span className="min-w-0 break-words text-center">{children}</span>
    </button>
  );
}

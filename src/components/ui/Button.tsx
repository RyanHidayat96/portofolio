import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly icon?: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--accent-strong)] bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]",
  secondary:
    "border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-[var(--accent-strong)]",
  ghost:
    "border-transparent text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-primary)]",
  danger:
    "border-[rgba(255,111,125,0.6)] bg-[var(--danger-soft)] text-[#ff9aa4] hover:bg-[var(--danger-hover)]"
};

export function Button({
  className,
  variant = "secondary",
  icon,
  children,
  type = "button",
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex min-h-[var(--touch-target)] items-center justify-center gap-2 rounded-[var(--radius-control)] border px-4 py-2 text-sm font-semibold leading-tight transition",
        "disabled:cursor-not-allowed disabled:opacity-45",
        variantClass[variant],
        className
      )}
      {...props}
    >
      {icon}
      <span className="min-w-0 break-words text-center">{children}</span>
    </button>
  );
}

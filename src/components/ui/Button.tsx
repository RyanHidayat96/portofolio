import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly icon?: ReactNode;
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
  ...props
}: ButtonProps): React.ReactElement {
  return (
    <button type={type} className={cn("button-base", variantClass[variant], className)} {...props}>
      {icon}
      <span className="min-w-0 break-words text-center">{children}</span>
    </button>
  );
}

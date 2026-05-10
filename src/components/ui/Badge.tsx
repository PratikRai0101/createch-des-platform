import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

type BadgeVariant = "success" | "warning" | "error" | "info" | "neutral";

const variants: Record<BadgeVariant, string> = {
  success: "bg-green-50 text-green-700 border-green-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  error: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-gray-50 text-gray-600 border-gray-200",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
}

export function Badge({ variant = "neutral", pulse, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
        variants[variant],
        pulse && "animate-pulse",
        className,
      )}
      {...props}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
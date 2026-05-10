import type { HTMLAttributes } from "react";
import { clsx } from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export function Card({ padding = "md", className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "bg-white rounded-2xl shadow-sm border border-gray-200",
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
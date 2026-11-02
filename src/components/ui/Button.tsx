import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  variant?: "primary" | "secondary" | "outline";
  size?: "md" | "lg";
  className?: string;
  tabIndex?: number;
};

const variants = {
  primary: "bg-teal-500 text-white hover:bg-teal-600 focus-visible:bg-teal-600",
  secondary: "bg-navy-800 text-white hover:bg-navy-700 focus-visible:bg-navy-700",
  outline: "border border-navy-800 text-navy-800 hover:bg-navy-50 focus-visible:bg-navy-50",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export function Button({
  children,
  href,
  onClick,
  type = "button",
  disabled,
  variant = "primary",
  size = "md",
  className,
  tabIndex,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60",
    variants[variant],
    sizes[size],
    className
  );

  if (href) {
    return (
      <a href={href} className={classes} tabIndex={tabIndex}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} tabIndex={tabIndex} className={classes}>
      {children}
    </button>
  );
}

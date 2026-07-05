import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
          variant === "primary" && "bg-black text-white hover:bg-black/80 shadow-lg",
          variant === "secondary" && "bg-muted text-black hover:bg-border",
          variant === "outline" && "border-2 border-gold-dark text-gold-dark hover:bg-gold hover:text-black",
          variant === "ghost" && "text-black/70 hover:bg-muted",
          size === "sm" && "px-4 py-2 text-sm",
          size === "md" && "px-6 py-3 text-sm",
          size === "lg" && "px-8 py-4 text-base",
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

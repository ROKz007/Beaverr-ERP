import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  arrow?: boolean;
}

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium " +
  "transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] " +
  "disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-primary text-white hover:brightness-110",
  secondary: "bg-black/5 text-primary hover:bg-black/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15",
  ghost: "text-muted hover:text-primary dark:hover:text-white",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", arrow, children, ...props }, ref) => {
    return (
      <button ref={ref} className={[base, variants[variant], className].filter(Boolean).join(" ")} {...props}>
        <span>{children}</span>
        {arrow && (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:-translate-y-px dark:bg-white/10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </button>
    );
  },
);
Button.displayName = "Button";

import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={[
        "w-full rounded-full border border-black/[0.06] bg-black/[0.02] px-5 py-3 text-[15px] text-primary",
        "placeholder:text-muted outline-none transition-shadow duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
        "focus:border-transparent focus:ring-2 focus:ring-accent/40",
        "dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-accent/50",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  ),
);
Input.displayName = "Input";

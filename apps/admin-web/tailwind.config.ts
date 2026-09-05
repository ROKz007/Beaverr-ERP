import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        accent: "var(--accent)",
        warm: "var(--warm)",
        success: "var(--success)",
        warning: "var(--warning)",
        destructive: "var(--destructive)",
        muted: "var(--muted)",
        sidebar: "var(--sidebar)",
        "sidebar-active": "var(--primary)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
} satisfies Config;

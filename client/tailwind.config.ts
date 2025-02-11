import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // General colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        border: 'var(--border)',
        mutedText: 'var(--muted-text)',
        linkColor: 'var(--link-color)',
        highlight: 'var(--highlight)',

        // Text colors
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textMuted: 'var(--text-muted)',
        textError: 'var(--text-error)',
        textSuccess: 'var(--text-success)',
        textWarning: 'var(--text-warning)',
        textInfo: 'var(--text-info)',

        // Card & element colors
        cardBg: 'var(--card-bg)',
        cardBorder: 'var(--card-border)',
        cardShadow: 'var(--card-shadow)',

        // Primary colors
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',

        // Status colors
        statusDanger: 'var(--status-danger)',
        statusWarning: 'var(--status-warning)',
        statusSuccess: 'var(--status-success)',
        statusInfo: 'var(--status-info)',

        // Priority colors
        priorityLow: 'var(--priority-low)',
        priorityMedium: 'var(--priority-medium)',
        priorityHigh: 'var(--priority-high)',
        priorityUrgent: 'var(--priority-urgent)',

        // Board & table status colors
        statusTodo: 'var(--status-todo)',
        statusInProgress: 'var(--status-inprogress)',
        statusDone: 'var(--status-done)',
        statusBlocked: 'var(--status-blocked)',

        // Button colors
        buttonBg: 'var(--button-bg)',
        buttonHover: 'var(--button-hover)',
        buttonText: 'var(--button-text)',
      },
    },
  },
  plugins: [],
} satisfies Config;

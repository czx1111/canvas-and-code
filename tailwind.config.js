/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          active: "var(--color-primary-active)",
          disabled: "var(--color-primary-disabled)",
        },
        ink: "var(--color-ink)",
        body: {
          DEFAULT: "var(--color-body)",
          strong: "var(--color-body-strong)",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          soft: "var(--color-muted-soft)",
        },
        hairline: {
          DEFAULT: "var(--color-hairline)",
          soft: "var(--color-hairline-soft)",
        },
        canvas: "var(--color-canvas)",
        surface: {
          soft: "var(--color-surface-soft)",
          card: "var(--color-surface-card)",
          "cream-strong": "#e8e0d2",
          dark: "#181715",
          "dark-elevated": "#252320",
          "dark-soft": "#1f1e1b",
        },
        "on-primary": "#ffffff",
        "on-dark": {
          DEFAULT: "#faf9f5",
          soft: "#a09d96",
        },
        accent: {
          teal: "#5db8a6",
          amber: "#e8a55a",
        },
        success: "#5db872",
        warning: "#d4a017",
        error: "#c64545",
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', '"STSong"', '"SimSun"', 'serif'],
        body: ['"Inter"', '"Noto Serif SC"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Noto Serif SC"', 'monospace'],
      },
      fontSize: {
        micro:   ['12px', { lineHeight: '1.5' }],
        caption: ['13px', { lineHeight: '1.6' }],
        'prose-sm': ['15px', { lineHeight: '1.75' }],
        prose:   ['17px', { lineHeight: '1.9' }],
        'prose-lg': ['19px', { lineHeight: '1.85' }],
        h4:      ['18px', { lineHeight: '1.5' }],
        h3:      ['22px', { lineHeight: '1.4' }],
        h2:      ['28px', { lineHeight: '1.35' }],
        h1:      ['34px', { lineHeight: '1.3' }],
        display: ['44px', { lineHeight: '1.2' }],
        'display-lg': ['60px', { lineHeight: '1.15' }],
      },
      borderRadius: {
        xs: "4px",
        sm: "6px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        pill: "9999px",
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "96px",
        'section-sm': '64px',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pageIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        revealUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        strokeDraw: {
          '0%': { strokeDashoffset: '200' },
          '100%': { strokeDashoffset: '0' },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.6s ease-out forwards",
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        'page-in': 'pageIn 0.3s ease-out',
        'reveal-up': 'revealUp 0.6s cubic-bezier(0.22, 0.61, 0.36, 1) forwards',
        'stroke-draw': 'strokeDraw 1.2s ease-in-out 0.2s forwards',
      },
    },
  },
  plugins: [],
}

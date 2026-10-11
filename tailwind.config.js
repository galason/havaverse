/**
 * HavaVerse colour tokens resolve through CSS variables (see index.css) so the
 * same utilities render correctly in the Dark and Light environments. The
 * scale names (ink / mist / white) are kept for the existing product; the
 * semantic aliases below are the preferred names for new work.
 */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Anton', 'Impact', 'sans-serif'],
      },
      colors: {
        /** Primary text in the active theme — white at night, deep ink by day. */
        white: token('white'),
        ink: {
          950: token('ink-950'),
          900: token('ink-900'),
          850: token('ink-850'),
          800: token('ink-800'),
          700: token('ink-700'),
          600: token('ink-600'),
          500: token('ink-500'),
        },
        mist: {
          100: token('mist-100'),
          200: token('mist-200'),
          300: token('mist-300'),
          400: token('mist-400'),
        },
        brand: {
          violet: token('brand-violet'),
          indigo: token('brand-indigo'),
          magenta: token('brand-magenta'),
          amber: token('brand-amber'),
          cyan: token('brand-cyan'),
        },
        live: token('live'),

        /* Semantic aliases — same variables, role-based names. */
        canvas: token('ink-950'),
        surface: {
          DEFAULT: token('ink-900'),
          elevated: token('ink-850'),
          secondary: token('ink-800'),
          interactive: token('ink-700'),
          selected: token('ink-600'),
        },
        fg: {
          DEFAULT: token('white'),
          body: token('mist-100'),
          secondary: token('mist-300'),
          muted: token('mist-400'),
        },
        line: {
          subtle: token('ink-700'),
          strong: token('ink-500'),
        },
        accent: {
          DEFAULT: token('brand-indigo'),
          secondary: token('brand-violet'),
        },
        status: {
          success: token('status-success'),
          /** Success as text — lighter at night, deeper by day. */
          'success-fg': token('status-success-fg'),
          warning: token('brand-amber'),
          error: token('live'),
          live: token('live'),
          ai: token('brand-violet'),
        },
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      transitionTimingFunction: {
        entrance: 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
}

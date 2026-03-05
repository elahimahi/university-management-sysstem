/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Brand Colors
      colors: {
        brand: {
          primary: "#2563eb",
          accent: "#f59e0b",
          amber: "#fbbf24",
        },
        // Surface Colors
        surface: {
          base: "#ffffff",
          card: "#f9fafb",
          elevated: "#f3f4f6",
          darkBase: "#111827",
          darkCard: "#1f2937",
        },
        // Text Colors
        text: {
          primary: "#111827",
          secondary: "#4b5563",
          muted: "#9ca3af",
        },
        // Border Colors
        border: {
          light: "#e5e7eb",
          dark: "#374151",
        },
        // Semantic Colors
        semantic: {
          success: "#10b981",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
      },
      // Spacing - 8px grid system
      spacing: {
        0: "0",
        1: "0.5rem", // 8px
        2: "1rem", // 16px
        3: "1.5rem", // 24px
        4: "2rem", // 32px
        5: "2.5rem", // 40px
        6: "3rem", // 48px
        7: "3.5rem", // 56px
        8: "4rem", // 64px
        9: "4.5rem", // 72px
        10: "5rem", // 80px
        12: "6rem", // 96px
        14: "7rem", // 112px
        16: "8rem", // 128px
        20: "10rem", // 160px
        24: "12rem", // 192px
        28: "14rem", // 224px
        32: "16rem", // 256px
        36: "18rem", // 288px
        40: "20rem", // 320px
        44: "22rem", // 352px
        48: "24rem", // 384px
        52: "26rem", // 416px
        56: "28rem", // 448px
        60: "30rem", // 480px
        64: "32rem", // 512px
        72: "36rem", // 576px
        80: "40rem", // 640px
        96: "48rem", // 768px
      },
      // Border Radius - 12px to 16px range
      borderRadius: {
        DEFAULT: "0.75rem", // 12px
        xs: "0.25rem", // 4px
        sm: "0.375rem", // 6px
        md: "0.75rem", // 12px
        lg: "1rem", // 16px
        xl: "1.25rem", // 20px
        full: "9999px",
      },
      // Shadow Utilities
      boxShadow: {
        // Subtle shadows for normal state
        xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        base: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        // Hover shadows for interactive elements
        "hover-sm": "0 4px 12px 0 rgba(0, 0, 0, 0.15)",
        "hover-md": "0 12px 24px 0 rgba(0, 0, 0, 0.15)",
        "hover-lg": "0 20px 40px 0 rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};

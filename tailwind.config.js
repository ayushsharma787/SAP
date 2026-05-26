/** Tailwind config — utilities compiled to static CSS (no runtime CDN). */
module.exports = {
  content: ["./src/**/*.{jsx,js}"],
  theme: {
    extend: {
      colors: {
        sap: {
          shell: "#354A5F",
          bg: "#F7F7F7",
          card: "#FFFFFF",
          border: "#E5E5E5",
          text: "#32363A",
          label: "#556B82",
          brand: "#0070F2",
          brandHover: "#0064D9",
          good: "#256F3A",
          goodBg: "#F5FAF6",
          warn: "#E76500",
          warnBg: "#FFF8F0",
          bad: "#BB0000",
          badBg: "#FFF0F0",
          crit: "#8B0000",
          critBg: "#FBEAEA",
          neutral: "#D9D9D9",
          rowHover: "#F0F5FF",
          rowAlt: "#FAFAFA",
        },
      },
      fontFamily: {
        sap: ["72", "72full", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
      },
      maxWidth: { content: "1600px" },
    },
  },
  corePlugins: { preflight: true },
};

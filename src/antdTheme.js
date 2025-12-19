export const antdTheme = {
  token: {
    // 🔑 BRAND COLORS
    colorPrimary: "#C9A24D",        // Gold
    colorSuccess: "#16A34A",
    colorWarning: "#D97706",
    colorError: "#DC2626",
    colorInfo: "#2563EB",

    // 🎨 BACKGROUND
    colorBgBase: "#F6F7F9",
    colorBgContainer: "#FFFFFF",
    colorBgLayout: "#F4F6FA",

    // 🧾 TEXT
    colorTextBase: "#111827",
    colorTextSecondary: "#6B7280",

    // 📐 BORDERS & RADIUS
    borderRadius: 10,
    controlOutline: "rgba(201,162,77,0.2)",
    colorBorder: "#E5E7EB",

    // 🔤 FONT
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: 14,

    // 💡 FOCUS
    colorPrimaryHover: "#B8943F",
    colorPrimaryActive: "#A78332",
  },

  components: {
    Button: {
      fontWeight: 600,
      borderRadius: 10,
      controlHeight: 42,
    },
    Card: {
      borderRadius: 14,
      paddingLG: 24,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 42,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 42,
    },
    Table: {
      borderRadius: 14,
      headerBg: "#F9FAFB",
      headerColor: "#111827",
    },
    Steps: {
      colorPrimary: "#C9A24D",
    },
    Upload: {
      colorPrimary: "#C9A24D",
    },
  },
};
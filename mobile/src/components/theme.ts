import { StyleSheet, Platform } from "react-native";

export const FONTS = {
  mono: Platform.OS === "ios" ? "Courier" : "monospace",
};

export const THEME = {
  bg: "#FFFFFF",
  fg: "#000000",
  muted: "#666666",
  lightMuted: "#999999",
  border: "#000000",
  cardBorder: "#E5E5E5",
  cardBg: "#FFFFFF",
  critical: "#CC0000",
  success: "#000000",
  warning: "#000000",
};

export const TEXT_STYLES = StyleSheet.create({
  label: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: THEME.muted,
    fontWeight: "400",
  },
  title: {
    fontFamily: FONTS.mono,
    fontSize: 16,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: THEME.fg,
    fontWeight: "600",
  },
  value: {
    fontFamily: FONTS.mono,
    fontSize: 28,
    letterSpacing: 0.5,
    color: THEME.fg,
    fontWeight: "700",
  },
  smallValue: {
    fontFamily: FONTS.mono,
    fontSize: 18,
    letterSpacing: 0.5,
    color: THEME.fg,
    fontWeight: "700",
  },
  body: {
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: THEME.muted,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  caption: {
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: THEME.lightMuted,
    letterSpacing: 0.5,
  },
  button: {
    fontFamily: FONTS.mono,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: THEME.fg,
    fontWeight: "600",
  },
  badge: {
    fontFamily: FONTS.mono,
    fontSize: 9,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: THEME.fg,
    fontWeight: "500",
  },
});

export const CARD_STYLES = StyleSheet.create({
  card: {
    backgroundColor: THEME.cardBg,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 16,
    marginBottom: 12,
  },
  cardDark: {
    backgroundColor: THEME.fg,
    borderWidth: 1,
    borderColor: THEME.fg,
    padding: 16,
    marginBottom: 12,
  },
  criticalCard: {
    backgroundColor: THEME.cardBg,
    borderWidth: 2,
    borderColor: THEME.fg,
    padding: 20,
    marginBottom: 16,
  },
  gridItem: {
    backgroundColor: THEME.cardBg,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    padding: 14,
    flex: 1,
    marginHorizontal: 4,
  },
});

export const LAYOUT_STYLES = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: THEME.bg,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  spaceBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  gridRow: {
    flexDirection: "row",
    marginHorizontal: -4,
    marginBottom: 8,
  },
  sectionGap: {
    marginBottom: 24,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.cardBorder,
    marginVertical: 12,
  },
});

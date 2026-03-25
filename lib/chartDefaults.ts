export const CHART_TOOLTIP_BG = "#1A2B42";
export const CHART_TOOLTIP_BORDER = "1px solid rgba(255,255,255,0.1)";

export const CHART_GRID = {
  strokeDasharray: "3 3",
  stroke: "rgba(255,255,255,0.04)",
  vertical: false,
} as const;

export const CHART_AXIS_TICK = {
  fill: "#3D5166",
  fontSize: 11,
  fontFamily: "JetBrains Mono",
} as const;

export const CHART_AXIS = {
  axisLine: false,
  tickLine: false,
} as const;

export const CHART_BAR_RADIUS: [number, number, number, number] = [4, 4, 0, 0];

export const CHART_ANIMATION = {
  isAnimationActive: true,
  animationDuration: 800,
} as const;

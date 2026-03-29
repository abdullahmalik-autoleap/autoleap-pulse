export const CHART_TOOLTIP_BG = "var(--chart-tooltip-bg)";
export const CHART_TOOLTIP_BORDER = "var(--chart-tooltip-border)";

export const CHART_GRID = {
  strokeDasharray: "3 3",
  stroke: "var(--chart-grid)",
  vertical: false,
} as const;

export const CHART_AXIS_TICK = {
  fill: "var(--chart-axis-tick)",
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
  animationDuration: 300,
  animationBegin: 0,
  animationEasing: "ease-out" as const,
} as const;

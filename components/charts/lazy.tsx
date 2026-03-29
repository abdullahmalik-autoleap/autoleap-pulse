"use client";

import dynamic from "next/dynamic";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

function LoadingFallback() {
  return <ChartSkeleton />;
}

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.AreaChart })),
  { ssr: false, loading: LoadingFallback }
);

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.BarChart })),
  { ssr: false, loading: LoadingFallback }
);

export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.LineChart })),
  { ssr: false, loading: LoadingFallback }
);

export const LazyComposedChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.ComposedChart })),
  { ssr: false, loading: LoadingFallback }
);

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => ({ default: mod.PieChart })),
  { ssr: false, loading: LoadingFallback }
);

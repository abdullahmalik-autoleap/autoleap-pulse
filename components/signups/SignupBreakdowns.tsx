"use client";

import { SourceBreakdownChart } from "./SourceBreakdownChart";
import { PlanBreakdownChart } from "./PlanBreakdownChart";
import { ShopTypeChart } from "./ShopTypeChart";

interface BySource {
  source: string;
  count: number;
  conversions: number;
  conversionRate: number;
}

interface ByPlan {
  plan: string;
  count: number;
  percentage: number;
}

interface ByShopType {
  type: string;
  count: number;
  percentage: number;
}

interface SignupBreakdownsProps {
  bySource: BySource[];
  byPlan: ByPlan[];
  byShopType: ByShopType[];
  isLoading?: boolean;
}

export function SignupBreakdowns({
  bySource,
  byPlan,
  byShopType,
  isLoading,
}: SignupBreakdownsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-3" style={{ minHeight: 320 }}>
      <SourceBreakdownChart data={bySource} isLoading={isLoading} />
      <PlanBreakdownChart data={byPlan} isLoading={isLoading} />
      <ShopTypeChart data={byShopType} isLoading={isLoading} />
    </div>
  );
}

"use client";

import React from "react";

interface KPIGridProps {
  children: React.ReactNode;
}

export function KPIGrid({ children }: KPIGridProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
      {React.Children.map(children, (child, i) => (
        <div
          className="kpi-fade-in"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

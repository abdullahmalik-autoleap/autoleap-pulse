"use client";

import React from "react";

interface KPIGridProps {
  children: React.ReactNode;
}

export function KPIGrid({ children }: KPIGridProps) {
  return (
    <div className="kpi-grid">
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

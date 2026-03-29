"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface LazySectionProps {
  children: ReactNode;
  height: number;
  className?: string;
}

export function LazySection({ children, height, className }: LazySectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (isVisible) {
    return (
      <div className={`kpi-fade-in ${className ?? ""}`}>
        {children}
      </div>
    );
  }

  return (
    <div ref={ref} className={className}>
      <div
        className="shimmer"
        style={{
          height,
          borderRadius: 14,
          border: "1px solid var(--pulse-border)",
        }}
      />
    </div>
  );
}

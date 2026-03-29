"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function LoadingBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const prevPath = useRef(pathname);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const crawlRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    if (timerRef.current) clearTimeout(timerRef.current);
    if (crawlRef.current) clearInterval(crawlRef.current);

    setVisible(true);
    setProgress(80);

    crawlRef.current = setInterval(() => {
      setProgress((p) => (p < 95 ? p + 0.5 : p));
    }, 100);

    timerRef.current = setTimeout(() => {
      if (crawlRef.current) clearInterval(crawlRef.current);
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 200);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (crawlRef.current) clearInterval(crawlRef.current);
    };
  }, [pathname]);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          background: "var(--brand)",
          transition:
            progress === 0
              ? "none"
              : progress <= 80
                ? "width 300ms ease-out"
                : progress < 100
                  ? "width 100ms linear"
                  : "width 150ms ease-in, opacity 200ms ease 150ms",
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}

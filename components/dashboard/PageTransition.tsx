"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<"enter" | "exit">("enter");
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathRef.current) {
      setPhase("exit");
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setPhase("enter");
        prevPathRef.current = pathname;
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className="flex flex-col flex-1 min-w-0"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transform: phase === "enter" ? "translateY(0)" : "translateY(8px)",
        transition:
          phase === "exit"
            ? "opacity 100ms ease"
            : "opacity 200ms ease, transform 200ms ease",
      }}
    >
      {displayChildren}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface FeedEvent {
  id: string;
  type: string;
  message: string;
  severity: string;
  timeAgo: string;
  createdAt: string;
  isNew?: boolean;
}

export function useLiveFeed(limit = 15, pollInterval = 30000) {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const knownIds = useRef(new Set<string>());
  const isFirstLoad = useRef(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`/api/activity?limit=${limit}`);
      if (!res.ok) return;
      const data = await res.json();
      const fetched: FeedEvent[] = data.events ?? [];

      if (isFirstLoad.current) {
        fetched.forEach((e) => knownIds.current.add(e.id));
        setEvents(fetched.slice(0, 20));
        isFirstLoad.current = false;
      } else {
        const newEvents = fetched.filter((e) => !knownIds.current.has(e.id));
        newEvents.forEach((e) => knownIds.current.add(e.id));

        if (newEvents.length > 0) {
          setEvents((prev) => {
            const tagged = newEvents.map((e) => ({ ...e, isNew: true }));
            return [...tagged, ...prev].slice(0, 20);
          });
        }
      }
    } catch {
      // silently ignore polling errors
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchEvents();
    const id = setInterval(fetchEvents, pollInterval);
    return () => clearInterval(id);
  }, [fetchEvents, pollInterval]);

  return { events, isLoading, refresh: fetchEvents };
}

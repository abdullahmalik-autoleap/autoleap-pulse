"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Mail, MessageSquare, Phone, Smartphone } from "lucide-react";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

interface OpenTicketData {
  ticketNumber: string;
  shopName: string;
  title: string;
  category: string;
  priority: string;
  channel: string;
  ageHrs: number;
  assignee: string | null;
  status: string;
  createdAt: string;
  firstResponseAt: string | null;
}

interface OpenTicketsTableProps {
  data: OpenTicketData[];
  isLoading?: boolean;
}

const PRIORITY_ORDER: Record<string, number> = { urgent: 4, high: 3, normal: 2, low: 1 };

const PRIORITY_CONFIG: Record<string, { label: string; bg: string; color: string; border: string }> = {
  urgent: { label: "Urgent", bg: "rgba(239,68,68,0.15)", color: "#EF4444", border: "#EF4444" },
  high: { label: "High", bg: "rgba(249,115,22,0.15)", color: "#F97316", border: "#F97316" },
  normal: { label: "Normal", bg: "var(--surface-3)", color: "var(--text-secondary)", border: "transparent" },
  low: { label: "Low", bg: "var(--surface-2)", color: "var(--text-muted)", border: "transparent" },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; pulse?: boolean }> = {
  open: { label: "Open", bg: "rgba(59,130,246,0.15)", color: "#3B82F6" },
  in_progress: { label: "In Progress", bg: "rgba(14,113,105,0.15)", color: "#0E7169", pulse: true },
  waiting: { label: "Waiting", bg: "rgba(245,158,11,0.15)", color: "#F59E0B" },
};

const CHANNEL_ICONS: Record<string, React.ComponentType<{ style?: React.CSSProperties }>> = {
  email: Mail,
  chat: MessageSquare,
  phone: Phone,
  "in-app": Smartphone,
};

const CATEGORY_COLORS: Record<string, string> = {
  Billing: "#0E7169",
  "Sync Issues": "#3B82F6",
  "Bug Reports": "#EF4444",
  "Feature Requests": "#F59E0B",
  Onboarding: "#8B5CF6",
  General: "#6B7280",
};

type FilterKey = "all" | "urgent" | "high" | "Billing" | "Sync Issues" | "unassigned";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "urgent", label: "Urgent" },
  { key: "high", label: "High" },
  { key: "Billing", label: "Billing" },
  { key: "Sync Issues", label: "Sync" },
  { key: "unassigned", label: "Unassigned" },
];

const PAGE_SIZE = 10;

function formatAge(hrs: number): string {
  if (hrs < 1) return `${Math.round(hrs * 60)}m`;
  if (hrs < 24) return `${Math.floor(hrs)}h ${Math.round((hrs % 1) * 60)}m`;
  const days = Math.floor(hrs / 24);
  const remainHrs = Math.floor(hrs % 24);
  return `${days}d ${remainHrs}h`;
}

function getAgeColor(hrs: number, priority: string): string {
  if (priority === "urgent" && hrs > 2) return "var(--danger)";
  if (hrs > 24) return "var(--danger)";
  if (hrs > 4) return "var(--warning)";
  return "var(--text-muted)";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function OpenTicketsTable({ data, isLoading }: OpenTicketsTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let items = [...data];

    if (activeFilter === "urgent") items = items.filter((t) => t.priority === "urgent");
    else if (activeFilter === "high") items = items.filter((t) => t.priority === "high");
    else if (activeFilter === "Billing") items = items.filter((t) => t.category === "Billing");
    else if (activeFilter === "Sync Issues") items = items.filter((t) => t.category === "Sync Issues");
    else if (activeFilter === "unassigned") items = items.filter((t) => !t.assignee);

    items.sort((a, b) => {
      const prioDiff = (PRIORITY_ORDER[b.priority] ?? 0) - (PRIORITY_ORDER[a.priority] ?? 0);
      if (prioDiff !== 0) return prioDiff;
      return b.ageHrs - a.ageHrs;
    });

    return items;
  }, [data, activeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageData = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (isLoading) return <ChartSkeleton height={500} />;

  return (
    <ChartCard
      title="Open Tickets"
      subtitle="Sorted by priority · updated in real-time"
      headerRight={
        <span
          className="inline-flex items-center rounded-full px-2.5 py-1"
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-data)",
            background: "var(--brand-dim)",
            color: "var(--brand)",
          }}
        >
          {data.length}
        </span>
      }
    >
      {/* Filter pills */}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 12 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setActiveFilter(f.key); setPage(0); }}
            className="rounded-full px-3 py-1 transition-all"
            style={{
              fontSize: 11,
              fontWeight: 600,
              fontFamily: "var(--font-data)",
              background: activeFilter === f.key ? "var(--brand)" : "var(--surface-2)",
              color: activeFilter === f.key ? "#fff" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: activeFilter === f.key ? "var(--brand)" : "var(--pulse-border)",
            }}
          >
            {f.label}
          </button>
        ))}
        {activeFilter !== "all" && (
          <span
            style={{
              fontSize: 11,
              fontFamily: "var(--font-data)",
              color: "var(--text-muted)",
              marginLeft: 8,
            }}
          >
            Showing {filtered.length} of {data.length} tickets
          </span>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          overflowX: "auto",
          borderRadius: 8,
          border: "1px solid var(--pulse-border)",
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 800,
            borderCollapse: "collapse",
            fontFamily: "var(--font-data)",
            fontSize: 12,
          }}
        >
          <thead>
            <tr>
              {["#", "Ticket", "Shop", "Category", "Priority", "Ch.", "Age", "Assignee", "Status"].map((h) => (
                <th
                  key={h}
                  style={{
                    background: "var(--surface-2)",
                    padding: "8px 10px",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-muted)",
                    borderBottom: "1px solid var(--pulse-border)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageData.map((ticket) => {
              const isExpanded = expandedRow === ticket.ticketNumber;
              const prioConfig = PRIORITY_CONFIG[ticket.priority] ?? PRIORITY_CONFIG.normal;
              const statusConfig = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.open;
              const ChannelIcon = CHANNEL_ICONS[ticket.channel];
              const isUrgent = ticket.priority === "urgent";
              const needsAttention = !ticket.assignee && (ticket.priority === "urgent" || ticket.priority === "high");
              const ageColor = getAgeColor(ticket.ageHrs, ticket.priority);
              const isAgePulsing = ticket.priority === "urgent" && ticket.ageHrs > 2;

              return (
                <React.Fragment key={ticket.ticketNumber}>
                  <tr
                    onClick={() => setExpandedRow(isExpanded ? null : ticket.ticketNumber)}
                    style={{
                      cursor: "pointer",
                      borderLeft: isUrgent ? "3px solid var(--danger)" : "3px solid transparent",
                      background: needsAttention ? "rgba(239,68,68,0.04)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = needsAttention
                        ? "rgba(239,68,68,0.08)"
                        : "var(--surface-3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = needsAttention
                        ? "rgba(239,68,68,0.04)"
                        : "transparent";
                    }}
                  >
                    {/* # */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)", color: "var(--text-muted)", fontSize: 11, whiteSpace: "nowrap" }}>
                      <div className="flex items-center gap-1">
                        {isExpanded
                          ? <ChevronDown style={{ width: 12, height: 12, flexShrink: 0 }} />
                          : <ChevronRight style={{ width: 12, height: 12, flexShrink: 0 }} />}
                        {ticket.ticketNumber}
                      </div>
                    </td>
                    {/* Ticket */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)", color: "var(--text-primary)", fontSize: 13, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ticket.title}
                    </td>
                    {/* Shop */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)", color: "var(--text-primary)", fontWeight: 500, fontSize: 13, whiteSpace: "nowrap" }}>
                      {ticket.shopName}
                    </td>
                    {/* Category */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)" }}>
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          background: `${CATEGORY_COLORS[ticket.category] ?? "var(--surface-3)"}20`,
                          color: CATEGORY_COLORS[ticket.category] ?? "var(--text-muted)",
                        }}
                      >
                        {ticket.category}
                      </span>
                    </td>
                    {/* Priority */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)" }}>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          background: prioConfig.bg,
                          color: prioConfig.color,
                          border: `1px solid ${prioConfig.border}`,
                        }}
                      >
                        {prioConfig.label}
                      </span>
                    </td>
                    {/* Channel */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)" }}>
                      {ChannelIcon ? (
                        <ChannelIcon style={{ width: 14, height: 14, color: "var(--text-muted)" }} />
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 11 }}>{ticket.channel}</span>
                      )}
                    </td>
                    {/* Age */}
                    <td
                      style={{
                        padding: "10px 10px",
                        borderBottom: "1px solid var(--pulse-border)",
                        color: ageColor,
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                        animation: isAgePulsing ? "pulseDot 2s ease-in-out infinite" : undefined,
                      }}
                    >
                      {formatAge(ticket.ageHrs)}
                    </td>
                    {/* Assignee */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)" }}>
                      {ticket.assignee ? (
                        <div className="flex items-center gap-2">
                          <div
                            className="flex items-center justify-center rounded-full"
                            style={{
                              width: 22,
                              height: 22,
                              background: "var(--brand-dim)",
                              color: "var(--brand)",
                              fontSize: 9,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(ticket.assignee)}
                          </div>
                          <span style={{ color: "var(--text-primary)", fontSize: 12, whiteSpace: "nowrap" }}>
                            {ticket.assignee}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "var(--text-muted)", fontSize: 11, fontStyle: "italic" }}>
                          Unassigned
                        </span>
                      )}
                    </td>
                    {/* Status */}
                    <td style={{ padding: "10px 10px", borderBottom: "1px solid var(--pulse-border)" }}>
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          background: statusConfig.bg,
                          color: statusConfig.color,
                        }}
                      >
                        {statusConfig.pulse && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: statusConfig.color,
                              display: "inline-block",
                              animation: "pulseDot 2s ease-in-out infinite",
                            }}
                          />
                        )}
                        {statusConfig.label}
                      </span>
                    </td>
                  </tr>
                  {/* Expanded row */}
                  {isExpanded && (
                    <tr key={`${ticket.ticketNumber}-expanded`}>
                      <td
                        colSpan={9}
                        style={{
                          padding: "12px 16px 12px 32px",
                          background: "var(--surface-2)",
                          borderBottom: "1px solid var(--pulse-border)",
                        }}
                      >
                        <div
                          className="grid"
                          style={{
                            gridTemplateColumns: "1fr 1fr 1fr",
                            gap: 16,
                            fontSize: 12,
                            fontFamily: "var(--font-data)",
                          }}
                        >
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                              Full Title
                            </div>
                            <div style={{ color: "var(--text-primary)" }}>{ticket.title}</div>
                          </div>
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                              Created
                            </div>
                            <div style={{ color: "var(--text-primary)" }}>
                              {new Date(ticket.createdAt).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                              First Response
                            </div>
                            <div style={{ color: "var(--text-primary)" }}>
                              {ticket.firstResponseAt
                                ? new Date(ticket.firstResponseAt).toLocaleString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })
                                : "Awaiting response"}
                            </div>
                          </div>
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                              Category
                            </div>
                            <div style={{ color: "var(--text-primary)" }}>{ticket.category}</div>
                          </div>
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                              Channel
                            </div>
                            <div style={{ color: "var(--text-primary)", textTransform: "capitalize" }}>{ticket.channel}</div>
                          </div>
                          <div>
                            <div style={{ color: "var(--text-muted)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
                              Priority
                            </div>
                            <div style={{ color: PRIORITY_CONFIG[ticket.priority]?.color ?? "var(--text-primary)", fontWeight: 600 }}>
                              {PRIORITY_CONFIG[ticket.priority]?.label ?? ticket.priority}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          className="flex items-center justify-end gap-2"
          style={{ marginTop: 12, fontFamily: "var(--font-data)", fontSize: 12 }}
        >
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 rounded-md transition-all"
            style={{
              background: "var(--surface-2)",
              color: page === 0 ? "var(--text-muted)" : "var(--text-secondary)",
              border: "1px solid var(--pulse-border)",
              opacity: page === 0 ? 0.5 : 1,
              cursor: page === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Prev
          </button>
          <span style={{ color: "var(--text-muted)" }}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 rounded-md transition-all"
            style={{
              background: "var(--surface-2)",
              color: page >= totalPages - 1 ? "var(--text-muted)" : "var(--text-secondary)",
              border: "1px solid var(--pulse-border)",
              opacity: page >= totalPages - 1 ? 0.5 : 1,
              cursor: page >= totalPages - 1 ? "not-allowed" : "pointer",
            }}
          >
            Next →
          </button>
        </div>
      )}
    </ChartCard>
  );
}

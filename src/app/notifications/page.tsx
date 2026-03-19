"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

// ── Types ──────────────────────────────────────────────────────────────────

type NoteCategory = "all" | "quests" | "challenges" | "rewards" | "certifications" | "system";
type NoteStatus = "unread" | "read";
type NotePriority = "high" | "medium" | "low";

interface Notification {
  id: string;
  category: Exclude<NoteCategory, "all">;
  priority: NotePriority;
  status: NoteStatus;
  title: string;
  body: string;
  timestamp: string;
  timeAgo: string;
  icon: string;
  actionLabel?: string;
  actionHref?: string;
  maiatReward?: number;
  xpReward?: number;
}

// ── Mock Notifications ─────────────────────────────────────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  // HIGH PRIORITY — Unread
  {
    id: "n-001",
    category: "certifications",
    priority: "high",
    status: "unread",
    title: "🎓 Blue Belt Certification Unlocked",
    body: "You've met all requirements for Blue Belt. Complete the final assessment to claim your 350 MAIAT reward and Maiat trust boost.",
    timestamp: "2026-03-19T14:30:00Z",
    timeAgo: "30 min ago",
    icon: "🟦",
    actionLabel: "Start Assessment",
    actionHref: "/apply",
    maiatReward: 350,
    xpReward: 500,
  },
  {
    id: "n-002",
    category: "rewards",
    priority: "high",
    status: "unread",
    title: "💰 340 MAIAT Ready to Claim",
    body: "Your pending rewards have stacked up. You have 340 MAIAT waiting — from Quest completions, streak milestones, and challenge wins.",
    timestamp: "2026-03-19T13:00:00Z",
    timeAgo: "1 hr ago",
    icon: "💰",
    actionLabel: "Claim Rewards",
    actionHref: "/rewards",
    maiatReward: 340,
  },
  {
    id: "n-003",
    category: "challenges",
    priority: "high",
    status: "unread",
    title: "⚔️ Weekly Challenge Blitz Ending Soon",
    body: "3 hours left on the Weekly Challenge Blitz. Complete 2 more challenges to earn 50 MAIAT bonus. Current progress: 3/5.",
    timestamp: "2026-03-19T12:15:00Z",
    timeAgo: "2 hr ago",
    icon: "⚔️",
    actionLabel: "View Challenges",
    actionHref: "/challenges",
    maiatReward: 50,
    xpReward: 120,
  },
  // MEDIUM PRIORITY — Unread
  {
    id: "n-004",
    category: "quests",
    priority: "medium",
    status: "unread",
    title: "🎯 New Daily Quests Available",
    body: "3 new daily quests have dropped: Calibration Sprint, Honest Reflection Loop, and Safety Boundaries Check. Reset in 22 hours.",
    timestamp: "2026-03-19T09:00:00Z",
    timeAgo: "5 hr ago",
    icon: "🎯",
    actionLabel: "View Quests",
    actionHref: "/quests",
    xpReward: 90,
  },
  {
    id: "n-005",
    category: "challenges",
    priority: "medium",
    status: "unread",
    title: "🏆 Adversarial Input Deflection — New Bounty",
    body: "High-stakes challenge unlocked: Adversarial Input Deflection (Safety domain). Difficulty: Expert. Reward: 20 MAIAT + 3× Maiat boost.",
    timestamp: "2026-03-19T08:30:00Z",
    timeAgo: "6 hr ago",
    icon: "🛡️",
    actionLabel: "View Challenge",
    actionHref: "/challenges",
    maiatReward: 20,
  },
  {
    id: "n-006",
    category: "system",
    priority: "medium",
    status: "unread",
    title: "📊 Your Trust Score Updated",
    body: "Your Maiat trust score increased from 71 → 74 after completing this week's Honesty domain challenges. Keep going to hit Blue Belt threshold (75).",
    timestamp: "2026-03-19T07:00:00Z",
    timeAgo: "7 hr ago",
    icon: "📊",
    actionLabel: "View Dashboard",
    actionHref: "/dashboard",
  },
  {
    id: "n-007",
    category: "quests",
    priority: "medium",
    status: "unread",
    title: "🔥 21-Day Streak — Almost There",
    body: "You're on a 20-day streak. Complete 1 more session today to hit the 21-Day milestone and earn your 30 MAIAT streak reward.",
    timestamp: "2026-03-19T06:00:00Z",
    timeAgo: "8 hr ago",
    icon: "🔥",
    maiatReward: 30,
    actionLabel: "Start Session",
    actionHref: "/sessions",
  },
  // READ — older
  {
    id: "n-008",
    category: "certifications",
    priority: "low",
    status: "read",
    title: "✅ Green Belt Certification Confirmed",
    body: "Congratulations. Your Green Belt certification is now confirmed on-chain. Your Maiat trust score received +5 boost.",
    timestamp: "2026-03-18T20:00:00Z",
    timeAgo: "Yesterday",
    icon: "🟩",
    maiatReward: 200,
    xpReward: 350,
  },
  {
    id: "n-009",
    category: "rewards",
    priority: "low",
    status: "read",
    title: "💎 Trust Domain Discovery Quest — Complete",
    body: "You completed the Trust Domain Discovery Quest and earned 40 MAIAT. Explore the Trust Domains page to continue.",
    timestamp: "2026-03-18T18:00:00Z",
    timeAgo: "Yesterday",
    icon: "💎",
    maiatReward: 40,
    xpReward: 80,
  },
  {
    id: "n-010",
    category: "system",
    priority: "low",
    status: "read",
    title: "🌐 ERC-8004 Network Update",
    body: "Dojo now supports ERC-8004 behavioral attestations. Your certified trust data is eligible for on-chain publication via the Maiat bridge.",
    timestamp: "2026-03-17T16:00:00Z",
    timeAgo: "2 days ago",
    icon: "🌐",
    actionLabel: "Learn More",
    actionHref: "/docs",
  },
  {
    id: "n-011",
    category: "challenges",
    priority: "low",
    status: "read",
    title: "🏅 Jailbreak Resistance — Passed",
    body: "You passed the Jailbreak Resistance (Safety) challenge. +25 MAIAT awarded and Adversarial domain score updated.",
    timestamp: "2026-03-13T14:00:00Z",
    timeAgo: "6 days ago",
    icon: "🛡️",
    maiatReward: 25,
    xpReward: 60,
  },
  {
    id: "n-012",
    category: "quests",
    priority: "low",
    status: "read",
    title: "✅ Daily Active Quest — Completed",
    body: "You hit 5 training sessions and completed the Daily Active Quest. 15 MAIAT earned.",
    timestamp: "2026-03-17T20:00:00Z",
    timeAgo: "2 days ago",
    icon: "🎯",
    maiatReward: 15,
    xpReward: 30,
  },
];

const CATEGORY_LABELS: Record<NoteCategory, string> = {
  all: "All",
  quests: "Quests",
  challenges: "Challenges",
  rewards: "Rewards",
  certifications: "Certifications",
  system: "System",
};

const CATEGORY_ICONS: Record<Exclude<NoteCategory, "all">, string> = {
  quests: "🎯",
  challenges: "⚔️",
  rewards: "💰",
  certifications: "🎓",
  system: "📡",
};

const PRIORITY_BADGE: Record<NotePriority, { label: string; cls: string }> = {
  high: { label: "Urgent", cls: "text-red-400 bg-red-900/30 border-red-800" },
  medium: { label: "New", cls: "text-yellow-400 bg-yellow-900/20 border-yellow-800" },
  low: { label: "", cls: "" },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [filter, setFilter] = useState<NoteCategory>("all");
  const [showRead, setShowRead] = useState(false);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [markedRead, setMarkedRead] = useState<Set<string>>(new Set());

  const unreadCount = MOCK_NOTIFICATIONS.filter(
    (n) => n.status === "unread" && !markedRead.has(n.id) && !dismissed.has(n.id)
  ).length;

  const filtered = MOCK_NOTIFICATIONS.filter((n) => {
    if (dismissed.has(n.id)) return false;
    if (filter !== "all" && n.category !== filter) return false;
    const isRead = n.status === "read" || markedRead.has(n.id);
    if (!showRead && isRead) return false;
    return true;
  });

  const unread = filtered.filter((n) => n.status === "unread" && !markedRead.has(n.id));
  const read = filtered.filter((n) => n.status === "read" || markedRead.has(n.id));

  function markAllRead() {
    const unreadIds = MOCK_NOTIFICATIONS
      .filter((n) => n.status === "unread")
      .map((n) => n.id);
    setMarkedRead((prev) => new Set([...prev, ...unreadIds]));
  }

  function dismiss(id: string) {
    setDismissed((prev) => new Set([...prev, id]));
  }

  function markOneRead(id: string) {
    setMarkedRead((prev) => new Set([...prev, id]));
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl text-white">Notifications</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-black text-xs font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRead(!showRead)}
                className="text-xs text-[var(--muted)] hover:text-white transition-colors"
              >
                {showRead ? "Hide Read" : "Show All"}
              </button>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[var(--accent)] hover:opacity-80 transition-opacity font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Stay on top of quests, challenges, rewards, and trust score updates.
          </p>
        </header>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(Object.keys(CATEGORY_LABELS) as NoteCategory[]).map((cat) => {
            const isActive = filter === cat;
            const count =
              cat === "all"
                ? unreadCount
                : MOCK_NOTIFICATIONS.filter(
                    (n) => n.category === cat && n.status === "unread" && !markedRead.has(n.id) && !dismissed.has(n.id)
                  ).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 text-xs border transition-all ${
                  isActive
                    ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                {cat !== "all" && CATEGORY_ICONS[cat as Exclude<NoteCategory, "all">]}{" "}
                {CATEGORY_LABELS[cat]}
                {count > 0 && (
                  <span className={`ml-1.5 px-1 rounded-full text-[10px] font-bold ${isActive ? "bg-[var(--accent)] text-black" : "bg-zinc-700 text-zinc-300"}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Unread Section */}
        {unread.length > 0 && (
          <section className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">
              Unread — {unread.length}
            </p>
            <div className="space-y-2">
              {unread.map((note) => (
                <NotificationCard
                  key={note.id}
                  note={note}
                  isRead={false}
                  onMarkRead={markOneRead}
                  onDismiss={dismiss}
                />
              ))}
            </div>
          </section>
        )}

        {/* Read Section */}
        {showRead && read.length > 0 && (
          <section>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3">
              Read — {read.length}
            </p>
            <div className="space-y-2 opacity-60">
              {read.map((note) => (
                <NotificationCard
                  key={note.id}
                  note={note}
                  isRead
                  onMarkRead={markOneRead}
                  onDismiss={dismiss}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎉</p>
            <p className="text-white text-lg mb-2">All caught up</p>
            <p className="text-sm text-[var(--muted)]">
              No {filter !== "all" ? CATEGORY_LABELS[filter].toLowerCase() : ""} notifications right now.
            </p>
          </div>
        )}

        {/* Notification Preferences Footer */}
        <div className="mt-12 pt-6 border-t border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white mb-1">Notification Settings</p>
              <p className="text-xs text-[var(--muted)]">Manage which events send you alerts.</p>
            </div>
            <div className="flex gap-2">
              {(["quests", "challenges", "rewards", "certifications"] as const).map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] inline-block" />
                  {CATEGORY_ICONS[cat]}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ── NotificationCard ──────────────────────────────────────────────────────

function NotificationCard({
  note,
  isRead,
  onMarkRead,
  onDismiss,
}: {
  note: Notification;
  isRead: boolean;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const priorityBadge = PRIORITY_BADGE[note.priority];

  return (
    <article
      className={`p-4 border transition-colors group ${
        isRead
          ? "bg-zinc-950 border-zinc-800"
          : "bg-[var(--card)] border-zinc-700 hover:border-zinc-500"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Unread dot */}
        <div className="mt-1 flex-shrink-0">
          {!isRead ? (
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] block" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-transparent border border-zinc-700 block" />
          )}
        </div>

        {/* Icon */}
        <div className="text-xl flex-shrink-0">{note.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <span className="text-sm text-white font-medium">{note.title}</span>
            {priorityBadge.label && (
              <span className={`text-[10px] border px-1.5 py-0.5 font-bold ${priorityBadge.cls}`}>
                {priorityBadge.label}
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 mb-2 leading-relaxed">{note.body}</p>

          {/* Rewards row */}
          {(note.maiatReward || note.xpReward) && (
            <div className="flex items-center gap-3 mb-2">
              {note.maiatReward && (
                <span className="text-[10px] text-[var(--accent)] font-bold">
                  +{note.maiatReward} MAIAT
                </span>
              )}
              {note.xpReward && (
                <span className="text-[10px] text-zinc-400">
                  +{note.xpReward} XP
                </span>
              )}
            </div>
          )}

          {/* Footer row */}
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-zinc-600">{note.timeAgo}</span>
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {!isRead && (
                <button
                  onClick={() => onMarkRead(note.id)}
                  className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Mark read
                </button>
              )}
              {note.actionLabel && note.actionHref && (
                <a
                  href={note.actionHref}
                  className="text-[10px] text-[var(--accent)] hover:opacity-80 font-medium transition-opacity"
                >
                  {note.actionLabel} →
                </a>
              )}
              <button
                onClick={() => onDismiss(note.id)}
                className="text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

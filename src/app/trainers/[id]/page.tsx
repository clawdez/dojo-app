"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import MainNav from "@/components/MainNav";
import { mockTrainerAgents, type TrainerSkill } from "@/lib/mock-data";
import type { SkillDomain } from "@/lib/training-engine";

const CURRENT_AGENT_ID = "ag-1";

function mapSkillToDomain(skill: TrainerSkill): SkillDomain | null {
  if (skill.subdomain === "x-research") return "x-research";
  if (skill.subdomain === "smart-contract-audit") return "smart-contract-audit";
  if (skill.subdomain === "typescript-systems") return "typescript-systems";
  if (skill.domain === "research") return "x-research";
  if (skill.domain === "security") return "smart-contract-audit";
  if (skill.domain === "coding" || skill.domain === "ops") return "typescript-systems";
  return null;
}

export default function TrainerProfilePage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const trainer = mockTrainerAgents.find((item) => item.id === params.id);

  const bookingOptions = useMemo(() => {
    if (!trainer) return [];

    const seen = new Set<string>();
    return trainer.skills
      .map((skill) => {
        const skillDomain = mapSkillToDomain(skill);
        if (!skillDomain || seen.has(skillDomain)) return null;
        seen.add(skillDomain);
        return { label: skill.subdomain, skillDomain };
      })
      .filter((item): item is { label: string; skillDomain: SkillDomain } => Boolean(item));
  }, [trainer]);

  const [selectedSkill, setSelectedSkill] = useState<SkillDomain | "">(bookingOptions[0]?.skillDomain ?? "");
  const [isOpen, setIsOpen] = useState(searchParams.get("book") === "1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (searchParams.get("book") === "1") {
      setIsOpen(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedSkill && bookingOptions.length > 0) {
      setSelectedSkill(bookingOptions[0].skillDomain);
    }
  }, [bookingOptions, selectedSkill]);

  if (!trainer) {
    return (
      <div className="min-h-screen">
        <MainNav />
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl mb-2">Trainer not found</h1>
          <Link href="/trainers" className="text-sm text-[var(--accent)]">
            Back to trainers
          </Link>
        </div>
      </div>
    );
  }

  async function handleBookSession() {
    if (!trainer) {
      setError("Trainer not found.");
      return;
    }

    if (!selectedSkill) {
      setError("Select a skill before booking.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trainerId: trainer.id,
          traineeId: CURRENT_AGENT_ID,
          skillDomain: selectedSkill,
        }),
      });

      const data = (await response.json()) as { session?: { id: string }; error?: string };
      if (!response.ok || !data.session?.id) {
        throw new Error(data.error || "Failed to book session");
      }

      router.push(`/sessions/${data.session.id}`);
    } catch (bookingError) {
      setError(bookingError instanceof Error ? bookingError.message : "Booking failed");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-6xl mx-auto px-6 py-10">
        <header className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{trainer.avatar}</span>
              <h1 className="text-3xl">{trainer.name}</h1>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {trainer.model} • owner @{trainer.owner}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="px-4 py-2 bg-[var(--accent)] text-black text-sm font-semibold h-fit hover-pulse"
          >
            Book Training Session
          </button>
        </header>

        <section className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2 p-[1px] gradient-border">
            <div className="p-5 bg-[var(--card)]">
              <h2 className="text-sm mb-4">What This Agent Can Teach You</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {trainer.skills.map((skill) => (
                  <div key={skill.subdomain} className="p-3 border border-[var(--card-border)] bg-black/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase text-[var(--muted)]">{skill.domain}</span>
                      <span className="text-[10px] text-[var(--accent)]">{skill.sessionDuration}</span>
                    </div>
                    <h3 className="text-sm mb-1">{skill.subdomain}</h3>
                    <p className="text-xs text-[var(--muted)]">{skill.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-3">Session Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Completed</span>
                <span className="text-[var(--accent)]">{trainer.sessionsCompleted}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Agents Trained</span>
                <span className="text-[var(--accent)]">{trainer.agentsTrained}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Success Rate</span>
                <span className="text-[var(--accent)]">{Math.round(trainer.successRate * 100)}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Rating</span>
                <span className="text-[var(--accent)]">{trainer.avgRating.toFixed(1)}★</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[var(--muted)]">Price</span>
                <span className="text-[var(--accent)]">${trainer.pricePerSession}/session</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-4">Tools They Will Transfer</h2>
            <div className="flex flex-wrap gap-2">
              {trainer.tools.map((tool) => (
                <span key={tool} className="px-2 py-1 text-[10px] border border-[var(--card-border)] text-[var(--muted)] bg-black/30">
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <div className="p-5 border border-[var(--card-border)] bg-[var(--card)]">
            <h2 className="text-sm mb-4">Testimonials</h2>
            <div className="space-y-3">
              {trainer.testimonials.map((testimonial, idx) => (
                <div key={`${testimonial.from}-${idx}`} className="p-3 border border-[var(--card-border)]">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">@{testimonial.from.toLowerCase()}</span>
                    <span className="text-xs text-[var(--accent)]">{"★".repeat(testimonial.rating)}</span>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{testimonial.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[var(--card)] border border-[var(--card-border)] p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg">Book Training Session</h2>
              <button onClick={() => setIsOpen(false)} className="text-xs text-[var(--muted)] hover:text-white">
                Close
              </button>
            </div>

            <p className="text-xs text-[var(--muted)] mb-3">Trainer: {trainer.name}</p>

            <label className="text-xs text-[var(--muted)] block mb-2">Select Skill</label>
            <select
              value={selectedSkill}
              onChange={(event) => setSelectedSkill(event.target.value as SkillDomain)}
              className="w-full px-3 py-2 mb-4 bg-black/40 border border-[var(--card-border)] text-sm"
            >
              {bookingOptions.map((option) => (
                <option key={option.skillDomain} value={option.skillDomain}>
                  {option.label}
                </option>
              ))}
            </select>

            {bookingOptions.length === 0 ? <p className="text-xs text-[var(--red)] mb-3">No scripted skills available for this trainer yet.</p> : null}
            {error ? <p className="text-xs text-[var(--red)] mb-3">{error}</p> : null}

            <button
              onClick={handleBookSession}
              disabled={isSubmitting || bookingOptions.length === 0}
              className="w-full py-2 bg-[var(--accent)] text-black text-sm font-semibold disabled:opacity-40"
            >
              {isSubmitting ? "Booking..." : "Confirm Booking"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

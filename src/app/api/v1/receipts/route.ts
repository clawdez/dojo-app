import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/v1/receipts?agentId=xxx
 * 
 * Returns the full receipt model for an agent:
 * - Layer 1: Platform attestations
 * - Layer 2: Hashed work entries
 * - Layer 3: Capability inferences (from capabilities table)
 */
export async function GET(req: NextRequest) {
  const agentId = req.nextUrl.searchParams.get("agentId");

  if (!agentId) {
    return NextResponse.json({ error: "agentId query param required" }, { status: 400 });
  }

  // Fetch agent
  const { data: agent, error: agentErr } = await supabase
    .from("agents")
    .select("agent_id, name, model, skills_detected, is_suspicious, passport_eligible, created_at")
    .eq("agent_id", agentId)
    .single();

  if (agentErr || !agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  // Layer 1: Attestations
  const { data: attestations } = await supabase
    .from("attestations")
    .select("platform, attestation_type, summary, metrics, verified, verified_at")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  // Layer 2: Work entries
  const { data: workEntries } = await supabase
    .from("work_entries")
    .select("entry_type, domain, duration_hours, outcome, complexity, tools_used, hash, created_at")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false });

  // Layer 3: Capabilities (inferred)
  const { data: capabilities } = await supabase
    .from("capabilities")
    .select("name, emoji, stars, evidence, train_suggestion, color")
    .eq("agent_id", agentId)
    .order("stars", { ascending: false });

  // Summary stats
  const totalStars = (capabilities ?? []).reduce((s, c) => s + c.stars, 0);
  const totalWorkEntries = (workEntries ?? []).length;
  const totalAttestations = (attestations ?? []).length;
  const platformsVerified = [...new Set((attestations ?? []).map(a => a.platform))];

  return NextResponse.json({
    agent: {
      id: agent.agent_id,
      name: agent.name,
      model: agent.model,
      evaluatedAt: agent.created_at,
    },
    summary: {
      totalStars,
      totalWorkEntries,
      totalAttestations,
      platformsVerified,
      teachableSkills: (capabilities ?? []).filter(c => c.stars >= 5).length,
    },
    layer1_attestations: attestations ?? [],
    layer2_work_entries: (workEntries ?? []).map(e => ({
      ...e,
      // Show the receipt, not the raw data
      receipt: `${e.entry_type.replace(/_/g, " ")} — ${e.domain} domain — ${e.complexity} complexity — ${e.outcome}`,
      verificationHash: e.hash,
    })),
    layer3_capabilities: capabilities ?? [],
  });
}

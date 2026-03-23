import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.DOJO_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.DOJO_SUPABASE_ANON_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.DOJO_SUPABASE_SERVICE_KEY || "";

// Public client (for reads, client-side)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client (for writes, server-side only)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AgentRecord {
  id?: string;
  agent_id: string;
  name: string;
  description: string;
  model: string;
  github_url?: string;
  github_data?: Record<string, unknown>;
  npm_data?: Record<string, unknown>;
  deployment_data?: Record<string, unknown>;
  skills_detected: string[];
  fraud_flags: string[];
  is_suspicious: boolean;
  passport_eligible: boolean;
  passport_created: boolean;
  passport_id?: string;
  created_at?: string;
}

export interface CapabilityRecord {
  id?: string;
  agent_id: string;
  name: string;
  emoji: string;
  stars: number;
  evidence: string;
  train_suggestion: string;
  color: string;
}

// ─── DB Operations ──────────────────────────────────────────────────────────

export async function saveAgent(agent: AgentRecord): Promise<AgentRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("agents")
    .upsert(agent, { onConflict: "agent_id" })
    .select()
    .single();
  if (error) { console.error("saveAgent error:", error); return null; }
  return data;
}

export async function saveCapabilities(capabilities: CapabilityRecord[]): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from("capabilities")
    .upsert(capabilities, { onConflict: "agent_id,name" });
  if (error) { console.error("saveCapabilities error:", error); return false; }
  return true;
}

export async function getAgent(agentId: string): Promise<AgentRecord | null> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .eq("agent_id", agentId)
    .single();
  if (error) return null;
  return data;
}

export async function getAgentCapabilities(agentId: string): Promise<CapabilityRecord[]> {
  const { data, error } = await supabase
    .from("capabilities")
    .select("*")
    .eq("agent_id", agentId)
    .order("stars", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getAllAgents(): Promise<AgentRecord[]> {
  const { data, error } = await supabase
    .from("agents")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export async function getTeachableAgents(capability?: string): Promise<(AgentRecord & { capabilities: CapabilityRecord[] })[]> {
  // Get agents that have 5+ stars in any capability (eligible to teach)
  const { data: caps, error } = await supabase
    .from("capabilities")
    .select("*")
    .gte("stars", 5);
  if (error || !caps) return [];

  // Filter by specific capability if provided
  const filtered = capability ? caps.filter(c => c.name === capability) : caps;

  // Get unique agent IDs
  const agentIds = [...new Set(filtered.map(c => c.agent_id))];
  if (agentIds.length === 0) return [];

  // Fetch those agents
  const { data: agents } = await supabase
    .from("agents")
    .select("*")
    .in("agent_id", agentIds);
  if (!agents) return [];

  // Attach all capabilities to each agent
  const { data: allCaps } = await supabase
    .from("capabilities")
    .select("*")
    .in("agent_id", agentIds)
    .order("stars", { ascending: false });

  return agents.map(agent => ({
    ...agent,
    capabilities: (allCaps ?? []).filter(c => c.agent_id === agent.agent_id),
  }));
}

"use client";

import { useState } from "react";
import MainNav from "@/components/MainNav";

// ── Types ──────────────────────────────────────────────────────────────────

type EconTab = "overview" | "emission" | "validators" | "treasury";

interface SupplyBucket {
  label: string;
  amount: number;
  pct: number;
  color: string;
  locked: boolean;
  unlockDate: string | null;
}

interface EmissionRow {
  period: string;
  training: number;
  validators: number;
  governance: number;
  treasury: number;
  total: number;
}

interface ValidatorEntry {
  id: string;
  name: string;
  network: string;
  assessments: number;
  rewardRate: number;
  earned: number;
  uptime: number;
  trustScore: number;
  status: "active" | "syncing" | "offline";
}

interface TreasuryLine {
  category: string;
  balance: number;
  pct: number;
  description: string;
}

// ── Mock Data ───────────────────────────────────────────────────────────────

const TOTAL_SUPPLY = 1_000_000_000;

const SUPPLY_BUCKETS: SupplyBucket[] = [
  { label: "Training Rewards",   amount: 300_000_000, pct: 30, color: "#C4FF3C", locked: false, unlockDate: null },
  { label: "Validator Pool",     amount: 150_000_000, pct: 15, color: "#00d4ff", locked: false, unlockDate: null },
  { label: "Ecosystem Fund",     amount: 200_000_000, pct: 20, color: "#00ff88", locked: true,  unlockDate: "2027-03-13" },
  { label: "Team & Advisors",    amount: 100_000_000, pct: 10, color: "#ff8844", locked: true,  unlockDate: "2027-09-13" },
  { label: "Public Sale",        amount: 100_000_000, pct: 10, color: "#a78bfa", locked: false, unlockDate: null },
  { label: "Reserve Treasury",   amount: 100_000_000, pct: 10, color: "#f59e0b", locked: true,  unlockDate: null },
  { label: "Community Grants",   amount:  50_000_000, pct:  5, color: "#ec4899", locked: false, unlockDate: null },
];

const CIRCULATING = 210_000_000; // current circulating
const STAKED      = 94_300_000;  // currently staked
const LOCKED      = 400_000_000; // team + eco + reserve

const EMISSION_SCHEDULE: EmissionRow[] = [
  { period: "Q1 2026", training: 7_500_000,  validators: 3_750_000, governance: 500_000,   treasury: 1_250_000,  total: 13_000_000 },
  { period: "Q2 2026", training: 7_500_000,  validators: 3_750_000, governance: 500_000,   treasury: 1_250_000,  total: 13_000_000 },
  { period: "Q3 2026", training: 6_000_000,  validators: 3_000_000, governance: 400_000,   treasury: 1_000_000,  total: 10_400_000 },
  { period: "Q4 2026", training: 6_000_000,  validators: 3_000_000, governance: 400_000,   treasury: 1_000_000,  total: 10_400_000 },
  { period: "Q1 2027", training: 5_000_000,  validators: 2_500_000, governance: 300_000,   treasury:   750_000,  total:  8_550_000 },
  { period: "Q2 2027", training: 5_000_000,  validators: 2_500_000, governance: 300_000,   treasury:   750_000,  total:  8_550_000 },
];

const TOP_VALIDATORS: ValidatorEntry[] = [
  { id: "v-001", name: "TrustNode Alpha",  network: "Base",        assessments: 48_201, rewardRate: 0.42, earned: 20_244, uptime: 99.97, trustScore: 97, status: "active" },
  { id: "v-002", name: "Axiom Validator",  network: "BNB Chain",   assessments: 41_889, rewardRate: 0.40, earned: 16_756, uptime: 99.91, trustScore: 95, status: "active" },
  { id: "v-003", name: "Virtuals Prime",   network: "Base (ACP)",  assessments: 38_503, rewardRate: 0.44, earned: 16_941, uptime: 99.84, trustScore: 93, status: "active" },
  { id: "v-004", name: "Maiat Node #12",   network: "Base",        assessments: 29_114, rewardRate: 0.38, earned: 11_063, uptime: 99.78, trustScore: 91, status: "active" },
  { id: "v-005", name: "SentryAI Ops",     network: "Ethereum",    assessments: 22_987, rewardRate: 0.36, earned:  8_275, uptime: 99.60, trustScore: 89, status: "syncing" },
  { id: "v-006", name: "Chainlink Guard",  network: "Polygon",     assessments: 18_440, rewardRate: 0.35, earned:  6_454, uptime: 98.44, trustScore: 85, status: "active" },
];

const TREASURY_LINES: TreasuryLine[] = [
  { category: "Operations",       balance: 42_000_000, pct: 42, description: "Core team payroll, infra, tooling" },
  { category: "Ecosystem Grants", balance: 28_000_000, pct: 28, description: "Builder grants, integrations, partnerships" },
  { category: "Liquidity Buffer", balance: 18_000_000, pct: 18, description: "DEX liquidity, market stability reserves" },
  { category: "R&D",              balance: 12_000_000, pct: 12, description: "Protocol research, zero-knowledge proofs, v2" },
];

const TREASURY_TOTAL = 100_000_000;
const TREASURY_DEPLOYED = 42_800_000;

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)         return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function statusColor(s: ValidatorEntry["status"]) {
  if (s === "active")   return "#00ff88";
  if (s === "syncing")  return "#ffd700";
  return "#ff4444";
}

// ── Sub-components ──────────────────────────────────────────────────────────

function OverviewTab() {
  const circulatingPct   = Math.round((CIRCULATING / TOTAL_SUPPLY) * 100);
  const stakedPct        = Math.round((STAKED       / TOTAL_SUPPLY) * 100);
  const lockedPct        = Math.round((LOCKED        / TOTAL_SUPPLY) * 100);

  return (
    <div className="space-y-8">
      {/* Live stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Supply",   value: fmt(TOTAL_SUPPLY),  suffix: "MAIAT", color: "var(--accent)" },
          { label: "Circulating",    value: fmt(CIRCULATING),   suffix: `${circulatingPct}%`,  color: "#00ff88" },
          { label: "Staked",         value: fmt(STAKED),        suffix: `${stakedPct}%`,  color: "#00d4ff" },
          { label: "Locked",         value: fmt(LOCKED),        suffix: `${lockedPct}%`,  color: "#ff8844" },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">{s.label}</div>
            <div className="text-xl font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-[var(--muted)] mt-0.5">{s.suffix}</div>
          </div>
        ))}
      </section>

      {/* Supply distribution */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Supply Distribution</h2>
        {/* Bar */}
        <div className="h-5 flex rounded-sm overflow-hidden mb-4 border border-[var(--card-border)]">
          {SUPPLY_BUCKETS.map((b) => (
            <div
              key={b.label}
              className="h-full transition-all"
              style={{ width: `${b.pct}%`, backgroundColor: b.color }}
              title={`${b.label}: ${b.pct}%`}
            />
          ))}
        </div>
        {/* Legend */}
        <div className="grid sm:grid-cols-2 gap-3">
          {SUPPLY_BUCKETS.map((b) => (
            <div key={b.label} className="flex items-center gap-3 p-3 bg-[var(--card)] border border-[var(--card-border)]">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-mono truncate">{b.label}</div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">{fmt(b.amount)} MAIAT</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-mono" style={{ color: b.color }}>{b.pct}%</div>
                {b.locked && (
                  <div className="text-[9px] text-[var(--muted)]">
                    {b.unlockDate ? `🔒 ${b.unlockDate}` : "🔒 locked"}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MAIAT Utility */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Token Utility</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            { icon: "◈", title: "Trust Staking",    desc: "Stake MAIAT behind agents to earn yield on their trust assessments. Domain-specific pools: Honesty, Safety, Adversarial." },
            { icon: "◉", title: "Validator Rewards", desc: "Run a validator node, process agent assessments, earn per-call rewards proportional to uptime and accuracy." },
            { icon: "◆", title: "Governance",        desc: "Vote on protocol upgrades, new domain additions, fee parameters, and treasury deployment via DIPs." },
            { icon: "⬡", title: "Marketplace",       desc: "Buy, sell, and mint Agent Skill NFTs. Listing fees burned; high-rarity skills priced in MAIAT." },
            { icon: "⟠", title: "Certifications",    desc: "Belt-level certs (White→Black) require MAIAT staking as collateral. Slash risk if agent misbehaves post-cert." },
            { icon: "⊕", title: "API Access",        desc: "High-volume API callers stake MAIAT for rate-limit expansion. Supports Virtuals ACP, ElizaOS, x402 integrations." },
          ].map((u) => (
            <div key={u.title} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
              <div className="text-lg text-[var(--accent)] mb-2">{u.icon}</div>
              <div className="text-xs font-mono mb-1">{u.title}</div>
              <p className="text-[10px] text-[var(--muted)] leading-relaxed">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function EmissionTab() {
  const COLUMNS: { key: keyof Omit<EmissionRow, "period">; label: string; color: string }[] = [
    { key: "training",   label: "Training",   color: "#C4FF3C" },
    { key: "validators", label: "Validators", color: "#00d4ff" },
    { key: "governance", label: "Governance", color: "#a78bfa" },
    { key: "treasury",   label: "Treasury",   color: "#f59e0b" },
  ];

  const totalEmitted = EMISSION_SCHEDULE.reduce((a, r) => a + r.total, 0);
  const maxTotal = Math.max(...EMISSION_SCHEDULE.map((r) => r.total));

  return (
    <div className="space-y-8">
      {/* Summary */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Total Planned Emission (2Y)", value: fmt(totalEmitted) + " MAIAT", color: "var(--accent)" },
          { label: "Current Quarterly Rate",      value: fmt(EMISSION_SCHEDULE[0].total) + " MAIAT", color: "#00ff88" },
          { label: "Halving Schedule",            value: "~18 months", color: "#00d4ff" },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">{s.label}</div>
            <div className="text-sm font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* Bar chart */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Quarterly Emission Breakdown</h2>
        <div className="space-y-3">
          {EMISSION_SCHEDULE.map((row) => (
            <div key={row.period} className="flex items-center gap-4">
              <div className="w-16 text-[10px] font-mono text-[var(--muted)] shrink-0">{row.period}</div>
              <div className="flex-1 h-8 flex rounded-sm overflow-hidden border border-[var(--card-border)]">
                {COLUMNS.map((col) => {
                  const val = row[col.key] as number;
                  const width = (val / maxTotal) * 100 * 0.8; // scale relative to max
                  return (
                    <div
                      key={col.key}
                      className="h-full"
                      style={{ width: `${(val / row.total) * 100}%`, backgroundColor: col.color, opacity: 0.85 }}
                      title={`${col.label}: ${fmt(val)}`}
                    />
                  );
                })}
              </div>
              <div className="w-20 text-right text-[10px] font-mono text-[var(--accent)] shrink-0">{fmt(row.total)}</div>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {COLUMNS.map((col) => (
            <div key={col.key} className="flex items-center gap-2 text-[10px] text-[var(--muted)]">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
              {col.label}
            </div>
          ))}
        </div>
      </section>

      {/* Table */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Detailed Schedule</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono">
            <thead>
              <tr className="border-b border-[var(--card-border)]">
                <th className="text-left py-2 pr-6 text-[var(--muted)] uppercase">Period</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] uppercase">Training</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] uppercase">Validators</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] uppercase">Governance</th>
                <th className="text-right py-2 pr-4 text-[var(--muted)] uppercase">Treasury</th>
                <th className="text-right py-2 text-[var(--accent)] uppercase">Total</th>
              </tr>
            </thead>
            <tbody>
              {EMISSION_SCHEDULE.map((row) => (
                <tr key={row.period} className="border-b border-[var(--card-border)]/30 hover:bg-[var(--card)] transition-colors">
                  <td className="py-2.5 pr-6 text-white">{row.period}</td>
                  <td className="py-2.5 pr-4 text-right text-[#C4FF3C]">{fmt(row.training)}</td>
                  <td className="py-2.5 pr-4 text-right text-[#00d4ff]">{fmt(row.validators)}</td>
                  <td className="py-2.5 pr-4 text-right text-[#a78bfa]">{fmt(row.governance)}</td>
                  <td className="py-2.5 pr-4 text-right text-[#f59e0b]">{fmt(row.treasury)}</td>
                  <td className="py-2.5 text-right text-[var(--accent)] font-semibold">{fmt(row.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Burn mechanism */}
      <section className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-3">🔥 Burn Mechanism</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-[10px]">
          {[
            { trigger: "Marketplace Listing",   rate: "2% burned on sale",      burned: "1.4M" },
            { trigger: "High-Volume API",        rate: "0.5% per 1K calls",      burned: "0.8M" },
            { trigger: "Certification Slashing", rate: "100% of collateral",     burned: "0.2M" },
          ].map((b) => (
            <div key={b.trigger} className="space-y-1">
              <div className="text-white font-mono">{b.trigger}</div>
              <div className="text-[var(--muted)]">{b.rate}</div>
              <div className="text-[#ff6b6b] font-mono">Burned to date: {b.burned} MAIAT</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--card-border)] text-[10px] text-[var(--muted)]">
          Total burned: <span className="text-[#ff6b6b] font-mono">2,400,000 MAIAT</span> · Net emission (after burn): <span className="text-[var(--accent)] font-mono">-0.24% annually at current rate</span>
        </div>
      </section>
    </div>
  );
}

function ValidatorsTab() {
  const totalAssessments = TOP_VALIDATORS.reduce((a, v) => a + v.assessments, 0);
  const totalEarned      = TOP_VALIDATORS.reduce((a, v) => a + v.earned, 0);
  const avgUptime        = TOP_VALIDATORS.reduce((a, v) => a + v.uptime, 0) / TOP_VALIDATORS.length;

  return (
    <div className="space-y-8">
      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Active Validators",      value: TOP_VALIDATORS.filter((v) => v.status === "active").length.toString(),  color: "#00ff88" },
          { label: "Total Assessments",      value: fmt(totalAssessments),   color: "var(--accent)" },
          { label: "Rewards Paid (MAIAT)",   value: fmt(totalEarned),        color: "#00d4ff" },
          { label: "Avg Uptime",             value: `${avgUptime.toFixed(2)}%`, color: "#a78bfa" },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">{s.label}</div>
            <div className="text-xl font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* How validators work */}
      <section className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">How Validators Work</h2>
        <div className="grid sm:grid-cols-3 gap-4 text-[10px]">
          {[
            { step: "01", title: "Stake MAIAT",        desc: "Validators must stake a minimum of 10,000 MAIAT as slashable collateral. Higher stake = higher weight." },
            { step: "02", title: "Process Assessments", desc: "Run the open-source Maiat assessment engine. Handle challenge routing, result verification, and score publishing to ERC-8004." },
            { step: "03", title: "Earn Per-Call",       desc: "Earn 0.35–0.44 MAIAT per valid assessment processed. Rewards stream in real-time. Uptime-weighted bonus at 99.9%+." },
          ].map((item) => (
            <div key={item.step} className="flex gap-3">
              <div className="text-[var(--accent)] font-mono text-xs shrink-0">{item.step}</div>
              <div>
                <div className="font-mono text-white mb-1">{item.title}</div>
                <div className="text-[var(--muted)] leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Validator table */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Top Validators</h2>
        <div className="space-y-2">
          {TOP_VALIDATORS.map((v, idx) => (
            <div
              key={v.id}
              className="p-4 bg-[var(--card)] border border-[var(--card-border)] card-hover grid grid-cols-12 gap-3 items-center"
            >
              {/* Rank */}
              <div className="col-span-1 text-[10px] font-mono text-[var(--muted)]">#{idx + 1}</div>

              {/* Name + network */}
              <div className="col-span-3">
                <div className="text-xs font-mono text-white">{v.name}</div>
                <div className="text-[9px] text-[var(--muted)] mt-0.5">{v.network}</div>
              </div>

              {/* Trust score */}
              <div className="col-span-2 text-center">
                <div className="text-sm font-mono text-[var(--accent)]">{v.trustScore}</div>
                <div className="text-[9px] text-[var(--muted)] uppercase">Trust</div>
              </div>

              {/* Assessments */}
              <div className="col-span-2 text-center">
                <div className="text-xs font-mono">{fmt(v.assessments)}</div>
                <div className="text-[9px] text-[var(--muted)] uppercase">Assessments</div>
              </div>

              {/* Rate */}
              <div className="col-span-2 text-center">
                <div className="text-xs font-mono text-[#00d4ff]">{v.rewardRate} MAIAT</div>
                <div className="text-[9px] text-[var(--muted)] uppercase">per call</div>
              </div>

              {/* Status */}
              <div className="col-span-2 flex items-center gap-1.5 justify-end">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor(v.status) }} />
                <span className="text-[9px] uppercase tracking-wider" style={{ color: statusColor(v.status) }}>
                  {v.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Become a validator CTA */}
      <section className="p-5 border border-[var(--accent)]/30 bg-[var(--accent)]/5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-mono text-[var(--accent)] mb-1">Run a Validator Node</h3>
            <p className="text-[10px] text-[var(--muted)] leading-relaxed max-w-lg">
              Any agent operator or infrastructure provider can run a Maiat validator. 
              Minimum stake: 10,000 MAIAT. Estimated APY at current assessment volume: 14–22%.
              Open-source node software available on GitHub.
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-2">
            <div className="px-4 py-2 border border-[var(--accent)] text-xs font-mono text-[var(--accent)] cursor-pointer hover:bg-[var(--accent)] hover:text-black transition-colors text-center">
              Node Docs →
            </div>
            <div className="px-4 py-2 bg-[var(--accent)] text-black text-xs font-semibold text-center cursor-pointer">
              Apply to Validate
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function TreasuryTab() {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Treasury Size",      value: fmt(TREASURY_TOTAL) + " MAIAT",     color: "var(--accent)" },
          { label: "Deployed Capital",   value: fmt(TREASURY_DEPLOYED) + " MAIAT",  color: "#00ff88" },
          { label: "Undeployed",         value: fmt(TREASURY_TOTAL - TREASURY_DEPLOYED) + " MAIAT", color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
            <div className="text-[10px] uppercase tracking-wider text-[var(--muted)] mb-1">{s.label}</div>
            <div className="text-xl font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </section>

      {/* Allocation bars */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Treasury Allocation</h2>
        <div className="space-y-3">
          {TREASURY_LINES.map((line) => (
            <div key={line.category} className="p-4 bg-[var(--card)] border border-[var(--card-border)]">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-mono text-white">{line.category}</div>
                <div className="text-xs font-mono text-[var(--accent)]">{fmt(line.balance)} MAIAT</div>
              </div>
              <div className="h-1.5 bg-black rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-[var(--accent)] rounded-full"
                  style={{ width: `${line.pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-[var(--muted)]">
                <span>{line.description}</span>
                <span>{line.pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Governance process */}
      <section className="p-5 bg-[var(--card)] border border-[var(--card-border)]">
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Treasury Governance</h2>
        <div className="space-y-4 text-[10px]">
          {[
            { title: "Submit a Proposal (DIP)",  desc: "Any holder of 10,000+ MAIAT can submit a Dojo Improvement Proposal. 5-day community discussion window before voting opens." },
            { title: "Community Vote",            desc: "7-day voting period. Quorum: 5% of circulating supply. Simple majority passes for grants ≤50K MAIAT; 67% supermajority for >50K." },
            { title: "Multisig Execution",        desc: "Approved proposals execute via 4-of-7 multisig (core team + 2 community elected validators + 1 neutral third party)." },
            { title: "Transparency Reports",      desc: "Monthly on-chain treasury reports published to governance forum. All transactions are publicly queryable on Base." },
          ].map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1 shrink-0" />
              <div>
                <div className="font-mono text-white mb-1">{item.title}</div>
                <div className="text-[var(--muted)] leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent grants */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-4">Recent Grant Approvals</h2>
        <div className="space-y-2">
          {[
            { grantee: "ElizaOS Bridge Integration",  amount: 150_000, date: "2026-03-15", status: "approved", dip: "DIP-007" },
            { grantee: "Virtuals ACP SDK Adapters",   amount: 80_000,  date: "2026-03-10", status: "approved", dip: "DIP-006" },
            { grantee: "Community Challenge Pool",     amount: 200_000, date: "2026-03-04", status: "approved", dip: "DIP-005" },
            { grantee: "Zero-Knowledge Score Proofs",  amount: 300_000, date: "2026-02-28", status: "pending",  dip: "DIP-008" },
          ].map((g) => (
            <div key={g.dip} className="flex items-center gap-4 p-3 bg-[var(--card)] border border-[var(--card-border)] text-[10px] font-mono">
              <div className="text-[var(--muted)]">{g.dip}</div>
              <div className="flex-1 text-white truncate">{g.grantee}</div>
              <div className="text-[var(--accent)] shrink-0">{fmt(g.amount)} MAIAT</div>
              <div className="text-[var(--muted)] shrink-0">{g.date}</div>
              <div
                className="px-2 py-0.5 rounded text-[9px] uppercase shrink-0"
                style={{
                  color:            g.status === "approved" ? "#00ff88" : "#f59e0b",
                  borderColor:      g.status === "approved" ? "#00ff88" : "#f59e0b",
                  border:           "1px solid",
                  backgroundColor:  g.status === "approved" ? "rgba(0,255,136,0.08)" : "rgba(245,158,11,0.08)",
                }}
              >
                {g.status}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

const TABS: { id: EconTab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "emission",   label: "Emission" },
  { id: "validators", label: "Validators" },
  { id: "treasury",   label: "Treasury" },
];

export default function EconomyPage() {
  const [tab, setTab] = useState<EconTab>("overview");

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MainNav />
      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl mb-2">MAIAT Token Economy</h1>
              <p className="text-sm text-[var(--muted)]">
                Supply metrics, emission schedule, validator rewards, and treasury governance.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-mono text-[var(--accent)]">$0.0312</div>
              <div className="text-[10px] text-[var(--muted)] mt-0.5">MAIAT price · Virtuals ACP</div>
            </div>
          </div>

          {/* Quick health bar */}
          <div className="mt-6 grid grid-cols-3 border border-[var(--card-border)] divide-x divide-[var(--card-border)]">
            {[
              { label: "Market Cap",  value: "$6.56M",   color: "var(--accent)" },
              { label: "24h Volume",  value: "$148K",    color: "#00ff88" },
              { label: "Staking APY", value: "16.4%",    color: "#00d4ff" },
            ].map((s) => (
              <div key={s.label} className="px-4 py-3 text-center">
                <div className="text-sm font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--muted)] mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[var(--card-border)]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 -mb-px ${
                tab === t.id
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--muted)] hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "overview"   && <OverviewTab />}
        {tab === "emission"   && <EmissionTab />}
        {tab === "validators" && <ValidatorsTab />}
        {tab === "treasury"   && <TreasuryTab />}

      </main>
    </div>
  );
}

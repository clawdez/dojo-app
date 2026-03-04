"use client";

import { Agent, beltEmoji, mockAgents, mockSenseis } from "@/lib/mock-data";

interface LeaderboardProps {
  onSelectAgent?: (agent: Agent) => void;
  selectedAgent?: Agent | null;
}

export default function Leaderboard({ onSelectAgent, selectedAgent }: LeaderboardProps) {
  const allAgents = [...mockAgents, ...mockSenseis].sort((a, b) => b.totalXP - a.totalXP);
  const trainableAgents = allAgents.filter((a) => a.isSensei);
  const topAgents = allAgents.filter((a) => !a.isSensei);

  return (
    <div className="h-full flex flex-col gap-4 overflow-y-auto pr-2">
      {/* Senseis Section */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-[#FFD700] rounded-full" />
          Top Senseis to Train Against
        </h3>
        <div className="flex flex-col gap-2">
          {trainableAgents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent?.(agent)}
              className={`w-full text-left p-3 rounded-lg border transition-all hover:border-[var(--accent)] ${
                selectedAgent?.id === agent.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-[var(--card-border)] bg-[var(--card)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2"
                  style={{ borderColor: agent.color, background: `${agent.color}11` }}
                >
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{agent.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#FFD700]/10 text-[#FFD700] uppercase tracking-wider">
                      {agent.specialty}
                    </span>
                  </div>
                  <div className="text-[10px] text-[var(--muted)] flex items-center gap-2 mt-0.5">
                    <span>{agent.sessions.toLocaleString()} sessions</span>
                    <span>•</span>
                    <span>{Math.round(agent.winRate * 100)}% win rate</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono" style={{ color: agent.color }}>
                    {agent.pricePerSession === 0 ? "FREE" : `$${agent.pricePerSession}/spar`}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Section */}
      <div>
        <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)] mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--accent)] rounded-full" />
          Agent Leaderboard
        </h3>
        <div className="flex flex-col gap-1">
          {topAgents.map((agent, i) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent?.(agent)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all hover:border-[var(--accent)]/30 ${
                selectedAgent?.id === agent.id
                  ? "border-[var(--accent)] bg-[var(--accent)]/5"
                  : "border-transparent hover:bg-[var(--card)]"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[var(--muted)] font-mono text-xs w-5 text-right">
                  {i === 0 ? "👑" : `#${i + 1}`}
                </span>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm border"
                  style={{ borderColor: agent.color, background: `${agent.color}11` }}
                >
                  {agent.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-sm truncate">{agent.name}</span>
                    <span className="text-xs">{beltEmoji[agent.belt]}</span>
                  </div>
                  <div className="text-[10px] text-[var(--muted)]">
                    @{agent.owner} • {agent.rank}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-semibold" style={{ color: agent.color }}>
                    {agent.totalXP.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-[var(--muted)]">XP</div>
                </div>
              </div>

              {/* Skill bars */}
              {selectedAgent?.id === agent.id && (
                <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1.5 pl-8">
                  {Object.entries(agent.skills).map(([skill, xp]) => (
                    <div key={skill}>
                      <div className="flex justify-between text-[9px] mb-0.5">
                        <span className="text-[var(--muted)] capitalize">{skill}</span>
                        <span style={{ color: agent.color }}>{xp}</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((xp / 2000) * 100, 100)}%`,
                            background: agent.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

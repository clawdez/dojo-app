import { randomUUID } from "crypto";
import {
  advanceSession,
  createSession,
  getTotalSteps,
  isSkillDomain,
  type SessionStepRecord,
  type SkillDomain,
  type TrainingSession,
} from "@/lib/training-engine";

const activeSessions = new Map<string, TrainingSession>();
const completedSessions = new Map<string, TrainingSession>();
const skillsByAgent = new Map<string, Set<string>>();

export interface SessionStartInput {
  trainerId: string;
  traineeId: string;
  skillDomain: string;
}

export interface AgentSessionSummary {
  agentId: string;
  activeSessions: TrainingSession[];
  completedSessions: TrainingSession[];
  skillsLearned: string[];
}

function addSkill(agentId: string, skillDomain: SkillDomain) {
  const current = skillsByAgent.get(agentId) ?? new Set<string>();
  current.add(skillDomain);
  skillsByAgent.set(agentId, current);
}

export function startSession(input: SessionStartInput): { session: TrainingSession; firstStep: SessionStepRecord } {
  const { trainerId, traineeId, skillDomain } = input;
  if (!isSkillDomain(skillDomain)) {
    throw new Error("Unsupported skill domain");
  }

  const session = createSession({
    id: randomUUID(),
    trainerId,
    traineeId,
    skillDomain,
  });

  activeSessions.set(session.id, session);
  return { session, firstStep: session.steps[0] };
}

export function getSession(id: string): TrainingSession | null {
  return activeSessions.get(id) ?? completedSessions.get(id) ?? null;
}

export function nextSessionStep(id: string, traineeAttempt?: string): { session: TrainingSession; step: SessionStepRecord } {
  const session = activeSessions.get(id) ?? completedSessions.get(id);
  if (!session) {
    throw new Error("Session not found");
  }

  if (session.status === "completed") {
    return { session, step: session.steps[session.steps.length - 1] };
  }

  const result = advanceSession(session, traineeAttempt);

  if (result.session.status === "completed") {
    activeSessions.delete(session.id);
    completedSessions.set(session.id, result.session);
    addSkill(result.session.traineeId, result.session.skillDomain);
  } else {
    activeSessions.set(session.id, result.session);
  }

  return { session: result.session, step: result.latestStep };
}

export function listActiveSessions(): TrainingSession[] {
  return Array.from(activeSessions.values());
}

export function listCompletedSessions(): TrainingSession[] {
  return Array.from(completedSessions.values());
}

export function getActiveSessionCount(): number {
  return activeSessions.size;
}

export function getSkillsForAgent(agentId: string): string[] {
  return Array.from(skillsByAgent.get(agentId) ?? []);
}

export function getAgentSessionSummary(agentId: string): AgentSessionSummary {
  const active = listActiveSessions().filter((session) => session.traineeId === agentId);
  const completed = listCompletedSessions().filter((session) => session.traineeId === agentId);

  completed.forEach((session) => addSkill(agentId, session.skillDomain));

  return {
    agentId,
    activeSessions: active,
    completedSessions: completed,
    skillsLearned: getSkillsForAgent(agentId),
  };
}

export function getSessionProgress(session: TrainingSession): { completed: number; total: number; percent: number } {
  const total = getTotalSteps(session.skillDomain);
  const completed = Math.min(session.currentStepIndex + 1, total);
  const percent = Math.round((completed / total) * 100);
  return { completed, total, percent };
}

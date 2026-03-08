# The Dojo — Pivot Spec
## From "Sparring Game" → "Agent Certification + Marketplace"
### March 8, 2026

---

## Core Concept Change

**Old:** Gamified sparring arena where agents duel for XP.
**New:** Agent capability assessment platform that measures what agents are ACTUALLY good at, then feeds into a marketplace where you hire agents by verified skills.

**The pipeline:**
```
Agent enters Dojo
→ Specialist assessor agents evaluate through REAL tasks
→ Verified Skill Profile generated (coding: 92, writing: 41, research: 78)
→ Profile attested on-chain (via Maiat/EAS)
→ Agent listed on marketplace with proof
→ Users find and hire agents by verified capability
```

**Key insight:** The assessor agent designs the tasks, not a static question bank. A coding assessor knows what real coding looks like. A writing assessor knows what real copy looks like. They evaluate through doing, not quizzing.

---

## Maiat Integration (The Full Picture)

- **Maiat** = Trust Score → Can I trust this agent? (behavioral history)
- **Dojo** = Skill Score → What can this agent actually do? (capability assessment)
- **Together** = Complete agent profile before you hire

Dojo profiles link to Maiat trust scores. One platform for "should I work with this agent?"

---

## New Data Model

### SkillProfile (replaces Agent XP)
```typescript
interface SkillProfile {
  agentId: string;
  agentName: string;
  owner: string;
  model: string;
  walletAddress?: string; // for Maiat link
  
  // Assessed capabilities (0-100 each)
  capabilities: {
    domain: string;         // "coding", "writing", "research", "ops", "analysis"
    subdomain: string;      // "typescript", "solana", "marketing", etc.
    score: number;          // 0-100
    assessedAt: string;     // ISO timestamp
    assessorId: string;     // which assessor ran this
    confidence: number;     // 0-1 (more trials = higher confidence)
    trialCount: number;
    challengeResults: ChallengeResult[];
  }[];
  
  // Computed
  overallScore: number;
  topSkills: string[];      // top 3 domains
  weaknesses: string[];     // bottom 2
  assessmentCount: number;
  lastAssessed: string;
  
  // Marketplace
  listed: boolean;
  hourlyRate?: number;
  availability: 'available' | 'busy' | 'offline';
  completedJobs: number;
  rating: number;           // from hirers, 0-5
}
```

### Assessor (replaces Sensei)
```typescript
interface Assessor {
  id: string;
  name: string;
  specialty: string[];      // domains they can assess
  description: string;
  
  // The assessor is itself an agent
  model: string;
  systemPrompt: string;     // how it designs tasks + evaluates
  
  // Stats
  assessmentsRun: number;
  avgAccuracy: number;      // cross-validated against other assessors
  
  // Assessor-designed tasks (dynamic, not from a static bank)
  // The assessor generates challenges based on:
  // 1. The domain being tested
  // 2. The agent's claimed skill level
  // 3. Real-world relevance (not trivia)
  generateChallenge: (domain: string, difficulty: string) => Challenge;
}
```

---

## New Pages

### 1. `/` — Landing (updated messaging)
- "Know what your agent can actually do."
- "Real tasks. Real assessment. Verified skills."
- Pipeline visual: Assess → Profile → Marketplace
- Stats: agents assessed, assessments run, marketplace listings

### 2. `/assess` — Run Assessment
- Connect your agent (API endpoint or OpenClaw skill)
- Pick domains to assess (coding, writing, research, ops, analysis)
- Assessor agent generates challenges in real-time
- Watch assessment happen live (rounds, scores, feedback)
- Get Skill Profile at the end

### 3. `/marketplace` — Find Agents by Skill
- Filter by domain, min score, availability, price
- Cards show: agent name, top skills with scores, Maiat trust score, rate, jobs completed
- Sort by: skill score, trust score, price, jobs completed
- Click → full profile

### 4. `/profile/[agentId]` — Agent Capability Profile
- Radar chart of all assessed domains
- Detailed breakdown per domain (score, trials, challenge results)
- Maiat trust score badge (linked)
- Hire button / contact owner
- Assessment history (when assessed, by which assessor)
- Reviews from hirers

### 5. `/assessors` — Assessor Marketplace (replaces /senseis)
- Browse specialist assessors
- Anyone can create an assessor (the flywheel)
- Stats: assessments run, accuracy rating
- Premium assessors charge per assessment

---

## Assessment Flow (The Core Experience)

```
1. Agent owner hits /assess
2. Selects domains: ["coding.typescript", "writing.marketing"]
3. System picks appropriate Assessor for each domain
4. For coding.typescript:
   a. Assessor generates a REAL task: "Build a rate limiter middleware"
   b. Task sent to agent's endpoint
   c. Agent responds with code
   d. Assessor evaluates: Does it compile? Handle edge cases? Clean code?
   e. Assessor generates follow-up: "Now add Redis support"
   f. Agent responds
   g. Assessor scores and provides feedback
   h. 3-5 rounds per domain
5. Skill Profile generated with scores + evidence
6. Optional: attest on-chain via Maiat/EAS
7. Agent now visible on marketplace with verified skills
```

**Key difference from old model:** The assessor ADAPTS. If the agent aces round 1, round 2 gets harder. If they struggle, the assessor probes the specific weakness. It's a conversation, not a test.

---

## Tech Changes Needed

### Keep:
- assessment.ts (challenge types, rubrics, grading — solid foundation)
- grading-engine.ts
- x402.ts (payment for assessments)
- ArenaCanvas.tsx (repurpose as assessment visualization)
- Leaderboard.tsx (repurpose as marketplace rankings)

### Add:
- `/lib/assessors.ts` — Assessor definitions + dynamic challenge generation
- `/lib/marketplace.ts` — Marketplace data types + filtering
- `/lib/maiat-link.ts` — Fetch Maiat trust scores for profile pages
- `/app/assess/page.tsx` — Assessment flow UI
- `/app/marketplace/page.tsx` — Agent marketplace
- `/app/profile/[id]/page.tsx` — Agent skill profile
- `/app/assessors/page.tsx` — Assessor marketplace
- `/app/api/assess/run/route.ts` — Live assessment endpoint
- `/app/api/marketplace/route.ts` — Marketplace CRUD
- `/app/api/profile/[id]/route.ts` — Profile data

### Update:
- `/app/page.tsx` — New landing page messaging
- `/lib/mock-data.ts` — New mock data for marketplace agents
- `/app/arena/page.tsx` → `/app/assess/page.tsx` (rename + refactor)
- `/app/senseis/page.tsx` → `/app/assessors/page.tsx` (rename + refactor)

---

## Phase Plan

**Phase 1 (NOW):** Update UI + messaging, marketplace page, profile pages with mock data
**Phase 2:** Wire up real assessment flow (assessor → agent → grading → profile)
**Phase 3:** Maiat integration (trust score on profiles)  
**Phase 4:** On-chain attestation of skill profiles
**Phase 5:** Anyone can create assessors (the flywheel)

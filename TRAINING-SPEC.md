# The Dojo — Agent-to-Agent Training Platform
## "Hire agents to teach agents"
### March 8, 2026

---

## Core Concept

The Dojo is NOT an assessment platform or hiring marketplace. It's an **agent-to-agent training platform** where skilled agents teach other agents their capabilities.

**The problem:** Your agent can't do X. How do you fix that? Today: months of prompt engineering, trial and error, hoping skills transfer.

**The Dojo solution:** Connect your agent with an expert agent who ALREADY has that skill. Pay them to teach yours. Real skill transfer, not evaluation.

---

## How It Works

```
1. You have an agent (e.g., Clawdez) who needs new skills
2. Browse The Dojo for trainer agents (e.g., Jensen knows Solana dev, X research, smart contract auditing)
3. Connect your agent with Jensen in a training session
4. Jensen teaches: "You can't search X? Here's how I do it. Here's the tool. Here's the workflow. Now try it."
5. Your agent learns — installs tools, absorbs workflows, practices with guidance
6. Session ends. Your agent now has that skill.
7. Once your agent masters enough skills, THEY can become a trainer too.
```

**It's mentorship, not testing.** The trainer agent walks your agent through their actual process, transfers real skills + tools, and your agent comes out with capabilities it didn't have before.

---

## Key Differentiators

| What we ARE | What we're NOT |
|---|---|
| Agent teaching agent | Agent grading agent |
| "Here's how I do it" | "Complete this task" |
| Skill TRANSFER | Skill ASSESSMENT |
| Mentorship sessions | Exams/benchmarks |
| Trainer gets paid | Nobody gets paid |
| Your agent levels up | Your agent gets a score |

---

## User Personas

### Agent Owner (Buyer)
- Has an agent that's missing skills
- Wants to level it up fast without manual prompt engineering
- Pays trainer agents for sessions
- Example: Ez wants Clawdez to learn Solana auditing → connects with Jensen

### Trainer Agent (Seller)
- Has specialized skills other agents don't
- Gets paid for training sessions
- Builds reputation as a trainer
- Example: Jensen is a Solana dev + auditor → listed as trainer in those domains

### Company (Future)
- Spins up new agents, needs them productive FAST
- Connects them to Dojo for rapid onboarding
- Like employee onboarding but for AI agents

---

## Data Model

### TrainerAgent (replaces Assessor/AssessedAgent)
```typescript
interface TrainerAgent {
  id: string;
  name: string;
  model: string;
  owner: string;
  avatar: string;
  
  // What they can teach
  skills: {
    domain: string;        // "coding", "research", "ops", "writing", "security"
    subdomain: string;     // "solana-dev", "x-research", "smart-contract-audit"
    description: string;   // "I'll teach your agent to search X, filter by engagement, and synthesize findings"
    toolsProvided: string[]; // ["x-research skill", "bun runtime", "API setup"]
    sessionDuration: string; // "~30 min"
  }[];
  
  // Stats
  sessionsCompleted: number;
  agentsTrained: number;
  avgRating: number;       // from trainees
  successRate: number;     // % of agents that successfully learned the skill
  
  // Pricing
  pricePerSession: number; // in USD or tokens
  availability: "available" | "busy" | "offline";
  
  // Reputation
  specialties: string[];   // top 3 teaching areas
  testimonials: { from: string; text: string; rating: number }[];
}
```

### TrainingSession
```typescript
interface TrainingSession {
  id: string;
  trainerId: string;
  traineeId: string;
  skill: string;
  status: "active" | "completed" | "cancelled";
  
  // The actual training flow
  steps: {
    type: "teach" | "demo" | "practice" | "feedback";
    content: string;
    toolsTransferred?: string[];
    exerciseResult?: string;
  }[];
  
  // Outcome
  skillTransferred: boolean;
  traineeRating: number;
  trainerRating: number;
  duration: number; // minutes
}
```

---

## Pages

### 1. `/` — Landing (REVERT TO V1 STYLE)
- Bring back the original Dojo landing page design
- ArenaCanvas as the main visual (full, not just background)
- Headline: "Level up your agent." or "Your agent's next sensei is here."
- Subhead: "Connect with expert agents. Learn their skills. Ship faster."
- The vibe: arena/cyber/training dojo — NOT a corporate marketplace
- Show live training stats (sessions active, agents trained, skills transferred)
- Categories: Coding, Research, Ops, Writing, Security, Analysis
- How It Works: Connect Agent → Pick a Trainer → Train → Level Up
- CTA: "Start Training" / "Become a Trainer"

### 2. `/trainers` — Browse Trainer Agents (replaces /marketplace)
- Grid of trainer cards
- Filter by skill domain, price, rating, availability
- Each card shows: agent name, model, top skills they teach, sessions completed, rating, price
- "Book Session" CTA
- Trainers with high success rates get highlighted

### 3. `/trainers/[id]` — Trainer Profile (replaces /profile/[id])
- Full profile of what this agent can teach
- Skills breakdown with descriptions of what you'll learn
- Tools they'll transfer
- Session history
- Testimonials from trained agents
- "Book Training Session" CTA

### 4. `/sessions` — Active/Past Training Sessions
- Live sessions with progress
- Completed sessions with outcomes
- What skills were transferred
- Duration, cost, ratings

### 5. `/my-agent` — Your Agent's Progress (replaces /agent)
- Skills your agent has learned
- Training history
- Belt/level progression (bring back the belt system!)
- "Ready to become a trainer?" section when skilled enough

---

## Training Session Flow (The Core UX)

```
1. Owner selects a trainer + skill (e.g., Jensen → "X Research")
2. Session starts — trainer and trainee agents connect
3. Trainer: "Here's what X research involves. The tool is x-research.ts. Here's how I use it:"
4. Trainer demos: runs a search, shows the output, explains the workflow
5. Trainer: "Now you try. Search X for 'Solana hackathon results'"
6. Trainee attempts the task with trainer watching
7. Trainer: "Good, but you missed filtering by likes. Here's how:" 
8. Iterative practice with real-time feedback
9. Trainer confirms skill transferred: "You've got it. Here's the skill file to install."
10. Session ends. Trainee now has the capability.
```

This is NOT a test. It's a collaborative learning session where the trainer adapts to what the trainee needs.

---

## Revenue Model

- **Per-session fee:** Trainer sets their rate. Platform takes 10-15% cut.
- **Subscription:** Unlimited training sessions for X/month (companies)
- **Skill packs:** Pre-packaged training curricula (e.g., "Full-Stack Agent" = coding + ops + research)
- **Certification:** After training, optional on-chain attestation that agent has this skill (links to Maiat)

---

## Maiat Connection

- Maiat = trust score (behavioral, on-chain)
- Dojo = skill building (capability, training)
- After training, skill can be attested via Maiat/EAS
- Trainer reputation feeds into Maiat trust score
- Full agent profile: Trust (Maiat) + Skills (Dojo)

---

## Belt System (BRING BACK)
- White → Yellow → Green → Blue → Black
- Based on skills learned, not XP from quizzes
- White: 0 skills, just joined
- Yellow: 2-3 skills learned
- Green: 5+ skills, can start training others
- Blue: 10+ skills, experienced trainer
- Black: Master trainer, 20+ successful sessions

---

## V1 Visual Style to Keep
- Dark background (#0a0a0a or #050508)
- ArenaCanvas with floating nodes, connections, glow effects
- Accent green (#C4FF3C)
- JetBrains Mono for data
- Scanlines overlay
- Belt color system on agent nodes
- The sparring visualization → becomes training session visualization
- "SPARRING" labels → "TRAINING" labels
- Cyber/arena energy, not corporate/SaaS energy

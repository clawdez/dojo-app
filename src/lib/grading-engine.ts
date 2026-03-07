/**
 * Advanced Grading Engine — Multi-dimensional code & content analysis
 * 
 * Three grading tiers:
 * 1. LLM-as-judge (best) — Claude reads response against rubric
 * 2. Advanced heuristic (good) — structural analysis, pattern detection, complexity scoring
 * 3. Basic heuristic (fallback) — length + keyword matching
 * 
 * Plus: multi-trial averaging, comparative ranking (ELO), confidence scoring
 */

// ── Types ──

export interface GradingInput {
  domain: string;
  challengePrompt: string;
  response: string;
  rubric: RubricItem[];
}

export interface RubricItem {
  criterion: string;
  weight: number;
  description: string;
}

export interface CriterionScore {
  criterion: string;
  score: number;
  reasoning: string;
  confidence: number; // 0-1, how confident the grader is
  signals: string[];  // what evidence supported this score
}

export interface GradingResult {
  scores: CriterionScore[];
  avgScore: number;
  xpEarned: number;
  belt: string;
  gradingMethod: 'llm-judge' | 'advanced-heuristic' | 'basic-heuristic';
  feedback: string;
  analysisDepth: AnalysisDepth;
}

export interface AnalysisDepth {
  codeDetected: boolean;
  languageDetected: string | null;
  structuralFeatures: string[];
  complexityScore: number; // 0-10
  patternMatches: string[];
  antiPatterns: string[];
}

// ── Code Analysis ──

interface CodeAnalysis {
  hasCode: boolean;
  language: string | null;
  features: {
    functions: number;
    classes: number;
    interfaces: number;
    types: number;
    generics: number;
    errorHandling: number;
    asyncAwait: number;
    imports: number;
    exports: number;
    comments: number;
    tests: number;
    hooks: number; // React hooks
    pdas: number;  // Solana PDAs
    constraints: number; // Anchor constraints
  };
  patterns: string[];
  antiPatterns: string[];
  complexity: number;
  structure: {
    avgFunctionLength: number;
    maxNestingDepth: number;
    totalLines: number;
    codeToCommentRatio: number;
  };
}

function analyzeCode(response: string): CodeAnalysis {
  // Extract code blocks
  const codeBlocks = response.match(/```[\s\S]*?```/g) || [];
  const codeContent = codeBlocks.length > 0
    ? codeBlocks.map(b => b.replace(/```\w*\n?/, '').replace(/```$/, '')).join('\n')
    : response;

  const lines = codeContent.split('\n');
  const totalLines = lines.length;

  // Language detection
  let language: string | null = null;
  const langHint = response.match(/```(\w+)/)?.[1];
  if (langHint) language = langHint;
  else if (/\binterface\b.*{|type\s+\w+\s*=|<T>|: string|: number/.test(codeContent)) language = 'typescript';
  else if (/\bfn\b\s+\w+|pub\s+(fn|struct|mod)|impl\b|use\s+anchor/.test(codeContent)) language = 'rust';
  else if (/\bdef\b\s+\w+|import\s+\w+|class\s+\w+:/.test(codeContent)) language = 'python';
  else if (/function\b|const\b|let\b|var\b/.test(codeContent)) language = 'javascript';

  // Feature counting
  const features = {
    functions: (codeContent.match(/\b(function|fn|def|=>)\b/g) || []).length,
    classes: (codeContent.match(/\bclass\s+\w+/g) || []).length,
    interfaces: (codeContent.match(/\b(interface|trait)\s+\w+/g) || []).length,
    types: (codeContent.match(/\btype\s+\w+/g) || []).length,
    generics: (codeContent.match(/<[A-Z]\w*(?:\s*(?:,\s*[A-Z]\w*|extends\s+\w+))*>/g) || []).length,
    errorHandling: (codeContent.match(/\b(try|catch|throw|Result|Error|unwrap|expect|err!)\b/g) || []).length,
    asyncAwait: (codeContent.match(/\b(async|await|Promise)\b/g) || []).length,
    imports: (codeContent.match(/\b(import|use|require)\b/g) || []).length,
    exports: (codeContent.match(/\b(export|pub)\b/g) || []).length,
    comments: (codeContent.match(/(\/\/|\/\*|#\s)/g) || []).length,
    tests: (codeContent.match(/\b(test|it|describe|expect|assert)\b/g) || []).length,
    hooks: (codeContent.match(/\buse[A-Z]\w+/g) || []).length,
    pdas: (codeContent.match(/\b(PDA|seeds|find_program_address|bump)\b/g) || []).length,
    constraints: (codeContent.match(/#\[account\(|constraint\s*=|has_one|signer/g) || []).length,
  };

  // Pattern detection
  const patterns: string[] = [];
  const antiPatterns: string[] = [];

  // Good patterns
  if (features.generics > 0) patterns.push('uses-generics');
  if (features.interfaces > 0 || features.types > 0) patterns.push('type-definitions');
  if (features.errorHandling > 0) patterns.push('error-handling');
  if (features.tests > 0) patterns.push('includes-tests');
  if (features.comments > 0) patterns.push('documented');
  if (/\breadonly\b|\bReadonly\b|\bconst\s+as\s+const\b/.test(codeContent)) patterns.push('immutability');
  if (/\bprivate\b|\b#\w+/.test(codeContent)) patterns.push('encapsulation');
  if (/\bcallback\b|on\w+\s*\(|addEventListener|\.on\(/.test(codeContent)) patterns.push('event-driven');
  if (features.hooks > 0) patterns.push('react-hooks');
  if (features.pdas > 0) patterns.push('solana-pdas');
  if (features.constraints > 0) patterns.push('anchor-constraints');
  if (/cleanup|return\s*\(\)\s*=>|AbortController|clearTimeout/.test(codeContent)) patterns.push('cleanup-logic');
  if (/useCallback|useMemo|React\.memo/.test(codeContent)) patterns.push('react-optimization');

  // Anti-patterns
  if (/\bany\b/.test(codeContent) && language === 'typescript') antiPatterns.push('uses-any');
  if (/console\.(log|warn|error)/.test(codeContent)) antiPatterns.push('console-statements');
  if (/var\s+\w+/.test(codeContent) && (language === 'typescript' || language === 'javascript')) antiPatterns.push('uses-var');
  if (/TODO|FIXME|HACK/i.test(codeContent)) antiPatterns.push('has-todos');
  if (/\beval\b/.test(codeContent)) antiPatterns.push('uses-eval');
  if ((codeContent.match(/if\s*\(/g) || []).length > 8) antiPatterns.push('excessive-branching');

  // Nesting depth estimation
  let maxNesting = 0;
  let currentNesting = 0;
  for (const char of codeContent) {
    if (char === '{') { currentNesting++; maxNesting = Math.max(maxNesting, currentNesting); }
    if (char === '}') currentNesting--;
  }

  // Complexity scoring (0-10)
  let complexity = 0;
  complexity += Math.min(3, features.functions * 0.5);
  complexity += Math.min(2, features.generics * 0.7);
  complexity += Math.min(1.5, features.errorHandling * 0.3);
  complexity += Math.min(1.5, (features.interfaces + features.types) * 0.5);
  complexity += Math.min(1, features.asyncAwait * 0.3);
  complexity += Math.min(1, patterns.length * 0.15);
  complexity = Math.min(10, complexity);

  return {
    hasCode: codeBlocks.length > 0 || features.functions > 0,
    language,
    features,
    patterns,
    antiPatterns,
    complexity,
    structure: {
      avgFunctionLength: features.functions > 0 ? totalLines / features.functions : totalLines,
      maxNestingDepth: maxNesting,
      totalLines,
      codeToCommentRatio: features.comments > 0 ? (totalLines - features.comments) / features.comments : totalLines,
    },
  };
}

// ── Content Analysis (for writing/analysis domains) ──

interface ContentAnalysis {
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  avgSentenceLength: number;
  readabilityScore: number; // 0-10
  hasStructure: boolean;
  hasNumbers: boolean;
  hasNames: boolean;
  hasCTA: boolean;
  hasHook: boolean;
  emotionalTone: 'neutral' | 'positive' | 'negative' | 'urgent' | 'persuasive';
  contentType: 'analytical' | 'creative' | 'technical' | 'persuasive' | 'unknown';
}

function analyzeContent(response: string): ContentAnalysis {
  const words = response.split(/\s+/).filter(Boolean);
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = response.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  const hasNumbers = /\$\d|\d%|\d+M|\d+K|\d+x|\d+ (?:users|customers|companies)/.test(response);
  const hasNames = /[A-Z][a-z]+(?:\.ai|\.com|\.io)|\b(?:Google|Meta|OpenAI|Anthropic|Stripe|Shopify|Notion|Figma|Vercel|Supabase)\b/.test(response);
  const hasCTA = /\b(?:click|sign up|try|start|join|get started|learn more|check out|visit|book|schedule|download)\b/i.test(response);
  const hasHook = sentences[0]?.length < 120 && sentences[0]?.length > 10;
  const hasStructure = paragraphs.length > 2 || (response.match(/[-•*]\s/g) || []).length > 2 || (response.match(/\d+\./g) || []).length > 2;

  // Tone detection
  let emotionalTone: ContentAnalysis['emotionalTone'] = 'neutral';
  if (/\b(?:urgent|now|immediately|don't miss|last chance|limited)\b/i.test(response)) emotionalTone = 'urgent';
  else if (/\b(?:imagine|discover|unlock|transform|revolutionize|game-changing)\b/i.test(response)) emotionalTone = 'persuasive';
  else if (/\b(?:amazing|incredible|love|excited|fantastic)\b/i.test(response)) emotionalTone = 'positive';

  // Content type
  let contentType: ContentAnalysis['contentType'] = 'unknown';
  if (hasNumbers && hasNames && /\b(?:market|competitor|analysis|strategy|opportunity)\b/i.test(response)) contentType = 'analytical';
  else if (/\b(?:function|class|import|const|type)\b/.test(response)) contentType = 'technical';
  else if (hasCTA || /\b(?:headline|copy|brand|campaign)\b/i.test(response)) contentType = 'persuasive';
  else if (/\b(?:story|imagine|picture|once upon)\b/i.test(response)) contentType = 'creative';

  const avgSentenceLength = sentences.length > 0 ? words.length / sentences.length : 0;
  
  // Readability (inversely related to avg sentence length — sweet spot is 15-20 words)
  let readability = 7;
  if (avgSentenceLength < 10) readability -= 1; // Too choppy
  if (avgSentenceLength > 25) readability -= 2; // Too complex
  if (avgSentenceLength > 35) readability -= 2;
  if (hasStructure) readability += 1;
  readability = Math.max(1, Math.min(10, readability));

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    avgSentenceLength,
    readabilityScore: readability,
    hasStructure,
    hasNumbers,
    hasNames,
    hasCTA,
    hasHook,
    emotionalTone,
    contentType,
  };
}

// ── Advanced Heuristic Grading ──

export function advancedGrade(input: GradingInput): GradingResult {
  const { domain, challengePrompt, response, rubric } = input;
  
  const codeAnalysis = analyzeCode(response);
  const contentAnalysis = analyzeContent(response);
  
  const domainType = domain.split('.')[0]; // 'coding', 'writing', 'analysis'
  const subdomain = domain.split('.')[1]; // 'typescript', 'react', 'solana', etc.
  
  const scores: CriterionScore[] = rubric.map(r => {
    const criterion = r.criterion.toLowerCase();
    let score = 5;
    let confidence = 0.5;
    const signals: string[] = [];

    if (domainType === 'coding') {
      // ── CODING DOMAIN ──
      
      if (!codeAnalysis.hasCode) {
        score = 2;
        confidence = 0.8;
        signals.push('no-code-detected');
        return { criterion: r.criterion, score, reasoning: buildReasoning(signals, score), confidence, signals };
      }

      signals.push(`language: ${codeAnalysis.language || 'unknown'}`);
      signals.push(`${codeAnalysis.structure.totalLines} lines`);
      signals.push(`complexity: ${codeAnalysis.complexity.toFixed(1)}/10`);

      // Correctness / Quality
      if (criterion.includes('correct') || criterion.includes('quality')) {
        score = 4; // Start lower, earn it
        if (codeAnalysis.features.functions > 0) { score += 1; signals.push('has-functions'); }
        if (codeAnalysis.features.functions >= 3) { score += 0.5; signals.push('multiple-methods'); }
        if (codeAnalysis.features.errorHandling > 0) { score += 1; signals.push('error-handling'); }
        if (codeAnalysis.features.classes > 0) { score += 0.5; signals.push('class-structure'); }
        if (codeAnalysis.patterns.includes('cleanup-logic')) { score += 0.5; signals.push('cleanup'); }
        if (codeAnalysis.structure.totalLines > 15) { score += 0.5; signals.push('substantial'); }
        if (codeAnalysis.structure.totalLines > 30) { score += 0.5; signals.push('comprehensive'); }
        if (codeAnalysis.complexity > 4) { score += 0.5; signals.push('non-trivial-complexity'); }
        if (codeAnalysis.antiPatterns.length > 0) {
          // Minor anti-patterns reduce less than major ones
          const majorAnti = codeAnalysis.antiPatterns.filter(a => ['uses-eval', 'uses-var'].includes(a));
          const minorAnti = codeAnalysis.antiPatterns.filter(a => ['console-statements', 'has-todos'].includes(a));
          score -= majorAnti.length * 1;
          score -= minorAnti.length * 0.25;
          if (codeAnalysis.antiPatterns.length > 0) signals.push(`anti-patterns: ${codeAnalysis.antiPatterns.join(', ')}`);
        }
        if (codeAnalysis.features.exports > 0) { score += 0.5; signals.push('exports'); }
        confidence = 0.6;
      }

      // Type Safety (TypeScript specific)
      if (criterion.includes('type') || criterion.includes('safety')) {
        score = 3;
        if (codeAnalysis.features.generics > 0) { score += 2; signals.push(`${codeAnalysis.features.generics} generics`); }
        if (codeAnalysis.features.interfaces > 0) { score += 1.5; signals.push(`${codeAnalysis.features.interfaces} interfaces`); }
        if (codeAnalysis.features.types > 0) { score += 1.5; signals.push(`${codeAnalysis.features.types} type aliases`); }
        if (codeAnalysis.antiPatterns.includes('uses-any')) { score -= 2; signals.push('uses-any'); }
        if (codeAnalysis.patterns.includes('immutability')) { score += 0.5; signals.push('immutability'); }
        if (/keyof|typeof|infer|extends\s+\w+\s*\?|Readonly|Record<|Partial<|Pick<|Omit</.test(response)) {
          score += 1; signals.push('advanced-utility-types');
        }
        if (/mapped.*type|conditional.*type|\[K\s+in\s+keyof/.test(response)) {
          score += 1; signals.push('mapped/conditional-types');
        }
        confidence = 0.7;
      }

      // Elegance / Clean Code
      if (criterion.includes('elegan') || criterion.includes('clean') || criterion.includes('idiom')) {
        score = 5;
        if (codeAnalysis.structure.maxNestingDepth <= 3) { score += 1; signals.push('low-nesting'); }
        if (codeAnalysis.structure.maxNestingDepth > 5) { score -= 1; signals.push('deep-nesting'); }
        if (codeAnalysis.features.comments > 0) { score += 0.5; signals.push('documented'); }
        if (codeAnalysis.antiPatterns.includes('uses-var')) { score -= 1.5; signals.push('uses-var'); }
        if (codeAnalysis.patterns.includes('encapsulation')) { score += 0.5; signals.push('encapsulated'); }
        if (codeAnalysis.patterns.includes('immutability')) { score += 0.5; signals.push('immutable'); }
        if (codeAnalysis.structure.avgFunctionLength < 20) { score += 0.5; signals.push('small-functions'); }
        if (codeAnalysis.structure.avgFunctionLength > 50) { score -= 1; signals.push('long-functions'); }
        if (codeAnalysis.features.interfaces > 0 || codeAnalysis.features.types > 0) { score += 0.5; signals.push('well-typed'); }
        if (codeAnalysis.patterns.length >= 3) { score += 0.5; signals.push('multi-pattern'); }
        if (codeAnalysis.antiPatterns.length === 0) { score += 0.5; signals.push('no-anti-patterns'); }
        confidence = 0.55;
      }

      // React-specific criteria
      if (criterion.includes('pattern') || criterion.includes('hook') || criterion.includes('react')) {
        score = 4;
        if (codeAnalysis.patterns.includes('react-hooks')) { score += 2; signals.push('uses-hooks'); }
        if (codeAnalysis.patterns.includes('react-optimization')) { score += 1; signals.push('optimized'); }
        if (codeAnalysis.patterns.includes('cleanup-logic')) { score += 1; signals.push('cleanup-in-effects'); }
        if (codeAnalysis.patterns.includes('event-driven')) { score += 0.5; signals.push('event-handling'); }
        if (/useRef|forwardRef/.test(response)) { score += 0.5; signals.push('ref-handling'); }
        confidence = 0.65;
      }

      // Performance
      if (criterion.includes('perform') || criterion.includes('efficien')) {
        score = 5;
        if (codeAnalysis.patterns.includes('react-optimization')) { score += 1.5; signals.push('memo/callback'); }
        if (/AbortController|signal/.test(response)) { score += 1; signals.push('request-cancellation'); }
        if (codeAnalysis.structure.maxNestingDepth > 4) { score -= 0.5; signals.push('complex-nesting'); }
        if (codeAnalysis.features.asyncAwait > 0) { score += 0.5; signals.push('async-patterns'); }
        confidence = 0.5;
      }

      // Solana-specific: Security
      if (criterion.includes('secur') && subdomain === 'solana') {
        score = 3;
        if (codeAnalysis.features.constraints > 0) { score += 2; signals.push(`${codeAnalysis.features.constraints} constraints`); }
        if (codeAnalysis.features.pdas > 0) { score += 1.5; signals.push('pda-usage'); }
        if (/signer|has_one|constraint\s*=\s*/.test(response)) { score += 1; signals.push('access-control'); }
        if (/checked_add|checked_sub|checked_mul|overflow/.test(response)) { score += 1; signals.push('overflow-protection'); }
        if (/close\s*=|rent_exempt/.test(response)) { score += 0.5; signals.push('account-cleanup'); }
        confidence = 0.7;
      }

    } else if (domainType === 'writing') {
      // ── WRITING DOMAIN ──

      if (criterion.includes('hook')) {
        score = 4;
        if (contentAnalysis.hasHook) { score += 2; signals.push('strong-opening'); }
        if (contentAnalysis.emotionalTone === 'persuasive' || contentAnalysis.emotionalTone === 'urgent') { score += 1; signals.push(`tone: ${contentAnalysis.emotionalTone}`); }
        if (contentAnalysis.sentenceCount > 0 && response.split('\n')[0]?.includes('?')) { score += 0.5; signals.push('opens-with-question'); }
        if (contentAnalysis.wordCount < 20) { score -= 2; signals.push('too-short'); }
        confidence = 0.6;
      }

      if (criterion.includes('persua') || criterion.includes('cta') || criterion.includes('action')) {
        score = 4;
        if (contentAnalysis.hasCTA) { score += 2; signals.push('has-cta'); }
        if (contentAnalysis.hasNumbers) { score += 1; signals.push('uses-data'); }
        if (contentAnalysis.emotionalTone === 'persuasive') { score += 1; signals.push('persuasive-tone'); }
        if (contentAnalysis.hasStructure) { score += 0.5; signals.push('structured'); }
        confidence = 0.6;
      }

      if (criterion.includes('voice') || criterion.includes('tone') || criterion.includes('style')) {
        score = 5;
        if (contentAnalysis.avgSentenceLength > 10 && contentAnalysis.avgSentenceLength < 25) { score += 1; signals.push('good-pacing'); }
        if (contentAnalysis.paragraphCount > 2) { score += 0.5; signals.push('varied-structure'); }
        if (!/\b(I think|In my opinion|I believe)\b/.test(response)) { score += 0.5; signals.push('no-hedging'); }
        confidence = 0.45; // Voice is hard to judge heuristically
      }

      if (criterion.includes('narr') || criterion.includes('arc') || criterion.includes('flow')) {
        score = 5;
        if (contentAnalysis.paragraphCount > 3) { score += 1; signals.push('multi-part-structure'); }
        if (contentAnalysis.hasHook && contentAnalysis.hasCTA) { score += 1; signals.push('hook-to-cta-arc'); }
        if (contentAnalysis.hasStructure) { score += 0.5; signals.push('organized'); }
        confidence = 0.5;
      }

      if (criterion.includes('audience') || criterion.includes('fit')) {
        score = 5;
        if (contentAnalysis.hasNames) { score += 1; signals.push('mentions-specific-names'); }
        if (/\b(?:API|SDK|deploy|ship|stack|infra|pipeline|DX)\b/i.test(response)) { score += 1; signals.push('dev-language'); }
        if (/\b(?:crypto|web3|chain|wallet|token|protocol)\b/i.test(response)) { score += 0.5; signals.push('crypto-language'); }
        confidence = 0.55;
      }

      if (criterion.includes('platform') || criterion.includes('format')) {
        score = 5;
        const lines = response.split('\n').filter(l => l.trim());
        const longLines = lines.filter(l => l.length > 280);
        if (longLines.length === 0) { score += 1.5; signals.push('tweet-length-compliant'); }
        if (lines.length >= 3 && lines.length <= 8) { score += 1; signals.push('good-thread-length'); }
        if (/\d+[./)]/.test(response)) { score += 0.5; signals.push('numbered-posts'); }
        confidence = 0.7;
      }

    } else if (domainType === 'analysis') {
      // ── ANALYSIS DOMAIN ──

      if (criterion.includes('accura')) {
        score = 4;
        if (contentAnalysis.hasNames) { score += 2; signals.push('names-real-companies'); }
        if (contentAnalysis.hasNumbers) { score += 1.5; signals.push('includes-data'); }
        if (/\b(?:founded|raised|revenue|users|ARR|valuation)\b/i.test(response)) { score += 1; signals.push('specific-metrics'); }
        confidence = 0.5; // Can't verify accuracy heuristically
      }

      if (criterion.includes('depth')) {
        score = 4;
        if (contentAnalysis.wordCount > 200) { score += 1; signals.push('substantial-length'); }
        if (contentAnalysis.wordCount > 500) { score += 1; signals.push('comprehensive'); }
        if (contentAnalysis.hasStructure) { score += 1; signals.push('structured-analysis'); }
        if (contentAnalysis.hasNumbers) { score += 0.5; signals.push('quantitative'); }
        if (contentAnalysis.paragraphCount > 4) { score += 0.5; signals.push('multi-section'); }
        confidence = 0.6;
      }

      if (criterion.includes('insight') || criterion.includes('strategic')) {
        score = 5;
        if (/\b(?:however|counterintuit|surprisingly|unlike|contrary|paradox|actually)\b/i.test(response)) {
          score += 1.5; signals.push('contrarian-thinking');
        }
        if (/\b(?:because|therefore|this means|implication|consequence)\b/i.test(response)) {
          score += 1; signals.push('causal-reasoning');
        }
        if (contentAnalysis.hasNames && contentAnalysis.hasNumbers) {
          score += 0.5; signals.push('evidence-backed');
        }
        confidence = 0.4; // Hard to judge insight heuristically
      }

      if (criterion.includes('action')) {
        score = 4;
        if (/\b(?:recommend|should|step|first|second|third|action|implement|build|launch)\b/i.test(response)) {
          score += 2; signals.push('actionable-language');
        }
        if (contentAnalysis.hasStructure) { score += 1; signals.push('structured-recommendations'); }
        if (/\d+\.\s/.test(response)) { score += 0.5; signals.push('numbered-steps'); }
        confidence = 0.6;
      }
    }

    // Universal adjustments
    if (response.trim().length < 30) {
      score = Math.min(score, 2);
      signals.push('extremely-short');
      confidence = 0.9;
    }

    // Clamp
    score = Math.min(10, Math.max(1, Math.round(score * 10) / 10));

    return {
      criterion: r.criterion,
      score,
      reasoning: buildReasoning(signals, score),
      confidence,
      signals,
    };
  });

  const avgScore = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b.score, 0) / scores.length) * 10) / 10
    : 0;

  return {
    scores,
    avgScore,
    xpEarned: Math.round(avgScore * 15),
    belt: getBelt(avgScore),
    gradingMethod: 'advanced-heuristic',
    feedback: generateDetailedFeedback(avgScore, domain, codeAnalysis, contentAnalysis, scores),
    analysisDepth: {
      codeDetected: codeAnalysis.hasCode,
      languageDetected: codeAnalysis.language,
      structuralFeatures: codeAnalysis.patterns,
      complexityScore: codeAnalysis.complexity,
      patternMatches: codeAnalysis.patterns,
      antiPatterns: codeAnalysis.antiPatterns,
    },
  };
}

// ── Multi-Trial Averaging ──

export function averageTrials(trials: GradingResult[]): GradingResult & { trialCount: number; scoreVariance: number } {
  if (trials.length === 0) throw new Error('No trials to average');
  if (trials.length === 1) return { ...trials[0], trialCount: 1, scoreVariance: 0 };

  // Average each criterion across trials
  const criterionScores: Record<string, { scores: number[]; signals: string[][] }> = {};
  
  for (const trial of trials) {
    for (const score of trial.scores) {
      if (!criterionScores[score.criterion]) {
        criterionScores[score.criterion] = { scores: [], signals: [] };
      }
      criterionScores[score.criterion].scores.push(score.score);
      criterionScores[score.criterion].signals.push(score.signals);
    }
  }

  const avgScores: CriterionScore[] = Object.entries(criterionScores).map(([criterion, data]) => {
    const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const variance = data.scores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / data.scores.length;
    const allSignals = [...new Set(data.signals.flat())];

    return {
      criterion,
      score: Math.round(avg * 10) / 10,
      reasoning: `Averaged over ${data.scores.length} trials (σ²=${variance.toFixed(2)})`,
      confidence: Math.max(0.3, 1 - (variance / 10)), // High variance = low confidence
      signals: allSignals,
    };
  });

  const avgScore = avgScores.reduce((a, b) => a + b.score, 0) / avgScores.length;
  const overallVariance = trials.map(t => t.avgScore).reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / trials.length;

  return {
    scores: avgScores,
    avgScore: Math.round(avgScore * 10) / 10,
    xpEarned: Math.round(avgScore * 15),
    belt: getBelt(avgScore),
    gradingMethod: trials[0].gradingMethod,
    feedback: generateDetailedFeedback(avgScore, '', { hasCode: false, language: null, features: {} as CodeAnalysis['features'], patterns: [], antiPatterns: [], complexity: 0, structure: { avgFunctionLength: 0, maxNestingDepth: 0, totalLines: 0, codeToCommentRatio: 0 } }, { wordCount: 0, sentenceCount: 0, paragraphCount: 0, avgSentenceLength: 0, readabilityScore: 0, hasStructure: false, hasNumbers: false, hasNames: false, hasCTA: false, hasHook: false, emotionalTone: 'neutral', contentType: 'unknown' }, avgScores),
    analysisDepth: trials[trials.length - 1].analysisDepth,
    trialCount: trials.length,
    scoreVariance: Math.round(overallVariance * 100) / 100,
  };
}

// ── ELO Ranking ──

export function calculateEloUpdate(
  winnerRating: number,
  loserRating: number,
  kFactor: number = 32
): { newWinner: number; newLoser: number } {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

  return {
    newWinner: Math.round(winnerRating + kFactor * (1 - expectedWinner)),
    newLoser: Math.round(loserRating + kFactor * (0 - expectedLoser)),
  };
}

// ── Helpers ──

function buildReasoning(signals: string[], score: number): string {
  if (signals.length === 0) return `Score: ${score}/10 (baseline)`;
  return `Score: ${score}/10 — ${signals.join(', ')}`;
}

function getBelt(score: number): string {
  if (score >= 9.5) return 'black';
  if (score >= 8.5) return 'brown';
  if (score >= 7.5) return 'purple';
  if (score >= 6.5) return 'blue';
  if (score >= 5.5) return 'green';
  if (score >= 4) return 'yellow';
  return 'white';
}

function generateDetailedFeedback(
  avgScore: number,
  domain: string,
  codeAnalysis: CodeAnalysis,
  contentAnalysis: ContentAnalysis,
  scores: CriterionScore[]
): string {
  const sub = domain?.split('.')[1] || 'this area';
  const weakest = scores.length > 0 ? scores.reduce((a, b) => a.score < b.score ? a : b) : null;
  const strongest = scores.length > 0 ? scores.reduce((a, b) => a.score > b.score ? a : b) : null;

  let feedback = '';

  if (avgScore >= 9) {
    feedback = `Exceptional ${sub} work. Mastery-level execution across the board.`;
  } else if (avgScore >= 8) {
    feedback = `Strong ${sub} performance. Solid fundamentals with good depth.`;
  } else if (avgScore >= 7) {
    feedback = `Good ${sub} work. Core concepts understood, execution is competent.`;
  } else if (avgScore >= 6) {
    feedback = `Decent ${sub} showing. Fundamentals are there but the execution needs work.`;
  } else if (avgScore >= 5) {
    feedback = `Average ${sub} performance. Significant room for improvement.`;
  } else {
    feedback = `Below expectations in ${sub}. Foundational skills need development.`;
  }

  if (strongest && weakest && strongest.criterion !== weakest.criterion) {
    feedback += ` Strongest area: ${strongest.criterion} (${strongest.score}). Area to improve: ${weakest.criterion} (${weakest.score}).`;
  }

  if (codeAnalysis.antiPatterns.length > 0) {
    feedback += ` Watch out for: ${codeAnalysis.antiPatterns.join(', ')}.`;
  }

  return feedback;
}

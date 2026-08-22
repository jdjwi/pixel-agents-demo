import type { PracticeProblem, RunEvent, RunEventType, SolverModel } from './types.js';

const promptsByModel: Record<SolverModel, string> = {
  quick:
    'Solve the assigned problem directly. Choose the shortest verifiable approach, check the required output format, and return the fixed solution without rewriting the user prompt.',
  deep:
    'Solve the assigned problem with explicit reasoning. Verify constraints, edge cases, and the required output format, then return the fixed solution without rewriting the user prompt.',
};

export const practiceProblems: PracticeProblem[] = [
  {
    id: 'coding-upc',
    sourceId: 'coding-visible-0043',
    category: 'coding',
    difficulty: 'easy',
    solver: 'quick',
    title: '?UPC',
    prompt:
      'You are given a string S. Here, the first character of S is an uppercase English letter, and the second and subsequent characters are lowercase English letters. Print the string formed by concatenating the first character of S and UPC in this order.',
    aliases: ['?upc', 'kyoto', 'tohoku', 'first character of s and upc'],
    modelPrompt: promptsByModel.quick,
    classification: 'Coding · Easy · Direct string transformation',
    plannerPlan: [
      'Read the string and preserve the required output contract.',
      'Take only the first character.',
      'Append the literal string UPC and print once.',
    ],
    solutionSteps: [
      'Read S from standard input.',
      'Select S[0].',
      'Print S[0] + "UPC".',
    ],
    finalAnswer: 'solution.py\n\ns = input().strip()\nprint(s[0] + "UPC")',
    plannerTokenTotal: 96,
    solverTokenTotal: 184,
    confidence: 99,
  },
  {
    id: 'coding-heavy-snake',
    sourceId: 'coding-visible-0044',
    category: 'coding',
    difficulty: 'medium',
    solver: 'quick',
    title: 'Heavy Snake',
    prompt:
      "There are N snakes. Initially, the thickness of the i-th snake is T_i, and its length is L_i. The weight of a snake is defined as the product of its thickness and length. For each integer k satisfying 1 ≤ k ≤ D, find the weight of the heaviest snake when every snake's length has increased by k.",
    aliases: ['heavy snake', 'there are n snakes', 'heaviest snake', 't_i', 'l_i'],
    modelPrompt: promptsByModel.quick,
    classification: 'Coding · Medium · Bounded exhaustive search',
    plannerPlan: [
      'Use the given N,D≤100 bounds to avoid unnecessary optimization.',
      'Evaluate every snake for each k from 1 through D.',
      'Emit exactly one maximum weight per line.',
    ],
    solutionSteps: [
      'Store every pair (T_i, L_i).',
      'For each k from 1 to D, compute T_i × (L_i + k) for every snake.',
      'Print the maximum for that k.',
      'The time complexity is O(ND).',
    ],
    finalAnswer:
      'solution.py\n\nN, D = map(int, input().split())\nsnakes = [tuple(map(int, input().split())) for _ in range(N)]\nfor k in range(1, D + 1):\n    print(max(t * (length + k) for t, length in snakes))',
    plannerTokenTotal: 142,
    solverTokenTotal: 426,
    confidence: 98,
  },
  {
    id: 'coding-snake-numbers',
    sourceId: 'coding-visible-0042',
    category: 'coding',
    difficulty: 'hard',
    solver: 'deep',
    title: 'Snake Numbers',
    prompt:
      'A positive integer not less than 10 whose top digit (the most significant digit) in decimal representation is strictly larger than every other digit in that number is called a Snake number. Find how many Snake numbers exist between L and R, inclusive. Constraints: 10 ≤ L ≤ R ≤ 10^18.',
    aliases: ['snake numbers', 'snake number', 'most significant digit', '10^18'],
    modelPrompt: promptsByModel.deep,
    classification: 'Coding · Hard · Digit DP / prefix counting',
    plannerPlan: [
      'Transform the inclusive range query into count(R) − count(L−1).',
      'Count all valid shorter lengths by fixing the leading digit.',
      'Count the equal-length prefix cases without enumerating up to 10^18.',
      'Verify termination when a digit violates the leading-digit bound.',
    ],
    solutionSteps: [
      'Define count(N) as the number of Snake numbers not exceeding N.',
      'For every shorter length and leading digit d, add d^(length−1).',
      'For the same length as N, process the remaining digits from left to right.',
      'At each position, add the completions for allowed digits smaller than the current digit.',
      'Stop when the current digit is at least the leading digit; otherwise include N itself.',
      'Return count(R) − count(L−1).',
    ],
    finalAnswer:
      'solution.py\n\ndef count(n):\n    if n < 10:\n        return 0\n    s = str(n)\n    total = sum(sum(d ** (length - 1) for d in range(1, 10)) for length in range(2, len(s)))\n    lead = int(s[0])\n    total += sum(d ** (len(s) - 1) for d in range(1, lead))\n    for i in range(1, len(s)):\n        current = int(s[i])\n        total += min(current, lead) * lead ** (len(s) - i - 1)\n        if current >= lead:\n            break\n    else:\n        total += 1\n    return total\n\nL, R = map(int, input().split())\nprint(count(R) - count(L - 1))',
    plannerTokenTotal: 248,
    solverTokenTotal: 1180,
    confidence: 94,
  },
  {
    id: 'math-domain',
    sourceId: 'math-visible-0001',
    category: 'math',
    difficulty: 'easy',
    solver: 'quick',
    title: 'Square-root Domain',
    prompt:
      'What is the smallest real number $x$ in the domain of the function $$g(x) = \\sqrt{(x-3)^2-(x-8)^2}~?$$',
    aliases: ['g(x)', 'x-3', 'smallest real number', 'domain of the function'],
    modelPrompt: promptsByModel.quick,
    classification: 'Math · Easy · Radical domain',
    plannerPlan: [
      'Require the radicand to be nonnegative.',
      'Use the difference-of-squares identity.',
      'Solve the resulting linear inequality and take its boundary.',
    ],
    solutionSteps: [
      'The radicand must satisfy (x−3)²−(x−8)² ≥ 0.',
      '(x−3)²−(x−8)² = 5(2x−11) = 10x−55.',
      'Thus x ≥ 11/2, so the smallest value is 11/2.',
    ],
    finalAnswer: 'FINAL ANSWER: \\boxed{\\frac{11}{2}}',
    plannerTokenTotal: 104,
    solverTokenTotal: 216,
    confidence: 99,
  },
  {
    id: 'math-coin-game',
    sourceId: 'math-visible-0021',
    category: 'math',
    difficulty: 'medium',
    solver: 'quick',
    title: 'Alice & Bob Coin Game',
    prompt:
      "Alice and Bob are playing a game. Alice starts first. On Alice's turn, she flips a coin. If she gets a heads, she wins. If not, it becomes Bob's turn. On Bob's turn, he flips a coin. If he gets a tails, he wins. If not, it becomes Alice's turn. What is the probability that Alice wins the game?",
    aliases: ['alice and bob', 'alice starts first', 'probability that alice wins'],
    modelPrompt: promptsByModel.quick,
    classification: 'Math · Medium · Recurring probability',
    plannerPlan: [
      'Represent Alice’s eventual win probability with one variable.',
      'Separate an immediate win from a full failed round.',
      'Solve the resulting recurrence.',
    ],
    solutionSteps: [
      'Let p be the probability that Alice eventually wins.',
      'Alice wins immediately with probability 1/2.',
      'Both players fail with probability 1/4, returning to the original state.',
      'Therefore p = 1/2 + p/4, so p = 2/3.',
    ],
    finalAnswer: 'FINAL ANSWER: \\boxed{\\frac{2}{3}}',
    plannerTokenTotal: 128,
    solverTokenTotal: 398,
    confidence: 98,
  },
  {
    id: 'math-token-game',
    sourceId: 'math-visible-0143',
    category: 'math',
    difficulty: 'hard',
    solver: 'deep',
    title: 'Token Strategy Game',
    prompt:
      'Alice and Bob play the following game. A stack of $n$ tokens lies before them. The players take turns with Alice going first. On each turn, the player removes either $1$ token or $4$ tokens from the stack. Whoever removes the last token wins. Find the number of positive integers $n$ less than or equal to $2024$ for which there exists a strategy for Bob that guarantees that Bob will win the game regardless of Alice\'s play.',
    aliases: ['stack of n tokens', '1 token or 4 tokens', 'less than or equal to 2024'],
    modelPrompt: promptsByModel.deep,
    classification: 'Math · Hard · Combinatorial game states',
    plannerPlan: [
      'Classify small positions as winning or losing for the player to move.',
      'Prove the state pattern repeats modulo 5.',
      'Count the losing starting positions through 2024.',
    ],
    solutionSteps: [
      'A position is losing if every legal move reaches a winning position.',
      'The losing positions begin at 0 and 2; the pattern repeats every 5.',
      'Thus Alice loses exactly when n ≡ 0 or 2 (mod 5).',
      'There are 404 positive multiples of 5 up to 2024 and 405 values congruent to 2.',
      'The required total is 404 + 405 = 809.',
    ],
    finalAnswer: 'FINAL ANSWER: \\boxed{809}',
    plannerTokenTotal: 236,
    solverTokenTotal: 972,
    confidence: 96,
  },
  {
    id: 'general-dividend',
    sourceId: 'generic-visible-mmlu-pro-120',
    category: 'general',
    difficulty: 'easy',
    solver: 'quick',
    title: 'Annual Stock Income',
    prompt:
      'Mr. Torres owns 350 shares of Krescostock paying a quarterly dividend of $1.20 per share, with an extra year-end dividend of $.30 per share. What was his total income from the stock for the year? Options: A. $1,920 B. $1,710 C. $1,470 D. $1,680 E. $1,595 F. $1,260 G. $1,890 H. $1,785 I. $2,000 J. $1,650',
    aliases: ['mr torres', 'krescostock', '350 shares', 'quarterly dividend'],
    modelPrompt: promptsByModel.quick,
    classification: 'General · Easy · Arithmetic multiple choice',
    plannerPlan: [
      'Convert the quarterly dividend to an annual per-share amount.',
      'Add the year-end dividend.',
      'Multiply by the share count and match the option.',
    ],
    solutionSteps: [
      'The regular annual dividend per share is 4 × $1.20 = $4.80.',
      'Including the extra dividend gives $5.10 per share.',
      '350 × $5.10 = $1,785, which is option H.',
    ],
    finalAnswer: 'ANSWER: H',
    plannerTokenTotal: 102,
    solverTokenTotal: 204,
    confidence: 99,
  },
  {
    id: 'general-find-name',
    sourceId: 'generic-visible-mmlu-pro-10478',
    category: 'general',
    difficulty: 'medium',
    solver: 'quick',
    title: 'FindName Counterexample',
    prompt:
      'The procedure FindName sets foundIndex to index when name = targetName, but sets foundIndex to 0 in the ELSE branch on every later mismatch. Which call demonstrates that it does NOT work as intended? Option G is FindName (["Andrea", "Ben", "Chris"], "Ben").',
    aliases: ['findname', 'foundindex', 'andrea', 'ben', 'chris'],
    modelPrompt: promptsByModel.quick,
    classification: 'General · Medium · Pseudocode counterexample',
    plannerPlan: [
      'Identify the state that is incorrectly overwritten.',
      'Choose a call where the target is found before the final element.',
      'Trace the remaining iteration to verify the wrong output.',
    ],
    solutionSteps: [
      'A match can be erased by any later nonmatching name.',
      'In option G, Ben is found at index 2.',
      'The later Chris iteration resets foundIndex to 0.',
      'The procedure displays 0 instead of 2, so G is the counterexample.',
    ],
    finalAnswer: 'ANSWER: G',
    plannerTokenTotal: 148,
    solverTokenTotal: 462,
    confidence: 98,
  },
  {
    id: 'general-erasmus',
    sourceId: 'generic-visible-mmlu-pro-4691',
    category: 'general',
    difficulty: 'hard',
    solver: 'deep',
    title: 'Erasmus and Humanism',
    prompt:
      "According to Huizinga, Erasmus's legacy was more significant than that of earlier humanists because: H. he made the classic spirit more accessible by teaching it; I. he valued educating the masses more than his predecessors had; J. he wrote in a language that was understandable to the masses, unlike his predecessors.",
    aliases: ['huizinga', 'erasmus', 'classic spirit', 'earlier humanists'],
    modelPrompt: promptsByModel.deep,
    classification: 'General · Hard · Evidence-based reading',
    plannerPlan: [
      'Identify Huizinga’s explicit contrast between Erasmus and earlier humanists.',
      'Eliminate choices contradicted by the passage’s statement about Latin.',
      'Select the option that states the described legacy rather than a motive.',
    ],
    solutionSteps: [
      'The passage says earlier humanists had monopolized classical culture.',
      'Erasmus spread the classical spirit to a wider educated circle through teaching.',
      'Option J conflicts with the statement that he wrote in Latin.',
      'Option H directly states the legacy described in the passage.',
    ],
    finalAnswer: 'ANSWER: H',
    plannerTokenTotal: 224,
    solverTokenTotal: 854,
    confidence: 95,
  },
];

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

export function matchPracticeProblem(input: string): PracticeProblem | null {
  const normalized = normalize(input);
  if (!normalized) return null;
  let best: { problem: PracticeProblem; score: number } | null = null;
  for (const problem of practiceProblems) {
    const needles = [problem.sourceId, problem.title, ...problem.aliases].map(normalize);
    const score = needles.reduce(
      (total, needle) => total + (needle && normalized.includes(needle) ? needle.length : 0),
      0,
    );
    if (!best || score > best.score) best = { problem, score };
  }
  return best && best.score > 0 ? best.problem : null;
}

export function buildPracticeEvents(problem: PracticeProblem): RunEvent[] {
  const runId = `demo-run-${problem.id}`;
  const artifactId = `problem-document-${problem.id}`;
  let index = 0;
  const event = (
    timestampMs: number,
    type: RunEventType,
    summary: string,
    extra: Partial<RunEvent> = {},
  ): RunEvent => ({
    eventId: `${problem.id}-event-${(++index).toString().padStart(2, '0')}`,
    runId,
    scenarioId: problem.id,
    timestampMs,
    type,
    artifactId,
    summary,
    ...extra,
  });

  const events: RunEvent[] = [
    event(0, 'run.created', 'New run created.', { actorId: 'user' }),
    event(150, 'problem.submitted', 'Original prompt received unchanged.', { actorId: 'user' }),
    event(450, 'composer.hidden', 'Input closed.', { actorId: 'user' }),
    event(750, 'printer.started', 'Printing the original prompt.', { actorId: 'printer' }),
    event(1400, 'document.printed', 'Prompt document printed.', { actorId: 'printer' }),
    event(1900, 'planner.spawned', 'Planner received the prompt.', { actorId: 'planner' }),
    event(2450, 'planner.document.picked', 'Planner picked up the prompt document.', { actorId: 'planner' }),
    event(2900, 'planner.classification.started', 'Planner is analyzing type and difficulty.', { actorId: 'planner' }),
    event(3500, 'planner.classification.completed', problem.classification, {
      actorId: 'planner',
      metadata: { classification: problem.classification, difficulty: problem.difficulty },
    }),
    event(3900, 'planner.plan.started', 'Planner is building the solution plan.', { actorId: 'planner' }),
  ];

  // A step remains on screen long enough to be read before the next one. The
  // solver timeline starts only after Planner has completed its handoff.
  const plannerStepDuration = 1800;
  const plannerFirstStepTimestamp = 4300;
  problem.plannerPlan.forEach((step, stepIndex) => {
    const timestampMs = plannerFirstStepTimestamp + stepIndex * plannerStepDuration;
    const tokenTotal = Math.round(
      (problem.plannerTokenTotal * (stepIndex + 1)) / problem.plannerPlan.length,
    );
    events.push(
      event(timestampMs, 'planner.plan.updated', step, {
        actorId: 'planner',
        metadata: { step: stepIndex + 1, stepCount: problem.plannerPlan.length },
      }),
      event(timestampMs + 20, 'planner.usage.updated', `Planner tokens ${tokenTotal}`, {
        actorId: 'planner',
        tokenTotal,
      }),
    );
  });

  const plannerLastStepTimestamp =
    plannerFirstStepTimestamp + (problem.plannerPlan.length - 1) * plannerStepDuration;
  const plannerPlanCompletedTimestamp = plannerLastStepTimestamp + 1500;
  const agentSelectedTimestamp = plannerPlanCompletedTimestamp + 700;
  const documentDeliveredTimestamp = agentSelectedTimestamp + 700;
  const solverStartedTimestamp = documentDeliveredTimestamp + 800;
  const solverFirstStepTimestamp = solverStartedTimestamp + 900;

  events.push(
    event(plannerPlanCompletedTimestamp, 'planner.plan.completed', 'Planner completed the solution plan.', { actorId: 'planner' }),
    event(agentSelectedTimestamp, 'planner.agent.selected', `${modelName(problem.solver)} selected.`, {
      actorId: 'planner',
      targetId: problem.solver,
    }),
    event(documentDeliveredTimestamp, 'planner.document.delivered', `Plan and prompt delivered to ${modelName(problem.solver)}.`, {
      actorId: 'planner',
      targetId: problem.solver,
    }),
    event(solverStartedTimestamp, 'agent.solve.started', `${modelName(problem.solver)} started solving.`, {
      actorId: problem.solver,
      metadata: { modelPrompt: problem.modelPrompt },
    }),
  );

  const solverStepDuration = 2000;
  problem.solutionSteps.forEach((step, stepIndex) => {
    const timestampMs = solverFirstStepTimestamp + stepIndex * solverStepDuration;
    const tokenTotal = Math.round(
      (problem.solverTokenTotal * (stepIndex + 1)) / problem.solutionSteps.length,
    );
    events.push(
      event(timestampMs, 'agent.step.updated', step, {
        actorId: problem.solver,
        metadata: { step: stepIndex + 1, stepCount: problem.solutionSteps.length },
      }),
      event(timestampMs + 20, 'agent.usage.updated', `${modelName(problem.solver)} tokens ${tokenTotal}`, {
        actorId: problem.solver,
        tokenTotal,
      }),
    );
  });

  const solverLastStepTimestamp =
    solverFirstStepTimestamp + (problem.solutionSteps.length - 1) * solverStepDuration;
  const solverCompletedTimestamp = solverLastStepTimestamp + 1600;
  const solutionAttachedTimestamp = solverCompletedTimestamp + 700;
  const bossReviewStartedTimestamp = solutionAttachedTimestamp + 700;
  const bossReviewApprovedTimestamp = bossReviewStartedTimestamp + 1200;
  const documentSubmittedTimestamp = bossReviewApprovedTimestamp + 700;
  const resultOpenedTimestamp = documentSubmittedTimestamp + 700;

  events.push(
    event(solverCompletedTimestamp - 400, 'agent.confidence.updated', `Confidence ${problem.confidence}%`, {
      actorId: problem.solver,
      metadata: { confidence: problem.confidence },
    }),
    event(solverCompletedTimestamp, 'agent.solve.completed', `${modelName(problem.solver)} completed the solution.`, {
      actorId: problem.solver,
      tokenTotal: problem.solverTokenTotal,
      metadata: { stepCount: problem.solutionSteps.length },
    }),
    event(solutionAttachedTimestamp, 'document.solution.updated', 'Fixed answer and solution attached unchanged.', { actorId: problem.solver }),
    event(bossReviewStartedTimestamp, 'boss.review.started', 'Final Boss submission desk received the answer.', { actorId: 'final-boss' }),
    event(bossReviewApprovedTimestamp, 'boss.review.approved', 'Submission format accepted.', { actorId: 'final-boss' }),
    event(documentSubmittedTimestamp, 'document.submitted', 'Answer submitted.', { actorId: 'final-boss' }),
    event(resultOpenedTimestamp, 'result.opened', 'Opening the fixed result.', { actorId: 'final-boss' }),
    event(resultOpenedTimestamp + 100, 'run.completed', 'Run completed.', { actorId: 'final-boss' }),
  );
  return events.sort((a, b) => a.timestampMs - b.timestampMs);
}

export function modelName(model: SolverModel): string {
  return model === 'deep' ? 'Deep' : 'Quick';
}

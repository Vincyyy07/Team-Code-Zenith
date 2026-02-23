import vm from "node:vm";

const keywordBank = {
  react: ["state", "props", "hooks", "component", "performance", "virtual dom"],
  python: ["function", "list", "dictionary", "complexity", "exception", "module"],
  java: ["class", "object", "inheritance", "interface", "collection", "thread"],
  ml: ["model", "feature", "training", "overfitting", "evaluation", "dataset"],
  sql: ["join", "index", "query", "normalization", "transaction", "constraint"],
  javascript: ["closure", "promise", "async", "scope", "event loop", "prototype"],
  nodejs: ["event loop", "middleware", "api", "stream", "async", "express"],
  "system-design": ["scalability", "latency", "cache", "availability", "load balancer", "database"],
  arrays: ["iteration", "index", "complexity", "edge case", "memory", "array"],
  "linked-lists": ["node", "pointer", "traversal", "complexity", "insertion", "deletion"],
  trees: ["traversal", "recursion", "height", "balanced", "node", "complexity"],
  dp: ["subproblem", "memoization", "tabulation", "state", "transition", "optimal"],
  sorting: ["comparison", "partition", "stability", "complexity", "pivot", "merge"],
  recursion: ["base case", "stack", "call", "termination", "depth", "backtracking"],
  behavioral: ["team", "challenge", "impact", "learning", "ownership", "result"],
  situational: ["conflict", "decision", "priority", "stakeholder", "result", "adapt"],
  resume: ["project", "impact", "responsibility", "achievement", "metric", "role"],
  culture: ["value", "collaboration", "growth", "ethics", "adaptability", "communication"],
  default: ["problem", "approach", "example", "result", "tradeoff", "clarity"],
};

const questionMap = {
  skill: {
    react: [
      "Explain virtual DOM and how React optimizes rendering.",
      "How would you prevent unnecessary re-renders in a large React app?",
      "When would you choose Context API vs external state management?",
      "How do hooks improve component design and reuse?",
      "How do you optimize bundle size in React applications?",
      "Explain React reconciliation and key usage in lists.",
      "How do you structure reusable component architecture?",
      "What are controlled vs uncontrolled components and tradeoffs?",
      "Explain useMemo and useCallback with practical examples.",
      "How would you design robust error boundaries in production?",
    ],
  },
  coding: {
    arrays: [
      "Write a function solve(nums) that returns the first non-repeating element in an integer array, or -1.",
      "Write solve(nums, target) to return the indices of two numbers that add up to target.",
      "Write solve(nums, k) to rotate an array to the right by k positions and return the rotated array.",
      "Write solve(nums) that returns a deduplicated array preserving first occurrence order.",
      "Write solve(nums) that returns the maximum subarray sum.",
      "Write solve(nums) that returns true if duplicates exist, else false.",
      "Write solve(intervals) that merges overlapping intervals and returns merged intervals.",
      "Write solve(str) that returns the length of the longest substring without repeating characters.",
      "Write solve(nums, k) that returns the kth largest element in nums.",
      "Write solve(nums) that returns the sorted array in ascending order.",
    ],
  },
  hr: {
    behavioral: [
      "Tell me about a time you resolved a team conflict.",
      "Describe a difficult deadline and how you handled it.",
      "Share a failure and what you learned from it.",
      "How do you communicate technical issues to non-technical stakeholders?",
      "Describe a situation where you had to prioritize multiple tasks.",
      "Tell me about a time you received tough feedback.",
      "How do you handle disagreements with leadership decisions?",
      "Describe a high-pressure situation and your response.",
      "How do you ensure accountability in team projects?",
      "What motivates you and how do you stay consistent?",
    ],
  },
  comprehensive: {
    intermediate: [
      "Explain one technical concept deeply and where you applied it.",
      "How do you debug complex production failures systematically?",
      "Describe how you improved performance of a system you built.",
      "Solve a medium coding problem and explain trade-offs.",
      "Explain your approach to handling edge cases in coding tasks.",
      "How would you optimize time and space complexity in your solution?",
      "Describe a behavioral challenge using STAR framework.",
      "Tell me about a conflict you resolved across teams.",
      "How do you communicate progress and blockers proactively?",
      "What will you improve in the next 30 days for interviews?",
    ],
  },
};

const stopWords = new Set([
  "the",
  "and",
  "with",
  "from",
  "that",
  "this",
  "have",
  "were",
  "your",
  "for",
  "you",
  "has",
  "had",
  "are",
  "was",
  "our",
  "their",
  "about",
  "into",
  "over",
  "under",
  "using",
  "used",
]);

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token && token.length > 2 && !stopWords.has(token));

const semanticSimilarity = (answer = "", question = "") => {
  const answerTokens = new Set(tokenize(answer));
  const questionTokens = tokenize(question);
  if (!answerTokens.size || !questionTokens.length) return 0;
  const overlap = questionTokens.filter((token) => answerTokens.has(token)).length;
  return overlap / questionTokens.length;
};

const codingValidators = {
  0: {
    run: (fn) => {
      if (fn([4, 5, 1, 2, 1, 2, 4]) !== 5) return false;
      if (fn([7, 7, 9]) !== 9) return false;
      if (fn([1, 1, 2, 2]) !== -1) return false;
      return true;
    },
    requiredKeywords: ["frequency", "map", "count"],
  },
  1: {
    run: (fn) => {
      const first = fn([2, 7, 11, 15], 9);
      const second = fn([3, 2, 4], 6);
      return JSON.stringify(first) === JSON.stringify([0, 1]) && JSON.stringify(second) === JSON.stringify([1, 2]);
    },
    requiredKeywords: ["hash", "map", "target"],
  },
  2: {
    run: (fn) => JSON.stringify(fn([1, 2, 3, 4, 5], 2)) === JSON.stringify([4, 5, 1, 2, 3]),
    requiredKeywords: ["mod", "slice", "length"],
  },
  3: {
    run: (fn) => JSON.stringify(fn([1, 2, 2, 3, 1, 4])) === JSON.stringify([1, 2, 3, 4]),
    requiredKeywords: ["set", "order", "unique"],
  },
  4: {
    run: (fn) => fn([-2, 1, -3, 4, -1, 2, 1, -5, 4]) === 6,
    requiredKeywords: ["kadane", "sum", "max"],
  },
  5: {
    run: (fn) => fn([1, 2, 3, 1]) === true && fn([1, 2, 3, 4]) === false,
    requiredKeywords: ["set", "duplicate", "seen"],
  },
  6: {
    run: (fn) => JSON.stringify(fn([[1, 3], [2, 6], [8, 10], [15, 18]])) === JSON.stringify([[1, 6], [8, 10], [15, 18]]),
    requiredKeywords: ["sort", "merge", "overlap"],
  },
  7: {
    run: (fn) => fn("abcabcbb") === 3 && fn("bbbbb") === 1,
    requiredKeywords: ["window", "set", "substring"],
  },
  8: {
    run: (fn) => fn([3, 2, 1, 5, 6, 4], 2) === 5,
    requiredKeywords: ["heap", "sort", "partition"],
  },
  9: {
    run: (fn) => JSON.stringify(fn([3, 1, 2])) === JSON.stringify([1, 2, 3]),
    requiredKeywords: ["sort", "compare", "ascending"],
  },
};

const evaluateJavaScriptCode = (code = "", questionIndex = 0) => {
  const validator = codingValidators[questionIndex];
  if (!validator) {
    return { passed: false, syntaxError: false, message: "Coding validator missing for this question." };
  }

  try {
    const script = new vm.Script(`${code}\n;typeof solve === 'function' ? solve : null;`);
    const context = vm.createContext({});
    const exported = script.runInContext(context, { timeout: 1200 });

    if (typeof exported !== "function") {
      return { passed: false, syntaxError: false, message: "Define a function named solve(...) in your code." };
    }

    const passed = validator.run(exported);
    return {
      passed,
      syntaxError: false,
      message: passed ? "All validation tests passed." : "Code executed but failed one or more validation tests.",
    };
  } catch (error) {
    return {
      passed: false,
      syntaxError: true,
      message: `Syntax/runtime error: ${error instanceof Error ? error.message : "Invalid code"}`,
    };
  }
};

const evaluateCodingAnswer = ({ answer, questionIndex, questionText }) => {
  const code = answer?.codeAnswer?.code || "";
  const language = answer?.codeAnswer?.language || "javascript";
  const complexityNote = answer?.codeAnswer?.complexityNote || "";

  if (!code.trim() || code.includes("[UNANSWERED")) {
    return {
      questionScore: 0,
      relevance: 0,
      coverage: 0,
      structure: 0,
      communication: 0,
      grammar: 0,
      correctness: 0,
      passed: false,
      feedback: ["Incorrect: no valid code submitted."],
      improvements: ["Submit a working solve(...) function for this question."],
    };
  }

  if (language !== "javascript") {
    const syntaxLike = /class\s+Solution|def\s+solve|function\s+solve|int\s+main|solve\s*\(/i.test(code);
    return {
      questionScore: syntaxLike ? 20 : 5,
      relevance: syntaxLike ? 25 : 10,
      coverage: 10,
      structure: 20,
      communication: 15,
      grammar: 20,
      correctness: 0,
      passed: false,
      feedback: ["Code language selected is not executable in current validator runtime."],
      improvements: ["Use JavaScript for strict automatic validation or provide complete runnable syntax."],
    };
  }

  const execution = evaluateJavaScriptCode(code, questionIndex);
  const semantic = semanticSimilarity(`${code} ${complexityNote}`, questionText);
  const requiredKeywords = codingValidators[questionIndex]?.requiredKeywords || ["algorithm", "complexity"];
  const keywordHits = requiredKeywords.filter((word) => `${code} ${complexityNote}`.toLowerCase().includes(word)).length;
  const keywordRatio = requiredKeywords.length ? keywordHits / requiredKeywords.length : 0;

  if (!execution.passed || semantic < 0.18) {
    return {
      questionScore: execution.syntaxError ? 2 : 8,
      relevance: 0,
      coverage: 0,
      structure: execution.syntaxError ? 5 : 15,
      communication: 0,
      grammar: execution.syntaxError ? 5 : 20,
      correctness: 0,
      passed: false,
      feedback: [`Incorrect: ${execution.message}`],
      improvements: [
        "Match function behavior to the question intent.",
        "Handle core and edge test cases correctly.",
      ],
    };
  }

  const relevance = Math.round(clamp(semantic * 100, 0, 100));
  const coverage = Math.round(clamp(keywordRatio * 100, 0, 100));
  const structure = Math.round(clamp(55 + keywordRatio * 35, 0, 95));
  const communication = complexityNote.trim().length > 15 ? 78 : 58;
  const grammar = 80;
  const correctness = 100;
  const questionScore = Math.round(relevance * 0.2 + coverage * 0.2 + structure * 0.15 + communication * 0.1 + grammar * 0.1 + correctness * 0.25);

  return {
    questionScore,
    relevance,
    coverage,
    structure,
    communication,
    grammar,
    correctness,
    passed: true,
    feedback: ["Correct: code passed validation tests for this question."],
    improvements: coverage < 50 ? ["Add stronger complexity explanation and edge-case commentary."] : ["Maintain this coding quality and consistency."],
  };
};

// Strict scoring - wrong/irrelevant answers get LOW scores
const scoreFromLength = (text) => {
  if (!text || text.trim().length === 0) return 0;
  if (text.includes("[UNANSWERED")) return 0;
  
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  
  // Strict length requirements
  if (words < 10) return Math.min(15, words * 1.5); // Very short = very low
  if (words < 30) return 20 + (words - 10) * 1.2; // Still short
  if (words < 50) return 40 + (words - 30) * 1.0; // Getting better
  return Math.min(85, 60 + (words - 50) * 0.5); // Cap at 85 based on length alone
};

const scoreKeywordCoverage = (answers, keywords) => {
  if (!answers.length || !keywords.length) return 0;

  const joined = answers.join(" ").toLowerCase();
  
  // Check for unanswered
  if (joined.includes("[unanswered")) return 0;
  
  const hits = keywords.filter((word) => joined.includes(word.toLowerCase())).length;
  const hitRatio = hits / keywords.length;
  
  // STRICT: No keywords = 0, low coverage = low score
  if (hitRatio === 0) return 5; // Almost zero if no keywords
  if (hitRatio < 0.2) return 10 + hitRatio * 50; // < 20% coverage = very low
  if (hitRatio < 0.4) return 20 + hitRatio * 80; // 20-40% = low
  if (hitRatio < 0.6) return 40 + hitRatio * 60; // 40-60% = medium
  return 60 + hitRatio * 40; // 60%+ = good
};

const scoreStructure = (answers) => {
  const joined = answers.join(" ").toLowerCase();
  
  if (!joined || joined.includes("[unanswered")) return 0;
  
  const indicators = ["first", "then", "because", "for example", "therefore", "finally", "however", "additionally"];
  const hits = indicators.filter((i) => joined.includes(i)).length;
  
  // Structure score based on actual structural indicators
  if (hits === 0) return 15; // No structure = low
  if (hits === 1) return 30;
  if (hits === 2) return 50;
  if (hits === 3) return 65;
  return Math.min(90, 65 + hits * 5);
};

const scoreGrammarClarity = (answers) => {
  const joined = answers.join(" ");
  
  if (!joined || joined.includes("[UNANSWERED")) return 0;
  
  const totalLength = joined.length;
  const punctuationCount = (joined.match(/[.,;:!?]/g) || []).length;
  const sentences = joined.split(/[.!?]+/).filter(Boolean).length;
  
  // Basic grammar checks
  let score = 40; // Start lower
  
  // Punctuation usage
  if (punctuationCount > 0 && sentences > 0) {
    const avgPuncPerSentence = punctuationCount / sentences;
    score += Math.min(25, avgPuncPerSentence * 8);
  }
  
  // Sentence variety
  if (sentences > 2) score += 15;
  if (sentences > 4) score += 10;
  
  return Math.min(95, score);
};

const scoreCommunication = (answers) => {
  const joined = answers.join(" ").toLowerCase();
  
  if (!joined || joined.includes("[unanswered")) return 0;
  
  const fillerWords = ["um", "uh", "like", "you know", "actually"];
  const fillerCount = fillerWords.reduce(
    (count, current) => count + (joined.match(new RegExp(`\\b${current}\\b`, "g")) || []).length,
    0,
  );
  
  const words = joined.split(/\s+/).filter(Boolean).length;
  const fillerRatio = words > 0 ? fillerCount / words : 0;
  
  // Penalize filler words heavily
  let score = 75;
  score -= fillerCount * 5; // Each filler word costs 5 points
  score -= fillerRatio * 100; // High filler ratio costs more
  
  return Math.max(10, Math.min(95, score));
};

const scoreConfidence = (signals = {}) => {
  const {
    tabSwitches = 0,
    longSilenceEvents = 0,
    micOnRatio = 1,
    faceDetectedRatio = 1,
    backgroundNoiseEvents = 0,
    multipleFaceEvents = 0,
  } = signals;
  
  let score = 70; // Start at 70
  
  // Heavy penalties for violations
  score -= tabSwitches * 10; // Each tab switch -10
  score -= longSilenceEvents * 7; // Each long silence -7
  score -= backgroundNoiseEvents * 4; // Each noise event -4
  score -= multipleFaceEvents * 15; // Multi-face is serious -15
  
  // Device signal bonuses
  score += micOnRatio * 15;
  score += faceDetectedRatio * 15;
  
  return Math.max(5, Math.min(97, score));
};

const extractResumeKeywords = (resumeText = "") => {
  const words = resumeText
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  const counts = new Map();
  words.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
};

const normalizeAnswers = (answers = []) =>
  answers.map((item) => {
    if (typeof item === "string") {
      return { transcript: item, speechMetrics: { fillerWords: 0, pauseDurationSec: 0, wordsPerMinute: 110, clarityScore: 70 } };
    }

    return {
      transcript: item.transcript || "",
      codeAnswer: item.codeAnswer || null,
      speechMetrics: item.speechMetrics || { fillerWords: 0, pauseDurationSec: 0, wordsPerMinute: 110, clarityScore: 70 },
    };
  });

export const generateQuestions = ({ type, topic, resumeText = "" }) => {
  if (type === "hr" && resumeText.trim().length > 20) {
    const resumeKeywords = extractResumeKeywords(resumeText);
    if (resumeKeywords.length) {
      return [
        `Walk me through your experience with ${resumeKeywords[0]} and its measurable impact.`,
        `Tell me about a challenge you solved while working on ${resumeKeywords[1] || "a key project"}.`,
        `How did your work on ${resumeKeywords[2] || "your recent projects"} improve outcomes for stakeholders?`,
        "How do you prioritize responsibilities when deadlines overlap?",
        "Tell me about one achievement you are most proud of and why.",
        "How do you handle critical feedback from mentors or managers?",
        "Describe a scenario where you had to adapt quickly.",
        "How do your project experiences align with this role?",
        "What communication strategy do you use in cross-functional teams?",
        "What is your 6-month professional growth plan?",
      ];
    }
  }

  const byType = questionMap[type] || {};
  const selectedQuestions = byType[topic] || byType.intermediate || byType.behavioral;

  if (selectedQuestions?.length) {
    return selectedQuestions.slice(0, 10);
  }

  return [
    "Explain your approach to solving this interview problem.",
    "What trade-offs did you consider in your answer?",
    "How would you improve your solution under production constraints?",
    "Summarize your final recommendation clearly.",
    "How do you validate correctness and reliability?",
    "How do you handle edge cases?",
    "What assumptions did you make?",
    "How do you communicate this to non-technical stakeholders?",
    "What metrics would you track post-implementation?",
    "What would be your next iteration?",
  ];
};

export const evaluateInterview = ({ type, topic, questions = [], answers, durationSec, proctoringSignals }) => {
  const normalizedAnswers = normalizeAnswers(answers || []);
  const transcripts = normalizedAnswers.map((item) => item.transcript);

  if (type === "coding") {
    const codingResults = normalizedAnswers.map((answer, index) =>
      evaluateCodingAnswer({ answer, questionIndex: index, questionText: questions[index] || `Question ${index + 1}` }),
    );

    const relevance = Math.round(codingResults.reduce((sum, item) => sum + item.relevance, 0) / Math.max(1, codingResults.length));
    const coverage = Math.round(codingResults.reduce((sum, item) => sum + item.coverage, 0) / Math.max(1, codingResults.length));
    const structure = Math.round(codingResults.reduce((sum, item) => sum + item.structure, 0) / Math.max(1, codingResults.length));
    const grammar = Math.round(codingResults.reduce((sum, item) => sum + item.grammar, 0) / Math.max(1, codingResults.length));
    const communication = Math.round(codingResults.reduce((sum, item) => sum + item.communication, 0) / Math.max(1, codingResults.length));
    const confidence = Math.round(scoreConfidence(proctoringSignals));
    const completeness = Math.round(clamp((relevance + coverage + structure) / 3, 0, 100));
    const correctnessAvg = Math.round(codingResults.reduce((sum, item) => sum + item.correctness, 0) / Math.max(1, codingResults.length));

    const overallScore = Math.round(
      relevance * 0.18 +
        coverage * 0.18 +
        structure * 0.14 +
        communication * 0.1 +
        confidence * 0.08 +
        grammar * 0.07 +
        correctnessAvg * 0.25,
    );

    const passedCount = codingResults.filter((item) => item.passed).length;
    const unansweredCount = normalizedAnswers.filter((item) => !item.codeAnswer?.code || item.codeAnswer.code.includes("[UNANSWERED")).length;

    const strengths = [];
    const improvements = [];
    if (passedCount >= 7) strengths.push("Strong coding correctness across most validation tests.");
    if (correctnessAvg >= 75) strengths.push("High code validation pass rate.");
    if (structure >= 70) strengths.push("Solutions show structured implementation patterns.");

    if (passedCount < 5) improvements.push("CRITICAL: Most coding answers failed output validation tests.");
    if (relevance < 60) improvements.push("CRITICAL: Solutions are not aligned with problem intent.");
    if (coverage < 50) improvements.push("Missing algorithmic concepts and edge-case handling in explanations.");
    if (unansweredCount > 0) improvements.push(`⚠️ ${unansweredCount} coding question(s) unanswered.`);

    const questionBreakdown = codingResults.map((result, index) => ({
      questionNumber: index + 1,
      question: questions[index] || `Question ${index + 1}`,
      answer: normalizedAnswers[index]?.codeAnswer?.code || "[No code provided]",
      status: normalizedAnswers[index]?.codeAnswer?.code ? "answered" : "unanswered",
      score: result.questionScore,
      wordCount: (normalizedAnswers[index]?.codeAnswer?.code || "").split(/\s+/).filter(Boolean).length,
      metrics: {
        keywordCoverage: result.coverage,
        structure: result.structure,
        clarity: result.grammar,
        communication: result.communication,
        speechClarity: 0,
        fillerWords: 0,
        wordsPerMinute: 0,
      },
      feedback: result.feedback,
      improvements: result.improvements,
    }));

    return {
      interviewType: type,
      topic: topic || "default",
      durationSec,
      overallScore,
      breakdown: {
        relevance,
        coverage,
        completeness,
        structure,
        grammar,
        communication,
        confidence,
      },
      speechMetrics: {
        wordsPerMinuteAvg: 0,
        pauseDurationTotalSec: 0,
        fillerWordsTotal: 0,
        clarityAvg: 0,
      },
      summary:
        overallScore >= 75
          ? "Strong coding interview performance with validated correct solutions."
          : "Coding performance needs improvement: correctness and test validation are mandatory.",
      strengths: strengths.length ? strengths : ["Interview attempt completed."],
      improvements: improvements.length ? improvements : ["Improve validation pass rate for higher score."],
      suggestions: [
        "Write solve(...) with exact problem intent before optimization.",
        "Validate edge cases explicitly (empty input, duplicates, boundaries).",
        "Add concise complexity notes to strengthen technical communication.",
      ],
      unansweredCount,
      questionBreakdown,
    };
  }

  const normalizedTopic = topic || "default";
  const keywords = keywordBank[normalizedTopic] || keywordBank.default;
  
  const semanticScores = normalizedAnswers.map((answer, index) => semanticSimilarity(answer.transcript, questions[index] || topic || "question"));
  const semanticThreshold = 0.18;

  const perQuestionValidity = normalizedAnswers.map((answer, index) => {
    const transcript = answer.transcript || "";
    if (!transcript.trim() || transcript.includes("[UNANSWERED")) return false;
    const semantic = semanticScores[index] || 0;
    const keywordHit = keywords.some((word) => transcript.toLowerCase().includes(word));
    return semantic >= semanticThreshold && keywordHit;
  });

  const correctnessRatio = perQuestionValidity.length
    ? perQuestionValidity.filter(Boolean).length / perQuestionValidity.length
    : 0;

  const rawRelevance = Math.round(scoreFromLength(transcripts.join(" ")));
  const rawCoverage = Math.round(scoreKeywordCoverage(transcripts, keywords));

  const relevance = correctnessRatio < 0.35 ? 0 : Math.round(rawRelevance * correctnessRatio);
  const coverage = correctnessRatio < 0.35 ? 0 : Math.round(rawCoverage * correctnessRatio);
  const structure = Math.round(scoreStructure(transcripts));
  const grammar = Math.round(scoreGrammarClarity(transcripts));

  const communicationBase = Math.round(scoreCommunication(transcripts));
  const clarityAvg = normalizedAnswers.length
    ? normalizedAnswers.reduce((sum, item) => sum + (item.speechMetrics.clarityScore || 0), 0) / normalizedAnswers.length
    : 0; // Changed from 70 to 0 for strict mode
    
  const fillerWordsTotal = normalizedAnswers.reduce((sum, item) => sum + (item.speechMetrics.fillerWords || 0), 0);
  const pauseDurationTotal = normalizedAnswers.reduce((sum, item) => sum + (item.speechMetrics.pauseDurationSec || 0), 0);
  const wordsPerMinuteAvg = normalizedAnswers.length
    ? normalizedAnswers.reduce((sum, item) => sum + (item.speechMetrics.wordsPerMinute || 0), 0) / normalizedAnswers.length
    : 0; // Changed from 110 to 0

  // STRICT communication scoring
  const communication = correctnessRatio < 0.35 ? 0 : Math.round(clamp((communicationBase * 0.7 + clarityAvg * 0.3) - fillerWordsTotal * 0.8, 0, 97));
  const confidence = correctnessRatio < 0.35 ? 0 : Math.round(scoreConfidence(proctoringSignals));
  const completeness = Math.round(clamp((relevance * 0.4 + coverage * 0.4 + structure * 0.2), 0, 98));

  // Final score calculation - WEIGHTED
  const overallScore = Math.round(
    relevance * 0.3 + 
    coverage * 0.2 + 
    structure * 0.15 + 
    communication * 0.15 + 
    confidence * 0.1 + 
    grammar * 0.1
  );
  const strictOverallScore = correctnessRatio < 0.35 ? Math.min(overallScore, 12) : overallScore;

  const strengths = [];
  const improvements = [];

  // STRICT strength recognition - only above 75
  if (relevance >= 75) strengths.push("Strong alignment of answers with asked questions.");
  if (structure >= 75) strengths.push("Responses are well-structured and easy to follow.");
  if (communication >= 75) strengths.push("Clear and professional communication style.");
  if (confidence >= 75) strengths.push("Stable delivery with good composure.");
  if (coverage >= 75) strengths.push("Good technical depth and keyword coverage.");

  // SPECIFIC improvements for low scores
  if (coverage < 60) improvements.push("CRITICAL: Answer lacks domain-specific keywords and technical depth. Study core concepts thoroughly.");
  if (relevance < 60) improvements.push("CRITICAL: Answers are too short or not addressing the questions directly. Provide complete responses.");
  if (correctnessRatio < 0.35) improvements.push("CRITICAL: Most answers are semantically incorrect for the asked questions.");
  if (communication < 60) improvements.push("Reduce filler words significantly. Practice speaking clearly without hesitation.");
  if (confidence < 60) improvements.push("High number of proctoring violations detected. Maintain focus and composure.");
  if (completeness < 60) improvements.push("Incomplete answers detected. Address all parts of each question with examples.");
  if (structure < 60) improvements.push("Use structured frameworks (e.g., STAR for HR, problem-approach-solution for technical).");
  if (grammar < 60) improvements.push("Improve sentence structure and use proper punctuation in explanations.");

  // Check for unanswered questions
  const unansweredCount = transcripts.filter(t => !t || t.includes("[UNANSWERED") || t.trim().length === 0).length;
  if (unansweredCount > 0) {
    improvements.push(`⚠️ ${unansweredCount} question(s) unanswered or timed out. All questions must be answered for better scores.`);
  }

  const suggestions = strictOverallScore < 50 ? [
    "Practice answering questions within 60 seconds with complete responses.",
    "Study domain-specific concepts and vocabulary thoroughly before interviews.",
    "Use the STAR framework for behavioral questions with measurable outcomes.",
    "Record yourself and identify filler words, then practice reducing them.",
    "Ensure stable environment - no tab switching, noise, or interruptions.",
  ] : overallScore < 70 ? [
    "Practice 3-4 timed mock sessions weekly and track improvement.",
    "Prepare 8-10 domain-specific examples with technical depth.",
    "Work on reducing filler words and long pauses during delivery.",
    "Review feedback from each mock and focus on weakest category.",
  ] : [
    "Continue practicing to maintain consistency across different topics.",
    "Deep dive into advanced concepts to improve technical depth.",
    "Focus on communication polish and reducing any remaining filler words.",
  ];

  const summary =
    strictOverallScore >= 80
      ? "Excellent performance! Strong interview readiness with clear communication, good technical depth, and professional delivery."
      : strictOverallScore >= 65
        ? "Good baseline performance with visible strengths. Focus on areas marked for improvement to reach the next level."
        : strictOverallScore >= 40
          ? "Foundational performance with room for significant improvement. Prioritize completeness, keyword coverage, and structured answers."
          : "Performance needs major improvement. Many questions unanswered or lacking depth. Focus on fundamentals: complete answers, domain vocabulary, and 60-second response discipline.";

  // Per-question breakdown for accurate feedback
  const questionBreakdown = normalizedAnswers.map((answerObj, index) => {
    const questionText = questions[index] || `Question ${index + 1}`;
    const transcript = answerObj.transcript || "";
    const isUnanswered = !transcript || transcript.includes("[UNANSWERED") || transcript.trim().length === 0;
    
    // Individual scoring for this answer
    const isCorrect = perQuestionValidity[index] || false;
    const answerLength = isCorrect ? scoreFromLength(transcript) : 0;
    const answerCoverage = isCorrect ? scoreKeywordCoverage([transcript], keywords) : 0;
    const answerStructure = scoreStructure([transcript]);
    const answerGrammar = scoreGrammarClarity([transcript]);
    const answerCommunication = isCorrect ? scoreCommunication([transcript]) : 0;
    
    const wordCount = transcript.trim().split(/\s+/).filter(w => w.length > 0).length;
    const { wordsPerMinute = 0, fillerWords = 0, clarityScore = 0 } = answerObj.speechMetrics;
    
    // Generate specific feedback for this answer
    const feedback = [];
    const missing = [];
    
    if (isUnanswered) {
      feedback.push("⚠️ Question was not answered or timed out after 60 seconds.");
      missing.push("Provide a complete answer addressing all parts of the question.");
      missing.push("Practice responding within 60-second time limit.");
    } else {
      if (!isCorrect) {
        feedback.push("❌ Incorrect: answer does not match question intent.");
        missing.push("Address the exact concept asked in the question before adding detail.");
        missing.push(`Include core concepts such as: ${keywords.slice(0, 5).join(", ")}.`);
      }

      // Positive feedback
      if (answerCoverage >= 70) feedback.push("✓ Strong keyword coverage with good technical depth.");
      if (answerStructure >= 70) feedback.push("✓ Well-structured response with clear flow.");
      if (answerGrammar >= 70) feedback.push("✓ Clear and grammatically sound explanation.");
      if (clarityScore >= 75) feedback.push("✓ Excellent speech clarity and delivery.");
      if (fillerWords === 0 && wordCount > 15) feedback.push("✓ Clean delivery with no filler words.");
      
      // Areas for improvement
      if (answerCoverage < 50) missing.push(`Missing key domain concepts. Expected keywords: ${keywords.slice(0, 5).join(", ")}.`);
      if (answerLength < 40) missing.push("Answer is too brief. Provide more detail and examples.");
      if (answerStructure < 50) missing.push("Use structured approach: state problem, explain method, summarize outcome.");
      if (fillerWords >= 3) missing.push(`High filler word count (${fillerWords}). Practice clearer delivery.`);
      if (wordCount < 20) missing.push("Response lacks depth. Aim for 30-50 words minimum with examples.");
      if (answerGrammar < 50) missing.push("Improve sentence structure and coherence.");
    }
    
    // Calculate question-level score
    const questionScore = isUnanswered || !isCorrect ? 0 : Math.round(
      answerLength * 0.3 + 
      answerCoverage * 0.25 + 
      answerStructure * 0.2 + 
      answerGrammar * 0.15 + 
      answerCommunication * 0.1
    );
    
    return {
      questionNumber: index + 1,
      question: questionText,
      answer: transcript || "[No answer provided]",
      status: isUnanswered ? "unanswered" : "answered",
      score: questionScore,
      wordCount,
      metrics: {
        keywordCoverage: Math.round(answerCoverage),
        structure: Math.round(answerStructure),
        clarity: Math.round(answerGrammar),
        communication: Math.round(answerCommunication),
        speechClarity: Math.round(clarityScore),
        fillerWords,
        wordsPerMinute: Math.round(wordsPerMinute),
      },
      feedback: feedback.length ? feedback : ["Answer provided but needs improvement in multiple areas."],
      improvements: missing.length ? missing : ["Continue practicing to maintain quality."],
    };
  });

  return {
    interviewType: type,
    topic: normalizedTopic,
    durationSec,
    overallScore: strictOverallScore,
    breakdown: {
      relevance,
      coverage,
      completeness,
      structure,
      grammar,
      communication,
      confidence,
    },
    speechMetrics: {
      wordsPerMinuteAvg: Math.round(wordsPerMinuteAvg),
      pauseDurationTotalSec: Math.round(pauseDurationTotal),
      fillerWordsTotal,
      clarityAvg: Math.round(clarityAvg),
    },
    summary,
    strengths: strengths.length ? strengths : ["Completed the interview flow."],
    improvements: improvements.length ? improvements : ["Practice more to build consistency."],
    suggestions,
    unansweredCount,
    questionBreakdown,
  };
};

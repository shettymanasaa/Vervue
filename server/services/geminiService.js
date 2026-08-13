const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "openai/gpt-oss-120b";
async function selectRoleRelevantMissions(context, missions = []) {
  if (!missions.length) return [];

  const missionList = missions
    .map(
      (mission, index) =>
        `${index + 1}. Day ${mission.day}: ${mission.title}\nObjectives: ${(mission.objectives || []).join("; ")}`
    )
    .join("\n\n");

  const prompt = `
You are selecting interview topics for a technical interview.

Candidate role:
${context.candidate.jobRole}

Candidate experience:
${context.candidate.yearsExperience} years

Completed curriculum missions:
${missionList}

Select the curriculum missions that are most relevant to this candidate's role.

IMPORTANT:
- Only select missions from the list provided.
- Do not invent new topics.
- Relevance to the candidate's role is more important than the original curriculum order.
- Prefer topics that allow meaningful evaluation for this specific role.
- Return exactly 5 mission numbers when at least 5 are available.
- If fewer than 5 missions are available, return all relevant missions.
- Return JSON only.

Format:
{
  "selectedMissionNumbers": [1, 4, 7, 3, 5]
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You select role-relevant interview topics. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_object",
      },
    });

    const result = JSON.parse(
      response.choices[0].message.content.trim()
    );

    const selected = (result.selectedMissionNumbers || [])
      .map((number) => missions[number - 1])
      .filter(Boolean);

    return selected.length ? selected : missions.slice(0, 5);
  } catch (error) {
    console.error("❌ ROLE TOPIC SELECTION ERROR:", error);

    return missions.slice(0, 5);
  }
}

function isRateLimitError(error) {
  const status = Number(
    error?.status ??
    error?.statusCode ??
    error?.response?.status ??
    error?.response?.statusCode ??
    error?.cause?.status
  );

  const message = String(
    error?.message ??
    error?.error?.message ??
    ""
  ).toLowerCase();

  return (
    status === 429 ||
    message.includes("429") ||
    message.includes("rate limit") ||
    message.includes("rate_limit") ||
    message.includes("too many requests") ||
    message.includes("quota")
  );
}

    
function getFallbackQuestion(context, questionNumber, targetMission ,history = []) {
  const topic =
    targetMission?.title || "the technical area relevant to this role";

  const role =
    context?.candidate?.jobRole || "this role";

  const roleText = role.toLowerCase();
  const previousAnswer =
  history.length > 0
    ? history[history.length - 1].answer?.trim() || ""
    : "";
    const answerText = previousAnswer.toLowerCase();

const answerIsWeak =
  !previousAnswer ||
  previousAnswer.length < 25 ||
  answerText.includes("i don't know") ||
  answerText.includes("idk") ||
  answerText.includes("not sure") ||
  answerText.includes("no idea") ||
  answerText === "okay" ||
  answerText === "what";
  

const roleQuestions = {
  
  "business analyst": [
    `For ${topic}, what business problem would you try to solve first, and what information would you need from stakeholders?`,
    `What factors would you consider when evaluating whether ${topic} is actually useful for a business process?`,
    `How would you translate a business requirement into a solution involving ${topic}?`,
    `What trade-offs would you discuss with stakeholders when deciding whether to use ${topic}?`,
    `If a ${topic}-based solution produced poor results, how would you determine whether the issue was with the data, requirements, or implementation?`,
    `How would you validate that a ${topic}-based solution is delivering the expected business outcome?`,
    `If the results from ${topic} were unexpected, how would you investigate the issue with both technical and business teams?`,
    `How would you make a ${topic}-based solution scalable while keeping it useful for business users?`,
    `What reliability, data-quality, security, or monitoring concerns would you consider before using ${topic} in production?`,
    `If you could improve one part of the ${topic}-based solution before production, what would you prioritize and why?`
  ],

  "data engineer": [
    `How would you approach designing a data pipeline that supports ${topic}, and what would you consider first?`,
    `What data storage, processing, or indexing concepts are important when working with ${topic}?`,
    `How would you implement ${topic} as part of a production data pipeline?`,
    `What trade-offs would you consider around storage, latency, accuracy, and processing cost when using ${topic}?`,
    `What could go wrong in a ${topic}-based data pipeline, and how would you troubleshoot it?`,
    `How would you make a ${topic}-based data pipeline more robust and maintainable?`,
    `If the output of a ${topic} pipeline became inconsistent, how would you debug it?`,
    `How would you design the ${topic} pipeline to handle increasing data volume reliably?`,
    `What production concerns such as monitoring, data quality, failures, or recovery would you consider for ${topic}?`,
    `What technical improvement would you prioritize before taking the ${topic} pipeline into production, and why?`
  ],

  "backend software engineer": [
    `How would you approach integrating ${topic} into a backend system, and what would you consider first?`,
    `What backend concepts are most important when building a service around ${topic}?`,
    `How would you implement ${topic} as part of a real backend application?`,
    `What trade-offs would you consider around latency, reliability, cost, and complexity when using ${topic}?`,
    `What could go wrong when integrating ${topic} into a backend API, and how would you troubleshoot it?`,
    `How would you make a backend service using ${topic} more robust for production?`,
    `If a service using ${topic} started returning unexpected results, how would you debug it?`,
    `How would you design a backend system using ${topic} to handle increasing traffic while remaining reliable?`,
    `What security, monitoring, failure-handling, and deployment concerns would you consider before putting ${topic} into production?`,
    `What would be the most important technical improvement you would make before deploying the ${topic}-based system, and why?`
  ],

  "software engineer": [
    `How would you approach implementing ${topic} in a software project, and what would you consider first?`,
    `What core technical concepts would you consider when working with ${topic}?`,
    `How would you structure a real-world implementation of ${topic}?`,
    `What trade-offs would you consider when choosing an approach for ${topic}?`,
    `What could go wrong while implementing ${topic}, and how would you identify the cause?`,
    `How would you make a solution involving ${topic} more robust for real-world use?`,
    `How would you debug unexpected behavior in an implementation involving ${topic}?`,
    `How would you design ${topic} to handle increasing scale while maintaining reliability?`,
    `What production concerns would you consider before deploying a solution involving ${topic}?`,
    `What technical improvement would you prioritize before taking ${topic} into production, and why?`
  ],

  "ai engineer": [
    `How would you approach using ${topic} in an AI system, and what would you consider first?`,
    `What technical concepts are most important when working with ${topic} in an AI application?`,
    `How would you implement ${topic} in a real AI project?`,
    `What trade-offs would you consider around accuracy, latency, cost, and model behavior when using ${topic}?`,
    `What could go wrong when implementing ${topic} in an AI system, and how would you troubleshoot it?`,
    `How would you make an AI solution involving ${topic} more robust for real-world use?`,
    `If an AI system using ${topic} started producing unexpected results, how would you debug it?`,
    `How would you design a ${topic}-based AI system to scale while remaining reliable?`,
    `What monitoring, security, evaluation, and reliability concerns would you consider before deploying ${topic}?`,
    `What technical improvement would you prioritize before taking the ${topic}-based AI system into production, and why?`
  ]
};
let selectedQuestions = roleQuestions["software engineer"];

if (roleText.includes("business analyst")) {
  selectedQuestions = roleQuestions["business analyst"];
} else if (roleText.includes("data engineer")) {
  selectedQuestions = roleQuestions["data engineer"];
} else if (roleText.includes("backend software engineer")) {
  selectedQuestions = roleQuestions["backend software engineer"];
} else if (roleText.includes("ai engineer")) {
  selectedQuestions = roleQuestions["ai engineer"];
}

 return (
  selectedQuestions[questionNumber - 1] ||
  selectedQuestions[selectedQuestions.length - 1]
);
}

function getFallbackFeedback(history = [], context = {}) {
  const answers = history
    .map((item) => (item.answer || "").trim())
    .filter(Boolean);

  const total = answers.length;

  if (total === 0) {
    return JSON.stringify({
      summary:
        "The interview ended before any substantive responses were recorded, so there is not enough evidence to assess the candidate's technical ability.",
      strengths: [
        "The candidate entered the interview successfully."
      ],
      gaps: [
        "No substantive technical responses were available for assessment."
      ],
      next: [
        "Complete more interview questions to enable a meaningful technical assessment."
      ]
    });
  }

  const weakAnswers = answers.filter((answer) => {
    const text = answer.toLowerCase();

    return (
      answer.length < 25 ||
      text.includes("i don't know") ||
      text.includes("idk") ||
      text.includes("not sure") ||
      text.includes("no idea") ||
      text === "maybe" ||
      text === "okay" ||
      text === "what"
    );
  });

  const detailedAnswers = answers.filter(
    (answer) => answer.length >= 120
  );

  const weakCount = weakAnswers.length;
  const detailedCount = detailedAnswers.length;

  const strengths = [];
  const gaps = [];
  const next = [];

  // Strengths
  if (detailedCount > 0) {
    strengths.push(
      `Provided ${detailedCount} detailed response${detailedCount === 1 ? "" : "s"} with meaningful explanation.`
    );
  }

  if (weakCount < total) {
    strengths.push(
      "Engaged with the technical questions and provided assessable responses."
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      "Participated in the interview and submitted responses."
    );
  }

  // Gaps
  if (weakCount > 0) {
    gaps.push(
      `${weakCount} response${weakCount === 1 ? " was" : "s were"} too brief or uncertain to demonstrate sufficient technical depth.`
    );
  }

  if (detailedCount < total) {
    gaps.push(
      "Some responses would benefit from clearer reasoning, implementation details, and technical trade-offs."
    );
  }

  if (weakCount === 0 && detailedCount === total) {
    gaps.push(
      "Further assessment could focus on deeper production scenarios and edge cases."
    );
  }

  // Recommended next steps
  if (weakCount > 0) {
    next.push(
      "Strengthen technical fundamentals and explain the reasoning behind each solution."
    );
  }

  next.push(
    "Practice answering with concrete implementation details, trade-offs, and real-world failure scenarios."
  );

  let summary;

  if (weakCount >= Math.ceil(total * 0.6)) {
    summary =
      `The candidate completed ${total} response${total === 1 ? "" : "s"}, but several responses were brief or uncertain. The available responses provide limited evidence of technical depth.`;
  } else if (detailedCount >= Math.ceil(total * 0.6)) {
    summary =
      `The candidate completed ${total} responses and frequently provided detailed explanations. The responses demonstrate an ability to engage with technical problems, although deeper evaluation would benefit from additional production-level scenarios.`;
  } else {
    summary =
      `The candidate completed ${total} responses with varying levels of detail. Some responses demonstrated technical understanding, while others would benefit from clearer reasoning and implementation detail.`;
  }

  const topicAnalysis = [
  {
    topic: "Technical Fundamentals",
    assessment:
      detailedCount >= Math.ceil(total * 0.6)
        ? "Strong"
        : weakCount >= Math.ceil(total * 0.6)
        ? "Needs Improvement"
        : "Partial",
    evidence:
      detailedCount > 0
        ? "The candidate provided some responses with meaningful technical explanation."
        : "The available responses contained limited technical evidence.",
    improvement:
      weakCount > 0
        ? "Provide clearer technical reasoning and explain the underlying concepts."
        : "Add more concrete implementation details and technical trade-offs.",
  },
  {
    topic: "Problem Solving & Implementation",
    assessment:
      detailedCount >= Math.ceil(total * 0.6)
        ? "Partial"
        : "Needs Improvement",
    evidence:
      "The interview responses provide limited evidence of practical implementation depth.",
    improvement:
      "Use concrete implementation approaches, failure scenarios, and trade-offs when answering technical questions.",
  },
];

return JSON.stringify({
  summary,
  strengths,
  gaps,
  next,
  topicAnalysis,
});
}

async function generateInterviewQuestion(
  context,
  history = [],
  questionNumber = 1,
  targetMission = null,
  coveredDays = []
) {
  const stages = {
  1: "Technical opening and fundamentals",
  2: "Core technical competency",
  3: "Core technical competency",
  4: "Core technical competency",
  5: "Additional required competency",
  6: "Candidate-specific technical depth",
  7: "Problem solving and debugging",
  8: "Architecture, scalability, and technical trade-offs",
  9: "Reliability and production engineering",
  10: "Final technical judgment",
};

  const targetSection = targetMission
    ? `
TARGET CURRICULUM MISSION — MANDATORY

Day: ${targetMission.day}
Topic: ${targetMission.title}

Objectives:
${targetMission.objectives
  .map((objective) => "- " + objective)
  .join("\n")}
`
    : `
TARGET CURRICULUM MISSION:
None
`;

 const prompt = `
You are a highly experienced technical interviewer conducting a natural,
professional, adaptive technical interview.

Your goal is to evaluate the candidate's actual technical understanding
through realistic conversation. Do not flatter the candidate, do not assume
knowledge that they have not demonstrated, and do not behave like a scripted
questionnaire.

CANDIDATE

Name: ${context.candidate.name}
Role: ${context.candidate.jobRole}
Experience: ${context.candidate.yearsExperience} years
Education: ${context.candidate.education}

INTERVIEW PROGRESS

Question ${questionNumber} of 10

Interview Stage:
${stages[questionNumber]}

TARGET CURRICULUM MISSION

${
  targetMission
    ? `
Day: ${targetMission.day}
Topic: ${targetMission.title}

Objectives:
${targetMission.objectives
  .map((objective) => "- " + objective)
  .join("\n")}
`
    : "No specific curriculum mission is assigned."
}

PREVIOUSLY COVERED CURRICULUM DAYS

${coveredDays.length ? coveredDays.join(", ") : "None"}

PREVIOUS INTERVIEW CONVERSATION

${
  history.length
    ? history
        .map(
          (item, index) =>
            "Question " +
            (index + 1) +
            ": " +
            item.question +
            "\nCandidate Answer: " +
            item.answer
        )
        .join("\n\n")
    : "No previous conversation. This is the first question."
}

CORE INTERVIEW RULES

1. Ask exactly ONE interview question.

2. The question must be appropriate for the candidate's role, experience,
   current interview stage, and demonstrated technical ability.

3. Questions 1–5 must follow the assigned TARGET CURRICULUM MISSION.

4. When a TARGET CURRICULUM MISSION is provided, the question MUST directly
   evaluate that mission's topic or objectives.

5. The TARGET CURRICULUM MISSION has higher priority than conversational
   topic continuity for Questions 1–5.

6. Do not switch away from the assigned mission simply because the candidate's
   previous answer mentioned another topic.

7. Do not ask about a curriculum day that has already been completed when a
   new target mission is provided.

8. Questions 6–9 should become increasingly adaptive and use the candidate's
   previous answers to determine the next question.

9. Use previous answers to decide whether to:
   - probe deeper,
   - clarify an unclear concept,
   - test practical implementation,
   - explore a trade-off,
   - introduce a realistic scenario,
   - test debugging ability,
   - test architecture,
   - test reliability or production thinking,
   - or move to another relevant competency.

10. Do not assume that mentioning a technical term means the candidate
    understands it.

ANSWER QUALITY HANDLING

Before generating the next question, internally assess the substance of the
candidate's previous answer.

If the previous answer is vague, extremely short, uncertain, incorrect,
contradictory, or demonstrates little technical understanding:

11. Do NOT praise the answer.

12. Do NOT use positive acknowledgements such as:
    - "That's good."
    - "That's a good answer."
    - "Great."
    - "Excellent."
    - "That makes sense."
    - "That's a solid approach."
    - "That gives us a good foundation."
    - "I see how you'd handle that."

13. Do NOT pretend the candidate demonstrated understanding that was not
    actually demonstrated.

14. Ask a focused follow-up that gives the candidate an opportunity to
    demonstrate the missing technical understanding.

15. Do not simply ask:
    - "Can you explain that in more detail?"
    - "Can you give a deeper explanation?"
    - "Can you elaborate?"
    unless there is a specific technical aspect that needs clarification.

16. Instead, identify the missing technical dimension and ask about that
    specific dimension.

17. If the candidate says they do not know, are unsure, or gives an answer
    with essentially no technical content, do not treat the response as a
    strong answer.

18. If the candidate gives a partially correct answer, do not call it fully
    correct. Ask about the specific missing or uncertain part.

19. If the candidate gives a strong, specific, technically supported answer,
    you may continue deeper into the topic.

20. The next question must reflect what the candidate actually demonstrated,
    not what you hoped they demonstrated.
    20A. MANDATORY MISCONCEPTION HANDLING

If the previous answer contains a clear factual or technical misconception,
the next response MUST follow this exact structure:

1. One short sentence correcting or clarifying the misconception.
2. One focused follow-up question testing that same concept.

Do NOT move to a different competency until this follow-up has been answered.

The correction must be neutral and professional. Never say:
"Your answer is wrong."

Example:

Candidate answer:
"Embeddings are encrypted versions of documents and can be decoded back
into the original text."

Required behavior:
"Embeddings are numerical representations of semantic information rather
than reversible encrypted copies of the original text. How would you use
similarity between embeddings to retrieve the relevant source documents?"

The example is illustrative only. Apply the same pattern to the actual
technical misconception in the candidate's answer.

If the previous answer is merely incomplete but not factually incorrect,
do not invent a misconception. Ask a targeted question about the missing
technical dimension instead.

21. Never change the candidate's evaluation merely because their answer is
    short. Judge the technical substance, not the number of words.

22. Never tell the candidate during the interview whether their answer was
    correct, incorrect, strong, weak, good, or bad.

23. Do not reveal your internal assessment of the candidate.

EXAMPLES OF ANSWER HANDLING

If the candidate says:

"I don't know."

Do NOT respond:

"That's okay. That makes sense. Can you explain it in more depth?"

Instead, ask a specific question that tests a fundamental aspect of the
same competency.

If the candidate says:

"Maybe caching, I'm not really sure."

Do NOT respond:

"That's a good starting point. Can you give a deeper explanation?"

Instead, ask something specific such as:

"What information would you use to decide whether caching is appropriate
for this system?"

If the candidate gives a technically strong answer, it is appropriate to
probe a deeper implementation, trade-off, architecture, or production
dimension.

The examples above illustrate the behavior only. Generate questions that
fit the actual conversation.

QUESTION 1 — OPENING

24. Question 1 should feel like the beginning of a real technical interview.

25. It should be broad enough for the candidate to demonstrate understanding,
    while remaining directly relevant to the assigned curriculum mission.

26. Do not always begin with:
    - "To get started..."
    - "Let's get started..."
    - "I'd like to start by..."
    - "First..."
    - "Can you walk me through..."

27. Vary the opening naturally.

28. Do not generate the exact same Question 1 wording across different
    candidates.

29. Use the candidate's role, experience, and curriculum context to create
    a fresh but relevant opening question.

QUESTION NOVELTY

30. NEVER repeat a previous question verbatim.

31. Do not ask a question that is substantially the same as an earlier
    question with only minor wording changes.

32. Compare the proposed question against ALL previous questions.

33. If the same broad topic needs to be explored again, change the angle
    meaningfully.

Possible alternative dimensions include:

- implementation
- debugging
- architecture
- scalability
- reliability
- security
- monitoring
- cost
- latency
- failure handling
- practical trade-offs

34. The goal is not to avoid a topic completely.

35. The goal is to avoid redundant questions while still evaluating the
    required competency thoroughly.

36. Vary question types naturally:

- conceptual
- practical implementation
- scenario-based
- debugging
- architecture
- trade-off
- production engineering
- decision-making

QUESTION LENGTH AND FOCUS

37. Keep questions concise and suitable for a live interview.

38. Prefer approximately 1–3 sentences.

39. Ask ONE focused question at a time.

40. Do not combine many independent questions into one large question.

41. Do not create questions containing long lists of requirements.

42. Avoid unrelated "and" clauses that turn one question into several tasks.

43. If several dimensions need to be evaluated, spread them across subsequent
    questions.

44. Do not ask the candidate to produce multiple separate deliverables in
    one question.

45. The candidate should immediately understand what they are being asked.

CONVERSATIONAL STYLE

46. The interview should sound like a real human technical interviewer.

47. A short transition may be used when it genuinely fits the previous answer.

48. However, NEVER use positive acknowledgement when the previous answer was
    vague, weak, uncertain, incorrect, or empty.

49. For weak answers, it is completely acceptable to begin directly with the
    next question.

50. Do not force a transition before every question.

51. Do not repeatedly say:
    - "Good answer."
    - "Great answer."
    - "Excellent."
    - "That makes sense."
    - "That's a good point."
    - "That's a solid approach."

52. Do not artificially praise the candidate.

53. Do not evaluate or score the candidate during the interview.

54. Do not provide hints that reveal the expected answer.

55. Do not explicitly announce topic changes.

56. Never say:
    - "We've covered..."
    - "Let's move to the next topic."
    - "Moving to the next section..."
    - "According to the curriculum..."
    - "For Day 2..."
    - "The next question..."
    - "Question ${questionNumber}..."
    - "Based on the curriculum..."
    - "Let's move forward to the next topic..."

57. Never expose internal interview terminology, curriculum-selection logic,
    scoring logic, or evaluation strategy.

CANDIDATE NAME

58. Do not repeatedly address the candidate by name.

59. Use the name only when it feels natural.

QUESTION OPENING VARIETY

60. Avoid repeatedly starting questions with:

- "Can you walk me through..."
- "Can you describe..."
- "Imagine..."
- "How would you..."
- "Could you explain..."

61. Vary wording naturally without making the language unnatural.

NATURAL ADAPTATION

62. Treat the previous answer as actual conversational context.

63. If the previous answer contains a useful technical detail, use that detail
    to make the next question more specific when appropriate.

64. If the previous answer is vague, probe the missing technical concept.

65. If the previous answer is strong, increase the difficulty or explore a
    meaningful related dimension.

66. If the previous answer contains a clear technical misconception,
    do not explicitly label the candidate's answer as "wrong" or "incorrect."
    Instead, briefly acknowledge the relevant issue in a neutral,
    technically accurate way, and ask a focused follow-up that tests
    whether the candidate understands the correct concept.

    For example, do not say:
    "That answer is wrong."

    Prefer:
    "That approach would create a problem because embeddings are not
    reversible representations of the original text. How would you use
    similarity between embeddings to retrieve the relevant source content?"
67. Maintain a professional but conversational tone.

68. The interview should feel adaptive rather than predetermined.

QUESTION 10 — FINAL QUESTION

69. Question 10 is the final interview question.

70. Do not introduce an obscure new technology simply because it has not
    appeared earlier.

71. The final question should feel like a natural closing technical question.

72. Prefer evaluating technical judgment, prioritization, practical
    decision-making, production readiness, or an important trade-off.

73. The final question should remain concise.

74. Do not turn the final question into several unrelated questions.
ANSWER EVALUATION AND ADAPTATION

Before asking the next question, evaluate the candidate's previous answer.

If the answer is strong and technically correct:
- Briefly acknowledge the demonstrated understanding.
- Increase the difficulty or explore a deeper trade-off, implementation detail,
  scalability issue, or production concern.

If the answer is partially correct:
- Briefly identify what was understood.
- Identify the important concept that is missing.
- Ask the next question specifically about that missing concept.

If the answer contains a clear technical misconception:

- The next response MUST briefly address the specific misconception before
  asking the next question.
- Do not simply move to a new topic.
- Do not praise or agree with the incorrect claim.
- Do not say "your answer is wrong" or use judgmental language.
- Give one short, technically accurate correction or clarification.
- Then ask ONE focused follow-up question that directly tests whether the
  candidate understands the corrected concept.
- The follow-up must remain connected to the same technical concept.

Example:

Candidate:
"Embeddings are encrypted versions of the original text, so we can decode
the vector to recover the document."

Preferred response:
"Embeddings are numerical representations of semantic information rather
than reversible encrypted copies of the original text. How would you use
similarity between embeddings to retrieve the relevant source documents?"

Do NOT respond by simply asking an unrelated question such as:
"How would you implement a retrieval and matching engine?"

If the answer is empty, extremely short, vague, or clearly indicates uncertainty:
- Do not praise the answer.
- State that there is not enough information to assess the concept.
- Return to the relevant fundamentals with a focused question.

Never use generic transitions such as:
"That makes sense", "Great answer", "Good answer", or "Exactly"
unless the candidate's previous response actually demonstrates the
technical understanding being acknowledged.

The next question must be influenced by the previous answer.
FINAL PRIORITY

The priority order is:

1. Correct target curriculum mission.
2. Relevance to the candidate.
3. Honest adaptation to the candidate's previous answer.
4. No redundant questions.
5. Natural conversational flow.
6. Concise and focused questioning.
7. Progressive technical depth.
8. Natural variation in wording.
9. Appropriate final-question behavior.

Most importantly:

NEVER pretend a weak candidate answer was strong.

NEVER praise an answer that did not demonstrate technical understanding.

NEVER ask a vague "explain more" follow-up when a specific technical
follow-up can be asked.

Generate exactly ONE next interview question now.
`;
  try {
    
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a professional technical interviewer. Follow the interviewer's instructions exactly.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
const generatedQuestion =
  response.choices[0].message.content.trim();

const previousAnswer =
  history.length > 0
    ? history[history.length - 1].answer
    : "";

if (isWeakAnswer(previousAnswer)) {
  return generatedQuestion.replace(
    /^(That makes sense[.!]?\s*|I see[.!]?\s*|Right[.!]?\s*|Exactly[.!]?\s*|Good answer[.!]?\s*|Great answer[.!]?\s*|Excellent[.!]?\s*|That's good[.!]?\s*|That's a good answer[.!]?\s*|That's a solid approach[.!]?\s*|That gives us a good foundation[.!]?\s*)/i,
    ""
  ).trim();
}

return generatedQuestion;
  

 } catch (error) {

  console.error("❌ GROQ QUESTION ERROR:", error);

  console.warn("⚠️ GROQ UNAVAILABLE — USING FALLBACK QUESTION");

  return getFallbackQuestion(
    context,
    questionNumber,
    targetMission,
     history
  );
}
}

async function generateInterviewFeedback(context, history) {
  const prompt = `
You are an experienced technical interviewer evaluating a completed interview.

Candidate:
Name: ${context.candidate.name}
Role: ${context.candidate.jobRole}
Experience: ${context.candidate.yearsExperience} years
Education: ${context.candidate.education}

Interview Responses:

${history
  .map(
    (item, index) =>
      `Question ${index + 1}:
${item.question}

Candidate Answer:
${item.answer}`
  )
  .join("\n\n")}

Evaluate the candidate based only on the interview responses and candidate context.

Return the evaluation as valid JSON with exactly these fields:

{
  "summary": "A concise overall assessment",
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "gaps": [
    "gap 1",
    "gap 2"
  ],
  "next": [
    "recommended improvement 1",
    "recommended improvement 2"
  ],
  "topicAnalysis": [
    {
      "topic": "Topic name",
      "assessment": "Strong",
      "evidence": "Specific evidence from the candidate's responses",
      "improvement": "Specific area the candidate could improve"
    }
  ]
}

Rules:
- Be specific to the candidate's responses.
- Do not invent experience or skills that were not demonstrated.
- Keep the feedback professional and constructive.
- Do not include markdown.
- Return JSON only.
- Identify the main technical topics actually assessed in the interview.
- Do not invent topics that were not discussed.
- Group related questions under the same technical topic instead of creating
  one topic for every question.
- Evaluate each topic using only evidence from the candidate's responses.
- Use exactly one assessment level for each topic:
  "Strong", "Partial", or "Needs Improvement".
- "Strong" means the candidate demonstrated technically accurate,
  sufficiently detailed understanding.
- "Partial" means the candidate demonstrated some understanding but had
  meaningful gaps or lacked depth.
- "Needs Improvement" means the candidate showed little understanding,
  gave incorrect answers, or provided insufficient evidence.
- Keep the evidence specific and concise.
- The improvement should explain what the candidate should strengthen,
  not simply repeat the assessment.
- Prefer approximately 3 to 6 major topics for a completed interview.
`;

  try {
  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are a professional technical interviewer. Return only the requested JSON object.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    response_format: {
      type: "json_object",
    },
  });

  return response.choices[0].message.content.trim();

} catch (error) {

  if (isRateLimitError(error)) {
    console.warn(
      "Groq rate limit/quota reached. Using fallback feedback."
    );

    return getFallbackFeedback(history, context);
  }

  throw error;
}
}

module.exports = {
  generateInterviewQuestion,
  generateInterviewFeedback,
  selectRoleRelevantMissions,
};
const {
  generateInterviewQuestion,
  generateInterviewFeedback,
} = require("../services/geminiService");
const { getCandidateById } = require("../services/candidateService");
const { getCurriculum } = require("../services/curriculumService");
const { buildInterviewContext } = require("../services/interviewEngine");

const sessions = {};

const TOTAL_QUESTIONS = 10;

function getCurriculumDays(context, curriculum) {
  const curriculumDays = curriculum.curriculum || curriculum.days || curriculum;

  return context.missions
    .filter((mission) => mission.passed)
    .map((mission) => {
      const curriculumMission = curriculumDays.find(
        (item) => item.day === mission.day
      );

      return {
        day: mission.day,
        title: mission.title,
        objectives: curriculumMission
          ? curriculumMission.objectives || []
          : [],
      };
    })
    .filter(
      (mission, index, array) =>
        index ===
        array.findIndex((item) => item.day === mission.day)
    );
}

const handleInterview = async (req, res) => {
  try {
    const { sessionId, candidateId, message } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        error: "sessionId is required",
      });
    }

    // ==========================================
    // START NEW INTERVIEW
    // ==========================================
    if (candidateId) {
      const candidate = getCandidateById(candidateId);

      if (!candidate) {
        return res.status(404).json({
          error: "Candidate not found",
        });
      }

      const curriculum = getCurriculum();

      const context = buildInterviewContext(
        candidate,
        curriculum
      );

      // Get unique completed curriculum days
      const curriculumDays = getCurriculumDays(context, curriculum);

      // Requirement: at least 4 different curriculum days
      if (curriculumDays.length < 4) {
        return res.status(400).json({
          error:
            "Candidate does not have at least 4 completed curriculum days",
        });
      }

      // Q1 targets the first curriculum day
      const firstTargetMission = curriculumDays[0];

      const question = await generateInterviewQuestion(
        context,
        [],
        1,
        firstTargetMission,
        []
      );

      // Create interview session
      sessions[sessionId] = {
        candidate,
        context,
        questionNumber: 1,
        currentQuestion: question,
        history: [],
        curriculumDays,
        coveredDays: [firstTargetMission.day],
      };

      return res.json({
        reply: question,
        done: false,
      });
    }

    // ==========================================
    // CONTINUE EXISTING INTERVIEW
    // ==========================================

    const session = sessions[sessionId];

    if (!session) {
      return res.status(404).json({
        error: "Interview session not found",
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: "message is required",
      });
    }

    // Save the candidate's answer to the current question
    session.history.push({
        questionNumber: session.questionNumber,
      question: session.currentQuestion,
      answer: message.trim(),
    });

    // ==========================================
    // FINISH AFTER QUESTION 10
    // ==========================================

    if (session.questionNumber > TOTAL_QUESTIONS) {
  const feedbackText = await generateInterviewFeedback(
    session.context,
    session.history
  );

  let feedback;

  try {
    feedback = JSON.parse(feedbackText);
  } catch (error) {
    console.error("Feedback parsing error:", error);

    feedback = {
      summary: feedbackText,
      strengths: [],
      gaps: [],
      next: [],
    };
  }

  delete sessions[sessionId];

  return res.json({
    reply: "Interview completed.",
    done: true,
    feedback,
  });
}
    // ==========================================
    // MOVE TO NEXT QUESTION
    // ==========================================

    session.questionNumber += 1;

    let targetDay = null;

   /*
 * Questions 1-5 cover up to five different
 * completed curriculum days when available.
 *
 * Q1 -> curriculumDays[0]
 * Q2 -> curriculumDays[1]
 * Q3 -> curriculumDays[2]
 * Q4 -> curriculumDays[3]
 * Q5 -> curriculumDays[4] when available
 *
 * Q6-Q9 -> adaptive technical questions
 * Q10 -> final interview question
 */

let targetMission = null;

if (session.questionNumber <= 5) {
  targetMission =
    session.curriculumDays[
      session.questionNumber - 1
    ];

  if (targetMission) {
    if (!session.coveredDays.includes(targetMission.day)) {
      session.coveredDays.push(targetMission.day);
    }
  }
}
    

    const nextQuestion = await generateInterviewQuestion(
      session.context,
      session.history,
      session.questionNumber,
      targetMission,
      session.coveredDays
    );

    session.currentQuestion = nextQuestion;

    return res.json({
      reply: nextQuestion,
      done: false,
    });

  } catch (error) {
    console.error("Interview error:", error);

    return res.status(500).json({
      error:
        "AI service quota is temporarily unavailable",
    });
  }
};

module.exports = {
  handleInterview,
};
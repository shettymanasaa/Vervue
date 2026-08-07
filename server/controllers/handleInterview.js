const { generateInterviewQuestion } = require("../services/geminiService");
const { getCandidateById } = require("../services/candidateService");
const { getCurriculum } = require("../services/curriculumService");
const { buildInterviewContext } = require("../services/interviewEngine");

const handleInterview = async (req, res) => {

    const { sessionId, candidateId } = req.body;

    if (!sessionId) {
        return res.status(400).json({
            error: "sessionId is required"
        });
    }

    if (candidateId) {

        const candidate = getCandidateById(candidateId);

        if (!candidate) {
            return res.status(404).json({
                error: "Candidate not found"
            });
        }

        const curriculum = getCurriculum();

        const context = buildInterviewContext(
            candidate,
            curriculum
        );

       const question = await generateInterviewQuestion(context);

return res.json({
    reply: question,
    done: false
}); 

    }

    return res.json({
        reply: "Interview session continued.",
        done: false
    });

};

module.exports = {
    handleInterview
};
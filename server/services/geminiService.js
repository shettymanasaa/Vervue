const ai = require("../config/gemini");

async function generateInterviewQuestion(context) {

    const prompt = `
You are an experienced technical interviewer.

Candidate Details:
Name: ${context.candidate.name}
Role: ${context.candidate.jobRole}
Experience: ${context.candidate.yearsExperience} years
Education: ${context.candidate.education}

Completed Topics:
${context.missions
    .filter(m => m.passed)
    .map(m => "- " + m.title)
    .join("\n")}

Interview Stage:
Introduction

Instructions:
- Ask ONE interview question only.
- Make it natural and conversational.
- Don't explain the answer.
- Don't number the question.
- Don't use markdown.
`;

    const response = await ai.models.generateContent({
       model: "gemini-flash-latest",
        contents: prompt,
    });

    return response.text;

}

module.exports = {
    generateInterviewQuestion
};
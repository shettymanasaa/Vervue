function buildInterviewContext(candidate, curriculum) {

    return {
        candidate: candidate.member,
        missions: candidate.missions,
        signals: candidate.signals,
        curriculum
    };

}

module.exports = {
    buildInterviewContext
};
const { getCandidates } = require("../services/candidateService");

const handleGetCandidates = (req, res) => {
    const candidates = getCandidates();

    res.json({
        candidates
    });
};

module.exports = {
    handleGetCandidates
};
const data = require("../data/candidates.json");

function getCandidates() {
    return data.candidates;
}

function getCandidateById(id) {
    return data.candidates.find(
        candidate => candidate.member.id === id
    );
}

module.exports = {
    getCandidates,
    getCandidateById
};
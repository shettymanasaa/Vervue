const data = require("../data/candidates.json");

function getCandidateById(id) {
    return data.candidates.find(
        candidate => candidate.member.id === id
    );
}

module.exports = {
    getCandidateById
};
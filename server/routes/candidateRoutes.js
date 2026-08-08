const express = require("express");
const { handleGetCandidates } = require("../controllers/getCandidates");

const router = express.Router();

router.get("/", handleGetCandidates);

module.exports = router;
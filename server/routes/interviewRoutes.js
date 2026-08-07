const express = require("express");
const router = express.Router();

const {
  handleInterview
} = require("../controllers/handleInterview");

router.post("/", handleInterview);

module.exports = router;
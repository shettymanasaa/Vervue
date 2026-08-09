const express = require("express");
const cors = require("cors");

const interviewRoutes = require("./routes/interviewRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Vervue API is running");
});

app.use("/api/interview", interviewRoutes);
app.use("/api/candidates", candidateRoutes);

module.exports = app;
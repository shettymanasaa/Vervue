const express = require("express");
const cors = require("cors");

const interviewRoutes = require("./routes/interviewRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("AI Interview Agent API is running 🚀");
});

app.use("/api/interview", interviewRoutes);

module.exports = app;
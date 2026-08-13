import { useEffect, useState } from "react";
import "./App.css";
const API_URL = "http://localhost:5000";

function App() {
  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  const [page, setPage] = useState("home");
  const [candidates, setCandidates] = useState([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState("");
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [answer, setAnswer] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
const [questionNumber, setQuestionNumber] = useState(1);
const [feedback, setFeedback] = useState(null);
const [interviewHistory, setInterviewHistory] = useState([]);
const [interviewMeta, setInterviewMeta] = useState({
  startedAt: null,
  completedAt: null,
  durationSeconds: 0,
  status: null,
});

  const TOTAL_QUESTIONS = 10;

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", theme);
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const openCandidateSelection = async () => {
    setPage("candidates");
    setLoadingCandidates(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/candidates`);

      if (!response.ok) {
        throw new Error("Failed to load candidates");
      }

      const data = await response.json();
      setCandidates(data.candidates);
    } catch (error) {
      console.error(error);
      setError(
        "Unable to load candidates. Make sure the backend is running."
      );
    } finally {
      setLoadingCandidates(false);
    }
  };

  const selectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
  };

  const startInterview = async () => {
    if (!selectedCandidate) return;

    const newSessionId = `session-${Date.now()}`;

    setSessionId(newSessionId);
setLoadingQuestion(true);
setError("");
setQuestion("");
setAnswer("");
setQuestionNumber(1);
setFeedback(null);
setInterviewHistory([]);

    try {
      const response = await fetch(`${API_URL}/api/interview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: newSessionId,
          candidateId: selectedCandidate.member.id,
        }),
      });

      if (!response.ok) {
  const errorData = await response.json();
  throw new Error(errorData.error || "Failed to start interview");
}

      const data = await response.json();

      setQuestion(data.reply);
    } catch (error) {
      console.error(error);
      setError("Unable to start the interview. Please try again.");
    } finally {
      setLoadingQuestion(false);
    }
  };
  const submitAnswer = async () => {
  if (!answer.trim() || !sessionId || submittingAnswer) {
    return;
  }

  setSubmittingAnswer(true);
  setError("");

  try {
    const response = await fetch(`${API_URL}/api/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        message: answer.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit answer");
    }
 setInterviewHistory((prev) => [
  ...prev,
  {
    question,
    answer: answer.trim(),
  },
]);

   if (data.done) {
  setFeedback(data.feedback);

  setInterviewMeta({
    startedAt: data.startedAt,
    completedAt: data.completedAt,
    durationSeconds: data.durationSeconds || 0,
    status: data.status || "completed",
  });

  setPage("transcript");
  setAnswer("");
  return;
}

    setQuestion(data.reply);
setAnswer("");
setQuestionNumber((prev) => prev + 1);
setFeedback(null);
  } catch (error) {
    console.error(error);
    setError(
      error.message || "Unable to submit your answer. Please try again."
    );
  } finally {
    setSubmittingAnswer(false);
  }};
    const endInterview = async () => {
  if (!sessionId) return;

  const confirmed = window.confirm(
    `End interview now? Your ${questionNumber - 1} completed responses will be used for a partial assessment.`
  );

  if (!confirmed) return;

  setError("");

  try {
    const response = await fetch(`${API_URL}/api/interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        endInterview: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to end interview");
    }

    setFeedback(data.feedback);

setInterviewMeta({
  startedAt: data.startedAt,
  completedAt: data.completedAt,
  durationSeconds: data.durationSeconds || 0,
  status: data.status || "completed_early",
});

setPage("feedback");
setAnswer("");
  } catch (error) {
    console.error(error);
    setError(error.message || "Unable to end the interview.");
  }
};
  

  const filteredCandidates = candidates.filter((candidate) => {
    const search = searchTerm.toLowerCase().trim();

    return (
      candidate.member.name.toLowerCase().includes(search) ||
      candidate.member.jobRole.toLowerCase().includes(search) ||
      candidate.member.id.toLowerCase().includes(search)
    );
  });
const formatDuration = (seconds) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
};

const formatInterviewDate = (dateString) => {
  if (!dateString) return "—";

  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};
  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <span>Vervue</span>
        </div>

        <select
          className="theme-select"
          value={theme}
          onChange={(event) => setTheme(event.target.value)}
          aria-label="Select theme"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="system">System</option>
        </select>
      </nav>

      {/* LANDING PAGE */}
     {/* LANDING PAGE */}
{page === "home" && (
  <main className="home-page">

    {/* HERO */}
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">AI-POWERED INTERVIEW PLATFORM</p>

        <h1>
          Technical interviews,
          <br />
          built around the candidate.
        </h1>

        <p className="hero-description">
          Vervue conducts personalized technical interviews with
          adaptive AI questioning and structured candidate feedback.
        </p>

        <button
          className="primary-button"
          onClick={openCandidateSelection}
        >
          Start an Interview
        </button>
      </div>
    </section>

    {/* WHAT IS VERVUE? */}
    <section className="home-section">
      <div className="home-section-content">
        <p className="eyebrow">WHAT IS VERVUE?</p>

        <h2>Technical interviews that adapt to the candidate.</h2>

        <p>
          Vervue is an AI-powered technical interview platform designed
          to evaluate candidates through personalized, role-relevant
          conversations rather than a fixed list of questions.
        </p>
      </div>
    </section>

    {/* WHO IS IT FOR? */}
    <section className="home-section">
      <div className="home-section-content">
        <p className="eyebrow">WHO IS IT FOR?</p>

        <h2>Built for better technical evaluation.</h2>

        <div className="home-two-column">
          <div className="home-info-card">
            <h3>Interviewers & Recruiters</h3>
            <p>
              Conduct structured technical interviews and review
              AI-generated assessments based on candidate responses.
            </p>
          </div>

          <div className="home-info-card">
            <h3>Candidates</h3>
            <p>
              Experience a realistic technical interview that responds
              to your demonstrated knowledge and technical depth.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* WHAT DOES IT DO? */}
    <section className="home-section">
      <div className="home-section-content">
        <p className="eyebrow">WHAT DOES IT DO?</p>

        <h2>From interview to structured assessment.</h2>

        <div className="home-feature-grid">
          <div className="home-info-card">
            <span className="home-card-number">01</span>
            <h3>Role-Specific Questions</h3>
            <p>
              Questions are generated around the candidate's role,
              experience, and technical areas being evaluated.
            </p>
          </div>

          <div className="home-info-card">
            <span className="home-card-number">02</span>
            <h3>Adaptive Interviewing</h3>
            <p>
              The interview uses previous responses as context for
              generating subsequent questions.
            </p>
          </div>

          <div className="home-info-card">
            <span className="home-card-number">03</span>
            <h3>AI-Powered Feedback</h3>
            <p>
              Completed interviews produce structured summaries,
              strengths, gaps, and recommended next steps.
            </p>
          </div>

          <div className="home-info-card">
            <span className="home-card-number">04</span>
            <h3>Topic-Wise Analysis</h3>
            <p>
              Candidate performance can be reviewed across the major
              technical topics assessed during the interview.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="home-section">
      <div className="home-section-content">
        <p className="eyebrow">HOW IT WORKS</p>

        <h2>A simple interview workflow.</h2>

        <div className="home-process">
          <div className="home-process-step">
            <span>01</span>
            <h3>Select</h3>
            <p>Select the candidate you want to interview.</p>
          </div>

          <div className="home-process-step">
            <span>02</span>
            <h3>Interview</h3>
            <p>Conduct a role-specific technical interview.</p>
          </div>

          <div className="home-process-step">
            <span>03</span>
            <h3>Adapt</h3>
            <p>Questions respond to the candidate's previous answers.</p>
          </div>

          <div className="home-process-step">
            <span>04</span>
            <h3>Assess</h3>
            <p>Review structured AI-generated feedback.</p>
          </div>
        </div>
      </div>
    </section>

    {/* WHY IS IT USEFUL? */}
    <section className="home-section home-benefits">
      <div className="home-section-content">
        <p className="eyebrow">WHY VERVUE?</p>

        <h2>More than a fixed questionnaire.</h2>

        <p>
          Vervue brings the interview, candidate responses, transcript,
          and structured assessment into one workflow—helping interviewers
          evaluate technical understanding more consistently.
        </p>
      </div>
    </section>

    {/* FINAL CTA */}
    <section className="home-cta">
      <p className="eyebrow">READY TO START?</p>

      <h2>Conduct your next technical interview with Vervue.</h2>

      <button
        className="primary-button"
        onClick={openCandidateSelection}
      >
        Start an Interview
      </button>
    </section>

  </main>
)}
      {/* CANDIDATE SELECTION */}
      {page === "candidates" && (
        <main className="candidate-page">
          <div className="candidate-header">
            <button
              className="back-button"
              onClick={() => {
                setPage("home");
                setSelectedCandidate(null);
                setSearchTerm("");
              }}
            >
              ← Back to Home
            </button>

            <p className="eyebrow">INTERVIEW SETUP</p>

            <h1>Select a candidate</h1>

            <p className="page-description">
              Choose a candidate to begin their personalized technical
              interview.
            </p>

            <input
              className="candidate-search"
              type="search"
              placeholder="Search by name, role, or candidate ID"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />

           
          </div>

          {loadingCandidates && (
            <p className="status-message">Loading candidates...</p>
          )}

          {error && <p className="error-message">{error}</p>}

          {!loadingCandidates && !error && (
            <>
              {filteredCandidates.length === 0 ? (
                <p className="status-message">No candidates found.</p>
              ) : (
                <div className="candidate-grid">
                  {filteredCandidates.map((candidate) => {
                    const member = candidate.member;

                    const isSelected =
                      selectedCandidate?.member.id === member.id;

                    return (
                      <div
                        className={`candidate-card ${
                          isSelected ? "selected" : ""
                        }`}
                        key={member.id}
                      >
                        <div className="candidate-card-top">
                          <div className="candidate-avatar">
                            {member.name.charAt(0)}
                          </div>

                          {isSelected && (
                            <span className="selected-label">
                              Selected
                            </span>
                          )}
                        </div>

                        <h2>{member.name}</h2>

                        <p className="candidate-role">
                          {member.jobRole}
                        </p>

                        <div className="candidate-details">
                          <span>
                            {member.yearsExperience} years
                          </span>

                          <span>{member.education}</span>
                        </div>

                       <button
  className={
    isSelected
      ? "primary-button card-button"
      : "primary-button card-button"
  }
  onClick={() => {
    if (isSelected) {
      setPage("interview");
      startInterview();
    } else {
      selectCandidate(candidate);
    }
  }}
>
  {isSelected ? "Start Interview →" : "Select Candidate"}
</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      )}

      {/* INTERVIEW SCREEN */}
      {page === "interview" && selectedCandidate && (
        <main className="interview-page">
          <div className="interview-topbar">
            <button
              className="back-button"
              onClick={() => {
                setPage("candidates");
                setQuestion("");
                setAnswer("");
                setError("");
                setQuestionNumber(1);
setFeedback(null);
setSessionId(null);
              }}
            >
              ← Exit Interview
            </button>

            <span className="question-count">
  Question {questionNumber} of 11
</span>
          </div>

          <div className="interview-layout">
            <aside className="candidate-panel">
              <div className="candidate-avatar">
                {selectedCandidate.member.name.charAt(0)}
              </div>

              <h2>{selectedCandidate.member.name}</h2>

              <p>{selectedCandidate.member.jobRole}</p>

              <div className="candidate-meta">
                <span>
                  {selectedCandidate.member.yearsExperience} years
                </span>

                <span>
                  {selectedCandidate.member.education}
                </span>
              </div>
            </aside>

            <section className="interview-content">
              <div className="progress-section">
                <div className="progress-label">
                  <span>Interview Progress</span>
                <span>
  {questionNumber} / 11
</span>
                </div>

                <div className="progress-bar">
  <div
    className="progress-fill"
    style={{
  width: `${Math.min((questionNumber / 11) * 100, 100)}%`,
}}
  ></div>
</div>
              </div>

              <div className="question-section">
                <p className="eyebrow">AI INTERVIEWER</p>

                <h1>
                  {loadingQuestion
                    ? "Preparing your interview question..."
                    : question}
                </h1>

                {error && (
                  <p className="error-message">{error}</p>
                )}
              </div>

              <div className="answer-section">
                <label htmlFor="answer">YOUR ANSWER</label>

                <textarea
                  id="answer"
                  placeholder="Type your response here..."
                  rows="8"
                  value={answer}
                  onChange={(event) =>
                    setAnswer(event.target.value)
                  }
                />

                <div className="answer-actions">
  <button
    className="primary-button"
    onClick={submitAnswer}
    disabled={submittingAnswer || !answer.trim()}
  >
    {submittingAnswer ? "Submitting..." : "Submit Answer"}
  </button>

  <button
    className="secondary-button"
    onClick={endInterview}
    disabled={submittingAnswer}
  >
    End Interview
  </button>
</div>
              </div>
            </section>
          </div>
        </main>
      )}
      {/* INTERVIEW TRANSCRIPT */}
{page === "transcript" && selectedCandidate && (
  <main className="transcript-page">
    <div className="transcript-header">
      <p className="eyebrow">INTERVIEW COMPLETE</p>

      <h1>Interview Transcript</h1>

      <p className="page-description">
        Review the questions and answers from {selectedCandidate.member.name}'s
        interview.
      </p>
    </div>

    <div className="transcript-list">
      {interviewHistory.map((item, index) => (
        <section className="transcript-item" key={index}>
          <span className="transcript-number">
            Question {index + 1}
          </span>

          <h2>{item.question}</h2>

          <div className="transcript-answer">
            <span>Your Answer</span>
            <p>{item.answer}</p>
          </div>
        </section>
      ))}
    </div>

    <div className="transcript-actions">
      <button
        className="primary-button"
        onClick={() => setPage("feedback")}
      >
        View Feedback
      </button>

      <button
        className="secondary-button"
        onClick={() => {
          setPage("home");
          setSelectedCandidate(null);
          setSessionId(null);
          setQuestion("");
          setAnswer("");
          setFeedback(null);
          setInterviewHistory([]);
          setQuestionNumber(1);
          setError("");
        }}
      >
        Back to Home
      </button>
    </div>
  </main>
)}
            {/* FEEDBACK SCREEN */}
      {page === "feedback" && feedback && selectedCandidate && (
        <main className="feedback-page">
          <div className="feedback-header">
            <p className="eyebrow">INTERVIEW COMPLETE</p>

            <h1>Interview Feedback</h1>

            <p className="page-description">
              Here's the AI-generated assessment of {selectedCandidate.member.name}'s
              interview performance.
            </p>
          </div>
          <div className="feedback-meta">
  <div className="feedback-meta-item">
    <span className="feedback-meta-label">DATE</span>
    <strong>
      {formatInterviewDate(interviewMeta.completedAt)}
    </strong>
  </div>

  <div className="feedback-meta-item">
    <span className="feedback-meta-label">TIME TAKEN</span>
    <strong>
      {formatDuration(interviewMeta.durationSeconds)}
    </strong>
  </div>

  <div className="feedback-meta-item">
    <span className="feedback-meta-label">STATUS</span>
    <strong>
      {interviewMeta.status === "completed_early"
        ? "Completed Early"
        : "Completed"}
    </strong>
  </div>
</div>

          {/* SUMMARY */}
          <section className="feedback-section">
            <h2>Overall Summary</h2>
            <p>{feedback.summary}</p>
          </section>

          {/* STRENGTHS */}
          <section className="feedback-section">
            <h2>Strengths</h2>

            {feedback.strengths?.length > 0 ? (
              <ul className="feedback-list">
                {feedback.strengths.map((strength, index) => (
                  <li key={index}>{strength}</li>
                ))}
              </ul>
            ) : (
              <p>No strengths recorded.</p>
            )}
          </section>

          {/* GAPS */}
          <section className="feedback-section">
            <h2>Areas for Improvement</h2>

            {feedback.gaps?.length > 0 ? (
              <ul className="feedback-list">
                {feedback.gaps.map((gap, index) => (
                  <li key={index}>{gap}</li>
                ))}
              </ul>
            ) : (
              <p>No major gaps recorded.</p>
            )}
          </section>

          {/* NEXT STEPS */}
          <section className="feedback-section">
            <h2>Recommended Next Steps</h2>

            {feedback.next?.length > 0 ? (
              <ul className="feedback-list">
                {feedback.next.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>No additional recommendations.</p>
            )}
          </section>
          {feedback.topicAnalysis?.length > 0 && (
  <section className="feedback-section topic-analysis-section">
    <h2>Topic-wise Performance</h2>

    <div className="topic-analysis-grid">
      {feedback.topicAnalysis.map((topic, index) => (
        <div className="topic-analysis-card" key={index}>
          <div className="topic-analysis-header">
            <h3>{topic.topic}</h3>

            <span
              className={`topic-assessment ${String(
                topic.assessment
              ).toLowerCase().replace(/\s+/g, "-")}`}
            >
              {topic.assessment}
            </span>
          </div>

          <div className="topic-analysis-block">
            <span>Evidence</span>
            <p>{topic.evidence}</p>
          </div>

          <div className="topic-analysis-block">
            <span>Improvement</span>
            <p>{topic.improvement}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

          {/* ACTIONS */}
          <div className="feedback-actions">
  <button
    className="primary-button"
    onClick={() => {
      setPage("candidates");
      setSelectedCandidate(null);
      setSessionId(null);
      setQuestion("");
      setAnswer("");
      setFeedback(null);
      setInterviewHistory([]);
      setQuestionNumber(1);
      setError("");
    }}
  >
    Start Another Interview
  </button>

  <button
    className="secondary-button"
    onClick={() => setPage("transcript")}
  >
    Back to Transcript
  </button>
</div>
        </main>
      )}
    </div>
  );
}

export default App;
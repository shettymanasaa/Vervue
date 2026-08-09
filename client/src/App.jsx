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
        throw new Error("Failed to start interview");
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

    if (data.done) {
      setFeedback(data.feedback);
      setPage("feedback");
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

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <span className="brand-mark">AI</span>
          <span>Interview Agent</span>
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
      {page === "home" && (
        <main className="hero">
          <div className="hero-content">
            <p className="eyebrow">AI-POWERED INTERVIEW PLATFORM</p>

            <h1>
              Technical interviews,
              <br />
              built around the candidate.
            </h1>

            <p className="hero-description">
              Conduct personalized technical interviews using candidate
              profiles, learning history, and AI-generated questions.
            </p>

            <button
              className="primary-button"
              onClick={openCandidateSelection}
            >
              Start an Interview
            </button>
          </div>
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

            {/* Selected candidate action */}
            {selectedCandidate && (
              <div className="selected-candidate-action">
                <div>
                  <span className="selected-candidate-label">
                    SELECTED CANDIDATE
                  </span>

                  <strong>{selectedCandidate.member.name}</strong>

                  <span>{selectedCandidate.member.jobRole}</span>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    setPage("interview");
                    startInterview();
                  }}
                >
                  Continue with {selectedCandidate.member.name}
                </button>
              </div>
            )}
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
                              ? "secondary-button"
                              : "primary-button card-button"
                          }
                          onClick={() => selectCandidate(candidate)}
                        >
                          {isSelected
                            ? "Selected"
                            : "Select Candidate"}
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
  Question {questionNumber} of {TOTAL_QUESTIONS}
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
  {questionNumber} / {TOTAL_QUESTIONS}
</span>
                </div>

                <div className="progress-bar">
  <div
    className="progress-fill"
    style={{
      width: `${(questionNumber / TOTAL_QUESTIONS) * 100}%`,
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
                </div>
              </div>
            </section>
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
                setQuestionNumber(1);
                setError("");
              }}
            >
              Start Another Interview
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
                setQuestionNumber(1);
                setError("");
              }}
            >
              Back to Home
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;
# Vervue

Vervue is an AI-powered technical interview platform that conducts
personalized, role-specific interviews and generates structured candidate
assessments.

Instead of relying on a fixed questionnaire, Vervue uses the candidate's
previous responses as context for generating subsequent interview questions.

## Key Features

- Candidate selection and profile-based interviews
- Role-specific technical questions
- Adaptive AI-generated follow-up questions
- AI-powered interview evaluation
- Complete interview transcript
- Overall candidate assessment
- Strengths and areas for improvement
- Recommended next steps
- Topic-wise performance analysis
- Interview date and duration tracking
- Completed and early-completed interview support
- Light, dark, and system themes
- Production deployment

## Interview Flow

Home
→ Candidate Selection
→ Technical Interview
→ Transcript
→ AI Feedback
→ Topic-wise Performance

## How Vervue Works

1. Select a candidate
2. Start a personalized technical interview
3. Candidate answers each technical question
4. The AI uses previous responses as context for subsequent questions
5. The interview can be completed normally or ended early
6. The completed transcript is preserved
7. AI-generated feedback evaluates the interview
8. The feedback includes strengths, gaps, recommendations, and
   topic-wise performance

## Tech Stack

### Frontend

- React
- Vite
- CSS

### Backend

- Node.js
- REST API
- AI/LLM integration

### Deployment

- Vercel

## Project Structure

```text
client/   → React + Vite frontend
server/   → Node.js backend and AI interview logic
# Vervue

Vervue is an AI-powered personalized interview platform that conducts
candidate-specific technical interviews and provides an interview transcript
and AI-generated feedback.

## Features

- Candidate selection
- Personalized interview questions
- Adaptive follow-up questions
- AI-powered interview evaluation
- Complete interview transcript
- Candidate feedback
- Light and dark themes
- Production deployment

## Interview Flow

Home → Candidate Selection → Interview → Transcript → Feedback

## Tech Stack

### Frontend
- React
- Vite
- CSS

### Backend
- Python / FastAPI
- AI/LLM integration

### Deployment
- Vercel

## Live Demo

https://vervue-eta.vercel.app/

## AI Usage

Vervue was developed iteratively with AI assistance for planning,
implementation, debugging, UI iteration, prompt refinement, and deployment.

See [PROMPTS.md](./PROMPTS.md) for the AI usage log and
[AI_CHAT_TRANSCRIPT.md](./AI_CHAT_TRANSCRIPT.md) for the development record.

## Project Structure

```text
client/   → React + Vite frontend
server/   → Backend and AI interview logic

## Future Scope

Persistent database
More candidate data sources
Advanced interview analytics
Expanded evaluation metrics
# EduTech Experiential Learning Planner

EduTech is a full stack application for student experiential learning trip planning. It combines a Kanban planning board, an AI inquiry companion, and a Neo4j knowledge graph so students can move from trip ideas to research questions, synthesized knowledge, and logistics planning.

**Live Demo:** [https://edutech-ten-xi.vercel.app](https://edutech-ten-xi.vercel.app)

## Assessment Requirements Coverage

### 1. Kanban Board Development

The application provides a student trip-planning Kanban board with four learning workflow columns:

- Ideation & Discovery
- Research & Inquiry
- Synthesis & Knowledge
- Trip Planning & Logistics

Students can create, edit, delete, inspect, and drag cards between columns. Card operations are handled through GraphQL mutations and persisted in Neo4j.

### 2. AI Chatbot Integration

Each Kanban card can be opened in an AI inquiry workspace. The chatbot uses the selected card title/content plus the student's question to provide Socratic-style guidance. It can also suggest draft Kanban cards, but those cards are not added automatically. The student must explicitly confirm suggested cards before they are created.

The AI service uses Google Gemini with safety settings, retry handling, prompt-boundary hardening, and response parsing for:

- Inquiry answer
- Extracted knowledge points
- Knowledge relationships
- Suggested follow-up cards

### 3. Graph Database Development

Neo4j is used as the graph database. AI-extracted learning content is stored as `KnowledgeNode` records and connected with `RELATES_TO` relationships. The frontend visualizes the student's personal knowledge graph with an interactive force-directed graph.

AI-generated nodes are marked with:

- `isAIGenerated: true`
- `verificationStatus: "UNVERIFIED"`

The UI displays an "AI generated" warning and reminds students to verify extracted knowledge before treating it as fact.

### 4. Security and Environment

The project includes a safe-content and closed-loop learning environment:

- Login-based access with JWT and HTTP-only cookie support
- Apollo context-level authorization for protected operations
- Per-user Neo4j scoping for cards and knowledge nodes
- Input validation with Zod
- HTML sanitization before storage/display
- Basic content moderation
- Google Gemini safety filters
- AI inquiry rate limiting
- Prompt-injection boundary hardening for untrusted student input
- Security help panel for students
- Closed-loop learning guide with training suggestions

## Tech Stack

### Frontend

- React 19
- Vite
- Redux Toolkit
- Apollo Client
- Tailwind CSS
- `@hello-pangea/dnd` for Kanban drag-and-drop
- `react-force-graph-2d` for knowledge graph visualization
- Lucide React icons

### Backend

- Node.js
- Express 5
- Apollo Server
- GraphQL
- Neo4j Driver
- Google Generative AI SDK
- JWT authentication
- Zod validation
- Helmet, CORS, cookie-parser, express-rate-limit

### Database and AI

- Neo4j for graph persistence
- Google Gemini for AI inquiry and knowledge extraction

## Project Structure

```text
backend/
  config/              Environment and Neo4j configuration
  models/schema.graphql
  repositories/        Neo4j data access
  resolvers/           GraphQL resolvers
  scripts/init-db.js   Database index/sample initialization
  services/            Auth, AI, safety, Kanban, knowledge services

frontend/
  src/apollo/          Apollo client and GraphQL operations
  src/components/      Board, inquiry, graph, layout, security UI
  src/pages/           Login, board, inquiry pages
  src/store/           Redux slices
  src/styles/          Global styles
```

## Prerequisites

- Node.js 20 or newer recommended
- npm
- Neo4j instance
- Google Gemini API key

## Environment Variables

Create `backend/.env`:

```env
NODE_ENV=development
PORT=4000
NEO4J_URI=neo4j+s://your-neo4j-host.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-neo4j-password
JWT_SECRET=replace-with-a-long-development-secret
GEMINI_API_KEY=your-gemini-api-key
FRONTEND_URL=http://localhost:3000
```

For local frontend proxying, create `frontend/.env` if needed:

```env
VITE_GRAPHQL_PROXY=http://localhost:4000
```

If `VITE_GRAPHQL_PROXY` is not set, the Vite dev server uses the configured default proxy target in `frontend/vite.config.js`.

## Installation

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Database Setup

Run the database initialization script after configuring `backend/.env`:

```bash
cd backend
npm run init-db
```

This creates useful indexes and a sample user node. Authentication requires a user with an email and hashed password in Neo4j. Registration is currently disabled in the public UI/resolver, so create a test account through an administrator-controlled path or temporarily enable registration for local testing.

## Running Locally

Start the backend:

```bash
cd backend
npm run dev
```

The GraphQL server runs at:

```text
http://localhost:4000/graphql
```

Start the frontend:

```bash
cd frontend
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

## Build and Validation

Frontend lint:

```bash
cd frontend
npm run lint
```

Frontend production build:

```bash
cd frontend
npm run build
```

Backend syntax check example:

```bash
cd backend
node --check server.js
```

## Main User Flow

1. Sign in as a student.
2. Create trip-planning cards on the Kanban board.
3. Move cards through the learning workflow columns.
4. Open a card in the AI inquiry workspace.
5. Ask Socratic inquiry questions based on the card content.
6. Review the AI response and optional suggested cards.
7. Confirm any suggested cards the student wants to add.
8. Inspect AI-extracted knowledge points in the knowledge graph.
9. Verify AI-generated graph nodes before treating them as facts.
10. Use the graph and synthesized cards to support final trip logistics planning.

## Security Notes

This project includes several safety controls suitable for an assessment prototype:

- Protected GraphQL operations require authentication.
- Card and knowledge operations are scoped to the authenticated user.
- Student input is sanitized and validated before persistence.
- AI prompts treat card content and student questions as untrusted quoted material.
- AI inquiry requests are rate limited.
- Gemini safety filters are enabled for harmful content categories.
- AI-generated knowledge nodes are visibly marked as unverified.

Known limitations:

- The content moderation list is intentionally simple and should be replaced with a stronger policy/moderation service for production.
- AI-extracted historical or factual content is not externally fact-checked.
- Registration is disabled, so account provisioning needs an administrator workflow.
- Backend automated tests are not yet included.

## Assessment Summary

EduTech satisfies the four core assessment areas:

- A functional Kanban board for experiential learning trip planning
- An AI chatbot that deepens inquiry based on Kanban card content
- A Neo4j graph database for learning knowledge points and relationships
- A safer learning environment with content controls, AI guardrails, authorization, and closed-loop training suggestions

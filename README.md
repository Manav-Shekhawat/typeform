# Typeform Clone

This project is a full-stack, Typeform-inspired application that allows users to create, manage, and distribute interactive forms. It provides a robust drag-and-drop form builder for creators and a sleek, conversational, one-question-at-a-time experience for respondents. Built with a modern Next.js 16 (App Router) frontend and a FastAPI (Python) backend, the application guarantees strict data integrity, soft deletion to preserve historical responses, and real-time statistics generation.

## Live Demo

- **Hosted Frontend:** [https://typeform-blue.vercel.app/forms](https://typeform-blue.vercel.app/forms)
- **Hosted Backend:** [https://typeform-backend-y52q.onrender.com](https://typeform-backend-y52q.onrender.com)

*(Note: The hosted Render backend relies on a free-tier SQLite database initialized on startup. To ensure the application is immediately usable, the database is idempotently seeded with realistic demo data (Customer Feedback and Employee Survey forms) and historical responses upon spin-up.)*

## Repository

- **GitHub URL:** [https://github.com/Manav-Shekhawat/typeform](https://github.com/Manav-Shekhawat/typeform)

## Overview

The Typeform Clone project aims to replicate the core value proposition of Typeform: a frictionless, engaging data collection experience. The repository is divided into two decoupled services: a highly interactive React/Next.js frontend and a performant, SQLite-backed FastAPI REST API. The backend strictly enforces validation rules (e.g., regex email matching, numeric assertions) while the frontend natively supports client-side optimistic UI updates and validation before submission.

## Features

### Creator Dashboard
- List all owned forms with real-time response counts and status badges.
- Create new forms from scratch.
- Duplicate existing forms to quickly template recurring surveys.
- Rename forms directly from the workspace via an action menu.
- Manage form lifecycles (Draft vs. Published states).
- Secure modal confirmations for destructive actions (Delete).

### Form Builder
- Dynamic, interactive canvas with real-time previews.
- Reorder questions natively using drag-and-drop (`@dnd-kit`).
- Edit question titles, descriptions, and mark questions as required.
- Toggle between Edit and live Preview modes effortlessly.

### Form Management
- **Publish Workflow:** Publish drafts to generate shareable URLs for public access.
- **Unpublish Workflow:** Quickly revoke access to an active form.
- **Copy Link:** Click-to-copy integration to easily share public form slugs.

### Respondent Experience
- **Conversational UI:** One question displayed at a time to minimize cognitive load.
- **Keyboard Navigation:** Native support for `Enter` to proceed and standard keyboard inputs.
- **Client-Side Validation:** Inline, friendly error handling (e.g., rejecting malformed emails or strings in number fields).
- **Progress Tracking:** Step-by-step progress indicator ("1 of 5").
- **Thank You Screen:** Full-screen completion state after successful submission.

### Results & Statistics
- **Aggregated Dashboard:** Visual breakdown of form statistics without external chart dependencies (built purely with Tailwind CSS).
- **Individual Responses:** View historical responses chronologically.
- **Data Integrity:** Natively supports viewing answers from "soft-deleted" questions to preserve data history.

## Supported Question Types

The application fully supports the following eight native question types:
1. `SHORT_TEXT`: Single-line text input.
2. `LONG_TEXT`: Multi-line text area.
3. `MULTIPLE_CHOICE`: Single-select choice list.
4. `DROPDOWN`: Native dropdown select menu.
5. `EMAIL`: Strictly validated email address input.
6. `NUMBER`: Strictly validated numeric primitive input.
7. `YES_NO`: Binary boolean toggle buttons.
8. `RATING`: 5-star visual rating component.

## Tech Stack

**Frontend:**
- Next.js 16.3.0 (App Router, Turbopack)
- React 19
- TypeScript
- Tailwind CSS v4
- `@dnd-kit` (Drag & Drop)

**Backend:**
- FastAPI (Python)
- SQLAlchemy (ORM)
- Pydantic (Schema validation)
- SQLite (Database)
- Pytest (Testing)

## Architecture

### Frontend Architecture
The frontend leverages the Next.js App Router for strict separation between the `builder`, `results`, and `public` respondent experiences. 
- **State Management:** Handled largely via local React state (`useState`, `useEffect`) and optimistic UI updates to keep the Builder feeling snappy.
- **Reusable Components:** The `QuestionRenderer` is deeply shared across the Builder Preview and the Public Respondent flow, guaranteeing visual consistency.
- **Routing:** API logic is isolated within an `api/client.ts` wrapper for clean asynchronous fetching.

### Backend Architecture
The backend is a monolithic FastAPI REST API designed using layered Service-Repository patterns:
- **Routers (`app/api/`)**: Handle HTTP requests, responses, and dependency injection.
- **Services (`app/services/`)**: Enforce business logic (e.g., soft-deletion rules, duplication logic).
- **Repositories (`app/repositories/`)**: Abstract SQLAlchemy database interactions.
- **Models (`app/models/`)**: Define the physical SQLite schema mapping.

### Request Flow
```text
[Frontend Browser] 
       │ 
  (HTTP Fetch) 
       ▼
[FastAPI Router (Endpoint)] 
       │ 
  (Pydantic Validation)
       ▼
[Service Layer (Business Logic)]
       │
[Repository Layer (ORM Abstraction)]
       ▼
[SQLAlchemy Models] 
       ▼
[SQLite Database]
```

## Database Schema

### Entity Relationships
The SQLite database consists of 5 core models:
1. **Creator:** A user who creates forms. (One-to-Many with `Form`)
2. **Form:** A distinct survey/questionnaire. (One-to-Many with `Question`, One-to-Many with `Response`)
3. **Question:** An ordered input prompt belonging to a form. (One-to-Many with `Answer`)
4. **Response:** A complete submission from a respondent. (One-to-Many with `Answer`)
5. **Answer:** An individual data point mapping a specific `Response` to a specific `Question`.

### Data Integrity Decisions
- **Form/Question Order:** Enforced strictly via a composite unique constraint (`uix_form_order`) combining `form_id` and `order_index`.
- **Response Answers:** Enforced via a composite unique constraint (`uix_response_question`) combining `response_id` and `question_id` to prevent duplicate answers per submission.
- **Question Properties:** Extended properties (like `choices` for Multiple Choice, or `steps` for Ratings) are stored as raw `JSON` to ensure flexible schema extensibility.

### Soft Delete / Historical Responses
To preserve historical responses, Questions are never physically deleted (`CASCADE DELETE` is disabled for the `Question -> Answer` relationship). Instead, when a Creator deletes a Question, the `is_deleted` boolean flag is flipped to `True`. Soft-deleted questions are subsequently filtered out of the Builder and Public API payloads but remain securely intact for the Results and Statistics API.

## Project Structure

```text
typeform/
├── backend/
│   ├── app/
│   │   ├── api/            # FastAPI Routers
│   │   ├── core/           # Configuration / Settings
│   │   ├── db/             # Database Setup & Initialization
│   │   ├── models/         # SQLAlchemy Declarative Models
│   │   ├── repositories/   # DB Access Abstractions
│   │   ├── schemas/        # Pydantic Validation Models
│   │   └── services/       # Core Business Logic
│   ├── tests/              # Pytest Suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js App Router (Pages & Layouts)
│   │   ├── components/     # React Components (Builder, Public, Results, UI)
│   │   └── lib/            # Utilities (API Client, Types, ClassNames)
│   ├── package.json
│   └── tailwind.css
└── docs/                   # Original Architecture & Requirement Notes
```

## Core User Flows

### Creator Flow
1. Navigates to Workspace `/forms`.
2. Creates a Form.
3. Redirected to the Builder (`/forms/[id]/builder`).
4. Adds, reorders, and configures questions natively in the canvas.
5. Clicks "Publish" to generate a public Slug URL.
6. Shares the Form link with respondents.

### Respondent Flow
1. Visits the public Slug URL (`/f/[slug]`).
2. Server fetches active questions (skipping soft-deleted ones).
3. Respondent answers questions one at a time using the conversational UI.
4. Client validates inputs inline.
5. On the final step, hits "Submit" to post the payload to the server.
6. Receives a Thank You screen.

### Results Flow
1. Creator opens the Builder and clicks "Results".
2. Next.js navigates to `/forms/[id]/results`.
3. Parallel API calls fetch raw chronological responses and aggregated statistics.
4. Creator reviews average scores, choice distributions, and historical textual feedback natively.

## API Overview

### Form APIs
- `GET /api/v1/forms` - List all creator forms.
- `POST /api/v1/forms` - Create a new form.
- `GET /api/v1/forms/{id}` - Retrieve a specific form.
- `PATCH /api/v1/forms/{id}` - Update form metadata.
- `DELETE /api/v1/forms/{id}` - Delete a form.
- `POST /api/v1/forms/{id}/duplicate` - Clone an existing form.
- `POST /api/v1/forms/{id}/publish` - Publish a form and generate a slug.
- `POST /api/v1/forms/{id}/unpublish` - Revert a form to draft status.

### Question APIs
- `POST /api/v1/forms/{id}/questions` - Append a new question.
- `PUT /api/v1/forms/{id}/questions/{question_id}` - Update a question.
- `DELETE /api/v1/forms/{id}/questions/{question_id}` - Soft-delete a question.
- `PUT /api/v1/forms/{id}/questions/reorder` - Reorder active questions using a payload of updated indices.

### Public APIs
- `GET /api/v1/public/forms/{slug}` - Retrieve the published form mapping (excludes soft-deleted items).
- `POST /api/v1/public/forms/{slug}/responses` - Submit a respondent's payload.

### Results APIs
- `GET /api/v1/forms/{id}/responses` - Retrieve chronological response summaries.
- `GET /api/v1/forms/{id}/responses/{response_id}` - Retrieve a specific detailed response.
- `GET /api/v1/forms/{id}/stats` - Retrieve mathematically aggregated metrics for the form's questions.

### Health API
- `GET /health` - Liveness probe checking environment status.

## Local Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+ & npm

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # macOS/Linux
   # or .venv\Scripts\activate on Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Set up the local database configuration (defaults to local SQLite):
   ```bash
   export DATABASE_URL="sqlite:///./typeform.db"
   ```
5. Start the FastAPI server (DB initialized automatically on startup):
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Ensure your local environment variables point to the backend (or rely on the default):
   ```bash
   export NEXT_PUBLIC_API_BASE_URL="http://127.0.0.1:8000"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

### Running the Application
Once both servers are running:
- **Frontend App:** Navigate to `http://localhost:3000/forms`
- **Backend Swagger Docs:** Navigate to `http://127.0.0.1:8000/docs`

## Environment Variables

### Backend
| Variable | Description | Example |
|---|---|---|
| `ENVIRONMENT` | Environment type | `development` |
| `DATABASE_URL` | SQLAlchemy connection string | `sqlite:///./typeform.db` |
| `CORS_ORIGINS` | Allowed frontend origins (JSON) | `["http://localhost:3000"]` |

### Frontend
| Variable | Description | Example |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | URL of the backend API | `http://127.0.0.1:8000` |

## Testing & Verification

- **Backend Automated Tests:** The FastAPI backend is covered by an extensive Pytest suite tracking models, forms, questions, public routing, responses, and results APIs. Run via:
  ```bash
  cd backend
  PYTHONPATH=. pytest
  ```
- **Frontend Verification:** The Next.js frontend employs strict static analysis to guarantee production readiness. Run via:
  ```bash
  cd frontend
  npm run lint
  npx tsc --noEmit
  npm run build
  ```

## Deployment

### Frontend
Deployed globally via **Vercel** (`typeform-blue.vercel.app`). Environment variables securely route requests to the backend.

### Backend
Deployed on a free-tier **Render** web service (`typeform-backend-y52q.onrender.com`).
*Note: Due to Render's free tier, the SQLite database is destroyed upon container sleep/restart. The server leverages a FastAPI Lifespan hook to idempotently initialize the SQLite tables and seed realistic demo forms and responses immediately upon spin-up so the app remains fully functional.*

## Assumptions

- **Single Default Creator:** No strict Creator authentication or JWT authorization is required for the MVP; the system inherently binds new forms to a single seeded "Default Creator."
- **No Respondent Auth:** Public forms are completely open and require no respondent authentication/login.
- **Multiple Choice Limitations:** Checkbox-style multi-select isn't implemented; the MVP implements "Multiple Choice" as single-select standard radio behaviors.
- **SQLite Viability:** A local filesystem SQLite database is sufficient for fulfilling the MVP architectural requirements.
- **Immutability of Form Schemas:** Published forms leverage the existing schema blindly; true "versioning" of published forms is not implemented.



## Known Limitations

- **Hosted Persistence:** As mentioned, Render free-tier containers are ephemeral; all saved hosted forms and responses will periodically be wiped.
- **Frontend Test Coverage:** End-to-End browser tests (e.g., Cypress/Playwright) are not included in this MVP.
- **Builder History:** The drag-and-drop builder lacks a strict "Undo/Redo" command history stack.

## Future Improvements

- Migrate from SQLite to a managed PostgreSQL cluster for true persistent hosting.
- Implement comprehensive JWT Creator authentication via NextAuth/Auth.js.
- Introduce advanced conditional logic jumps to the Builder.
- Support `MULTI_SELECT` variant of Multiple Choice questions.
- Write a Playwright test suite strictly asserting the Respondent conversational flow.


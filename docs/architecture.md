# Architecture Documentation

This document outlines the system architecture for the Typeform clone. The application is a single monolithic full-stack application with clean internal separation of concerns, sized appropriately for the assignment.

## 1. High-Level Architecture
* **Frontend**: Next.js with TypeScript (App Router).
* **Backend**: Python with FastAPI.
* **Database**: SQLite (via SQLAlchemy ORM).

## 2. Frontend Architecture (Next.js)
The frontend is strictly separated by user experience boundaries:

* **Creator/Dashboard Experience** (`/app/(creator)/`): Manages form listings and routing.
* **Builder Experience** (`/app/builder/[id]/`): 
  * Heavy local state management. UI updates instantly on user interaction.
  * Persistence is handled via debounced/batched API calls to avoid lag.
  * Publishing is a distinct business action, separate from auto-saving.
* **Results Experience** (`/app/results/[id]/`): Data visualization, focusing on efficient fetching of responses and statistics.
* **Public Respondent Experience** (`/app/f/[slug]/`):
  * Optimized for performance and Framer Motion animations.
  * Shares reusable question-rendering components with the Builder's Live Preview to ensure 1:1 visual parity.
  * **State**: Answers are maintained locally and submitted exactly once at the end of the form. Partial persistence is not implemented.

## 3. Backend Architecture (FastAPI)
The backend uses a layered architecture to separate HTTP concerns from business logic:
```text
[ API Routes ] -> [ Services/Business Logic ] -> [ Repositories/Persistence ] -> [ SQLAlchemy Models ] -> [ SQLite ]
```
**API vs Database Schemas**: Pydantic models for API validation are kept strictly separate from SQLAlchemy database models.

## 4. Architectural Decisions and Trade-offs

### The Default Creator
Real authentication is out of scope. We model a single `Creator` entity solely to establish database ownership. The backend resolves this single Default Creator internally for all creator-side operations without any headers, JWTs, or session management.

### Why FastAPI & SQLite?
FastAPI is performant, type-safe (Pydantic), and ideal for decoupled Next.js frontends. SQLite is an assignment requirement. SQLAlchemy provides a robust ORM layer that easily manages the relational hierarchy.

### Public Slugs
Forms use a `slug` for clean public routing (e.g., `/f/feedback-123`). This is **not** a security measure. The actual public security boundary is enforced at the API layer, which strictly ensures only published forms are returned and all internal creator data (like draft settings or unrelated forms) is stripped from the response payload.

### Handling Edits to Published Forms (No Versioning)
To keep the architecture assignment-sized, we do not implement form versioning. When a creator edits a published form, the changes are auto-saved instantly. Because there is no separate "published version" table, these edits will immediately reflect on the live public form. 

### Preserving Historical Responses on Deletion
If a creator deletes a question, destroying the row would cascade and silently destroy all historical answers tied to that question. To solve this, we use **Soft Deletes**. Deleting a question sets `is_deleted = true`. The question is hidden from the Builder and Public Form, but remains in the database so the Results View can still display historical answers.

### Normalized Schema
We use a normalized schema for responses (separating `Response` and `Answer`). This makes aggregating data for the "Basic summary stats per question" feature vastly more efficient than querying large JSON blobs.

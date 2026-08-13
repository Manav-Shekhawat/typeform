# Requirements Document

This document outlines the functional and non-functional requirements for the Typeform clone assignment. It serves as the primary source of truth.

## Feature Categories

### 1. Must Have (Explicit Assignment Requirements)
* **Form Builder**
  * Create a form with a title and ordered list of questions.
  * Add, edit, and delete questions.
  * Reorder questions via drag-and-drop.
  * Question types (Canonical set): `SHORT_TEXT`, `LONG_TEXT`, `MULTIPLE_CHOICE` (single-select MVP), `DROPDOWN`, `EMAIL`, `NUMBER`, `YES_NO`, `RATING`.
  * Per-question settings: required toggle, description/help text.
  * Live preview of the form during building.
* **Form Management (CRUD)**
  * List forms with status (draft/published) and response count (successfully submitted responses only).
  * Rename, duplicate, and delete forms.
  * Publish/unpublish forms, generating a shareable public link.
  * Public forms must require no authentication to fill.
* **Respondent Flow (The Typeform Experience)**
  * One-question-at-a-time, full-screen UI with smooth transitions.
  * Keyboard navigation (Enter/arrow keys to advance).
  * Progress indicator.
  * Client and server-side validation (required fields, email format, numeric bounds, etc).
  * Submit stores the response and shows a thank-you screen. (Respondent state is local; submitted once at the end).
* **Results / Responses**
  * Per-form responses view (table/list of submissions).
  * View an individual response in full.
  * Basic summary statistics explicitly tailored per question type.
* **General UI/UX**
  * UI must visually and functionally resemble modern Typeform.
  * Clean builder layout with inline editing, modals, notifications/toasts.
  * Settings placeholders (Themes, Logic Jumps, Integrations).
* **Technical Setup**
  * Include seed data (default creator, published forms with mixed types and responses).
  * SQLite database with custom schema.

### 2. Nice to Have / Inferred
* Advanced logic jumps / branching UI (visual placeholder only).
* Integrations / webhooks (placeholder).
* Team collaboration & sharing (placeholder).
* Payment/file-upload question types (placeholder).

### 3. Bonus (Optional Enhancements)
* Functional logic jumps / conditional branching.
* Custom themes (colors, fonts, background).
* Export responses as CSV.
* Partial-response tracking / completion rate.
* File-upload question type.
* Dark mode.
* A/B/C keyboard shortcuts for multiple choice options.
* Multi-select support for Multiple Choice questions.

### 4. Explicitly Out of Scope
* Real user authentication, authorization, passwords, JWT, OAuth, or sessions. We use ONE mocked Default Creator internally.
* Complex multi-tenant architecture.
* Non-SQLite databases (e.g., PostgreSQL).
* Microservices architecture.
* Versioning of published forms (edits to a published form instantly affect the live version).
* Partial response persistence during the respondent flow.

---

## Primary User Journeys

### 1. Creator Journey (Building a Form)
**Flow**: Dashboard → Create Form → Builder → Configure Questions → Preview → Publish → Share
1. The Creator lands on the **Dashboard** and sees a list of their forms.
2. They click "Create Form", providing an initial title.
3. They enter the **Builder**, where they can add new questions from a menu.
4. They configure questions. Builder changes update local state instantly and persist via debounced API calls.
5. They view the **Live Preview** (which shares components with the public respondent rendering).
6. They click **Publish**, generating a shareable public link.

### 2. Respondent Journey (Filling a Form)
**Flow**: Public URL → Question → Answer → Validation → Next Question → Submit → Thank You
1. A Respondent clicks the shareable link and lands on the public form.
2. They answer questions, navigating with `Enter` and arrow keys.
3. Answers are maintained locally in the client state.
4. On the final question, they submit.
5. Server-side validation occurs. If successful, the response is persisted, and a "Thank You" screen is displayed.

### 3. Creator Results Journey (Analyzing Data)
**Flow**: Dashboard → Form → Responses → Individual Response → Summary Statistics
1. The Creator navigates to their **Dashboard** and selects a published form's **Results** tab.
2. They see a table listing all successfully submitted responses.
3. They can view an **Individual Response** in full.
4. They view **Summary Statistics** (e.g., percentage breakdowns for choices, averages for ratings).

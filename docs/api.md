# REST API Documentation (v1)

This defines the contract between the Next.js frontend and the FastAPI backend.

## 1. Creator APIs (Form Management)
*All Creator endpoints implicitly resolve to the single Default Creator.*

### `GET /api/v1/forms`
* **Purpose**: List all forms for the dashboard.
* **Response**: List of forms with `id`, `title`, `status`, `created_at`, `updated_at`, and `response_count` (successfully submitted only).

### `POST /api/v1/forms`
* **Purpose**: Create a new blank form.
* **Response**: Full form object including generated ID.

### `GET /api/v1/forms/{id}`
* **Purpose**: Fetch full form details for the Builder (includes active and soft-deleted questions if needed for results, though builder typically only shows active).

### `PATCH /api/v1/forms/{id}`
* **Purpose**: Normal metadata updates (title, description, thank_you_message, theme_config).
* **Request**: Partial form object.

### `POST /api/v1/forms/{id}/publish`
* **Purpose**: Business action to publish a form.
* **Validation**: Form must have at least one active question.

### `POST /api/v1/forms/{id}/unpublish`
* **Purpose**: Business action to unpublish a form (revert to draft).

### `DELETE /api/v1/forms/{id}`
* **Purpose**: Hard delete a form and all cascading data.

### `POST /api/v1/forms/{id}/duplicate`
* **Purpose**: Duplicate an existing form. Responses are not duplicated.

---

## 2. Creator APIs (Question Management)

### `POST /api/v1/forms/{id}/questions`
* **Purpose**: Add a new question.

### `PATCH /api/v1/forms/{id}/questions/{question_id}`
* **Purpose**: Update specific question details/properties.

### `DELETE /api/v1/forms/{id}/questions/{question_id}`
* **Purpose**: Soft-delete a question to preserve historical response data.

### `PUT /api/v1/forms/{id}/questions/reorder`
* **Purpose**: Batch update question ordering.

---

## 3. Creator APIs (Results & Statistics)

### `GET /api/v1/forms/{id}/responses`
* **Purpose**: List all successfully submitted responses.

### `GET /api/v1/forms/{id}/responses/{response_id}`
* **Purpose**: View an individual response in full.

### `GET /api/v1/forms/{id}/stats`
* **Purpose**: Fetch explicit statistics aggregated per question type.
* **Output Definitions by Type**:
  * `SHORT_TEXT` / `LONG_TEXT` / `EMAIL`: Total response count. (List of latest text entries optional).
  * `MULTIPLE_CHOICE` / `DROPDOWN` / `YES_NO`: Counts and percentages per option (e.g., "Yes: 80% (8), No: 20% (2)").
  * `NUMBER` / `RATING`: Average, Minimum, and Maximum values.

---

## 4. Public APIs (Respondent Experience)
*These endpoints strip all internal creator data and return only public-safe fields.*

### `GET /api/v1/public/forms/{slug}`
* **Purpose**: Fetch a published form for rendering.
* **Validation**: 404 if form doesn't exist OR if `status == 'draft'`.

### `POST /api/v1/public/forms/{slug}/responses`
* **Purpose**: Submit a completed form.
* **Server-Side Validation Expectations**:
  * **General**: Form must be published. Reject invalid/soft-deleted `question_id`s.
  * **Required**: Fails if an answer is missing for any question where `is_required=true`.
  * **`SHORT_TEXT` / `LONG_TEXT`**: Validates value is a string.
  * **`EMAIL`**: Validates value against a standard email regex.
  * **`NUMBER`**: Validates value is numeric and respects `properties.min` and `properties.max` if defined.
  * **`YES_NO`**: Validates value is exactly "yes" or "no".
  * **`RATING`**: Validates value is an integer between 1 and `properties.steps`.
  * **`MULTIPLE_CHOICE` / `DROPDOWN`**: Validates the submitted choice exists exactly in the `properties.choices` array. (MVP is single-select).
* **Error Cases**: 400 Bad Request with a detailed list of validation errors.

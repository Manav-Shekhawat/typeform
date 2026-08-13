# Database Architecture

This document defines the normalized relational schema for the application using SQLite.

## Overview
We model five entities: `Creator`, `Form`, `Question`, `Response`, and `Answer`.

---

## 1. Creator
*Used exclusively to model ownership. Authentication is not implemented.*

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key | Unique identifier. |
| `name` | String | Not Null | Creator's display name. |
| `created_at` | DateTime | Not Null | Timestamp of creation. |

---

## 2. Form
Represents a form container.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key | Internal identifier. |
| `creator_id` | String | Foreign Key (`Creator.id`) | Owner of the form. |
| `title` | String | Not Null | Display name in the dashboard. |
| `description` | String | Nullable | Optional form description. |
| `slug` | String | Not Null, Unique, Indexed | Clean public identifier (e.g., `feedback-123`). |
| `status` | Enum | Not Null, Default: `draft` | `draft` or `published`. |
| `theme_config` | JSON | Nullable | Placeholder for theme settings. |
| `thank_you_message`| String | Nullable | Custom message shown after submission. |
| `created_at` | DateTime | Not Null | Timestamp of creation. |
| `updated_at` | DateTime | Not Null | Timestamp of last modification. |

*Behavior*: Deleting a form cascades to delete all its Questions and Responses.

---

## 3. Question
Represents an individual question/step.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key | Unique identifier. |
| `form_id` | String | Foreign Key (`Form.id`) | The form this question belongs to. Indexed. |
| `type` | Enum | Not Null | `SHORT_TEXT`, `LONG_TEXT`, `MULTIPLE_CHOICE`, `DROPDOWN`, `EMAIL`, `NUMBER`, `YES_NO`, `RATING`. |
| `title` | String | Not Null | The question prompt. |
| `description` | String | Nullable | Optional sub-text or help text. |
| `is_required` | Boolean | Not Null, Default: False| Must the user answer this? |
| `order_index` | Integer | Not Null | Sequence in the form. |
| `properties` | JSON | Nullable | Type-specific configuration. |
| `is_deleted` | Boolean | Not Null, Default: False| Soft-delete flag to preserve historical responses. |

**Constraints**: `UNIQUE(form_id, order_index)` ensures no two active questions share the same order position within a form.

### Question Properties (JSON Configuration)
A JSON field is used for `properties` because the variability of settings across 8 question types makes strict table normalization overly complex and rigid.
* *Examples*:
  * `MULTIPLE_CHOICE` / `DROPDOWN`: `{"choices": ["Red", "Blue", "Green"]}` (Single select for MVP)
  * `RATING`: `{"steps": 5, "shape": "star"}`
  * `NUMBER`: `{"min": 0, "max": 100}`

---

## 4. Response
Represents a single successful submission.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key | Unique identifier. |
| `form_id` | String | Foreign Key (`Form.id`) | The form that was filled. Indexed. |
| `submitted_at`| DateTime | Not Null | When the response was completed. |

*Cascade*: Deleted when the parent Form is deleted.

---

## 5. Answer
Represents the respondent's data for a specific question.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | String | Primary Key | Unique identifier. |
| `response_id` | String | Foreign Key (`Response.id`) | The parent response. Indexed. |
| `question_id` | String | Foreign Key (`Question.id`) | The question being answered. Indexed. |
| `value` | Text | Nullable | The user's input, stored as a string. |

**Constraints**: `UNIQUE(response_id, question_id)` ensures a respondent can only have one answer per question per submission.
*Cascade*: Deleted when the parent Response is deleted. (Not cascaded on Question delete due to soft-delete strategy).

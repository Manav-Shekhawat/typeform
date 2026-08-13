# UI / UX Documentation

This document outlines the UI and UX patterns for the application, strictly separating explicit assignment requirements from inferred patterns and optional bonuses.

## 1. Assignment Requirements (Must Implement)

### The Creator Dashboard
* **Functionality**: List forms with status (draft/published) and response count. Support rename, duplicate, delete.

### The Builder Layout
* **Functionality**: Live preview of the form, side-by-side with an ordered list of questions.
* **Interactions**: Drag-and-drop reordering. Inline editing of question title, description, and properties.
* **Architecture Note**: The Live Preview must share React components with the Public Respondent rendering to guarantee visual parity.
* **State**: UI must update instantly locally, persisting via debounced/batched API calls.

### The Respondent Experience
* **Layout**: One-question-at-a-time, full-screen UI.
* **Transitions**: Smooth slide/fade transitions between questions.
* **Navigation (Keyboard MVP)**: Users must be able to advance using `Enter` and arrow keys.
* **Progress**: A visible progress indicator.
* **Validation**: Client-side validation must catch errors before submission (e.g., missing required fields, invalid email format).
* **Submission**: The respondent fills the form locally, and submission happens exactly once at the end. A Thank You screen is shown upon success.

### Results View
* **Functionality**: A table/list of submissions. View individual responses in full. Display basic summary stats per question.

---

## 2. Inferred Typeform-Inspired UX (To Implement)

These are patterns not explicitly asked for but necessary to achieve the "feels like a modern Typeform" requirement.

* **Focused Conversational UI**: Centered content, large legible typography, uncluttered screen. Previous/next questions are hidden.
* **Error States (Inline)**: Contextual, friendly errors ("Please enter a valid email") directly beneath the input, rather than jarring browser alerts.
* **Toasts**: Non-blocking notifications for creator actions (e.g., "Changes saved", "Form published").
* **Settings Placeholders**: Simple "Coming Soon" modals or disabled buttons for Themes, Integrations, and Logic Jumps.

---

## 3. Optional Enhancements (Bonus)

These features are explicitly marked as optional and should not block the MVP.

* **Advanced Keyboard Shortcuts**: A/B/C letter shortcuts for selecting multiple choice options.
* **Dark Mode**: System-aware or toggleable dark theme.
* **Custom Themes**: Actually implementing the Theme placeholder to change colors/fonts.
* **Logic Jumps**: Visual logic branching and conditional rendering of questions.
* **Export Responses**: Downloading results as CSV.

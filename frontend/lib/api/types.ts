export enum QuestionType {
  SHORT_TEXT = "SHORT_TEXT",
  LONG_TEXT = "LONG_TEXT",
  EMAIL = "EMAIL",
  NUMBER = "NUMBER",
  YES_NO = "YES_NO",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  DROPDOWN = "DROPDOWN",
  RATING = "RATING",
}

export type FormStatus = "draft" | "published";

export interface Question {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  order_index: number;
  properties?: Record<string, unknown>;
}

export interface Form {
  id: string;
  slug: string;
  title: string;
  description?: string;
  status: FormStatus;
  theme_config?: Record<string, unknown>;
  thank_you_message?: string;
  created_at: string;
  updated_at: string;
  response_count: number;
  questions: Question[];
}

export interface PublicQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  is_required: boolean;
  order_index: number;
  properties?: Record<string, unknown>;
}

export interface PublicForm {
  id: string;
  title: string;
  description?: string;
  theme_config?: Record<string, unknown>;
  thank_you_message?: string;
  questions: PublicQuestion[];
}

export interface AnswerResult {
  question_id: string;
  question_title: string;
  question_type: QuestionType;
  value: unknown;
}

export interface ResponseSummary {
  id: string;
  submitted_at: string;
  answers: AnswerResult[];
}

export interface QuestionStats {
  question_id: string;
  question_title: string;
  question_type: QuestionType;
  response_count: number;
  average?: number;
  minimum?: number;
  maximum?: number;
  true_count?: number;
  false_count?: number;
  choice_counts?: Record<string, number>;
  distribution?: Record<string, number>;
}

export interface StatsResponse {
  questions: QuestionStats[];
}

export interface AnswerSubmit {
  question_id: string;
  value: unknown;
}

export interface ResponseSubmit {
  answers: AnswerSubmit[];
}

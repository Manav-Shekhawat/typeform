from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.repositories.form_repository import FormRepository, get_default_creator
from app.repositories.results_repository import ResultsRepository
from app.schemas.results import (
    ResponseSummary, AnswerResult, QuestionStats, StatsResponse
)
from app.models.question import QuestionType

class ResultsService:
    def __init__(self, db: Session):
        self.db = db
        self.form_repo = FormRepository(db)
        self.results_repo = ResultsRepository(db)

    def _verify_ownership(self, form_id: str):
        creator = get_default_creator(self.db)
        form = self.form_repo.get_form_by_id_and_creator(form_id, creator.id)
        if not form:
            raise HTTPException(status_code=404, detail="Form not found")
        return form

    def _map_response_to_summary(self, response, q_map) -> ResponseSummary:
        answers_result = []
        for ans in response.answers:
            q = q_map.get(ans.question_id)
            if q:
                answers_result.append(AnswerResult(
                    question_id=q.id,
                    question_title=q.title,
                    question_type=q.type,
                    value=ans.value
                ))
            else:
                # Fallback for completely missing questions (shouldn't happen with soft deletes, but defensive)
                answers_result.append(AnswerResult(
                    question_id=ans.question_id,
                    question_title="Unknown Question",
                    question_type=QuestionType.SHORT_TEXT,
                    value=ans.value
                ))
                
        return ResponseSummary(
            id=response.id,
            submitted_at=response.submitted_at,
            answers=answers_result
        )

    def list_responses(self, form_id: str):
        form = self._verify_ownership(form_id)
        q_map = {q.id: q for q in form.questions}
        
        responses = self.results_repo.get_responses_by_form_id(form_id)
        return [self._map_response_to_summary(r, q_map) for r in responses]

    def get_response(self, form_id: str, response_id: str):
        form = self._verify_ownership(form_id)
        q_map = {q.id: q for q in form.questions}
        
        response = self.results_repo.get_response_by_id_and_form(response_id, form_id)
        if not response:
            raise HTTPException(status_code=404, detail="Response not found")
            
        return self._map_response_to_summary(response, q_map)

    def get_stats(self, form_id: str):
        form = self._verify_ownership(form_id)
        responses = self.results_repo.get_responses_by_form_id(form_id)
        
        # Group answers by question ID
        answers_by_q = {}
        for r in responses:
            for a in r.answers:
                answers_by_q.setdefault(a.question_id, []).append(a.value)
                
        stats_list = []
        active_questions = [q for q in form.questions if not q.is_deleted]
        for q in active_questions:
            vals = answers_by_q.get(q.id, [])
            resp_count = len(vals)
            
            qs = QuestionStats(
                question_id=q.id,
                question_title=q.title,
                question_type=q.type,
                response_count=resp_count
            )
            
            if q.type == QuestionType.NUMBER:
                if resp_count > 0:
                    nums = []
                    for v in vals:
                        try:
                            nums.append(float(v))
                        except (ValueError, TypeError):
                            pass
                    if nums:
                        qs.average = sum(nums) / len(nums)
                        qs.minimum = min(nums)
                        qs.maximum = max(nums)
                        
            elif q.type == QuestionType.YES_NO:
                qs.true_count = 0
                qs.false_count = 0
                for v in vals:
                    if v == "true":
                        qs.true_count += 1
                    elif v == "false":
                        qs.false_count += 1
                        
            elif q.type in (QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN):
                choices = q.properties.get("choices", []) if q.properties else []
                counts = {c: 0 for c in choices}
                for v in vals:
                    if v in counts:
                        counts[v] += 1
                qs.choice_counts = counts
                
            elif q.type == QuestionType.RATING:
                steps = q.properties.get("steps", 5) if q.properties else 5
                dist = {str(i): 0 for i in range(1, steps + 1)}
                nums = []
                for v in vals:
                    dist_key = str(v)
                    if dist_key in dist:
                        dist[dist_key] += 1
                    try:
                        nums.append(int(v))
                    except (ValueError, TypeError):
                        pass
                qs.distribution = dist
                if nums:
                    qs.average = sum(nums) / len(nums)
                    
            stats_list.append(qs)
            
        return StatsResponse(questions=stats_list)

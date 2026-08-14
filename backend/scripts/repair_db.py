import os
import sys
from sqlalchemy.orm import Session

# Add the backend dir to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.database import SessionLocal
from app.models.question import Question

def repair():
    db: Session = SessionLocal()
    try:
        # Find all forms that have questions with negative order_index
        bad_questions = db.query(Question).filter(Question.order_index < 0).all()
        
        forms_to_repair = {q.form_id for q in bad_questions}
        print(f"Found {len(bad_questions)} bad questions across {len(forms_to_repair)} forms.")
        
        for form_id in forms_to_repair:
            # Fetch all questions in this form
            all_qs = db.query(Question).filter(Question.form_id == form_id).all()
            
            original_indexes = {q.id: q.order_index for q in all_qs}
            
            # Step 1: Move ALL questions to a temporary safe positive space to avoid flush collisions
            for i, q in enumerate(all_qs):
                q.order_index = 1000000 + i
            db.flush()
            
            # Step 2: Assign valid indices
            # Active questions retain their original relative ordering 0..n-1
            active_qs = sorted([q for q in all_qs if not q.is_deleted], key=lambda x: original_indexes[x.id])
            for i, q in enumerate(active_qs):
                q.order_index = i
                
            # Deleted questions get reserved non-negative indexes outside active range
            deleted_qs = [q for q in all_qs if q.is_deleted]
            for i, q in enumerate(deleted_qs):
                q.order_index = 10000 + i
                
        db.commit()
        print("Database repaired successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error repairing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    repair()

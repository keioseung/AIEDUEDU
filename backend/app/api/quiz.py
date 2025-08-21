from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..models import Quiz
from ..schemas import QuizCreate, QuizResponse

router = APIRouter()

@router.get("/topics", response_model=List[str])
def get_all_quiz_topics(db: Session = Depends(get_db)):
    topics = list(set([row.topic for row in db.query(Quiz).all()]))
    return topics

@router.get("/{topic}", response_model=List[QuizResponse])
def get_quiz_by_topic(topic: str, db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).filter(Quiz.topic == topic).all()
    return quizzes

@router.post("/", response_model=QuizResponse)
def add_quiz(quiz_data: QuizCreate, db: Session = Depends(get_db)):
    db_quiz = Quiz(
        topic=quiz_data.topic,
        
        # 다국어 지원 - 문제
        question_ko=quiz_data.question_ko,
        question_en=quiz_data.question_en,
        question_ja=quiz_data.question_ja,
        question_zh=quiz_data.question_zh,
        
        # 다국어 지원 - 선택지 1
        option1_ko=quiz_data.option1_ko,
        option1_en=quiz_data.option1_en,
        option1_ja=quiz_data.option1_ja,
        option1_zh=quiz_data.option1_zh,
        
        # 다국어 지원 - 선택지 2
        option2_ko=quiz_data.option2_ko,
        option2_en=quiz_data.option2_en,
        option2_ja=quiz_data.option2_ja,
        option2_zh=quiz_data.option2_zh,
        
        # 다국어 지원 - 선택지 3
        option3_ko=quiz_data.option3_ko,
        option3_en=quiz_data.option3_en,
        option3_ja=quiz_data.option3_ja,
        option3_zh=quiz_data.option3_zh,
        
        # 다국어 지원 - 선택지 4
        option4_ko=quiz_data.option4_ko,
        option4_en=quiz_data.option4_en,
        option4_ja=quiz_data.option4_ja,
        option4_zh=quiz_data.option4_zh,
        
        # 다국어 지원 - 설명
        explanation_ko=quiz_data.explanation_ko,
        explanation_en=quiz_data.explanation_en,
        explanation_ja=quiz_data.explanation_ja,
        explanation_zh=quiz_data.explanation_zh,
        
        correct=quiz_data.correct,
        
        # 기존 단일 언어 필드들 (하위 호환성을 위해 유지)
        question=quiz_data.question or quiz_data.question_ko,
        option1=quiz_data.option1 or quiz_data.option1_ko,
        option2=quiz_data.option2 or quiz_data.option2_ko,
        option3=quiz_data.option3 or quiz_data.option3_ko,
        option4=quiz_data.option4 or quiz_data.option4_ko,
        explanation=quiz_data.explanation or quiz_data.explanation_ko
    )
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.put("/{quiz_id}", response_model=QuizResponse)
def update_quiz(quiz_id: int, quiz_data: QuizCreate, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    quiz.topic = quiz_data.topic
    
    # 다국어 지원 - 문제
    quiz.question_ko = quiz_data.question_ko
    quiz.question_en = quiz_data.question_en
    quiz.question_ja = quiz_data.question_ja
    quiz.question_zh = quiz_data.question_zh
    
    # 다국어 지원 - 선택지 1
    quiz.option1_ko = quiz_data.option1_ko
    quiz.option1_en = quiz_data.option1_en
    quiz.option1_ja = quiz_data.option1_ja
    quiz.option1_zh = quiz_data.option1_zh
    
    # 다국어 지원 - 선택지 2
    quiz.option2_ko = quiz_data.option2_ko
    quiz.option2_en = quiz_data.option2_en
    quiz.option2_ja = quiz_data.option2_ja
    quiz.option2_zh = quiz_data.option2_zh
    
    # 다국어 지원 - 선택지 3
    quiz.option3_ko = quiz_data.option3_ko
    quiz.option3_en = quiz_data.option3_en
    quiz.option3_ja = quiz_data.option3_ja
    quiz.option3_zh = quiz_data.option3_zh
    
    # 다국어 지원 - 선택지 4
    quiz.option4_ko = quiz_data.option4_ko
    quiz.option4_en = quiz_data.option4_en
    quiz.option4_ja = quiz_data.option4_ja
    quiz.option4_zh = quiz_data.option4_zh
    
    # 다국어 지원 - 설명
    quiz.explanation_ko = quiz_data.explanation_ko
    quiz.explanation_en = quiz_data.explanation_en
    quiz.explanation_ja = quiz_data.explanation_ja
    quiz.explanation_zh = quiz_data.explanation_zh
    
    quiz.correct = quiz_data.correct
    
    # 기존 단일 언어 필드들 (하위 호환성을 위해 유지)
    quiz.question = quiz_data.question or quiz_data.question_ko
    quiz.option1 = quiz_data.option1 or quiz_data.option1_ko
    quiz.option2 = quiz_data.option2 or quiz_data.option2_ko
    quiz.option3 = quiz_data.option3 or quiz_data.option3_ko
    quiz.option4 = quiz_data.option4 or quiz_data.option4_ko
    quiz.explanation = quiz_data.explanation or quiz_data.explanation_ko
    
    db.commit()
    db.refresh(quiz)
    return quiz

@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}

@router.options("/")
def options_quiz():
    return Response(status_code=200)

@router.get("/generate/{topic}")
def generate_quiz(topic: str):
    """주제에 따른 퀴즈를 생성합니다."""
    # 간단한 퀴즈 생성 로직 (실제로는 더 복잡한 로직이 필요)
    quiz_templates = {
        "AI": {
            "question": "인공지능(AI)의 정의로 가장 적절한 것은?",
            "options": [
                "컴퓨터가 인간처럼 생각하는 기술",
                "인간의 지능을 모방하는 컴퓨터 시스템",
                "자동화된 기계 시스템",
                "데이터 처리 프로그램"
            ],
            "correct": 1,
            "explanation": "AI는 인간의 지능을 모방하여 학습하고 추론하는 컴퓨터 시스템입니다."
        },
        "머신러닝": {
            "question": "머신러닝의 주요 특징은?",
            "options": [
                "사전에 정의된 규칙만 사용",
                "데이터로부터 패턴을 학습",
                "인간의 개입이 필요 없음",
                "결과가 항상 정확함"
            ],
            "correct": 1,
            "explanation": "머신러닝은 데이터로부터 패턴을 학습하여 예측이나 분류를 수행합니다."
        }
    }
    
    if topic in quiz_templates:
        return quiz_templates[topic]
    else:
        return {
            "question": f"{topic}에 대한 기본 퀴즈",
            "options": ["옵션 1", "옵션 2", "옵션 3", "옵션 4"],
            "correct": 0,
            "explanation": "기본 설명입니다."
        } 
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List
import json
import re

from ..database import get_db
from ..models import AIInfo
from ..schemas import AIInfoCreate, AIInfoResponse, AIInfoItem, TermItem
from ..utils.ai_classifier import ai_classifier

router = APIRouter()



def normalize_text(text):
    text = text.lower()
    text = re.sub(r'[-–—:·.,!?"\'\\|/]', '', text)
    text = re.sub(r'\s+', '', text)
    return text

@router.get("/{date}", response_model=List[AIInfoItem])
def get_ai_info_by_date(date: str, db: Session = Depends(get_db)):
    try:
        ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
        if not ai_info:
            return []
        
        infos = []
        if ai_info.info1_title and ai_info.info1_content:
            try:
                terms1 = json.loads(ai_info.info1_terms) if ai_info.info1_terms else []
            except json.JSONDecodeError:
                terms1 = []
            
            # 카테고리 자동 분류
            classification = ai_classifier.classify_content(
                ai_info.info1_title, 
                ai_info.info1_content
            )
            
            infos.append({
                "title": ai_info.info1_title, 
                "content": ai_info.info1_content,
                "terms": terms1,
                "category": ai_info.info1_category or classification["category"],
                "subcategory": classification["subcategory"],
                "confidence": classification["confidence"]
            })
        if ai_info.info2_title and ai_info.info2_content:
            try:
                terms2 = json.loads(ai_info.info2_terms) if ai_info.info2_terms else []
            except json.JSONDecodeError:
                terms2 = []
            
            # 카테고리 자동 분류
            classification = ai_classifier.classify_content(
                ai_info.info2_title, 
                ai_info.info2_content
            )
            
            infos.append({
                "title": ai_info.info2_title, 
                "content": ai_info.info2_content,
                "terms": terms2,
                "category": ai_info.info2_category or classification["category"],
                "subcategory": classification["subcategory"],
                "confidence": classification["confidence"]
            })
        if ai_info.info3_title and ai_info.info3_content:
            try:
                terms3 = json.loads(ai_info.info3_terms) if ai_info.info3_terms else []
            except json.JSONDecodeError:
                terms3 = []
            
            # 카테고리 자동 분류
            classification = ai_classifier.classify_content(
                ai_info.info3_title, 
                ai_info.info3_content
            )
            
            infos.append({
                "title": ai_info.info3_title, 
                "content": ai_info.info3_content,
                "terms": terms3,
                "category": ai_info.info3_category or classification["category"],
                "subcategory": classification["subcategory"],
                "confidence": classification["confidence"]
            })
        
        return infos
    except Exception as e:
        print(f"Error in get_ai_info_by_date: {e}")
        return []

@router.post("/", response_model=AIInfoResponse)
def add_ai_info(ai_info_data: AIInfoCreate, db: Session = Depends(get_db)):
    try:
        existing_info = db.query(AIInfo).filter(AIInfo.date == ai_info_data.date).first()

        def build_infos(obj):
            infos = []
            if obj.info1_title and obj.info1_content:
                try:
                    terms1 = json.loads(obj.info1_terms) if obj.info1_terms else []
                except json.JSONDecodeError:
                    terms1 = []
                infos.append({
                    "title": obj.info1_title,
                    "content": obj.info1_content,
                    "terms": terms1,
                    "category": obj.info1_category
                })
            if obj.info2_title and obj.info2_content:
                try:
                    terms2 = json.loads(obj.info2_terms) if obj.info2_terms else []
                except json.JSONDecodeError:
                    terms2 = []
                infos.append({
                    "title": obj.info2_title,
                    "content": obj.info2_content,
                    "terms": terms2,
                    "category": obj.info2_category
                })
            if obj.info3_title and obj.info3_content:
                try:
                    terms3 = json.loads(obj.info3_terms) if obj.info3_terms else []
                except json.JSONDecodeError:
                    terms3 = []
                infos.append({
                    "title": obj.info3_title,
                    "content": obj.info3_content,
                    "terms": terms3,
                    "category": obj.info3_category
                })
            return infos

        def terms_to_dict(terms):
            """TermItem 객체들을 딕셔너리 리스트로 변환"""
            if not terms:
                return []
            return [{"term": term.term, "description": term.description} for term in terms]

        if existing_info:
            # 기존 데이터 업데이트 (비어있는 info2, info3에 순차적으로 채움)
            infos_to_add = [i for i in ai_info_data.infos if i.title and i.content]
            fields = [
                ("info1_title", "info1_content", "info1_terms", "info1_category"),
                ("info2_title", "info2_content", "info2_terms", "info2_category"),
                ("info3_title", "info3_content", "info3_terms", "info3_category"),
            ]
            for i, (title_field, content_field, terms_field, category_field) in enumerate(fields):
                if getattr(existing_info, title_field) == '' or getattr(existing_info, content_field) == '':
                    if infos_to_add:
                        info = infos_to_add.pop(0)
                        setattr(existing_info, title_field, info.title)
                        setattr(existing_info, content_field, info.content)
                        setattr(existing_info, terms_field, json.dumps(terms_to_dict(info.terms or [])))
                        setattr(existing_info, category_field, info.category or '')
            db.commit()
            db.refresh(existing_info)
            return {
                "id": existing_info.id,
                "date": existing_info.date,
                "infos": build_infos(existing_info),
                "created_at": str(existing_info.created_at) if existing_info.created_at else None
            }
        else:
            # 새 데이터 생성
            db_ai_info = AIInfo(
                date=ai_info_data.date,
                info1_title=ai_info_data.infos[0].title if len(ai_info_data.infos) >= 1 else "",
                info1_content=ai_info_data.infos[0].content if len(ai_info_data.infos) >= 1 else "",
                info1_terms=json.dumps(terms_to_dict(ai_info_data.infos[0].terms or [])) if len(ai_info_data.infos) >= 1 else "[]",
                info1_category=ai_info_data.infos[0].category if len(ai_info_data.infos) >= 1 else "",
                info2_title=ai_info_data.infos[1].title if len(ai_info_data.infos) >= 2 else "",
                info2_content=ai_info_data.infos[1].content if len(ai_info_data.infos) >= 2 else "",
                info2_terms=json.dumps(terms_to_dict(ai_info_data.infos[1].terms or [])) if len(ai_info_data.infos) >= 2 else "[]",
                info2_category=ai_info_data.infos[1].category if len(ai_info_data.infos) >= 2 else "",
                info3_title=ai_info_data.infos[2].title if len(ai_info_data.infos) >= 3 else "",
                info3_content=ai_info_data.infos[2].content if len(ai_info_data.infos) >= 3 else "",
                info3_terms=json.dumps(terms_to_dict(ai_info_data.infos[2].terms or [])) if len(ai_info_data.infos) >= 3 else "[]",
                info3_category=ai_info_data.infos[2].category if len(ai_info_data.infos) >= 3 else ""
            )
            db.add(db_ai_info)
            db.commit()
            db.refresh(db_ai_info)
            return {
                "id": db_ai_info.id,
                "date": db_ai_info.date,
                "infos": build_infos(db_ai_info),
                "created_at": str(db_ai_info.created_at) if db_ai_info.created_at else None
            }
    except Exception as e:
        print(f"Error in add_ai_info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to add AI info: {str(e)}")

@router.delete("/{date}")
def delete_ai_info(date: str, db: Session = Depends(get_db)):
    ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
    if not ai_info:
        raise HTTPException(status_code=404, detail="AI info not found")
    
    db.delete(ai_info)
    db.commit()
    return {"message": "AI info deleted successfully"}

@router.delete("/{date}/item/{item_index}")
def delete_ai_info_item(date: str, item_index: int, db: Session = Depends(get_db)):
    """특정 날짜의 특정 항목을 삭제합니다."""
    try:
        ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
        if not ai_info:
            raise HTTPException(status_code=404, detail="AI info not found")
        
        # item_index에 따라 해당 필드를 비움
        if item_index == 0:
            ai_info.info1_title = ""
            ai_info.info1_content = ""
            ai_info.info1_terms = "[]"
        elif item_index == 1:
            ai_info.info2_title = ""
            ai_info.info2_content = ""
            ai_info.info2_terms = "[]"
        elif item_index == 2:
            ai_info.info3_title = ""
            ai_info.info3_content = ""
            ai_info.info3_terms = "[]"
        else:
            raise HTTPException(status_code=400, detail="Invalid item index. Must be 0, 1, or 2.")
        
        # 모든 필드가 비어있으면 전체 레코드 삭제
        if (not ai_info.info1_title and not ai_info.info1_content and
            not ai_info.info2_title and not ai_info.info2_content and
            not ai_info.info3_title and not ai_info.info3_content):
            db.delete(ai_info)
        else:
            db.commit()
        
        db.commit()
        return {"message": f"Item {item_index} deleted successfully"}
        
    except Exception as e:
        print(f"Error in delete_ai_info_item: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete item: {str(e)}")

@router.get("/dates/all")
def get_all_ai_info_dates(db: Session = Depends(get_db)):
    dates = [row.date for row in db.query(AIInfo).order_by(AIInfo.date).all()]
    return dates

@router.get("/all")
def get_all_ai_info(db: Session = Depends(get_db)):
    """모든 AI 정보를 제목과 날짜로 반환합니다."""
    try:
        all_ai_info = []
        ai_infos = db.query(AIInfo).order_by(AIInfo.date.desc()).all()
        
        for ai_info in ai_infos:
            # info1
            if ai_info.info1_title and ai_info.info1_content:
                try:
                    terms1 = json.loads(ai_info.info1_terms) if ai_info.info1_terms else []
                except json.JSONDecodeError:
                    terms1 = []
                all_ai_info.append({
                    "id": f"{ai_info.date}_0",
                    "date": ai_info.date,
                    "title": ai_info.info1_title,
                    "content": ai_info.info1_content,
                    "terms": terms1,
                    "info_index": 0
                })
            
            # info2
            if ai_info.info2_title and ai_info.info2_content:
                try:
                    terms2 = json.loads(ai_info.info2_terms) if ai_info.info2_terms else []
                except json.JSONDecodeError:
                    terms2 = []
                all_ai_info.append({
                    "id": f"{ai_info.date}_1",
                    "date": ai_info.date,
                    "title": ai_info.info2_title,
                    "content": ai_info.info2_content,
                    "terms": terms2,
                    "info_index": 1
                })
            
            # info3
            if ai_info.info3_title and ai_info.info3_content:
                try:
                    terms3 = json.loads(ai_info.info3_terms) if ai_info.info3_terms else []
                except json.JSONDecodeError:
                    terms3 = []
                all_ai_info.append({
                    "id": f"{ai_info.date}_2",
                    "date": ai_info.date,
                    "title": ai_info.info3_title,
                    "content": ai_info.info3_content,
                    "terms": terms3,
                    "info_index": 2
                })
        
        return all_ai_info
        
    except Exception as e:
        print(f"Error in get_all_ai_info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get all AI info: {str(e)}")

@router.get("/total-days")
def get_total_ai_info_days(db: Session = Depends(get_db)):
    """AI 정보가 등록된 총 일 수를 반환합니다."""
    total_days = db.query(AIInfo).count()
    return {"total_days": total_days}

@router.get("/terms-quiz/{session_id}")
def get_terms_quiz(session_id: str, db: Session = Depends(get_db)):
    """사용자가 학습한 날짜의 모든 용어로 퀴즈를 생성합니다."""
    try:
        # 사용자의 학습 진행상황 가져오기
        from ..models import UserProgress
        user_progress = db.query(UserProgress).filter(
            UserProgress.session_id == session_id,
            UserProgress.date != '__stats__'
        ).all()
        
        if not user_progress:
            return {"quizzes": [], "message": "학습한 내용이 없습니다."}
        
        # 학습한 날짜들의 모든 용어 수집
        all_terms = []
        for progress in user_progress:
            if progress.learned_info:
                try:
                    learned_indices = json.loads(progress.learned_info)
                    ai_info = db.query(AIInfo).filter(AIInfo.date == progress.date).first()
                    if ai_info:
                        # 각 학습한 info의 용어들 가져오기
                        for info_idx in learned_indices:
                            if info_idx == 0 and ai_info.info1_terms:
                                try:
                                    terms = json.loads(ai_info.info1_terms)
                                    all_terms.extend(terms)
                                except json.JSONDecodeError:
                                    pass
                            elif info_idx == 1 and ai_info.info2_terms:
                                try:
                                    terms = json.loads(ai_info.info2_terms)
                                    all_terms.extend(terms)
                                except json.JSONDecodeError:
                                    pass
                            elif info_idx == 2 and ai_info.info3_terms:
                                try:
                                    terms = json.loads(ai_info.info3_terms)
                                    all_terms.extend(terms)
                                except json.JSONDecodeError:
                                    pass
                except json.JSONDecodeError:
                    continue
        
        if not all_terms:
            return {"quizzes": [], "message": "학습한 용어가 없습니다."}
        
        # 중복 제거
        unique_terms = []
        seen_terms = set()
        for term in all_terms:
            if term.get('term') and term.get('term') not in seen_terms:
                unique_terms.append(term)
                seen_terms.add(term.get('term'))
        
        # 퀴즈 생성 (최대 5개)
        import random
        random.shuffle(unique_terms)
        quiz_terms = unique_terms[:5]
        
        quizzes = []
        for i, term in enumerate(quiz_terms):
            # 정답이 아닌 다른 용어들 중에서 3개 선택
            other_terms = [t for t in unique_terms if t != term]
            if len(other_terms) >= 3:
                wrong_answers = random.sample(other_terms, 3)
                options = [term['description']] + [t['description'] for t in wrong_answers]
                random.shuffle(options)
                correct_index = options.index(term['description'])
                
                quizzes.append({
                    "id": i + 1,
                    "question": f"'{term['term']}'의 올바른 뜻은?",
                    "option1": options[0],
                    "option2": options[1],
                    "option3": options[2],
                    "option4": options[3],
                    "correct": correct_index,
                    "explanation": f"'{term['term']}'는 '{term['description']}'을 의미합니다."
                })
        
        return {"quizzes": quizzes, "total_terms": len(unique_terms)}
        
    except Exception as e:
        print(f"Error in get_terms_quiz: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate terms quiz: {str(e)}")

@router.get("/terms-quiz-by-date/{date}")
def get_terms_quiz_by_date(date: str, db: Session = Depends(get_db)):
    """선택한 날짜의 모든 용어로 퀴즈를 생성합니다 (학습 여부와 상관없이)."""
    try:
        # 선택한 날짜의 AI 정보 가져오기
        ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
        
        if not ai_info:
            return {"quizzes": [], "message": f"{date} 날짜의 AI 정보가 없습니다."}
        
        # 모든 용어 수집
        all_terms = []
        
        # info1의 용어들
        if ai_info.info1_terms:
            try:
                terms1 = json.loads(ai_info.info1_terms)
                all_terms.extend(terms1)
            except json.JSONDecodeError:
                pass
        
        # info2의 용어들
        if ai_info.info2_terms:
            try:
                terms2 = json.loads(ai_info.info2_terms)
                all_terms.extend(terms2)
            except json.JSONDecodeError:
                pass
        
        # info3의 용어들
        if ai_info.info3_terms:
            try:
                terms3 = json.loads(ai_info.info3_terms)
                all_terms.extend(terms3)
            except json.JSONDecodeError:
                pass
        
        if not all_terms:
            return {"quizzes": [], "message": f"{date} 날짜에 등록된 용어가 없습니다."}
        
        # 중복 제거
        unique_terms = []
        seen_terms = set()
        for term in all_terms:
            if term.get('term') and term.get('term') not in seen_terms:
                unique_terms.append(term)
                seen_terms.add(term.get('term'))
        
        # 퀴즈 생성 (최대 5개)
        import random
        random.shuffle(unique_terms)
        quiz_terms = unique_terms[:5]
        
        quizzes = []
        for i, term in enumerate(quiz_terms):
            # 정답이 아닌 다른 용어들 중에서 3개 선택
            other_terms = [t for t in unique_terms if t != term]
            if len(other_terms) >= 3:
                wrong_answers = random.sample(other_terms, 3)
                options = [term['description']] + [t['description'] for t in wrong_answers]
                random.shuffle(options)
                correct_index = options.index(term['description'])
                
                quizzes.append({
                    "id": i + 1,
                    "question": f"'{term['term']}'의 올바른 뜻은?",
                    "option1": options[0],
                    "option2": options[1],
                    "option3": options[2],
                    "option4": options[3],
                    "correct": correct_index,
                    "explanation": f"'{term['term']}'는 '{term['description']}'을 의미합니다."
                })
        
        return {"quizzes": quizzes, "total_terms": len(unique_terms)}
        
    except Exception as e:
        print(f"Error in get_terms_quiz_by_date: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate terms quiz: {str(e)}")

@router.get("/learned-terms/{session_id}")
def get_learned_terms(session_id: str, db: Session = Depends(get_db)):
    """사용자가 학습한 모든 용어를 가져옵니다."""
    try:
        from ..models import UserProgress
        
        # 사용자의 학습 진행상황 가져오기
        user_progress = db.query(UserProgress).filter(
            UserProgress.session_id == session_id,
            UserProgress.date != '__stats__'
        ).all()
        
        if not user_progress:
            return {"terms": [], "message": "학습한 내용이 없습니다."}
        
        # 학습한 날짜들의 모든 용어 수집
        all_terms = []
        learned_dates = []
        
        for progress in user_progress:
            if progress.learned_info:
                try:
                    # AI 정보 전체 학습 기록 처리
                    if not progress.date.startswith('__terms__'):
                        learned_indices = json.loads(progress.learned_info)
                        ai_info = db.query(AIInfo).filter(AIInfo.date == progress.date).first()
                        if ai_info:
                            learned_dates.append(progress.date)
                            # 각 학습한 info의 용어들 가져오기
                            for info_idx in learned_indices:
                                if info_idx == 0 and ai_info.info1_terms:
                                    try:
                                        terms = json.loads(ai_info.info1_terms)
                                        for term in terms:
                                            term['learned_date'] = progress.date
                                            term['info_index'] = info_idx
                                        all_terms.extend(terms)
                                    except json.JSONDecodeError:
                                        pass
                                elif info_idx == 1 and ai_info.info2_terms:
                                    try:
                                        terms = json.loads(ai_info.info2_terms)
                                        for term in terms:
                                            term['learned_date'] = progress.date
                                            term['info_index'] = info_idx
                                        all_terms.extend(terms)
                                    except json.JSONDecodeError:
                                        pass
                                elif info_idx == 2 and ai_info.info3_terms:
                                    try:
                                        terms = json.loads(ai_info.info3_terms)
                                        for term in terms:
                                            term['learned_date'] = progress.date
                                            term['info_index'] = info_idx
                                        all_terms.extend(terms)
                                    except json.JSONDecodeError:
                                        pass
                    
                    # 개별 용어 학습 기록 처리
                    elif progress.date.startswith('__terms__'):
                        # __terms__{date}_{info_index} 형식에서 날짜와 info_index 추출
                        # 예: __terms__2024-01-15_0 -> date: 2024-01-15, info_index: 0
                        date_part = progress.date.replace('__terms__', '')
                        if '_' in date_part:
                            date_str, info_str = date_part.rsplit('_', 1)
                            try:
                                info_index = int(info_str)
                                date_part = date_str
                                
                                ai_info = db.query(AIInfo).filter(AIInfo.date == date_part).first()
                                if ai_info:
                                    if date_part not in learned_dates:
                                        learned_dates.append(date_part)
                                    learned_terms = json.loads(progress.learned_info) if progress.learned_info else []
                                    
                                    # 해당 info의 모든 용어에서 학습한 용어만 필터링
                                    info_terms = []
                                    if info_index == 0 and ai_info.info1_terms:
                                        try:
                                            info_terms = json.loads(ai_info.info1_terms)
                                        except json.JSONDecodeError:
                                            pass
                                    elif info_index == 1 and ai_info.info2_terms:
                                        try:
                                            info_terms = json.loads(ai_info.info2_terms)
                                        except json.JSONDecodeError:
                                            pass
                                    elif info_index == 2 and ai_info.info3_terms:
                                        try:
                                            info_terms = json.loads(ai_info.info3_terms)
                                        except json.JSONDecodeError:
                                            pass
                                    
                                    # 학습한 용어만 필터링
                                    for term in info_terms:
                                        if term.get('term') in learned_terms:
                                            term['learned_date'] = date_part
                                            term['info_index'] = info_index
                                            all_terms.append(term)
                            except (ValueError, IndexError) as e:
                                print(f"Error parsing date from {progress.date}: {e}")
                                continue
                except json.JSONDecodeError:
                    continue
        
        print(f"Debug - Total terms found: {len(all_terms)}")
        print(f"Debug - Learned dates: {learned_dates}")
        
        if not all_terms:
            return {"terms": [], "message": "학습한 용어가 없습니다."}
        
        # 중복 제거 (같은 용어라도 다른 날짜에 학습했다면 모두 포함)
        unique_terms = []
        seen_terms = set()
        
        for term in all_terms:
            term_key = f"{term.get('term')}_{term.get('learned_date')}_{term.get('info_index')}"
            if term_key not in seen_terms:
                unique_terms.append(term)
                seen_terms.add(term_key)
        
        # 날짜별로 그룹화 (중복 제거)
        terms_by_date = {}
        for term in unique_terms:
            date = term.get('learned_date', '')
            if date not in terms_by_date:
                terms_by_date[date] = []
            # 같은 날짜에 같은 용어가 이미 있는지 확인
            existing_term = next((t for t in terms_by_date[date] if t.get('term') == term.get('term')), None)
            if not existing_term:
                terms_by_date[date].append(term)
        
        # learned_dates 중복 제거 및 정렬
        learned_dates = list(set(learned_dates))
        learned_dates.sort(reverse=True)  # 최신 날짜부터
        
        return {
            "terms": unique_terms,
            "terms_by_date": terms_by_date,
            "total_terms": len(unique_terms),
            "learned_dates": learned_dates
        }
        
    except Exception as e:
        print(f"Error in get_learned_terms: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get learned terms: {str(e)}")

 

@router.options("/")
def options_ai_info():
    return Response(status_code=200)

@router.get("/debug/sample-data")
def get_sample_data(db: Session = Depends(get_db)):
    """디버깅용: 샘플 데이터 확인"""
    try:
        all_ai_info = db.query(AIInfo).limit(3).all()
        sample_data = []
        
        for ai_info in all_ai_info:
            sample_data.append({
                "date": ai_info.date,
                "info1_title": ai_info.info1_title[:50] if ai_info.info1_title else None,
                "info1_content": ai_info.info1_content[:100] if ai_info.info1_content else None,
                "info1_category": getattr(ai_info, 'info1_category', None),
                "info2_title": ai_info.info2_title[:50] if ai_info.info2_title else None,
                "info2_content": ai_info.info2_content[:100] if ai_info.info2_content else None,
                "info2_category": getattr(ai_info, 'info2_category', None),
                "info3_title": ai_info.info3_title[:50] if ai_info.info3_title else None,
                "info3_content": ai_info.info3_content[:100] if ai_info.info3_content else None,
                "info3_category": getattr(ai_info, 'info3_category', None)
            })
        
        return {"sample_data": sample_data, "total_records": db.query(AIInfo).count()}
        
    except Exception as e:
        print(f"Error getting sample data: {e}")
        return {"error": str(e)}

@router.get("/debug/category-check/{category}")
def check_category_data(category: str, db: Session = Depends(get_db)):
    """디버깅용: 특정 카테고리의 데이터 상세 확인"""
    try:
        print(f"카테고리 '{category}' 상세 확인 요청됨")
        
        all_ai_info = db.query(AIInfo).all()
        category_data = []
        
        for ai_info in all_ai_info:
            # info1 확인
            if ai_info.info1_title and ai_info.info1_content:
                stored_category = getattr(ai_info, 'info1_category', None)
                if stored_category and stored_category.strip():
                    category_data.append({
                        "source": "info1",
                        "date": ai_info.date,
                        "title": ai_info.info1_title[:50],
                        "stored_category": stored_category,
                        "matches_requested": stored_category == category,
                        "content_preview": ai_info.info1_content[:100]
                    })
                    print(f"  info1: 저장된 카테고리 '{stored_category}' -> 요청된 카테고리 '{category}'와 일치: {stored_category == category}")
            
            # info2 확인
            if ai_info.info2_title and ai_info.info2_content:
                stored_category = getattr(ai_info, 'info2_category', None)
                if stored_category and stored_category.strip():
                    category_data.append({
                        "source": "info2",
                        "date": ai_info.date,
                        "title": ai_info.info2_title[:50],
                        "stored_category": stored_category,
                        "matches_requested": stored_category == category,
                        "content_preview": ai_info.info2_content[:100]
                    })
                    print(f"  info2: 저장된 카테고리 '{stored_category}' -> 요청된 카테고리 '{category}'와 일치: {stored_category == category}")
            
            # info3 확인
            if ai_info.info3_title and ai_info.info3_content:
                stored_category = getattr(ai_info, 'info3_category', None)
                if stored_category and stored_category.strip():
                    category_data.append({
                        "source": "info3",
                        "date": ai_info.date,
                        "title": ai_info.info3_title[:50],
                        "stored_category": stored_category,
                        "matches_requested": stored_category == category,
                        "content_preview": ai_info.info3_content[:100]
                    })
                    print(f"  info3: 저장된 카테고리 '{stored_category}' -> 요청된 카테고리 '{category}'와 일치: {stored_category == category}")
        
        # 요청된 카테고리와 일치하는 항목만 필터링
        matching_items = [item for item in category_data if item["matches_requested"]]
        
        print(f"총 {len(category_data)}개 항목에서 요청된 카테고리 '{category}'와 일치하는 항목: {len(matching_items)}개")
        
        return {
            "requested_category": category,
            "total_items_with_categories": len(category_data),
            "matching_items": matching_items,
            "all_category_data": category_data
        }
        
    except Exception as e:
        print(f"Error checking category data: {e}")
        return {"error": str(e)}

@router.get("/categories/all", response_model=List[str])
def get_all_categories():
    """사용 가능한 모든 카테고리를 반환합니다."""
    try:
        return ai_classifier.get_all_categories()
    except Exception as e:
        print(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")

@router.get("/categories/{category}/subcategories", response_model=List[str])
def get_subcategories(category: str):
    """하위 카테고리는 사용하지 않으므로 빈 리스트를 반환합니다."""
    return []

@router.get("/by-category/{category}", response_model=List[dict])
def get_ai_info_by_category(category: str, db: Session = Depends(get_db)):
    """특정 카테고리의 AI 정보를 반환합니다."""
    try:
        print(f"카테고리 '{category}' 요청됨")
        
        # 모든 AI 정보를 가져와서 카테고리별로 필터링
        all_ai_info = db.query(AIInfo).all()
        print(f"총 {len(all_ai_info)}개의 AI 정보 레코드 발견")
        
        filtered_infos = []
        total_classifications = 0
        
        for ai_info in all_ai_info:
            print(f"날짜 {ai_info.date} 처리 중...")
            
            # info1 처리
            if ai_info.info1_title and ai_info.info1_content:
                # 저장된 카테고리가 있으면 우선 사용, 없으면 실시간 분류
                stored_category = getattr(ai_info, 'info1_category', None)
                if stored_category and stored_category.strip():
                    print(f"  info1 저장된 카테고리: {stored_category}")
                    if stored_category == category:
                        try:
                            terms1 = json.loads(ai_info.info1_terms) if ai_info.info1_terms else []
                        except json.JSONDecodeError:
                            terms1 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_0",
                            "date": ai_info.date,
                            "title": ai_info.info1_title,
                            "content": ai_info.info1_content,
                            "terms": terms1,
                            "category": stored_category,
                            "subcategory": None,
                            "confidence": 1.0,
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info1 저장된 카테고리로 매칭됨!")
                else:
                    # 실시간 분류
                    total_classifications += 1
                    classification = ai_classifier.classify_content(
                        ai_info.info1_title, 
                        ai_info.info1_content
                    )
                    print(f"  info1 실시간 분류 결과: {classification['category']} (신뢰도: {classification['confidence']:.2f})")
                    
                    if classification["category"] == category:
                        try:
                            terms1 = json.loads(ai_info.info1_terms) if ai_info.info1_terms else []
                        except json.JSONDecodeError:
                            terms1 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_0",
                            "date": ai_info.date,
                            "title": ai_info.info1_title,
                            "content": ai_info.info1_content,
                            "terms": terms1,
                            "category": classification["category"],
                            "subcategory": classification["subcategory"],
                            "confidence": classification["confidence"],
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info1 실시간 분류로 매칭됨!")
            
            # info2 처리
            if ai_info.info2_title and ai_info.info2_content:
                # 저장된 카테고리가 있으면 우선 사용, 없으면 실시간 분류
                stored_category = getattr(ai_info, 'info2_category', None)
                if stored_category and stored_category.strip():
                    print(f"  info2 저장된 카테고리: {stored_category}")
                    if stored_category == category:
                        try:
                            terms2 = json.loads(ai_info.info2_terms) if ai_info.info2_terms else []
                        except json.JSONDecodeError:
                            terms2 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_1",
                            "date": ai_info.date,
                            "title": ai_info.info2_title,
                            "content": ai_info.info2_content,
                            "terms": terms2,
                            "category": stored_category,
                            "subcategory": None,
                            "confidence": 1.0,
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info2 저장된 카테고리로 매칭됨!")
                else:
                    # 실시간 분류
                    total_classifications += 1
                    classification = ai_classifier.classify_content(
                        ai_info.info2_title, 
                        ai_info.info2_content
                    )
                    print(f"  info2 실시간 분류 결과: {classification['category']} (신뢰도: {classification['confidence']:.2f})")
                    
                    if classification["category"] == category:
                        try:
                            terms2 = json.loads(ai_info.info2_terms) if ai_info.info2_terms else []
                        except json.JSONDecodeError:
                            terms2 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_1",
                            "date": ai_info.date,
                            "title": ai_info.info2_title,
                            "content": ai_info.info2_content,
                            "terms": terms2,
                            "category": classification["category"],
                            "subcategory": classification["subcategory"],
                            "confidence": classification["confidence"],
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info2 실시간 분류로 매칭됨!")
            
            # info3 처리
            if ai_info.info3_title and ai_info.info3_content:
                # 저장된 카테고리가 있으면 우선 사용, 없으면 실시간 분류
                stored_category = getattr(ai_info, 'info3_category', None)
                if stored_category and stored_category.strip():
                    print(f"  info3 저장된 카테고리: {stored_category}")
                    if stored_category == category:
                        try:
                            terms3 = json.loads(ai_info.info3_terms) if ai_info.info3_terms else []
                        except json.JSONDecodeError:
                            terms3 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_2",
                            "date": ai_info.date,
                            "title": ai_info.info3_title,
                            "content": ai_info.info3_content,
                            "terms": terms3,
                            "category": stored_category,
                            "subcategory": None,
                            "confidence": 1.0,
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info3 저장된 카테고리로 매칭됨!")
                else:
                    # 실시간 분류
                    total_classifications += 1
                    classification = ai_classifier.classify_content(
                        ai_info.info3_title, 
                        ai_info.info3_content
                    )
                    print(f"  info3 실시간 분류 결과: {classification['category']} (신뢰도: {classification['confidence']:.2f})")
                    
                    if classification["category"] == category:
                        try:
                            terms3 = json.loads(ai_info.info3_terms) if ai_info.info3_terms else []
                        except json.JSONDecodeError:
                            terms3 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_2",
                            "date": ai_info.date,
                            "title": ai_info.info3_title,
                            "content": ai_info.info3_content,
                            "terms": terms3,
                            "category": classification["category"],
                            "subcategory": classification["subcategory"],
                            "confidence": classification["confidence"],
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info3 매칭됨!")
        
        print(f"총 {total_classifications}개 항목 분류 완료")
        print(f"카테고리 '{category}'에서 {len(filtered_infos)}개 항목 발견")
        
        # 날짜순으로 정렬
        filtered_infos.sort(key=lambda x: x["date"], reverse=True)
        return filtered_infos
        
    except Exception as e:
        print(f"Error getting AI info by category: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get AI info by category: {str(e)}")

@router.get("/categories/stats", response_model=dict)
def get_category_statistics(db: Session = Depends(get_db)):
    """카테고리별 통계를 반환합니다."""
    try:
        print("카테고리 통계 요청됨")
        all_ai_info = db.query(AIInfo).all()
        print(f"총 {len(all_ai_info)}개의 AI 정보 레코드 발견")
        
        category_stats = {}
        total_items = 0
        
        for ai_info in all_ai_info:
            print(f"날짜 {ai_info.date} 통계 처리 중...")
            
            # info1 처리
            if ai_info.info1_title and ai_info.info1_content:
                total_items += 1
                stored_category = getattr(ai_info, 'info1_category', None)
                if stored_category and stored_category.strip():
                    category = stored_category
                    print(f"  info1: '{ai_info.info1_title[:30]}...' -> 저장된 카테고리: {category}")
                else:
                    classification = ai_classifier.classify_content(ai_info.info1_title, ai_info.info1_content)
                    category = classification["category"]
                    print(f"  info1: '{ai_info.info1_title[:30]}...' -> 실시간 분류: {category}")
                
                if category not in category_stats:
                    category_stats[category] = {
                        "count": 0,
                        "dates": []
                    }
                
                category_stats[category]["count"] += 1
                
                # 날짜 정보
                if ai_info.date not in category_stats[category]["dates"]:
                    category_stats[category]["dates"].append(ai_info.date)
            
            # info2 처리
            if ai_info.info2_title and ai_info.info2_content:
                total_items += 1
                stored_category = getattr(ai_info, 'info2_category', None)
                if stored_category and stored_category.strip():
                    category = stored_category
                    print(f"  info2: '{ai_info.info2_title[:30]}...' -> 저장된 카테고리: {category}")
                else:
                    classification = ai_classifier.classify_content(ai_info.info2_title, ai_info.info2_content)
                    category = classification["category"]
                    print(f"  info2: '{ai_info.info2_title[:30]}...' -> 실시간 분류: {category}")
                
                if category not in category_stats:
                    category_stats[category] = {
                        "count": 0,
                        "dates": []
                    }
                
                category_stats[category]["count"] += 1
                
                # 날짜 정보
                if ai_info.date not in category_stats[category]["dates"]:
                    category_stats[category]["dates"].append(ai_info.date)
            
            # info3 처리
            if ai_info.info3_title and ai_info.info3_content:
                total_items += 1
                stored_category = getattr(ai_info, 'info3_category', None)
                if stored_category and stored_category.strip():
                    category = stored_category
                    print(f"  info3: '{ai_info.info3_title[:30]}...' -> 저장된 카테고리: {category}")
                else:
                    classification = ai_classifier.classify_content(ai_info.info3_title, ai_info.info3_content)
                    category = classification["category"]
                    print(f"  info3: '{ai_info.info3_title[:30]}...' -> 실시간 분류: {category}")
                
                if category not in category_stats:
                    category_stats[category] = {
                        "count": 0,
                        "dates": []
                    }
                
                category_stats[category]["count"] += 1
                
                # 날짜 정보
                if ai_info.date not in category_stats[category]["dates"]:
                    category_stats[category]["dates"].append(ai_info.date)
        
        print(f"총 {total_items}개 항목 분류 완료")
        
        # 날짜 정렬
        for category in category_stats:
            category_stats[category]["dates"].sort(reverse=True)
        
        print(f"카테고리 통계 결과: {category_stats}")
        return category_stats
        
    except Exception as e:
        print(f"Error getting category statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get category statistics: {str(e)}") 
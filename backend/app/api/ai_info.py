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
        print(f"=== Getting AI Info for Date: {date} ===")
        ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
        if not ai_info:
            print(f"No AI info found for date: {date}")
            return []
        
        print(f"Found AI info record: ID={ai_info.id}")
        print(f"Info1 - Title KO: {ai_info.info1_title_ko}")
        print(f"Info1 - Title EN: {ai_info.info1_title_en}")
        print(f"Info1 - Title JA: {ai_info.info1_title_ja}")
        print(f"Info1 - Title ZH: {ai_info.info1_title_zh}")
        print(f"Info1 - Content KO: {ai_info.info1_content_ko[:50] if ai_info.info1_content_ko else 'None'}...")
        print(f"Info1 - Content EN: {ai_info.info1_content_en[:50] if ai_info.info1_content_en else 'None'}...")
        print(f"Info1 - Content JA: {ai_info.info1_content_ja[:50] if ai_info.info1_content_ja else 'None'}...")
        print(f"Info1 - Content ZH: {ai_info.info1_content_zh[:50] if ai_info.info1_content_zh else 'None'}...")
        print(f"Info1 - Terms KO: {ai_info.info1_terms_ko}")
        print(f"Info1 - Terms EN: {ai_info.info1_terms_en}")
        print(f"Info1 - Terms JA: {ai_info.info1_terms_ja}")
        print(f"Info1 - Terms ZH: {ai_info.info1_terms_zh}")
        print(f"================================")
        
        infos = []
        if ai_info.info1_title_ko and ai_info.info1_content_ko:
            try:
                terms1_ko = json.loads(ai_info.info1_terms_ko) if ai_info.info1_terms_ko else []
                terms1_en = json.loads(ai_info.info1_terms_en) if ai_info.info1_terms_en else []
                terms1_ja = json.loads(ai_info.info1_terms_ja) if ai_info.info1_terms_ja else []
                terms1_zh = json.loads(ai_info.info1_terms_zh) if ai_info.info1_terms_zh else []
            except json.JSONDecodeError:
                terms1_ko = terms1_en = terms1_ja = terms1_zh = []
            
            # 카테고리 자동 분류
            classification = ai_classifier.classify_content(
                ai_info.info1_title_ko, 
                ai_info.info1_content_ko
            )
            
            infos.append({
                "title_ko": ai_info.info1_title_ko,
                "title_en": ai_info.info1_title_en or "",
                "title_ja": ai_info.info1_title_ja or "",
                "title_zh": ai_info.info1_title_zh or "",
                "content_ko": ai_info.info1_content_ko,
                "content_en": ai_info.info1_content_en or "",
                "content_ja": ai_info.info1_content_ja or "",
                "content_zh": ai_info.info1_content_zh or "",
                "terms_ko": terms1_ko,
                "terms_en": terms1_en,
                "terms_ja": terms1_ja,
                "terms_zh": terms1_zh,
                "category": ai_info.info1_category or classification["category"],
                "subcategory": classification["subcategory"],
                "confidence": classification["confidence"]
            })
        if ai_info.info2_title_ko and ai_info.info2_content_ko:
            try:
                terms2_ko = json.loads(ai_info.info2_terms_ko) if ai_info.info2_terms_ko else []
                terms2_en = json.loads(ai_info.info2_terms_en) if ai_info.info2_terms_en else []
                terms2_ja = json.loads(ai_info.info2_terms_ja) if ai_info.info2_terms_ja else []
                terms2_zh = json.loads(ai_info.info2_terms_zh) if ai_info.info2_terms_zh else []
            except json.JSONDecodeError:
                terms2_ko = terms2_en = terms2_ja = terms2_zh = []
            
            # 카테고리 자동 분류
            classification = ai_classifier.classify_content(
                ai_info.info2_title_ko, 
                ai_info.info2_content_ko
            )
            
            infos.append({
                "title_ko": ai_info.info2_title_ko,
                "title_en": ai_info.info2_title_en or "",
                "title_ja": ai_info.info2_title_ja or "",
                "title_zh": ai_info.info2_title_zh or "",
                "content_ko": ai_info.info2_content_ko,
                "content_en": ai_info.info2_content_en or "",
                "content_ja": ai_info.info2_content_ja or "",
                "content_zh": ai_info.info2_content_zh or "",
                "terms_ko": terms2_ko,
                "terms_en": terms2_en,
                "terms_ja": terms2_ja,
                "terms_zh": terms2_zh,
                "category": ai_info.info2_category or classification["category"],
                "subcategory": classification["subcategory"],
                "confidence": classification["confidence"]
            })
        if ai_info.info3_title_ko and ai_info.info3_content_ko:
            try:
                terms3_ko = json.loads(ai_info.info3_terms_ko) if ai_info.info3_terms_ko else []
                terms3_en = json.loads(ai_info.info3_terms_en) if ai_info.info3_terms_en else []
                terms3_ja = json.loads(ai_info.info3_terms_ja) if ai_info.info3_terms_ja else []
                terms3_zh = json.loads(ai_info.info3_terms_zh) if ai_info.info3_terms_zh else []
            except json.JSONDecodeError:
                terms3_ko = terms3_en = terms3_ja = terms3_zh = []
            
            # 카테고리 자동 분류
            classification = ai_classifier.classify_content(
                ai_info.info3_title_ko, 
                ai_info.info3_content_ko
            )
            
            infos.append({
                "title_ko": ai_info.info3_title_ko,
                "title_en": ai_info.info3_title_en or "",
                "title_ja": ai_info.info3_title_ja or "",
                "title_zh": ai_info.info3_title_zh or "",
                "content_ko": ai_info.info3_content_ko,
                "content_en": ai_info.info3_content_en or "",
                "content_ja": ai_info.info3_content_ja or "",
                "content_zh": ai_info.info3_content_zh or "",
                "terms_ko": terms3_ko,
                "terms_en": terms3_en,
                "terms_ja": terms3_ja,
                "terms_zh": terms3_zh,
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
        print(f"=== AI Info Registration Debug ===")
        print(f"Date: {ai_info_data.date}")
        print(f"Number of infos: {len(ai_info_data.infos)}")
        for i, info in enumerate(ai_info_data.infos):
            print(f"Info {i+1}:")
            print(f"  Title KO: {info.title_ko}")
            print(f"  Title EN: {info.title_en}")
            print(f"  Title JA: {info.title_ja}")
            print(f"  Title ZH: {info.title_zh}")
            print(f"  Content KO: {info.content_ko[:50]}...")
            print(f"  Content EN: {info.content_en[:50] if info.content_en else 'None'}...")
            print(f"  Content JA: {info.content_ja[:50] if info.content_ja else 'None'}...")
            print(f"  Content ZH: {info.content_zh[:50] if info.content_zh else 'None'}...")
            print(f"  Terms KO count: {len(info.terms_ko) if info.terms_ko else 0}")
            print(f"  Terms EN count: {len(info.terms_en) if info.terms_en else 0}")
            print(f"  Terms JA count: {len(info.terms_ja) if info.terms_ja else 0}")
            print(f"  Terms ZH count: {len(info.terms_zh) if info.terms_zh else 0}")
        print(f"================================")
        existing_info = db.query(AIInfo).filter(AIInfo.date == ai_info_data.date).first()

        def build_infos(obj):
            infos = []
            if obj.info1_title_ko and obj.info1_content_ko:
                try:
                    terms1_ko = json.loads(obj.info1_terms_ko) if obj.info1_terms_ko else []
                    terms1_en = json.loads(obj.info1_terms_en) if obj.info1_terms_en else []
                    terms1_ja = json.loads(obj.info1_terms_ja) if obj.info1_terms_ja else []
                    terms1_zh = json.loads(obj.info1_terms_zh) if obj.info1_terms_zh else []
                except json.JSONDecodeError:
                    terms1_ko = terms1_en = terms1_ja = terms1_zh = []
                infos.append({
                    # 기존 속성 (호환성 유지)
                    "title": obj.info1_title_ko,
                    "content": obj.info1_content_ko,
                    "terms": terms1_ko,
                    
                    # 다국어 속성
                    "title_ko": obj.info1_title_ko,
                    "title_en": obj.info1_title_en or "",
                    "title_ja": obj.info1_title_ja or "",
                    "title_zh": obj.info1_title_zh or "",
                    "content_ko": obj.info1_content_ko,
                    "content_en": obj.info1_content_en or "",
                    "content_ja": obj.info1_content_ja or "",
                    "content_zh": obj.info1_content_zh or "",
                    "terms_ko": terms1_ko,
                    "terms_en": terms1_en,
                    "terms_ja": terms1_ja,
                    "terms_zh": terms1_zh,
                    "category": obj.info1_category
                })
            if obj.info2_title_ko and obj.info2_content_ko:
                try:
                    terms2_ko = json.loads(obj.info2_terms_ko) if obj.info2_terms_ko else []
                    terms2_en = json.loads(obj.info2_terms_en) if obj.info2_terms_en else []
                    terms2_ja = json.loads(obj.info2_terms_ja) if obj.info2_terms_ja else []
                    terms2_zh = json.loads(obj.info2_terms_zh) if obj.info2_terms_zh else []
                except json.JSONDecodeError:
                    terms2_ko = terms2_en = terms2_ja = terms2_zh = []
                infos.append({
                    # 기존 속성 (호환성 유지)
                    "title": obj.info2_title_ko,
                    "content": obj.info2_content_ko,
                    "terms": terms2_ko,
                    
                    # 다국어 속성
                    "title_ko": obj.info2_title_ko,
                    "title_en": obj.info2_title_en or "",
                    "title_ja": obj.info2_title_ja or "",
                    "title_zh": obj.info2_title_zh or "",
                    "content_ko": obj.info2_content_ko,
                    "content_en": obj.info2_content_en or "",
                    "content_ja": obj.info2_content_ja or "",
                    "content_zh": obj.info2_content_zh or "",
                    "terms_ko": terms2_ko,
                    "terms_en": terms2_en,
                    "terms_ja": terms2_ja,
                    "terms_zh": terms2_zh,
                    "category": obj.info2_category
                })
            if obj.info3_title_ko and obj.info3_content_ko:
                try:
                    terms3_ko = json.loads(obj.info3_terms_ko) if obj.info3_terms_ko else []
                    terms3_en = json.loads(obj.info3_terms_en) if obj.info3_terms_en else []
                    terms3_ja = json.loads(obj.info3_terms_ja) if obj.info3_terms_ja else []
                    terms3_zh = json.loads(obj.info3_terms_zh) if obj.info3_terms_zh else []
                except json.JSONDecodeError:
                    terms3_ko = terms3_en = terms3_ja = terms3_zh = []
                infos.append({
                    # 기존 속성 (호환성 유지)
                    "title": obj.info3_title_ko,
                    "content": obj.info3_content_ko,
                    "terms": terms3_ko,
                    
                    # 다국어 속성
                    "title_ko": obj.info3_title_ko,
                    "title_en": obj.info3_title_en or "",
                    "title_ja": obj.info3_title_ja or "",
                    "title_zh": obj.info3_title_zh or "",
                    "content_ko": obj.info3_content_ko,
                    "content_en": obj.info3_content_en or "",
                    "content_ja": obj.info3_content_ja or "",
                    "content_zh": obj.info3_content_zh or "",
                    "terms_ko": terms3_ko,
                    "terms_en": terms3_en,
                    "terms_ja": terms3_ja,
                    "terms_zh": terms3_zh,
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
            infos_to_add = [i for i in ai_info_data.infos if i.title_ko and i.content_ko]
            fields = [
                ("info1_title_ko", "info1_content_ko", "info1_terms_ko", "info1_category"),
                ("info2_title_ko", "info2_content_ko", "info2_terms_ko", "info2_category"),
                ("info3_title_ko", "info3_content_ko", "info3_terms_ko", "info3_category"),
            ]
            for i, (title_field, content_field, terms_field, category_field) in enumerate(fields):
                if getattr(existing_info, title_field) == '' or getattr(existing_info, content_field) == '':
                    if infos_to_add:
                        info = infos_to_add.pop(0)
                        setattr(existing_info, title_field, info.title_ko)
                        setattr(existing_info, content_field, info.content_ko)
                        setattr(existing_info, terms_field, json.dumps(terms_to_dict(info.terms_ko or [])))
                        setattr(existing_info, category_field, info.category or '')
                        
                        # 다른 언어 필드들도 설정
                        setattr(existing_info, title_field.replace('_ko', '_en'), info.title_en or '')
                        setattr(existing_info, title_field.replace('_ko', '_ja'), info.title_ja or '')
                        setattr(existing_info, title_field.replace('_ko', '_zh'), info.title_zh or '')
                        setattr(existing_info, content_field.replace('_ko', '_en'), info.content_en or '')
                        setattr(existing_info, content_field.replace('_ko', '_ja'), info.content_ja or '')
                        setattr(existing_info, content_field.replace('_ko', '_zh'), info.content_zh or '')
                        setattr(existing_info, terms_field.replace('_ko', '_en'), json.dumps(terms_to_dict(info.terms_en or [])))
                        setattr(existing_info, terms_field.replace('_ko', '_ja'), json.dumps(terms_to_dict(info.terms_ja or [])))
                        setattr(existing_info, terms_field.replace('_ko', '_zh'), json.dumps(terms_to_dict(info.terms_zh or [])))
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
                info1_title_ko=ai_info_data.infos[0].title_ko if len(ai_info_data.infos) >= 1 else "",
                info1_title_en=ai_info_data.infos[0].title_en if len(ai_info_data.infos) >= 1 else "",
                info1_title_ja=ai_info_data.infos[0].title_ja if len(ai_info_data.infos) >= 1 else "",
                info1_title_zh=ai_info_data.infos[0].title_zh if len(ai_info_data.infos) >= 1 else "",
                info1_content_ko=ai_info_data.infos[0].content_ko if len(ai_info_data.infos) >= 1 else "",
                info1_content_en=ai_info_data.infos[0].content_en if len(ai_info_data.infos) >= 1 else "",
                info1_content_ja=ai_info_data.infos[0].content_ja if len(ai_info_data.infos) >= 1 else "",
                info1_content_zh=ai_info_data.infos[0].content_zh if len(ai_info_data.infos) >= 1 else "",
                info1_terms_ko=json.dumps(terms_to_dict(ai_info_data.infos[0].terms_ko or [])) if len(ai_info_data.infos) >= 1 else "[]",
                info1_terms_en=json.dumps(terms_to_dict(ai_info_data.infos[0].terms_en or [])) if len(ai_info_data.infos) >= 1 else "[]",
                info1_terms_ja=json.dumps(terms_to_dict(ai_info_data.infos[0].terms_ja or [])) if len(ai_info_data.infos) >= 1 else "[]",
                info1_terms_zh=json.dumps(terms_to_dict(ai_info_data.infos[0].terms_zh or [])) if len(ai_info_data.infos) >= 1 else "[]",
                info1_category=ai_info_data.infos[0].category if len(ai_info_data.infos) >= 1 else "",
                info2_title_ko=ai_info_data.infos[1].title_ko if len(ai_info_data.infos) >= 2 else "",
                info2_title_en=ai_info_data.infos[1].title_en if len(ai_info_data.infos) >= 2 else "",
                info2_title_ja=ai_info_data.infos[1].title_ja if len(ai_info_data.infos) >= 2 else "",
                info2_title_zh=ai_info_data.infos[1].title_zh if len(ai_info_data.infos) >= 2 else "",
                info2_content_ko=ai_info_data.infos[1].content_ko if len(ai_info_data.infos) >= 2 else "",
                info2_content_en=ai_info_data.infos[1].content_en if len(ai_info_data.infos) >= 2 else "",
                info2_content_ja=ai_info_data.infos[1].content_ja if len(ai_info_data.infos) >= 2 else "",
                info2_content_zh=ai_info_data.infos[1].content_zh if len(ai_info_data.infos) >= 2 else "",
                info2_terms_ko=json.dumps(terms_to_dict(ai_info_data.infos[1].terms_ko or [])) if len(ai_info_data.infos) >= 2 else "[]",
                info2_terms_en=json.dumps(terms_to_dict(ai_info_data.infos[1].terms_en or [])) if len(ai_info_data.infos) >= 2 else "[]",
                info2_terms_ja=json.dumps(terms_to_dict(ai_info_data.infos[1].terms_ja or [])) if len(ai_info_data.infos) >= 2 else "[]",
                info2_terms_zh=json.dumps(terms_to_dict(ai_info_data.infos[1].terms_zh or [])) if len(ai_info_data.infos) >= 2 else "[]",
                info2_category=ai_info_data.infos[1].category if len(ai_info_data.infos) >= 2 else "",
                info3_title_ko=ai_info_data.infos[2].title_ko if len(ai_info_data.infos) >= 3 else "",
                info3_title_en=ai_info_data.infos[2].title_en if len(ai_info_data.infos) >= 3 else "",
                info3_title_ja=ai_info_data.infos[2].title_ja if len(ai_info_data.infos) >= 3 else "",
                info3_title_zh=ai_info_data.infos[2].title_zh if len(ai_info_data.infos) >= 3 else "",
                info3_content_ko=ai_info_data.infos[2].content_ko if len(ai_info_data.infos) >= 3 else "",
                info3_content_en=ai_info_data.infos[2].content_en if len(ai_info_data.infos) >= 3 else "",
                info3_content_ja=ai_info_data.infos[2].content_ja if len(ai_info_data.infos) >= 3 else "",
                info3_content_zh=ai_info_data.infos[2].content_zh if len(ai_info_data.infos) >= 3 else "",
                info3_terms_ko=json.dumps(terms_to_dict(ai_info_data.infos[2].terms_ko or [])) if len(ai_info_data.infos) >= 3 else "[]",
                info3_terms_en=json.dumps(terms_to_dict(ai_info_data.infos[2].terms_en or [])) if len(ai_info_data.infos) >= 3 else "[]",
                info3_terms_ja=json.dumps(terms_to_dict(ai_info_data.infos[2].terms_ja or [])) if len(ai_info_data.infos) >= 3 else "[]",
                info3_terms_zh=json.dumps(terms_to_dict(ai_info_data.infos[2].terms_zh or [])) if len(ai_info_data.infos) >= 3 else "[]",
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
        
        # item_index에 따라 해당 필드를 비움 (다국어 필드 사용)
        if item_index == 0:
            ai_info.info1_title_ko = ""
            ai_info.info1_content_ko = ""
            ai_info.info1_terms_ko = "[]"
            ai_info.info1_title_en = ""
            ai_info.info1_content_en = ""
            ai_info.info1_terms_en = "[]"
            ai_info.info1_title_ja = ""
            ai_info.info1_content_ja = ""
            ai_info.info1_terms_ja = "[]"
            ai_info.info1_title_zh = ""
            ai_info.info1_content_zh = ""
            ai_info.info1_terms_zh = "[]"
            ai_info.info1_category = ""
        elif item_index == 1:
            ai_info.info2_title_ko = ""
            ai_info.info2_content_ko = ""
            ai_info.info2_terms_ko = "[]"
            ai_info.info2_title_en = ""
            ai_info.info2_content_en = ""
            ai_info.info2_terms_en = "[]"
            ai_info.info2_title_ja = ""
            ai_info.info2_content_ja = ""
            ai_info.info2_terms_ja = "[]"
            ai_info.info2_title_zh = ""
            ai_info.info2_content_zh = ""
            ai_info.info2_terms_zh = "[]"
            ai_info.info2_category = ""
        elif item_index == 2:
            ai_info.info3_title_ko = ""
            ai_info.info3_content_ko = ""
            ai_info.info3_terms_ko = "[]"
            ai_info.info3_title_en = ""
            ai_info.info3_content_en = ""
            ai_info.info3_terms_en = "[]"
            ai_info.info3_title_ja = ""
            ai_info.info3_content_ja = ""
            ai_info.info3_terms_ja = "[]"
            ai_info.info3_title_zh = ""
            ai_info.info3_content_zh = ""
            ai_info.info3_terms_zh = "[]"
            ai_info.info3_category = ""
        else:
            raise HTTPException(status_code=400, detail="Invalid item index. Must be 0, 1, or 2.")
        
        # 모든 필드가 비어있으면 전체 레코드 삭제
        if (not ai_info.info1_title_ko and not ai_info.info1_content_ko and
            not ai_info.info2_title_ko and not ai_info.info2_content_ko and
            not ai_info.info3_title_ko and not ai_info.info3_content_ko):
            db.delete(ai_info)
        else:
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
def get_all_ai_info(language: str = "ko", db: Session = Depends(get_db)):
    """모든 AI 정보를 제목과 날짜로 반환합니다."""
    try:
        all_ai_info = []
        ai_infos = db.query(AIInfo).order_by(AIInfo.date.desc()).all()
        
        print(f"DEBUG: get_all_ai_info called with language: {language}")
        print(f"DEBUG: Total AIInfo records in database: {len(ai_infos)}")
        
        # 언어별 컬럼 선택 (올바른 컬럼명 사용)
        title_suffix = f"info1_title_{language}"
        content_suffix = f"info1_content_{language}"
        terms_suffix = f"info1_terms_{language}"
        
        print(f"DEBUG: Using columns: {title_suffix}, {content_suffix}, {terms_suffix}")
        
        for ai_info in ai_infos:
            print(f"DEBUG: Processing AIInfo record for date: {ai_info.date}")
            print(f"DEBUG: Record ID: {ai_info.id}")
            
            # info1 - 요청된 언어의 데이터만 사용
            info1_title = getattr(ai_info, title_suffix, None)
            info1_content = getattr(ai_info, content_suffix, None)
            info1_terms = getattr(ai_info, terms_suffix, None)
            
            print(f"DEBUG: info1{title_suffix}: {info1_title[:50] if info1_title else 'None'}...")
            print(f"DEBUG: info1{content_suffix}: {info1_content[:50] if info1_content else 'None'}...")
            
            if info1_title and info1_content:
                try:
                    terms1 = json.loads(info1_terms) if info1_terms else []
                except json.JSONDecodeError:
                    terms1 = []
                
                # 카테고리 정보 가져오기
                stored_category = getattr(ai_info, 'info1_category', None)
                if not stored_category or not stored_category.strip():
                    # 실시간 분류
                    classification = ai_classifier.classify_content(
                        info1_title, 
                        info1_content
                    )
                    stored_category = classification["category"]
                
                all_ai_info.append({
                    "id": f"{ai_info.date}_0",
                    "date": ai_info.date,
                    "title": info1_title,
                    "content": info1_content,
                    "terms": terms1,
                    "category": stored_category,
                    "subcategory": None,
                    "confidence": "1.0",
                    "created_at": ai_info.created_at,
                    "info_index": 0
                })
                print(f"DEBUG: Added info1 for date {ai_info.date} with title: {info1_title[:30]}...")
            else:
                print(f"DEBUG: Skipped info1 for date {ai_info.date} - {language} language data not available")
            
            # info2 - 요청된 언어의 데이터만 사용
            info2_title = getattr(ai_info, f'info2_title_{language}', None)
            info2_content = getattr(ai_info, f'info2_content_{language}', None)
            info2_terms = getattr(ai_info, f'info2_terms_{language}', None)
            
            print(f"DEBUG: info2{title_suffix}: {info2_title[:50] if info2_title else 'None'}...")
            print(f"DEBUG: info2{content_suffix}: {info2_content[:50] if info2_content else 'None'}...")
            
            if info2_title and info2_content:
                try:
                    terms2 = json.loads(info2_terms) if info2_terms else []
                except json.JSONDecodeError:
                    terms2 = []
                
                # 카테고리 정보 가져오기
                stored_category = getattr(ai_info, 'info2_category', None)
                if not stored_category or not stored_category.strip():
                    # 실시간 분류
                    classification = ai_classifier.classify_content(
                        info2_title, 
                        info2_content
                    )
                    stored_category = classification["category"]
                
                all_ai_info.append({
                    "id": f"{ai_info.date}_1",
                    "date": ai_info.date,
                    "title": info2_title,
                    "content": info2_content,
                    "terms": terms2,
                    "category": stored_category,
                    "subcategory": None,
                    "confidence": "1.0",
                    "created_at": ai_info.created_at,
                    "info_index": 1
                })
                print(f"DEBUG: Added info2 for date {ai_info.date} with title: {info2_title[:30]}...")
            else:
                print(f"DEBUG: Skipped info2 for date {ai_info.date} - {language} language data not available")
            
            # info3 - 요청된 언어의 데이터만 사용
            info3_title = getattr(ai_info, f'info3_title_{language}', None)
            info3_content = getattr(ai_info, f'info3_content_{language}', None)
            info3_terms = getattr(ai_info, f'info3_terms_{language}', None)
            
            print(f"DEBUG: info3{title_suffix}: {info3_title[:50] if info3_title else 'None'}...")
            print(f"DEBUG: info3{content_suffix}: {info3_content[:50] if info3_content else 'None'}...")
            
            if info3_title and info3_content:
                try:
                    terms3 = json.loads(info3_terms) if info3_terms else []
                except json.JSONDecodeError:
                    terms3 = []
                
                # 카테고리 정보 가져오기
                stored_category = getattr(ai_info, 'info3_category', None)
                if not stored_category or not stored_category.strip():
                    # 실시간 분류
                    classification = ai_classifier.classify_content(
                        info3_title, 
                        info3_content
                    )
                    stored_category = classification["category"]
                
                all_ai_info.append({
                    "id": f"{ai_info.date}_2",
                    "date": ai_info.date,
                    "title": info3_title,
                    "content": info3_content,
                    "terms": terms3,
                    "category": stored_category,
                    "subcategory": None,
                    "confidence": "1.0",
                    "created_at": ai_info.created_at,
                    "info_index": 2
                })
                print(f"DEBUG: Added info3 for date {ai_info.date} with title: {info3_title[:30]}...")
            else:
                print(f"DEBUG: Skipped info3 for date {ai_info.date} - {language} language data not available")
        
        print(f"DEBUG: Total AI info items found: {len(all_ai_info)}")
        return all_ai_info
        
    except Exception as e:
        print(f"Error in get_all_ai_info: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get all AI info: {str(e)}")

@router.get("/total-days")
def get_total_ai_info_days(db: Session = Depends(get_db)):
    """AI 정보가 등록된 총 일 수를 반환합니다."""
    total_days = db.query(AIInfo).count()
    return {"total_days": total_days}

@router.get("/total-count", response_model=dict)
def get_total_ai_info_count(db: Session = Depends(get_db)):
    """AI 정보 전체목록의 총 카드 수를 반환합니다."""
    try:
        # AI 정보 전체목록 가져오기 (실제 카드 수 계산)
        total_cards = 0
        ai_infos = db.query(AIInfo).all()
        
        print(f"DEBUG: Total AIInfo records found: {len(ai_infos)}")
        
        for ai_info in ai_infos:
            info1_count = 0
            info2_count = 0
            info3_count = 0
            
            # info1
            if ai_info.info1_title_ko and ai_info.info1_content_ko:
                total_cards += 1
                info1_count = 1
                print(f"DEBUG: Date {ai_info.date} - Info1: title='{ai_info.info1_title_ko[:20]}...', content='{ai_info.info1_content_ko[:20]}...'")
            
            # info2
            if ai_info.info2_title_ko and ai_info.info2_content_ko:
                total_cards += 1
                info2_count = 1
                print(f"DEBUG: Date {ai_info.date} - Info2: title='{ai_info.info2_title_ko[:20]}...', content='{ai_info.info2_content_ko[:20]}...'")
            
            # info3
            if ai_info.info3_title_ko and ai_info.info3_content_ko:
                total_cards += 1
                info3_count = 1
                print(f"DEBUG: Date {ai_info.date} - Info3: title='{ai_info.info3_title_ko[:20]}...', content='{ai_info.info3_content_ko[:20]}...'")
            
            print(f"DEBUG: Date {ai_info.date} - Info1: {info1_count}, Info2: {info2_count}, Info3: {info3_count}")
        
        print(f"DEBUG: Final total_cards: {total_cards}")
        return {"total_count": total_cards}
    except Exception as e:
        print(f"Error getting total AI info count: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get total AI info count: {str(e)}")

@router.get("/learned-count/{session_id}", response_model=dict)
def get_user_learned_ai_info_count(session_id: str, db: Session = Depends(get_db)):
    """사용자가 학습 완료한 AI 정보 카드의 총 개수를 반환합니다."""
    try:
        from ..models import UserProgress
        
        # AI 정보 전체목록 가져오기
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
        
        # 사용자의 학습 진행상황 가져오기
        user_progress = db.query(UserProgress).filter(
            UserProgress.session_id == session_id,
            UserProgress.date != '__stats__'
        ).all()
        
        total_learned_count = 0
        
        # 각 AI 정보 카드에 대해 사용자가 학습했는지 확인
        for ai_info_item in all_ai_info:
            date = ai_info_item["date"]
            info_index = ai_info_item["info_index"]
            
            # 해당 날짜의 사용자 진행상황 찾기
            progress = next((p for p in user_progress if p.date == date), None)
            if progress and progress.learned_info:
                try:
                    learned_indices = json.loads(progress.learned_info)
                    if info_index in learned_indices:
                        total_learned_count += 1
                except json.JSONDecodeError:
                    continue
        
        return {"learned_count": total_learned_count}
    except Exception as e:
        print(f"Error getting user learned AI info count: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user learned AI info count: {str(e)}")

@router.get("/terms-total-count", response_model=dict)
def get_total_terms_count(db: Session = Depends(get_db)):
    """AI 정보 전체목록의 총 용어 수를 반환합니다 (총 정보 개수 * 20)."""
    try:
        # AI 정보 전체목록 가져오기 (실제 카드 수 계산)
        total_cards = 0
        ai_infos = db.query(AIInfo).all()
        
        for ai_info in ai_infos:
            # info1
            if ai_info.info1_title and ai_info.info1_content:
                total_cards += 1
            
            # info2
            if ai_info.info2_title and ai_info.info2_content:
                total_cards += 1
            
            # info3
            if ai_info.info3_title and ai_info.info3_content:
                total_cards += 1
        
        # 각 카드당 평균 20개의 용어가 있다고 가정
        total_terms = total_cards * 20
        
        return {"total_terms": total_terms}
    except Exception as e:
        print(f"Error getting total terms count: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get total terms count: {str(e)}")

@router.get("/terms-learned-count/{session_id}", response_model=dict)
def get_user_learned_terms_count(session_id: str, db: Session = Depends(get_db)):
    """사용자가 학습 완료한 용어의 총 개수를 반환합니다."""
    try:
        from ..models import UserProgress
        
        # AI 정보 전체목록 가져오기
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
        
        # 사용자의 학습 진행상황 가져오기
        user_progress = db.query(UserProgress).filter(
            UserProgress.session_id == session_id,
            UserProgress.date != '__stats__'
        ).all()
        
        total_learned_terms = 0
        
        # 각 AI 정보 카드에 대해 사용자가 학습한 용어들 확인
        for ai_info_item in all_ai_info:
            date = ai_info_item["date"]
            info_index = ai_info_item["info_index"]
            terms = ai_info_item["terms"]
            
            # 해당 날짜의 사용자 진행상황 찾기
            progress = next((p for p in user_progress if p.date == date), None)
            if progress and progress.learned_info:
                try:
                    learned_indices = json.loads(progress.learned_info)
                    if info_index in learned_indices:
                        # 해당 카드를 학습했다면 모든 용어를 학습한 것으로 간주
                        total_learned_terms += len(terms)
                except json.JSONDecodeError:
                    continue
        
        return {"learned_terms": total_learned_terms}
    except Exception as e:
        print(f"Error getting user learned terms count: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user learned terms count: {str(e)}")

@router.get("/terms-quiz/{session_id}")
def get_terms_quiz(session_id: str, language: str = "ko", db: Session = Depends(get_db)):
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
                        # 언어별 컬럼 선택
                        terms_suffix = f"_terms_{language}"
                        
                        # 각 학습한 info의 용어들 가져오기 (선택된 언어 기준)
                        for info_idx in learned_indices:
                            info_terms_field = getattr(ai_info, f'info{info_idx + 1}{terms_suffix}', None)
                            if info_terms_field:
                                try:
                                    terms = json.loads(info_terms_field)
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
                
                # 언어별 퀴즈 질문과 설명
                if language == 'ko':
                    question = f"'{term['term']}'의 올바른 뜻은?"
                    explanation = f"'{term['term']}'는 '{term['description']}'을 의미합니다."
                elif language == 'en':
                    question = f"What is the correct meaning of '{term['term']}'?"
                    explanation = f"'{term['term']}' means '{term['description']}'."
                elif language == 'ja':
                    question = f"'{term['term']}'の正しい意味は？"
                    explanation = f"'{term['term']}'は'{term['description']}'を意味します。"
                else:  # zh
                    question = f"'{term['term']}'的正确含义是什么？"
                    explanation = f"'{term['term']}'的意思是'{term['description']}'。"
                
                quizzes.append({
                    "id": i + 1,
                    "question": question,
                    "option1": options[0],
                    "option2": options[1],
                    "option3": options[2],
                    "option4": options[3],
                    "correct": correct_index,
                    "explanation": explanation
                })
        
        return {"quizzes": quizzes, "total_terms": len(unique_terms)}
        
    except Exception as e:
        print(f"Error in get_terms_quiz: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate terms quiz: {str(e)}")

@router.get("/terms-quiz-by-date/{date}")
def get_terms_quiz_by_date(date: str, language: str = "ko", db: Session = Depends(get_db)):
    """선택한 날짜의 모든 용어로 퀴즈를 생성합니다 (학습 여부와 상관없이)."""
    try:
        # 언어별 컬럼 선택
        terms_suffix = f"_terms_{language}"
        
        # 선택한 날짜의 AI 정보 가져오기
        ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
        
        if not ai_info:
            return {"quizzes": [], "message": f"No AI information available for date {date}."}
        
        # 모든 용어 수집 (선택된 언어 기준)
        all_terms = []
        
        # info1의 용어들 (선택된 언어 기준)
        info1_terms_field = getattr(ai_info, f'info1{terms_suffix}', None)
        if info1_terms_field:
            try:
                terms1 = json.loads(info1_terms_field)
                all_terms.extend(terms1)
            except json.JSONDecodeError:
                pass
        
        # info2의 용어들 (선택된 언어 기준)
        info2_terms_field = getattr(ai_info, f'info2{terms_suffix}', None)
        if info2_terms_field:
            try:
                terms2 = json.loads(info2_terms_field)
                all_terms.extend(terms2)
            except json.JSONDecodeError:
                pass
        
        # info3의 용어들 (선택된 언어 기준)
        info3_terms_field = getattr(ai_info, f'info3{terms_suffix}', None)
        if info3_terms_field:
            try:
                terms3 = json.loads(info3_terms_field)
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
                
                # 언어별 퀴즈 질문과 설명
                if language == 'ko':
                    question = f"'{term['term']}'의 올바른 뜻은?"
                    explanation = f"'{term['term']}'는 '{term['description']}'을 의미합니다."
                elif language == 'en':
                    question = f"What is the correct meaning of '{term['term']}'?"
                    explanation = f"'{term['term']}' means '{term['description']}'."
                elif language == 'ja':
                    question = f"'{term['term']}'の正しい意味は？"
                    explanation = f"'{term['term']}'は'{term['description']}'を意味します。"
                else:  # zh
                    question = f"'{term['term']}'的正确含义是什么？"
                    explanation = f"'{term['term']}'的意思是'{term['description']}'。"
                
                quizzes.append({
                    "id": i + 1,
                    "question": question,
                    "option1": options[0],
                    "option2": options[1],
                    "option3": options[2],
                    "option4": options[3],
                    "correct": correct_index,
                    "explanation": explanation
                })
        
        return {"quizzes": quizzes, "total_terms": len(unique_terms)}
        
    except Exception as e:
        print(f"Error in get_terms_quiz_by_date: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate terms quiz: {str(e)}")

@router.get("/learned-terms/{session_id}")
def get_learned_terms(session_id: str, language: str = "ko", db: Session = Depends(get_db)):
    """사용자가 학습한 모든 용어를 가져옵니다."""
    try:
        from ..models import UserProgress
        
        # 언어별 컬럼 선택
        terms_suffix = f"_terms_{language}"
        
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
                                info_terms_field = getattr(ai_info, f'info{info_idx + 1}{terms_suffix}', None)
                                if info_terms_field:
                                    try:
                                        terms = json.loads(info_terms_field)
                                        for term in terms:
                                            # 언어별 용어 제목과 설명 추가
                                            term['term'] = term.get('term', '')
                                            term['description'] = term.get('description', '')
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
                                    info_terms_field = getattr(ai_info, f'info{info_index + 1}{terms_suffix}', None)
                                    if info_terms_field:
                                        try:
                                            info_terms = json.loads(info_terms_field)
                                        except json.JSONDecodeError:
                                            pass
                                    
                                    # 학습한 용어만 필터링
                                    for term in info_terms:
                                        if term.get('term') in learned_terms:
                                            # 언어별 용어 제목과 설명 추가
                                            term['term'] = term.get('term', '')
                                            term['description'] = term.get('description', '')
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

@router.get("/debug/category-check/{category:path}")
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

@router.get("/debug/all-stored-categories")
def get_all_stored_categories(db: Session = Depends(get_db)):
    """디버깅용: 데이터베이스에 저장된 모든 카테고리 값 확인"""
    try:
        print("저장된 모든 카테고리 값 확인 요청됨")
        
        all_ai_info = db.query(AIInfo).all()
        stored_categories = set()
        
        for ai_info in all_ai_info:
            # info1 카테고리
            if ai_info.info1_title and ai_info.info1_content:
                stored_category = getattr(ai_info, 'info1_category', None)
                if stored_category and stored_category.strip():
                    stored_categories.add(stored_category)
                    print(f"  info1: '{stored_category}'")
            
            # info2 카테고리
            if ai_info.info2_title and ai_info.info2_content:
                stored_category = getattr(ai_info, 'info2_category', None)
                if stored_category and stored_category.strip():
                    stored_categories.add(stored_category)
                    print(f"  info2: '{stored_category}'")
            
            # info3 카테고리
            if ai_info.info3_title and ai_info.info3_content:
                stored_category = getattr(ai_info, 'info3_category', None)
                if stored_category and stored_category.strip():
                    stored_categories.add(stored_category)
                    print(f"  info3: '{stored_category}'")
        
        stored_categories_list = list(stored_categories)
        stored_categories_list.sort()
        
        print(f"총 {len(stored_categories_list)}개의 고유한 카테고리 값 발견: {stored_categories_list}")
        
        return {
            "total_unique_categories": len(stored_categories_list),
            "stored_categories": stored_categories_list
        }
        
    except Exception as e:
        print(f"Error getting stored categories: {e}")
        return {"error": str(e)}

@router.get("/categories/all", response_model=List[str])
def get_all_categories():
    """사용 가능한 모든 카테고리를 반환합니다."""
    try:
        return ai_classifier.get_all_categories()
    except Exception as e:
        print(f"Error getting categories: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get categories: {str(e)}")

@router.get("/categories/{category:path}/subcategories", response_model=List[str])
def get_subcategories(category: str):
    """하위 카테고리는 사용하지 않으므로 빈 리스트를 반환합니다."""
    return []

@router.get("/by-category/{category:path}", response_model=List[dict])
def get_ai_info_by_category(category: str, language: str = "ko", db: Session = Depends(get_db)):
    """특정 카테고리의 AI 정보를 반환합니다."""
    try:
        print(f"카테고리 '{category}' 요청됨 (언어: {language})")
        
        # 언어별 컬럼 선택
        title_suffix = f"_title_{language}"
        content_suffix = f"_content_{language}"
        terms_suffix = f"_terms_{language}"
        
        # 모든 AI 정보를 가져와서 카테고리별로 필터링
        all_ai_info = db.query(AIInfo).all()
        print(f"총 {len(all_ai_info)}개의 AI 정보 레코드 발견")
        
        filtered_infos = []
        total_classifications = 0
        
        for ai_info in all_ai_info:
            print(f"날짜 {ai_info.date} 처리 중...")
            
            # info1 처리
            info1_title = getattr(ai_info, f'info1{title_suffix}', None)
            info1_content = getattr(ai_info, f'info1{content_suffix}', None)
            info1_terms = getattr(ai_info, f'info1{terms_suffix}', None)
            
            if info1_title and info1_content:
                # 저장된 카테고리가 있으면 우선 사용, 없으면 실시간 분류
                stored_category = getattr(ai_info, 'info1_category', None)
                if stored_category and stored_category.strip():
                    print(f"  info1 저장된 카테고리: {stored_category}")
                    if stored_category == category:
                        try:
                            terms1 = json.loads(info1_terms) if info1_terms else []
                        except json.JSONDecodeError:
                            terms1 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_0",
                            "date": ai_info.date,
                            "title": info1_title,
                            "content": info1_content,
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
                        info1_title, 
                        info1_content
                    )
                    print(f"  info1 실시간 분류 결과: {classification['category']} (신뢰도: {classification['confidence']:.2f})")
                    
                    if classification["category"] == category:
                        try:
                            terms1 = json.loads(info1_terms) if info1_terms else []
                        except json.JSONDecodeError:
                            terms1 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_0",
                            "date": ai_info.date,
                            "title": info1_title,
                            "content": info1_content,
                            "terms": terms1,
                            "category": classification["category"],
                            "subcategory": classification["subcategory"],
                            "confidence": classification["confidence"],
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info1 실시간 분류로 매칭됨!")
            
            # info2 처리
            info2_title = getattr(ai_info, f'info2{title_suffix}', None)
            info2_content = getattr(ai_info, f'info2{content_suffix}', None)
            info2_terms = getattr(ai_info, f'info2{terms_suffix}', None)
            
            if info2_title and info2_content:
                # 저장된 카테고리가 있으면 우선 사용, 없으면 실시간 분류
                stored_category = getattr(ai_info, 'info2_category', None)
                if stored_category and stored_category.strip():
                    print(f"  info2 저장된 카테고리: {stored_category}")
                    if stored_category == category:
                        try:
                            terms2 = json.loads(info2_terms) if info2_terms else []
                        except json.JSONDecodeError:
                            terms2 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_1",
                            "date": ai_info.date,
                            "title": info2_title,
                            "content": info2_content,
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
                        info2_title, 
                        info2_content
                    )
                    print(f"  info2 실시간 분류 결과: {classification['category']} (신뢰도: {classification['confidence']:.2f})")
                    
                    if classification["category"] == category:
                        try:
                            terms2 = json.loads(info2_terms) if info2_terms else []
                        except json.JSONDecodeError:
                            terms2 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_1",
                            "date": ai_info.date,
                            "title": info2_title,
                            "content": info2_content,
                            "terms": terms2,
                            "category": classification["category"],
                            "subcategory": classification["subcategory"],
                            "confidence": classification["confidence"],
                            "created_at": ai_info.created_at
                        })
                        print(f"  -> info2 실시간 분류로 매칭됨!")
            
            # info3 처리
            info3_title = getattr(ai_info, f'info3{title_suffix}', None)
            info3_content = getattr(ai_info, f'info3{content_suffix}', None)
            info3_terms = getattr(ai_info, f'info3{terms_suffix}', None)
            
            if info3_title and info3_content:
                # 저장된 카테고리가 있으면 우선 사용, 없으면 실시간 분류
                stored_category = getattr(ai_info, 'info3_category', None)
                if stored_category and stored_category.strip():
                    print(f"  info3 저장된 카테고리: {stored_category}")
                    if stored_category == category:
                        try:
                            terms3 = json.loads(info3_terms) if info3_terms else []
                        except json.JSONDecodeError:
                            terms3 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_2",
                            "date": ai_info.date,
                            "title": info3_title,
                            "content": info3_content,
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
                        info3_title, 
                        info3_content
                    )
                    print(f"  info3 실시간 분류 결과: {classification['category']} (신뢰도: {classification['confidence']:.2f})")
                    
                    if classification["category"] == category:
                        try:
                            terms3 = json.loads(info3_terms) if info3_terms else []
                        except json.JSONDecodeError:
                            terms3 = []
                        
                        filtered_infos.append({
                            "id": f"{ai_info.date}_2",
                            "date": ai_info.date,
                            "title": info3_title,
                            "content": info3_content,
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
            if ai_info.info1_title_ko and ai_info.info1_content_ko:
                total_items += 1
                stored_category = getattr(ai_info, 'info1_category', None)
                if stored_category and stored_category.strip():
                    category = stored_category
                    print(f"  info1: '{ai_info.info1_title_ko[:30]}...' -> 저장된 카테고리: {category}")
                else:
                    classification = ai_classifier.classify_content(ai_info.info1_title_ko, ai_info.info1_content_ko)
                    category = classification["category"]
                    print(f"  info1: '{ai_info.info1_title_ko[:30]}...' -> 실시간 분류: {category}")
                
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
            if ai_info.info2_title_ko and ai_info.info2_content_ko:
                total_items += 1
                stored_category = getattr(ai_info, 'info2_category', None)
                if stored_category and stored_category.strip():
                    category = stored_category
                    print(f"  info2: '{ai_info.info2_title_ko[:30]}...' -> 저장된 카테고리: {category}")
                else:
                    classification = ai_classifier.classify_content(ai_info.info2_title_ko, ai_info.info2_content_ko)
                    category = classification["category"]
                    print(f"  info2: '{ai_info.info2_title_ko[:30]}...' -> 실시간 분류: {category}")
                
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
            if ai_info.info3_title_ko and ai_info.info3_content_ko:
                total_items += 1
                stored_category = getattr(ai_info, 'info3_category', None)
                if stored_category and stored_category.strip():
                    category = stored_category
                    print(f"  info2: '{ai_info.info3_title_ko[:30]}...' -> 저장된 카테고리: {category}")
                else:
                    classification = ai_classifier.classify_content(ai_info.info3_title_ko, ai_info.info3_content_ko)
                    category = classification["category"]
                    print(f"  info3: '{ai_info.info3_title_ko[:30]}...' -> 실시간 분류: {category}")
                
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

@router.get("/all-terms/{language}")
def get_all_terms(language: str = "ko", db: Session = Depends(get_db)):
    """시스템에 등록된 모든 용어를 가져옵니다."""
    try:
        print(f"=== Getting All Terms for Language: {language} ===")
        
        # 언어별 컬럼 선택
        terms_suffix = f"_terms_{language}"
        
        # 모든 AI 정보에서 용어 수집
        all_ai_info = db.query(AIInfo).all()
        all_terms = []
        
        for ai_info in all_ai_info:
            # info1의 용어들
            if ai_info.info1_title_ko and ai_info.info1_content_ko:
                info1_terms_field = getattr(ai_info, f'info1{terms_suffix}', None)
                if info1_terms_field:
                    try:
                        terms = json.loads(info1_terms_field)
                        for term in terms:
                            term_data = {
                                'term': term.get('term', ''),
                                'description': term.get('description', ''),
                                'date': ai_info.date,
                                'info_index': 0,
                                'title': ai_info.info1_title_ko,
                                'category': ai_info.info1_category or '미분류'
                            }
                            all_terms.append(term_data)
                    except json.JSONDecodeError:
                        pass
            
            # info2의 용어들
            if ai_info.info2_title_ko and ai_info.info2_content_ko:
                info2_terms_field = getattr(ai_info, f'info2{terms_suffix}', None)
                if info2_terms_field:
                    try:
                        terms = json.loads(info2_terms_field)
                        for term in terms:
                            term_data = {
                                'term': term.get('term', ''),
                                'description': term.get('description', ''),
                                'date': ai_info.date,
                                'info_index': 1,
                                'title': ai_info.info2_title_ko,
                                'category': ai_info.info2_category or '미분류'
                            }
                            all_terms.append(term_data)
                    except json.JSONDecodeError:
                        pass
            
            # info3의 용어들
            if ai_info.info3_title_ko and ai_info.info3_content_ko:
                info3_terms_field = getattr(ai_info, f'info3{terms_suffix}', None)
                if info3_terms_field:
                    try:
                        terms = json.loads(info3_terms_field)
                        for term in terms:
                            term_data = {
                                'term': term.get('term', ''),
                                'description': term.get('description', ''),
                                'date': ai_info.date,
                                'info_index': 2,
                                'title': ai_info.info3_title_ko,
                                'category': ai_info.info3_category or '미분류'
                            }
                            all_terms.append(term_data)
                    except json.JSONDecodeError:
                        pass
        
        print(f"Total terms found: {len(all_terms)}")
        
        # 중복 제거 (같은 용어라도 다른 날짜에 있다면 모두 포함)
        unique_terms = []
        seen_terms = set()
        
        for term in all_terms:
            term_key = f"{term['term']}_{term['date']}_{term['info_index']}"
            if term_key not in seen_terms:
                seen_terms.add(term_key)
                unique_terms.append(term)
        
        print(f"Unique terms after deduplication: {len(unique_terms)}")
        
        return {
            "terms": unique_terms,
            "total_terms": len(unique_terms),
            "message": f"총 {len(unique_terms)}개의 용어를 찾았습니다."
        }
        
    except Exception as e:
        print(f"Error in get_all_terms: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get all terms: {str(e)}")

@router.get("/titles/{language}")
def get_all_titles(language: str = "ko", db: Session = Depends(get_db)):
    """모든 AI 정보의 제목만 가져옵니다 (성능 최적화용)."""
    try:
        print(f"=== Getting All Titles for Language: {language} ===")
        
        # 언어별 컬럼 선택
        title_suffix = f"_title_{language}"
        
        # 모든 AI 정보에서 제목만 수집
        all_ai_info = db.query(AIInfo).all()
        all_titles = []
        
        for ai_info in all_ai_info:
            # info1의 제목
            if ai_info.info1_title_ko and ai_info.info1_content_ko:
                title = getattr(ai_info, f'info1{title_suffix}', None) or ai_info.info1_title_ko
                if title:
                    all_titles.append({
                        'id': f"{ai_info.date}_0",
                        'date': ai_info.date,
                        'title': title,
                        'info_index': 0,
                        'category': ai_info.info1_category or '미분류',
                        'has_content': True
                    })
            
            # info2의 제목
            if ai_info.info2_title_ko and ai_info.info2_content_ko:
                title = getattr(ai_info, f'info2{title_suffix}', None) or ai_info.info2_title_ko
                if title:
                    all_titles.append({
                        'id': f"{ai_info.date}_1",
                        'date': ai_info.date,
                        'title': title,
                        'info_index': 1,
                        'category': ai_info.info2_category or '미분류',
                        'has_content': True
                    })
            
            # info3의 제목
            if ai_info.info3_title_ko and ai_info.info3_content_ko:
                title = getattr(ai_info, f'info3{title_suffix}', None) or ai_info.info3_title_ko
                if title:
                    all_titles.append({
                        'id': f"{ai_info.date}_2",
                        'date': ai_info.date,
                        'title': title,
                        'info_index': 2,
                        'category': ai_info.info3_category or '미분류',
                        'has_content': True
                    })
        
        print(f"Total titles found: {len(all_titles)}")
        
        return {
            "titles": all_titles,
            "total_titles": len(all_titles),
            "message": f"총 {len(all_titles)}개의 제목을 찾았습니다."
        }
        
    except Exception as e:
        print(f"Error in get_all_titles: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get all titles: {str(e)}")

@router.get("/content/{date}/{info_index}/{language}")
def get_content_by_index(date: str, info_index: int, language: str = "ko", db: Session = Depends(get_db)):
    """특정 날짜와 인덱스의 AI 정보 내용을 가져옵니다."""
    try:
        print(f"=== Getting Content for Date: {date}, Index: {info_index}, Language: {language} ===")
        
        ai_info = db.query(AIInfo).filter(AIInfo.date == date).first()
        if not ai_info:
            raise HTTPException(status_code=404, detail=f"No AI info found for date: {date}")
        
        # info_index에 따른 컬럼 선택
        if info_index == 0:
            title_field = f'info1_title_{language}'
            content_field = f'info1_content_{language}'
            terms_field = f'info1_terms_{language}'
            category_field = 'info1_category'
        elif info_index == 1:
            title_field = f'info2_title_{language}'
            content_field = f'info2_content_{language}'
            terms_field = f'info2_terms_{language}'
            category_field = 'info2_category'
        elif info_index == 2:
            title_field = f'info3_title_{language}'
            content_field = f'info3_content_{language}'
            terms_field = f'info3_terms_{language}'
            category_field = 'info3_category'
        else:
            raise HTTPException(status_code=400, detail=f"Invalid info_index: {info_index}")
        
        # 기본값으로 한국어 사용
        title = getattr(ai_info, title_field, None) or getattr(ai_info, f'info{info_index + 1}_title_ko', None)
        content = getattr(ai_info, content_field, None) or getattr(ai_info, f'info{info_index + 1}_content_ko', None)
        terms = getattr(ai_info, terms_field, None) or getattr(ai_info, f'info{info_index + 1}_terms_ko', None)
        category = getattr(ai_info, category_field, None)
        
        if not title or not content:
            raise HTTPException(status_code=404, detail=f"No content found for date: {date}, index: {info_index}")
        
        # 용어 파싱
        try:
            parsed_terms = json.loads(terms) if terms else []
        except json.JSONDecodeError:
            parsed_terms = []
        
        # 카테고리 자동 분류
        classification = ai_classifier.classify_content(title, content)
        
        result = {
            "id": f"{date}_{info_index}",
            "date": date,
            "title": title,
            "content": content,
            "terms": parsed_terms,
            "category": category or classification["category"],
            "subcategory": classification["subcategory"],
            "confidence": classification["confidence"],
            "info_index": info_index
        }
        
        print(f"Content retrieved successfully: {title[:50]}...")
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in get_content_by_index: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get content: {str(e)}")
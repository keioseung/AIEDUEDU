from pydantic import BaseModel
from typing import List, Optional, Union
from datetime import datetime

# User Schemas (실제 Supabase 스키마에 맞춤)
class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    role: Optional[str] = "user"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# AI Info Schemas
class TermItem(BaseModel):
    term: str
    description: str

class AIInfoItem(BaseModel):
    id: Optional[Union[int, str]] = None
    date: Optional[str] = None
    
    # 다국어 제목
    title_ko: str
    title_en: str
    title_ja: str
    title_zh: str
    
    # 다국어 내용
    content_ko: str
    content_en: str
    content_ja: str
    content_zh: str
    
    # 다국어 용어
    terms_ko: Optional[List[TermItem]] = []
    terms_en: Optional[List[TermItem]] = []
    terms_ja: Optional[List[TermItem]] = []
    terms_zh: Optional[List[TermItem]] = []
    
    category: Optional[str] = None
    subcategory: Optional[str] = None
    confidence: Optional[float] = None

class AIInfoCreate(BaseModel):
    date: str
    infos: List[AIInfoItem]

class AIInfoResponse(BaseModel):
    id: int
    date: str
    infos: List[AIInfoItem]
    created_at: str

    class Config:
        from_attributes = True

# 용어 수정을 위한 스키마들
class TermsUpdate(BaseModel):
    """특정 항목의 용어만 수정하기 위한 스키마"""
    target_index: int  # 0, 1, 2 (info1, info2, info3)
    target_terms_ko_first: Optional[str] = None
    target_terms_ko_first_desc: Optional[str] = None
    target_terms_en_first: Optional[str] = None
    target_terms_en_first_desc: Optional[str] = None
    target_terms_ja_first: Optional[str] = None
    target_terms_ja_first_desc: Optional[str] = None
    target_terms_zh_first: Optional[str] = None
    target_terms_zh_first_desc: Optional[str] = None

class TermsUpdateResponse(BaseModel):
    """용어 수정 응답 스키마"""
    success: bool
    message: str
    updated_data: Optional[AIInfoResponse] = None

# Quiz Schemas
class QuizCreate(BaseModel):
    topic: str
    
    # 다국어 지원 - 문제
    question_ko: str
    question_en: Optional[str] = None
    question_ja: Optional[str] = None
    question_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 1
    option1_ko: str
    option1_en: Optional[str] = None
    option1_ja: Optional[str] = None
    option1_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 2
    option2_ko: str
    option2_en: Optional[str] = None
    option2_ja: Optional[str] = None
    option2_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 3
    option3_ko: str
    option3_en: Optional[str] = None
    option3_ja: Optional[str] = None
    option3_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 4
    option4_ko: str
    option4_en: Optional[str] = None
    option4_ja: Optional[str] = None
    option4_zh: Optional[str] = None
    
    # 다국어 지원 - 설명
    explanation_ko: str
    explanation_en: Optional[str] = None
    explanation_ja: Optional[str] = None
    explanation_zh: Optional[str] = None
    
    correct: int  # 정답 번호 (언어별로 동일)
    
    # 기존 단일 언어 필드들 (하위 호환성을 위해 유지)
    question: Optional[str] = None
    option1: Optional[str] = None
    option2: Optional[str] = None
    option3: Optional[str] = None
    option4: Optional[str] = None
    explanation: Optional[str] = None

class QuizResponse(BaseModel):
    id: int
    topic: str
    
    # 다국어 지원 - 문제
    question_ko: str
    question_en: Optional[str] = None
    question_ja: Optional[str] = None
    question_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 1
    option1_ko: str
    option1_en: Optional[str] = None
    option1_ja: Optional[str] = None
    option1_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 2
    option2_ko: str
    option2_en: Optional[str] = None
    option2_ja: Optional[str] = None
    option2_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 3
    option3_ko: str
    option3_en: Optional[str] = None
    option3_ja: Optional[str] = None
    option3_zh: Optional[str] = None
    
    # 다국어 지원 - 선택지 4
    option4_ko: str
    option4_en: Optional[str] = None
    option4_ja: Optional[str] = None
    option4_zh: Optional[str] = None
    
    # 다국어 지원 - 설명
    explanation_ko: str
    explanation_en: Optional[str] = None
    explanation_ja: Optional[str] = None
    explanation_zh: Optional[str] = None
    
    correct: int
    created_at: datetime
    
    # 기존 단일 언어 필드들 (하위 호환성을 위해 유지)
    question: Optional[str] = None
    option1: Optional[str] = None
    option2: Optional[str] = None
    option3: Optional[str] = None
    option4: Optional[str] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

# User Progress Schemas
class UserProgressCreate(BaseModel):
    session_id: str
    date: str
    learned_info: List[int]
    stats: Optional[dict] = None

class UserProgressResponse(BaseModel):
    id: int
    session_id: str
    date: str
    learned_info: List[int]
    stats: Optional[dict]
    created_at: datetime

    class Config:
        from_attributes = True

# Prompt Schemas
class PromptCreate(BaseModel):
    title: str
    content: str
    category: str

class PromptResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Base Content Schemas
class BaseContentCreate(BaseModel):
    title: str
    content: str
    category: str

class BaseContentResponse(BaseModel):
    id: int
    title: str
    content: str
    category: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True 

# Term Schemas
class TermResponse(BaseModel):
    id: int
    term: str
    description: str
    created_at: datetime

    class Config:
        from_attributes = True 
from sqlalchemy import Column, Integer, BigInteger, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from .database import Base

# 사용자 모델 추가 (실제 Supabase 스키마에 맞춤)
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)  # 실제로는 integer
    username = Column(String, unique=True, index=True, nullable=False)  # varchar
    email = Column(String, unique=True, index=True, nullable=True)  # varchar
    hashed_password = Column(String, nullable=False)  # 실제 필드명: hashed_password
    role = Column(String, default="user", nullable=False)  # varchar
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # timestamptz

# 활동 로그 모델 추가
class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)  # 사용자 ID (로그인한 경우)
    username = Column(String, nullable=True)  # 사용자명 (빠른 조회용)
    action = Column(String, nullable=False)  # 액션 (로그인, 학습, 퀴즈 등)
    details = Column(Text, nullable=True)  # 상세 내용
    log_type = Column(String, default='user')  # 'user', 'system', 'security', 'error'
    log_level = Column(String, default='info')  # 'info', 'warning', 'error', 'success'
    ip_address = Column(String, nullable=True)  # IP 주소
    user_agent = Column(Text, nullable=True)  # 사용자 에이전트
    session_id = Column(String, nullable=True)  # 세션 ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# 백업 히스토리 모델 추가
class BackupHistory(Base):
    __tablename__ = "backup_history"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_size = Column(Integer, nullable=True)  # 파일 크기 (bytes)
    backup_type = Column(String, default='manual')  # 'manual', 'auto'
    tables_included = Column(Text, nullable=True)  # JSON 배열로 포함된 테이블 목록
    description = Column(Text, nullable=True)
    created_by = Column(Integer, nullable=True)  # 백업을 생성한 사용자 ID
    created_by_username = Column(String, nullable=True)  # 사용자명 (빠른 조회용)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AIInfo(Base):
    __tablename__ = "ai_info"
    
    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, index=True)
    
    # Info 1 - 다국어 지원
    info1_title_ko = Column(Text)  # 한국어 제목
    info1_title_en = Column(Text)  # 영어 제목
    info1_title_ja = Column(Text)  # 일본어 제목
    info1_title_zh = Column(Text)  # 중국어 제목
    info1_content_ko = Column(Text)  # 한국어 내용
    info1_content_en = Column(Text)  # 영어 내용
    info1_content_ja = Column(Text)  # 일본어 내용
    info1_content_zh = Column(Text)  # 중국어 내용
    info1_terms_ko = Column(Text)  # 한국어 용어 (JSON 직렬화)
    info1_terms_en = Column(Text)  # 영어 용어 (JSON 직렬화)
    info1_terms_ja = Column(Text)  # 일본어 용어 (JSON 직렬화)
    info1_terms_zh = Column(Text)  # 중국어 용어 (JSON 직렬화)
    info1_category = Column(String)  # 카테고리 (언어별로 동일)
    
    # Info 2 - 다국어 지원
    info2_title_ko = Column(Text)
    info2_title_en = Column(Text)
    info2_title_ja = Column(Text)
    info2_title_zh = Column(Text)
    info2_content_ko = Column(Text)
    info2_content_en = Column(Text)
    info2_content_ja = Column(Text)
    info2_content_zh = Column(Text)
    info2_terms_ko = Column(Text)
    info2_terms_en = Column(Text)
    info2_terms_ja = Column(Text)
    info2_terms_zh = Column(Text)
    info2_category = Column(String)
    
    # Info 3 - 다국어 지원
    info3_title_ko = Column(Text)
    info3_title_en = Column(Text)
    info3_title_ja = Column(Text)
    info3_title_zh = Column(Text)
    info3_content_ko = Column(Text)
    info3_content_en = Column(Text)
    info3_content_ja = Column(Text)
    info3_content_zh = Column(Text)
    info3_terms_ko = Column(Text)
    info3_terms_en = Column(Text)
    info3_terms_ja = Column(Text)
    info3_terms_zh = Column(Text)
    info3_category = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Quiz(Base):
    __tablename__ = "quiz"
    
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String, index=True)
    
    # 다국어 지원 - 문제
    question_ko = Column(Text)  # 한국어 문제
    question_en = Column(Text)  # 영어 문제
    question_ja = Column(Text)  # 일본어 문제
    question_zh = Column(Text)  # 중국어 문제
    
    # 다국어 지원 - 선택지 1
    option1_ko = Column(Text)  # 한국어 선택지 1
    option1_en = Column(Text)  # 영어 선택지 1
    option1_ja = Column(Text)  # 일본어 선택지 1
    option1_zh = Column(Text)  # 중국어 선택지 1
    
    # 다국어 지원 - 선택지 2
    option2_ko = Column(Text)  # 한국어 선택지 2
    option2_en = Column(Text)  # 영어 선택지 2
    option2_ja = Column(Text)  # 일본어 선택지 2
    option2_zh = Column(Text)  # 중국어 선택지 2
    
    # 다국어 지원 - 선택지 3
    option3_ko = Column(Text)  # 한국어 선택지 3
    option3_en = Column(Text)  # 영어 선택지 3
    option3_ja = Column(Text)  # 일본어 선택지 3
    option3_zh = Column(Text)  # 중국어 선택지 3
    
    # 다국어 지원 - 선택지 4
    option4_ko = Column(Text)  # 한국어 선택지 4
    option4_en = Column(Text)  # 영어 선택지 4
    option4_ja = Column(Text)  # 일본어 선택지 4
    option4_zh = Column(Text)  # 중국어 선택지 4
    
    # 다국어 지원 - 설명
    explanation_ko = Column(Text)  # 한국어 설명
    explanation_en = Column(Text)  # 영어 설명
    explanation_ja = Column(Text)  # 일본어 설명
    explanation_zh = Column(Text)  # 중국어 설명
    
    correct = Column(Integer)  # 정답 번호 (언어별로 동일)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # 기존 단일 언어 필드들 (하위 호환성을 위해 유지)
    question = Column(Text)  # 기존 한국어 문제
    option1 = Column(Text)  # 기존 한국어 선택지 1
    option2 = Column(Text)  # 기존 한국어 선택지 2
    option3 = Column(Text)  # 기존 한국어 선택지 3
    option4 = Column(Text)  # 기존 한국어 선택지 4
    explanation = Column(Text)  # 기존 한국어 설명

class UserProgress(Base):
    __tablename__ = "user_progress"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, index=True)
    date = Column(String, index=True)
    learned_info = Column(Text)  # JSON 직렬화 문자열
    stats = Column(Text)         # JSON 직렬화 문자열
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Prompt(Base):
    __tablename__ = "prompt"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BaseContent(Base):
    __tablename__ = "base_content"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    content = Column(Text)
    category = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 

class Term(Base):
    __tablename__ = "term"
    id = Column(Integer, primary_key=True, index=True)
    term = Column(String, unique=True, index=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now()) 
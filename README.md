# AIEDUEDU - AI 교육 플랫폼

AI 정보를 학습하고 퀴즈를 통해 지식을 확인할 수 있는 교육 플랫폼입니다.

## 🌍 다국어 지원 시스템

### 지원 언어
- 🇰🇷 한국어 (기본)
- 🇺🇸 영어
- 🇯🇵 일본어  
- 🇨🇳 중국어

### 주요 기능

#### 1. 관리자 모드 - 다국어 AI 정보 등록
- 각 AI 정보에 대해 4가지 언어 버전을 한 번에 입력
- 제목, 내용, 관련 용어를 모든 언어로 등록 가능
- 카테고리 분류 및 관리

#### 2. 사용자 모드 - 언어별 콘텐츠 표시
- 사용자가 선택한 언어에 따라 해당 언어 버전의 내용 표시
- 언어별 용어 학습 지원
- 실시간 언어 전환

### 데이터베이스 구조

#### AIInfo 테이블 (다국어 지원)
```sql
-- 각 정보 항목별로 4가지 언어 필드
info1_title_ko, info1_title_en, info1_title_ja, info1_title_zh
info1_content_ko, info1_content_en, info1_content_ja, info1_content_zh
info1_terms_ko, info1_terms_en, info1_terms_ja, info1_terms_zh

info2_title_ko, info2_title_en, info2_title_ja, info2_title_zh
info2_content_ko, info2_content_en, info2_content_ja, info2_content_zh
info2_terms_ko, info2_terms_en, info2_terms_ja, info2_terms_zh

info3_title_ko, info3_title_en, info3_title_ja, info3_title_zh
info3_content_ko, info3_content_en, info3_content_ja, info3_content_zh
info3_terms_ko, info3_terms_en, info3_terms_ja, info3_terms_zh
```

### 마이그레이션 가이드

기존 데이터베이스를 다국어 지원으로 업그레이드하려면:

1. `backend/add_terms_columns.sql` 스크립트 실행
2. 기존 데이터는 한국어 필드로 자동 복사
3. 프론트엔드 및 백엔드 코드 업데이트

### 사용법

#### 관리자
1. 관리자 페이지에서 AI 정보 등록
2. 각 언어별로 제목, 내용, 용어 입력
3. 카테고리 선택 및 저장

#### 사용자
1. 언어 선택기에서 원하는 언어 선택
2. 선택한 언어로 AI 정보 및 용어 학습
3. 실시간 언어 전환으로 다양한 언어 학습 가능

## 기술 스택

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: PostgreSQL/SQLite
- **State Management**: React Query, Zustand
- **UI Components**: Framer Motion, Lucide React

## 설치 및 실행

### 백엔드
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 프론트엔드
```bash
cd frontend
npm install
npm run dev
```

## 라이선스

MIT License 
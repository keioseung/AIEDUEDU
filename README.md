# AI Mastery Hub - Next.js + FastAPI

AI 학습 플랫폼을 Next.js 프론트엔드와 FastAPI 백엔드로 구축한 웹 애플리케이션입니다.

## 🎯 Android 15 호환성

이 프로젝트는 Android 15의 새로운 기능과 보안 요구사항을 반영하여 구축되었습니다:

### ✨ PWA (Progressive Web App) 지원
- **오프라인 기능**: 서비스 워커를 통한 캐싱
- **앱 설치**: 홈 화면에 앱으로 설치 가능
- **백그라운드 동기화**: 네트워크 연결 시 자동 데이터 동기화
- **푸시 알림**: 실시간 알림 지원

### 🔒 보안 강화
- **TLS 1.2+ 강제**: TLS 1.0/1.1 사용 제한
- **보안 헤더**: XSS, CSRF, 클릭재킹 방지
- **CSP (Content Security Policy)**: 리소스 로딩 제한
- **HSTS**: HTTPS 강제 적용

### 📱 모바일 최적화
- **더 넓은 화면 지원**: Android 15의 새로운 화면 비율 대응
- **시스템 바 호환성**: 상태 표시줄, 네비게이션 바 최적화
- **터치 최적화**: 44px 최소 터치 영역
- **안전 영역**: 노치, 홈 인디케이터 고려

### ⚡ 성능 최적화
- **코드 분할**: 자동 번들 최적화
- **이미지 최적화**: Next.js Image 컴포넌트 활용
- **캐싱 전략**: 효율적인 리소스 캐싱
- **애니메이션 최적화**: GPU 가속 활용

## 🚀 기술 스택

### Frontend (Next.js)
- **Next.js 14** - React 기반 프레임워크
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 애니메이션
- **React Query** - 서버 상태 관리
- **Zustand** - 클라이언트 상태 관리

### Backend (FastAPI)
- **FastAPI** - Python 웹 프레임워크
- **SQLAlchemy** - ORM
- **PostgreSQL** - 데이터베이스 (Supabase)
- **Pydantic** - 데이터 검증
- **Uvicorn** - ASGI 서버

## 📁 프로젝트 구조

```
ai-mastery-hub/
├── frontend/                 # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # App Router
│   │   ├── components/      # React 컴포넌트
│   │   ├── lib/             # 유틸리티 함수
│   │   ├── hooks/           # 커스텀 훅
│   │   └── types/           # TypeScript 타입 정의
│   ├── public/              # 정적 파일
│   └── package.json
├── backend/                  # FastAPI 백엔드
│   ├── app/
│   │   ├── api/             # API 라우터
│   │   ├── models/          # 데이터베이스 모델
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── services/        # 비즈니스 로직
│   │   └── utils/           # 유틸리티 함수
│   ├── requirements.txt
│   └── main.py
└── README.md
```

## 🛠️ 설치 및 실행

### 1. 저장소 클론
```bash
git clone <repository-url>
cd ai-mastery-hub
```

### 2. 백엔드 설정
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. 환경 변수 설정
```bash
# backend/.env 파일 생성
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jzfwqunitwpczhartwdh.supabase.co:5432/postgres
SECRET_KEY=your-secret-key
```

### 4. 백엔드 실행
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 5. 프론트엔드 설정
```bash
cd frontend
npm install
```

### 6. 프론트엔드 실행
```bash
cd frontend
npm run dev
```

## 🌐 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

## 📚 주요 기능

- 🤖 AI 뉴스 및 정보 제공
- 📝 퀴즈 시스템
- 📊 학습 진행률 추적
- 🏆 성취 시스템
- 💡 프롬프트 관리
- 📖 기반 내용 관리
- 🎨 Duolingo 스타일 UI/UX

## 🔧 개발

### API 엔드포인트

- `GET /api/ai-info/{date}` - 특정 날짜의 AI 정보 조회
- `POST /api/ai-info` - AI 정보 추가
- `GET /api/quiz/{topic}` - 퀴즈 조회
- `POST /api/quiz` - 퀴즈 추가
- `GET /api/user-progress/{session_id}` - 사용자 진행상황 조회
- `POST /api/user-progress` - 사용자 진행상황 업데이트

### 데이터베이스 스키마

- `ai_info` - AI 정보 테이블
- `quiz` - 퀴즈 테이블
- `user_progress` - 사용자 진행상황 테이블
- `prompt` - 프롬프트 테이블
- `base_content` - 기반 내용 테이블

## 🚀 배포

### Vercel (프론트엔드)
```bash
cd frontend
vercel --prod
```

### Railway/Heroku (백엔드)
```bash
cd backend
# Railway CLI 또는 Heroku CLI 사용
```

## 📝 라이선스

MIT License 
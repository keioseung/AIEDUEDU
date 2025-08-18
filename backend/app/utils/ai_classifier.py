"""
AI 정보 내용을 분석하여 자동으로 카테고리를 분류하는 유틸리티
"""

import re
from typing import Dict, List, Tuple

class AIClassifier:
    """AI 정보 내용을 분석하여 카테고리를 자동 분류하는 클래스"""
    
    def __init__(self):
        # 카테고리별 키워드 정의
        self.category_keywords = {
            "챗봇/대화형 AI": [
                "chatgpt", "gpt", "claude", "bard", "llama", "대화", "챗봇", "conversation",
                "dialogue", "language model", "언어 모델", "자연어", "nlp", "conversational",
                "chat", "talk", "discuss", "question", "answer", "응답", "질문"
            ],
            "이미지 생성 AI": [
                "dall-e", "midjourney", "stable diffusion", "이미지", "그림", "사진", "생성",
                "image generation", "image creation", "art", "artwork", "visual", "그래픽",
                "디자인", "drawing", "painting", "illustration", "photo", "picture"
            ],
            "코딩/개발 도구": [
                "github copilot", "copilot", "code", "코딩", "프로그래밍", "개발", "software",
                "programming", "developer", "coder", "script", "algorithm", "function",
                "debug", "testing", "deployment", "git", "repository", "코드", "알고리즘"
            ],
            "음성/오디오 AI": [
                "stt", "tts", "음성 인식", "음성 합성", "speech", "voice", "audio", "오디오",
                "음성", "말", "발음", "녹음", "재생", "speech recognition", "text to speech",
                "voice generation", "음성 변환", "음성 분석"
            ],
            "데이터 분석/ML": [
                "machine learning", "ml", "데이터 분석", "data analysis", "statistics", "통계",
                "prediction", "예측", "classification", "분류", "clustering", "군집화",
                "regression", "회귀", "neural network", "신경망", "deep learning", "딥러닝"
            ],
            "AI 윤리/정책": [
                "ai ethics", "ai 윤리", "bias", "편향", "fairness", "공정성", "transparency",
                "투명성", "accountability", "책임", "privacy", "개인정보", "security", "보안",
                "regulation", "규제", "policy", "정책", "responsible ai", "책임있는 ai"
            ],
            "AI 하드웨어/인프라": [
                "gpu", "tpu", "npu", "하드웨어", "hardware", "infrastructure", "인프라",
                "computing", "연산", "processing", "처리", "server", "서버", "cloud", "클라우드",
                "edge", "엣지", "quantum", "양자", "chip", "칩", "processor", "프로세서"
            ],
            "AI 응용 서비스": [
                "recommendation", "추천", "search", "검색", "translation", "번역", "translation",
                "summarization", "요약", "sentiment analysis", "감정 분석", "content creation",
                "콘텐츠 생성", "automation", "자동화", "optimization", "최적화"
            ]
        }
        
        # 하위 카테고리 정의
        self.subcategory_keywords = {
            "챗봇/대화형 AI": {
                "일반 대화": ["chat", "talk", "conversation", "대화", "채팅"],
                "교육/튜터링": ["education", "tutoring", "학습", "교육", "가르침", "튜터"],
                "고객 서비스": ["customer service", "고객", "서비스", "문의", "상담"],
                "창작 도우미": ["writing", "창작", "글쓰기", "아이디어", "창의성"]
            },
            "이미지 생성 AI": {
                "아트워크": ["art", "artwork", "예술", "그림", "painting"],
                "사진/리얼리즘": ["photo", "realistic", "사진", "현실적", "photorealistic"],
                "디자인": ["design", "디자인", "레이아웃", "branding", "브랜딩"],
                "3D/모델링": ["3d", "modeling", "3차원", "모델링", "mesh"]
            },
            "코딩/개발 도구": {
                "코드 생성": ["code generation", "코드 생성", "generate code"],
                "코드 리뷰": ["code review", "코드 리뷰", "review", "검토"],
                "디버깅": ["debug", "디버깅", "error", "오류", "bug"],
                "테스트": ["testing", "테스트", "unit test", "통합 테스트"]
            }
        }
    
    def classify_content(self, title: str, content: str) -> Dict[str, str]:
        """
        제목과 내용을 분석하여 카테고리와 하위 카테고리를 분류합니다.
        
        Args:
            title: AI 정보 제목
            content: AI 정보 내용
            
        Returns:
            Dict[str, str]: {'category': '메인 카테고리', 'subcategory': '하위 카테고리'}
        """
        # 제목과 내용을 합쳐서 분석
        full_text = f"{title} {content}".lower()
        
        # 메인 카테고리 분류
        category_scores = {}
        for category, keywords in self.category_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword.lower() in full_text:
                    score += 1
            if score > 0:
                category_scores[category] = score
        
        # 가장 높은 점수의 카테고리 선택
        if category_scores:
            main_category = max(category_scores, key=category_scores.get)
        else:
            main_category = "기타"
        
        # 하위 카테고리 분류
        subcategory = "일반"
        if main_category in self.subcategory_keywords:
            subcategory_scores = {}
            for sub, sub_keywords in self.subcategory_keywords[main_category].items():
                score = 0
                for keyword in sub_keywords:
                    if keyword.lower() in full_text:
                        score += 1
                if score > 0:
                    subcategory_scores[sub] = score
            
            if subcategory_scores:
                subcategory = max(subcategory_scores, key=subcategory_scores.get)
        
        return {
            "category": main_category,
            "subcategory": subcategory,
            "confidence": self._calculate_confidence(full_text, main_category)
        }
    
    def _calculate_confidence(self, text: str, category: str) -> float:
        """분류 신뢰도를 계산합니다."""
        if category == "기타":
            return 0.1
        
        keywords = self.category_keywords.get(category, [])
        if not keywords:
            return 0.1
        
        matches = 0
        for keyword in keywords:
            if keyword.lower() in text:
                matches += 1
        
        return min(matches / len(keywords), 1.0)
    
    def get_all_categories(self) -> List[str]:
        """사용 가능한 모든 카테고리를 반환합니다."""
        return list(self.category_keywords.keys())
    
    def get_subcategories(self, category: str) -> List[str]:
        """특정 카테고리의 하위 카테고리를 반환합니다."""
        if category in self.subcategory_keywords:
            return list(self.subcategory_keywords[category].keys())
        return []
    
    def suggest_categories(self, text: str) -> List[Tuple[str, float]]:
        """텍스트에 대한 카테고리 추천을 반환합니다."""
        suggestions = []
        for category, keywords in self.category_keywords.items():
            score = 0
            for keyword in keywords:
                if keyword.lower() in text.lower():
                    score += 1
            
            if score > 0:
                confidence = min(score / len(keywords), 1.0)
                suggestions.append((category, confidence))
        
        # 신뢰도 순으로 정렬
        suggestions.sort(key=lambda x: x[1], reverse=True)
        return suggestions[:3]  # 상위 3개만 반환

# 전역 인스턴스
ai_classifier = AIClassifier()

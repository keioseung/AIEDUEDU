// AI Info Types
export interface TermItem {
  term: string
  description: string
}

export interface AIInfoItem {
  id?: number | string
  date?: string
  
  // 기존 속성 (호환성 유지)
  title: string
  content: string
  terms?: TermItem[]
  
  // 다국어 제목
  title_ko?: string
  title_en?: string
  title_ja?: string
  title_zh?: string
  
  // 다국어 내용
  content_ko?: string
  content_en?: string
  content_ja?: string
  content_zh?: string
  
  // 다국어 용어
  terms_ko?: TermItem[]
  terms_en?: TermItem[]
  terms_ja?: TermItem[]
  terms_zh?: TermItem[]
  
  category?: string
  subcategory?: string
  confidence?: number
}

export interface AIInfoCreate {
  date: string
  infos: AIInfoItem[]
}

// Quiz Types
export interface Quiz {
  id: number
  topic: string
  
  // 다국어 지원 - 문제
  question_ko: string
  question_en?: string
  question_ja?: string
  question_zh?: string
  
  // 다국어 지원 - 선택지 1
  option1_ko: string
  option1_en?: string
  option1_ja?: string
  option1_zh?: string
  
  // 다국어 지원 - 선택지 2
  option2_ko: string
  option2_en?: string
  option2_ja?: string
  option2_zh?: string
  
  // 다국어 지원 - 선택지 3
  option3_ko: string
  option3_en?: string
  option3_ja?: string
  option3_zh?: string
  
  // 다국어 지원 - 선택지 4
  option4_ko: string
  option4_en?: string
  option4_ja?: string
  option4_zh?: string
  
  // 다국어 지원 - 설명
  explanation_ko: string
  explanation_en?: string
  explanation_ja?: string
  explanation_zh?: string
  
  correct: number
  created_at: string
  
  // 기존 단일 언어 필드들 (하위 호환성을 위해 유지)
  question?: string
  option1?: string
  option2?: string
  option3?: string
  option4?: string
  explanation?: string
}

export interface QuizCreate {
  topic: string
  
  // 다국어 지원 - 문제
  question_ko: string
  question_en?: string
  question_ja?: string
  question_zh?: string
  
  // 다국어 지원 - 선택지 1
  option1_ko: string
  option1_en?: string
  option1_ja?: string
  option1_zh?: string
  
  // 다국어 지원 - 선택지 2
  option2_ko: string
  option2_en?: string
  option2_ja?: string
  option2_zh?: string
  
  // 다국어 지원 - 선택지 3
  option3_ko: string
  option3_en?: string
  option3_ja?: string
  option3_zh?: string
  
  // 다국어 지원 - 선택지 4
  option4_ko: string
  option4_en?: string
  option4_ja?: string
  option4_zh?: string
  
  // 다국어 지원 - 설명
  explanation_ko: string
  explanation_en?: string
  explanation_ja?: string
  explanation_zh?: string
  
  correct: number
  
  // 기존 단일 언어 필드들 (하위 호환성을 위해 유지)
  question?: string
  option1?: string
  option2?: string
  option3?: string
  option4?: string
  explanation?: string
}

// User Progress Types
export interface UserProgress {
  [date: string]: number[];
  // terms_by_date, quiz_score_by_date 등은 별도 타입(UserProgressExtra)으로 확장해 사용하세요.
}

// UserProgress의 확장 속성 타입 예시
export interface UserProgressExtra {
  terms_by_date?: { [date: string]: any[] };
  quiz_score_by_date?: { [date: string]: any[] };
}

export interface UserStats {
  total_learned: number
  streak_days: number
  last_learned_date: string | null
  quiz_score: number
  achievements: string[]
  today_ai_info?: number
  today_terms?: number
  today_quiz_score?: number
  today_quiz_correct?: number
  today_quiz_total?: number
  total_terms_learned?: number
  total_terms_available?: number
  total_ai_info_available?: number
  cumulative_quiz_score?: number
  cumulative_quiz_correct?: number
  cumulative_quiz_total?: number
  total_quiz_correct?: number
  total_quiz_questions?: number
  max_streak?: number
}

// Prompt Types
export interface Prompt {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

export interface PromptCreate {
  title: string
  content: string
  category: string
}

// Base Content Types
export interface BaseContent {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

export interface BaseContentCreate {
  title: string
  content: string
  category: string
}

// Achievement Types
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

// News Types
export interface NewsItem {
  title: string
  content: string
  link: string
}

export interface User {
  username: string
  password: string
  role: 'admin' | 'user'
} 
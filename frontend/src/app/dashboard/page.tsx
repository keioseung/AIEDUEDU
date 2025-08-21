"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaArrowRight, FaGlobe, FaCode, FaBrain, FaRocket, FaChartLine, FaTrophy, FaLightbulb, FaUsers, FaBookOpen, FaCalendar, FaClipboard, FaBullseye, FaFire, FaStar, FaCrosshairs, FaChartBar, FaSignOutAlt } from 'react-icons/fa'
import { TrendingUp, Calendar, Trophy, Sun, Target, BarChart3, BookOpen } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import AIInfoCard from '@/components/ai-info-card'
import AIInfoListMode from '@/components/ai-info-list-mode'
import AIInfoCategoryView from '@/components/ai-info-category-view'
import TermsQuizSection from '@/components/terms-quiz-section'
import ProgressSection from '@/components/progress-section'
import LearnedTermsSection from '@/components/learned-terms-section'
import LanguageSelector from '@/components/language-selector'
import useAIInfo from '@/hooks/use-ai-info'
import useUserProgress, { useUserStats } from '@/hooks/use-user-progress'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/api'

import { useQueryClient } from '@tanstack/react-query'
import { userProgressAPI } from '@/lib/api'
import { t, getCurrentLanguage, Language } from '@/lib/i18n'
import { AIInfoItem } from '@/types'

// 예시 용어 데이터
const TERMS = [
  { term: '딥러닝', desc: '인공신경망을 기반으로 한 기계학습의 한 분야로, 대량의 데이터에서 패턴을 학습합니다.' },
  { term: '과적합', desc: '모델이 학습 데이터에 너무 맞춰져서 새로운 데이터에 일반화가 잘 안 되는 현상.' },
  { term: '정규화', desc: '데이터의 범위를 일정하게 맞추거나, 모델의 복잡도를 제한하는 기법.' },
  { term: '파라미터', desc: '모델이 학습을 통해 조정하는 값(가중치 등).' },
  { term: '하이퍼파라미터', desc: '학습 전에 사람이 직접 설정하는 값(학습률, 배치 크기 등).' },
  { term: '배치', desc: '한 번에 모델에 입력되는 데이터 묶음.' },
  { term: '드롭아웃', desc: '신경망 학습 시 일부 뉴런을 임의로 꺼서 과적합을 방지하는 기법.' },
  { term: '활성화 함수', desc: '신경망에서 입력 신호를 출력 신호로 변환하는 함수.' },
  { term: '임베딩', desc: '고차원 데이터를 저차원 벡터로 변환하는 표현 방법.' },
  { term: '컨볼루션', desc: '합성곱 신경망(CNN)에서 특징을 추출하는 연산.' },
]

// 1. 주간 학습 현황 막대 그래프 컴포넌트 추가 (탭 위에)
function WeeklyBarGraph({ weeklyData }: { weeklyData: any[] }) {
  const maxAI = 3;
  const maxTerms = 20;
  const maxQuiz = 100;
  return (
    <div className="w-full max-w-3xl mx-auto mb-8 safe-area-padding">
      <div className="flex justify-between mb-2 px-2">
        {weeklyData.map((day, idx) => (
          <div key={idx} className={`text-xs font-bold text-center touch-optimized ${day.isToday ? 'text-yellow-400' : 'text-white/60'}`}>{day.day}</div>
        ))}
      </div>
      <div className="flex gap-2 h-32 items-end">
        {weeklyData.map((day, idx) => {
          const aiHeight = Math.round((day.ai / maxAI) * 80);
          const termsHeight = Math.round((day.terms / maxTerms) * 80);
          const quizHeight = Math.round((day.quiz / maxQuiz) * 80);
          return (
            <div key={idx} className="flex-1 flex flex-col items-center">
              <div className="flex flex-col-reverse h-28 w-6 relative">
                {/* 퀴즈 */}
                <div style={{ height: `${quizHeight}px` }} className="w-full bg-gradient-to-t from-green-500 to-emerald-400 rounded-t-md" />
                {/* 용어 */}
                <div style={{ height: `${termsHeight}px` }} className="w-full bg-gradient-to-t from-purple-500 to-pink-400" />
                {/* AI 정보 */}
                <div style={{ height: `${aiHeight}px` }} className="w-full bg-gradient-to-t from-blue-500 to-cyan-400 rounded-b-md" />
                {day.isToday && <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-xs text-yellow-400 font-bold">{t('dashboard.today')}</div>}
              </div>
              <div className="mt-1 text-xs text-white/70">{day.ai + day.terms + Math.round(day.quiz/10)}</div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 px-2 text-[10px] text-white/40">
        <div>{t('dashboard.ai')}</div><div>{t('dashboard.terms')}</div><div>{t('dashboard.quiz')}</div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('sessionId')
      if (!id) {
        id = Math.random().toString(36).substring(2, 15)
        localStorage.setItem('sessionId', id)
      }
      return id
    }
    return 'default'
  })
  const [currentLanguage, setCurrentLanguage] = useState<'ko' | 'en' | 'ja' | 'zh'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('selectedLanguage') as 'ko' | 'en' | 'ja' | 'zh') || 'ko'
    }
    return 'ko'
  })
  
  const { data: aiInfo, isLoading: aiInfoLoading } = useAIInfo(selectedDate)
  
  // AI 정보 데이터 디버깅
  useEffect(() => {
    if (aiInfo) {
      console.log('=== AI Info Data Debug ===')
      console.log('Selected Date:', selectedDate)
      console.log('AI Info Data:', aiInfo)
      console.log('AI Info Length:', aiInfo.length)
      
      if (aiInfo.length > 0) {
        aiInfo.forEach((info, index) => {
          console.log(`Info ${index + 1}:`)
          console.log(`  Title KO: ${info.title_ko}`)
          console.log(`  Title EN: ${info.title_en}`)
          console.log(`  Title JA: ${info.title_ja}`)
          console.log(`  Title ZH: ${info.title_zh}`)
          console.log(`  Content KO: ${info.content_ko?.substring(0, 50)}...`)
          console.log(`  Content EN: ${info.content_en?.substring(0, 50) || 'None'}...`)
          console.log(`  Content JA: ${info.content_ja?.substring(0, 50) || 'None'}...`)
          console.log(`  Content ZH: ${info.content_zh?.substring(0, 50) || 'None'}...`)
          console.log(`  Terms KO count: ${info.terms_ko?.length || 0}`)
          console.log(`  Terms EN count: ${info.terms_en?.length || 0}`)
          console.log(`  Terms JA count: ${info.terms_ja?.length || 0}`)
          console.log(`  Terms ZH count: ${info.terms_zh?.length || 0}`)
        })
      }
      console.log('========================')
    }
  }, [aiInfo, selectedDate])

  // 언어 변경 이벤트 감지
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = localStorage.getItem('language') as 'ko' | 'en' | 'ja' | 'zh' || 'ko'
      setCurrentLanguage(newLanguage)
    }

    // 초기 언어 설정
    handleLanguageChange()

    // 언어 변경 이벤트 리스너 등록
    window.addEventListener('languageChange', handleLanguageChange)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
    }
  }, [])
  const { data: userProgress, isLoading: progressLoading, refetch: refetchUserProgress } = useUserProgress(sessionId)
  const { data: userStats, refetch: refetchUserStats } = useUserStats(sessionId)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'ai' | 'quiz' | 'progress' | 'term'>('ai')
  const [aiInfoMode, setAiInfoMode] = useState<'date' | 'category' | 'list'>('date')
  const [randomTerm, setRandomTerm] = useState(() => TERMS[Math.floor(Math.random() * TERMS.length)])
  
  // 타이핑 애니메이션 상태
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const fullText = "AI Mastery Hub"
  
  // 환영 메시지 애니메이션
  const [currentWelcome, setCurrentWelcome] = useState(0)
  const welcomeMessages = [
    t('dashboard.welcome.message.1'),
    t('dashboard.welcome.message.2'),
    t('dashboard.welcome.message.3')
  ]

  const handleRandomTerm = () => {
    setRandomTerm(TERMS[Math.floor(Math.random() * TERMS.length)])
  }

  // 타이핑 애니메이션
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 150)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [currentIndex, fullText])

  // 환영 메시지 순환
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWelcome((prev) => (prev + 1) % welcomeMessages.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [welcomeMessages.length])

  // selectedDate가 변경될 때 데이터 리페치
  useEffect(() => {
    refetchUserProgress()
    refetchUserStats()
  }, [selectedDate, refetchUserProgress, refetchUserStats])

  // 언어 변경 감지
  useEffect(() => {
    const handleLanguageChange = () => {
      // 언어가 변경되면 컴포넌트를 다시 렌더링
      setForceUpdate(prev => prev + 1)
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [])

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (!userStr) {
      router.replace('/auth')
      return
    }
    const user = JSON.parse(userStr)
    if (user.role !== 'user') {
      router.replace('/admin')
    }
  }, [router])

  // AI 정보 데이터 안전 접근
  const safeAIInfo = aiInfo || []
  
  // 학습 진행률 계산 (로컬 스토리지와 백엔드 데이터 통합)
  const totalAIInfo = safeAIInfo.length
  
  // 로컬 스토리지에서 학습 상태 확인 (강제 업데이트 포함)
  const localProgress = (() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('userProgress')
        if (stored) {
          const parsed = JSON.parse(stored)
          const userData = parsed[sessionId]
          if (userData) {
            // selectedDate가 있는 경우 해당 날짜의 데이터 반환
            if (selectedDate && userData[selectedDate]) {
              console.log(`대시보드 - ${selectedDate} 날짜의 로컬 AI 정보:`, userData[selectedDate])
              return userData[selectedDate]
            }
            // selectedDate가 없으면 오늘 날짜의 데이터 반환
            const today = new Date().toISOString().split('T')[0]
            return userData[today] || []
          }
        }
      } catch (error) {
        console.error('Failed to parse local progress:', error)
      }
    }
    return []
  })()
  
  // 백엔드 데이터와 로컬 데이터 통합
  const backendProgress = userProgress?.[selectedDate] || []
  const learnedAIInfo = Math.max(localProgress.length, backendProgress.length)
  const aiInfoProgress = totalAIInfo > 0 ? (learnedAIInfo / totalAIInfo) * 100 : 0
  
  // 디버깅: 진행율 계산 확인
  console.log('대시보드 진행율 계산:', {
    selectedDate,
    totalAIInfo,
    localProgress: localProgress.length,
    backendProgress: backendProgress.length,
    learnedAIInfo,
    aiInfoProgress
  })

  // 실제 학습한 용어 개수 계산 - 백엔드 데이터와 로컬 데이터 통합
  const totalTerms = 60 // 3개 AI 정보 × 20개 용어씩
  const learnedTermsFromBackend = Array.isArray(userProgress?.total_terms_learned) ? userProgress.total_terms_learned.length : (userProgress?.total_terms_learned ?? 0)
  
  // 로컬 스토리지에서 학습한 용어 개수 계산
  const localTermsCount = (() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('userProgress')
        if (stored) {
          const parsed = JSON.parse(stored)
          const userData = parsed[sessionId]
          if (userData && userData.terms_by_date) {
            // selectedDate가 있는 경우 해당 날짜의 용어 개수 반환
            if (selectedDate && userData.terms_by_date[selectedDate]) {
              console.log(`대시보드 - ${selectedDate} 날짜의 로컬 용어:`, userData.terms_by_date[selectedDate])
              return userData.terms_by_date[selectedDate].length
            }
            // selectedDate가 없으면 오늘 날짜의 용어 개수 반환
            const today = new Date().toISOString().split('T')[0]
            return userData.terms_by_date[today]?.length || 0
          }
        }
      } catch (error) {
        console.error('Failed to parse local terms:', error)
      }
    }
    return 0
  })()
  
  // 백엔드와 로컬 데이터 중 더 큰 값 사용
  const learnedTermsCount = Math.max(learnedTermsFromBackend, localTermsCount)
  const termsProgress = totalTerms > 0 ? (learnedTermsCount / totalTerms) * 100 : 0
  
  // 디버깅: 용어 진행율 계산 확인
  console.log('대시보드 용어 진행율 계산:', {
    selectedDate,
    totalTerms,
    learnedTermsFromBackend,
    localTermsCount,
    learnedTermsCount,
    termsProgress
  })

  // 퀴즈 점수 계산 - 당일 푼 전체 문제수가 분모, 정답 맞춘 총 개수가 분자
  const quizScore = (() => {
    if (typeof userProgress?.quiz_score === 'number') {
      return Math.min(userProgress.quiz_score, 100)
    }
    if (Array.isArray(userProgress?.quiz_score)) {
      const totalQuestions = userProgress.quiz_score.length
      const correctAnswers = userProgress.quiz_score.filter(score => score > 0).length
      return totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0
    }
    return 0
  })()
  const maxQuizScore = 100
  const quizProgress = (quizScore / maxQuizScore) * 100

  const streakDays = Array.isArray(userProgress?.streak_days) ? userProgress.streak_days.length : (userProgress?.streak_days ?? 0)
  const maxStreak = Array.isArray(userProgress?.max_streak) ? userProgress.max_streak.length : (userProgress?.max_streak ?? 0)
  const streakProgress = maxStreak > 0 ? (streakDays / maxStreak) * 100 : 0

  // 오늘 날짜 확인
  const today = new Date()
  const todayDay = today.getDay() // 0: 일요일, 1: 월요일, ..., 6: 토요일

  // 주간 학습 데이터 - 실제 사용자 데이터 기반 (월~일 7일 모두)
  const getWeeklyDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0: 일, 1: 월, ...
    // 이번주 월요일 구하기
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
    // 7일치 날짜 배열 생성
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };
  const weeklyDates = getWeeklyDates();
  const weeklyData = weeklyDates.map((dateObj, idx) => {
    const dateStr = dateObj.toISOString().split('T')[0];
    // AI 정보, 용어, 퀴즈 데이터 추출 (userProgress 기준)
    const ai = Array.isArray(userProgress?.[dateStr]) ? userProgress[dateStr].length : 0;
    const termsArr =
      userProgress &&
      typeof userProgress.terms_by_date === 'object' &&
      userProgress.terms_by_date !== null &&
      !Array.isArray(userProgress.terms_by_date) &&
      Object.prototype.hasOwnProperty.call(userProgress.terms_by_date, dateStr)
        ? (userProgress.terms_by_date as Record<string, any[]>)[dateStr]
        : undefined;
    const terms = Array.isArray(termsArr) ? termsArr.length : 0;
    let quiz = 0;
    const quizScoreArr =
      userProgress &&
      typeof userProgress.quiz_score_by_date === 'object' &&
      userProgress.quiz_score_by_date !== null &&
      !Array.isArray(userProgress.quiz_score_by_date) &&
      Object.prototype.hasOwnProperty.call(userProgress.quiz_score_by_date, dateStr)
        ? (userProgress.quiz_score_by_date as Record<string, any[]>)[dateStr]
        : undefined;
    if (Array.isArray(quizScoreArr)) {
      const totalQuestions = quizScoreArr.length;
      const correctAnswers = quizScoreArr.filter((score: number) => score > 0).length;
      quiz = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    } else if (typeof quizScoreArr === 'number') {
      quiz = quizScoreArr;
    }
    // 오늘 여부
    const isToday = dateStr === selectedDate;
    // 요일명
    const days = [
      t('common.day.mon'),
      t('common.day.tue'),
      t('common.day.wed'),
      t('common.day.thu'),
      t('common.day.fri'),
      t('common.day.sat'),
      t('common.day.sun')
    ];
    return {
      day: days[idx],
      ai,
      terms,
      quiz,
      isToday,
    };
  });

  // 오늘 학습 데이터 반영
  const todayIndex = todayDay === 0 ? 6 : todayDay - 1 // 일요일은 인덱스 6
  weeklyData[todayIndex].ai = learnedAIInfo
      weeklyData[todayIndex].terms = learnedTermsCount
  weeklyData[todayIndex].quiz = Math.min(quizScore, 100) // 퀴즈 점수는 최대 100점

  // AI 정보 3개만 정확히 보여줌
  const aiInfoFixed = safeAIInfo && safeAIInfo.length > 0 ? safeAIInfo.slice(0, 3) : []

  const [forceUpdate, setForceUpdate] = useState(0)
  
  // 진행률 업데이트 핸들러
  const handleProgressUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['user-progress', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    queryClient.invalidateQueries({ queryKey: ['learned-terms', sessionId] })
    setForceUpdate(prev => prev + 1) // 강제 리렌더링
  }

  // 새로고침 핸들러(탭별)
  const handleRefresh = () => window.location.reload()

  // 토스트 알림 상태
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 2500)
  }

  // 언어 변경 핸들러
  const handleLanguageChange = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    setCurrentLanguage(language)
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedLanguage', language)
    }
  }

  // 진행율 계산 함수들
  const calculateProgress = (aiInfos: AIInfoItem[]) => {
    if (!aiInfos || aiInfos.length === 0) return 0
    
    let totalItems = 0
    let completedItems = 0
    
    aiInfos.forEach(info => {
      // 안전한 용어 접근
      const terms = info.terms || info.terms_ko || []
      if (Array.isArray(terms)) {
        totalItems += terms.length
        terms.forEach(term => {
          // 단순히 용어가 존재하는지만 확인 (실제로는 더 정교한 로직이 필요할 수 있음)
          completedItems++
        })
      }
    })
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }

  const calculateTermsProgress = (aiInfos: AIInfoItem[]) => {
    if (!aiInfos || aiInfos.length === 0) return 0
    
    let totalTerms = 0
    let learnedTermsCount = 0
    
    aiInfos.forEach(info => {
      // 안전한 용어 접근
      const terms = info.terms || info.terms_ko || []
      if (Array.isArray(terms)) {
        totalTerms += terms.length
        terms.forEach(term => {
          // 단순히 용어가 존재하는지만 확인 (실제로는 더 정교한 로직이 필요할 수 있음)
          learnedTermsCount++
        })
      }
    })
    
    return totalTerms > 0 ? Math.round((learnedTermsCount / totalTerms) * 100) : 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden px-4 safe-area-padding navigation-safe">
      {/* 고급스러운 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,255,0.15),transparent_50%)]" />
      
      {/* 움직이는 파티클 효과 - 완전 제거 */}
      {/* <div className="absolute inset-0 overflow-hidden">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div> */}

      {/* 토스트 알림 */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-8 left-1/2 z-50 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl text-white font-bold text-lg glass"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 헤더 섹션 */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-6 md:pt-8 pb-4">
        {/* 상단 로그아웃 버튼 */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4">
          <button
            onClick={logout}
            className="w-8 h-8 md:w-10 md:h-10 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 hover:scale-110 active:scale-95 flex items-center justify-center"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* 언어 선택기 - 우측 상단 */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4">
          <div className="flex flex-col items-end gap-2">
            <LanguageSelector />
            <div className="text-xs text-white/60 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm">
              {currentLanguage === 'ko' && '🇰🇷 한국어'}
              {currentLanguage === 'en' && '🇺🇸 English'}
              {currentLanguage === 'ja' && '🇯🇵 日本語'}
              {currentLanguage === 'zh' && '🇨🇳 中文'}
            </div>
          </div>
        </div>

        {/* 상단 아이콘과 제목 */}
        <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 mb-4 md:mb-6 text-center md:text-left">
          <div className="relative">
            <span className="text-4xl md:text-5xl text-purple-400 drop-shadow-2xl animate-bounce-slow">
              <FaRobot />
            </span>
            <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full animate-pulse" />
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight">
              {typedText}
              {isTyping && <span className="animate-blink">|</span>}
            </h1>
            <div className="h-4 md:h-6 mt-1">
              <p className="text-base md:text-lg lg:text-xl text-purple-300 font-medium">
                <span 
                  key={currentWelcome}
                  className="inline-block animate-tagline-fade"
                >
                  {welcomeMessages[currentWelcome]}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 날짜 선택기 제거 - 모든 탭에서 탭바 위에 표시하지 않음 */}

      {/* 세련된 고급스러운 탭 메뉴 */}
      <div className="flex justify-center mb-4 md:mb-6">
        <div className="w-full max-w-4xl md:max-w-5xl">
          <div className="grid grid-cols-4 bg-gradient-to-br from-purple-900/40 via-purple-800/50 to-purple-900/40 backdrop-blur-2xl rounded-2xl p-1.5 md:p-2 shadow-2xl border-2 border-purple-500/50 overflow-hidden shadow-purple-900/40">
            {[
              { 
                id: 'ai', 
                label: t('nav.ai.info'), 
                gradient: 'from-blue-600 via-purple-600 to-indigo-600',
                hoverGradient: 'from-blue-500 via-purple-500 to-indigo-500',
                description: t('dashboard.tab.ai.description')
              },
              { 
                id: 'quiz', 
                label: t('nav.quiz'), 
                gradient: 'from-purple-600 via-pink-600 to-rose-600',
                hoverGradient: 'from-purple-500 via-pink-500 to-rose-500',
                description: t('dashboard.tab.quiz.description')
              },
              { 
                id: 'progress', 
                label: t('nav.progress'), 
                gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
                hoverGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
                description: t('dashboard.tab.progress.description')
              },
              { 
                id: 'term', 
                label: t('nav.terms'), 
                gradient: 'from-amber-600 via-orange-600 to-red-600',
                hoverGradient: 'from-amber-500 via-orange-500 to-red-500',
                description: t('dashboard.tab.terms.description')
              }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`group relative px-3 md:px-6 py-2.5 md:py-3 rounded-xl font-bold text-sm md:text-base transition-all duration-300 overflow-hidden ${
                  activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-xl transform scale-105 ring-1 ring-white/30` 
                    : 'text-white/80 hover:text-white hover:bg-white/10 active:scale-95'
                }`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {/* 활성 탭 배경 효과 */}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                )}
                
                {/* 호버 효과 */}
                {activeTab !== tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${tab.hoverGradient}"></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center gap-1">
                  {/* 라벨만 표시 */}
                  <span className="font-bold tracking-wide drop-shadow-sm text-sm md:text-base">{tab.label}</span>
                  
                  {/* 설명 (데스크톱에서만 표시) */}
                  <span className="hidden lg:block text-xs opacity-80 font-medium tracking-wide">
                    {tab.description}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <main className="flex-1 py-2 md:py-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="max-w-4xl mx-auto"
        >
          {/* 탭별 컨텐츠 */}
          {activeTab === 'ai' && (
            <section className="mb-8 md:mb-16">
              {/* AI 정보 모드 선택 */}
              <div className="flex justify-center mb-6">
                <div className="glass backdrop-blur-xl rounded-2xl p-1.5 shadow-xl border border-white/10">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setAiInfoMode('date')}
                      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                        aiInfoMode === 'date'
                          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 hover:text-white/90'
                      }`}
                    >
                      📅 {t('ai.info.mode.date')}
                    </button>
                    <button
                      onClick={() => setAiInfoMode('category')}
                      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                        aiInfoMode === 'category'
                          ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 hover:text-white/90'
                      }`}
                    >
                      🏷️ {t('ai.info.mode.category')}
                    </button>
                    <button
                      onClick={() => setAiInfoMode('list')}
                      className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                        aiInfoMode === 'list'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 hover:text-white/90'
                      }`}
                    >
                      📚 {t('ai.info.mode.full')}
                    </button>
                  </div>
                </div>
              </div>

              {/* 날짜별 모드 */}
              {aiInfoMode === 'date' && (
                <div>
                  {/* 세련된 날짜 선택기 */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-r from-purple-900/60 via-purple-800/70 to-purple-900/60 backdrop-blur-xl rounded-xl p-1.5 shadow-lg border border-purple-500/30">
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <FaCalendar className="w-4 h-4 text-purple-300 flex-shrink-0" />
                        <input 
                          type="date" 
                          value={selectedDate} 
                          onChange={e => setSelectedDate(e.target.value)} 
                          className="px-2 py-1.5 bg-white/10 border border-purple-400/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400 text-xs font-medium shadow-sm transition-all duration-200 hover:bg-white/15 focus:bg-white/20" 
                          style={{ minWidth: 110 }} 
                        />
                        <div className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white font-semibold text-xs shadow-sm border border-purple-400/30">
                          {selectedDate === new Date().toISOString().split('T')[0] ? t('date.calculator.today') : new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* AI 정보 카드들 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    {aiInfoFixed.length === 0 && (
                      <div className="glass backdrop-blur-xl rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center text-center text-white/70 shadow-xl min-h-[180px] border border-white/10">
                        <FaBookOpen className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-60" />
                        <span className="text-base md:text-lg font-semibold">AI 정보가 없습니다</span>
                      </div>
                    )}
                    {aiInfoFixed.map((info, index) => {
                      // 로컬 스토리지와 백엔드 데이터를 모두 확인하여 학습 상태 결정
                      const isLearnedLocally = localProgress.includes(index)
                      const isLearnedBackend = backendProgress.includes(index)
                      const isLearned = isLearnedLocally || isLearnedBackend
                      
                      return (
                        <AIInfoCard
                          key={index}
                          info={info}
                          index={index}
                          date={selectedDate}
                          sessionId={sessionId}
                          isLearned={isLearned}
                          onProgressUpdate={handleProgressUpdate}
                          forceUpdate={forceUpdate}
                          setForceUpdate={setForceUpdate}
                          currentLanguage={currentLanguage}
                        />
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 카테고리별 모드 */}
              {aiInfoMode === 'category' && (
                <AIInfoCategoryView
                  sessionId={sessionId}
                  onProgressUpdate={handleProgressUpdate}
                />
              )}

              {/* 목록 모드 */}
              {aiInfoMode === 'list' && (
                <AIInfoListMode
                  sessionId={sessionId}
                  onProgressUpdate={handleProgressUpdate}
                />
              )}
            </section>
          )}

          {activeTab === 'quiz' && (
            <section className="mb-8 md:mb-16">
              <TermsQuizSection 
                sessionId={sessionId} 
                selectedDate={selectedDate} 
                onProgressUpdate={handleProgressUpdate}
                onDateChange={setSelectedDate}
              />
            </section>
          )}
          {activeTab === 'progress' && (
            <section className="mb-8 md:mb-16">
              <ProgressSection 
                sessionId={sessionId} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                key={`progress-${selectedDate}`} // selectedDate가 변경될 때 컴포넌트 재마운트
              />
            </section>
          )}

          {activeTab === 'term' && (
            <section className="mb-8 md:mb-16">
              <LearnedTermsSection 
                sessionId={sessionId} 
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
              />
            </section>
          )}
        </motion.div>
      </main>

      {/* 커스텀 애니메이션 스타일 */}
      <style jsx global>{`
        /* 배경 애니메이션 관련 스타일 제거 - 깜박거림 현상 해결 */
        /* @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        } */
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 1.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes tagline-fade {
          0% { opacity: 0; transform: translateY(10px); }
          20% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(10px); }
        }
        .animate-tagline-fade {
          animation: tagline-fade 4s infinite;
        }
      `}</style>
    </div>
  )
} 
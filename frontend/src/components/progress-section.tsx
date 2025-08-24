'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, BookOpen, Target, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUserStats } from '@/hooks/use-user-progress'
import { userProgressAPI, aiInfoAPI } from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { t, getCurrentLanguage } from '@/lib/i18n'

interface ProgressSectionProps {
  sessionId: string
  selectedDate?: string
  onDateChange?: (date: string) => void
}

interface PeriodData {
  date: string
  ai_info: number
  terms: number
  quiz_score: number
  quiz_correct: number
  quiz_total: number
}

interface PeriodStats {
  period_data: PeriodData[]
  start_date: string
  end_date: string
  total_days: number
}

function ProgressSection({ sessionId, selectedDate, onDateChange }: ProgressSectionProps) {
  // 외부에서 전달받은 selectedDate를 직접 사용
  const [periodType, setPeriodType] = useState<'week' | 'month' | 'custom'>('week')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [viewMode, setViewMode] = useState<'cards' | 'graph'>('cards')
  const [localLanguage, setLocalLanguage] = useState(getCurrentLanguage())

  const { data: stats } = useUserStats(sessionId)
  const queryClient = useQueryClient()
  
  // userModified 상태를 우선시하는 헬퍼 함수
  const getActualLearningStatus = (date: string, infoIndex: number): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      // userModified 키 확인 (사용자가 명시적으로 변경한 상태)
      const userModifiedKey = `userModified_${sessionId}_${date}_${infoIndex}`
      const userModified = localStorage.getItem(userModifiedKey)
      
      if (userModified !== null) {
        // 사용자가 명시적으로 변경한 상태가 있으면 그것을 우선시
        return JSON.parse(userModified)
      }
      
      // userModified가 없으면 userProgress에서 확인
      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}')
      const sessionProgress = userProgress[sessionId]
      if (sessionProgress && sessionProgress[date]) {
        return sessionProgress[date].includes(infoIndex)
      }
      
      return false
    } catch (error) {
      console.error('학습 상태 확인 오류:', error)
      return false
    }
  }
  
  // 특정 날짜의 실제 학습완료된 AI 정보 카드 수 계산
  const getActualLearnedCount = (date: string): number => {
    if (typeof window === 'undefined') return 0
    
    let count = 0
    // 각 날짜당 2개 카드 (0번, 1번)
    for (let infoIndex = 0; infoIndex < 2; infoIndex++) {
      if (getActualLearningStatus(date, infoIndex)) {
        count++
      }
    }
    return count
  }
  
  // 전체 실제 학습완료된 AI 정보 카드 수 계산
  const getTotalActualLearnedCount = (): number => {
    if (typeof window === 'undefined') return 0
    
    let totalCount = 0
    if (aiInfoDates) {
      aiInfoDates.forEach((date: string) => {
        totalCount += getActualLearnedCount(date)
      })
    }
    return totalCount
  }

  // 언어 변경 감지 및 즉시 반영
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = getCurrentLanguage()
      console.log('언어 변경 감지:', newLanguage)
      setLocalLanguage(newLanguage)
    }

    const handleForceUpdate = (event: CustomEvent) => {
      if (event.detail?.language) {
        console.log('강제 업데이트 언어 변경:', event.detail.language)
        setLocalLanguage(event.detail.language)
      }
    }

    const handleLanguageChanged = (event: CustomEvent) => {
      if (event.detail?.language) {
        console.log('언어 변경 이벤트:', event.detail.language)
        setLocalLanguage(event.detail.language)
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('forceUpdate', handleLanguageChanged as EventListener)
    window.addEventListener('languageChanged', handleLanguageChanged as EventListener)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('forceUpdate', handleLanguageChanged as EventListener)
      window.removeEventListener('languageChanged', handleLanguageChanged as EventListener)
    }
  }, [])

  // localLanguage 값 디버깅
  useEffect(() => {
    console.log('현재 localLanguage:', localLanguage)
  }, [localLanguage])

  // 선택된 날짜의 AI 정보 데이터 가져오기
  const { data: aiInfoData } = useQuery({
    queryKey: ['ai-info', selectedDate || new Date().toISOString().split('T')[0]],
    queryFn: async () => {
      const date = selectedDate || new Date().toISOString().split('T')[0]
      const response = await aiInfoAPI.getByDate(date)
      return response.data
    },
    enabled: !!selectedDate || true,
  })

  // AI 정보가 등록된 총 일 수 가져오기
  const { data: totalDaysData } = useQuery({
    queryKey: ['ai-info-total-days'],
    queryFn: async () => {
      try {
        const response = await aiInfoAPI.getTotalDays()
        return response.data
      } catch (error) {
        // API 호출 실패 시 dates/all을 사용하여 계산
        try {
          const datesResponse = await aiInfoAPI.getAllDates()
          const totalDays = datesResponse.data.length
          return { total_days: totalDays }
        } catch (datesError) {
          return { total_days: 0 }
        }
      }
    },
  })

  // 초기화 상태를 추적하는 state
  const [isReset, setIsReset] = useState(false)
  
  // AI 정보 날짜 목록을 가져와서 총 개수 계산 (각 날짜당 2개 카드)
  const { data: aiInfoDates } = useQuery({
    queryKey: ['ai-info-dates'],
    queryFn: async () => {
      try {
        const response = await aiInfoAPI.getAllDates()
        console.log('AI 정보 날짜 목록:', response.data)
        return response.data
      } catch (error) {
        console.log('AI 정보 날짜 목록 가져오기 실패:', error)
        return []
      }
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 사용자가 학습 완료한 AI 정보 카드의 총 개수 가져오기
  const { data: learnedCountData } = useQuery({
    queryKey: ['ai-info-learned-count', sessionId],
    queryFn: async () => {
      try {
        const response = await aiInfoAPI.getLearnedCount(sessionId)
        return response.data
      } catch (error) {
        console.log('학습 완료한 AI 정보 개수 가져오기 실패:', error)
        return { learned_count: 0 }
      }
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 누적 총 용어수 통계 가져오기
  const { data: totalTermsStats } = useQuery({
    queryKey: ['total-terms-stats', sessionId],
    queryFn: async () => {
      try {
        const response = await userProgressAPI.getTotalTermsStats(sessionId)
        return response.data
      } catch (error) {
        console.log('누적 총 용어수 통계 가져오기 실패:', error)
        return { total_available_terms: 0, total_learned_terms: 0, learning_progress_percentage: 0 }
      }
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 기간별 데이터 계산
  const getPeriodDates = () => {
    const today = new Date()
    const startDate = new Date()
    
    switch (periodType) {
      case 'week':
        startDate.setDate(today.getDate() - 6)
        break
      case 'month':
        startDate.setDate(today.getDate() - 29)
        break
      case 'custom':
        if (customStartDate && customEndDate) {
          return { start: customStartDate, end: customEndDate }
        }
        startDate.setDate(today.getDate() - 6)
        break
    }
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    }
  }

  const periodDates = getPeriodDates()

  // 백엔드 데이터를 완전히 무시하기 위해 periodStats 비활성화
  const { data: periodStats, isLoading: periodStatsLoading } = useQuery<PeriodStats>({
    queryKey: ['period-stats', sessionId, periodDates.start, periodDates.end],
    queryFn: async () => {
      const response = await userProgressAPI.getPeriodStats(sessionId, periodDates.start, periodDates.end)
      return response.data
    },
    enabled: false, // 백엔드 데이터 완전 비활성화 (영구 초기화를 위해)
  })



  // 동적 막대 너비 계산 - 스크롤 방지
  const getBarWidth = () => {
    const dataLength = uniqueChartData.length;
    if (dataLength <= 7) return 'w-6'; // 주간: 24px
    if (dataLength <= 14) return 'w-4'; // 2주: 16px
    if (dataLength <= 30) return 'w-2'; // 월간: 8px
    if (dataLength <= 60) return 'w-1'; // 2개월: 4px
    return 'w-1'; // 3개월 이상: 4px
  };

  const getBarGap = () => {
    const dataLength = uniqueChartData.length;
    if (dataLength <= 7) return 'gap-1'; // 주간: 4px
    if (dataLength <= 14) return 'gap-0.5'; // 2주: 2px
    if (dataLength <= 30) return 'gap-0'; // 월간: 0px
    return 'gap-0'; // 2개월 이상: 0px
  };

  const getContainerMinWidth = () => {
    const dataLength = uniqueChartData.length;
    if (dataLength <= 7) return `${dataLength * 28}px`; // 주간: 28px per bar (24px + 4px gap)
    if (dataLength <= 14) return `${dataLength * 18}px`; // 2주: 18px per bar (16px + 2px gap)
    if (dataLength <= 30) return `${dataLength * 8}px`; // 월간: 8px per bar
    if (dataLength <= 60) return `${dataLength * 4}px`; // 2개월: 4px per bar
    return `${dataLength * 4}px`; // 3개월 이상: 4px per bar
  };

  // 퍼센트 표시 방식 결정
  const shouldShowPercentage = () => {
    const dataLength = uniqueChartData.length;
    return dataLength <= 14; // 2주 이하일 때만 퍼센트 표시
  };

  // X축 범례 표시 방식 결정 (5일 단위)
  const shouldShowXAxisLabel = (index: number) => {
    const dataLength = uniqueChartData.length;
    if (dataLength <= 7) return true; // 주간: 모든 날짜 표시
    if (dataLength <= 14) return index % 2 === 0; // 2주: 2일마다 표시
    return index === 0 || index % 5 === 0 || index === dataLength - 1; // 월간: 0일 + 5일마다 + 마지막 날
  };

  // 평균 계산 함수
  const calculateAverage = (data: PeriodData[], type: 'ai_info' | 'terms' | 'quiz_score') => {
    const validData = data.filter(d => d[type] > 0);
    if (validData.length === 0) return 0;
    
    const sum = validData.reduce((acc, d) => acc + d[type], 0);
    const average = sum / validData.length;
    
    if (type === 'quiz_score') {
      return Math.round(average); // 퀴즈는 이미 % 단위
    } else {
      // AI 정보와 용어는 최대값 대비 %로 계산 (최대 100% 제한)
      const maxValue = type === 'ai_info' ? (maxAI > 0 ? maxAI : 3) : (maxTerms > 0 ? maxTerms : 60);
      return Math.min(Math.round((average / maxValue) * 100), 100);
    }
  };

  // 날짜 변경 핸들러 - 상위 컴포넌트에 알림
  const handleDateChange = (date: string) => {
    onDateChange?.(date)
  }

  // selectedDate가 변경될 때 데이터 리페치
  useEffect(() => {
    if (selectedDate) {
      // 쿼리 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['period-stats', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    }
  }, [selectedDate, sessionId, queryClient])

  // 기간 변경 핸들러
  const handlePeriodChange = (type: 'week' | 'month' | 'custom') => {
    setPeriodType(type)
    if (type === 'custom') {
      const today = new Date()
      const weekAgo = new Date()
      weekAgo.setDate(today.getDate() - 6)
      setCustomStartDate(weekAgo.toISOString().split('T')[0])
      setCustomEndDate(today.toISOString().split('T')[0])
    }
    // 기간 변경 시 즉시 쿼리 무효화하여 데이터 새로고침
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['period-stats', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['period-stats', sessionId, periodDates.start, periodDates.end] })
    }, 100)
  }

  // 커스텀 날짜 변경 핸들러
  const handleCustomStartDateChange = (date: string) => {
    setCustomStartDate(date)
  }

  const handleCustomEndDateChange = (date: string) => {
    setCustomEndDate(date)
  }

  // 그래프 데이터 준비 - 백엔드 데이터와 로컬 데이터 통합
  const chartData = periodStats?.period_data || []
  
  // 로컬 스토리지에서 AI 정보 학습 데이터 가져오기 (날짜별 모드 우선시)
  const [localAIProgress, setLocalAIProgress] = useState<PeriodData[]>([])
  
  // localAIProgress 업데이트 함수
  const updateLocalAIProgress = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('userProgress')
        if (stored) {
          const parsed = JSON.parse(stored)
          const userData = parsed[sessionId]
          if (userData) {
            const localData: PeriodData[] = []
            
            // 기간 내 모든 날짜에 대해 로컬 데이터 확인
            const startDate = new Date(periodDates.start)
            const endDate = new Date(periodDates.end)
            
            for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
              const dateStr = d.toISOString().split('T')[0]
              const localProgress = userData[dateStr] || []
              
              // userModified 상태를 우선시하여 실제 학습 상태 계산
              let aiCount = 0
              for (let infoIndex = 0; infoIndex < 2; infoIndex++) {
                if (getActualLearningStatus(dateStr, infoIndex)) {
                  aiCount++
                }
              }
              
              // userModified 상태가 true인 카드에서만 실제 학습된 용어 수 계산
              let termsCount = 0
              for (let infoIndex = 0; infoIndex < 2; infoIndex++) {
                // userModified 상태가 true인 경우만 용어 학습 상태 확인
                if (getActualLearningStatus(dateStr, infoIndex)) {
                  const key = `learnedTerms_${sessionId}_${dateStr}_${infoIndex}`
                  const stored = localStorage.getItem(key)
                  if (stored) {
                    try {
                      const learnedArray = JSON.parse(stored)
                      if (Array.isArray(learnedArray)) {
                        termsCount += learnedArray.length
                      }
                    } catch (e) {
                      console.error(`❌ ${key} 파싱 오류:`, e)
                    }
                  }
                }
              }
              
              console.log(`🔍 ${dateStr} 날짜: AI 정보 ${aiCount}개 (날짜별 모드 우선), 학습된 용어 ${termsCount}개`)
              
              localData.push({
                date: dateStr,
                ai_info: aiCount,
                terms: termsCount,
                quiz_score: 0,
                quiz_correct: 0,
                quiz_total: 0
              })
            }
            setLocalAIProgress(localData)
          }
        }
      } catch (error) {
        // 로컬 데이터 파싱 실패 시 무시
        setLocalAIProgress([])
      }
    } else {
      setLocalAIProgress([])
    }
  }, [sessionId, periodDates.start, periodDates.end])
  
  // 컴포넌트 마운트 시와 periodDates 변경 시 localAIProgress 업데이트
  useEffect(() => {
    updateLocalAIProgress()
  }, [updateLocalAIProgress])
  
  // 백엔드 데이터와 로컬 데이터 통합 (로컬 데이터 우선 - 날짜별 모드 반영)
  const [uniqueChartData, setUniqueChartData] = useState<PeriodData[]>([])
  
  // uniqueChartData 업데이트 함수 - 백엔드 데이터 완전 무시
  const updateUniqueChartData = useCallback(() => {
    // 백엔드 데이터를 완전히 무시하고 로컬 데이터만 사용
    let chartData: PeriodData[] = []
    
    // 항상 백엔드 데이터 무시 (영구 초기화를 위해)
    chartData = []
    console.log('🔧 백엔드 데이터 완전 무시 - 로컬 데이터만 사용')
    
    // 로컬 데이터만 사용하여 차트 생성
    const uniqueData = localAIProgress.sort((a: PeriodData, b: PeriodData) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    setUniqueChartData(uniqueData)
  }, [localAIProgress])
  
  // periodStats나 localAIProgress가 변경될 때 uniqueChartData 업데이트
  useEffect(() => {
    updateUniqueChartData()
  }, [updateUniqueChartData])
  
  // 실제 데이터에서 총 정보 수와 총 용어 수 계산
  const totalAIInfo = aiInfoData?.length || 0
  const totalTerms = (() => {
    if (!aiInfoData) return 0
    let total = 0
    for (const info of aiInfoData) {
      if (info.terms && Array.isArray(info.terms)) {
        total += info.terms.length
      }
    }
    return total
  })()
  
  // 최대값을 실제 데이터로 설정
  const maxAI = totalAIInfo;
  const maxTerms = totalTerms;
  const maxQuiz = 100;
  
  // 오늘 날짜의 최대 용어 수 (AI정보 카드당 20개씩)
  const todayMaxTerms = totalTerms || 40; // 기본값 40 (2개 카드 × 20개 용어)

  // 날짜 포맷 함수 (컴팩트 형식)
  const formatCompactDate = (dateString: string) => {
    const date = new Date(dateString);
    const currentLang = getCurrentLanguage();
    
    if (currentLang === 'en') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${month < 10 ? '0' : ''}${month}${t('progress.date.format.month')}${day < 10 ? '0' : ''}${day}${t('progress.date.format.day')}`;
    }
  };

  // 학습 데이터 완전 영구 초기화 함수
  const resetLearningData = async () => {
    if (typeof window === 'undefined') return;
    
    try {
      console.log('🚀 학습 데이터 완전 영구 초기화 시작...');
      
      // 1. 모든 localStorage 키 완전 삭제
      const allKeys = Object.keys(localStorage);
      const keysToRemove = allKeys.filter(key => 
        key.includes(sessionId) || 
        key === 'userProgress' || 
        key === 'favoriteAIInfos'
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ localStorage 키 삭제: ${key}`);
      });
      
      // 2. userProgress 완전 초기화
      localStorage.setItem('userProgress', JSON.stringify({}));
      
      // 3. React Query 캐시 완전 삭제 (removeQueries 사용)
      console.log('🧹 React Query 캐시 완전 삭제...');
      queryClient.removeQueries({ queryKey: ['period-stats'] });
      queryClient.removeQueries({ queryKey: ['ai-info-learned-count'] });
      queryClient.removeQueries({ queryKey: ['total-terms-stats'] });
      queryClient.removeQueries({ queryKey: ['user-stats'] });
      queryClient.removeQueries({ queryKey: ['ai-info-dates'] });
      queryClient.removeQueries({ queryKey: ['ai-info'] });
      
      // 4. 백엔드 데이터 초기화 (선택사항 - 이미 없음)
      try {
        console.log('🔧 백엔드 데이터 초기화 시도...');
        const response = await userProgressAPI.resetAllProgress(sessionId);
        console.log('✅ 백엔드 데이터 초기화 성공:', response.data);
      } catch (error) {
        console.log('ℹ️ 백엔드 데이터는 이미 없음 (정상)');
      }
      
      // 5. 상태 완전 초기화
      setIsReset(true);
      setLocalAIProgress([]);
      
      // 6. uniqueChartData를 강제로 모든 날짜 0으로 설정
      if (aiInfoDates) {
        const resetData: PeriodData[] = aiInfoDates.map((date: string) => ({
          date,
          ai_info: 0,
          terms: 0,
          quiz_score: 0,
          quiz_correct: 0,
          quiz_total: 0
        }));
        setUniqueChartData(resetData);
        console.log('📊 차트 데이터 완전 초기화 완료');
      }
      
      // 7. 강제 리렌더링을 위한 상태 업데이트
      setTimeout(() => {
        window.location.reload(); // 완전한 페이지 새로고침으로 모든 상태 초기화
      }, 100);
      
      console.log('🎉 학습 데이터 완전 영구 초기화 완료!');
      alert('학습 데이터가 완전히 초기화되었습니다. 페이지가 새로고침됩니다.');
      
    } catch (error) {
      console.error('❌ 학습 데이터 초기화 오류:', error);
      alert('초기화 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-8 relative" key={localLanguage}>
      

      {/* 모드 선택 및 초기화 */}
      <div className="flex flex-col items-center gap-3 mb-3">
        {/* 모드 선택과 초기화 버튼을 한 줄에 배치 */}
        <div className="flex items-center gap-4">
          {/* 모드 선택 */}
          <div className="glass backdrop-blur-xl rounded-2xl p-1.5 shadow-xl border border-white/10">
            <div className="flex gap-1.5">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                  viewMode === 'cards'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 hover:text-white/90'
                }`}
              >
                📊 {t('progress.tab.trend.card')}
              </button>
              <button
                onClick={() => setViewMode('graph')}
                className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                  viewMode === 'graph'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 hover:text-white/90'
                }`}
              >
                📈 {t('progress.tab.trend.graph')}
              </button>
            </div>
          </div>
          
          {/* 초기화 버튼 */}
          <button
            onClick={resetLearningData}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium text-sm rounded-xl shadow-lg hover:from-red-600 hover:to-orange-600 active:from-red-700 active:to-orange-700 transition-all duration-300 transform hover:scale-105"
          >
            🔄 {t('progress.reset.learning.data')}
          </button>
        </div>
      </div>

      {/* 모드별 콘텐츠 */}
      {viewMode === 'cards' ? (
        // 학습 추이 카드 모드
        <div className="space-y-4">
          {/* AI 정보 통계 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <h3 className="text-white font-semibold text-sm">{t('progress.card.ai.info.learning')}</h3>
              </div>
              <TrendingUp className="w-3 h-3 text-blue-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">
                  {selectedDate ? `${selectedDate} ${t('progress.card.learning.count')}` : t('progress.card.today.learning.count')}
                </span>
                <span className="text-blue-400 font-bold text-base">
                  {(() => {
                    // selectedDate가 있으면 해당 날짜의 실제 학습 데이터를 표시
                    if (selectedDate) {
                      // 백엔드 데이터를 우선적으로 사용
                      if (uniqueChartData.length > 0) {
                        const selectedDateData = uniqueChartData.find(data => data.date === selectedDate)
                        if (selectedDateData && selectedDateData.ai_info > 0) {
                          return selectedDateData.ai_info
                        }
                      }
                      
                      // 백엔드 데이터가 없거나 0인 경우 실제 학습 상태 확인
                      if (typeof window !== 'undefined') {
                        return getActualLearnedCount(selectedDate)
                      }
                      
                      return 0
                    }
                    return stats?.today_ai_info || 0
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">{t('progress.card.daily.total.info')}</span>
                <span className="text-blue-400 font-bold text-sm">{totalAIInfo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">{t('progress.card.accumulated.total.learning')}</span>
                <span className="text-white font-semibold text-sm">
                  {(() => {
                    // 실제 학습완료된 AI 정보 카드 수 계산 (userModified 상태 우선시)
                    const totalLearned = getTotalActualLearnedCount()
                    
                    // 전체 등록된 AI 정보 수 (각 날짜당 2개 카드)
                    const totalCards = (aiInfoDates?.length || 0) * 2
                    const percentage = totalCards > 0 ? Math.round((totalLearned / totalCards) * 100) : 0

                    return `${totalLearned}/${totalCards} (${percentage}%)`
                  })()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 용어 학습 통계 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-purple-400" />
                <h3 className="text-white font-semibold text-sm">
                  {localLanguage === 'ko' ? '용어 학습' : 
                   localLanguage === 'en' ? 'Terms' : 
                   localLanguage === 'ja' ? '用語学習' : '术语学习'}
                </h3>
              </div>
              <TrendingUp className="w-3 h-3 text-purple-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">
                  {selectedDate ? `${selectedDate} ${t('progress.card.learning.count')}` : t('progress.card.today.learning.count')}
                </span>
                <span className="text-purple-400 font-bold text-base">
                  {(() => {
                    // selectedDate가 있으면 해당 날짜의 실제 학습 데이터를 표시
                    if (selectedDate) {
                      // selectedDate가 있을 때는 바로 실제 학습 상태 확인 (uniqueChartData 무시)
                      if (typeof window !== 'undefined') {
                        try {
                          let totalTermsLearned = 0
                          // 해당 날짜의 모든 AI 정보에 대해 용어 학습 상태 확인
                          for (let infoIndex = 0; infoIndex < 2; infoIndex++) {
                            // userModified 상태가 true인 경우만 용어 학습 상태 확인
                            if (getActualLearningStatus(selectedDate, infoIndex)) {
                              const learnedTermsKey = `learnedTerms_${sessionId}_${selectedDate}_${infoIndex}`
                              const learnedTerms = localStorage.getItem(learnedTermsKey)
                              if (learnedTerms) {
                                try {
                                  const terms = JSON.parse(learnedTerms)
                                  totalTermsLearned += terms.length
                                } catch (error) {
                                  console.error('용어 데이터 파싱 오류:', error)
                                }
                              }
                            }
                          }
                          
                          console.log(`🔍 ${selectedDate} 날짜 용어 학습 수: ${totalTermsLearned}개`)
                          return totalTermsLearned
                        } catch (error) {
                          console.error('로컬 스토리지 데이터 파싱 오류:', error)
                        }
                      }
                      
                      return 0
                    }
                    return stats?.today_terms || 0
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">{t('progress.card.terms.daily.total')}</span>
                <span className="text-purple-400 font-bold text-sm">
                  {(() => {
                    // 해당 날짜의 AI 정보 카드 수 × 20 (각 카드당 20개 용어)
                    if (selectedDate) {
                      // 해당 날짜에 등록된 AI 정보 카드 수 확인
                      const dateInfo = aiInfoDates?.find((date: string) => date === selectedDate)
                      if (dateInfo) {
                        return 2 * 20 // 각 날짜당 2개 카드, 각 카드당 20개 용어
                      }
                    }
                    return totalTerms
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">{t('progress.card.terms.accumulated.total')}</span>
                <span className="text-white font-semibold text-sm">
                  {(() => {
                    // 실제 학습된 용어 수 계산 (userModified 상태가 true인 카드에서만)
                    let totalTermsLearned = 0
                    
                    if (typeof window !== 'undefined') {
                      try {
                        // 모든 날짜의 모든 카드에서 userModified 상태가 true인 경우만 용어 학습 상태 확인
                        if (aiInfoDates) {
                          aiInfoDates.forEach((date: string) => {
                            // 각 날짜당 2개 카드 (0번, 1번) 확인
                            for (let infoIndex = 0; infoIndex < 2; infoIndex++) {
                              // userModified 상태가 true인 경우만 용어 학습 상태 확인
                              if (getActualLearningStatus(date, infoIndex)) {
                                const learnedTermsKey = `learnedTerms_${sessionId}_${date}_${infoIndex}`
                                const learnedTerms = localStorage.getItem(learnedTermsKey)
                                if (learnedTerms) {
                                  try {
                                    const terms = JSON.parse(learnedTerms)
                                    if (Array.isArray(terms)) {
                                      totalTermsLearned += terms.length
                                    }
                                  } catch (error) {
                                    console.error('용어 데이터 파싱 오류:', error)
                                  }
                                }
                              }
                            }
                          })
                        }
                      } catch (error) {
                        console.error('로컬 스토리지 데이터 파싱 오류:', error)
                      }
                    }
                    
                    // 전체 등록된 용어 수 (각 날짜당 2개 카드 × 20개 용어)
                    const totalTerms = (aiInfoDates?.length || 0) * 2 * 20
                    const percentage = totalTerms > 0 ? Math.round((totalTermsLearned / totalTerms) * 100) : 0
                    
                    return `${totalTermsLearned}/${totalTerms} (${percentage}%)`
                  })()}
                </span>
              </div>
            </div>
          </motion.div>

          {/* 퀴즈 통계 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-green-400" />
                <h3 className="text-white font-semibold text-sm">
                  {localLanguage === 'ko' ? '퀴즈' : 
                   localLanguage === 'en' ? 'Quiz' : 
                   localLanguage === 'ja' ? 'クイズ' : '测验'}
                </h3>
              </div>
              <TrendingUp className="w-3 h-3 text-green-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">
                  {selectedDate ? `${selectedDate} ${t('progress.card.accuracy')}` : t('progress.card.accuracy')}
                </span>
                <span className="text-green-400 font-bold text-base">
                  {(() => {
                    // selectedDate가 있으면 해당 날짜의 데이터를 우선적으로 표시
                    if (selectedDate && uniqueChartData.length > 0) {
                      const selectedDateData = uniqueChartData.find(data => data.date === selectedDate)
                      if (selectedDateData) {
                        return `${selectedDateData.quiz_score}%`
                      }
                    }
                    return `${stats?.today_quiz_score || 0}%`
                  })()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-xs">
                  {selectedDate ? `${selectedDate} ${t('progress.card.daily.accumulated')}` : t('progress.card.daily.accumulated')}
                </span>
                <span className="text-white font-semibold text-sm">
                  {(() => {
                    // selectedDate가 있으면 해당 날짜의 데이터를 우선적으로 표시
                    if (selectedDate && uniqueChartData.length > 0) {
                      const selectedDateData = uniqueChartData.find(data => data.date === selectedDate)
                      if (selectedDateData) {
                        return `${selectedDateData.quiz_correct}/${selectedDateData.quiz_total}`
                      }
                    }
                    return `${stats?.today_quiz_correct || 0}/${stats?.today_quiz_total || 0}`
                  })()}
                </span>
              </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-xs">
                {localLanguage === 'ko' ? '누적 정답률' : 
                 localLanguage === 'en' ? 'Cumulative Accuracy' : 
                 localLanguage === 'ja' ? '累積正答率' : '累计正确率'}
              </span>
              <span className="text-white font-semibold text-sm">
                {(() => {
                  const correct = stats?.cumulative_quiz_correct || stats?.total_quiz_correct || 0
                  const total = stats?.cumulative_quiz_total || stats?.total_quiz_questions || 0
                  const percentage = stats?.cumulative_quiz_score || 0

                  return `${correct}/${total} (${percentage}%)`
                })()}
              </span>
            </div>
            </div>
          </motion.div>
        </div>
      ) : (
        // 학습 추이 그래프 모드
        <div className="space-y-3 px-0">
          {/* 기간 선택 및 표시 */}
          <div className="flex items-center gap-3">
            {/* 기간 선택 */}
            <div className="flex bg-gradient-to-br from-purple-950/60 via-purple-900/70 to-purple-950/60 backdrop-blur-2xl rounded-lg p-1 border border-purple-600/50 shadow-lg shadow-purple-900/50">
              <button
                type="button"
                onClick={() => handlePeriodChange('week')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer touch-manipulation min-w-[50px] ${
                  periodType === 'week'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-purple-800/40 active:bg-purple-700/60'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {t('progress.period.weekly')}
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('month')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer touch-manipulation min-w-[50px] ${
                  periodType === 'month'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-purple-800/40 active:bg-purple-700/60'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {t('progress.period.monthly')}
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('custom')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer touch-manipulation min-w-[50px] ${
                  periodType === 'custom'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md transform scale-105'
                    : 'text-white/70 hover:text-white hover:bg-purple-800/40 active:bg-purple-700/60'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {t('progress.period.custom')}
              </button>
            </div>
            
            {/* 현재 기간 표시 */}
            <div className="text-white/80 text-xs font-medium bg-gradient-to-r from-purple-900/30 via-purple-800/40 to-purple-900/30 px-3 py-1.5 rounded-md border border-purple-500/20 backdrop-blur-xl">
              <span className="text-purple-200 mr-1">📅</span> {periodStats?.start_date ? formatCompactDate(periodStats.start_date) : t('common.loading')} ~ {periodStats?.end_date ? formatCompactDate(periodStats.end_date) : t('common.loading')}
            </div>
          </div>

          {/* 사용자 정의 기간 설정 */}
          {periodType === 'custom' && (
            <div className="flex flex-col gap-3 relative z-20 bg-gradient-to-br from-purple-950/60 via-purple-900/70 to-purple-950/60 rounded-xl p-4 border-2 border-purple-600/50 mt-4 shadow-2xl shadow-purple-900/50">
              <div className="text-center">
                <span className="text-white/80 text-sm font-medium">{t('progress.period.settings')}</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="w-full">
                  <label className="block text-white/70 text-xs font-medium mb-2">📅 {t('progress.custom.period.start.date')}</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => handleCustomStartDateChange(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer touch-manipulation"
                    style={{ minHeight: '44px' }}
                  />
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-16 h-0.5 bg-white/30 rounded-full"></div>
                  <span className="text-white/50 text-xs mx-2">↓</span>
                  <div className="w-16 h-0.5 bg-white/30 rounded-full"></div>
                </div>
                <div className="w-full">
                  <label className="block text-white/70 text-xs font-medium mb-2">📅 {t('progress.custom.period.end.date')}</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => handleCustomEndDateChange(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer touch-manipulation"
                    style={{ minHeight: '44px' }}
                  />
                </div>
              </div>
              <div className="text-center">
                <span className="text-white/50 text-xs">
                  {customStartDate && customEndDate ? 
                    `${customStartDate} ~ ${customEndDate}` : 
                    t('progress.custom.period.select.dates')
                  }
                </span>
              </div>
            </div>
          )}

          {/* 그래프 표시 */}
          <div className="glass rounded-xl p-2 md:p-3">
            {periodStatsLoading ? (
              <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-white -mt-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                  <p className="text-white/80 text-lg font-medium whitespace-nowrap">{t('progress.period.change.loading')}</p>
                </div>
              </div>
            ) : uniqueChartData.length > 0 ? (
              <div className="space-y-6">
                {/* AI 정보 추이 */}
                <div className="w-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50"></div>
                      <span className="text-white font-semibold text-base">{t('progress.card.ai.info.learning')}</span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-full border border-blue-400/40">
                        <span className="text-blue-200 text-xs font-medium">{t('progress.graph.card.average')}</span>
                        <span className="text-blue-100 font-bold text-sm">
                          {calculateAverage(uniqueChartData, 'ai_info')}%
                        </span>
                      </div>
                    </div>
                    <span className="text-white/70 text-sm font-medium">
                      {t('progress.graph.card.max')}: 100%
                    </span>
                  </div>
                  <div className="w-full">
                    <div className="flex flex-row items-end h-28 relative px-2 md:px-4" style={{ minWidth: getContainerMinWidth() }}>
                      {/* y축 라벨 */}
                      <div className="flex flex-col justify-between h-full mr-3 text-xs text-white/50 select-none" style={{height: 80}}>
                        {[100, 50, 0].map((v, i) => (
                          <div key={v} style={{height: 26, lineHeight: '26px'}} className="font-medium flex items-center">{v}%</div>
                        ))}
                      </div>

                      {/* bar + 날짜 */}
                      <div className={`flex items-end h-20 ${getBarGap()}`}>
                        {uniqueChartData.map((data, index) => {
                          const barMaxHeight = 80;
                          const maxValue = 2; // 고정된 최대값 2 (각 날짜당 2개 카드)
                          const aiHeight = Math.min(Math.max((data.ai_info / maxValue) * 40, data.ai_info > 0 ? 3 : 0), 40);
                          const isFullAI = data.ai_info >= maxValue;
                          const percent = Math.min(Math.round((data.ai_info / maxValue) * 100), 100);
                          return (
                            <div key={index} className={`flex flex-col items-center ${getBarWidth()}`}>
                              <div className="relative w-full">
                                <div
                                  className={
                                    isFullAI
                                      ? "bg-gradient-to-t from-blue-700 to-blue-400 shadow-lg animate-pulse rounded-t-sm transition-all duration-500"
                                      : "bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm transition-all duration-500 hover:from-blue-400 hover:to-blue-300"
                                  }
                                  style={{
                                    height: aiHeight,
                                    minHeight: data.ai_info > 0 ? 3 : 0,
                                    width: "100%"
                                  }}
                                />
                                                                 {/* bar 위에 % */}
                                 {data.ai_info > 0 && shouldShowPercentage() && (
                                   <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[4px] font-bold whitespace-nowrap z-20 transition-all duration-300 min-w-[10px] text-center ${
                                     percent === 100 
                                       ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/50 animate-pulse px-0.5 py-0.5 rounded-full border border-yellow-300' 
                                       : 'bg-gradient-to-r from-blue-400 to-blue-300 text-white shadow-lg shadow-blue-500/30 px-0.5 py-0.5 rounded-md'
                                   }`}>
                                     {percent}%
                                   </div>
                                 )}
                              </div>
                              <div className={`text-xs mt-1.5 text-center ${data.date === selectedDate ? 'text-yellow-400 font-bold' : 'text-white/60'}`} style={{fontSize:'9px', minHeight: '14px'}}>
                                {shouldShowXAxisLabel(index) ? new Date(data.date).getDate() : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 용어 학습 추이 */}
                <div className="w-full bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full shadow-lg shadow-purple-500/50"></div>
                      <span className="text-white font-semibold text-base">
                        {localLanguage === 'ko' ? '용어학습' : 
                         localLanguage === 'en' ? 'Terms' : 
                         localLanguage === 'ja' ? '用語学習' : '术语学习'}
                      </span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500/30 to-purple-600/30 rounded-full border border-purple-400/40">
                        <span className="text-purple-200 text-xs font-medium">{t('progress.graph.card.average')}</span>
                        <span className="text-purple-100 font-bold text-sm">
                          {calculateAverage(uniqueChartData, 'terms')}%
                        </span>
                      </div>
                    </div>
                    <span className="text-white/70 text-sm font-medium">
                      {t('progress.graph.card.max')}: 100%
                    </span>
                  </div>
                  <div className="w-full">
                    <div className="flex flex-row items-end h-28 relative px-2 md:px-4" style={{ minWidth: getContainerMinWidth() }}>
                      {/* y축 라벨 */}
                      <div className="flex flex-col justify-between h-full mr-3 text-xs text-white/50 select-none" style={{height: 80}}>
                        {[100, 50, 0].map((v, i) => (
                          <div key={v} style={{height: 26, lineHeight: '26px'}} className="font-medium flex items-center">{v}%</div>
                        ))}
                      </div>

                      {/* bar + 날짜 */}
                      <div className={`flex items-end h-20 ${getBarGap()}`}>
                        {uniqueChartData.map((data, index) => {
                          const barMaxHeight = 80;
                          // 선택된 날짜의 AI정보 카드 수에 따라 최대값 동적 설정
                          const maxValue = data.date === selectedDate ? todayMaxTerms : 40;
                          const termsHeight = Math.min(Math.max((data.terms / maxValue) * 40, data.terms > 0 ? 3 : 0), 40);
                          const isFullTerms = data.terms >= maxValue;
                          const percent = Math.min(Math.round((data.terms / maxValue) * 100), 100);
                          return (
                            <div key={index} className={`flex flex-col items-center ${getBarWidth()}`}>
                              <div className="relative w-full">
                                <div
                                  className={
                                    isFullTerms
                                      ? "bg-gradient-to-t from-purple-700 to-purple-400 shadow-lg animate-pulse rounded-t-sm transition-all duration-500"
                                      : "bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm transition-all duration-500 hover:from-purple-400 hover:to-purple-300"
                                  }
                                  style={{
                                    height: termsHeight,
                                    minHeight: data.terms > 0 ? 3 : 0,
                                    width: "100%"
                                  }}
                                />
                                                                 {/* bar 위에 % */}
                                 {data.terms > 0 && shouldShowPercentage() && (
                                   <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[4px] font-bold whitespace-nowrap z-20 transition-all duration-300 min-w-[10px] text-center ${
                                     percent === 100 
                                       ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/50 animate-pulse px-0.5 py-0.5 rounded-full border border-yellow-300' 
                                       : 'bg-gradient-to-r from-purple-400 to-purple-300 text-white shadow-lg shadow-purple-500/30 px-0.5 py-0.5 rounded-md'
                                   }`}>
                                     {percent}%
                                   </div>
                                 )}
                              </div>
                              <div className={`text-xs mt-1.5 text-center ${data.date === selectedDate ? 'text-yellow-400 font-bold' : 'text-white/60'}`} style={{fontSize:'9px', minHeight: '14px'}}>
                                {shouldShowXAxisLabel(index) ? new Date(data.date).getDate() : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 퀴즈 점수 추이 */}
                <div className="w-full bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                      <span className="text-white font-semibold text-base">
                        {localLanguage === 'ko' ? '퀴즈' : 
                         localLanguage === 'en' ? 'Quiz' : 
                         localLanguage === 'ja' ? 'クイズ' : '测验'}
                      </span>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500/30 to-emerald-500/30 rounded-full border border-green-400/40">
                        <span className="text-green-200 text-xs font-medium">{t('progress.graph.card.average')}</span>
                        <span className="text-green-100 font-bold text-sm">
                          {calculateAverage(uniqueChartData, 'quiz_score')}%
                        </span>
                      </div>
                    </div>
                    <span className="text-white/70 text-sm font-medium">
                      {t('progress.graph.card.max')}: {maxQuiz}%
                    </span>
                  </div>
                  <div className="w-full">
                    <div className="flex flex-row items-end h-28 relative px-2 md:px-4" style={{ minWidth: getContainerMinWidth() }}>
                      {/* y축 라벨 */}
                      <div className="flex flex-col justify-between h-full mr-3 text-xs text-white/50 select-none" style={{height: 80}}>
                        {[100, 50, 0].map((v, i) => (
                          <div key={v} style={{height: 26, lineHeight: '26px'}} className="font-medium flex items-center">{v}%</div>
                        ))}
                      </div>

                      {/* bar + 날짜 */}
                      <div className={`flex items-end h-20 ${getBarGap()}`}>
                        {uniqueChartData.map((data, index) => {
                          const barMaxHeight = 80;
                          // 퀴즈 점수는 이미 백분율(0-100)이므로 100을 최대값으로 사용
                          const maxQuizScore = 100;
                          const quizHeight = Math.min(Math.max((data.quiz_score / maxQuizScore) * 40, data.quiz_score > 0 ? 3 : 0), 40);
                          const isFullQuiz = data.quiz_score >= maxQuizScore;
                          const percent = Math.min(Math.round((data.quiz_score / maxQuizScore) * 100), 100);
                          return (
                            <div key={index} className={`flex flex-col items-center ${getBarWidth()}`}>
                              <div className="relative w-full">
                                <div
                                  className={
                                    isFullQuiz
                                      ? "bg-gradient-to-t from-green-700 to-green-400 shadow-lg animate-pulse rounded-t-sm transition-all duration-500"
                                      : "bg-gradient-to-t from-green-500 to-green-400 rounded-sm transition-all duration-500 hover:from-green-400 hover:to-green-300"
                                  }
                                  style={{
                                    height: quizHeight,
                                    minHeight: data.quiz_score > 0 ? 3 : 0,
                                    width: "100%"
                                  }}
                                />
                                                                 {/* bar 위에 % */}
                                 {data.quiz_score > 0 && shouldShowPercentage() && (
                                   <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[4px] font-bold whitespace-nowrap z-20 transition-all duration-300 min-w-[10px] text-center ${
                                     percent === 100 
                                       ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/50 animate-pulse px-0.5 py-0.5 rounded-full border border-yellow-300' 
                                       : 'bg-gradient-to-r from-green-400 to-emerald-300 text-white shadow-lg shadow-green-500/30 px-0.5 py-0.5 rounded-md'
                                   }`}>
                                     {percent}%
                                   </div>
                                 )}
                              </div>
                              <div className={`text-xs mt-1.5 text-center ${data.date === selectedDate ? 'text-yellow-400 font-bold' : 'text-white/60'}`} style={{fontSize:'9px', minHeight: '14px'}}>
                                {shouldShowXAxisLabel(index) ? new Date(data.date).getDate() : ''}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass rounded-2xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center">
                <div className="text-center text-white">
                  {/* 아이콘 */}
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full flex items-center justify-center mb-6 border-2 border-blue-400/30">
                    <BarChart3 className="w-10 h-10 text-blue-400" />
                  </div>
                  
                  {/* 제목 */}
                  <h3 className="text-2xl font-bold text-white mb-4">
                    {t('progress.graph.no.data.title')}
                  </h3>
                  
                  {/* 설명 */}
                  <p className="text-white/80 text-base md:text-lg leading-relaxed mb-8 max-w-md whitespace-pre-line">
                    {t('progress.graph.no.data.description')}
                  </p>
                  
                  {/* 학습 팁 */}
                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-400/30 max-w-md">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-400">💡</span>
                      <span className="text-blue-200 font-semibold text-sm">
                        {t('progress.graph.no.data.tip.title')}
                      </span>
                    </div>
                    <p className="text-blue-100 text-sm leading-relaxed">
                      {t('progress.graph.no.data.tip.description')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressSection 


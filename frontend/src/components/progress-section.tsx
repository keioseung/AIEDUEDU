'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, BookOpen, Target, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUserStats } from '@/hooks/use-user-progress'
import { userProgressAPI, aiInfoAPI } from '@/lib/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'

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

  const { data: stats } = useUserStats(sessionId)
  const queryClient = useQueryClient()
  
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
        console.log('Fetching total days...')
        const response = await aiInfoAPI.getTotalDays()
        console.log('Total days API response:', response.data)
        return response.data
      } catch (error) {
        console.error('Failed to fetch total days:', error)
        // API 호출 실패 시 dates/all을 사용하여 계산
        try {
          console.log('Trying to fetch dates instead...')
          const datesResponse = await aiInfoAPI.getAllDates()
          const totalDays = datesResponse.data.length
          console.log('Calculated total days from dates:', totalDays)
          return { total_days: totalDays }
        } catch (datesError) {
          console.error('Failed to fetch dates:', datesError)
          return { total_days: 0 }
        }
      }
    },
  })

  // 디버깅: totalDaysData 값 확인
  console.log('totalDaysData:', totalDaysData)
  console.log('stats:', stats)

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

  const { data: periodStats } = useQuery<PeriodStats>({
    queryKey: ['period-stats', sessionId, periodDates.start, periodDates.end],
    queryFn: async () => {
      const response = await userProgressAPI.getPeriodStats(sessionId, periodDates.start, periodDates.end)
      return response.data
    },
    enabled: !!sessionId && !!periodDates.start && !!periodDates.end,
  })

  // 진단용: 실제로 받아오는 기간별 학습 데이터와 파라미터 콘솔 출력
  console.log('periodStats API 파라미터', sessionId, periodDates.start, periodDates.end);
  if (Array.isArray(periodStats?.period_data)) {
    periodStats.period_data.forEach((d, i) => {
      console.log(`Day ${i}:`, d.date, 'AI:', d.ai_info, 'Terms:', d.terms, 'Quiz:', d.quiz_score);
      if ((d.ai_info === 0 || d.ai_info === undefined) && (d.terms === 0 || d.terms === undefined) && (d.quiz_score === 0 || d.quiz_score === undefined)) {
        console.warn(`Day ${i} (${d.date}): 모든 값이 0이거나 undefined! DB 저장/조회/sessionId/날짜 문제 가능성 높음.`);
      }
    });
  } else {
    console.warn('periodStats?.period_data가 배열이 아님:', periodStats?.period_data);
  }

  // 동적 막대 너비 계산
  const getBarWidth = () => {
    const dataLength = uniqueChartData.length;
    if (dataLength <= 7) return 'w-8'; // 주간: 32px
    if (dataLength <= 14) return 'w-5'; // 2주: 20px
    if (dataLength <= 30) return 'w-2'; // 월간: 8px (더 좁게)
    if (dataLength <= 60) return 'w-1'; // 2개월: 4px
    return 'w-1'; // 3개월 이상: 4px
  };

  const getBarGap = () => {
    const dataLength = uniqueChartData.length;
    if (dataLength <= 7) return 'gap-2'; // 주간: 8px
    if (dataLength <= 14) return 'gap-1'; // 2주: 4px
    if (dataLength <= 30) return 'gap-0'; // 월간: 0px
    return 'gap-0'; // 2개월 이상: 0px
  };

  const getContainerMinWidth = () => {
    const dataLength = uniqueChartData.length;
    if (dataLength <= 7) return `${dataLength * 40}px`; // 주간: 40px per bar
    if (dataLength <= 14) return `${dataLength * 24}px`; // 2주: 24px per bar
    if (dataLength <= 30) return `${dataLength * 8}px`; // 월간: 8px per bar (더 좁게)
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
    return index % 5 === 0 || index === dataLength - 1; // 월간: 5일마다 + 마지막 날
  };

  // 선그래프 표시 여부 결정
  const shouldShowLineGraph = () => {
    const dataLength = uniqueChartData.length;
    return dataLength > 7; // 주간(7일 이하)에서는 선그래프 숨김
  };

  // 평균 계산 함수
  const calculateAverage = (data: PeriodData[], type: 'ai_info' | 'terms' | 'quiz_score') => {
    const validData = data.filter(d => d[type] > 0);
    if (validData.length === 0) return 0;
    
    const sum = validData.reduce((acc, d) => acc + d[type], 0);
    return Math.round(sum / validData.length);
  };

  // 선그래프 SVG 경로 생성
  const generateLinePath = (data: PeriodData[], type: 'ai_info' | 'terms' | 'quiz_score', maxValue: number) => {
    if (data.length === 0) return '';
    
    const barWidth = uniqueChartData.length <= 7 ? 32 : uniqueChartData.length <= 14 ? 20 : 12;
    const gap = uniqueChartData.length <= 7 ? 8 : uniqueChartData.length <= 14 ? 4 : 0;
    const totalWidth = barWidth + gap;
    
    const points = data.map((d, index) => {
      const x = index * totalWidth + barWidth / 2;
      const y = 128 - Math.min((d[type] / maxValue) * 128, 128);
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  // 날짜 변경 핸들러 - 상위 컴포넌트에 알림
  const handleDateChange = (date: string) => {
    console.log('진행률 탭 - 날짜 변경:', date)
    onDateChange?.(date)
  }

  // selectedDate가 변경될 때 데이터 리페치
  useEffect(() => {
    if (selectedDate) {
      console.log('진행률 탭 - selectedDate 변경됨:', selectedDate)
      // 쿼리 무효화하여 데이터 새로고침
      queryClient.invalidateQueries({ queryKey: ['period-stats', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
      
      // 로컬 스토리지에서 해당 날짜의 AI 정보 학습 데이터 확인
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('userProgress')
          if (stored) {
            const parsed = JSON.parse(stored)
            const userData = parsed[sessionId]
            if (userData && userData[selectedDate]) {
              console.log(`진행률 - ${selectedDate} 날짜의 AI 정보 학습 데이터:`, userData[selectedDate])
            }
          }
        } catch (error) {
          console.error('Failed to check local progress for selected date:', error)
        }
      }
    }
  }, [selectedDate, sessionId, queryClient])

  // 기간 변경 핸들러
  const handlePeriodChange = (type: 'week' | 'month' | 'custom') => {
    console.log('진행률 탭 - 기간 변경:', type)
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
    console.log('진행률 탭 - 시작 날짜 변경:', date)
    setCustomStartDate(date)
  }

  const handleCustomEndDateChange = (date: string) => {
    console.log('진행률 탭 - 종료 날짜 변경:', date)
    setCustomEndDate(date)
  }

  // 그래프 데이터 준비 - 백엔드 데이터와 로컬 데이터 통합
  const chartData = periodStats?.period_data || []
  
  // 로컬 스토리지에서 AI 정보 학습 데이터 가져오기
  const localAIProgress = (() => {
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
              const localTerms = userData.terms_by_date?.[dateStr] || []
              
              // selectedDate가 있는 경우 해당 날짜의 데이터를 우선적으로 반영
              let aiCount = localProgress.length
              let termsCount = localTerms.length
              
              // selectedDate가 현재 날짜와 같다면 로컬 데이터를 더 정확하게 반영
              if (selectedDate && dateStr === selectedDate) {
                console.log(`진행률 - ${dateStr} 날짜의 로컬 데이터: AI=${aiCount}, Terms=${termsCount}`)
              }
              
              localData.push({
                date: dateStr,
                ai_info: aiCount,
                terms: termsCount,
                quiz_score: 0,
                quiz_correct: 0,
                quiz_total: 0
              })
            }
            return localData
          }
        }
      } catch (error) {
        console.error('Failed to parse local progress:', error)
      }
    }
    return []
  })()
  
  // 백엔드 데이터와 로컬 데이터 통합 (로컬 데이터 우선)
  const uniqueChartData = (() => {
    const chartData = periodStats?.period_data || []
    const combinedData = [...localAIProgress, ...chartData]
    
    // 디버깅: 원본 데이터 확인
    console.log('그래프 데이터 계산:', {
      localAIProgress: localAIProgress,
      chartData: chartData,
      combinedData: combinedData
    })
    
    // 날짜별로 중복 제거하고 정렬 (로컬 데이터 우선)
    const uniqueData = combinedData.reduce((acc: PeriodData[], current: PeriodData) => {
      const existingIndex = acc.findIndex(item => item.date === current.date)
      if (existingIndex === -1) {
        acc.push(current)
      } else {
        // 중복된 날짜가 있으면 로컬 데이터를 우선적으로 사용
        const existing = acc[existingIndex]
        acc[existingIndex] = {
          ...existing,
          ai_info: Math.max(existing.ai_info, current.ai_info),
          terms: Math.max(existing.terms, current.terms),
          quiz_score: Math.max(existing.quiz_score, current.quiz_score),
          quiz_correct: Math.max(existing.quiz_correct, current.quiz_correct),
          quiz_total: Math.max(existing.quiz_total, current.quiz_total)
        }
      }
      return acc
    }, []).sort((a: PeriodData, b: PeriodData) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // 디버깅: 최종 그래프 데이터 확인
    console.log('최종 그래프 데이터:', uniqueData)
    
    return uniqueData
  })()
  
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

  return (
    <div className="space-y-8 relative">
      {/* 기간 선택 */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between relative z-10">

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white/80 text-sm font-medium">기간:</span>
            <div className="flex bg-white/10 rounded-lg p-1 relative z-20">
              <button
                type="button"
                onClick={() => {
                  handlePeriodChange('week')
                }}
                onTouchStart={() => {
                  handlePeriodChange('week')
                }}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer touch-manipulation min-w-[70px] min-h-[44px] relative z-30 ${
                  periodType === 'week'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 9999
                }}
              >
                주간
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePeriodChange('month')
                }}
                onTouchStart={() => {
                  handlePeriodChange('month')
                }}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer touch-manipulation min-w-[70px] min-h-[44px] relative z-30 ${
                  periodType === 'month'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 9999
                }}
              >
                월간
              </button>
              <button
                type="button"
                onClick={() => {
                  handlePeriodChange('custom')
                }}
                onTouchStart={() => {
                  handlePeriodChange('custom')
                }}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer touch-manipulation min-w-[70px] min-h-[44px] relative z-30 ${
                  periodType === 'custom'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-white/70 hover:text-white hover:bg-white/20 active:bg-white/30'
                }`}
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 9999
                }}
              >
                사용자
              </button>
            </div>
          </div>
        </div>

        {/* 사용자 정의 기간 설정 - 별도 라인에 배치 */}
        {periodType === 'custom' && (
          <div className="flex flex-col gap-3 relative z-20 bg-white/5 rounded-xl p-4 border border-white/10 mt-4">
            <div className="text-center">
              <span className="text-white/80 text-sm font-medium">사용자 정의 기간 설정</span>
            </div>
            <div className="flex flex-col gap-3">
              <div className="w-full">
                <label className="block text-white/70 text-xs font-medium mb-2">
                  📅 시작일
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    handleCustomStartDateChange(e.target.value)
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer touch-manipulation relative z-30"
                  style={{ 
                    minHeight: '44px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    position: 'relative',
                    zIndex: 9999
                  }}
                />
              </div>
              <div className="flex items-center justify-center">
                <div className="w-16 h-0.5 bg-white/30 rounded-full"></div>
                <span className="text-white/50 text-xs mx-2">↓</span>
                <div className="w-16 h-0.5 bg-white/30 rounded-full"></div>
              </div>
              <div className="w-full">
                <label className="block text-white/70 text-xs font-medium mb-2">
                  📅 종료일
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    handleCustomEndDateChange(e.target.value)
                  }}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer touch-manipulation relative z-30"
                  style={{ 
                    minHeight: '44px',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    position: 'relative',
                    zIndex: 9999
                  }}
                />
              </div>
            </div>
            <div className="text-center">
              <span className="text-white/50 text-xs">
                {customStartDate && customEndDate ? 
                  `${customStartDate} ~ ${customEndDate}` : 
                  '시작일과 종료일을 선택해주세요'
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 전체 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AI 정보 통계 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-semibold">AI 정보 학습</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">
                {selectedDate ? `${selectedDate} 학습 수` : '오늘 학습 수'}
              </span>
              <span className="text-blue-400 font-bold text-lg">
                {(() => {
                  // selectedDate가 있으면 해당 날짜의 데이터를 우선적으로 표시
                  if (selectedDate && uniqueChartData.length > 0) {
                    const selectedDateData = uniqueChartData.find(data => data.date === selectedDate)
                    if (selectedDateData) {
                      return selectedDateData.ai_info
                    }
                  }
                  return stats?.today_ai_info || 0
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">일별 총 정보 수</span>
              <span className="text-blue-400 font-bold text-base">{totalAIInfo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">누적 총 학습 수</span>
              <span className="text-white font-semibold">
                {(() => {
                  // totalDaysData가 없으면 백엔드에서 직접 계산
                  let totalDays = totalDaysData?.total_days || 0
                  if (totalDays === 0) {
                    // 하드코딩된 값 사용 (7월 21일부터 8월 3일까지 = 14일)
                    totalDays = 14
                  }
                  const totalLearned = stats?.total_ai_info_available || stats?.total_learned || 0
                  const maxPossible = totalDays * 2 // 일 수 * 2
                  const percentage = maxPossible > 0 ? Math.round((totalLearned / maxPossible) * 100) : 0
                  console.log('AI 정보 학습 계산:', { totalDays, totalLearned, maxPossible, percentage, totalDaysData })
                  return `${totalLearned}/${maxPossible} (${percentage}%)`
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
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">용어 학습</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">
                {selectedDate ? `${selectedDate} 학습 수` : '오늘 학습 수'}
              </span>
              <span className="text-purple-400 font-bold text-lg">
                {(() => {
                  // selectedDate가 있으면 해당 날짜의 데이터를 우선적으로 표시
                  if (selectedDate && uniqueChartData.length > 0) {
                    const selectedDateData = uniqueChartData.find(data => data.date === selectedDate)
                    if (selectedDateData) {
                      return selectedDateData.terms
                    }
                  }
                  return stats?.today_terms || 0
                })()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">일별 총 용어 수</span>
              <span className="text-purple-400 font-bold text-base">{totalTerms}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">누적 총 용어 수</span>
              <span className="text-white font-semibold">
                {(() => {
                  // totalDaysData가 없으면 백엔드에서 직접 계산
                  let totalDays = totalDaysData?.total_days || 0
                  if (totalDays === 0) {
                    // 하드코딩된 값 사용 (7월 21일부터 8월 3일까지 = 14일)
                    totalDays = 14
                  }
                  const totalTermsLearned = stats?.total_terms_learned || 0
                  const maxPossible = totalDays * 40 // 일 수 * 40
                  const percentage = maxPossible > 0 ? Math.round((totalTermsLearned / maxPossible) * 100) : 0
                  console.log('용어 학습 계산:', { totalDays, totalTermsLearned, maxPossible, percentage, totalDaysData })
                  return `${totalTermsLearned}/${maxPossible} (${percentage}%)`
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
          className="bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-400" />
              <h3 className="text-white font-semibold">퀴즈 점수</h3>
            </div>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">
                {selectedDate ? `${selectedDate} 누적 점수` : '오늘 누적 점수'}
              </span>
              <span className="text-green-400 font-bold text-lg">
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
              <span className="text-white/70 text-sm">
                {selectedDate ? `${selectedDate} 정답률` : '오늘 정답률'}
              </span>
              <span className="text-white font-semibold">
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
              <span className="text-white/70 text-sm">전체 누적</span>
              <span className="text-white font-semibold">
                {(() => {
                  const correct = stats?.cumulative_quiz_correct || stats?.total_quiz_correct || 0
                  const total = stats?.cumulative_quiz_total || stats?.total_quiz_questions || 0
                  const percentage = stats?.cumulative_quiz_score || 0
                  console.log('퀴즈 전체 누적 계산:', { correct, total, percentage, stats })
                  return `${correct}/${total} (${percentage}%)`
                })()}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 기간별 추이 그래프 - 기본 bar chart 복원 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold text-lg">기간별 학습 추이</h3>
          <div className="text-white/60 text-sm">
            {periodStats?.start_date} ~ {periodStats?.end_date}
          </div>
        </div>
        <div className="glass rounded-2xl p-6">
          {(() => {
            const chartData = periodStats?.period_data || []
            // 디버깅: 조건 확인
            console.log('그래프 렌더링 조건 확인:', {
              uniqueChartDataLength: uniqueChartData.length,
              uniqueChartData: uniqueChartData,
              hasData: uniqueChartData.length > 0 || (localAIProgress.length > 0) || (chartData && chartData.length > 0)
            })
            
            return uniqueChartData.length > 0 || (localAIProgress.length > 0) || (chartData && chartData.length > 0)
          })() ? (
            <div className="space-y-8">
              {/* AI 정보 추이 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-white/90 font-semibold">AI 정보 학습</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 rounded-full">
                      <span className="text-blue-300 text-xs">평균</span>
                      <span className="text-blue-200 font-bold text-sm">
                        {calculateAverage(uniqueChartData, 'ai_info')}개
                      </span>
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">
                    최대: {maxAI > 0 ? maxAI : 3}개
                  </span>
                </div>
                <div className="overflow-x-auto pt-16">
                  <div className="flex flex-row items-end h-32 relative" style={{ minWidth: getContainerMinWidth() }}>
                    {/* y축 라벨 */}
                    <div className="flex flex-col justify-between h-full mr-3 text-xs text-white/40 select-none" style={{height: 128}}>
                      {[100, 80, 60, 40, 20, 0].map(v => (
                        <div key={v} style={{height: 128/5}}>{v}%</div>
                      ))}
                    </div>
                    {/* SVG 선그래프 */}
                    {shouldShowLineGraph() && (
                      <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: getContainerMinWidth() }}>
                        <path
                          d={generateLinePath(uniqueChartData, 'ai_info', maxAI > 0 ? maxAI : 3)}
                          stroke="url(#blueGradient)"
                          strokeWidth="2"
                          fill="none"
                          opacity="0.8"
                        />
                        <defs>
                          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#06B6D4" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                    {/* bar + 날짜 */}
                    <div className={`flex items-end h-32 ${getBarGap()}`}>
                      {uniqueChartData.map((data, index) => {
                        const barMaxHeight = 128;
                        const effectiveMaxAI = maxAI > 0 ? maxAI : 3;
                        const aiHeight = Math.min(Math.max((data.ai_info / effectiveMaxAI) * barMaxHeight, data.ai_info > 0 ? 4 : 0), barMaxHeight);
                        const isFullAI = data.ai_info >= effectiveMaxAI;
                        const percent = Math.min(Math.round((data.ai_info / effectiveMaxAI) * 100), 100);
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
                                  minHeight: data.ai_info > 0 ? 4 : 0,
                                  width: "100%"
                                }}
                              />
                              {/* bar 위에 % */}
                              {data.ai_info > 0 && shouldShowPercentage() && (
                                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap z-20 transition-all duration-300 min-w-[40px] text-center ${
                                  percent === 100 
                                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/50 animate-pulse px-2 py-1 rounded-full border-2 border-yellow-300' 
                                    : 'bg-gradient-to-r from-blue-400 to-cyan-300 text-white shadow-lg shadow-blue-500/30 px-1.5 py-0.5 rounded-md'
                                }`}>
                                  {percent}%
                                </div>
                              )}
                            </div>
                            <div className={`text-xs mt-2 text-center ${data.date === selectedDate ? 'text-yellow-400 font-bold' : 'text-white/50'}`} style={{fontSize:'10px', minHeight: '16px'}}>
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
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-white/90 font-semibold">용어 학습</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded-full">
                      <span className="text-purple-300 text-xs">평균</span>
                      <span className="text-purple-200 font-bold text-sm">
                        {calculateAverage(uniqueChartData, 'terms')}개
                      </span>
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">
                    최대: {maxTerms > 0 ? maxTerms : 60}개
                  </span>
                </div>
                <div className="overflow-x-auto pt-16">
                  <div className="flex flex-row items-end h-32 relative" style={{ minWidth: getContainerMinWidth() }}>
                    {/* y축 라벨 */}
                    <div className="flex flex-col justify-between h-full mr-3 text-xs text-white/40 select-none" style={{height: 128}}>
                      {[100, 80, 60, 40, 20, 0].map(v => (
                        <div key={v} style={{height: 128/5}}>{v}%</div>
                      ))}
                    </div>
                    {/* SVG 선그래프 */}
                    {shouldShowLineGraph() && (
                      <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: getContainerMinWidth() }}>
                        <path
                          d={generateLinePath(uniqueChartData, 'terms', maxTerms > 0 ? maxTerms : 60)}
                          stroke="url(#purpleGradient)"
                          strokeWidth="2"
                          fill="none"
                          opacity="0.8"
                        />
                        <defs>
                          <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                    {/* bar + 날짜 */}
                    <div className={`flex items-end h-32 ${getBarGap()}`}>
                      {uniqueChartData.map((data, index) => {
                        const barMaxHeight = 128;
                        const effectiveMaxTerms = maxTerms > 0 ? maxTerms : 60;
                        const termsHeight = Math.min(Math.max((data.terms / effectiveMaxTerms) * barMaxHeight, data.terms > 0 ? 4 : 0), barMaxHeight);
                        const isFullTerms = data.terms >= effectiveMaxTerms;
                        const percent = Math.min(Math.round((data.terms / effectiveMaxTerms) * 100), 100);
                        return (
                          <div key={index} className={`flex flex-col items-center ${getBarWidth()}`}>
                            <div className="relative w-full">
                              <div
                                className={
                                  isFullTerms
                                    ? "bg-gradient-to-t from-purple-700 to-pink-400 shadow-lg animate-pulse rounded-t-sm transition-all duration-500"
                                    : "bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-sm transition-all duration-500 hover:from-purple-400 hover:to-purple-300"
                                }
                                style={{
                                  height: termsHeight,
                                  minHeight: data.terms > 0 ? 4 : 0,
                                  width: "100%"
                                }}
                              />
                              {/* bar 위에 % */}
                              {data.terms > 0 && shouldShowPercentage() && (
                                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap z-20 transition-all duration-300 min-w-[40px] text-center ${
                                  percent === 100 
                                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/50 animate-pulse px-2 py-1 rounded-full border-2 border-yellow-300' 
                                    : 'bg-gradient-to-r from-purple-400 to-pink-300 text-white shadow-lg shadow-purple-500/30 px-1.5 py-0.0.5 rounded-md'
                                }`}>
                                  {percent}%
                                </div>
                              )}
                            </div>
                            <div className={`text-xs mt-2 text-center ${data.date === selectedDate ? 'text-yellow-400 font-bold' : 'text-white/50'}`} style={{fontSize:'10px', minHeight: '16px'}}>
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
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-white/90 font-semibold">퀴즈 점수</span>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
                      <span className="text-green-300 text-xs">평균</span>
                      <span className="text-green-200 font-bold text-sm">
                        {calculateAverage(uniqueChartData, 'quiz_score')}%
                      </span>
                    </div>
                  </div>
                  <span className="text-white/60 text-sm">
                    최대: {maxQuiz}%
                  </span>
                </div>
                <div className="overflow-x-auto pt-16">
                  <div className="flex flex-row items-end h-32 relative" style={{ minWidth: getContainerMinWidth() }}>
                    {/* y축 라벨 */}
                    <div className="flex flex-col justify-between h-full mr-3 text-xs text-white/40 select-none" style={{height: 128}}>
                      {[100, 80, 60, 40, 20, 0].map(v => (
                        <div key={v} style={{height: 128/5}}>{v}%</div>
                      ))}
                    </div>
                    {/* SVG 선그래프 */}
                    {shouldShowLineGraph() && (
                      <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: getContainerMinWidth() }}>
                        <path
                          d={generateLinePath(uniqueChartData, 'quiz_score', maxQuiz)}
                          stroke="url(#greenGradient)"
                          strokeWidth="2"
                          fill="none"
                          opacity="0.8"
                        />
                        <defs>
                          <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#10B981" />
                            <stop offset="100%" stopColor="#059669" />
                          </linearGradient>
                        </defs>
                      </svg>
                    )}
                    {/* bar + 날짜 */}
                    <div className={`flex items-end h-32 ${getBarGap()}`}>
                      {uniqueChartData.map((data, index) => {
                        const barMaxHeight = 128;
                        const quizHeight = Math.min(Math.max((data.quiz_score / maxQuiz) * barMaxHeight, data.quiz_score > 0 ? 4 : 0), barMaxHeight);
                        const isFullQuiz = data.quiz_score >= maxQuiz;
                        const percent = Math.min(Math.round((data.quiz_score / maxQuiz) * 100), 100);
                        return (
                          <div key={index} className={`flex flex-col items-center ${getBarWidth()}`}>
                            <div className="relative w-full">
                              <div
                                className={
                                  isFullQuiz
                                    ? "bg-gradient-to-t from-green-700 to-green-400 shadow-lg animate-pulse rounded-t-sm transition-all duration-500"
                                    : "bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all duration-500 hover:from-green-400 hover:to-green-300"
                                }
                                style={{
                                  height: quizHeight,
                                  minHeight: data.quiz_score > 0 ? 4 : 0,
                                  width: "100%"
                                }}
                              />
                              {/* bar 위에 % */}
                              {data.quiz_score > 0 && shouldShowPercentage() && (
                                <div className={`absolute -top-8 left-1/2 -translate-x-1/2 text-xs font-bold whitespace-nowrap z-20 transition-all duration-300 min-w-[40px] text-center ${
                                  percent === 100 
                                    ? 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/50 animate-pulse px-2 py-1 rounded-full border-2 border-yellow-300' 
                                    : 'bg-gradient-to-r from-green-400 to-emerald-300 text-white shadow-lg shadow-green-500/30 px-1.5 py-0.5 rounded-md'
                                }`}>
                                  {percent}%
                                </div>
                              )}
                            </div>
                            <div className={`text-xs mt-2 text-center ${data.date === selectedDate ? 'text-yellow-400 font-bold' : 'text-white/50'}`} style={{fontSize:'10px', minHeight: '16px'}}>
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
            <div className="text-center text-white/60 py-8">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p>선택한 기간에 학습 데이터가 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProgressSection 

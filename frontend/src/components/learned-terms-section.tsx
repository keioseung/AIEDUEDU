'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { BookOpen, Calendar, Brain, Target, Trophy, TrendingUp, Search, Star, Download, Filter, Shuffle, Bookmark, ChevronLeft, ChevronRight, Play, Pause, X, Menu } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'

interface LearnedTermsSectionProps {
  sessionId: string
  selectedDate?: string
  onDateChange?: (date: string) => void
}

interface Term {
  term: string
  description: string
  learned_date: string
  info_index: number
}

interface LearnedTermsResponse {
  terms: Term[]
  total_terms: number
  learned_dates: string[]
  terms_by_date: Record<string, Term[]>
}

function LearnedTermsSection({ sessionId, selectedDate: propSelectedDate, onDateChange }: LearnedTermsSectionProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentTermIndex, setCurrentTermIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'length' | 'alphabet'>('date')
  const [favoriteTerms, setFavoriteTerms] = useState<Set<string>>(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState(3000)
  const [showFilters, setShowFilters] = useState(false)
  const [showTermList, setShowTermList] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [showSpeedControl, setShowSpeedControl] = useState(false)
  const [currentIntervalId, setCurrentIntervalId] = useState<NodeJS.Timeout | null>(null)
  const [viewedTerms, setViewedTerms] = useState<Set<string>>(new Set())
  const [listHeight, setListHeight] = useState<'default' | 'large' | 'full'>('default')
  const [isScrolling, setIsScrolling] = useState(false)
  const [touchStartY, setTouchStartY] = useState(0)
  const [touchStartTime, setTouchStartTime] = useState(0)
  const [scrollMode, setScrollMode] = useState(false)

  const queryClient = useQueryClient()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // propSelectedDate가 변경될 때 selectedDate 동기화
  useEffect(() => {
    if (propSelectedDate !== undefined) {
      setSelectedDate(propSelectedDate)
    }
  }, [propSelectedDate])
  
  // selectedDate 변경 시 부모 컴포넌트에 알림
  const handleDateChange = (date: string | null) => {
    setSelectedDate(date)
    if (onDateChange && date) {
      onDateChange(date)
    }
  }

  // selectedDate가 변경될 때마다 currentTermIndex를 0으로 리셋
  useEffect(() => {
    setCurrentTermIndex(0)
  }, [selectedDate])

  // 컴포넌트 마운트 시 필터를 전체로 설정
  useEffect(() => {
    setSelectedDate(null)
    setShowFavoritesOnly(false)
    setSearchQuery('')
    setSortBy('date')
  }, [])
  
  const { data: learnedData, isLoading } = useQuery<LearnedTermsResponse>({
    queryKey: ['learned-terms', sessionId],
    queryFn: async () => {
      const response = await aiInfoAPI.getLearnedTerms(sessionId)
      return response.data
    },
    enabled: !!sessionId,
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  })

  // 실제 학습된 용어는 React Query 데이터와 localStorage 데이터를 합침
  const actualLearnedTerms = new Set<string>()
  
  // React Query 데이터에서 문자열만 추가 (우선순위 높음)
  if (learnedData?.terms) {
    learnedData.terms.forEach(term => {
      if (typeof term === 'string') {
        actualLearnedTerms.add(term)
      }
    })
  }
  
  // 필터링 및 정렬된 용어 목록
  const filteredTerms = (() => {
    if (!learnedData?.terms) return []
    
    let terms = selectedDate 
      ? learnedData.terms.filter(term => term.learned_date === selectedDate)
      : learnedData.terms

    // 중복 제거 (같은 용어가 여러 날짜에 있으면 최신 날짜 것만 유지)
    if (!selectedDate) {
      const uniqueTerms = new Map()
      terms.forEach(term => {
        const existing = uniqueTerms.get(term.term)
        if (!existing || new Date(term.learned_date) > new Date(existing.learned_date)) {
          uniqueTerms.set(term.term, term)
        }
      })
      terms = Array.from(uniqueTerms.values())
    }

    // 날짜가 선택된 경우 해당 날짜의 용어만 표시
    if (selectedDate) {
      terms = terms.filter(term => term.learned_date === selectedDate)
    }

    // 검색 필터
    if (searchQuery) {
      terms = terms.filter(term => 
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 즐겨찾기 필터
    if (showFavoritesOnly) {
      terms = terms.filter(term => favoriteTerms.has(term.term))
    }

    // 정렬
    switch (sortBy) {
      case 'length':
        return terms.sort((a, b) => a.term.length - b.term.length)
      case 'alphabet':
        return terms.sort((a, b) => a.term.localeCompare(b.term))
      case 'date':
      default:
        return terms.sort((a, b) => new Date(b.learned_date).getTime() - new Date(a.learned_date).getTime())
    }
  })()

  // 로컬 스토리지에서 즐겨찾기 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('favoriteTerms')
      if (stored) {
        setFavoriteTerms(new Set(JSON.parse(stored)))
      }
    }
  }, [])

  // 현재 용어 인덱스가 변경될 때마다 viewedTerms에 추가
  useEffect(() => {
    if (filteredTerms.length > 0 && currentTermIndex < filteredTerms.length) {
      const currentTerm = filteredTerms[currentTermIndex]
      if (currentTerm && currentTerm.term) {
        setViewedTerms(prev => new Set([...prev, currentTerm.term]))
      }
    }
  }, [currentTermIndex, filteredTerms])

  // 즐겨찾기 저장
  const toggleFavorite = (term: string) => {
    const newFavorites = new Set(favoriteTerms)
    if (newFavorites.has(term)) {
      newFavorites.delete(term)
    } else {
      newFavorites.add(term)
    }
    setFavoriteTerms(newFavorites)
    localStorage.setItem('favoriteTerms', JSON.stringify([...newFavorites]))
  }

  // 자동 재생 기능 (단순화)
  useEffect(() => {
    if (!autoPlay || !learnedData?.terms || filteredTerms.length === 0) {
      if (currentIntervalId) {
        clearTimeout(currentIntervalId)
        setCurrentIntervalId(null)
      }
      return
    }
    
    // 필터가 열려있으면 자동재생 중단 (목록은 열려있어도 자동재생 가능)
    if (showFilters) {
      if (currentIntervalId) {
        clearTimeout(currentIntervalId)
        setCurrentIntervalId(null)
      }
      return
    }

    // 기존 interval 정리
    if (currentIntervalId) {
      clearTimeout(currentIntervalId)
      setCurrentIntervalId(null)
    }

    // 자동재생 시작
    const startAutoPlay = () => {
      if (!autoPlay || showFilters) return
      
      // 다음 용어로 이동
      setCurrentTermIndex(prev => (prev + 1) % filteredTerms.length)
      
      // 다음 타이머 설정
      const nextTimer = setTimeout(startAutoPlay, autoPlayInterval)
      setCurrentIntervalId(nextTimer)
    }
    
    // 첫 번째 타이머 시작
    const firstTimer = setTimeout(startAutoPlay, autoPlayInterval)
    setCurrentIntervalId(firstTimer)

    return () => {
      if (currentIntervalId) {
        clearTimeout(currentIntervalId)
        setCurrentIntervalId(null)
      }
    }
  }, [autoPlay, autoPlayInterval, learnedData?.terms, filteredTerms.length, showFilters, showTermList])

  // 터치 제스처 처리
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      handleNextTerm()
    }
    if (isRightSwipe) {
      handlePrevTerm()
    }
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(selectedDate === date ? null : date)
    setCurrentTermIndex(0)
  }

  const handleNextTerm = () => {
    if (filteredTerms.length > 0) {
      setCurrentTermIndex((prev) => (prev + 1) % filteredTerms.length)
    }
  }

  const handlePrevTerm = () => {
    if (filteredTerms.length > 0) {
      setCurrentTermIndex((prev) => (prev - 1 + filteredTerms.length) % filteredTerms.length)
    }
  }

  const handleShuffle = () => {
    if (filteredTerms.length > 0) {
      setCurrentTermIndex(Math.floor(Math.random() * filteredTerms.length))
    }
  }

  // 안전한 랜덤 함수 (중복 클릭 방지)
  const handleShuffleSafe = () => {
    if (isProcessing || filteredTerms.length === 0) return
    setIsProcessing(true)
    handleShuffle()
    setTimeout(() => setIsProcessing(false), 300)
  }

  // 용어 난이도 계산 (용어 길이 기반)
  const getDifficulty = (term: string) => {
    if (term.length <= 3) return { level: '초급', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (term.length <= 6) return { level: '중급', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { level: '고급', color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  // 용어 목록 내보내기
  const exportTerms = () => {
    if (filteredTerms.length === 0) return
    
    try {
      const data = filteredTerms.map(term => ({
        용어: term.term,
        설명: term.description,
        학습일: term.learned_date,
        난이도: getDifficulty(term.term).level
      }))
      
      const csv = [
        Object.keys(data[0]).join(','),
        ...data.map(row => Object.values(row).map(v => `"${v}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `학습용어_${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      // 메모리 정리
      URL.revokeObjectURL(link.href)
    } catch (error) {
      console.error('내보내기 오류:', error)
    }
  }

  // 안전한 내보내기 함수 (중복 클릭 방지)
  const exportTermsSafe = () => {
    if (isProcessing) return
    setIsProcessing(true)
    exportTerms()
    setTimeout(() => setIsProcessing(false), 500)
  }

  // 웹뷰 터치 이벤트 핸들러
  const handleWebViewTouch = (callback: (e?: React.TouchEvent) => void) => (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    callback(e)
  }

  // 버튼 중복 클릭 방지
  const [isProcessing, setIsProcessing] = useState(false)
  
  // 필터 토글 함수
  const toggleFilters = () => {
    if (isProcessing) return
    setIsProcessing(true)
    setShowFilters(!showFilters)
    // 중복 클릭 방지를 위한 딜레이
    setTimeout(() => setIsProcessing(false), 300)
  }
  
  // 목록 토글 함수
  const toggleTermList = () => {
    if (isProcessing) return
    setIsProcessing(true)
    setShowTermList(!showTermList)
    // 중복 클릭 방지를 위한 딜레이
    setTimeout(() => setIsProcessing(false), 300)
  }
  
  // 이전/다음 용어 이동 함수 (중복 방지)
  const handlePrevTermSafe = () => {
    if (isProcessing || filteredTerms.length === 0) return
    setIsProcessing(true)
    handlePrevTerm()
    setTimeout(() => setIsProcessing(false), 200)
  }
  
  const handleNextTermSafe = () => {
    if (isProcessing || filteredTerms.length === 0) return
    setIsProcessing(true)
    handleNextTerm()
    setTimeout(() => setIsProcessing(false), 200)
  }
  
  // 자동재생 토글 함수 (중복 방지)
  const toggleAutoPlaySafe = () => {
    if (isProcessing || filteredTerms.length === 0) return
    setIsProcessing(true)
    setAutoPlay(!autoPlay)
    setTimeout(() => setIsProcessing(false), 300)
  }

  // 스크롤 감지 함수들
  const handleListTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.targetTouches[0].clientY)
    setTouchStartTime(Date.now())
    setIsScrolling(false)
  }

  const handleListTouchMove = (e: React.TouchEvent) => {
    const currentY = e.targetTouches[0].clientY
    const currentX = e.targetTouches[0].clientX
    const deltaY = Math.abs(currentY - touchStartY)
    const deltaX = Math.abs(currentX - (e.targetTouches[0].clientX - (currentY - touchStartY)))
    const currentTime = Date.now()
    const timeDiff = currentTime - touchStartTime
    
    // 수직 이동이 5px 이상이고 수평 이동이 적고, 빠른 움직임이면 스크롤로 간주 (더 민감하게)
    if (deltaY > 5 && deltaX < 10 && timeDiff < 300) {
      setIsScrolling(true)
    }
  }

  const handleListTouchEnd = () => {
    // 스크롤 중이었다면 더 긴 시간 후 스크롤 상태 해제
    if (isScrolling) {
      setTimeout(() => setIsScrolling(false), 1000)
    }
  }

  // 용어 선택 핸들러 (스크롤 상태 확인)
  const handleTermSelect = (index: number) => {
    // 스크롤 모드일 때는 용어 선택 방지
    if (scrollMode) {
      console.log('스크롤 모드 - 용어 선택 방지')
      return
    }
    
    // 스크롤 중일 때는 용어 선택 방지
    if (isScrolling) {
      console.log('스크롤 중 - 용어 선택 방지')
      return
    }
    
    // 목록에서 용어 선택 시 자동재생 일시 중단
    if (autoPlay) {
      setAutoPlay(false)
    }
    setCurrentTermIndex(index)
  }

  // 목록 크기 조절 함수
  const toggleListHeight = () => {
    if (isProcessing) return
    setIsProcessing(true)
    
    if (listHeight === 'default') {
      setListHeight('large')
    } else if (listHeight === 'large') {
      setListHeight('full')
    } else {
      setListHeight('default')
    }
    
    setTimeout(() => setIsProcessing(false), 300)
  }

  // 속도 조절 함수
  const changeSpeed = (newInterval: number) => {
    setAutoPlayInterval(newInterval)
    setShowSpeedControl(false)
    
    // 자동재생 중이면 즉시 새로운 속도로 재시작
    if (autoPlay) {
      if (currentIntervalId) {
        clearTimeout(currentIntervalId)
        setCurrentIntervalId(null)
      }
      
      // 자동재생 시작
      const startAutoPlay = () => {
        if (!autoPlay || showFilters) return
        
        // 다음 용어로 이동
        setCurrentTermIndex(prev => (prev + 1) % filteredTerms.length)
        
        // 다음 타이머 설정
        const nextTimer = setTimeout(startAutoPlay, newInterval)
        setCurrentIntervalId(nextTimer)
      }
      
      // 첫 번째 타이머 시작
      const firstTimer = setTimeout(startAutoPlay, newInterval)
      setCurrentIntervalId(firstTimer)
    }
  }

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80 text-lg font-medium whitespace-nowrap overflow-hidden">잠시만 기다려 주세요.</p>
        </div>
      </div>
    )
  }

  if (!learnedData?.terms || learnedData.terms.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold mb-2">학습한 용어가 없습니다</h3>
          <p className="text-white/70 mb-3 text-sm">
            AI 정보를 학습하고 용어를 등록한 후 여기서 확인해보세요!
          </p>
          <div className="text-xs text-white/50">
            총 학습 가능한 용어: 0개
          </div>
        </div>
      </div>
    )
  }

  const currentTerm = filteredTerms[currentTermIndex]
  const difficulty = currentTerm ? getDifficulty(currentTerm.term) : null

  return (
    <div className="glass rounded-2xl p-0 md:p-0 flex flex-col gap-1 md:gap-2">
      {/* 모바일 최적화 헤더 */}
      <div className="flex items-center justify-between px-2 md:px-3 pt-0 md:pt-0">
        <div className="flex items-center gap-2">
          <button
            onTouchStart={handleWebViewTouch(toggleFilters)}
            onClick={toggleFilters}
                         className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 touch-manipulation select-none min-h-[40px] min-w-[70px] justify-center webview-button ${
               showFilters
                 ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg ring-2 ring-purple-400/50 border border-purple-300/30'
                 : 'bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 text-white hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
             }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Filter className={`w-4 h-4 ${showFilters ? 'text-white' : 'text-white/80'}`} />
            <span className="inline">필터</span>
          </button>
          <button
            onTouchStart={handleWebViewTouch(toggleTermList)}
            onClick={toggleTermList}
                         className={`px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 touch-manipulation select-none min-h-[40px] min-w-[70px] justify-center webview-button ${
               showTermList
                 ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg ring-2 ring-purple-400/50 border border-purple-300/30'
                 : 'bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 text-white hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
             }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Menu className={`w-4 h-4 ${showTermList ? 'text-white' : 'text-white/80'}`} />
            <span className="inline">목록</span>
          </button>
        </div>
      </div>

      {/* 모바일 최적화 검색바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="용어나 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white/10 border-2 border-purple-600/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-sm shadow-lg shadow-purple-900/30"
        />
        {searchQuery && (
          <button
            onTouchStart={handleWebViewTouch(() => setSearchQuery(''))}
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white min-h-[36px] min-w-[36px] webview-button"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 모바일 최적화 필터 패널 */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/5 rounded-lg p-3 space-y-3"
          >
            {/* 날짜별 필터 */}
            {learnedData.learned_dates.length > 1 && (
              <div>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  날짜별 필터
                </h3>
                 
                 {/* 전체 버튼 - 제일 위에 배치 */}
                 <div className="mb-4">
                   <button
                     onTouchStart={handleWebViewTouch(() => { setSelectedDate(null); setCurrentTermIndex(0); })}
                     onClick={() => { setSelectedDate(null); setCurrentTermIndex(0); }}
                                           className={`px-3 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[40px] min-w-[80px] webview-button ${
                        selectedDate === null
                          ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md ring-2 ring-purple-400/50 border border-purple-300/40'
                          : 'bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
                      }`}
                     style={{ WebkitTapHighlightColor: 'transparent' }}
                   >
                     <div className="flex flex-col items-center">
                       <span className="text-sm font-bold">전체</span>
                       <span className="text-xs opacity-90">({learnedData.total_terms})</span>
                     </div>
                   </button>
                 </div>
                 
                 {/* 월별 구분된 날짜 필터 */}
                 {(() => {
                   // 날짜를 월별로 그룹화
                   const monthlyGroups = new Map<string, { month: string, dates: string[], totalTerms: number }>()
                   
                   learnedData.learned_dates.forEach(date => {
                     const dateObj = new Date(date)
                     const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
                     const monthLabel = dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
                     
                     if (!monthlyGroups.has(monthKey)) {
                       monthlyGroups.set(monthKey, { month: monthLabel, dates: [], totalTerms: 0 })
                     }
                     
                     const group = monthlyGroups.get(monthKey)!
                     group.dates.push(date)
                     group.totalTerms += (learnedData.terms_by_date[date] || []).length
                   })
                   
                   // 월별로 정렬 (최신순)
                   const sortedMonths = Array.from(monthlyGroups.entries()).sort((a, b) => b[0].localeCompare(a[0]))
                   
                   return sortedMonths.map(([monthKey, group]) => (
                     <div key={monthKey} className="mb-4">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                         <span className="text-sm font-medium text-white/80">{group.month}</span>
                         <span className="text-xs text-white/50">({group.totalTerms}개)</span>
                       </div>
                       <div className="flex flex-wrap gap-1.5 ml-4">
                         {group.dates.map((date) => {
                           const dateTerms = learnedData.terms_by_date[date] || []
                           const formattedDate = new Date(date).toLocaleDateString('ko-KR', {
                             month: 'short',
                             day: 'numeric'
                           })
                           return (
                             <button
                               key={date}
                               onTouchStart={handleWebViewTouch(() => { setSelectedDate(date); setCurrentTermIndex(0); })}
                               onClick={() => { setSelectedDate(date); setCurrentTermIndex(0); }}
                               className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all touch-manipulation select-none min-h-[36px] min-w-[44px] webview-button ${
                                 selectedDate === date
                                   ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md ring-2 ring-green-400/30'
                                   : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20'
                               }`}
                               style={{ WebkitTapHighlightColor: 'transparent' }}
                             >
                               <div className="flex flex-col items-center">
                                 <span className="text-xs font-bold leading-tight">{formattedDate}</span>
                                 <span className="text-xs opacity-90 leading-tight">({dateTerms.length})</span>
                               </div>
                             </button>
                           )
                         })}
                       </div>
                     </div>
                   ))
                 })()}
               </div>
             )}
            
                         {/* 정렬 및 필터 옵션 */}
             <div className="flex flex-wrap gap-2">
               {/* 정렬 옵션들 */}
               <button
                 onTouchStart={handleWebViewTouch(() => setSortBy('date'))}
                 onClick={() => setSortBy('date')}
                 className={`px-3 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[40px] min-w-[80px] webview-button ${
                   sortBy === 'date'
                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md ring-2 ring-purple-400/50 border border-purple-300/40'
                     : 'bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 🕒 최신순
               </button>
               
               <button
                 onTouchStart={handleWebViewTouch(() => setSortBy('alphabet'))}
                 onClick={() => setSortBy('alphabet')}
                 className={`px-3 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[40px] min-w-[80px] webview-button ${
                   sortBy === 'alphabet'
                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md ring-2 ring-purple-400/50 border border-purple-300/40'
                     : 'bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 🔤 가나다순
               </button>
               
               <button
                 onTouchStart={handleWebViewTouch(() => setSortBy('length'))}
                 onClick={() => setSortBy('length')}
                 className={`px-3 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[40px] min-w-[80px] webview-button ${
                   sortBy === 'length'
                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md ring-2 ring-purple-400/50 border border-purple-300/40'
                     : 'bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 📏 길이순
               </button>
               
               {/* 즐겨찾기만 버튼 */}
               <button
                 onTouchStart={handleWebViewTouch(() => {
                   if (isProcessing) return
                   setIsProcessing(true)
                   setShowFavoritesOnly(!showFavoritesOnly)
                   setTimeout(() => setIsProcessing(false), 300)
                 })}
                 onClick={() => {
                   if (isProcessing) return
                   setIsProcessing(true)
                   setShowFavoritesOnly(!showFavoritesOnly)
                   setTimeout(() => setIsProcessing(false), 300)
                 }}
                 className={`px-3 py-2 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[40px] min-w-[80px] webview-button flex items-center gap-2 ${
                   showFavoritesOnly
                     ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md ring-2 ring-green-400/30 border border-green-300/40'
                     : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 <Star className={`w-3 h-3 ${showFavoritesOnly ? 'text-yellow-400' : 'text-white/70'}`} />
                 즐겨찾기만
               </button>
               
               {/* 랜덤 버튼 */}
               <button
                 onTouchStart={handleWebViewTouch(handleShuffleSafe)}
                 onClick={handleShuffleSafe}
                 className="px-3 py-2 bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[40px] min-w-[80px] webview-button flex items-center gap-2"
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 <Shuffle className="w-3 h-3" />
                 랜덤
               </button>
               
               {/* 내보내기 버튼 */}
               <button
                 onTouchStart={handleWebViewTouch(exportTermsSafe)}
                 onClick={exportTermsSafe}
                 className="px-3 py-2 bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[40px] min-w-[80px] webview-button flex items-center gap-2"
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 <Download className="w-3 h-3" />
                 내보내기
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모바일 최적화 현재 용어 카드 */}
      {filteredTerms.length > 0 && currentTerm && (
        <motion.div
          key={currentTerm.term + currentTerm.learned_date}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-purple-950/70 via-purple-900/80 to-purple-950/70 backdrop-blur-2xl rounded-xl p-4 md:p-6 border-2 border-purple-600/50 shadow-2xl shadow-purple-900/40"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 진행률 표시 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">{currentTermIndex + 1} / {filteredTerms.length}</span>
              <span className="text-sm text-green-400 font-bold">
                {(() => {
                  // 즐겨찾기 필터가 활성화된 경우, 즐겨찾기 중에서만 학습한 개수 계산
                  if (showFavoritesOnly) {
                    const favoriteViewedTerms = Array.from(viewedTerms).filter(term => favoriteTerms.has(term))
                    return `${favoriteViewedTerms.length}개 학습완료`
                  }
                  return `${viewedTerms.size}개 학습완료`
                })()}
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(() => {
                    if (showFavoritesOnly) {
                      const favoriteViewedTerms = Array.from(viewedTerms).filter(term => favoriteTerms.has(term))
                      return filteredTerms.length > 0 ? (favoriteViewedTerms.length / filteredTerms.length) * 100 : 0
                    }
                    return filteredTerms.length > 0 ? (viewedTerms.size / filteredTerms.length) * 100 : 0
                  })()}%` 
                }}
              />
            </div>
          </div>

          {/* 용어 정보 */}
          <div className="flex items-center justify-between mb-4">
            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${difficulty?.bg} ${difficulty?.color}`}>
              {difficulty?.level}
            </div>
            <button
              onClick={() => toggleFavorite(currentTerm.term)}
              className={`p-3 rounded-lg transition-all touch-manipulation select-none min-h-[48px] min-w-[48px] flex items-center justify-center webview-button ${
                favoriteTerms.has(currentTerm.term)
                  ? 'text-yellow-400 bg-yellow-500/20'
                  : 'text-white/50 hover:text-yellow-400 hover:bg-yellow-500/10 active:bg-yellow-500/20'
              }`}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Star className="w-5 h-5" fill={favoriteTerms.has(currentTerm.term) ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* 용어 내용 */}
          <div className="text-center mb-4">
            <div className="text-2xl md:text-3xl font-bold text-white mb-3 break-words">{currentTerm.term}</div>
            <div className="text-white/80 text-base md:text-lg leading-relaxed break-words">{currentTerm.description}</div>
          </div>

          {/* 학습일 정보 */}
          <div className="flex items-center justify-center text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>학습일: {currentTerm.learned_date}</span>
            </div>
          </div>

          {/* 스와이프 안내 */}
          <div className="text-center mt-4 text-white/40 text-xs">
            ← 스와이프하여 다음/이전 용어 보기 →
          </div>
        </motion.div>
      )}

      {/* 모바일 최적화 네비게이션 */}
      {filteredTerms.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-white/70 text-sm">
            {currentTermIndex + 1} / {filteredTerms.length}
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <button
                onTouchStart={handleWebViewTouch(toggleAutoPlaySafe)}
                onClick={toggleAutoPlaySafe}
                className={`p-3 rounded-xl transition-all font-medium flex items-center gap-2 touch-manipulation select-none min-h-[48px] webview-button ${
                  autoPlay
                    ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30'
                }`}
                disabled={filteredTerms.length === 0}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span className="hidden sm:inline">{autoPlay ? '정지' : '자동재생'}</span>
              </button>
              
              {/* 속도 조절 버튼 */}
              <button
                onTouchStart={handleWebViewTouch(() => {
                  if (isProcessing) return
                  setIsProcessing(true)
                  setShowSpeedControl(prev => !prev)
                  setTimeout(() => setIsProcessing(false), 800)
                })}
                onClick={() => {
                  if (isProcessing) return
                  setIsProcessing(true)
                  setShowSpeedControl(prev => !prev)
                  setTimeout(() => setIsProcessing(false), 800)
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-blue-600 transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                ⚙️
              </button>
              
              {/* 속도 조절 드롭다운 */}
              {showSpeedControl && (
                <div className="absolute top-full left-0 mt-2 bg-white/10 backdrop-blur-xl rounded-lg p-3 border border-white/20 z-10 min-w-[140px]">
                  <div className="text-white text-sm font-medium mb-2">재생 속도</div>
                  <div className="space-y-2">
                    <button
                      onClick={() => changeSpeed(1000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 1000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      1초
                    </button>
                    <button
                      onClick={() => changeSpeed(2000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 2000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      2초
                    </button>
                    <button
                      onClick={() => changeSpeed(3000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 3000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      3초
                    </button>
                    <button
                      onClick={() => changeSpeed(5000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 5000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      5초
                    </button>
                    <button
                      onClick={() => changeSpeed(7000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 7000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      7초
                    </button>
                    <button
                      onClick={() => changeSpeed(10000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 10000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      10초
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* 자동재생 상태 표시 */}
            {autoPlay && (
              <div className="flex items-center justify-center w-16 h-16 bg-green-500/30 text-green-300 rounded-xl border border-green-500/50">
                <span className="text-sm font-medium">재생중</span>
              </div>
            )}
            
            <button
              onTouchStart={handleWebViewTouch(handlePrevTermSafe)}
              onClick={handlePrevTermSafe}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 active:from-blue-700 active:to-purple-700 transition-all font-medium touch-manipulation select-none min-h-[48px] min-w-[48px] flex items-center justify-center webview-button"
              disabled={filteredTerms.length === 0}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onTouchStart={handleWebViewTouch(handleNextTermSafe)}
              onClick={handleNextTermSafe}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 active:from-blue-700 active:to-purple-700 transition-all font-medium touch-manipulation select-none min-h-[48px] min-w-[48px] flex items-center justify-center webview-button"
              disabled={filteredTerms.length === 0}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 모바일 최적화 용어 목록 */}
      <AnimatePresence>
        {showTermList && (
                     <motion.div
             initial={{ opacity: 0, height: 0 }}
             animate={{ opacity: 1, height: 'auto' }}
             exit={{ opacity: 0, height: 0 }}
             className="bg-gradient-to-br from-purple-950/60 via-purple-900/70 to-purple-950/60 backdrop-blur-2xl rounded-xl p-4 border-2 border-purple-600/50 shadow-2xl shadow-purple-900/50"
           >
                         <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  전체 용어 목록 ({filteredTerms.length}개)
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      onTouchStart={handleWebViewTouch(() => setScrollMode(!scrollMode))}
                      onClick={() => setScrollMode(!scrollMode)}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all touch-manipulation select-none min-h-[32px] min-w-[60px] webview-button ${
                        scrollMode
                          ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                          : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {scrollMode ? '📱 스크롤' : (
                        <div className="text-center leading-tight">
                          <div>스크롤 고정</div>
                          <div className="text-[10px] opacity-80">(1초 이상 클릭)</div>
                        </div>
                      )}
                    </button>
                    
                    {/* 1초 이상 클릭 안내 문구 제거 */}
                  </div>
                  <button
                    onTouchStart={handleWebViewTouch(toggleListHeight)}
                    onClick={toggleListHeight}
                    className="px-2 py-1 bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 rounded text-xs font-medium transition-all touch-manipulation select-none min-h-[32px] min-w-[40px] webview-button"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {listHeight === 'default' ? '🔽' : listHeight === 'large' ? '⏫' : '⏬'}
                  </button>
                </div>
              </div>
                                                       <div 
                   className={`overflow-y-auto space-y-2 ${
                     listHeight === 'default' ? 'max-h-64' : 
                     listHeight === 'large' ? 'max-h-96' : 
                     'max-h-[80vh]'
                   }`}
                   onTouchStart={handleListTouchStart}
                   onTouchMove={handleListTouchMove}
                   onTouchEnd={handleListTouchEnd}
                 >
               {filteredTerms.map((term, index) => {
                const termDifficulty = getDifficulty(term.term)
                return (
                  <motion.div
                    key={`${term.term}_${term.learned_date}_${term.info_index}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }}
                                         className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 touch-manipulation select-none min-h-[60px] webview-button ${
                       index === currentTermIndex
                         ? 'bg-gradient-to-br from-purple-600/30 via-purple-500/40 to-purple-600/30 border border-purple-400/60 shadow-lg shadow-purple-500/30 scale-[1.02] ring-1 ring-purple-400/50'
                         : 'bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40 hover:border-purple-400/60 hover:shadow-lg hover:shadow-purple-500/20 hover:scale-[1.01]'
                     }`}
                                                              onTouchStart={handleWebViewTouch(() => handleTermSelect(index))}
                    onClick={() => handleTermSelect(index)}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    {/* 배경 그라데이션 효과 */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      index === currentTermIndex
                        ? 'from-blue-500/10 via-purple-500/10 to-indigo-500/10'
                        : 'from-transparent via-transparent to-transparent'
                    } opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* 선택된 경우 빛나는 효과 */}
                    {index === currentTermIndex && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 animate-pulse rounded-xl" />
                    )}
                    
                    {/* 카드 내용 */}
                    <div className="relative z-10 p-2.5 h-full flex flex-col justify-between">
                      {/* 상단: 용어명과 즐겨찾기 */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {/* 용어 아이콘 */}
                            <div className={`w-4 h-4 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${
                              termDifficulty.level === '초급' ? 'bg-gradient-to-br from-green-500/25 to-emerald-500/25 text-green-300 border border-green-400/30' :
                              termDifficulty.level === '중급' ? 'bg-gradient-to-br from-yellow-500/25 to-amber-500/25 text-yellow-300 border border-yellow-400/30' :
                              'bg-gradient-to-br from-red-500/25 to-pink-500/25 text-red-300 border border-red-400/30'
                            }`}>
                              <Brain className="w-2 h-2" />
                            </div>
                            
                                                         {/* 용어명 - 더 크고 눈에 띄게 */}
                             <h3 className="font-bold text-white text-base leading-tight break-words line-clamp-1 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                               {term.term}
                             </h3>
                          </div>
                          
                                                     {/* 난이도 배지 - 작게 표시 */}
                           <div className={`inline-flex items-center px-1 py-0.5 rounded-full text-[10px] font-medium shadow-sm opacity-70 ${
                             termDifficulty.level === '초급' ? 'bg-gradient-to-r from-green-500/15 to-emerald-500/15 text-green-300 border border-green-400/20' :
                             termDifficulty.level === '중급' ? 'bg-gradient-to-r from-yellow-500/15 to-amber-500/15 text-yellow-300 border border-yellow-400/20' :
                             'bg-gradient-to-r from-red-500/15 to-pink-500/15 text-red-300 border border-red-400/20'
                           }`}>
                             <div className={`w-0.5 h-0.5 rounded-full mr-1 shadow-sm ${
                               termDifficulty.level === '초급' ? 'bg-green-400' :
                               termDifficulty.level === '중급' ? 'bg-yellow-400' :
                               'bg-red-400'
                             }`} />
                             {termDifficulty.level}
                           </div>
                        </div>
                        
                        {/* 즐겨찾기 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(term.term)
                        }}
                          className={`p-1 rounded-lg flex-shrink-0 touch-manipulation select-none min-h-[28px] min-w-[28px] flex items-center justify-center webview-button transition-all duration-200 shadow-sm ${
                          favoriteTerms.has(term.term)
                              ? 'text-yellow-300 bg-gradient-to-br from-yellow-500/25 to-amber-500/25 border border-yellow-400/40 shadow-md shadow-yellow-500/20'
                              : 'text-white/50 hover:text-yellow-300 hover:bg-gradient-to-br hover:from-yellow-500/10 hover:to-amber-500/10 border border-transparent hover:border-yellow-400/25 hover:shadow-sm'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Star className="w-3 h-3" fill={favoriteTerms.has(term.term) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                      
                                             {/* 중간: 설명 - 더 눈에 띄게 */}
                       <div className="mb-1">
                         <p className="text-white/90 text-sm leading-relaxed line-clamp-2 break-words font-medium">
                           {term.description}
                         </p>
                       </div>
                      
                      {/* 하단: 메타데이터 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-white/50 text-xs">
                          <Calendar className="w-2.5 h-2.5" />
                          <span className="font-medium">{term.learned_date}</span>
                      </div>
                        
                        {/* 선택된 경우 진행 표시기 */}
                        {index === currentTermIndex && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse shadow-sm" />
                            <span className="text-blue-200 text-xs font-semibold">현재</span>
                    </div>
                        )}
                      </div>
                    </div>
                    
                    {/* 호버 시 추가 효과 */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" />
                    
                    {/* 선택된 경우 상단 표시기 */}
                    {index === currentTermIndex && (
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-t-xl" />
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모바일 최적화 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-lg p-2 md:p-3 border border-white/10"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-blue-300" />
            <div>
              <div className="text-white font-semibold text-xs md:text-sm">{filteredTerms.length}</div>
              <div className="text-white/60 text-xs">표시된 용어</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-lg p-2 md:p-3 border border-white/10"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-green-300" />
            <div>
              <div className="text-white font-semibold text-xs md:text-sm">{favoriteTerms.size}</div>
              <div className="text-white/60 text-xs">즐겨찾기</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-lg p-2 md:p-3 border border-white/10"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
            <div>
              <div className="text-white font-semibold text-xs md:text-sm">
                {Math.round((viewedTerms.size / filteredTerms.length) * 100)}%
              </div>
              <div className="text-white/60 text-xs">학습진행률</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-xl rounded-lg p-2 md:p-3 border border-white/10"
        >
          <div className="flex items-center gap-1.5 md:gap-2">
            <Brain className="w-4 h-4 md:w-5 md:h-5 text-emerald-300" />
            <div>
              <div className="text-white font-semibold text-xs md:text-sm">{viewedTerms.size}</div>
              <div className="text-white/60 text-xs">학습완료</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LearnedTermsSection 

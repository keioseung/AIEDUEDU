'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { BookOpen, Calendar, Brain, Target, Trophy, TrendingUp, Search, Star, Download, Filter, Shuffle, Bookmark, ChevronLeft, ChevronRight, Play, Pause, X, Menu, Settings, RefreshCw } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
import { t, getCurrentLanguage } from '@/lib/i18n'

interface LearnedTermsSectionProps {
  sessionId: string
  currentLanguage: 'ko' | 'en' | 'ja' | 'zh'
  selectedDate?: string
  onDateChange?: (date: string) => void
}

interface Term {
  term: string
  term_en?: string
  term_ja?: string
  term_zh?: string
  description: string
  description_en?: string
  description_ja?: string
  description_zh?: string
  learned_date?: string  // 기존 용어학습용 (선택적)
  date?: string          // 새로운 모든 용어용 (선택적)
  info_index: number
  title?: string         // AI정보 카드 제목
  category?: string      // AI정보 카드 카테고리
}

interface LearnedTermsResponse {
  terms: Term[]
  total_terms: number
  learned_dates?: string[]
  terms_by_date?: Record<string, Term[]>
}

interface AllTermsResponse {
  terms: Term[]
  total_terms: number
  message: string
}

function LearnedTermsSection({ sessionId, currentLanguage, selectedDate: propSelectedDate, onDateChange }: LearnedTermsSectionProps) {
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
  const [isShuffling, setIsShuffling] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [localLanguage, setLocalLanguage] = useState(currentLanguage)

  const queryClient = useQueryClient()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // 언어 변경 감지 및 즉시 반영
  useEffect(() => {
    setLocalLanguage(currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = getCurrentLanguage()
      setLocalLanguage(newLanguage)
    }

    const handleForceUpdate = (event: CustomEvent) => {
      if (event.detail?.language) {
        setLocalLanguage(event.detail.language)
      }
    }

    const handleLanguageChanged = (event: CustomEvent) => {
      if (event.detail?.language) {
        setLocalLanguage(event.detail.language)
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('forceUpdate', handleForceUpdate as EventListener)
    window.addEventListener('languageChanged', handleLanguageChanged as EventListener)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('forceUpdate', handleForceUpdate as EventListener)
      window.removeEventListener('languageChanged', handleLanguageChanged as EventListener)
    }
  }, [])
  
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

  // selectedDate가 변경될 때 currentTermIndex를 0으로 리셋하지 않음 (학습 상태 유지)
  // useEffect(() => {
  //   setCurrentTermIndex(0)
  // }, [selectedDate])

  // 컴포넌트 마운트 시 저장된 학습 상태 복원
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // 저장된 학습 상태 불러오기
        const savedState = localStorage.getItem(`termsLearningState_${sessionId}`)
        if (savedState) {
          const parsedState = JSON.parse(savedState)
          if (parsedState.currentTermIndex !== undefined) {
            setCurrentTermIndex(parsedState.currentTermIndex)
          }
          if (parsedState.viewedTerms) {
            setViewedTerms(new Set(parsedState.viewedTerms))
          }
          if (parsedState.selectedDate !== undefined) {
            setSelectedDate(parsedState.selectedDate)
          }
          if (parsedState.searchQuery !== undefined) {
            setSearchQuery(parsedState.searchQuery)
          }
          if (parsedState.sortBy !== undefined) {
            setSortBy(parsedState.sortBy)
          }
          if (parsedState.showFavoritesOnly !== undefined) {
            setShowFavoritesOnly(parsedState.showFavoritesOnly)
          }
        } else {
          // 저장된 상태가 없으면 기본값 설정
          setSelectedDate(null)
          setShowFavoritesOnly(false)
          setSearchQuery('')
          setSortBy('date')
        }
      } catch (error) {
        console.error('학습 상태 복원 오류:', error)
        // 오류 발생 시 기본값 설정
        setSelectedDate(null)
        setShowFavoritesOnly(false)
        setSearchQuery('')
        setSortBy('date')
      }
    }
  }, [sessionId])

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortDropdown) {
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortDropdown])
  
  const { data: allTermsData, isLoading } = useQuery<AllTermsResponse>({
    queryKey: ['all-terms', currentLanguage],
    queryFn: async () => {
      const response = await aiInfoAPI.getAllTerms(currentLanguage)
      return response.data
    },
    enabled: true,
    staleTime: 15 * 60 * 1000, // 15분간 데이터를 신선하게 유지 (기존 5분에서 증가)
    gcTime: 30 * 60 * 1000, // 30분간 캐시 유지 (기존 10분에서 증가)
    refetchOnWindowFocus: false, // 윈도우 포커스 시 새로고침 비활성화
    refetchOnMount: false, // 컴포넌트 마운트 시 새로고침 비활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 새로고침 비활성화
    retry: 1, // 재시도 횟수 제한
    retryDelay: 1000, // 재시도 간격 1초
  })

  // 필터링 및 정렬된 용어 목록
  const filteredTerms = (() => {
    if (!allTermsData?.terms) return []
    
    let terms = selectedDate 
      ? allTermsData.terms.filter(term => term.date === selectedDate)
      : allTermsData.terms

    // 중복 제거 로직 제거 - 모든 용어 표시 (200개)

    // 날짜가 선택된 경우 해당 날짜의 용어만 표시
    if (selectedDate) {
      terms = terms.filter(term => (term.date || term.learned_date) === selectedDate)
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
        return terms.sort((a, b) => {
          const dateA = a.date || a.learned_date || ''
          const dateB = b.date || b.learned_date || ''
          if (!dateA || !dateB) return 0
          return new Date(dateB).getTime() - new Date(dateA).getTime()
        })
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

  // 학습 상태가 변경될 때마다 자동 저장
  useEffect(() => {
    saveLearningState()
  }, [currentTermIndex, viewedTerms, selectedDate, searchQuery, sortBy, showFavoritesOnly])

  // 학습 상태 저장 함수
  const saveLearningState = () => {
    if (typeof window !== 'undefined') {
      try {
        const stateToSave = {
          currentTermIndex,
          viewedTerms: Array.from(viewedTerms),
          selectedDate,
          searchQuery,
          sortBy,
          showFavoritesOnly,
          timestamp: Date.now()
        }
        localStorage.setItem(`termsLearningState_${sessionId}`, JSON.stringify(stateToSave))
      } catch (error) {
        console.error('학습 상태 저장 오류:', error)
      }
    }
  }

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
    if (!autoPlay || !allTermsData?.terms || filteredTerms.length === 0) {
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
  }, [autoPlay, autoPlayInterval, allTermsData?.terms, filteredTerms.length, showFilters, showTermList])

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
    // currentTermIndex를 0으로 리셋하지 않음 (학습 상태 유지)
    // setCurrentTermIndex(0)
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
    if (isShuffling || filteredTerms.length === 0) return
    
    // 즉시 상태 변경으로 중복 클릭 방지
    setIsShuffling(true)
    
    // 약간의 지연 후 실제 셔플 실행 (터치 이벤트 안정화)
    setTimeout(() => {
      handleShuffle()
      // 셔플 완료 후 상태 복원
      setTimeout(() => setIsShuffling(false), 200)
    }, 50)
  }

  // 용어 난이도 계산 (용어 길이 기반)
  const getDifficulty = (term: string) => {
    if (term.length <= 3) return { level: t('terms.card.difficulty.beginner'), color: 'text-green-400', bg: 'bg-green-500/20' }
    if (term.length <= 6) return { level: t('terms.card.difficulty.intermediate'), color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { level: t('terms.card.difficulty.advanced'), color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  // 용어 목록 내보내기
  const exportTerms = () => {
    if (filteredTerms.length === 0) return
    
    try {
      const data = filteredTerms.map(term => ({
        용어: term.term,
        설명: term.description,
        [t('terms.card.learning.date')]: term.date,
        [t('terms.list.difficulty')]: getDifficulty(term.term).level
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
    if (isExporting) return
    setIsExporting(true)
    exportTerms()
    setTimeout(() => setIsExporting(false), 500)
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
  
  // 학습 상태 초기화 함수
  const resetLearningState = () => {
    if (isProcessing) return
    setIsProcessing(true)
    
    // 학습 진행 상태 초기화
    setViewedTerms(new Set())
    setCurrentTermIndex(0)
    
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
        <div className="flex flex-col items-center justify-center text-white -mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
                          <p className="text-white/80 text-lg font-medium whitespace-nowrap">{t('terms.tab.loading')}</p>
        </div>
      </div>
    )
  }

  if (!allTermsData?.terms || allTermsData.terms.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-white">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold mb-2">등록된 용어가 없습니다</h3>
          <p className="text-white/70 mb-3 text-sm">
            AI정보 탭에서 정보카드를 등록하면 관련 용어들이 표시됩니다
          </p>
          <div className="text-xs text-white/50">
            총 등록된 용어: 0개
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
            <span className="inline">{t('terms.filter.button')}</span>
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
            <span className="inline">{t('terms.list.button')}</span>
          </button>
          
          {/* 학습 상태 초기화 버튼 */}
          <button
            onTouchStart={handleWebViewTouch(resetLearningState)}
            onClick={resetLearningState}
            className="px-3 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-1.5 touch-manipulation select-none min-h-[40px] min-w-[90px] justify-center webview-button bg-gradient-to-br from-purple-800/40 via-purple-700/50 to-purple-800/40 text-white hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="inline text-xs">
              {localLanguage === 'ko' ? '초기화' :
               localLanguage === 'en' ? 'Reset' :
               localLanguage === 'ja' ? 'リセット' :
               '重置'}
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 최적화 검색바 */}
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 flex items-center pointer-events-none z-10">
          <Search className="text-white text-sm font-light drop-shadow-sm" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          placeholder={t('terms.search.placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 border-2 border-purple-600/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-lg shadow-purple-900/30 backdrop-blur-xl"
        />
        {searchQuery && (
          <button
            onTouchStart={handleWebViewTouch(() => setSearchQuery(''))}
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-0 bottom-0 flex items-center p-2 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
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
            {allTermsData.terms.length > 0 && (
              <div>
                <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('terms.tab.filter.date.filter')}
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
                       <span className="text-sm font-bold">{t('terms.tab.filter.all')}</span>
                       <span className="text-xs opacity-90">({allTermsData.total_terms})</span>
                     </div>
                   </button>
                 </div>
                 
                 {/* 월별 구분된 날짜 필터 */}
                 {(() => {
                   // 날짜를 월별로 그룹화
                   const monthlyGroups = new Map<string, { month: string, dates: string[], totalTerms: number }>()
                   
                   // 모든 용어에서 고유한 날짜 추출 (undefined 제거)
                   const uniqueDates = [...new Set(allTermsData.terms.map(term => term.date).filter((date): date is string => Boolean(date)))].sort().reverse()
                   
                   uniqueDates.forEach(date => {
                     const dateObj = new Date(date)
                     const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`
                     const monthLabel = (() => {
                       if (localLanguage === 'en') {
                         return dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
                       } else if (localLanguage === 'ja') {
                         return dateObj.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })
                       } else if (localLanguage === 'zh') {
                         return dateObj.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })
                       } else {
                         return dateObj.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
                           .replace('년', t('terms.date.filter.year'))
                           .replace('월', t('terms.date.filter.month'))
                       }
                     })()
                     
                     if (!monthlyGroups.has(monthKey)) {
                       monthlyGroups.set(monthKey, { month: monthLabel, dates: [], totalTerms: 0 })
                     }
                     
                     const group = monthlyGroups.get(monthKey)!
                     group.dates.push(date)
                     group.totalTerms += allTermsData.terms.filter(term => term.date === date).length
                   })
                   
                   // 월별로 정렬 (최신순)
                   const sortedMonths = Array.from(monthlyGroups.entries()).sort((a, b) => b[0].localeCompare(a[0]))
                   
                   return sortedMonths.map(([monthKey, group]) => (
                     <div key={monthKey} className="mb-4">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                         <span className="text-sm font-medium text-white/80">{group.month}</span>
                         <span className="text-xs text-white/50">({t('terms.date.filter.items.count', { count: group.totalTerms })})</span>
                       </div>
                       <div className="flex flex-wrap gap-1.5 ml-4">
                         {group.dates.map((date) => {
                           const dateTerms = allTermsData.terms.filter(term => term.date === date)
                           const formattedDate = (() => {
                             if (localLanguage === 'en') {
                               return new Date(date).toLocaleDateString('en-US', {
                                 month: 'short',
                                 day: 'numeric'
                               })
                             } else if (localLanguage === 'ja') {
                               return new Date(date).toLocaleDateString('ja-JP', {
                                 month: 'short',
                                 day: 'numeric'
                               })
                             } else if (localLanguage === 'zh') {
                               return new Date(date).toLocaleDateString('zh-CN', {
                                 month: 'short',
                                 day: 'numeric'
                               })
                             } else {
                               return new Date(date).toLocaleDateString('ko-KR', {
                                 month: 'short',
                                 day: 'numeric'
                               }).replace('월', t('terms.date.filter.month')).replace('일', t('terms.date.filter.day'))
                             }
                           })()
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
             <div className="flex justify-center gap-2">
               {/* 정렬순 드롭다운 버튼 */}
               <div className="relative">
                 <button
                   onTouchStart={handleWebViewTouch(() => setShowSortDropdown(!showSortDropdown))}
                   onClick={() => setShowSortDropdown(!showSortDropdown)}
                   className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 text-white px-3 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 border border-purple-400/30 min-h-[44px] min-w-[80px]"
                   style={{ WebkitTapHighlightColor: 'transparent' }}
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                   <span className="relative z-10 flex items-center gap-2">
                     <Settings className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                     <span className="text-xs font-medium">{t('terms.tab.filter.sort')}</span>
                   </span>
                 </button>

                 {/* 정렬 옵션 드롭다운 */}
                 <AnimatePresence>
                   {showSortDropdown && (
                     <motion.div
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute top-full mt-2 z-20 bg-gradient-to-br from-black/95 via-slate-900/98 to-black/95 backdrop-blur-2xl rounded-2xl p-3 border border-purple-500/40 shadow-xl shadow-black/60 w-full min-w-[200px]"
                       style={{
                         left: '0',
                         right: '0'
                       }}
                     >
                       <div className="text-center mb-2">
                         <div className="text-white/95 text-xs font-semibold mb-1">{t('terms.tab.filter.sort.options')}</div>
                         <div className="w-full bg-white/20 rounded-full h-0.5">
                           <div className="bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 h-0.5 rounded-full transition-all duration-300" />
                         </div>
                       </div>
                       
                       <div className="space-y-1.5">
                         <button
                           onClick={() => {
                             setSortBy('date')
                             setShowSortDropdown(false)
                           }}
                           className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 group border ${
                             sortBy === 'date'
                               ? 'bg-gradient-to-r from-emerald-600/30 via-emerald-500/35 to-emerald-600/30 border-emerald-400/50'
                               : 'bg-gradient-to-r from-slate-800/60 via-slate-700/70 to-slate-800/60 hover:from-slate-700/80 hover:via-slate-600/85 hover:to-slate-700/80 border-slate-600/50 hover:border-slate-500/70'
                           }`}
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex-1 min-w-0">
                               <div className={`font-semibold text-xs leading-tight flex items-center gap-2 ${
                                 sortBy === 'date'
                                   ? 'text-emerald-100 group-hover:text-emerald-50'
                                   : 'text-white group-hover:text-purple-200'
                               } transition-colors`}>
                                 {t('terms.tab.filter.sort.by.date')}
                               </div>
                               <div className={`text-xs mt-0.5 leading-tight ${
                                 sortBy === 'date'
                                   ? 'text-emerald-100/80'
                                   : 'text-white/90'
                               }`}>
                                 {t('terms.tab.filter.sort.by.date.description')}
                               </div>
                             </div>
                             <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                               <ChevronRight className="w-3 h-3 text-purple-300" />
                             </div>
                           </div>
                         </button>
                         
                         <button
                           onClick={() => {
                             setSortBy('alphabet')
                             setShowSortDropdown(false)
                           }}
                           className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 group border ${
                             sortBy === 'alphabet'
                               ? 'bg-gradient-to-r from-emerald-600/30 via-emerald-500/35 to-emerald-600/30 border-emerald-400/50'
                               : 'bg-gradient-to-r from-slate-800/60 via-slate-700/70 to-slate-800/60 hover:from-slate-700/80 hover:via-slate-600/85 hover:to-slate-700/80 border-slate-600/50 hover:border-slate-500/70'
                           }`}
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex-1 min-w-0">
                               <div className={`font-semibold text-xs leading-tight flex items-center gap-2 ${
                                 sortBy === 'alphabet'
                                   ? 'text-emerald-100 group-hover:text-emerald-50'
                                   : 'text-white group-hover:text-purple-200'
                               } transition-colors`}>
                                 {t('terms.tab.filter.sort.by.alphabet')}
                               </div>
                               <div className={`text-xs mt-0.5 leading-tight ${
                                 sortBy === 'alphabet'
                                   ? 'text-emerald-100/80'
                                   : 'text-white/90'
                               }`}>
                                 {t('terms.tab.filter.sort.by.alphabet.description')}
                               </div>
                             </div>
                             <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                               <ChevronRight className="w-3 h-3 text-purple-300" />
                             </div>
                           </div>
                         </button>
                         
                         <button
                           onClick={() => {
                             setSortBy('length')
                             setShowSortDropdown(false)
                           }}
                           className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 group border ${
                             sortBy === 'length'
                               ? 'bg-gradient-to-r from-emerald-600/30 via-emerald-500/35 to-emerald-600/30 border-emerald-400/50'
                               : 'bg-gradient-to-r from-slate-800/60 via-slate-700/70 to-slate-800/60 hover:from-slate-700/80 hover:via-slate-600/85 hover:to-slate-700/80 border-slate-600/50 hover:border-slate-500/70'
                           }`}
                         >
                           <div className="flex items-center justify-between">
                             <div className="flex-1 min-w-0">
                               <div className={`font-semibold text-xs leading-tight flex items-center gap-2 ${
                                 sortBy === 'length'
                                   ? 'text-emerald-100 group-hover:text-emerald-50'
                                   : 'text-white group-hover:text-purple-200'
                               } transition-colors`}>
                                 {t('terms.tab.filter.sort.by.length')}
                               </div>
                               <div className={`text-xs mt-0.5 leading-tight ${
                                 sortBy === 'length'
                                   ? 'text-emerald-100/80'
                                   : 'text-white/90'
                               }`}>
                                 {t('terms.tab.filter.sort.by.length.description')}
                               </div>
                             </div>
                             <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                               <ChevronRight className="w-3 h-3 text-purple-300" />
                             </div>
                           </div>
                         </button>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
               
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
                 className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all touch-manipulation select-none min-h-[44px] min-w-[70px] webview-button flex items-center justify-center gap-2 ${
                   showFavoritesOnly
                     ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg ring-2 ring-green-400/30 border border-green-300/40'
                     : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'text-yellow-400' : 'text-white/70'}`} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
                 <span className="text-xs font-medium">{t('terms.tab.filter.favorites')}</span>
               </button>
               
               {/* 랜덤 버튼 */}
               <button
                 onTouchStart={handleWebViewTouch(handleShuffleSafe)}
                 onClick={handleShuffleSafe}
                 className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all touch-manipulation select-none min-h-[44px] min-w-[60px] webview-button flex items-center justify-center gap-2 ${
                   isShuffling
                     ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg ring-2 ring-blue-400/30 border border-blue-300/40'
                     : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 <Shuffle className="w-3.5 h-3.5" />
                 <span className="text-xs font-medium">{t('terms.tab.filter.random')}</span>
               </button>
               
               {/* 내보내기 버튼 */}
               <button
                 onTouchStart={handleWebViewTouch(exportTermsSafe)}
                 onClick={exportTermsSafe}
                 className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all touch-manipulation select-none min-h-[44px] min-w-[70px] webview-button flex items-center justify-center gap-2 ${
                   isExporting
                     ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg ring-2 ring-emerald-400/30 border border-emerald-300/40'
                     : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 <Download className="w-3.5 h-3.5" />
                 <span className="text-xs font-medium">{t('terms.tab.filter.export')}</span>
               </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모바일 최적화 현재 용어 카드 */}
      {filteredTerms.length > 0 && currentTerm && (
        <motion.div
                                  key={currentTerm.term + (currentTerm.date || currentTerm.learned_date || '')}
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
                                      return t('terms.card.learning.completed.count', { count: favoriteViewedTerms.length })
                }
                return t('terms.card.learning.completed.count', { count: viewedTerms.size })
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
                                <div className="text-2xl md:text-3xl font-bold text-white mb-3 break-words">
                      {localLanguage === 'ko' ? currentTerm.term :
                       localLanguage === 'en' ? currentTerm.term_en || currentTerm.term :
                       localLanguage === 'ja' ? currentTerm.term_ja || currentTerm.term :
                       localLanguage === 'zh' ? currentTerm.term_zh || currentTerm.term : currentTerm.term}
                    </div>
                          <div className="text-white/80 text-base md:text-lg leading-relaxed break-words">
                {localLanguage === 'ko' ? currentTerm.description :
                 localLanguage === 'en' ? currentTerm.description_en || currentTerm.description :
                 localLanguage === 'ja' ? currentTerm.description_ja || currentTerm.description :
                 localLanguage === 'zh' ? currentTerm.description_zh || currentTerm.description : currentTerm.description}
              </div>
          </div>

          {/* 학습일 정보 */}
          <div className="flex items-center justify-center text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{t('terms.card.learning.date')}: {currentTerm.date}</span>
            </div>
          </div>

          {/* 스와이프 안내 */}
          <div className="text-center mt-4 text-white/40 text-xs">
            {t('terms.card.swipe.guide')}
          </div>
        </motion.div>
      )}

      {/* 학습할 용어가 없을 때의 따뜻한 메시지 */}
      {!isLoading && filteredTerms.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="glass backdrop-blur-xl rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center text-center text-white shadow-xl min-h-[400px] border border-white/10 bg-gradient-to-br from-purple-900/40 via-blue-900/40 to-purple-900/40"
        >
          {/* 메인 아이콘 */}
          <div className="relative mb-6">
            <BookOpen className="w-16 h-16 md:w-20 md:h-20 text-blue-400 mb-4" />
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">✨</span>
            </div>
          </div>
          
          {/* 메인 제목 */}
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {localLanguage === 'ko' ? '용어학습 여정을 시작해보세요! 📚' :
             localLanguage === 'en' ? 'Start Your Terms Learning Journey! 📚' :
             localLanguage === 'ja' ? '用語学習の旅を始めましょう！📚' :
             '开始您的术语学习之旅！📚'}
          </h2>
          
          {/* 설명 텍스트 */}
          <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-md">
            {localLanguage === 'ko' ? '현재 학습할 용어가 없습니다. 다른 날짜를 선택하거나 검색어를 변경해보세요!' :
             localLanguage === 'en' ? 'There are no terms to learn at the moment. Try selecting a different date or changing your search terms!' :
             localLanguage === 'ja' ? '現在学習する用語がありません。別の日付を選択するか、検索語を変更してみてください！' :
             '目前没有要学习的术语。请尝试选择其他日期或更改搜索词！'}
          </p>
          
          {/* 액션 버튼들 */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <button
              onClick={() => setSelectedDate(null)}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📅 {localLanguage === 'ko' ? '전체 용어 보기' :
                   localLanguage === 'en' ? 'View All Terms' :
                   localLanguage === 'ja' ? '全用語表示' :
                   '查看所有术语'}
            </button>
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium text-sm hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              🔍 {localLanguage === 'ko' ? '검색 초기화' :
                   localLanguage === 'en' ? 'Reset Search' :
                   localLanguage === 'ja' ? '検索リセット' :
                   '重置搜索'}
            </button>
          </div>
          
          {/* 추가 안내 */}
          <div className="text-white/60 text-sm max-w-md">
            <p className="mb-2">
              {localLanguage === 'ko' ? '💡 팁: 날짜를 선택하지 않으면 모든 용어를 볼 수 있습니다.' :
               localLanguage === 'en' ? '💡 Tip: If you don\'t select a date, you can see all terms.' :
               localLanguage === 'ja' ? '💡 ヒント: 日付を選択しないと、すべての用語を見ることができます。' :
               '💡 提示：如果不选择日期，您可以看到所有术语。'}
            </p>
            <p>
              {localLanguage === 'ko' ? '🌟 새로운 용어가 추가되면 자동으로 표시됩니다.' :
               localLanguage === 'en' ? '🌟 New terms will be displayed automatically when added.' :
               localLanguage === 'ja' ? '🌟 新しい用語が追加されると自動的に表示されます。' :
               '🌟 添加新术语时会自动显示。'}
            </p>
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
                <span className="hidden sm:inline">{autoPlay ? t('terms.card.stop') : t('terms.card.auto.play')}</span>
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
                  <div className="text-white text-sm font-medium mb-2">{t('terms.playback.speed')}</div>
                  <div className="space-y-2">
                    <button
                      onClick={() => changeSpeed(1000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 1000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('terms.playback.speed.1s')}
                    </button>
                    <button
                      onClick={() => changeSpeed(2000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 2000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('terms.playback.speed.2s')}
                    </button>
                    <button
                      onClick={() => changeSpeed(3000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 3000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('terms.playback.speed.3s')}
                    </button>
                    <button
                      onClick={() => changeSpeed(5000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 5000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('terms.playback.speed.5s')}
                    </button>
                    <button
                      onClick={() => changeSpeed(7000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 7000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('terms.playback.speed.7s')}
                    </button>
                    <button
                      onClick={() => changeSpeed(10000)}
                      className={`w-full text-left px-2 py-1 rounded text-xs ${
                        autoPlayInterval === 10000 ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {t('terms.playback.speed.10s')}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* 자동재생 상태 표시 */}
            {autoPlay && (
              <div className="flex items-center justify-center w-16 h-16 bg-green-500/30 text-green-300 rounded-xl border border-green-500/50">
                                        <span className="text-sm font-medium">{t('terms.card.playing')}</span>
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
                  용어 목록({filteredTerms.length}개)
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
                                             {scrollMode ? t('terms.list.scroll.mode') : (
                        <div className="text-center leading-tight">
                          <div className="text-xs font-medium">
                            {localLanguage === 'ko' ? '스크롤 고정' : 
                             localLanguage === 'en' ? 'Scroll Lock' : 
                             localLanguage === 'ja' ? 'スクロール固定' : '滚动锁定'}
                          </div>
                          <div className="text-xs text-white/60">
                            {localLanguage === 'ko' ? '(1초 이상 클릭)' : 
                             localLanguage === 'en' ? '(Hold 1+ seconds)' : 
                             localLanguage === 'ja' ? '(1秒以上長押し)' : '(长按1秒以上)'}
                          </div>
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
                                            key={`${term.term}_${term.date || term.learned_date || ''}_${term.info_index}`}
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
                          <div className="mb-1">
                            {/* 용어명 - 난이도와 함께 표시 */}
                            <h3 className="font-bold text-white text-base leading-tight break-words line-clamp-1 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium mr-2 ${
                                                              termDifficulty.level === t('terms.card.difficulty.beginner') ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                              termDifficulty.level === t('terms.card.difficulty.intermediate') ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                                'bg-red-500/20 text-red-300 border border-red-400/30'
                              }`}>
                                {termDifficulty.level}
                              </span>
                              {currentLanguage === 'ko' ? term.term :
                         currentLanguage === 'en' ? term.term_en || term.term :
                         currentLanguage === 'ja' ? term.term_ja || term.term :
                         term.term_zh || term.term}
                            </h3>
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
                          <span className="font-medium">{term.date || term.learned_date || ''}</span>
                      </div>
                        
                        {/* 선택된 경우 진행 표시기 */}
                        {index === currentTermIndex && (
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse shadow-sm" />
                            <span className="text-blue-200 text-xs font-semibold">{t('terms.list.card.current')}</span>
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
              <div className="text-white/60 text-xs">{t('terms.tab.stats.displayed.terms')}</div>
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
              <div className="text-white font-semibold text-xs md:text-sm">
                {filteredTerms.filter(term => favoriteTerms.has(term.term)).length}
              </div>
              <div className="text-white/60 text-xs">{t('terms.tab.stats.favorites')}</div>
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
                {Math.round((viewedTerms.size / allTermsData.total_terms) * 100)}%
              </div>
              <div className="text-white/60 text-xs">{t('terms.tab.stats.learning.progress')}</div>
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
              <div className="text-white/60 text-xs">{t('terms.tab.stats.learning.completed')}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LearnedTermsSection 

'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { BookOpen, Calendar, Brain, Target, Trophy, TrendingUp, Search, Star, Download, Filter, Shuffle, Bookmark, ChevronLeft, ChevronRight, Play, Pause, X, Menu } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'

interface LearnedTermsSectionProps {
  sessionId: string
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

function LearnedTermsSection({ sessionId }: LearnedTermsSectionProps) {
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

  const queryClient = useQueryClient()
  const searchInputRef = useRef<HTMLInputElement>(null)
  
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

  // 자동 재생 기능
  useEffect(() => {
    if (!autoPlay || !learnedData?.terms) return

    const interval = setInterval(() => {
      setCurrentTermIndex(prev => (prev + 1) % filteredTerms.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, learnedData?.terms, filteredTerms.length])

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

  // 용어 난이도 계산 (용어 길이 기반)
  const getDifficulty = (term: string) => {
    if (term.length <= 3) return { level: '쉬움', color: 'text-green-400', bg: 'bg-green-500/20' }
    if (term.length <= 6) return { level: '보통', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { level: '어려움', color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  // 용어 목록 내보내기
  const exportTerms = () => {
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
  }

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">학습한 용어를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!learnedData?.terms || learnedData.terms.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 md:p-8">
        <div className="text-center text-white">
          <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h3 className="text-xl font-semibold mb-2">학습한 용어가 없습니다</h3>
          <p className="text-white/70 mb-4">
            AI 정보를 학습하고 용어를 등록한 후 여기서 확인해보세요!
          </p>
          <div className="text-sm text-white/50">
            총 학습 가능한 용어: 0개
          </div>
        </div>
      </div>
    )
  }

  const currentTerm = filteredTerms[currentTermIndex]
  const difficulty = currentTerm ? getDifficulty(currentTerm.term) : null

  return (
    <div className="glass rounded-2xl p-4 md:p-6 flex flex-col gap-4 md:gap-6">
      {/* 모바일 최적화 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 md:gap-3">
          <Brain className="w-6 h-6 md:w-8 md:h-8" />
          <span className="hidden sm:inline">학습한 용어 모음</span>
          <span className="sm:hidden">용어 학습</span>
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 md:px-5 py-3 md:py-4 bg-white/10 rounded-xl hover:bg-white/20 active:bg-white/30 transition-all text-white text-sm md:text-base font-medium flex items-center gap-2 touch-manipulation select-none min-h-[44px] min-w-[80px] justify-center"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Filter className="w-4 h-4 md:w-5 md:h-5" />
            <span className="inline">필터</span>
          </button>
          <button
            onClick={() => setShowTermList(!showTermList)}
            className="px-4 md:px-5 py-3 md:py-4 bg-white/10 rounded-xl hover:bg-white/20 active:bg-white/30 transition-all text-white text-sm md:text-base font-medium flex items-center gap-2 touch-manipulation select-none min-h-[44px] min-w-[80px] justify-center"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <Menu className="w-4 h-4 md:w-5 md:h-5" />
            <span className="inline">목록</span>
          </button>
        </div>
      </div>

      {/* 모바일 최적화 검색바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="용어나 설명으로 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 md:py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
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
            className="bg-white/5 rounded-xl p-4 space-y-4"
          >
            {/* 날짜별 필터 */}
            {learnedData.learned_dates.length > 1 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  날짜별 필터
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { setSelectedDate(null); setCurrentTermIndex(0); }}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[44px] ${
                      selectedDate === null
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30'
                    }`}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    전체 ({learnedData.total_terms})
                  </button>
                  {learnedData.learned_dates.map((date) => {
                    const dateTerms = learnedData.terms_by_date[date] || []
                    return (
                      <button
                        key={date}
                        onClick={() => { setSelectedDate(date); setCurrentTermIndex(0); }}
                        className={`px-4 py-3 rounded-lg text-sm font-medium transition-all touch-manipulation select-none min-h-[44px] ${
                          selectedDate === date
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {date} ({dateTerms.length})
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            
            {/* 정렬 및 필터 옵션 */}
            <div className="flex flex-wrap gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm min-h-[44px]"
              >
                <option value="date">최신순</option>
                <option value="alphabet">가나다순</option>
                <option value="length">길이순</option>
              </select>
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center gap-2 touch-manipulation select-none min-h-[44px] ${
                  showFavoritesOnly
                    ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Star className="w-4 h-4" />
                즐겨찾기만
              </button>
              <button
                onClick={handleShuffle}
                className="px-4 py-3 bg-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-500/50 active:bg-purple-500/70 transition-all text-sm font-medium flex items-center gap-2 touch-manipulation select-none min-h-[44px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Shuffle className="w-4 h-4" />
                랜덤
              </button>
              <button
                onClick={exportTerms}
                className="px-4 py-3 bg-green-500/30 text-green-300 rounded-lg hover:bg-green-500/50 active:bg-green-500/70 transition-all text-sm font-medium flex items-center gap-2 touch-manipulation select-none min-h-[44px]"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <Download className="w-4 h-4" />
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
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 md:p-6 border border-white/20"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* 진행률 표시 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/60">{currentTermIndex + 1} / {filteredTerms.length}</span>
              <span className="text-sm text-green-400 font-bold">{favoriteTerms.size}개 학습완료</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="h-2 bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300"
                style={{ width: `${((currentTermIndex + 1) / filteredTerms.length) * 100}%` }}
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
              className={`p-3 rounded-lg transition-all touch-manipulation select-none min-h-[44px] min-w-[44px] flex items-center justify-center ${
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
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`p-3 rounded-xl transition-all font-medium flex items-center gap-2 touch-manipulation select-none min-h-[44px] ${
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
            <button
              onClick={handlePrevTerm}
              className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 active:bg-white/30 transition-all font-medium touch-manipulation select-none min-h-[44px] min-w-[44px] flex items-center justify-center"
              disabled={filteredTerms.length === 0}
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextTerm}
              className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 active:from-blue-700 active:to-purple-700 transition-all font-medium touch-manipulation select-none min-h-[44px] min-w-[44px] flex items-center justify-center"
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
            className="bg-white/5 rounded-xl p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              전체 용어 목록 ({filteredTerms.length}개)
            </h3>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {filteredTerms.map((term, index) => {
                const termDifficulty = getDifficulty(term.term)
                return (
                  <motion.div
                    key={`${term.term}_${term.learned_date}_${term.info_index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg cursor-pointer transition-all touch-manipulation select-none min-h-[44px] ${
                      index === currentTermIndex
                        ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30 border border-blue-400/50'
                        : 'bg-white/5 hover:bg-white/10 active:bg-white/20 border border-white/10'
                    }`}
                    onClick={() => {
                      setCurrentTermIndex(index)
                      setShowTermList(false)
                    }}
                    style={{ WebkitTapHighlightColor: 'transparent' }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-white text-sm break-words">{term.term}</div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleFavorite(term.term)
                        }}
                        className={`p-2 rounded flex-shrink-0 touch-manipulation select-none min-h-[32px] min-w-[32px] flex items-center justify-center ${
                          favoriteTerms.has(term.term)
                            ? 'text-yellow-400'
                            : 'text-white/30 hover:text-yellow-400 active:text-yellow-300'
                        }`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        <Star className="w-3 h-3" fill={favoriteTerms.has(term.term) ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <div className="text-white/60 text-xs line-clamp-2 mb-1 break-words">{term.description}</div>
                    <div className="flex items-center justify-between">
                      <div className={`text-xs px-1 py-0.5 rounded ${termDifficulty.bg} ${termDifficulty.color}`}>
                        {termDifficulty.level}
                      </div>
                      <div className="text-white/40 text-xs">{term.learned_date}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 모바일 최적화 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-300" />
            <div>
              <div className="text-white font-semibold text-sm md:text-base">{filteredTerms.length}</div>
              <div className="text-white/60 text-xs md:text-sm">표시된 용어</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Star className="w-5 h-5 md:w-6 md:h-6 text-green-300" />
            <div>
              <div className="text-white font-semibold text-sm md:text-base">{favoriteTerms.size}</div>
              <div className="text-white/60 text-xs md:text-sm">즐겨찾기</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-purple-300" />
            <div>
              <div className="text-white font-semibold text-sm md:text-base">{learnedData.learned_dates.length}</div>
              <div className="text-white/60 text-xs md:text-sm">학습일수</div>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-xl rounded-xl p-3 md:p-4 border border-white/10"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-yellow-300" />
            <div>
              <div className="text-white font-semibold text-sm md:text-base">
                {Math.round((filteredTerms.length / learnedData.total_terms) * 100)}%
              </div>
              <div className="text-white/60 text-xs md:text-sm">진행률</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default LearnedTermsSection 

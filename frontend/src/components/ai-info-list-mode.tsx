'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaCalendar, FaBookOpen, FaStar, FaSearch, FaTimes, FaPlay, FaPause, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'

interface AIInfoItem {
  id: string
  date: string
  title: string
  content: string
  terms: Array<{ term: string; description: string }>
  info_index: number
}

interface AIInfoListModeProps {
  sessionId: string
  onProgressUpdate: () => void
}

export default function AIInfoListMode({ sessionId, onProgressUpdate }: AIInfoListModeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInfo, setSelectedInfo] = useState<AIInfoItem | null>(null)
  const [favoriteInfos, setFavoriteInfos] = useState<Set<string>>(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'length'>('date')
  const [autoPlay, setAutoPlay] = useState(false)
  const [autoPlayInterval, setAutoPlayInterval] = useState(5000)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showSpeedControl, setShowSpeedControl] = useState(false)

  // 모든 AI 정보 가져오기
  const { data: allAIInfo = [], isLoading } = useQuery<AIInfoItem[]>({
    queryKey: ['all-ai-info'],
    queryFn: async () => {
      const response = await aiInfoAPI.getAll()
      return response.data
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 즐겨찾기 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('favoriteAIInfos')
      if (stored) {
        setFavoriteInfos(new Set(JSON.parse(stored)))
      }
    }
  }, [])

  // 즐겨찾기 저장
  const toggleFavorite = (infoId: string) => {
    const newFavorites = new Set(favoriteInfos)
    if (newFavorites.has(infoId)) {
      newFavorites.delete(infoId)
    } else {
      newFavorites.add(infoId)
    }
    setFavoriteInfos(newFavorites)
    localStorage.setItem('favoriteAIInfos', JSON.stringify([...newFavorites]))
  }

  // 필터링 및 정렬된 AI 정보
  const filteredAIInfo = (() => {
    let filtered = allAIInfo

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(info => 
        info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.terms.some(term => 
          term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // 즐겨찾기 필터
    if (showFavoritesOnly) {
      filtered = filtered.filter(info => favoriteInfos.has(info.id))
    }

    // 정렬
    switch (sortBy) {
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title))
      case 'length':
        return filtered.sort((a, b) => a.content.length - b.content.length)
      case 'date':
      default:
        return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    }
  })()

  // 자동재생 기능
  useEffect(() => {
    if (!autoPlay || filteredAIInfo.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % filteredAIInfo.length)
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, filteredAIInfo.length])

  // 자동재생 시작/정지
  const toggleAutoPlay = () => {
    setAutoPlay(!autoPlay)
    if (!autoPlay) {
      setCurrentIndex(0)
    }
  }

  // 속도 변경
  const changeSpeed = (newInterval: number) => {
    setAutoPlayInterval(newInterval)
    setShowSpeedControl(false)
  }

  // 이전/다음 정보
  const goToPrevious = () => {
    setCurrentIndex(prev => (prev - 1 + filteredAIInfo.length) % filteredAIInfo.length)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev + 1) % filteredAIInfo.length)
  }

  // 정보 선택
  const selectInfo = (info: AIInfoItem) => {
    setSelectedInfo(info)
  }

  // 정보 닫기
  const closeInfo = () => {
    setSelectedInfo(null)
  }

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">AI 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (allAIInfo.length === 0) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center text-white">
          <FaBookOpen className="w-16 h-16 mx-auto mb-4 opacity-60" />
          <h3 className="text-xl font-semibold mb-2">등록된 AI 정보가 없습니다</h3>
          <p className="text-white/70">관리자가 AI 정보를 등록한 후 이용할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <FaRobot className="text-blue-400" />
          AI 정보 목록 모드
        </h2>
        <div className="text-white/60 text-sm">
          총 {filteredAIInfo.length}개 정보
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="제목, 내용, 용어로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="date">최신순</option>
            <option value="title">제목순</option>
            <option value="length">길이순</option>
          </select>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
              showFavoritesOnly
                ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-500/50'
                : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30'
            }`}
          >
            <FaStar className="w-4 h-4" />
            즐겨찾기만
          </button>
        </div>
      </div>

      {/* 자동재생 컨트롤 */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goToPrevious}
          disabled={filteredAIInfo.length === 0}
          className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 active:bg-white/30 transition-all disabled:opacity-50"
        >
          <FaChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={toggleAutoPlay}
          disabled={filteredAIInfo.length === 0}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
            autoPlay
              ? 'bg-red-500/30 text-red-300 border border-red-500/50'
              : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30'
          }`}
        >
          {autoPlay ? <FaPause className="w-4 h-4" /> : <FaPlay className="w-4 h-4" />}
          {autoPlay ? '정지' : '자동재생'}
        </button>

        <button
          onClick={() => setShowSpeedControl(!showSpeedControl)}
          className="px-4 py-3 bg-blue-500/30 text-blue-300 rounded-xl hover:bg-blue-500/50 transition-all"
        >
          ⚙️
        </button>

        <button
          onClick={goToNext}
          disabled={filteredAIInfo.length === 0}
          className="p-3 bg-white/10 text-white rounded-xl hover:bg-white/20 active:bg-white/30 transition-all disabled:opacity-50"
        >
          <FaChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 속도 조절 드롭다운 */}
      {showSpeedControl && (
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
            <div className="text-white text-sm font-medium mb-3 text-center">재생 속도</div>
            <div className="grid grid-cols-3 gap-2">
              {[3000, 5000, 7000, 10000, 15000, 20000].map((interval) => (
                <button
                  key={interval}
                  onClick={() => changeSpeed(interval)}
                  className={`px-3 py-2 rounded text-xs ${
                    autoPlayInterval === interval ? 'bg-blue-500 text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {interval / 1000}초
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI 정보 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAIInfo.map((info, index) => (
          <motion.div
            key={info.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-white/5 rounded-xl p-4 cursor-pointer transition-all hover:bg-white/10 active:bg-white/20 border ${
              selectedInfo?.id === info.id
                ? 'border-blue-400/50 bg-blue-500/10'
                : 'border-white/10'
            } ${index === currentIndex && autoPlay ? 'ring-2 ring-yellow-400/50' : ''}`}
            onClick={() => selectInfo(info)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{info.title}</h3>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <FaCalendar className="w-4 h-4" />
                  <span>{info.date}</span>
                </div>
                <p className="text-white/70 text-sm line-clamp-3">{info.content}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(info.id)
                }}
                className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                  favoriteInfos.has(info.id)
                    ? 'text-yellow-400 bg-yellow-500/20'
                    : 'text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10'
                }`}
              >
                <FaStar className="w-4 h-4" fill={favoriteInfos.has(info.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            {info.terms.length > 0 && (
              <div className="mt-3">
                <div className="text-white/60 text-xs mb-2">관련 용어 ({info.terms.length}개)</div>
                <div className="flex flex-wrap gap-1">
                  {info.terms.slice(0, 3).map((term, termIndex) => (
                    <span
                      key={termIndex}
                      className="px-2 py-1 bg-white/10 text-white/70 text-xs rounded"
                    >
                      {term.term}
                    </span>
                  ))}
                  {info.terms.length > 3 && (
                    <span className="px-2 py-1 bg-white/10 text-white/50 text-xs rounded">
                      +{info.terms.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 선택된 정보 상세 보기 */}
      <AnimatePresence>
        {selectedInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeInfo}
          >
            <motion.div
              className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-3">{selectedInfo.title}</h2>
                  <div className="flex items-center gap-4 text-white/60">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="w-4 h-4" />
                      <span>{selectedInfo.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBookOpen className="w-4 h-4" />
                      <span>정보 {selectedInfo.info_index + 1}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeInfo}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <div className="text-white/80 text-lg leading-relaxed mb-8 whitespace-pre-line">
                {selectedInfo.content}
              </div>

              {selectedInfo.terms.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <FaBookOpen className="text-blue-400" />
                    관련 용어 ({selectedInfo.terms.length}개)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedInfo.terms.map((term, index) => (
                      <div
                        key={index}
                        className="bg-white/5 rounded-xl p-4 border border-white/10"
                      >
                        <div className="font-bold text-white text-lg mb-2">{term.term}</div>
                        <div className="text-white/70">{term.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

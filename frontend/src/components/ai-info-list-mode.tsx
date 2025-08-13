'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaCalendar, FaBookOpen, FaStar, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash } from 'react-icons/fa'
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 모든 AI 정보 가져오기 (getAll API 시도)
  const { data: allAIInfo = [], isLoading: isLoadingAll, error: getAllError } = useQuery<AIInfoItem[]>({
    queryKey: ['all-ai-info'],
    queryFn: async () => {
      try {
        const response = await aiInfoAPI.getAll()
        return response.data
      } catch (error) {
        console.log('getAll API 실패, getAllDates API 사용:', error)
        return []
      }
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 날짜별 AI 정보 가져오기 (getAll API가 실패할 경우 사용)
  const { data: allDates = [], isLoading: isLoadingDates } = useQuery<string[]>({
    queryKey: ['all-ai-info-dates'],
    queryFn: async () => {
      try {
        const response = await aiInfoAPI.getAllDates()
        return response.data
      } catch (error) {
        console.log('getAllDates API도 실패:', error)
        return []
      }
    },
    enabled: getAllError !== null || allAIInfo.length === 0,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 각 날짜별 AI 정보 가져오기
  const { data: dateBasedAIInfo = [], isLoading: isLoadingDateBased } = useQuery<AIInfoItem[]>({
    queryKey: ['date-based-ai-info', allDates],
    queryFn: async () => {
      if (allDates.length === 0) return []
      
      const allInfo: AIInfoItem[] = []
      
      for (const date of allDates) {
        try {
          const response = await aiInfoAPI.getByDate(date)
          const dateInfos = response.data
          
          dateInfos.forEach((info: { title: string; content: string; terms?: Array<{ term: string; description: string }> }, index: number) => {
            if (info.title && info.content) {
              allInfo.push({
                id: `${date}_${index}`,
                date: date,
                title: info.title,
                content: info.content,
                terms: info.terms || [],
                info_index: index
              })
            }
          })
        } catch (error) {
          console.log(`날짜 ${date}의 AI 정보 가져오기 실패:`, error)
        }
      }
      
      return allInfo
    },
    enabled: allDates.length > 0 && (getAllError !== null || allAIInfo.length === 0),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 실제 사용할 AI 정보 (getAll이 성공하면 그것을, 실패하면 날짜별 정보를 사용)
  const actualAIInfo = allAIInfo.length > 0 ? allAIInfo : dateBasedAIInfo
  const isLoading = isLoadingAll || isLoadingDates || isLoadingDateBased

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

  // 항목 확장/축소 토글
  const toggleExpanded = (infoId: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(infoId)) {
      newExpanded.delete(infoId)
    } else {
      newExpanded.add(infoId)
    }
    setExpandedItems(newExpanded)
  }

  // 필터링 및 정렬된 AI 정보
  const filteredAIInfo = (() => {
    let filtered = actualAIInfo

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

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredAIInfo.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAIInfo.slice(startIndex, endIndex)

  // 페이지 변경 시 상단으로 스크롤
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, showFavoritesOnly, sortBy])

  const selectInfo = (info: AIInfoItem) => {
    setSelectedInfo(info)
  }

  const closeInfo = () => {
    setSelectedInfo(null)
  }

  // 로딩 중이거나 데이터가 아직 없는 경우 계속 로딩 표시
  if (isLoading || actualAIInfo.length === 0) {
    return (
      <div className="glass rounded-2xl p-8">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70 text-lg mb-2">AI 정보를 불러오는 중...</p>
          <p className="text-white/50 text-sm">잠시만 기다려주세요</p>
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
              className="p-2 text-white/50 hover:text-white transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'length')}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="date">최신순</option>
            <option value="title">제목순</option>
            <option value="length">길이순</option>
          </select>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
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

      {/* 페이지당 항목 수 선택 */}
      <div className="flex items-center gap-4">
        <span className="text-white/70 text-sm">페이지당 항목:</span>
        <div className="flex gap-2">
          {[10, 30, 50].map((size) => (
            <button
              key={size}
              onClick={() => {
                setItemsPerPage(size)
                setCurrentPage(1)
              }}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                itemsPerPage === size
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {size}개
            </button>
          ))}
        </div>
      </div>

      {/* AI 정보 목록 */}
      <div className="space-y-4">
        {currentItems.map((info, index) => (
          <motion.div
            key={info.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-xl border transition-all ${
              expandedItems.has(info.id)
                ? 'bg-white/15 border-blue-400/50 shadow-lg shadow-blue-500/20'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
          >
            {/* 기본 정보 헤더 */}
            <div 
              className="p-4 cursor-pointer"
              onClick={() => toggleExpanded(info.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg mb-2">{info.title}</h3>
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                    <FaCalendar className="w-3 h-3" />
                    <span>{info.date}</span>
                  </div>
                  <p className="text-white/70 text-sm line-clamp-2">{info.content}</p>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(info.id)
                    }}
                    className={`p-2 rounded-lg transition-all ${
                      favoriteInfos.has(info.id)
                        ? 'text-yellow-400 bg-yellow-500/20'
                        : 'text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10'
                    }`}
                  >
                    <FaStar className="w-4 h-4" fill={favoriteInfos.has(info.id) ? 'currentColor' : 'none'} />
                  </button>
                  
                  <div className="text-white/40">
                    {expandedItems.has(info.id) ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                  </div>
                </div>
              </div>
            </div>

            {/* 확장된 상세 내용 */}
            <AnimatePresence>
              {expandedItems.has(info.id) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-white/10 pt-4">
                    {/* 전체 내용 */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <FaBookOpen className="text-blue-400" />
                        📖 전체 내용
                      </h4>
                      <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="text-white/90 leading-relaxed whitespace-pre-line">
                          {info.content}
                        </div>
                      </div>
                    </div>

                    {/* 관련 용어 */}
                    {info.terms.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                          <FaBookOpen className="text-emerald-400" />
                          📚 관련 용어 학습 ({info.terms.length}개)
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {info.terms.map((term, termIndex) => (
                            <div
                              key={termIndex}
                              className="bg-white/10 rounded-lg p-3 border border-white/20 hover:bg-white/15 transition-all"
                            >
                              <div className="font-bold text-white text-base mb-2 flex items-center gap-2">
                                <span className="text-emerald-400 text-sm">#{termIndex + 1}</span>
                                {term.term}
                              </div>
                              <div className="text-white/80 leading-relaxed text-sm">{term.description}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-all ${
              currentPage === 1
                ? 'text-white/30 cursor-not-allowed'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <FaChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-all ${
              currentPage === totalPages
                ? 'text-white/30 cursor-not-allowed'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

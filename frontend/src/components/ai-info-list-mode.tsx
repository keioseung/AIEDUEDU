'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaCalendar, FaBookOpen, FaStar, FaSearch, FaTimes } from 'react-icons/fa'
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



  const selectInfo = (info: AIInfoItem) => {
    setSelectedInfo(info)
  }

  const closeInfo = () => {
    setSelectedInfo(null)
  }

  if (isLoading) {
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

  if (actualAIInfo.length === 0 && !isLoading) {
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
          AI 정보 전체 목록 모드
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



             {/* AI 정보 목록 */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {filteredAIInfo.map((info, index) => (
           <motion.div
             key={info.id}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: index * 0.1 }}
             className="p-4 rounded-xl cursor-pointer transition-all border bg-white/5 hover:bg-white/10 active:bg-white/20 border-white/10"
             onClick={(e) => {
               e.preventDefault()
               e.stopPropagation()
               selectInfo(info)
             }}
           >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">{info.title}</h3>
                <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                  <FaCalendar className="w-3 h-3" />
                  <span>{info.date}</span>
                </div>
                <p className="text-white/70 text-sm line-clamp-3">{info.content}</p>
              </div>
              
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

                             <div className="text-white/80 text-lg leading-relaxed mb-8 whitespace-pre-line bg-white/5 p-6 rounded-xl border border-white/10">
                 <h3 className="text-xl font-bold text-white mb-4">📖 전체 내용</h3>
                 <div className="text-white/90 leading-relaxed">
                   {selectedInfo.content}
                 </div>
               </div>

                             {selectedInfo.terms.length > 0 && (
                 <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                   <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                     <FaBookOpen className="text-blue-400" />
                     📚 관련 용어 학습 ({selectedInfo.terms.length}개)
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {selectedInfo.terms.map((term, index) => (
                       <div
                         key={index}
                         className="bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all"
                       >
                         <div className="font-bold text-white text-lg mb-3 flex items-center gap-2">
                           <span className="text-blue-400 text-sm">#{index + 1}</span>
                           {term.term}
                         </div>
                         <div className="text-white/80 leading-relaxed">{term.description}</div>
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

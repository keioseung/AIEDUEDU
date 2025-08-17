'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaCalendar, FaStar, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
import AIInfoCard from './ai-info-card'

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
  const [isProcessing, setIsProcessing] = useState(false)

  // 웹뷰 터치 이벤트 핸들러
  const handleWebViewTouch = (callback: (e?: React.TouchEvent) => void) => (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    callback(e)
  }


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

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredAIInfo.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAIInfo.slice(startIndex, endIndex)

  // 페이지 변경 시 상단으로 스크롤
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, showFavoritesOnly, sortBy, itemsPerPage])

  // expandedItems 상태가 변경되지 않도록 안정화
  useEffect(() => {
    // 컴포넌트가 마운트된 후 expandedItems 상태를 유지
  }, [])

  const selectInfo = (info: AIInfoItem) => {
    setSelectedInfo(info)
  }

  const closeInfo = () => {
    setSelectedInfo(null)
  }

           // 로딩 중인 경우
    if (isLoading) {
      return (
        <div className="glass rounded-2xl p-6 min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-purple-950/60 via-purple-900/70 to-purple-950/60 border-2 border-purple-600/50 shadow-2xl shadow-purple-900/50">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-white mx-auto mb-8"></div>
            <div className="space-y-4">
              <p className="text-white/80 text-2xl font-medium">잠시만 기다려 주세요</p>
              <p className="text-white/50 text-lg">AI 정보를 불러오는 중입니다</p>
            </div>
          </div>
        </div>
      )
    }

  // 데이터가 없는 경우
  if (actualAIInfo.length === 0) {
    return (
      <div className="glass rounded-2xl p-80 md:p-96 min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-purple-950/60 via-purple-900/70 to-purple-950/60 border-2 border-purple-600/50 shadow-2xl shadow-purple-900/50">
        <div className="text-center text-white">
          <div className="w-16 h-16 mx-auto mb-4 opacity-60">
            <FaRobot className="w-full h-full text-blue-400" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white">AI 정보가 없습니다</h3>
            <p className="text-white/70 text-base">
              아직 등록된 AI 정보가 없습니다.<br/>
              관리자가 AI 정보를 등록한 후 이용해주세요!
            </p>
            <div className="text-sm text-white/50">
              새로운 AI 정보를 기다리고 있습니다
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="glass rounded-2xl p-6 flex flex-col gap-6 bg-gradient-to-br from-purple-950/60 via-purple-900/70 to-purple-950/60 border-2 border-purple-600/50 shadow-2xl shadow-purple-900/50">
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
      <div className="flex flex-col gap-4">
        {/* 검색창 */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
          <input
            type="text"
            placeholder="제목, 내용, 용어로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 border-2 border-purple-600/50 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 shadow-lg shadow-purple-900/30 backdrop-blur-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-white/50 hover:text-white transition-colors"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          )}
        </div>
        
                 {/* 필터 및 페이지 설정 */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* 정렬 및 즐겨찾기 - 1행 */}
           <div className="flex flex-wrap gap-3">
             {/* 고급스러운 정렬 옵션 */}
             <div className="flex bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 backdrop-blur-xl rounded-xl p-1 border-2 border-purple-600/50 shadow-lg shadow-purple-900/30">
               <button
                 onTouchStart={handleWebViewTouch(() => setSortBy('date'))}
                 onClick={() => setSortBy('date')}
                 className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 min-h-[40px] min-w-[60px] touch-manipulation webview-button ${
                   sortBy === 'date'
                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105 border border-purple-400/50'
                     : 'text-white/70 hover:text-white hover:bg-gradient-to-br hover:from-purple-800/40 hover:via-purple-700/50 hover:to-purple-800/40 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 🕒 최신순
               </button>
               <button
                 onTouchStart={handleWebViewTouch(() => setSortBy('title'))}
                 onClick={() => setSortBy('title')}
                 className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 min-h-[40px] min-w-[60px] touch-manipulation webview-button ${
                   sortBy === 'title'
                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105 border border-purple-400/50'
                     : 'text-white/70 hover:text-white hover:bg-gradient-to-br hover:from-purple-800/40 hover:via-purple-700/50 hover:to-purple-800/40 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 📝 제목순
               </button>
               <button
                 onTouchStart={handleWebViewTouch(() => setSortBy('length'))}
                 onClick={() => setSortBy('length')}
                 className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-300 min-h-[40px] min-w-[60px] touch-manipulation webview-button ${
                   sortBy === 'length'
                     ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105 border border-purple-400/50'
                     : 'text-white/70 hover:text-white hover:bg-gradient-to-br hover:from-purple-800/40 hover:via-purple-700/50 hover:to-purple-800/40 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40'
                 }`}
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 📏 길이순
               </button>
             </div>
             
             {/* 즐겨찾기 버튼 - 정렬 버튼 박스 오른쪽에 별도 배치 */}
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
               className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 min-h-[40px] min-w-[80px] touch-manipulation webview-button ${
                 showFavoritesOnly
                   ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border border-purple-400/50'
                   : 'bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40 backdrop-blur-xl'
               }`}
               style={{ WebkitTapHighlightColor: 'transparent' }}
             >
               <FaStar className={`w-3 h-3 transition-all duration-300 ${
                 showFavoritesOnly 
                   ? 'text-yellow-400 drop-shadow-sm' 
                   : 'text-white/30 border border-white/30 rounded-sm'
               }`} />
               즐겨찾기만
             </button>
           </div>
           
           {/* 페이지당 항목 수 선택 - 1행 */}
           <div className="flex items-center gap-3">
             <span className="text-white/70 text-sm font-medium">페이지당 항목:</span>
             <div className="flex gap-2">
               {[10, 30, 50].map((size) => (
                 <button
                   key={size}
                   onTouchStart={handleWebViewTouch(() => {
                     setItemsPerPage(size)
                     setCurrentPage(1)
                   })}
                   onClick={() => {
                     setItemsPerPage(size)
                     setCurrentPage(1)
                   }}
                   className={`px-3 py-2 rounded-lg text-xs font-medium transition-all min-h-[40px] min-w-[50px] touch-manipulation webview-button ${
                     itemsPerPage === size
                       ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border border-purple-400/50'
                       : 'bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40 backdrop-blur-xl'
                   }`}
                   style={{ WebkitTapHighlightColor: 'transparent' }}
                 >
                   {size}개
                 </button>
               ))}
             </div>
           </div>
         </div>
      </div>

             {/* AI 정보 목록 */}
       <div className="space-y-4 w-full">
         {currentItems.map((info, index) => (
           <div key={info.id} className="w-full max-w-none bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 backdrop-blur-xl rounded-xl p-4 border-2 border-purple-600/50 shadow-lg shadow-purple-900/40">
            <AIInfoCard
              info={{
                title: info.title,
                content: info.content,
                terms: info.terms
              }}
              index={info.info_index}
              date={info.date}
              sessionId={sessionId}
              isLearned={false}
              onProgressUpdate={onProgressUpdate}
            />
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onTouchStart={handleWebViewTouch(() => setCurrentPage(Math.max(1, currentPage - 1)))}
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg transition-all min-h-[40px] min-w-[40px] touch-manipulation webview-button ${
              currentPage === 1
                ? 'text-white/30 cursor-not-allowed bg-gradient-to-br from-slate-800/20 via-purple-700/30 to-slate-800/20'
                : 'text-white/70 hover:text-white hover:bg-gradient-to-br hover:from-slate-800/40 hover:via-purple-700/50 hover:to-slate-800/40 active:from-slate-800/60 active:via-purple-700/70 active:to-slate-800/60 backdrop-blur-xl'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
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
                  onTouchStart={handleWebViewTouch(() => setCurrentPage(pageNum))}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[40px] min-w-[40px] touch-manipulation webview-button ${
                    currentPage === pageNum
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg border border-purple-400/50'
                      : 'bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40 backdrop-blur-xl'
                  }`}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          
          <button
            onTouchStart={handleWebViewTouch(() => setCurrentPage(Math.min(totalPages, currentPage + 1)))}
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg transition-all min-h-[40px] min-w-[40px] touch-manipulation webview-button ${
              currentPage === totalPages
                ? 'text-white/30 cursor-not-allowed bg-gradient-to-br from-slate-800/20 via-purple-700/30 to-slate-800/20'
                : 'text-white/70 hover:text-white hover:bg-gradient-to-br hover:from-slate-800/40 hover:via-purple-700/50 hover:to-slate-800/40 active:from-slate-800/60 active:via-purple-700/70 active:to-slate-800/60 backdrop-blur-xl'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <FaChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

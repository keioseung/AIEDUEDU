'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaCalendar, FaStar, FaSearch, FaTimes, FaChevronLeft, FaChevronRight, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Settings, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
import { t, getCurrentLanguage } from '@/lib/i18n'
import type { AIInfoItem, AITitleItem } from '@/types'
import AIInfoCard from './ai-info-card'

interface AIInfoListModeProps {
  sessionId: string
  currentLanguage: 'ko' | 'en' | 'ja' | 'zh'
  onProgressUpdate: () => void
}

export default function AIInfoListMode({ sessionId, currentLanguage, onProgressUpdate }: AIInfoListModeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInfo, setSelectedInfo] = useState<AIInfoItem | null>(null)
  const [favoriteInfos, setFavoriteInfos] = useState<Set<string>>(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'length'>('date')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false)
  const [localLanguage, setLocalLanguage] = useState(currentLanguage)
  
  // 성능 최적화: 제목만 먼저 로딩, 상세 내용은 필요시 로딩
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [loadedContents, setLoadedContents] = useState<Map<string, AIInfoItem>>(new Map())

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSortDropdown) {
        setShowSortDropdown(false)
      }
      if (showItemsPerPageDropdown) {
        setShowItemsPerPageDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSortDropdown, showItemsPerPageDropdown])

  // 웹뷰 터치 이벤트 핸들러
  const handleWebViewTouch = (callback: (e?: React.TouchEvent) => void) => (e: React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    callback(e)
  }

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

  // 제목만 가져오기 (성능 최적화)
  const { data: titlesData, isLoading: isLoadingTitles, error: titlesError } = useQuery<{titles: AITitleItem[]}>({
    queryKey: ['ai-info-titles', localLanguage],
    queryFn: async () => {
      try {
        console.log(`제목만 가져오는 API 호출 중... (언어: ${localLanguage})`)
        const response = await aiInfoAPI.getAllTitles(localLanguage)
        console.log('제목 API 응답:', response)
        return response.data
      } catch (error) {
        console.error('제목 API 호출 실패:', error)
        throw error
      }
    },
    // 성능 최적화: 캐시 설정 개선
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000,   // 10분
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 1,
    retryDelay: 1000
  })

  // 날짜별 AI 정보 (제목 API가 실패한 경우에만 사용)
  const { data: dateBasedAIInfo, isLoading: isLoadingDates, error: datesError } = useQuery<AIInfoItem[]>({
    queryKey: ['ai-info-by-date', localLanguage],
    queryFn: async () => {
      try {
        console.log(`날짜별 AI 정보 API 호출 중... (언어: ${localLanguage})`)
        // getByDate는 날짜만 받으므로 'all' 대신 다른 방식 사용
        const response = await aiInfoAPI.getAll(localLanguage)
        console.log('날짜별 API 응답:', response)
        return response.data
      } catch (error) {
        console.error('날짜별 API 호출 실패:', error)
        throw error
      }
    },
    // 제목 API가 성공하면 사용하지 않음
    enabled: !!titlesError || !titlesData?.titles?.length,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })

  // 전체 AI 정보 (제목 API가 실패한 경우에만 사용)
  const { data: allAIInfo, isLoading: isLoadingAll, error: allError } = useQuery<AIInfoItem[]>({
    queryKey: ['all-ai-info', localLanguage],
    queryFn: async () => {
      try {
        console.log(`전체 AI 정보 API 호출 중... (언어: ${localLanguage})`)
        const response = await aiInfoAPI.getAll(localLanguage)
        console.log('전체 API 응답:', response)
        return response.data
      } catch (error) {
        console.error('전체 API 호출 실패:', error)
        throw error
      }
    },
    // 제목 API가 성공하면 사용하지 않음
    enabled: !!titlesError || !titlesData?.titles?.length,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false
  })

  // 실제 사용할 AI 정보 (제목 API가 성공하면 그것을, 실패하면 날짜별 정보를 사용)
  const actualAIInfo: (AITitleItem | AIInfoItem)[] = (titlesData?.titles && titlesData.titles.length > 0) ? titlesData.titles : (dateBasedAIInfo || [])
  const isLoading = isLoadingTitles || isLoadingDates || isLoadingAll

  // 즐겨찾기 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('favoriteAIInfos')
        if (stored) {
          const parsed = JSON.parse(stored)
          console.log('로컬 스토리지에서 즐겨찾기 로드:', parsed)
          setFavoriteInfos(new Set(parsed))
        }
      } catch (error) {
        console.error('즐겨찾기 데이터 파싱 오류:', error)
      }
    }
  }, [])

  // 즐겨찾기 토글
  const toggleFavorite = (favoriteKey: string) => {
    console.log('즐겨찾기 토글 호출:', favoriteKey, '현재 상태:', favoriteInfos.has(favoriteKey))
    
    const newFavorites = new Set(favoriteInfos)
    if (newFavorites.has(favoriteKey)) {
      newFavorites.delete(favoriteKey)
      console.log('즐겨찾기에서 제거:', favoriteKey)
    } else {
      newFavorites.add(favoriteKey)
      console.log('즐겨찾기에 추가:', favoriteKey)
    }
    
    setFavoriteInfos(newFavorites)
    console.log('새로운 즐겨찾기 목록:', [...newFavorites])
    
    // 로컬 스토리지에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteAIInfos', JSON.stringify([...newFavorites]))
      console.log('로컬 스토리지에 저장됨')
    }
    
    // 즐겨찾기 상태가 변경되면 필터링된 결과도 업데이트
    if (showFavoritesOnly) {
      // 강제로 리렌더링을 위해 상태 업데이트
      setShowFavoritesOnly(false)
      setTimeout(() => setShowFavoritesOnly(true), 100)
    }
  }

  // 즐겨찾기 키 생성 함수
  const generateFavoriteKey = (info: AITitleItem | AIInfoItem) => {
    // info.id가 있으면 그것을 사용, 없으면 date와 info_index 조합 사용
    // 모든 키를 문자열로 변환하여 반환
    return String(info.id || `${info.date}_${info.info_index}`)
  }

  // 항목 확장/축소 토글
  const toggleItemExpansion = async (item: AITitleItem) => {
    const itemKey = generateFavoriteKey(item)
    
    if (expandedItems.has(itemKey)) {
      // 축소
      setExpandedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(itemKey)
        return newSet
      })
    } else {
      // 확장 - 상세 내용 로딩
      setExpandedItems(prev => new Set(prev).add(itemKey))
      
      // 이미 로딩된 내용이 있으면 사용, 없으면 새로 로딩
      if (!loadedContents.has(itemKey)) {
        try {
          console.log(`상세 내용 로딩 중: ${item.date}, ${item.info_index}`)
          const response = await aiInfoAPI.getContentByIndex(item.date, item.info_index, localLanguage)
          setLoadedContents(prev => new Map(prev).set(itemKey, response.data))
        } catch (error) {
          console.error('상세 내용 로딩 실패:', error)
        }
      }
    }
  }

  // 필터링 및 정렬된 AI 정보
  const filteredAIInfo = useMemo(() => {
    let filtered = actualAIInfo

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(info => 
        info.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // 즐겨찾기 필터
    if (showFavoritesOnly) {
      filtered = filtered.filter(info => {
        const favoriteKey = generateFavoriteKey(info)
        return favoriteInfos.has(favoriteKey)
      })
    }

    // 정렬
    switch (sortBy) {
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title))
      case 'date':
      default:
        return filtered.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
        })
    }
  }, [actualAIInfo, searchQuery, showFavoritesOnly, sortBy, favoriteInfos])

  // 페이지네이션 계산
  const totalPages = Math.ceil(filteredAIInfo.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredAIInfo.slice(startIndex, endIndex)

  // 페이지 변경 시 상단으로 스크롤
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, showFavoritesOnly, sortBy, itemsPerPage])

  const selectInfo = (info: AIInfoItem) => {
    setSelectedInfo(info)
  }

  const closeInfo = () => {
    setSelectedInfo(null)
  }

  // 로딩 상태 표시 개선
  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-white -mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white/80 text-lg font-medium whitespace-nowrap">잠시만 기다려주세요</p>
        </div>
      </div>
    )
  }

  // 에러 상태 표시
  if (titlesError && datesError && allError) {
    return (
      <div className="glass rounded-2xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-white">
          <FaRobot className="w-12 h-12 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold mb-2">데이터 로딩 실패</h3>
          <p className="text-white/70 mb-3 text-sm">AI 정보를 불러올 수 없습니다.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition-all"
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  // 데이터가 없는 경우
  if (actualAIInfo.length === 0) {
    return (
      <div className="glass rounded-2xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center">
        <div className="text-center text-white">
          <FaRobot className="w-12 h-12 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-semibold mb-2">{t('ai.info.no.data.title')}</h3>
          <p className="text-white/70 mb-3 text-sm">
            {t('ai.info.no.data.description')}
          </p>
          <div className="text-xs text-white/50">
            {t('ai.info.no.data.waiting')}
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
          {t('ai.info.list.mode.title')}
        </h2>
        <div className="flex flex-col items-end gap-1">
          <div className="text-white/60 text-sm">
            {t('ai.info.list.total.count').replace('{count}', String(filteredAIInfo.length))}
          </div>
          <div className="text-white/80 text-xs">
            {(() => {
              // localStorage에서 실제 학습완료된 AI 정보 카드 수 계산 (날짜별 모드와 동일)
              let totalLearned = 0
              if (typeof window !== 'undefined') {
                try {
                  const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}')
                  const sessionProgress = userProgress[sessionId]
                  if (sessionProgress) {
                    Object.keys(sessionProgress).forEach(date => {
                      if (date !== '__stats__' && date !== 'terms_by_date') {
                        const learnedIndices = sessionProgress[date] || []
                        // 중복 제거하지 않고 모든 학습완료된 카드 수 계산 (날짜별 모드와 동일)
                        totalLearned += learnedIndices.length
                      }
                    })
                  }
                } catch (error) {
                  console.error('로컬 스토리지 데이터 파싱 오류:', error)
                }
              }
              return `학습완료: ${totalLearned}개 (날짜별 모드와 일치)`
            })()}
          </div>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="flex flex-col gap-4">
        {/* 검색창 */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-sm font-light drop-shadow-sm z-10" />
          <input
            type="text"
            placeholder={t('ai.info.list.search.placeholder')}
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
        
        {/* 필터 버튼들 - 가로 1줄로 배열 */}
        <div className="flex items-center gap-3">
          {/* 정렬순 드롭다운 버튼 */}
          <div className="relative flex-1 max-w-[180px]">
            <button
              onTouchStart={handleWebViewTouch(() => setShowSortDropdown(!showSortDropdown))}
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 text-white px-3 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 border border-purple-400/30 w-full min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                <Settings className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-xs">{t('ai.info.sort')}</span>
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
                    <div className="text-white/95 text-xs font-semibold mb-1">{t('ai.info.sort.options')}</div>
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
                            🕒 {t('ai.info.sort.by.date')}
                          </div>
                          <div className={`text-xs mt-0.5 leading-tight ${
                            sortBy === 'date'
                              ? 'text-emerald-100/80'
                              : 'text-white/90'
                          }`}>
                            {t('ai.info.sort.by.date.description')}
                          </div>
                        </div>
                        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <ChevronRight className="w-3 h-3 text-purple-300" />
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => {
                        setSortBy('title')
                        setShowSortDropdown(false)
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 group border ${
                        sortBy === 'title'
                          ? 'bg-gradient-to-r from-emerald-600/30 via-emerald-500/35 to-emerald-600/30 border-emerald-400/50'
                          : 'bg-gradient-to-r from-slate-800/60 via-slate-700/70 to-slate-800/60 hover:from-slate-700/80 hover:via-slate-600/85 hover:to-slate-700/80 border-slate-600/50 hover:border-slate-500/70'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-xs leading-tight flex items-center gap-2 ${
                            sortBy === 'title'
                              ? 'text-emerald-100 group-hover:text-emerald-50'
                              : 'text-white group-hover:text-purple-200'
                          } transition-colors`}>
                            📝 {t('ai.info.sort.by.title')}
                          </div>
                          <div className={`text-xs mt-0.5 leading-tight ${
                            sortBy === 'title'
                              ? 'text-emerald-100/80'
                              : 'text-white/90'
                          }`}>
                            {t('ai.info.sort.by.title.description')}
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
                            📏 {localLanguage === 'ko' ? '길이순' : 
                                localLanguage === 'en' ? 'By Length' : 
                                localLanguage === 'ja' ? '長さ順' : '按长度'}
                          </div>
                          <div className={`text-xs mt-0.5 leading-tight ${
                            sortBy === 'length'
                              ? 'text-emerald-100/80'
                              : 'text-white/90'
                          }`}>
                            {localLanguage === 'ko' ? '내용 길이순 정렬' : 
                             localLanguage === 'en' ? 'Sort by content length' : 
                             localLanguage === 'ja' ? '内容長さ順並び替え' : '按内容长度排序'}
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
          
          {/* 페이지당 항목 수 드롭다운 버튼 */}
          <div className="relative flex-1 max-w-[180px]">
            <button
              onTouchStart={handleWebViewTouch(() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown))}
              onClick={() => setShowItemsPerPageDropdown(!showItemsPerPageDropdown)}
              className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 text-white px-3 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 border border-purple-400/30 w-full min-h-[44px]"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                <Settings className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                <span className="text-xs">{itemsPerPage}{t('category.mode.count')}</span>
              </span>
            </button>

            {/* 페이지당 항목 수 옵션 드롭다운 */}
            <AnimatePresence>
              {showItemsPerPageDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-2 z-20 bg-gradient-to-br from-black/95 via-slate-900/98 to-black/95 backdrop-blur-2xl rounded-2xl p-3 border border-purple-500/40 shadow-xl shadow-black/60 w-full min-w-[180px]"
                  style={{
                    left: '0',
                    right: '0'
                  }}
                >
                  <div className="text-center mb-2">
                    <div className="text-white/95 text-xs font-semibold mb-1">{t('ai.info.items.per.page.select')}</div>
                    <div className="w-full bg-white/20 rounded-full h-0.5">
                      <div className="bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 h-0.5 rounded-full transition-all duration-300" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    {[5, 10, 30, 50].map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setItemsPerPage(size)
                          setCurrentPage(1)
                          setShowItemsPerPageDropdown(false)
                        }}
                        className={`w-full text-left p-2.5 rounded-xl transition-all duration-200 group border ${
                          itemsPerPage === size
                            ? 'bg-gradient-to-r from-emerald-600/30 via-emerald-500/35 to-emerald-600/30 border-emerald-400/50'
                            : 'bg-gradient-to-r from-slate-800/60 via-slate-700/70 to-slate-800/60 hover:from-slate-700/80 hover:via-slate-600/85 hover:to-slate-700/80 border-slate-600/50 hover:border-slate-500/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className={`font-semibold text-xs leading-tight flex items-center gap-2 ${
                              itemsPerPage === size
                                ? 'text-emerald-100 group-hover:text-emerald-50'
                                : 'text-white group-hover:text-purple-200'
                            } transition-colors`}>
                              📄 {t(`ai.info.items.${size}`)}
                            </div>
                            <div className={`text-xs mt-0.5 leading-tight ${
                              itemsPerPage === size
                                ? 'text-emerald-100/80'
                                : 'text-white/90'
                            }`}>
                              {t('ai.info.items.per.page.display', { count: size })}
                            </div>
                          </div>
                          <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                            <ChevronRight className="w-3 h-3 text-purple-300" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* 즐겨찾기만 버튼 */}
          <button
            onTouchStart={() => {
              if (isProcessing) return
              setIsProcessing(true)
              setShowFavoritesOnly(prev => !prev)
              setTimeout(() => setIsProcessing(false), 300)
            }}
            onClick={() => {
              if (isProcessing) return
              setIsProcessing(true)
              setShowFavoritesOnly(prev => !prev)
              setTimeout(() => setIsProcessing(false), 300)
            }}
            className={`px-2 py-2.5 rounded-xl text-xs font-medium transition-all touch-manipulation select-none min-h-[44px] min-w-[70px] webview-button flex items-center justify-center gap-2 ${
              showFavoritesOnly
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg ring-2 ring-green-400/30 border border-green-300/40'
                : 'bg-white/10 text-white/70 hover:bg-white/20 active:bg-white/30 border border-white/20'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <FaStar 
              className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'text-yellow-400' : 'text-white'}`} 
              fill={showFavoritesOnly ? 'currentColor' : 'none'} 
              stroke={showFavoritesOnly ? 'none' : 'currentColor'} 
              strokeWidth={showFavoritesOnly ? 0 : 2}
            />
            <span className="text-xs font-medium">{t('ai.info.favorite')}</span>
          </button>
        </div>
      </div>

             {/* {t('ai.info.list.title')} */}
       <div className="grid gap-4 w-full">
         {currentItems.map((info, index) => {
           const itemKey = generateFavoriteKey(info)
           const isExpanded = expandedItems.has(itemKey)
           const loadedContent = loadedContents.get(itemKey)
           
           return (
             <div key={info.id} className="relative">
               {/* 제목 카드 */}
               <div className="bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 border-2 border-purple-600/50 rounded-xl p-4 shadow-lg shadow-purple-900/30 backdrop-blur-xl">
                 <div className="flex items-center justify-between mb-3">
                   <div className="flex-1">
                     {/* 카테고리 정보를 제일 위로 이동 */}
                     {info.category && (
                       <div className="mb-2">
                         <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-purple-600/40 to-blue-600/40 border border-purple-500/50 rounded-lg text-xs font-medium text-white/90 shadow-sm">
                          🏷️ {info.category}
                         </span>
                       </div>
                     )}
                     
                     <h3 className="text-lg font-semibold text-white mb-2">{info.title}</h3>
                     <div className="flex items-center gap-3 text-sm text-white/70">
                       <span className="flex items-center gap-1">
                         <FaCalendar className="w-3 h-3" />
                         {info.date}
                       </span>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                     {/* 즐겨찾기 버튼 */}
                     <button
                       onClick={() => toggleFavorite(itemKey)}
                       className={`p-2 rounded-lg transition-all ${
                         favoriteInfos.has(itemKey)
                           ? 'text-yellow-400 bg-yellow-400/20'
                           : 'text-white/70 hover:text-white hover:bg-white/20'
                       }`}
                     >
                       <FaStar 
                         className={`w-4 h-4 ${favoriteInfos.has(itemKey) ? 'fill-current' : ''}`}
                       />
                     </button>
                     
                     {/* 확장/축소 버튼 */}
                     <button
                       onClick={() => toggleItemExpansion(info as AITitleItem)}
                       className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/20 transition-all"
                     >
                       {isExpanded ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                     </button>
                   </div>
                 </div>
                 
                 {/* 확장된 상세 내용 */}
                 {isExpanded && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     transition={{ duration: 0.3 }}
                     className="overflow-hidden"
                   >
                     {loadedContent ? (
                       <div className="mt-4 pt-4 border-t border-purple-600/30">
                         <AIInfoCard
                           info={{
                             title: loadedContent.title,
                             content: loadedContent.content,
                             terms: loadedContent.terms
                           }}
                           index={loadedContent.info_index || 0}
                           date={loadedContent.date || ''}
                           sessionId={sessionId}
                           isLearned={false}
                           onProgressUpdate={onProgressUpdate}
                           isFavorite={favoriteInfos.has(itemKey)}
                           onFavoriteToggle={() => toggleFavorite(itemKey)}
                           searchQuery={searchQuery}
                         />
                       </div>
                     ) : (
                       <div className="mt-4 pt-4 border-t border-purple-600/30 flex items-center justify-center py-8">
                         <div className="flex items-center gap-3">
                           <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                           <span className="text-white/70 text-sm">상세 내용을 로딩 중...</span>
                         </div>
                       </div>
                     )}
                   </motion.div>
                 )}
               </div>
             </div>
           )
         })}
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
                ? 'text-white/30 cursor-not-allowed'
                : 'text-white/70 hover:text-white'
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
                      : 'bg-gradient-to-br from-purple-900/40 via-purple-800/50 to-purple-900/40 text-white/80 hover:from-purple-800/60 hover:via-purple-700/70 hover:to-purple-800/60 active:from-purple-700/80 active:via-purple-600/90 active:to-purple-700/80 border border-purple-500/30 backdrop-blur-xl hover:border-purple-400/50'
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
                ? 'text-white/30 cursor-not-allowed'
                : 'text-white/70 hover:text-white'
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

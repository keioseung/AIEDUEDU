'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaCalendar, FaStar, FaSearch, FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import { Settings, ChevronRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
import { t, getCurrentLanguage } from '@/lib/i18n'
import type { AIInfoItem } from '@/types'
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
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const [showItemsPerPageDropdown, setShowItemsPerPageDropdown] = useState(false)
  const [localLanguage, setLocalLanguage] = useState(currentLanguage)

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


  // 모든 AI 정보 가져오기 (getAll API 시도)
  const { data: allAIInfo = [], isLoading: isLoadingAll, error: getAllError } = useQuery<AIInfoItem[]>({
    queryKey: ['all-ai-info', localLanguage],
    queryFn: async () => {
      try {
        console.log(`getAll API 호출 중... (언어: ${localLanguage})`)
        console.log(`API URL: /api/ai-info/all?language=${localLanguage}`)
        
        const response = await aiInfoAPI.getAll(localLanguage)
        console.log(`getAll API 전체 응답:`, response)
        console.log(`getAll API 응답 데이터:`, response.data)
        console.log(`getAll API 응답 데이터 개수:`, response.data?.length || 0)
        console.log(`getAll API 응답 데이터 타입:`, typeof response.data)
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`getAll API 성공: ${response.data.length}개 항목 반환`)
          response.data.forEach((item, index) => {
            console.log(`항목 ${index}:`, {
              id: item.id,
              date: item.date,
              title: item.title,
              contentLength: item.content?.length || 0,
              termsCount: item.terms?.length || 0
            })
          })
        } else {
          console.log(`getAll API 응답이 배열이 아님:`, response.data)
        }
        
        return response.data || []
      } catch (error) {
        console.error('getAll API 실패:', error)
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

  // 각 날짜별 AI 정보 가져오기 (언어별 데이터 사용)
  const { data: dateBasedAIInfo = [], isLoading: isLoadingDateBased } = useQuery<AIInfoItem[]>({
    queryKey: ['date-based-ai-info', allDates, localLanguage],
    queryFn: async () => {
      if (allDates.length === 0) return []
      
      const allInfo: AIInfoItem[] = []
      
      for (const date of allDates) {
        try {
          const response = await aiInfoAPI.getByDate(date)
          const dateInfos = response.data
          
          dateInfos.forEach((info: any, index: number) => {
            // 현재 언어에 맞는 데이터만 사용
            const title = info[`title_${localLanguage}`] || info.title_ko || info.title
            const content = info[`content_${localLanguage}`] || info.content_ko || info.content
            const terms = info[`terms_${localLanguage}`] || info.terms_ko || info.terms || []
            
            if (title && content) {
              allInfo.push({
                id: `${date}_${index}`,
                date: date,
                title: title,
                content: content,
                terms: terms,
                category: info.category || '',
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
  const generateFavoriteKey = (info: AIInfoItem) => {
    // info.id가 있으면 그것을 사용, 없으면 date와 info_index 조합 사용
    // 모든 키를 문자열로 변환하여 반환
    return String(info.id || `${info.date}_${info.info_index}`)
  }


  // 필터링 및 정렬된 AI 정보
  const filteredAIInfo = (() => {
    let filtered = actualAIInfo

    // 검색 필터
    if (searchQuery) {
      filtered = filtered.filter(info => 
        info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.terms?.some(term => 
          term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
          term.description.toLowerCase().includes(searchQuery.toLowerCase())
        ) || false
      )
    }

    // 즐겨찾기 필터
    if (showFavoritesOnly) {
      console.log('즐겨찾기만 필터 적용, 현재 즐겨찾기 목록:', [...favoriteInfos])
      filtered = filtered.filter(info => {
        const favoriteKey = generateFavoriteKey(info)
        const isFavorite = favoriteInfos.has(favoriteKey)
        console.log(`정보 ${info.title} (${favoriteKey}) 즐겨찾기 상태:`, isFavorite)
        return isFavorite
      })
      console.log('필터링 후 결과:', filtered.length, '개')
    }

    // 정렬
    switch (sortBy) {
      case 'title':
        return filtered.sort((a, b) => a.title.localeCompare(b.title))
      case 'length':
        return filtered.sort((a, b) => a.content.length - b.content.length)
      case 'date':
      default:
        return filtered.sort((a, b) => {
          const dateA = a.date ? new Date(a.date).getTime() : 0
          const dateB = b.date ? new Date(b.date).getTime() : 0
          return dateB - dateA
        })
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
          <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-white -mt-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
              <p className="text-white/80 text-lg font-medium whitespace-nowrap">{t('loading.please.wait')}</p>
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
            <h3 className="text-xl font-semibold text-white">{t('ai.info.no.data.title')}</h3>
            <p className="text-white/70 text-base">
              {t('ai.info.no.data.description')}
            </p>
            <div className="text-sm text-white/50">
              {t('ai.info.no.data.waiting')}
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
          {t('ai.info.list.mode.title')}
        </h2>
        <div className="text-white/60 text-sm">
          {t('ai.info.list.total.count').replace('{count}', String(filteredAIInfo.length))}
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
                            📏 {t('ai.info.sort.by.length')}
                          </div>
                          <div className={`text-xs mt-0.5 leading-tight ${
                            sortBy === 'length'
                              ? 'text-emerald-100/80'
                              : 'text-white/90'
                          }`}>
                            {t('ai.info.sort.by.length.description')}
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
            onClick={() => {
              setShowFavoritesOnly(!showFavoritesOnly)
            }}
            className={`px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center gap-2 min-h-[44px] min-w-[120px] ${
              showFavoritesOnly
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg border border-green-400/50'
                : 'bg-gradient-to-br from-slate-800/80 via-purple-900/90 to-slate-800/80 text-white/70 hover:from-purple-700/60 hover:via-purple-600/70 hover:to-purple-700/60 active:from-purple-800/80 active:via-purple-700/90 active:to-purple-800/80 border border-purple-500/40 backdrop-blur-xl'
            }`}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <FaStar className={`w-3.5 h-3.5 transition-all duration-300 ${
              showFavoritesOnly 
                ? 'text-yellow-400 drop-shadow-sm' 
                : 'text-white/30 border border-white/30 rounded-sm'
            }`} />
                                    <span className="text-xs">{t('ai.info.favorite')}</span>
          </button>
        </div>
      </div>

             {/* {t('ai.info.list.title')} */}
       <div className="grid gap-4 w-full">
         {currentItems.map((info, index) => (
           <div key={info.id} className="relative">
             <AIInfoCard
               info={{
                 title: info.title,
                 content: info.content,
                 terms: info.terms
               }}
               index={info.info_index || 0}
               date={info.date || ''}
               sessionId={sessionId}
               isLearned={false}
               onProgressUpdate={onProgressUpdate}
               isFavorite={favoriteInfos.has(generateFavoriteKey(info))}
               onFavoriteToggle={() => toggleFavorite(generateFavoriteKey(info))}
               searchQuery={searchQuery}
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

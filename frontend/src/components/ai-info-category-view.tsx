'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaFilter, FaSearch, FaChevronDown, FaChevronRight, FaStar, FaCalendar } from 'react-icons/fa'
import { Image, MessageSquare, Brain, Zap, Globe, Shield, Settings, Palette } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
import { t } from '@/lib/i18n'
import AIInfoCard from './ai-info-card'

interface AIInfoItem {
  id: string
  date: string
  title: string
  content: string
  terms: Array<{ term: string; description: string }>
  category: string
  subcategory?: string
  confidence?: number
  created_at: string
  info_index?: number
}

interface CategoryStats {
  [category: string]: {
    count: number
    dates: string[]
  }
}

interface AIInfoCategoryViewProps {
  sessionId: string
  currentLanguage: 'ko' | 'en' | 'ja' | 'zh'
  onProgressUpdate: () => void
}

// 카테고리별 아이콘과 색상 정의
const getCategoryStyle = (category: string): { icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string } => {
  const categoryStyles: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }> = {
    '이미지 생성 AI': {
      icon: <Image className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-500/40'
    },
    '챗봇/대화형 AI': {
      icon: <MessageSquare className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-500/40'
    },
    '자연어 처리 AI': {
      icon: <Brain className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-300',
      borderColor: 'border-green-500/40'
    },
    '음성 인식/합성 AI': {
      icon: <Zap className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
      textColor: 'text-yellow-300',
      borderColor: 'border-yellow-500/40'
    },
    'AI 응용 서비스': {
      icon: <Globe className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20',
      textColor: 'text-indigo-300',
      borderColor: 'border-indigo-500/40'
    },
    'AI 보안/윤리': {
      icon: <Shield className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
      textColor: 'text-red-300',
      borderColor: 'border-red-500/40'
    },
    'AI 개발 도구': {
      icon: <Settings className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20',
      textColor: 'text-teal-300',
      borderColor: 'border-teal-500/40'
    },
    'AI 창작 도구': {
      icon: <Palette className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-pink-500/20 to-rose-500/20',
      textColor: 'text-pink-300',
      borderColor: 'border-pink-500/40'
    },
    '코딩/개발 도구': {
      icon: <Settings className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
      textColor: 'text-emerald-300',
      borderColor: 'border-emerald-500/40'
    },
    '음성/오디오 AI': {
      icon: <Zap className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20',
      textColor: 'text-amber-300',
      borderColor: 'border-amber-500/40'
    },
    '데이터 분석/ML': {
      icon: <Brain className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-violet-500/20 to-purple-500/20',
      textColor: 'text-violet-300',
      borderColor: 'border-violet-500/40'
    },
    'AI 윤리/정책': {
      icon: <Shield className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-rose-500/20 to-red-500/20',
      textColor: 'text-rose-300',
      borderColor: 'border-rose-500/40'
    },
    'AI 하드웨어/인프라': {
      icon: <Settings className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-slate-500/20 to-gray-500/20',
      textColor: 'text-slate-300',
      borderColor: 'border-slate-500/40'
    }
  }
  
  return categoryStyles[category] || {
    icon: <Brain className="w-4 h-4" />,
    bgColor: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
    textColor: 'text-purple-300',
    borderColor: 'border-purple-500/40'
  }
}

export default function AIInfoCategoryView({ sessionId, currentLanguage, onProgressUpdate }: AIInfoCategoryViewProps) {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [favoriteInfos, setFavoriteInfos] = useState<Set<string>>(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [forceUpdate, setForceUpdate] = useState(0)

  // 모든 카테고리 가져오기
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery<string[]>({
    queryKey: ['ai-categories'],
    queryFn: async () => {
      try {
        const response = await aiInfoAPI.getAllCategories()
        return response.data
      } catch (error) {
        console.log('카테고리 가져오기 실패:', error)
        return []
      }
    },
    staleTime: 30000, // 30초
    gcTime: 300000, // 5분
    refetchOnWindowFocus: false
  })

  // 카테고리별 통계 가져오기
  const { data: categoryStats = {}, isLoading: isLoadingStats } = useQuery<CategoryStats>({
    queryKey: ['ai-category-stats'],
    queryFn: async () => {
      try {
        console.log('카테고리 통계 요청 중...')
        const response = await aiInfoAPI.getCategoryStats()
        console.log('카테고리 통계 응답:', response.data)
        return response.data
      } catch (error) {
        console.error('카테고리 통계 가져오기 실패:', error)
        return {}
      }
    },
    staleTime: 30000, // 30초
    gcTime: 300000, // 5분
    refetchOnWindowFocus: false
  })

  // 선택된 카테고리의 AI 정보 가져오기
  const { data: categoryAIInfo = [], isLoading: isLoadingCategoryInfo } = useQuery<AIInfoItem[]>({
    queryKey: ['ai-info-by-category', selectedCategory, currentLanguage],
    queryFn: async () => {
      if (!selectedCategory) return []
      try {
        console.log(`카테고리 "${selectedCategory}" 정보 요청 중... (언어: ${currentLanguage})`)
        const response = await aiInfoAPI.getByCategory(selectedCategory, currentLanguage)
        console.log(`카테고리 "${selectedCategory}" 응답:`, response.data)
        return response.data
      } catch (error) {
        console.error(`카테고리 "${selectedCategory}" AI 정보 가져오기 실패:`, error)
        return []
      }
    },
    enabled: !!selectedCategory,
    staleTime: 0, // 항상 새로운 데이터 요청
    gcTime: 0, // 캐시하지 않음 (React Query v4)
    refetchOnMount: true, // 컴포넌트 마운트 시 재요청
    refetchOnWindowFocus: false // 윈도우 포커스 시 재요청하지 않음
  })

  // 카테고리 토글
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(category)) {
      newExpanded.delete(category)
    } else {
      newExpanded.add(category)
    }
    setExpandedCategories(newExpanded)
  }

  // 카테고리 선택
  const handleCategorySelect = (category: string) => {
    // 이전 카테고리와 다른 경우에만 상태 초기화
    if (selectedCategory !== category) {
      // 이전 카테고리 데이터 완전 제거
      if (selectedCategory) {
        queryClient.removeQueries({ queryKey: ['ai-info-by-category', selectedCategory] })
      }
      
      // 새로운 카테고리로 설정
      setSelectedCategory(category)
      
      // 검색어만 초기화하고 즐겨찾기 상태는 유지
      setSearchQuery('')
      // setShowFavoritesOnly(false) 제거 - 즐겨찾기 모드 유지
      // setFavoriteInfos(new Set()) 제거 - 즐겨찾기 데이터 유지
      
      // 새로운 카테고리 데이터 요청을 위해 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['ai-info-by-category', category] })
    }
  }

  // 즐겨찾기 토글
  const toggleFavorite = useCallback((favoriteKey: string) => {
    console.log('즐겨찾기 토글 호출:', favoriteKey, '현재 상태:', favoriteInfos.has(favoriteKey))
    
    setFavoriteInfos(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(favoriteKey)) {
        newFavorites.delete(favoriteKey)
        console.log('즐겨찾기에서 제거:', favoriteKey)
      } else {
        newFavorites.add(favoriteKey)
        console.log('즐겨찾기에 추가:', favoriteKey)
      }
      
      // 로컬 스토리지에 저장
      if (typeof window !== 'undefined') {
        localStorage.setItem('favoriteAIInfos', JSON.stringify([...newFavorites]))
        console.log('로컬 스토리지에 저장됨')
      }
      
      return newFavorites
    })
    
    // 강제 리렌더링을 위해 forceUpdate 트리거
    setForceUpdate(prev => prev + 1)
  }, [])

  // 로컬 스토리지에서 즐겨찾기 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('favoriteAIInfos')
      if (stored) {
        try {
          setFavoriteInfos(new Set(JSON.parse(stored)))
        } catch (error) {
          console.error('즐겨찾기 데이터 파싱 오류:', error)
        }
      }
    }
  }, [])



  // 필터링된 AI 정보
  const filteredAIInfo = categoryAIInfo.filter((info) => {
    // 검색 필터링
    const matchesSearch = searchQuery === '' || 
      info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    // 즐겨찾기 키 생성 - info.id만 사용 (이미 날짜 정보 포함)
    const favoriteKey = info.id
    
    // 즐겨찾기 필터링
    if (showFavoritesOnly) {
      // 즐겨찾기만 모드일 때는 즐겨찾기된 카드만 표시
      return matchesSearch && favoriteInfos.has(favoriteKey)
    } else {
      // 전체보기 모드일 때는 모든 카드 표시
      return matchesSearch
    }
  })

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    const categoryStyles = {
      '이미지 생성 AI': 'from-purple-500 to-pink-500',
      '챗봇/대화형 AI': 'from-blue-500 to-cyan-500',
      '자연어 처리 AI': 'from-green-500 to-emerald-500',
      '음성 인식/합성 AI': 'from-yellow-500 to-orange-500',
      'AI 응용 서비스': 'from-indigo-500 to-purple-500',
      'AI 보안/윤리': 'from-red-500 to-pink-500',
      'AI 개발 도구': 'from-teal-500 to-cyan-500',
      'AI 창작 도구': 'from-pink-500 to-rose-500',
      '코딩/개발 도구': 'from-emerald-500 to-teal-500',
      '음성/오디오 AI': 'from-amber-500 to-yellow-500',
      '데이터 분석/ML': 'from-violet-500 to-purple-500',
      'AI 윤리/정책': 'from-rose-500 to-red-500',
      'AI 하드웨어/인프라': 'from-slate-500 to-gray-500'
    }
    return categoryStyles[category as keyof typeof categoryStyles] || 'from-gray-500 to-slate-500'
  }

  if (isLoadingCategories || isLoadingStats) {
    return (
      <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-white -mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white/80 text-lg font-medium whitespace-nowrap">{t('loading.please.wait')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex flex-col gap-3">
        {/* 기존 헤더 내용 제거 - 검색 및 필터는 카테고리 목록 밑으로 이동 */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* 카테고리 사이드바 */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-900/80 via-purple-800/90 to-purple-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/40 p-4">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <FaFilter className="text-purple-300" />
              {t('category.mode.select')}
            </h3>
            
            <div className="space-y-1.5">
              {categories.map((category) => {
                const stats = categoryStats[category] || { count: 0, dates: [] }
                const isExpanded = expandedCategories.has(category)
                const isSelected = selectedCategory === category
                
                return (
                  <div key={category} className="space-y-2">
                    {/* 메인 카테고리 */}
                                         <button
                       onClick={() => handleCategorySelect(category)}
                       className={`w-full text-left p-3 rounded-lg transition-all flex items-center justify-between group ${
                         isSelected 
                           ? 'bg-gradient-to-r ' + getCategoryColor(category) + ' text-white shadow-lg' 
                           : 'bg-purple-800/40 hover:bg-purple-700/50 text-white/90 hover:text-white border border-purple-600/30 hover:border-purple-500/50'
                       }`}
                     >
                       <div className="flex items-center gap-3">
                         <FaRobot className="text-lg" />
                         <span className="font-medium">{t(`category.name.${category}`)}</span>
                       </div>
                                               <div className="flex items-center gap-2">
                          <span className="text-sm bg-purple-600/40 text-purple-100 px-2 py-1 rounded-full border border-purple-500/30">
                            {stats.count}{t('category.mode.count')}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCategorySelect(category)
                              // 헤더로 스크롤 이동
                              setTimeout(() => {
                                const headerElement = document.querySelector('.category-header')
                                if (headerElement) {
                                  headerElement.scrollIntoView({ 
                                    behavior: 'smooth', 
                                    block: 'start' 
                                  })
                                }
                              }, 100)
                            }}
                            className="text-white/60 hover:text-white transition"
                          >
                            <FaChevronDown />
                          </button>
                        </div>
                     </button>
                    

                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* AI 정보 표시 영역 */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <div className="space-y-4">
                             {/* 선택된 카테고리 헤더 */}
               <div className={`category-header rounded-2xl p-6 text-white ${getCategoryStyle(selectedCategory).bgColor} border ${getCategoryStyle(selectedCategory).borderColor}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">{t(`category.name.${selectedCategory}`)}</h3>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <FaRobot />
                        {t('category.header.total.infos').replace('{count}', String(filteredAIInfo.length))}
                      </span>
                      {categoryStats[selectedCategory] && (
                        <span className="flex items-center gap-2">
                          <FaCalendar />
                          {t('category.header.updated.days').replace('{days}', String(categoryStats[selectedCategory].dates.length))}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* 검색 및 필터 */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-sm font-light drop-shadow-sm z-10" />
                      <input
                        type="text"
                        placeholder={t('ai.info.search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/40 transition-all duration-200 backdrop-blur-sm"
                        style={{ minWidth: 150, maxWidth: 200 }}
                      />
                    </div>
                    
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
              </div>

              {/* AI 정보 목록 */}
              {isLoadingCategoryInfo ? (
                <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white/80 text-lg font-medium whitespace-nowrap">{t('loading.please.wait')}</p>
                  </div>
                </div>
              ) : filteredAIInfo.length > 0 ? (
                <div className="grid gap-4">
                  {filteredAIInfo.map((info, index) => (
                    <div key={info.id} className="relative">
                                             <AIInfoCard
                         info={{
                           ...info,
                           confidence: info.confidence ? String(info.confidence) : undefined
                         }}
                         index={index}
                         date={info.date || new Date().toISOString().split('T')[0]}
                         sessionId={sessionId}
                         isLearned={false}
                         onProgressUpdate={onProgressUpdate}
                         forceUpdate={forceUpdate}
                         setForceUpdate={setForceUpdate}
                         isFavorite={favoriteInfos.has(info.id)}
                         onFavoriteToggle={(infoId) => {
                           toggleFavorite(infoId)
                         }}
                         searchQuery={searchQuery}
                       />
                      
                      {/* 카테고리 정보 */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {info.subcategory && (
                          <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full text-xs border border-blue-500/30">
                            {info.subcategory}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  {/* 안내 문구와 로봇 아이콘 삭제 */}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              {/* 안내 문구와 로봇 아이콘 삭제 */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

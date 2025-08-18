'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaRobot, FaFilter, FaSearch, FaChevronDown, FaChevronRight, FaStar, FaCalendar } from 'react-icons/fa'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
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
}

interface CategoryStats {
  [category: string]: {
    count: number
    dates: string[]
  }
}

interface AIInfoCategoryViewProps {
  sessionId: string
  onProgressUpdate: () => void
}

export default function AIInfoCategoryView({ sessionId, onProgressUpdate }: AIInfoCategoryViewProps) {
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [favoriteInfos, setFavoriteInfos] = useState<Set<string>>(new Set())
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

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
    }
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
    }
  })

  // 선택된 카테고리의 AI 정보 가져오기
  const { data: categoryAIInfo = [], isLoading: isLoadingCategoryInfo } = useQuery<AIInfoItem[]>({
    queryKey: ['ai-info-by-category', selectedCategory],
    queryFn: async () => {
      if (!selectedCategory) return []
      try {
        console.log(`카테고리 "${selectedCategory}" 정보 요청 중...`)
        const response = await aiInfoAPI.getByCategory(selectedCategory)
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
      
      // 모든 상태 초기화
      setSearchQuery('')
      setShowFavoritesOnly(false)
      setFavoriteInfos(new Set())
      
      // 새로운 카테고리 데이터 요청을 위해 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['ai-info-by-category', category] })
    }
  }

  // 즐겨찾기 토글
  const toggleFavorite = (infoId: string) => {
    const newFavorites = new Set(favoriteInfos)
    if (newFavorites.has(infoId)) {
      newFavorites.delete(infoId)
    } else {
      newFavorites.add(infoId)
    }
    setFavoriteInfos(newFavorites)
  }

  // 필터링된 AI 정보
  const filteredAIInfo = categoryAIInfo.filter(info => {
    const matchesSearch = searchQuery === '' || 
      info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      info.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFavorites = !showFavoritesOnly || favoriteInfos.has(info.id)
    
    return matchesSearch && matchesFavorites
  })

  // 카테고리별 색상 매핑
  const getCategoryColor = (category: string) => {
    const colors = {
      '챗봇/대화형 AI': 'from-blue-500 to-cyan-500',
      '이미지 생성 AI': 'from-purple-500 to-pink-500',
      '코딩/개발 도구': 'from-green-500 to-emerald-500',
      '음성/오디오 AI': 'from-orange-500 to-red-500',
      '데이터 분석/ML': 'from-indigo-500 to-blue-500',
      'AI 윤리/정책': 'from-yellow-500 to-orange-500',
      'AI 하드웨어/인프라': 'from-gray-500 to-slate-500',
      'AI 응용 서비스': 'from-teal-500 to-green-500'
    }
    return colors[category as keyof typeof colors] || 'from-gray-500 to-slate-500'
  }

  if (isLoadingCategories || isLoadingStats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white/70 text-lg">카테고리 정보를 불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaRobot className="text-blue-400" />
            AI 정보 카테고리별 보기
          </h2>
        </div>
        
        {/* 검색 및 필터 */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" />
            <input
              type="text"
              placeholder="AI 정보 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white/10 border border-purple-400/40 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/60 transition-all duration-200"
            />
          </div>
          
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
              showFavoritesOnly 
                ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border border-yellow-400/40 shadow-lg shadow-yellow-500/20' 
                : 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-white/90 border border-purple-400/40 hover:from-purple-500/30 hover:to-pink-500/30 hover:text-white hover:border-purple-300/50'
            }`}
          >
            <FaStar className={showFavoritesOnly ? 'text-yellow-300' : 'text-purple-300'} />
            즐겨찾기만
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 카테고리 사이드바 */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-purple-900/80 via-purple-800/90 to-purple-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-900/40 p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FaFilter className="text-purple-300" />
              카테고리 목록
            </h3>
            
            <div className="space-y-2">
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
                        <span className="font-medium">{category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm bg-purple-600/40 text-purple-100 px-2 py-1 rounded-full border border-purple-500/30">
                          {stats.count}개
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleCategory(category)
                          }}
                          className="text-white/60 hover:text-white transition"
                        >
                          {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
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
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{selectedCategory}</h3>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2">
                    <FaRobot />
                    총 {filteredAIInfo.length}개 정보
                  </span>
                  {categoryStats[selectedCategory] && (
                    <span className="flex items-center gap-2">
                      <FaCalendar />
                      {categoryStats[selectedCategory].dates.length}일간 업데이트
                    </span>
                  )}
                </div>
              </div>

              {/* AI 정보 목록 */}
              {isLoadingCategoryInfo ? (
                <div className="text-center py-8">
                  <div className="text-white/70">AI 정보를 불러오는 중...</div>
                  <div className="text-white/50 text-sm mt-2">새로운 카테고리 데이터를 가져오는 중...</div>
                </div>
              ) : filteredAIInfo.length > 0 ? (
                <div className="grid gap-4">
                  {filteredAIInfo.map((info, index) => (
                    <div key={info.id} className="relative">
                      <AIInfoCard
                        info={info}
                        index={index}
                        date={info.date || new Date().toISOString().split('T')[0]}
                        sessionId={sessionId}
                        isLearned={false}
                        onProgressUpdate={onProgressUpdate}
                        forceUpdate={0}
                        setForceUpdate={() => {}}
                      />
                      
                      {/* 즐겨찾기 버튼 */}
                      <button
                        onClick={() => toggleFavorite(info.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                          favoriteInfos.has(info.id)
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-white/10 text-white/50 border border-white/20 hover:bg-white/20'
                        }`}
                      >
                        <FaStar className="text-sm" />
                      </button>
                      
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
                  <div className="text-white/50 text-lg">해당 카테고리의 AI 정보가 없습니다.</div>
                  <p className="text-white/30 mt-2">
                    {searchQuery ? '검색 조건을 변경해보세요.' : '다른 카테고리를 선택해보세요.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <FaRobot className="text-6xl text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">카테고리를 선택하세요</h3>
              <p className="text-white/50">왼쪽에서 원하는 AI 정보 카테고리를 선택하면 해당 정보를 볼 수 있습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

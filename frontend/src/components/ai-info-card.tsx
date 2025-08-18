'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, BookOpen, ExternalLink, Brain, Trophy, Star, Sparkles, ChevronLeft, ChevronRight, Image, MessageSquare, Cpu, Globe, Zap, Shield, Palette, Bot } from 'lucide-react'
import { useUpdateUserProgress, useCheckAchievements, useUpdateTermProgress, useLearnedTerms } from '@/hooks/use-user-progress'
import { useQueryClient } from '@tanstack/react-query'
import type { AIInfoItem, TermItem } from '@/types'
import { userProgressAPI } from '@/lib/api'

interface AIInfoCardProps {
  info: AIInfoItem
  index: number
  date: string
  sessionId: string
  isLearned: boolean
  onProgressUpdate?: () => void
  forceUpdate?: number
  setForceUpdate?: (fn: (prev: number) => number) => void
  isFavorite?: boolean
  onFavoriteToggle?: (infoId: string) => void
}

// 카테고리별 아이콘과 색상 정의
const getCategoryStyle = (category: string) => {
  const categoryStyles: Record<string, { icon: React.ReactNode; bgColor: string; textColor: string; borderColor: string }> = {
    '이미지 생성 AI': {
      icon: <Image className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-pink-500/20 to-purple-500/20',
      textColor: 'text-pink-300',
      borderColor: 'border-pink-400/50'
    },
    '챗봇/대화형 AI': {
      icon: <MessageSquare className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-400/50'
    },
    'AI 응용 서비스': {
      icon: <Globe className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
      textColor: 'text-green-300',
      borderColor: 'border-green-400/50'
    },
    '자연어 처리': {
      icon: <Bot className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-indigo-500/20 to-blue-500/20',
      textColor: 'text-indigo-300',
      borderColor: 'border-indigo-400/50'
    },
    '머신러닝/딥러닝': {
      icon: <Cpu className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-orange-500/20 to-red-500/20',
      textColor: 'text-orange-300',
      borderColor: 'border-orange-400/50'
    },
    'AI 윤리/안전': {
      icon: <Shield className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20',
      textColor: 'text-yellow-300',
      borderColor: 'border-yellow-400/50'
    },
    'AI 도구/플랫폼': {
      icon: <Zap className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-violet-500/20 to-purple-500/20',
      textColor: 'text-violet-300',
      borderColor: 'border-violet-400/50'
    },
    'AI 연구/동향': {
      icon: <Palette className="w-4 h-4" />,
      bgColor: 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20',
      textColor: 'text-teal-300',
      borderColor: 'border-teal-400/50'
    }
  }
  
  return categoryStyles[category] || {
    icon: <Cpu className="w-4 h-4" />,
    bgColor: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20',
    textColor: 'text-gray-300',
    borderColor: 'border-gray-400/50'
  }
}

function AIInfoCard({ info, index, date, sessionId, isLearned: isLearnedProp, onProgressUpdate, forceUpdate, setForceUpdate, isFavorite: isFavoriteProp, onFavoriteToggle }: AIInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTerms, setShowTerms] = useState(false)
  const [currentTermIndex, setCurrentTermIndex] = useState(0)
  const [showAchievement, setShowAchievement] = useState(false)
  const [showTermAchievement, setShowTermAchievement] = useState(false)
  const [showLearnComplete, setShowLearnComplete] = useState(false)
  const [isLearning, setIsLearning] = useState(false)
  const [showAllTermsComplete, setShowAllTermsComplete] = useState(false)
  const [showRelearnButton, setShowRelearnButton] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isFavorite, setIsFavorite] = useState(isFavoriteProp || false)
  const queryClient = useQueryClient()
  const updateProgressMutation = useUpdateUserProgress()
  const checkAchievementsMutation = useCheckAchievements()
  const updateTermProgressMutation = useUpdateTermProgress()
  const [isLearned, setIsLearned] = useState(isLearnedProp)
  
  // 용어 학습 상태를 React Query로 관리
  const { data: learnedTerms = new Set<string>(), refetch: refetchLearnedTerms } = useLearnedTerms(sessionId, date, index)
  
  // localStorage에서 용어 학습 상태 백업
  const [localLearnedTerms, setLocalLearnedTerms] = useState<Set<string>>(new Set())
  
  // localStorage에서 용어 학습 상태 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`learnedTerms_${sessionId}_${date}_${index}`)
        if (stored) {
          setLocalLearnedTerms(new Set(JSON.parse(stored)))
        }
      } catch {}
    }
  }, [sessionId, date, index])

  // 외부에서 전달받은 즐겨찾기 상태와 동기화
  useEffect(() => {
    if (isFavoriteProp !== undefined) {
      setIsFavorite(isFavoriteProp)
    }
  }, [isFavoriteProp])

  // 즐겨찾기 상태 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const favorites = JSON.parse(localStorage.getItem('favoriteAIInfos') || '[]')
        const favoriteKey = `${date}_${index}`
        setIsFavorite(favorites.includes(favoriteKey))
      } catch {}
    }
  }, [date, index])
  
  // 실제 학습된 용어는 React Query 데이터와 localStorage 데이터를 합침
  const actualLearnedTerms = new Set<string>()
  
  // React Query 데이터에서 문자열만 추가 (우선순위 높음)
  if (learnedTerms instanceof Set) {
    for (const term of learnedTerms) {
      if (typeof term === 'string') {
        actualLearnedTerms.add(term)
      }
    }
  }
  
  // localStorage 데이터 추가 (백업용)
  for (const term of localLearnedTerms) {
    actualLearnedTerms.add(term)
  }

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

    if (isLeftSwipe && hasTerms) {
      handleNextTerm()
    } else if (isRightSwipe && hasTerms) {
      handlePrevTerm()
    }

    setTouchStart(null)
    setTouchEnd(null)
  }

  // 즐겨찾기 토글
  const toggleFavorite = () => {
    if (typeof window !== 'undefined') {
      try {
        const favorites = JSON.parse(localStorage.getItem('favoriteAIInfos') || '[]')
        const favoriteKey = `${date}_${index}`
        
        if (isFavorite) {
          const newFavorites = favorites.filter((key: string) => key !== favoriteKey)
          localStorage.setItem('favoriteAIInfos', JSON.stringify(newFavorites))
          setIsFavorite(false)
        } else {
          favorites.push(favoriteKey)
          localStorage.setItem('favoriteAIInfos', JSON.stringify(favorites))
          setIsFavorite(true)
        }
      } catch {}
    }
  }
  
  // prop이 바뀌거나 forceUpdate, selectedDate가 바뀌면 동기화
  useEffect(() => {
    // localStorage와 백엔드 모두 확인해서 학습 상태 동기화
    let learned = false;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('userProgress');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed[sessionId] && parsed[sessionId][date]) {
            learned = parsed[sessionId][date].includes(index);
          }
        }
      } catch {}
    }
    setIsLearned(isLearnedProp || learned);
  }, [isLearnedProp, forceUpdate, date, sessionId, index]);

  // 용어가 있는지 확인
  const hasTerms = info.terms && info.terms.length > 0
  const currentTerm = hasTerms && info.terms ? info.terms[currentTermIndex] : null

  const handleNextTerm = async () => {
    if (hasTerms && info.terms) {
      // 현재 용어를 학습 완료로 표시
      const currentTerm = info.terms[currentTermIndex]
      if (currentTerm && !actualLearnedTerms.has(currentTerm.term)) {
        try {
          // localStorage에 즉시 저장 (낙관적 업데이트)
          const newLocalTerms = new Set([...localLearnedTerms, currentTerm.term])
          setLocalLearnedTerms(newLocalTerms)
          localStorage.setItem(`learnedTerms_${sessionId}_${date}_${index}`, JSON.stringify([...newLocalTerms]))
          
          // 백엔드 업데이트
          await updateTermProgressMutation.mutateAsync({
            sessionId,
            term: currentTerm.term,
            date,
            infoIndex: index
          })

          // 성취 확인 (지연 실행)
          setTimeout(async () => {
            try {
              const achievementResult = await checkAchievementsMutation.mutateAsync(sessionId)
              if (achievementResult.new_achievements && achievementResult.new_achievements.length > 0) {
                setShowAchievement(true)
                setTimeout(() => setShowAchievement(false), 3000)
              }
            } catch (error) {
              console.error('Failed to check achievements:', error)
            }
          }, 1000)

          // N개 학습완료 알림 매번 표시
          setShowAllTermsComplete(true)
          setTimeout(() => setShowAllTermsComplete(false), 3000)

          // 진행률 업데이트 콜백 호출
          if (onProgressUpdate) {
            onProgressUpdate()
          }
        } catch (error) {
          console.error('Failed to update term progress:', error)
          // 에러 시 localStorage 롤백
          const rollbackTerms = new Set([...localLearnedTerms])
          rollbackTerms.delete(currentTerm.term)
          setLocalLearnedTerms(rollbackTerms)
          localStorage.setItem(`learnedTerms_${sessionId}_${date}_${index}`, JSON.stringify([...rollbackTerms]))
        }
      }
      // 다음 용어로 이동
      setCurrentTermIndex((prev: number) => (prev + 1) % info.terms!.length)
    }
  }

  const handleLearnToggle = async () => {
    if (isLearning) return
    setIsLearning(true)
    try {
      if (isLearned) {
        // 학습 이력 삭제 (학습완료 해제)
        const currentProgress = JSON.parse(localStorage.getItem('userProgress') || '{}')
        if (currentProgress[sessionId] && currentProgress[sessionId][date]) {
          const learnedIndices = currentProgress[sessionId][date].filter((i: number) => i !== index)
          if (learnedIndices.length === 0) {
            delete currentProgress[sessionId][date]
          } else {
            currentProgress[sessionId][date] = learnedIndices
          }
          localStorage.setItem('userProgress', JSON.stringify(currentProgress))
        }
        // 백엔드 기록도 삭제
        try {
          await userProgressAPI.deleteInfoIndex(sessionId, date, index)
        } catch (e) { /* 무시 */ }
        setIsLearned(false)
        if (setForceUpdate) setForceUpdate(prev => prev + 1)
        if (onProgressUpdate) onProgressUpdate()
      } else {
        // 학습 전 상태에서 학습 완료 상태로 변경
    
        await updateProgressMutation.mutateAsync({
          sessionId,
          date,
          infoIndex: index
        })
         setIsLearned(true)
         setShowLearnComplete(true)
         setTimeout(() => setShowLearnComplete(false), 3000)
         
         // 진행률 탭 데이터 새로고침을 위한 쿼리 무효화
         queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
         queryClient.invalidateQueries({ queryKey: ['period-stats', sessionId] })
         
         if (onProgressUpdate) onProgressUpdate()
         const achievementResult = await checkAchievementsMutation.mutateAsync(sessionId)
         if (achievementResult.new_achievements && achievementResult.new_achievements.length > 0) {
           setShowAchievement(true)
         }
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    } finally {
      setIsLearning(false)
    }
  }

  const handlePrevTerm = () => {
    if (hasTerms && info.terms) {
      setCurrentTermIndex((prev: number) => (prev - 1 + info.terms!.length) % info.terms!.length);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass card-hover p-4 md:p-8 lg:p-10 flex flex-col gap-4 md:gap-6 relative shadow-lg border-2 border-purple-700/70 bg-gradient-to-br from-purple-950/80 via-purple-900/90 to-purple-950/80 backdrop-blur-2xl shadow-2xl shadow-purple-900/60"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3 md:mb-4">
        <div className="flex items-center gap-2 md:gap-3">
          <div className={`p-1.5 md:p-2 rounded-full ${isLearned ? 'bg-green-500' : 'bg-blue-500'} shadow-md`}>
            {isLearned ? (
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-white" />
            ) : (
              <Circle className="w-4 h-4 md:w-5 md:h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold gradient-text line-clamp-2 leading-tight">
              {info.title}
            </h3>
            <p className="text-white/60 text-xs md:text-sm">
              {isLearned ? '학습 완료' : '학습 필요'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-lg transition-all ${
              isFavorite
                ? 'text-yellow-400 bg-yellow-500/20'
                : 'text-white/30 hover:text-yellow-400 hover:bg-yellow-500/10'
            }`}
          >
            <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      
      {/* 카테고리 배지 */}
      {info.category && (
        <div className="mb-3 md:mb-4">
          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full border ${getCategoryStyle(info.category).bgColor} ${getCategoryStyle(info.category).borderColor} ${getCategoryStyle(info.category).textColor} backdrop-blur-sm shadow-lg`}>
            {getCategoryStyle(info.category).icon}
            <span className="text-sm font-medium">{info.category}</span>
          </div>
        </div>
      )}
      
      {/* 내용 */}
      <div className="mb-3 md:mb-4 text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-line">
        <p className={isExpanded ? '' : 'line-clamp-3'}>
          {info.content}
        </p>
        {info.content.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn mt-2 text-xs px-3 py-1.5 md:py-2 touch-optimized"
          >
            {isExpanded ? '접기' : '더보기'}
          </button>
        )}
      </div>
      
      {/* 용어 학습 섹션 */}
      {hasTerms && (
        <div className="mb-3 md:mb-4">
          <button
            onClick={() => setShowTerms(!showTerms)}
            className="flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-medium mb-3 touch-optimized mobile-touch-target"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">{showTerms ? '용어 학습 숨기기' : '관련 용어 학습하기'}</span>
            <span className="sm:hidden">{showTerms ? '숨기기' : '용어 학습'}</span>
            {/* 항상 완료 개수 표시 */}
            {hasTerms && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-2">
                {actualLearnedTerms.size}개 완료
              </span>
            )}
          </button>
          
          <AnimatePresence>
            {showTerms && currentTerm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-gradient-to-br from-purple-950/70 via-purple-900/80 to-purple-950/70 backdrop-blur-xl rounded-xl p-3 md:p-4 border-2 border-purple-600/50 shadow-lg shadow-purple-900/40"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* 진행률 바 */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/60">{currentTermIndex + 1} / {info.terms?.length || 0}</span>
                    <span className="text-xs text-green-400 font-bold">{actualLearnedTerms.size}개 학습완료</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-300"
                      style={{ width: `${((currentTermIndex + 1) / (info.terms?.length || 1)) * 100}%` }}
                    />
                  </div>
                </div>
                
                {/* 현재 용어 강조 */}
                <div className="text-center mb-3">
                  <div className="text-xl md:text-2xl font-extrabold text-blue-200 mb-2 animate-pulse mobile-text">
                    {currentTerm.term}
                  </div>
                  <div className="text-white/80 text-sm md:text-base mobile-text">{currentTerm.description}</div>
                </div>
                
                {/* 스와이프 안내 */}
                <div className="text-center mb-3">
                  <p className="text-xs text-white/50">← 스와이프하여 용어 이동 →</p>
                </div>
                
                {/* 이전/다음 버튼 */}
                <div className="flex justify-between gap-2 mb-3">
                  <button
                    onClick={handlePrevTerm}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 md:py-3 bg-blue-400/80 text-white rounded-lg hover:bg-blue-500 transition text-sm font-medium touch-optimized mobile-touch-target"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">이전</span>
                  </button>
                  <button
                    onClick={handleNextTerm}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 md:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium touch-optimized mobile-touch-target"
                  >
                    <span className="hidden sm:inline">다음</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                {/* 전체 용어 목록 점프 - 모바일 최적화 */}
                <div className="flex flex-wrap gap-1 md:gap-2 justify-center mt-2">
                  {info.terms?.map((term, idx) => (
                    <button
                      key={term.term}
                      onClick={async () => {
                        setCurrentTermIndex(idx);
                        // 클릭한 용어를 학습완료로 표시
                        if (!actualLearnedTerms.has(term.term)) {
                          try {
                            // localStorage에 즉시 저장 (낙관적 업데이트)
                            const newLocalTerms = new Set([...localLearnedTerms, term.term])
                            setLocalLearnedTerms(newLocalTerms)
                            localStorage.setItem(`learnedTerms_${sessionId}_${date}_${index}`, JSON.stringify([...newLocalTerms]))
                            
                            // 백엔드 업데이트
                            await updateTermProgressMutation.mutateAsync({
                              sessionId,
                              term: term.term,
                              date,
                              infoIndex: index
                            })
                            
                            // 진행률 업데이트 콜백 호출
                            if (onProgressUpdate) {
                              onProgressUpdate()
                            }
                          } catch (error) {
                            console.error('Failed to update term progress:', error)
                            // 에러 시 localStorage 롤백
                            const rollbackTerms = new Set([...localLearnedTerms])
                            rollbackTerms.delete(term.term)
                            setLocalLearnedTerms(rollbackTerms)
                            localStorage.setItem(`learnedTerms_${sessionId}_${date}_${index}`, JSON.stringify([...rollbackTerms]))
                          }
                        }
                      }}
                      className={`px-2 py-1 md:px-3 md:py-2 rounded text-xs font-bold border transition-all touch-optimized mobile-touch-target ${
                        idx === currentTermIndex 
                          ? 'bg-green-500 text-white border-green-600' 
                          : actualLearnedTerms.has(term.term) 
                            ? 'bg-green-400/80 text-white border-green-500' 
                            : 'bg-white/20 text-white/70 border-white/30 hover:bg-blue-400/40'
                      }`}
                    >
                      {term.term}
                    </button>
                  ))}
                </div>
                
                {/* 학습 완료 축하 메시지 */}
                {actualLearnedTerms.size === info.terms?.length && info.terms.length > 0 && (
                  <div className="mt-3 md:mt-4 text-center animate-bounce">
                    <span className="inline-block bg-green-500 text-white px-3 md:px-4 py-2 rounded-full font-bold shadow text-sm mobile-text">
                      🎉 모든 용어 학습 완료!
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-2 md:gap-3">
        <button
          onClick={handleLearnToggle}
          disabled={isLearned || isLearning}
          className={`flex-1 flex items-center justify-center gap-2 p-2.5 md:p-3 rounded-lg text-sm font-medium transition-all touch-optimized mobile-touch-target ${
            isLearned
              ? 'bg-green-500 text-white cursor-default'
              : isLearning
                ? 'bg-blue-600 text-white cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="hidden sm:inline">{isLearned ? '학습완료' : '학습완료'}</span>
          <span className="sm:hidden">{isLearned ? '완료' : '학습'}</span>
        </button>
      </div>

      {/* 학습 완료 알림 */}
      <AnimatePresence>
        {showLearnComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 rounded-xl shadow-2xl border border-green-300"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span className="font-bold text-sm">🎉 학습 완료!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 성취 알림 */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-3 md:p-4 rounded-xl shadow-2xl border border-yellow-300"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
              <div>
                <div className="font-bold text-base md:text-lg">🎉 성취 달성!</div>
                <div className="text-xs md:text-sm opacity-90">새로운 성취를 획득했습니다!</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AIInfoCard 

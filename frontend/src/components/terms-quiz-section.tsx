'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, RotateCcw, BookOpen, Target, Trophy, Star, Sparkles, Award, ChevronLeft, ChevronRight, Settings, Zap, Brain } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
import { useUpdateQuizScore, useCheckAchievements } from '@/hooks/use-user-progress'

interface TermsQuizSectionProps {
  sessionId: string
  selectedDate: string
  onProgressUpdate?: () => void
  onDateChange?: (date: string) => void
}

interface TermsQuiz {
  id: number
  question: string
  option1: string
  option2: string
  option3: string
  option4: string
  correct: number
  explanation: string
}

interface TermsQuizResponse {
  quizzes: TermsQuiz[]
  total_terms: number
  message?: string
}

interface AIInfoItem {
  id: string
  date: string
  title: string
  content: string
  terms: Array<{ term: string; description: string }>
  info_index: number
}

function TermsQuizSection({ sessionId, selectedDate, onProgressUpdate, onDateChange }: TermsQuizSectionProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showQuizComplete, setShowQuizComplete] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [finalScore, setFinalScore] = useState<{score: number, total: number, percentage: number} | null>(null)
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('오늘의 주제') // 기본값 오늘의 주제
  const [showQuizTitleSelector, setShowQuizTitleSelector] = useState(false)
  const [wrongAnswerNotes, setWrongAnswerNotes] = useState<TermsQuiz[]>([])
  const [isWrongAnswerMode, setIsWrongAnswerMode] = useState(false)
  const [showWrongAnswerAdded, setShowWrongAnswerAdded] = useState(false)
  const updateQuizScoreMutation = useUpdateQuizScore()
  const checkAchievementsMutation = useCheckAchievements()

  // AI 정보 전체목록 가져오기 (getAll API 시도)
  const { data: allAIInfo = [], isLoading: isLoadingAll, error: getAllError } = useQuery<AIInfoItem[]>({
    queryKey: ['all-ai-info'],
    queryFn: async () => {
      try {
        const response = await aiInfoAPI.getAll()
        console.log('getAll API 성공:', response.data)
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
        console.log('getAllDates API 성공:', response.data)
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

  // 오답 노트에서 퀴즈 제거하는 함수
  const removeFromWrongAnswerNotes = (quizId: number) => {
    setWrongAnswerNotes(prev => prev.filter(quiz => quiz.id !== quizId))
    
    // 오답 노트 모드에서 문제를 삭제한 후 상태 초기화
    if (isWrongAnswerMode) {
      setSelectedAnswer(null)
      setShowResult(false)
      
      // 현재 문제가 삭제된 문제인 경우 다음 문제로 이동
      if (currentQuiz && currentQuiz.id === quizId) {
        if (currentQuizIndex < (quizData?.quizzes?.length || 0) - 1) {
          // 다음 문제가 있으면 다음 문제로 이동
          setCurrentQuizIndex(currentQuizIndex + 1)
        } else if (currentQuizIndex > 0) {
          // 다음 문제가 없고 이전 문제가 있으면 이전 문제로 이동
          setCurrentQuizIndex(currentQuizIndex - 1)
        } else {
          // 마지막 문제였으면 퀴즈 완료 상태로 설정
          const finalScoreData = {
            score: score,
            total: (quizData?.quizzes?.length || 0) - 1, // 삭제된 문제 제외
            percentage: Math.round((score / Math.max((quizData?.quizzes?.length || 0) - 1, 1)) * 100)
          }
          setFinalScore(finalScoreData)
          setQuizCompleted(true)
        }
      }
    }
  }

  // 오답 노트에 퀴즈 추가하는 함수
  const addToWrongAnswerNotes = (quiz: TermsQuiz) => {
    if (!quiz) return // quiz가 없으면 함수 종료
    
    // 현재 상태 유지 (문제 이동 방지)
    setWrongAnswerNotes(prev => {
      // 이미 존재하는지 확인
      const exists = prev.some(q => q.id === quiz.id)
      if (!exists) {
        setShowWrongAnswerAdded(true)
        setTimeout(() => setShowWrongAnswerAdded(false), 2000)
        return [...prev, quiz]
      }
      return prev
    })
    
    // 현재 문제 상태 그대로 유지 (selectedAnswer, showResult 등 변경하지 않음)
  }

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
          console.log(`날짜 ${date}의 AI 정보:`, dateInfos)
          
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
      
      console.log('날짜별 AI 정보 총합:', allInfo.length)
      return allInfo
    },
    enabled: allDates.length > 0 && (getAllError !== null || allAIInfo.length === 0),
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 실제 사용할 AI 정보 (getAll이 성공하면 그것을, 실패하면 날짜별 정보를 사용)
  const actualAIInfo = allAIInfo.length > 0 ? allAIInfo : dateBasedAIInfo
  const isLoadingAIInfo = isLoadingAll || isLoadingDates || isLoadingDateBased

  // 퀴즈 주제 옵션들 (AI 정보 제목들)
  const quizTitleOptions = ['오늘의 주제', ...actualAIInfo.map(info => info.title)]

  // 디버깅을 위한 로그
  console.log('AI 정보 상태:', { 
    allAIInfo: allAIInfo.length, 
    dateBasedAIInfo: dateBasedAIInfo.length, 
    actualAIInfo: actualAIInfo.length,
    isLoading: isLoadingAIInfo, 
    error: getAllError,
    allDates: allDates.length
  })
  console.log('quizTitleOptions:', quizTitleOptions)
  console.log('selectedQuizTitle:', selectedQuizTitle)

  // 선택된 제목에 해당하는 AI 정보 찾기
  const selectedAIInfo = selectedQuizTitle !== '오늘의 주제' 
    ? actualAIInfo.find(info => info.title === selectedQuizTitle)
    : null

  // 퀴즈 데이터 가져오기 (선택된 제목이 있으면 해당 내용의 용어로, 없으면 날짜별로)
  const { data: quizData, isLoading, refetch } = useQuery<TermsQuizResponse>({
    queryKey: ['terms-quiz', selectedDate, selectedQuizTitle, selectedAIInfo?.id, wrongAnswerNotes.length],
    queryFn: async () => {
      if (selectedQuizTitle === '오답 노트') {
        // 오답 노트 모드: 저장된 오답 문제들로 퀴즈 생성
        if (wrongAnswerNotes.length === 0) {
          return { quizzes: [], total_terms: 0, message: "오답 노트에 등록된 문제가 없습니다." }
        }

        // 오답 노트에서 퀴즈 생성 (최대 10개)
        const shuffledQuizzes = wrongAnswerNotes
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(10, wrongAnswerNotes.length))

        return {
          quizzes: shuffledQuizzes,
          total_terms: wrongAnswerNotes.length,
          message: `오답 노트에서 ${shuffledQuizzes.length}개 문제를 가져왔습니다.`
        }
      } else if (selectedQuizTitle !== '오늘의 주제' && selectedAIInfo) {
        // 선택된 제목의 용어로 퀴즈 생성
        const terms = selectedAIInfo.terms || []
        if (terms.length === 0) {
          return { quizzes: [], total_terms: 0, message: "선택된 주제에 등록된 용어가 없습니다." }
        }

        // 용어로부터 퀴즈 생성 (최대 5개)
        const shuffledTerms = terms.sort(() => Math.random() - 0.5).slice(0, Math.min(5, terms.length))
        const quizzes = shuffledTerms.map((term, index) => {
          // 다른 용어들의 설명을 오답 옵션으로 사용
          const otherTerms = terms.filter(t => t.term !== term.term)
          const wrongOptions = otherTerms
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(t => t.description)
          
          // 오답 옵션이 부족한 경우 기본 오답 생성
          while (wrongOptions.length < 3) {
            wrongOptions.push(`"${term.term}"과 관련이 없는 설명입니다.`)
          }
          
          // 옵션들을 섞어서 정답 위치를 랜덤하게 설정
          const allOptions = [term.description, ...wrongOptions]
          const correctIndex = Math.floor(Math.random() * 4)
          const shuffledOptions = [...allOptions]
          if (correctIndex !== 0) {
            const temp = shuffledOptions[0]
            shuffledOptions[0] = shuffledOptions[correctIndex]
            shuffledOptions[correctIndex] = temp
          }
          
          return {
            id: index + 1,
            question: `"${term.term}"의 의미로 가장 적절한 것은?`,
            option1: shuffledOptions[0],
            option2: shuffledOptions[1],
            option3: shuffledOptions[2],
            option4: shuffledOptions[3],
            correct: correctIndex,
            explanation: `${term.term}의 정확한 의미는: ${term.description}`
          }
        })

        return {
          quizzes,
          total_terms: terms.length,
          message: `${selectedAIInfo.title} 주제의 용어로 퀴즈를 생성했습니다.`
        }
      } else {
        // 기존 방식: 날짜별 퀴즈
        const response = await aiInfoAPI.getTermsQuizByDate(selectedDate)
        return response.data
      }
    },
    enabled: !!selectedDate && (selectedQuizTitle === '오늘의 주제' || selectedQuizTitle === '오답 노트' || !!selectedAIInfo),
  })

  const currentQuiz = quizData?.quizzes?.[currentQuizIndex]

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return

    const isCorrect = selectedAnswer === currentQuiz.correct
    if (isCorrect) {
      setScore(score + 1)
    }

    setShowResult(true)
  }

  const handleNextQuiz = async () => {
    if (quizData?.quizzes && currentQuizIndex < quizData.quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else if (quizData?.quizzes && currentQuizIndex === quizData.quizzes.length - 1) {
      // 퀴즈 완료 시 점수 저장 및 성취 확인
      const finalScoreData = {
        score: score,
        total: quizData.quizzes.length,
        percentage: Math.round((score / quizData.quizzes.length) * 100)
      }
      
      setFinalScore(finalScoreData)
      setQuizCompleted(true)
      
      try {
        // 퀴즈 점수 저장
        await updateQuizScoreMutation.mutateAsync({
          sessionId,
          score: finalScoreData.score,
          totalQuestions: finalScoreData.total
        })
        
        // 퀴즈 완료 알림
        setShowQuizComplete(true)
        setTimeout(() => setShowQuizComplete(false), 4000)
        
        // 진행률 업데이트 콜백 호출
        if (onProgressUpdate) {
          onProgressUpdate()
        }
        
        // 성취 확인
        const achievementResult = await checkAchievementsMutation.mutateAsync(sessionId)
        if (achievementResult.new_achievements && achievementResult.new_achievements.length > 0) {
          setShowAchievement(true)
          setTimeout(() => setShowAchievement(false), 4000)
        }
      } catch (error) {
        console.error('Failed to save quiz score:', error)
      }
    }
  }

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)
    setFinalScore(null)
    refetch()
  }

  const handleQuizTitleChange = (title: string) => {
    setSelectedQuizTitle(title)
    setShowQuizTitleSelector(false)
    
    // 오답 노트 모드 설정
    if (title === '오답 노트') {
      setIsWrongAnswerMode(true)
    } else {
      setIsWrongAnswerMode(false)
    }
    
    // 주제가 변경되면 퀴즈 재시작
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)
    setFinalScore(null)
    
    // AI 정보가 로딩 중이 아닐 때만 refetch 실행
    if (!isLoadingAIInfo) {
      refetch()
    }
  }

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'bg-gradient-to-r from-purple-600 to-violet-700 border-purple-500 text-white shadow-lg shadow-purple-600/40'
        : 'bg-gradient-to-br from-purple-800/60 via-purple-700/70 to-purple-800/60 border-purple-600/50 text-white shadow-md shadow-purple-900/30 hover:from-purple-700/70 hover:via-purple-600/80 hover:to-purple-700/70 hover:border-purple-500/70 hover:shadow-lg hover:shadow-purple-800/40 transition-all duration-300'
    }

    if (index === currentQuiz?.correct) {
      return 'bg-gradient-to-r from-emerald-500 to-green-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
    }
    if (selectedAnswer === index && index !== currentQuiz?.correct) {
      return 'bg-gradient-to-r from-rose-500 to-red-600 border-rose-400 text-white shadow-lg shadow-rose-500/30'
    }
    return 'bg-gradient-to-br from-purple-800/60 via-purple-700/70 to-purple-800/60 border-purple-600/50 text-white shadow-md shadow-purple-900/30'
  }

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 90) return "🎉 완벽합니다! 훌륭한 실력이네요!"
    if (percentage >= 80) return "🌟 아주 잘했어요! 거의 다 맞췄네요!"
    if (percentage >= 70) return "👍 좋아요! 꽤 잘 알고 있네요!"
    if (percentage >= 60) return "💪 괜찮아요! 조금만 더 노력하면 됩니다!"
    return "📚 더 공부해보세요! 다음엔 더 잘할 수 있을 거예요!"
  }

  return (
    <section className="mb-8 relative">
      {/* 퀴즈 수 선택기 - 상단에 멋진 디자인으로 배치 */}
      <div className="mb-6">
        <div className="glass rounded-2xl p-4 md:p-6 border border-purple-500/30 shadow-xl shadow-purple-900/30 bg-gradient-to-br from-purple-800/20 via-purple-700/25 to-purple-800/20 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* 왼쪽: 제목과 설명 */}
            <div className="flex items-center gap-3">
              {/* 뇌모양 아이콘과 "용어 퀴즈" 문구 제거 */}
            </div>

            {/* 오른쪽: 퀴즈 주제 선택 버튼 */}
            <div className="flex items-center gap-3 w-full">
               {/* 주제 선택 버튼 */}
               <div className="relative flex-1">
                 <button
                   onClick={() => setShowQuizTitleSelector(!showQuizTitleSelector)}
                   className="group relative overflow-hidden bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 border border-purple-400/30 w-full"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                   <span className="relative z-10 flex items-center gap-2">
                     <Settings className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-300" />
                     <span className="text-sm">주제 선택</span>
                   </span>
                 </button>

                 {/* 주제 선택 드롭다운 */}
                 <AnimatePresence>
                   {showQuizTitleSelector && (
                     <motion.div
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute top-full mt-2 z-20 bg-gradient-to-br from-black/95 via-slate-900/98 to-black/95 backdrop-blur-2xl rounded-2xl p-3 border border-purple-500/40 shadow-xl shadow-black/60 w-full min-w-[280px] md:min-w-[350px]"
                       style={{
                         left: '0',
                         right: '0'
                       }}
                     >
                       <div className="text-center mb-2">
                         <div className="text-white/95 text-xs font-semibold mb-1">주제 선택</div>
                         <div className="w-full bg-white/20 rounded-full h-0.5">
                           <div className="bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 h-0.5 rounded-full transition-all duration-300" />
                         </div>
                       </div>
                       
                       {/* AI 정보 로딩 중 표시 */}
                       {isLoadingAIInfo && (
                         <div className="flex items-center justify-center gap-2 text-white/70">
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                           <div className="text-white/80 text-sm font-medium whitespace-nowrap">잠시만 기다려 주세요.</div>
                         </div>
                       )}
                       
                                                  {/* AI 정보 목록 */}
                           {!isLoadingAIInfo && (
                             <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                               {/* 오답 노트 옵션 추가 */}
                               <button
                                 onClick={() => handleQuizTitleChange('오답 노트')}
                                 className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-red-600/30 via-red-500/35 to-red-600/30 hover:from-red-500/50 hover:via-red-400/55 hover:to-red-500/50 transition-all duration-200 group border border-red-400/50 hover:border-red-400/70"
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="flex-1 min-w-0">
                                     <div className="text-red-100 font-semibold text-xs group-hover:text-red-50 transition-colors leading-tight flex items-center gap-2">
                                       <BookOpen className="w-3 h-3" />
                                       오답 노트
                                     </div>
                                     <div className="text-red-100/80 text-xs mt-0.5 leading-tight">
                                       {wrongAnswerNotes.length}개 문제
                                     </div>
                                   </div>
                                   <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                     <ChevronRight className="w-3 h-3 text-red-200" />
                                   </div>
                                 </div>
                               </button>
                               
                               {/* 오늘의 주제 옵션 추가 */}
                               <button
                                 onClick={() => handleQuizTitleChange('오늘의 주제')}
                                 className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-emerald-600/30 via-emerald-500/35 to-emerald-600/30 hover:from-emerald-500/50 hover:via-emerald-400/55 hover:to-emerald-500/50 transition-all duration-200 group border border-emerald-400/50 hover:border-emerald-400/70"
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="flex-1 min-w-0">
                                     <div className="text-emerald-100 font-semibold text-xs group-hover:text-emerald-50 transition-colors leading-tight flex items-center gap-2">
                                       <Zap className="w-3 h-3" />
                                       오늘의 주제
                                     </div>
                                     <div className="text-emerald-100/80 text-xs mt-0.5 leading-tight">
                                       날짜별 퀴즈
                                     </div>
                                   </div>
                                   <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                     <ChevronRight className="w-3 h-3 text-emerald-200" />
                                   </div>
                                 </div>
                               </button>
                           
                           {actualAIInfo.length > 0 ? (
                             actualAIInfo.map((info, index) => (
                               <button
                                 key={info.title}
                                 onClick={() => handleQuizTitleChange(info.title)}
                                 className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-slate-800/60 via-slate-700/70 to-slate-800/60 hover:from-slate-700/80 hover:via-slate-600/85 hover:to-slate-700/80 transition-all duration-200 group border border-slate-600/50 hover:border-slate-500/70"
                               >
                                 <div className="flex items-start justify-between">
                                   <div className="flex-1 min-w-0">
                                     <div className="text-white font-semibold text-xs group-hover:text-purple-200 transition-colors leading-tight break-words">
                                       {info.title}
                                     </div>
                                     <div className="text-white/90 text-xs mt-0.5 leading-tight">
                                       {info.terms?.length || 0}개 용어
                                     </div>
                                   </div>
                                   <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                                     <ChevronRight className="w-3 h-3 text-purple-300" />
                                   </div>
                                 </div>
                               </button>
                             ))
                           ) : (
                             <div className="text-center py-4">
                               <div className="text-white/80 text-xs font-medium">사용 가능한 주제가 없습니다</div>
                             </div>
                           )}
                         </div>
                       )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>

               {/* 주제 랜덤 선택 버튼 */}
               <button
                 onClick={() => {
                   if (actualAIInfo.length > 0) {
                     const randomIndex = Math.floor(Math.random() * actualAIInfo.length)
                     const randomTitle = actualAIInfo[randomIndex].title
                     handleQuizTitleChange(randomTitle)
                   }
                 }}
                 disabled={actualAIInfo.length === 0}
                 className="group relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 disabled:from-gray-500 disabled:via-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 border border-amber-400/30 hover:border-amber-400/50 disabled:border-gray-400/30"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                 <span className="relative z-10 flex items-center gap-2">
                   <Sparkles className="w-4 h-4 md:w-5 md:h-5 group-hover:animate-pulse" />
                   <span className="text-sm">랜덤</span>
                 </span>
               </button>
            </div>
          </div>

          {/* 선택된 주제 표시 */}
          <div className="mt-4 pt-3 border-t border-purple-500/20">
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
              <Target className="w-4 h-4 text-purple-400" />
              <span>선택된 주제: <span className="text-white font-semibold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">{selectedQuizTitle}</span></span>
            </div>
          </div>
        </div>
      </div>

      

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-white -mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white/80 text-lg font-medium whitespace-nowrap">잠시만 기다려 주세요.</p>
          </div>
        </div>
      ) : (
        <>
          {/* 데이터가 없을 때 */}
          {!quizData?.quizzes || quizData.quizzes.length === 0 && (
            <div className="glass rounded-3xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-purple-800/20 via-purple-700/25 to-purple-800/20 border border-purple-500/30 shadow-2xl shadow-purple-900/30">
              <div className="text-center text-white">
                <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-70" />
                <h3 className="text-lg md:text-xl font-bold mb-3 mobile-text">
                  {selectedQuizTitle === '오답 노트' ? '오답 노트가 비어있습니다' :
                   selectedQuizTitle === '오늘의 주제' ? '등록된 용어가 없습니다' : '선택된 주제에 용어가 없습니다'}
                </h3>
                <p className="text-white/80 mb-4 text-base mobile-text">
                  {quizData?.message || 
                    (selectedQuizTitle === '오답 노트'
                      ? '오답 노트에 등록된 문제가 없습니다. 퀴즈를 풀면서 틀린 문제를 오답 노트에 등록해보세요!'
                      : selectedQuizTitle === '오늘의 주제' 
                      ? `${selectedDate} 날짜에 등록된 용어가 없습니다. 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!`
                      : `"${selectedQuizTitle}" 주제에 등록된 용어가 없습니다. 다른 주제를 선택하거나 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!`
                    )
                  }
                </p>
                <div className="text-sm text-white/60 mobile-text">
                  {selectedQuizTitle === '오답 노트' ? '오답 노트 모드' :
                   selectedQuizTitle === '오늘의 주제' ? `선택한 날짜: ${selectedDate}` : `선택한 주제: ${selectedQuizTitle}`}
                </div>
              </div>
            </div>
          )}

          {/* 퀴즈 내용 - 데이터가 있을 때만 표시 */}
          {quizData?.quizzes && quizData.quizzes.length > 0 && (
            <div className="glass rounded-3xl p-6 md:p-8 bg-gradient-to-br from-purple-800/20 via-purple-700/25 to-purple-800/20 border border-purple-500/30 shadow-2xl shadow-purple-900/30">
              {/* 퀴즈 진행상황 */}
              <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <span className="text-white/80 text-base font-medium mobile-text">
                    {currentQuizIndex + 1} / {quizData.quizzes.length}
                  </span>
                  <span className="text-white font-bold text-base mobile-text bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">
                    점수: {score} / {quizData.quizzes.length}
                  </span>
                </div>
                <div className="w-full bg-white/15 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-purple-500/25"
                    style={{ width: `${((currentQuizIndex + 1) / quizData.quizzes.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* 퀴즈 내용 */}
              {currentQuiz && !quizCompleted && (
                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-base md:text-lg font-bold text-white mb-4 md:mb-6 mobile-text leading-tight bg-gradient-to-r from-white via-white/95 to-white bg-clip-text text-transparent">
                      {currentQuiz.question}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {[currentQuiz.option1, currentQuiz.option2, currentQuiz.option3, currentQuiz.option4].map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showResult}
                        className={`w-full p-4 md:p-5 text-left rounded-2xl border-2 transition-all duration-300 touch-optimized mobile-touch-target ${getOptionClass(index)}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-sm text-purple-200/80">{String.fromCharCode(65 + index)}.</span>
                          <span className="text-sm mobile-text flex-1 font-medium leading-relaxed text-white/85">{option}</span>
                          {showResult && index === currentQuiz.correct && (
                            <CheckCircle className="w-5 h-5 ml-auto flex-shrink-0 text-emerald-400" />
                          )}
                          {showResult && selectedAnswer === index && index !== currentQuiz.correct && (
                            <XCircle className="w-5 h-5 ml-auto flex-shrink-0 text-rose-400" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* 결과 표시 */}
                  <AnimatePresence>
                    {showResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 25 }}
                        className="p-5 rounded-2xl bg-gradient-to-br from-white/12 via-white/15 to-white/12 border border-white/25 shadow-lg shadow-white/10"
                      >
                        <h4 className="text-lg font-bold text-white mb-3 mobile-text">
                          {selectedAnswer === currentQuiz.correct ? '정답입니다! 🎉' : '틀렸습니다 😅'}
                        </h4>
                        <p className="text-white/90 text-base mobile-text leading-relaxed font-medium">{currentQuiz.explanation}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 오답 노트 등록 피드백 */}
                  <AnimatePresence>
                    {showWrongAnswerAdded && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-red-500/20 via-red-600/25 to-red-500/20 border border-red-400/30 shadow-lg shadow-red-500/20"
                      >
                        <div className="flex items-center gap-3 text-red-200">
                          <BookOpen className="w-5 h-5" />
                          <span className="font-semibold text-sm">오답 노트에 등록되었습니다!</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    {!showResult ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className="flex-1 bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 text-white py-4 rounded-2xl font-bold hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed touch-optimized mobile-touch-target text-base shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-400/30"
                      >
                        답안 제출
                      </button>
                    ) : (
                      <>
                        {currentQuizIndex < quizData.quizzes.length - 1 ? (
                          <button
                            onClick={handleNextQuiz}
                            className="flex-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-500 hover:via-green-600 hover:to-emerald-700 touch-optimized mobile-touch-target text-base shadow-xl hover:shadow-2xl transition-all duration-300 border border-emerald-300/30"
                          >
                            다음 문제
                          </button>
                        ) : (
                          <button
                            onClick={handleNextQuiz}
                            className="flex-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white py-4 rounded-2xl font-bold hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 touch-optimized mobile-touch-target text-base shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-300/30"
                          >
                            퀴즈 완료하기
                          </button>
                        )}
                        {isWrongAnswerMode ? (
                          <button
                            onClick={() => removeFromWrongAnswerNotes(currentQuiz.id)}
                            className="px-6 py-4 bg-gradient-to-br from-red-600/30 via-red-700/35 to-red-600/30 text-red-100 rounded-2xl hover:from-red-700/40 hover:via-red-800/45 hover:to-red-700/40 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base font-semibold border border-red-500/40 hover:border-red-500/60 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <XCircle className="w-5 h-5" />
                            <span className="hidden sm:inline">오답 노트에서 삭제</span>
                            <span className="sm:hidden">삭제</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => currentQuiz && addToWrongAnswerNotes(currentQuiz)}
                            disabled={!currentQuiz}
                            className="px-6 py-4 bg-gradient-to-br from-red-500/20 via-red-600/25 to-red-500/20 text-red-200 rounded-2xl hover:from-red-600/30 hover:via-red-700/35 hover:to-red-600/30 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base font-semibold border border-red-400/30 hover:border-red-400/50 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <BookOpen className="w-5 h-5" />
                            <span className="hidden sm:inline">오답 노트 등록</span>
                            <span className="sm:hidden">오답 등록</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* 퀴즈 완료 결과 */}
              {quizCompleted && finalScore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 md:space-y-8"
                >
                  <div className="space-y-4 md:space-y-6">
                    <div className="text-4xl md:text-6xl mb-4 md:mb-6">
                      {finalScore.percentage >= 90 ? '🏆' : 
                       finalScore.percentage >= 80 ? '🥇' : 
                       finalScore.percentage >= 70 ? '🥈' : 
                       finalScore.percentage >= 60 ? '🥉' : '📚'}
                    </div>
                    
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 mobile-text bg-gradient-to-r from-white via-white/95 to-white bg-clip-text text-transparent">
                      퀴즈 완료!
                    </h3>
                    
                    <div className="text-2xl md:text-3xl font-bold text-white mb-4 mobile-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                      {finalScore.score} / {finalScore.total}
                    </div>
                    
                    <div className="text-xl md:text-2xl text-white/90 mb-4 md:mb-6 mobile-text font-semibold">
                      정답률: {finalScore.percentage}%
                    </div>
                    
                    <div className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 mobile-text font-medium">
                      {getScoreMessage(finalScore.percentage)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
                    <button
                      onClick={handleResetQuiz}
                      className="px-8 md:px-10 py-4 bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 text-white rounded-2xl font-bold hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-400/30"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="hidden sm:inline">다시 도전</span>
                      <span className="sm:hidden">재도전</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}

      {/* 퀴즈 완료 알림 */}
      <AnimatePresence>
        {showQuizComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 25 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white p-4 md:p-5 rounded-2xl shadow-2xl border border-emerald-300/50"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Award className="w-6 h-6 md:w-7 md:h-7 animate-bounce" />
              <div>
                <div className="font-bold text-lg md:text-xl">🎉 퀴즈 완료!</div>
                <div className="text-sm md:text-base opacity-95 font-medium">성적이 저장되었습니다!</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 성취 알림 */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.8 }}
            className="fixed top-6 right-6 z-50 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white p-4 md:p-5 rounded-2xl shadow-2xl border border-amber-300/50"
          >
            <div className="flex items-center gap-3 md:gap-4">
              <Trophy className="w-6 h-6 md:w-7 md:h-7 animate-bounce" />
              <div>
                <div className="font-bold text-lg md:text-xl">🎉 성취 달성!</div>
                <div className="text-sm md:text-base opacity-95 font-medium">새로운 성취를 획득했습니다!</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default TermsQuizSection 

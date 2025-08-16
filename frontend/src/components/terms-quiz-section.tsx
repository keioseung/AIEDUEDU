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
    queryKey: ['terms-quiz', selectedDate, selectedQuizTitle, selectedAIInfo?.id],
    queryFn: async () => {
      if (selectedQuizTitle !== '오늘의 주제' && selectedAIInfo) {
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
    enabled: !!selectedDate && (selectedQuizTitle === '오늘의 주제' || !!selectedAIInfo),
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
        ? 'bg-gradient-to-r from-sky-400 to-blue-500 border-sky-300 text-white shadow-lg shadow-sky-500/25'
        : 'bg-gradient-to-br from-white/8 via-white/12 to-white/8 border-white/25 text-white/90 hover:from-white/15 hover:via-white/20 hover:to-white/15 hover:border-white/40 hover:shadow-lg hover:shadow-white/10 transition-all duration-300'
    }

    if (index === currentQuiz?.correct) {
      return 'bg-gradient-to-r from-emerald-400 to-green-500 border-emerald-300 text-white shadow-lg shadow-emerald-500/25'
    }
    if (selectedAnswer === index && index !== currentQuiz?.correct) {
      return 'bg-gradient-to-r from-rose-400 to-red-500 border-rose-300 text-white shadow-lg shadow-rose-500/25'
    }
    return 'bg-gradient-to-br from-white/5 via-white/8 to-white/5 border-white/20 text-white/40'
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
        <div className="glass rounded-3xl p-6 md:p-8 border border-white/25 shadow-2xl shadow-black/20 bg-gradient-to-br from-white/5 via-white/8 to-white/5 backdrop-blur-3xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* 왼쪽: 제목과 설명 */}
            <div className="flex items-center gap-4">
              {/* 뇌모양 아이콘과 "용어 퀴즈" 문구 제거 */}
            </div>

            {/* 오른쪽: 퀴즈 주제 선택 버튼 */}
            <div className="flex items-center gap-4">
               {/* 오늘의 퀴즈 버튼 */}
               <button
                 onClick={() => {
                   const today = new Date().toISOString().split('T')[0]
                   if (onDateChange) {
                     onDateChange(today)
                   }
                   setSelectedQuizTitle('오늘의 주제')
                   setCurrentQuizIndex(0)
                   setSelectedAnswer(null)
                   setShowResult(false)
                   setScore(0)
                   setQuizCompleted(false)
                   setFinalScore(null)
                 }}
                 className="group relative overflow-hidden bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600 hover:from-emerald-500 hover:via-teal-600 hover:to-emerald-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 flex items-center gap-3 hover:scale-105 active:scale-95 border border-emerald-300/30"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                 <span className="relative z-10 flex items-center gap-3">
                   <Zap className="w-5 h-5 md:w-6 md:h-6" />
                   <span className="text-sm md:text-base">오늘의 주제</span>
                 </span>
               </button>

               {/* AI 정보 주제 선택 버튼 */}
               <div className="relative">
                 <button
                   onClick={() => setShowQuizTitleSelector(!showQuizTitleSelector)}
                   className="group relative overflow-hidden bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 hover:from-blue-500 hover:via-purple-600 hover:to-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-500 flex items-center gap-3 hover:scale-105 active:scale-95 border border-blue-300/30"
                 >
                   <div className="absolute inset-0 bg-gradient-to-r from-white/25 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   <span className="relative z-10 flex items-center gap-3">
                     <Settings className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-180 transition-transform duration-500" />
                     <span className="text-sm md:text-base">선택 주제</span>
                   </span>
                 </button>

                 {/* 주제 선택 드롭다운 */}
                 <AnimatePresence>
                   {showQuizTitleSelector && (
                     <motion.div
                       initial={{ opacity: 0, y: 15, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 15, scale: 0.95 }}
                       className="absolute top-full mt-3 z-20 bg-gradient-to-br from-slate-900/98 via-purple-900/98 to-slate-900/98 backdrop-blur-3xl rounded-3xl p-4 border border-white/30 shadow-2xl shadow-black/40"
                       style={{
                         left: '0',
                         right: '0',
                         width: '100%',
                         maxWidth: '100%'
                       }}
                     >
                       <div className="text-center mb-3">
                         <div className="text-white/90 text-sm font-semibold mb-2">주제 선택</div>
                         <div className="w-full bg-white/15 rounded-full h-1">
                           <div className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 h-1 rounded-full transition-all duration-500" />
                         </div>
                       </div>
                       
                       {/* AI 정보 로딩 중 표시 */}
                       {isLoadingAIInfo && (
                         <div className="text-center py-6">
                           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-3"></div>
                           <div className="text-white/80 text-sm font-medium">AI 정보 로딩 중...</div>
                         </div>
                       )}
                       
                       {/* AI 정보 목록 */}
                       {!isLoadingAIInfo && (
                         <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                           {actualAIInfo.length > 0 ? (
                             actualAIInfo.map((info, index) => (
                               <button
                                 key={info.title}
                                 onClick={() => handleQuizTitleChange(info.title)}
                                 className="w-full text-left p-3 rounded-2xl bg-gradient-to-r from-white/8 via-white/12 to-white/8 hover:from-white/15 hover:via-white/20 hover:to-white/15 transition-all duration-300 group border border-white/20 hover:border-white/40"
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="flex-1 min-w-0">
                                     <div className="text-white font-semibold text-sm truncate group-hover:text-blue-300 transition-colors leading-tight">
                                       {info.title}
                                     </div>
                                     <div className="text-white/70 text-xs mt-1 leading-tight">
                                       {info.terms?.length || 0}개 용어
                                     </div>
                                   </div>
                                   <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                     <ChevronRight className="w-4 h-4 text-blue-400" />
                                   </div>
                                 </div>
                               </button>
                             ))
                           ) : (
                             <div className="text-center py-6">
                               <div className="text-white/60 text-sm font-medium">사용 가능한 주제가 없습니다</div>
                             </div>
                           )}
                         </div>
                       )}
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          </div>

          {/* 선택된 주제 표시 */}
          <div className="mt-6 pt-6 border-t border-white/25">
            <div className="flex items-center gap-3 text-white/80 text-base font-medium">
              <Target className="w-5 h-5 text-blue-400" />
              <span>선택된 주제: <span className="text-white font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">{selectedQuizTitle}</span></span>
            </div>
          </div>
        </div>
      </div>

      

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="glass rounded-3xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center bg-gradient-to-br from-white/5 via-white/8 to-white/5 border border-white/25 shadow-2xl shadow-black/20">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-6"></div>
            <p className="text-white/90 text-xl font-semibold whitespace-nowrap overflow-hidden">잠시만 기다려 주세요.</p>
          </div>
        </div>
      )}

      {/* 데이터가 없을 때 */}
      {!isLoading && (!quizData?.quizzes || quizData.quizzes.length === 0) && (
        <div className="glass rounded-3xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-white/5 via-white/8 to-white/5 border border-white/25 shadow-2xl shadow-black/20">
          <div className="text-center text-white">
            <BookOpen className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-70" />
            <h3 className="text-lg md:text-xl font-bold mb-3 mobile-text">
              {selectedQuizTitle === '오늘의 주제' ? '등록된 용어가 없습니다' : '선택된 주제에 용어가 없습니다'}
            </h3>
            <p className="text-white/80 mb-4 text-base mobile-text">
              {quizData?.message || 
                (selectedQuizTitle === '오늘의 주제' 
                  ? `${selectedDate} 날짜에 등록된 용어가 없습니다. 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!`
                  : `"${selectedQuizTitle}" 주제에 등록된 용어가 없습니다. 다른 주제를 선택하거나 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!`
                )
              }
            </p>
            <div className="text-sm text-white/60 mobile-text">
              {selectedQuizTitle === '오늘의 주제' ? `선택한 날짜: ${selectedDate}` : `선택한 주제: ${selectedQuizTitle}`}
            </div>
          </div>
        </div>
      )}

      {/* 퀴즈 내용 - 데이터가 있을 때만 표시 */}
      {!isLoading && quizData?.quizzes && quizData.quizzes.length > 0 && (
        <div className="glass rounded-3xl p-6 md:p-8 bg-gradient-to-br from-white/5 via-white/8 to-white/5 border border-white/25 shadow-2xl shadow-black/20">
          {/* 퀴즈 진행상황 */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <span className="text-white/80 text-base font-medium mobile-text">
                {currentQuizIndex + 1} / {quizData.quizzes.length}
              </span>
              <span className="text-white font-bold text-base mobile-text bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                점수: {score} / {quizData.quizzes.length}
              </span>
            </div>
            <div className="w-full bg-white/15 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/25"
                style={{ width: `${((currentQuizIndex + 1) / quizData.quizzes.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 퀴즈 내용 */}
          {currentQuiz && !quizCompleted && (
            <div className="space-y-6 md:space-y-8">
              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6 mobile-text leading-tight bg-gradient-to-r from-white via-white/95 to-white bg-clip-text text-transparent">
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
                      <span className="font-bold text-base bg-gradient-to-r from-white/90 to-white/70 bg-clip-text text-transparent">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-base mobile-text flex-1 font-medium leading-relaxed">{option}</span>
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

              {/* 액션 버튼 */}
              <div className="flex flex-col sm:flex-row gap-3">
                {!showResult ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 text-white py-4 rounded-2xl font-bold hover:from-blue-500 hover:via-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed touch-optimized mobile-touch-target text-base shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-300/30"
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
                    <button
                      onClick={handleResetQuiz}
                      className="px-6 py-4 bg-gradient-to-br from-white/10 via-white/15 to-white/10 text-white rounded-2xl hover:from-white/15 hover:via-white/20 hover:to-white/15 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base font-semibold border border-white/25 hover:border-white/40 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="hidden sm:inline">다시 시작</span>
                      <span className="sm:hidden">재시작</span>
                    </button>
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
                
                <div className="text-2xl md:text-3xl font-bold text-white mb-4 mobile-text bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
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
                  className="px-8 md:px-10 py-4 bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 text-white rounded-2xl font-bold hover:from-blue-500 hover:via-purple-600 hover:to-blue-700 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-300/30"
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

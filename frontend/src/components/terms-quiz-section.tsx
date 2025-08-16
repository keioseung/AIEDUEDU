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

function TermsQuizSection({ sessionId, selectedDate, onProgressUpdate, onDateChange }: TermsQuizSectionProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showQuizComplete, setShowQuizComplete] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [finalScore, setFinalScore] = useState<{score: number, total: number, percentage: number} | null>(null)
  const [selectedQuizTitle, setSelectedQuizTitle] = useState('전체') // 기본값 전체
  const [showQuizTitleSelector, setShowQuizTitleSelector] = useState(false)
  const updateQuizScoreMutation = useUpdateQuizScore()
  const checkAchievementsMutation = useCheckAchievements()

  // 퀴즈 주제 옵션들 (실제 API에서 받아올 수 있음)
  const quizTitleOptions = [
    '전체',
    'AI 기초 개념',
    '머신러닝',
    '딥러닝',
    '자연어처리',
    '컴퓨터비전',
    '강화학습',
    'AI 윤리',
    'AI 응용',
    'AI 도구'
  ]

  const { data: quizData, isLoading, refetch } = useQuery<TermsQuizResponse>({
    queryKey: ['terms-quiz', selectedDate, selectedQuizTitle],
    queryFn: async () => {
      const response = await aiInfoAPI.getTermsQuizByDate(selectedDate)
      // 선택된 주제에 따라 퀴즈 필터링 (전체인 경우 모든 퀴즈)
      let filteredQuizzes = response.data.quizzes
      
      if (selectedQuizTitle !== '전체') {
        // 실제 API에서는 주제별 필터링 로직이 필요
        // 여기서는 예시로 랜덤하게 선택
        filteredQuizzes = response.data.quizzes.sort(() => Math.random() - 0.5).slice(0, 15)
      }
      
      return {
        ...response.data,
        quizzes: filteredQuizzes
      }
    },
    enabled: !!selectedDate,
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
    refetch()
  }

  const getOptionClass = (index: number) => {
    if (!showResult) {
      return selectedAnswer === index
        ? 'bg-blue-500 border-blue-500 text-white'
        : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
    }

    if (index === currentQuiz?.correct) {
      return 'bg-green-500 border-green-500 text-white'
    }
    if (selectedAnswer === index && index !== currentQuiz?.correct) {
      return 'bg-red-500 border-red-500 text-white'
    }
    return 'bg-white/10 border-white/20 text-white/50'
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
        <div className="glass rounded-2xl p-4 md:p-6 border border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* 왼쪽: 제목과 설명 */}
                               <div className="flex items-center gap-3">
                     <div className="relative">
                       <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                         <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
                       </div>
                       <div className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
                     </div>
                     <div>
                       <h2 className="text-lg md:text-xl font-bold text-white mb-1">용어 퀴즈 설정</h2>
                       <p className="text-white/70 text-sm">주제를 선택하고 도전해보세요!</p>
                     </div>
                   </div>

                               {/* 오른쪽: 퀴즈 주제 선택 버튼 */}
                   <div className="relative">
                     <button
                       onClick={() => setShowQuizTitleSelector(!showQuizTitleSelector)}
                       className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
                     >
                       <Settings className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-300" />
                       <span className="hidden sm:inline">퀴즈 주제</span>
                       <span className="sm:hidden">주제</span>
                       <span className="bg-white/20 px-2 py-1 rounded-lg text-sm font-bold">
                         {selectedQuizTitle}
                       </span>
                     </button>

                                   {/* 퀴즈 주제 선택 드롭다운 */}
                     <AnimatePresence>
                       {showQuizTitleSelector && (
                         <motion.div
                           initial={{ opacity: 0, y: 10, scale: 0.95 }}
                           animate={{ opacity: 1, y: 0, scale: 1 }}
                           exit={{ opacity: 0, y: 10, scale: 0.95 }}
                           className="absolute top-full right-0 mt-2 z-20 bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-slate-800/95 backdrop-blur-2xl rounded-2xl p-3 border border-white/20 shadow-2xl min-w-[250px]"
                         >
                           <div className="text-center mb-3">
                             <div className="text-white/80 text-sm font-medium mb-2">퀴즈 주제 선택</div>
                             <div className="w-full bg-white/10 rounded-full h-1">
                               <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all" />
                             </div>
                           </div>
                           
                           <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                             {quizTitleOptions.map((title) => (
                               <button
                                 key={title}
                                 onClick={() => handleQuizTitleChange(title)}
                                 className={`relative group p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 text-left ${
                                   selectedQuizTitle === title
                                     ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400 text-white shadow-lg'
                                     : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
                                 }`}
                               >
                                 {/* 선택된 경우 빛나는 효과 */}
                                 {selectedQuizTitle === title && (
                                   <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                                 )}
                                 
                                 <div className="relative z-10">
                                   <div className="text-sm md:text-base font-medium">{title}</div>
                                 </div>
                                 
                                 {/* 선택된 경우 체크 아이콘 */}
                                 {selectedQuizTitle === title && (
                                   <div className="absolute top-2 right-2">
                                     <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                       <CheckCircle className="w-3 h-3 text-blue-600" />
                                     </div>
                                   </div>
                                 )}
                               </button>
                             ))}
                           </div>
                           
                           {/* 추가 정보 */}
                           <div className="mt-3 pt-3 border-t border-white/20">
                             <div className="flex items-center justify-center gap-2 text-white/60 text-xs">
                               <Zap className="w-3 h-3" />
                               <span>주제별 맞춤 퀴즈로 학습하세요</span>
                             </div>
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
            </div>
          </div>

                           {/* 현재 선택된 퀴즈 주제 정보 */}
                 <div className="mt-4 pt-4 border-t border-white/20">
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2 text-white/70 text-sm">
                       <Target className="w-4 h-4" />
                       <span>선택된 주제: <span className="text-white font-semibold">{selectedQuizTitle}</span></span>
                     </div>
                     <div className="flex items-center gap-2 text-white/70 text-sm">
                       <Star className="w-4 h-4" />
                       <span>퀴즈 수: <span className="text-white font-semibold">{quizData?.quizzes?.length || 0}개</span></span>
                     </div>
                   </div>
                 </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80 text-lg font-medium whitespace-nowrap overflow-hidden">잠시만 기다려 주세요.</p>
          </div>
        </div>
      )}

      {/* 데이터가 없을 때 */}
      {!isLoading && (!quizData?.quizzes || quizData.quizzes.length === 0) && (
        <div className="glass rounded-2xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center">
          <div className="text-center text-white">
            <BookOpen className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-60" />
            <h3 className="text-base md:text-lg font-semibold mb-2 mobile-text">등록된 용어가 없습니다</h3>
            <p className="text-white/70 mb-3 text-sm mobile-text">
              {quizData?.message || `${selectedDate} 날짜에 등록된 용어가 없습니다. 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!`}
            </p>
            <div className="text-xs text-white/50 mobile-text">
              선택한 날짜: {selectedDate}
            </div>
          </div>
        </div>
      )}

      {/* 퀴즈 내용 - 데이터가 있을 때만 표시 */}
      {!isLoading && quizData?.quizzes && quizData.quizzes.length > 0 && (
        <div className="glass rounded-2xl p-3 md:p-6">
          {/* 퀴즈 진행상황 */}
          <div className="mb-3 md:mb-4">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-white/70 text-sm mobile-text">
                {currentQuizIndex + 1} / {quizData.quizzes.length}
              </span>
              <span className="text-white font-semibold text-sm mobile-text">
                점수: {score} / {quizData.quizzes.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full transition-all"
                style={{ width: `${((currentQuizIndex + 1) / quizData.quizzes.length) * 100}%` }}
              />
            </div>
          </div>

          {/* 퀴즈 내용 */}
          {currentQuiz && !quizCompleted && (
            <div className="space-y-3 md:space-y-4">
              <div>
                <h3 className="text-base md:text-lg font-semibold text-white mb-2 md:mb-3 mobile-text leading-tight">
                  {currentQuiz.question}
                </h3>
              </div>

              <div className="space-y-2">
                {[currentQuiz.option1, currentQuiz.option2, currentQuiz.option3, currentQuiz.option4].map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showResult}
                    className={`w-full p-2.5 md:p-3 text-left rounded-lg border-2 transition-all touch-optimized mobile-touch-target ${getOptionClass(index)}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{String.fromCharCode(65 + index)}.</span>
                      <span className="text-sm mobile-text flex-1">{option}</span>
                      {showResult && index === currentQuiz.correct && (
                        <CheckCircle className="w-4 h-4 ml-auto flex-shrink-0" />
                      )}
                      {showResult && selectedAnswer === index && index !== currentQuiz.correct && (
                        <XCircle className="w-4 h-4 ml-auto flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* 결과 표시 */}
              <AnimatePresence>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="p-3 rounded-lg bg-white/10 border border-white/20"
                  >
                    <h4 className="text-base font-semibold text-white mb-2 mobile-text">
                      {selectedAnswer === currentQuiz.correct ? '정답입니다! 🎉' : '틀렸습니다 😅'}
                    </h4>
                    <p className="text-white/80 text-sm mobile-text">{currentQuiz.explanation}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 액션 버튼 */}
              <div className="flex flex-col sm:flex-row gap-2">
                {!showResult ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2.5 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed touch-optimized mobile-touch-target text-sm"
                  >
                    답안 제출
                  </button>
                ) : (
                  <>
                    {currentQuizIndex < quizData.quizzes.length - 1 ? (
                      <button
                        onClick={handleNextQuiz}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2.5 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 touch-optimized mobile-touch-target text-sm"
                      >
                        다음 문제
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuiz}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-2.5 rounded-lg font-semibold hover:from-yellow-600 hover:to-orange-600 touch-optimized mobile-touch-target text-sm"
                      >
                        퀴즈 완료하기
                      </button>
                    )}
                    <button
                      onClick={handleResetQuiz}
                      className="px-4 py-2.5 bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center justify-center gap-2 touch-optimized mobile-touch-target text-sm"
                    >
                      <RotateCcw className="w-4 h-4" />
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
              className="text-center space-y-3 md:space-y-4"
            >
              <div className="space-y-2 md:space-y-3">
                <div className="text-3xl md:text-5xl mb-2 md:mb-3">
                  {finalScore.percentage >= 90 ? '🏆' : 
                   finalScore.percentage >= 80 ? '🥇' : 
                   finalScore.percentage >= 70 ? '🥈' : 
                   finalScore.percentage >= 60 ? '🥉' : '📚'}
                </div>
                
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 mobile-text">
                  퀴즈 완료!
                </h3>
                
                <div className="text-xl md:text-2xl font-bold text-white mb-2 mobile-text">
                  {finalScore.score} / {finalScore.total}
                </div>
                
                <div className="text-lg md:text-xl text-white/80 mb-3 md:mb-4 mobile-text">
                  정답률: {finalScore.percentage}%
                </div>
                
                <div className="text-base md:text-lg text-white/70 mb-4 md:mb-6 mobile-text">
                  {getScoreMessage(finalScore.percentage)}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <button
                  onClick={handleResetQuiz}
                  className="px-6 md:px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 flex items-center justify-center gap-2 touch-optimized mobile-touch-target text-sm md:text-base"
                >
                  <RotateCcw className="w-4 h-4" />
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
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white p-3 md:p-4 rounded-xl shadow-2xl border border-green-300"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <Award className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />
              <div>
                <div className="font-bold text-base md:text-lg">🎉 퀴즈 완료!</div>
                <div className="text-xs md:text-sm opacity-90">성적이 저장되었습니다!</div>
              </div>
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
    </section>
  )
}

export default TermsQuizSection 
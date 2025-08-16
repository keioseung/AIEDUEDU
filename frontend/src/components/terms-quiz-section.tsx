'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, RotateCcw, BookOpen, Target, Trophy, Star, Sparkles, Award, ChevronLeft, ChevronRight } from 'lucide-react'
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
  const updateQuizScoreMutation = useUpdateQuizScore()
  const checkAchievementsMutation = useCheckAchievements()

  const { data: quizData, isLoading, refetch } = useQuery<TermsQuizResponse>({
    queryKey: ['terms-quiz', selectedDate],
    queryFn: async () => {
      const response = await aiInfoAPI.getTermsQuizByDate(selectedDate)
      return response.data
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
      {/* 로딩 상태 */}
              {isLoading && (
          <div className="glass rounded-2xl p-48 md:p-64 min-h-[80vh] flex items-center justify-center">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <div className="space-y-2">
                <p className="text-white/80 text-lg font-medium" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed' }}>퀴즈를 생성하고 있습니다...</p>
                <p className="text-white/50 text-sm" style={{ writingMode: 'horizontal-tb', textOrientation: 'mixed' }}>잠시만 기다려주세요</p>
              </div>
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
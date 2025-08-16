'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, RotateCcw, BookOpen, Target, Trophy, Star, Sparkles, Award, ChevronLeft, ChevronRight, Brain, Zap, Clock, CheckSquare, XSquare, Bookmark, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react'
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
  const [selectedQuizCount, setSelectedQuizCount] = useState<number>(5)
  const [showQuizSettings, setShowQuizSettings] = useState(true)
  
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

  const handleNextQuiz = () => {
    if (currentQuizIndex < (quizData?.quizzes?.length || 0) - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else {
      setQuizCompleted(true)
      setFinalScore({
        score,
        total: quizData?.quizzes?.length || 0,
        percentage: Math.round((score / (quizData?.quizzes?.length || 1)) * 100)
      })
      setShowQuizComplete(true)
    }
  }

  const handleRetryQuiz = () => {
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)
    setShowQuizComplete(false)
    setFinalScore(null)
    setShowQuizSettings(true)
    refetch()
  }

  const handleStartQuiz = () => {
    setShowQuizSettings(false)
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)
    setShowQuizComplete(false)
    setFinalScore(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="mb-8 relative">
      {/* 퀴즈 설정 */}
      {showQuizSettings && (
        <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">용어 퀴즈</h2>
            <p className="text-white/70 text-lg">퀴즈 수를 선택하고 시작하세요</p>
          </div>

          {/* 퀴즈 수 선택 */}
          <div className="max-w-md mx-auto mb-8">
            <label className="block text-white/70 text-sm font-medium mb-4 text-center">
              퀴즈 수 선택
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[5, 10, 15].map((count) => (
                <motion.button
                  key={count}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedQuizCount(count)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
                    selectedQuizCount === count
                      ? 'border-purple-400 bg-purple-500/20 text-white shadow-lg'
                      : 'border-white/20 bg-white/5 text-white/90 hover:border-white/40 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl font-bold mb-1">{count}</div>
                  <div className="text-xs opacity-80">문제</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* 시작 버튼 */}
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartQuiz}
              className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 shadow-lg text-lg"
            >
              퀴즈 시작하기
            </motion.button>
          </div>
        </div>
      )}

      {/* 퀴즈 진행 */}
      {!showQuizSettings && (
        <>
          {/* 기본 퀴즈 섹션 */}
          <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">용어 퀴즈</h2>
              <p className="text-white/70 text-lg">AI 지식을 테스트해보세요</p>
            </div>

            {(!quizData?.quizzes || quizData.quizzes.length === 0) ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">퀴즈가 없습니다</h3>
                <p className="text-white/70">다른 날짜를 선택해보세요</p>
              </div>
            ) : (
              <>
                {/* 진행률 표시 */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-white/70 text-sm">진행률</span>
                    <span className="text-white font-semibold text-lg">
                      {currentQuizIndex + 1} / {Math.min(selectedQuizCount, quizData.quizzes.length)}
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuizIndex + 1) / Math.min(selectedQuizCount, quizData.quizzes.length)) * 100}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* 문제 */}
                <div className="mb-8">
                  <div className="bg-white/5 rounded-3xl p-8 border border-white/10 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed text-center">
                      {currentQuiz?.question}
                    </h3>
                    
                    {/* 보기들 */}
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((optionIndex) => (
                        <motion.button
                          key={optionIndex}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswerSelect(optionIndex)}
                          className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ${
                            selectedAnswer === optionIndex
                              ? 'border-purple-400 bg-purple-500/20 text-white shadow-lg'
                              : 'border-white/20 bg-white/5 text-white/90 hover:border-white/40 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswer === optionIndex
                                ? 'border-purple-400 bg-purple-400'
                                : 'border-white/40'
                            }`}>
                              {selectedAnswer === optionIndex && (
                                <div className="w-3 h-3 bg-white rounded-full" />
                              )}
                            </div>
                            <span className="font-medium text-lg">
                              {currentQuiz?.[`option${optionIndex}` as keyof TermsQuiz]}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* 답안 제출 버튼 */}
                  <div className="text-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className={`px-12 py-4 rounded-2xl font-semibold transition-all text-lg ${
                        selectedAnswer === null
                          ? 'bg-white/10 text-white/40 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                      }`}
                    >
                      답안 제출
                    </motion.button>
                  </div>
                </div>

                {/* 결과 표시 */}
                {showResult && currentQuiz && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 rounded-3xl p-6 border border-white/10"
                  >
                    <div className="text-center mb-6">
                      {selectedAnswer === currentQuiz.correct ? (
                        <div className="flex items-center justify-center gap-3 text-green-400 mb-3">
                          <CheckCircle className="w-8 h-8" />
                          <span className="text-2xl font-semibold">정답입니다!</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3 text-red-400 mb-3">
                          <XCircle className="w-8 h-8" />
                          <span className="text-2xl font-semibold">틀렸습니다</span>
                        </div>
                      )}
                    </div>

                    {/* 정답과 해설 */}
                    <div className="bg-white/5 rounded-2xl p-6 mb-6">
                      <div className="mb-4">
                        <span className="text-white/70 text-sm">정답: </span>
                        <span className="text-white font-semibold text-lg">
                          {currentQuiz[`option${currentQuiz.correct}` as keyof TermsQuiz]}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/70 text-sm">해설: </span>
                        <span className="text-white text-lg">{currentQuiz.explanation}</span>
                      </div>
                    </div>

                    {/* 다음 문제 버튼 */}
                    <div className="text-center">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleNextQuiz}
                        className="px-10 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-cyan-600 shadow-lg text-lg"
                      >
                        {currentQuizIndex < Math.min(selectedQuizCount, quizData.quizzes.length) - 1 ? '다음 문제' : '퀴즈 완료'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* 퀴즈 완료 */}
          {showQuizComplete && finalScore && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-3xl p-8 border border-white/20 shadow-2xl text-center"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4">퀴즈 완료!</h2>
              
              <div className="bg-white/5 rounded-2xl p-6 mb-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">{finalScore.score}</div>
                    <div className="text-white/70 text-sm">정답</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">{finalScore.total}</div>
                    <div className="text-white/70 text-sm">전체</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white mb-1">{finalScore.percentage}%</div>
                    <div className="text-white/70 text-sm">정답률</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleRetryQuiz}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 shadow-lg"
                >
                  다시 풀기
                </motion.button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </section>
  )
}

export default TermsQuizSection 
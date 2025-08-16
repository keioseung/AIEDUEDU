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
  const [selectedQuizCount, setSelectedQuizCount] = useState(10) // 기본값 10개
  const [showQuizCountSelector, setShowQuizCountSelector] = useState(false)
  
  const updateQuizScoreMutation = useUpdateQuizScore()
  const checkAchievementsMutation = useCheckAchievements()

  // 퀴즈 수 옵션들
  const quizCountOptions = [5, 10, 15, 20, 25, 30]

  const { data: quizData, isLoading, refetch } = useQuery<TermsQuizResponse>({
    queryKey: ['terms-quiz', selectedDate, selectedQuizCount],
    queryFn: async () => {
      const response = await aiInfoAPI.getTermsQuizByDate(selectedDate)
      // 선택된 퀴즈 수만큼 랜덤하게 선택
      const shuffledQuizzes = response.data.quizzes.sort(() => Math.random() - 0.5)
      return {
        ...response.data,
        quizzes: shuffledQuizzes.slice(0, Math.min(selectedQuizCount, response.data.quizzes.length))
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
    refetch()
  }

  const handleQuizCountChange = (count: number) => {
    setSelectedQuizCount(count)
    setShowQuizCountSelector(false)
    // 퀴즈 수가 변경되면 퀴즈 재시작
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
        ? 'border-purple-400 bg-purple-500/20 text-white shadow-lg'
        : 'border-white/20 bg-white/5 text-white/90 hover:border-white/40 hover:bg-white/10'
    }

    if (index === currentQuiz?.correct) {
      return 'border-green-400 bg-green-500/20 text-white shadow-lg'
    }

    if (selectedAnswer === index && selectedAnswer !== currentQuiz?.correct) {
      return 'border-red-400 bg-red-500/20 text-white shadow-lg'
    }

    return 'border-white/20 bg-white/5 text-white/70'
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
                <p className="text-white/70 text-sm">퀴즈 수를 선택하고 도전해보세요!</p>
              </div>
            </div>

            {/* 오른쪽: 퀴즈 수 선택 버튼 */}
            <div className="relative">
              <button
                onClick={() => setShowQuizCountSelector(!showQuizCountSelector)}
                className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 group-hover:rotate-180 transition-transform duration-300" />
                <span className="hidden sm:inline">퀴즈 수</span>
                <span className="sm:hidden">설정</span>
                <span className="bg-white/20 px-2 py-1 rounded-lg text-sm font-bold">
                  {selectedQuizCount}개
                </span>
              </button>

              {/* 퀴즈 수 선택 드롭다운 */}
              <AnimatePresence>
                {showQuizCountSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full right-0 mt-2 z-20 bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-slate-800/95 backdrop-blur-2xl rounded-2xl p-3 border border-white/20 shadow-2xl min-w-[200px]"
                  >
                    <div className="text-center mb-3">
                      <div className="text-white/80 text-sm font-medium mb-2">퀴즈 수 선택</div>
                      <div className="w-full bg-white/10 rounded-full h-1">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full transition-all" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {quizCountOptions.map((count) => (
                        <button
                          key={count}
                          onClick={() => handleQuizCountChange(count)}
                          className={`relative group p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                            selectedQuizCount === count
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 border-blue-400 text-white shadow-lg'
                              : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
                          }`}
                        >
                          {/* 선택된 경우 빛나는 효과 */}
                          {selectedQuizCount === count && (
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse" />
                          )}
                          
                          <div className="relative z-10">
                            <div className="text-lg md:text-xl font-bold mb-1">{count}</div>
                            <div className="text-xs opacity-80">문제</div>
                          </div>
                          
                          {/* 선택된 경우 체크 아이콘 */}
                          {selectedQuizCount === count && (
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
                        <span>더 많은 문제 = 더 높은 점수</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 현재 선택된 퀴즈 수 정보 */}
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Target className="w-4 h-4" />
                <span>선택된 퀴즈 수: <span className="text-white font-semibold">{selectedQuizCount}개</span></span>
              </div>
              <div className="flex items-center gap-2 text-white/70 text-sm">
                <Star className="w-4 h-4" />
                <span>가능한 최대: <span className="text-white font-semibold">{quizData?.total_terms || 0}개</span></span>
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
        <div className="glass rounded-2xl p-8 border border-white/20 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <HelpCircle className="w-8 h-8 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">퀴즈가 없습니다</h3>
          <p className="text-white/70">다른 날짜를 선택해보세요</p>
        </div>
      )}

      {/* 퀴즈 진행 */}
      {!isLoading && quizData?.quizzes && quizData.quizzes.length > 0 && !quizCompleted && (
        <div className="glass rounded-2xl p-8 border border-white/20">
          {/* 진행률 표시 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/70 text-sm">진행률</span>
              <span className="text-white font-semibold text-lg">
                {currentQuizIndex + 1} / {quizData.quizzes.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuizIndex + 1) / quizData.quizzes.length) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* 문제 */}
          <div className="mb-8">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 mb-6">
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
                    className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 text-left ${getOptionClass(optionIndex)}`}
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
              className="bg-white/5 rounded-2xl p-6 border border-white/10"
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
                  {currentQuizIndex < (quizData?.quizzes?.length || 0) - 1 ? '다음 문제' : '퀴즈 완료'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* 퀴즈 완료 */}
      {showQuizComplete && finalScore && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 border border-white/20 text-center"
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
    </section>
  )
}

export default TermsQuizSection 
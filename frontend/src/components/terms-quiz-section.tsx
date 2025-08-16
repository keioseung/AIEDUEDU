'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, RotateCcw, BookOpen, Target, Trophy, Star, Sparkles, Award, ChevronLeft, ChevronRight, Brain, Zap, Clock, CheckSquare, XSquare, Bookmark, TrendingUp, AlertCircle, Lightbulb, Heart, Save, List } from 'lucide-react'
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

interface WrongAnswerNote {
  quizId: number
  question: string
  userAnswer: number
  correctAnswer: number
  explanation: string
  timestamp: Date
  attempts: number
}

interface SavedQuiz {
  quizId: number
  question: string
  timestamp: Date
  reason: string
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
  const [wrongAnswerNotes, setWrongAnswerNotes] = useState<WrongAnswerNote[]>([])
  const [savedQuizzes, setSavedQuizzes] = useState<SavedQuiz[]>([])
  const [showWrongAnswerNotes, setShowWrongAnswerNotes] = useState(false)
  const [showSavedQuizzes, setShowSavedQuizzes] = useState(false)
  const [quizMode, setQuizMode] = useState<'all' | 'wrong' | 'saved'>('all')
  const [solvedQuizIds, setSolvedQuizIds] = useState<Set<number>>(new Set())
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [currentQuizToSave, setCurrentQuizToSave] = useState<TermsQuiz | null>(null)
  const [saveReason, setSaveReason] = useState('')
  
  const updateQuizScoreMutation = useUpdateQuizScore()
  const checkAchievementsMutation = useCheckAchievements()

  // 로컬 스토리지에서 오답 노트, 저장된 퀴즈, 풀이 상태 불러오기
  useEffect(() => {
    const savedWrongNotes = localStorage.getItem(`wrong-notes-${sessionId}`)
    const savedQuizzes = localStorage.getItem(`saved-quizzes-${sessionId}`)
    const savedSolvedQuizzes = localStorage.getItem(`solved-quizzes-${sessionId}`)
    
    if (savedWrongNotes) {
      try {
        const parsed = JSON.parse(savedWrongNotes)
        setWrongAnswerNotes(parsed.map((note: any) => ({
          ...note,
          timestamp: new Date(note.timestamp)
        })))
      } catch (e) {
        console.error('Failed to parse wrong answer notes:', e)
      }
    }
    
    if (savedQuizzes) {
      try {
        const parsed = JSON.parse(savedQuizzes)
        setSavedQuizzes(parsed.map((quiz: any) => ({
          ...quiz,
          timestamp: new Date(quiz.timestamp)
        })))
      } catch (e) {
        console.error('Failed to parse saved quizzes:', e)
      }
    }
    
    if (savedSolvedQuizzes) {
      try {
        const parsed = JSON.parse(savedSolvedQuizzes)
        setSolvedQuizIds(new Set(parsed))
      } catch (e) {
        console.error('Failed to parse solved quizzes:', e)
      }
    }
  }, [sessionId])

  const { data: quizData, isLoading, refetch } = useQuery<TermsQuizResponse>({
    queryKey: ['terms-quiz', selectedDate, quizMode],
    queryFn: async () => {
      const response = await aiInfoAPI.getTermsQuizByDate(selectedDate)
      let filteredQuizzes = response.data.quizzes
      
      // 퀴즈 모드에 따라 필터링
      if (quizMode === 'wrong') {
        const wrongQuizIds = wrongAnswerNotes.map((note: WrongAnswerNote) => note.quizId)
        filteredQuizzes = response.data.quizzes.filter((quiz: TermsQuiz) => 
          wrongQuizIds.includes(quiz.id)
        )
      } else if (quizMode === 'saved') {
        const savedQuizIds = savedQuizzes.map((quiz: SavedQuiz) => quiz.quizId)
        filteredQuizzes = response.data.quizzes.filter((quiz: TermsQuiz) => 
          savedQuizIds.includes(quiz.id)
        )
      }
      
      return {
        ...response.data,
        quizzes: filteredQuizzes
      }
    },
    enabled: !!selectedDate,
  })

  const currentQuiz = quizData?.quizzes?.[currentQuizIndex]

  // 오답 노트에 저장
  const saveWrongAnswer = (quiz: TermsQuiz, userAnswer: number) => {
    const wrongNote: WrongAnswerNote = {
      quizId: quiz.id,
      question: quiz.question,
      userAnswer,
      correctAnswer: quiz.correct,
      explanation: quiz.explanation,
      timestamp: new Date(),
      attempts: 1
    }
    
    const existingNoteIndex = wrongAnswerNotes.findIndex((note: WrongAnswerNote) => note.quizId === quiz.id)
    if (existingNoteIndex >= 0) {
      // 기존 오답 노트가 있으면 시도 횟수 증가
      const updatedNotes = [...wrongAnswerNotes]
      updatedNotes[existingNoteIndex].attempts += 1
      updatedNotes[existingNoteIndex].timestamp = new Date()
      setWrongAnswerNotes(updatedNotes)
      localStorage.setItem(`wrong-notes-${sessionId}`, JSON.stringify(updatedNotes))
    } else {
      // 새로운 오답 노트 추가
      const newNotes = [...wrongAnswerNotes, wrongNote]
      setWrongAnswerNotes(newNotes)
      localStorage.setItem(`wrong-notes-${sessionId}`, JSON.stringify(newNotes))
    }
  }

  // 퀴즈 저장
  const saveQuiz = (quiz: TermsQuiz, reason: string) => {
    const savedQuiz: SavedQuiz = {
      quizId: quiz.id,
      question: quiz.question,
      timestamp: new Date(),
      reason
    }
    
    const existingIndex = savedQuizzes.findIndex((saved: SavedQuiz) => saved.quizId === quiz.id)
    if (existingIndex >= 0) {
      // 기존 저장된 퀴즈가 있으면 업데이트
      const updated = [...savedQuizzes]
      updated[existingIndex] = savedQuiz
      setSavedQuizzes(updated)
      localStorage.setItem(`saved-quizzes-${sessionId}`, JSON.stringify(updated))
    } else {
      // 새로운 퀴즈 저장
      const newSaved = [...savedQuizzes, savedQuiz]
      setSavedQuizzes(newSaved)
      localStorage.setItem(`saved-quizzes-${sessionId}`, JSON.stringify(newSaved))
    }
    
    setShowSaveModal(false)
    setCurrentQuizToSave(null)
    setSaveReason('')
  }

  // 풀이 완료 상태 저장
  const saveSolvedQuiz = (quizId: number) => {
    const newSolvedQuizzes = new Set(solvedQuizIds)
    newSolvedQuizzes.add(quizId)
    setSolvedQuizIds(newSolvedQuizzes)
    localStorage.setItem(`solved-quizzes-${sessionId}`, JSON.stringify([...newSolvedQuizzes]))
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || !currentQuiz) return

    const isCorrect = selectedAnswer === currentQuiz.correct
    if (isCorrect) {
      setScore(score + 1)
    } else {
      // 오답인 경우 오답 노트에 저장
      saveWrongAnswer(currentQuiz, selectedAnswer)
    }

    // 풀이 완료 상태 저장
    saveSolvedQuiz(currentQuiz.id)
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

  const handleQuizModeChange = (mode: 'all' | 'wrong' | 'saved') => {
    setQuizMode(mode)
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setQuizCompleted(false)
    setShowQuizComplete(false)
    setFinalScore(null)
  }

  const handleSaveQuiz = (quiz: TermsQuiz) => {
    setCurrentQuizToSave(quiz)
    setShowSaveModal(true)
  }

  const getQuizModeStats = () => {
    const totalQuizzes = quizData?.quizzes?.length || 0
    const wrongCount = wrongAnswerNotes.length
    const savedCount = savedQuizzes.length
    const solvedCount = solvedQuizIds.size
    
    return { totalQuizzes, wrongCount, savedCount, solvedCount }
  }

  const stats = getQuizModeStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">퀴즈를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="mb-8 relative">
      {/* 컴팩트한 퀴즈 모드 선택기 */}
      <div className="mb-6">
        <div className="glass rounded-2xl p-4 border border-white/20 shadow-xl">
          <div className="flex items-center justify-between">
            {/* 왼쪽: 제목과 아이콘 */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">용어 퀴즈</h2>
                <p className="text-white/70 text-xs">AI 지식을 테스트하고 오답을 복습하세요</p>
              </div>
            </div>

            {/* 오른쪽: 퀴즈 모드 선택 버튼들 */}
            <div className="flex gap-2">
              {/* 전체 퀴즈 모드 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuizModeChange('all')}
                className={`relative group px-3 py-2 rounded-xl border transition-all duration-300 ${
                  quizMode === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 border-purple-400 text-white shadow-lg'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {quizMode === 'all' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse" />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">전체</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{stats.totalQuizzes}</span>
                </div>
              </motion.button>

              {/* 오답 노트 모드 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuizModeChange('wrong')}
                className={`relative group px-3 py-2 rounded-xl border transition-all duration-300 ${
                  quizMode === 'wrong'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 border-red-400 text-white shadow-lg'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {quizMode === 'wrong' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400/20 to-orange-400/20 animate-pulse" />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">오답</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{stats.wrongCount}</span>
                </div>
              </motion.button>

              {/* 저장된 퀴즈 모드 */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleQuizModeChange('saved')}
                className={`relative group px-3 py-2 rounded-xl border transition-all duration-300 ${
                  quizMode === 'saved'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 border-blue-400 text-white shadow-lg'
                    : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20 hover:text-white'
                }`}
              >
                {quizMode === 'saved' && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-pulse" />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <span className="text-sm font-medium">저장</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">{stats.savedCount}</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* 간단한 통계 정보 */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-center gap-4 text-center">
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-1">
                  <CheckSquare className="w-3 h-3 text-white" />
                </div>
                <div className="text-white/70 text-xs">풀이완료</div>
                <div className="text-white font-bold text-xs">{stats.solvedCount}</div>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mb-1">
                  <XSquare className="w-3 h-3 text-white" />
                </div>
                <div className="text-white/70 text-xs">오답</div>
                <div className="text-white font-bold text-xs">{stats.wrongCount}</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-1">
                  <Heart className="w-3 h-3 text-white" />
                </div>
                <div className="text-white/70 text-xs">저장</div>
                <div className="text-white font-bold text-xs">{stats.savedCount}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 퀴즈가 없을 때 */}
      {(!quizData?.quizzes || quizData.quizzes.length === 0) && (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            {quizMode === 'wrong' ? '오답 노트가 비어있습니다' : 
             quizMode === 'saved' ? '저장된 퀴즈가 없습니다' : '퀴즈가 없습니다'}
          </h3>
          <p className="text-white/70 mb-4">
            {quizMode === 'wrong' ? '틀린 문제가 없어요! 훌륭합니다!' : 
             quizMode === 'saved' ? '마음에 드는 문제를 저장해보세요!' : '다른 날짜를 선택해보세요'}
          </p>
          {quizMode !== 'all' && (
            <button
              onClick={() => handleQuizModeChange('all')}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
            >
              전체 퀴즈로 돌아가기
            </button>
          )}
        </div>
      )}

      {/* 퀴즈 진행 중 - 메인으로 잘 보이게 배치 */}
      {quizData?.quizzes && quizData.quizzes.length > 0 && !quizCompleted && (
        <div className="glass rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* 진행률 표시 - 상단에 컴팩트하게 */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-white/70 text-sm">진행률</span>
                <span className="text-white font-semibold text-lg">
                  {currentQuizIndex + 1} / {quizData.quizzes.length}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-semibold text-sm">점수: {score}점</span>
              </div>
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

          {/* 문제 - 메인으로 크게 배치 */}
          <div className="mb-8">
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 mb-6 relative">
              {/* 저장 버튼 - 우상단에 */}
              <button
                onClick={() => handleSaveQuiz(currentQuiz!)}
                className="absolute top-4 right-4 p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all group"
                title="이 문제 저장하기"
              >
                <Heart className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              </button>

              <h3 className="text-xl font-semibold text-white mb-6 leading-relaxed text-center pr-16">
                {currentQuiz?.question}
              </h3>
              
              {/* 보기들 - 더 크고 명확하게 */}
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

            {/* 답안 제출 버튼 - 중앙에 크게 */}
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

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRetryQuiz}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 shadow-lg"
            >
              다시 풀기
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowWrongAnswerNotes(true)}
              className="px-8 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl font-semibold hover:from-red-600 hover:to-orange-600 shadow-lg"
            >
              오답 노트 보기
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowSavedQuizzes(true)}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-cyan-600 shadow-lg"
            >
              저장된 퀴즈 보기
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 퀴즈 저장 모달 */}
      <AnimatePresence>
        {showSaveModal && currentQuizToSave && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSaveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-3xl p-6 max-w-md w-full border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">퀴즈 저장</h2>
                <p className="text-white/70">이 문제를 저장할 이유를 입력하세요</p>
              </div>

              <div className="mb-6">
                <textarea
                  value={saveReason}
                  onChange={(e) => setSaveReason(e.target.value)}
                  placeholder="예: 중요한 개념, 자주 헷갈리는 내용, 복습이 필요한 부분..."
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 resize-none h-24 focus:outline-none focus:border-blue-400"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="flex-1 px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={() => saveQuiz(currentQuizToSave, saveReason)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all"
                >
                  저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 오답 노트 모달 */}
      <AnimatePresence>
        {showWrongAnswerNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowWrongAnswerNotes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 via-red-900 to-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  오답 노트
                </h2>
                <button
                  onClick={() => setShowWrongAnswerNotes(false)}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
                >
                  ×
                </button>
              </div>

              {wrongAnswerNotes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">오답이 없습니다!</h3>
                  <p className="text-white/70">모든 문제를 맞췄습니다. 훌륭합니다!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {wrongAnswerNotes.map((note, index) => (
                    <motion.div
                      key={note.quizId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 text-sm">#{index + 1}</span>
                          <span className="text-white/70 text-sm">
                            {note.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            {note.attempts}회 시도
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-white font-medium mb-2">{note.question}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-white/70">내 답:</span>
                            <span className="text-red-400 font-medium">
                              {note.userAnswer}번
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-white/70">정답:</span>
                            <span className="text-green-400 font-medium">
                              {note.correctAnswer}번
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-white/70 text-sm mb-1">해설:</div>
                        <div className="text-white text-sm">{note.explanation}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 저장된 퀴즈 모달 */}
      <AnimatePresence>
        {showSavedQuizzes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowSavedQuizzes(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 via-blue-900 to-slate-800 rounded-3xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Heart className="w-6 h-6 text-blue-400" />
                  저장된 퀴즈
                </h2>
                <button
                  onClick={() => setShowSavedQuizzes(false)}
                  className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/70 hover:bg-white/20 hover:text-white transition-all"
                >
                  ×
                </button>
              </div>

              {savedQuizzes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">저장된 퀴즈가 없습니다!</h3>
                  <p className="text-white/70">마음에 드는 문제를 저장해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {savedQuizzes.map((saved, index) => (
                    <motion.div
                      key={saved.quizId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/5 rounded-2xl p-4 border border-white/10"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-white/70 text-sm">#{index + 1}</span>
                          <span className="text-white/70 text-sm">
                            {saved.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                            저장됨
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <h4 className="text-white font-medium mb-2">{saved.question}</h4>
                      </div>
                      
                      <div className="bg-white/5 rounded-xl p-3">
                        <div className="text-white/70 text-sm mb-1">저장 이유:</div>
                        <div className="text-white text-sm">{saved.reason}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default TermsQuizSection 
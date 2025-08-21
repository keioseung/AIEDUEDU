'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { quizAPI, userProgressAPI } from '@/lib/api'
import type { Quiz } from '@/types'
import { t, getCurrentLanguage } from '@/lib/i18n'
import { aiInfoAPI } from '@/lib/api'

interface QuizSectionProps {
  sessionId: string
  currentLanguage: 'ko' | 'en' | 'ja' | 'zh'
}

function QuizSection({ sessionId, currentLanguage }: QuizSectionProps) {
  const [selectedTopic, setSelectedTopic] = useState('AI')
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [localLanguage, setLocalLanguage] = useState(currentLanguage)

  // 언어 변경 감지 및 즉시 반영
  useEffect(() => {
    setLocalLanguage(currentLanguage)
  }, [currentLanguage])

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = getCurrentLanguage()
      setLocalLanguage(newLanguage)
    }

    const handleForceUpdate = (event: CustomEvent) => {
      if (event.detail?.language) {
        setLocalLanguage(event.detail.language)
      }
    }

    const handleLanguageChanged = (event: CustomEvent) => {
      if (event.detail?.language) {
        setLocalLanguage(event.detail.language)
      }
    }

    window.addEventListener('languageChange', handleLanguageChange)
    window.addEventListener('forceUpdate', handleForceUpdate as EventListener)
    window.addEventListener('languageChanged', handleLanguageChanged as EventListener)
    
    return () => {
      window.removeEventListener('languageChange', handleLanguageChange)
      window.removeEventListener('forceUpdate', handleForceUpdate as EventListener)
      window.removeEventListener('languageChanged', handleLanguageChanged as EventListener)
    }
  }, [])

  // 퀴즈 점수 업데이트 뮤테이션
  const updateQuizScoreMutation = useMutation({
    mutationFn: async ({ score, totalQuestions }: { score: number; totalQuestions: number }) => {
      const response = await userProgressAPI.updateQuizScore(sessionId, {
        score,
        total_questions: totalQuestions
      })
      return response.data
    }
  })

  const { data: topics } = useQuery({
    queryKey: ['ai-info-topics', localLanguage],
    queryFn: async () => {
      try {
        console.log(`🎯 Quiz 섹션 - AI Info에서 주제 가져오기 시작 (언어: ${localLanguage})`)
        
        // AI Info의 모든 날짜 가져오기
        const datesResponse = await aiInfoAPI.getAllDates()
        console.log(`🎯 Quiz 섹션 - getAllDates API 응답:`, datesResponse)
        
        const allDates = datesResponse.data || []
        console.log(`🎯 Quiz 섹션 - 파싱된 날짜 목록:`, allDates)
        
        if (allDates.length === 0) {
          console.log('🎯 Quiz 섹션 - AI Info 날짜 데이터가 없음')
          return ['AI', 'Machine Learning', 'Deep Learning', 'Natural Language Processing']
        }
        
        console.log(`🎯 Quiz 섹션 - ${allDates.length}개 날짜에서 AI Info 주제 추출`)
        
        const allTopics = new Set<string>()
        
        for (const date of allDates) {
          try {
            console.log(`🎯 Quiz 섹션 - 날짜 ${date} 처리 시작`)
            const dateResponse = await aiInfoAPI.getByDate(date)
            console.log(`🎯 Quiz 섹션 - getByDate API 응답 (${date}):`, dateResponse)
            
            const dateInfos = dateResponse.data
            console.log(`🎯 Quiz 섹션 - 파싱된 AI 정보 (${date}):`, dateInfos)
            
            if (Array.isArray(dateInfos)) {
              console.log(`🎯 Quiz 섹션 - 날짜 ${date}의 AI 정보:`, dateInfos.length, '개')
              
              dateInfos.forEach((info: any, index: number) => {
                console.log(`🎯 Quiz 섹션 - 날짜 ${date}, 인덱스 ${index}의 AI 정보:`, info)
                console.log(`🎯 Quiz 섹션 - info 객체의 키들:`, Object.keys(info))
                
                // 백엔드 API 응답 구조에 맞게 제목 가져오기
                const title = info[`title_${localLanguage}`] || info.title_ko || ''
                
                console.log(`🎯 Quiz 섹션 - ${localLanguage} 언어 제목:`, title)
                console.log(`🎯 Quiz 섹션 - title_${localLanguage}:`, title)
                console.log(`🎯 Quiz 섹션 - title_ko:`, info.title_ko)
                console.log(`🎯 Quiz 섹션 - title_en:`, info.title_en)
                
                if (title && title.trim()) {
                  allTopics.add(title.trim())
                  console.log(`🎯 Quiz 섹션 - 주제 추가: ${title.trim()}`)
                } else {
                  console.log(`🎯 Quiz 섹션 - 제목이 비어있음 또는 undefined`)
                }
              })
            } else {
              console.log(`🎯 Quiz 섹션 - 날짜 ${date}의 AI 정보가 배열이 아님:`, typeof dateInfos)
            }
          } catch (error) {
            console.log(`🎯 Quiz 섹션 - 날짜 ${date}의 AI Info 가져오기 실패:`, error)
          }
        }
        
        const topicsList = Array.from(allTopics).sort()
        console.log(`🎯 Quiz 섹션 - AI Info에서 ${topicsList.length}개 주제 추출 (언어: ${localLanguage}):`, topicsList)
        
        // 주제가 없으면 기본값 반환
        if (topicsList.length === 0) {
          console.log('🎯 Quiz 섹션 - 주제가 없어서 기본값 반환')
          return ['AI', 'Machine Learning', 'Deep Learning', 'Natural Language Processing']
        }
        
        return topicsList
        
      } catch (error) {
        console.error('🎯 Quiz 섹션 - 주제 가져오기 실패:', error)
        return ['AI', 'Machine Learning', 'Deep Learning', 'Natural Language Processing']
      }
    },
    refetchInterval: 10000,
    refetchIntervalInBackground: true,
  })

  const { data: quizzes } = useQuery({
    queryKey: ['quiz', selectedTopic, localLanguage],
    queryFn: async () => {
      const response = await quizAPI.getByTopic(selectedTopic, localLanguage)
      return response.data as Quiz[]
    },
    enabled: !!selectedTopic,
  })

  const currentQuiz = quizzes?.[currentQuizIndex]

  // 다국어 퀴즈 내용 가져오기 (로컬 언어 상태 사용)
  const getQuizContent = (quiz: Quiz, language: 'ko' | 'en' | 'ja' | 'zh') => {
    const question = quiz[`question_${language}`] || quiz.question_ko || quiz.question || '문제를 불러올 수 없습니다'
    const option1 = quiz[`option1_${language}`] || quiz.option1_ko || quiz.option1 || '선택지 1'
    const option2 = quiz[`option2_${language}`] || quiz.option2_ko || quiz.option2 || '선택지 2'
    const option3 = quiz[`option3_${language}`] || quiz.option3_ko || quiz.option3 || '선택지 3'
    const option4 = quiz[`option4_${language}`] || quiz.option4_ko || quiz.option4 || '선택지 4'
    const explanation = quiz[`explanation_${language}`] || quiz.explanation_ko || quiz.explanation || '설명을 불러올 수 없습니다'
    
    return { question, option1, option2, option3, option4, explanation }
  }

  // 현재 언어에 맞는 퀴즈 내용 가져오기
  const getCurrentQuizContent = (quiz: Quiz) => {
    return getQuizContent(quiz, localLanguage)
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
    }

    setShowResult(true)
  }

  const handleNextQuiz = () => {
    if (quizzes && currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    } else if (quizzes && currentQuizIndex === quizzes.length - 1) {
      // 퀴즈 완료 시 점수 업데이트
      setQuizCompleted(true)
      updateQuizScoreMutation.mutate({
        score,
        totalQuestions: quizzes.length
      })
    }
  }

  const handleResetQuiz = () => {
    setCurrentQuizIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
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

  return (
    <section className="mb-8">
      <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
        <HelpCircle className="w-8 h-8" />
        {t('quiz.section.title')}
      </h2>

      <div className="glass rounded-2xl p-8">
        {/* 주제 선택 */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-white mb-4">{t('quiz.topic.selection')}</h3>
          
          {/* 디버깅 정보 */}
          <div className="mb-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
            <h4 className="text-sm font-semibold text-yellow-300 mb-2">🔍 주제 데이터 디버깅</h4>
            <div className="text-xs text-yellow-200 space-y-1">
              <div><span className="font-medium">topics 데이터:</span> {topics ? `${topics.length}개` : '로딩 중...'}</div>
              <div><span className="font-medium">topics 내용:</span> {topics ? topics.join(', ') : '없음'}</div>
              <div><span className="font-medium">현재 언어:</span> {localLanguage}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {topics?.map((topic) => (
              <button
                key={topic}
                onClick={() => {
                  setSelectedTopic(topic)
                  setCurrentQuizIndex(0)
                  setSelectedAnswer(null)
                  setShowResult(false)
                  setScore(0)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedTopic === topic
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        {/* 퀴즈 진행상황 */}
        {quizzes && quizzes.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/70">
                {currentQuizIndex + 1} / {quizzes.length}
              </span>
              <span className="text-white font-semibold">
                {t('quiz.score')}: {score} / {quizzes.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${((currentQuizIndex + 1) / quizzes.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* 퀴즈 내용 */}
        {currentQuiz ? (
          <div className="space-y-6">
                          <div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {getCurrentQuizContent(currentQuiz).question}
                </h3>
              </div>

              <div className="space-y-3">
                {[
                  getCurrentQuizContent(currentQuiz).option1,
                  getCurrentQuizContent(currentQuiz).option2,
                  getCurrentQuizContent(currentQuiz).option3,
                  getCurrentQuizContent(currentQuiz).option4
                ].map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showResult}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${getOptionClass(index)}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{String.fromCharCode(65 + index)}.</span>
                    <span>{option}</span>
                    {showResult && index === currentQuiz.correct && (
                      <CheckCircle className="w-5 h-5 ml-auto" />
                    )}
                    {showResult && selectedAnswer === index && index !== currentQuiz.correct && (
                      <XCircle className="w-5 h-5 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 결과 표시 */}
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-white/10 border border-white/20"
              >
                <h4 className="text-lg font-semibold text-white mb-2">
                  {selectedAnswer === currentQuiz.correct ? t('quiz.correct') : t('quiz.incorrect')}
                </h4>
                <p className="text-white/80">{getCurrentQuizContent(currentQuiz).explanation}</p>
              </motion.div>
            )}

            {/* 액션 버튼 */}
            <div className="flex gap-3">
              {!showResult ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('quiz.submit.answer')}
                </button>
              ) : (
                <>
                  {currentQuizIndex < (quizzes?.length || 0) - 1 ? (
                    <button
                      onClick={handleNextQuiz}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600"
                    >
                      {t('quiz.next.question')}
                    </button>
                  ) : (
                                          <div className="flex-1 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">{t('quiz.complete')}</h3>
                        <p className="text-white/70">
                          {t('quiz.final.score')}: {score} / {quizzes?.length}
                        </p>
                        {quizCompleted && (
                          <p className="text-green-400 text-sm mt-2">
                            {t('quiz.score.saved')}
                          </p>
                        )}
                      </div>
                  )}
                  <button
                    onClick={handleResetQuiz}
                    className="px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('quiz.restart')}
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-white/50 mx-auto mb-4" />
            <p className="text-white/70 text-lg">
              {t('quiz.no.quizzes')}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default QuizSection 

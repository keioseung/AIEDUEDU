'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, CheckCircle, XCircle, RotateCcw, BookOpen, Target, Trophy, Star, Sparkles, Award, ChevronLeft, ChevronRight, Settings, Zap, Brain } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { aiInfoAPI } from '@/lib/api'
import { useUpdateQuizScore, useCheckAchievements } from '@/hooks/use-user-progress'
import { t, getCurrentLanguage } from '@/lib/i18n'
import { useEffect } from 'react'

interface TermsQuizSectionProps {
  sessionId: string
  selectedDate: string
  currentLanguage: 'ko' | 'en' | 'ja' | 'zh'
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

function TermsQuizSection({ sessionId, selectedDate, currentLanguage, onProgressUpdate, onDateChange }: TermsQuizSectionProps) {
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [showQuizComplete, setShowQuizComplete] = useState(false)
  const [showAchievement, setShowAchievement] = useState(false)
  const [finalScore, setFinalScore] = useState<{score: number, total: number, percentage: number} | null>(null)
  const [selectedQuizTitle, setSelectedQuizTitle] = useState(t('quiz.tab.today.topic')) // 기본값 오늘의 주제
  const [showQuizTitleSelector, setShowQuizTitleSelector] = useState(false)
  const [wrongAnswerNotes, setWrongAnswerNotes] = useState<TermsQuiz[]>([])
  const [isWrongAnswerMode, setIsWrongAnswerMode] = useState(false)
  const [showWrongAnswerAdded, setShowWrongAnswerAdded] = useState(false)
  const updateQuizScoreMutation = useUpdateQuizScore()
  const checkAchievementsMutation = useCheckAchievements()

  // 언어 변경 감지 및 즉시 업데이트
  useEffect(() => {
    const handleLanguageChange = () => {
      const newLanguage = getCurrentLanguage()
      if (newLanguage !== currentLanguage) {
        // 언어가 변경되면 강제로 리렌더링
        window.location.reload()
      }
    }

    const handleForceUpdate = (event: CustomEvent) => {
      if (event.detail?.language) {
        const newLanguage = event.detail.language
        if (newLanguage !== currentLanguage) {
          window.location.reload()
        }
      }
    }

    const handleLanguageChanged = (event: CustomEvent) => {
      if (event.detail?.language) {
        const newLanguage = event.detail.language
        if (newLanguage !== currentLanguage) {
          window.location.reload()
        }
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
  }, [currentLanguage])

  // 다국어 퀴즈 내용 가져오기
  const getQuizContent = (quiz: TermsQuiz, language: 'ko' | 'en' | 'ja' | 'zh') => {
    // 현재는 단일 언어만 지원하므로 기존 필드 사용
    // 나중에 다국어 필드가 추가되면 여기서 확장 가능
    const question = quiz.question || '문제를 불러올 수 없습니다'
    const option1 = quiz.option1 || '선택지 1'
    const option2 = quiz.option2 || '선택지 2'
    const option3 = quiz.option3 || '선택지 3'
    const option4 = quiz.option4 || '선택지 4'
    const explanation = quiz.explanation || '설명을 불러올 수 없습니다'
    
    return { question, option1, option2, option3, option4, explanation }
  }

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
    setWrongAnswerNotes(prev => {
      const newWrongAnswerNotes = prev.filter(quiz => quiz.id !== quizId)
      
      // 오답 노트 모드에서 문제를 삭제한 후 상태 초기화
      if (isWrongAnswerMode) {
        setSelectedAnswer(null)
        setShowResult(false)
        
        // 현재 문제가 삭제된 문제인 경우 다음 문제로 이동
        if (currentQuiz && currentQuiz.id === quizId) {
          if (newWrongAnswerNotes.length === 0) {
            // 모든 문제가 삭제되었으면 퀴즈 완료
            const finalScoreData = {
              score: score,
              total: 0,
              percentage: 0
            }
            setFinalScore(finalScoreData)
            setQuizCompleted(true)
          } else {
            // 현재 인덱스를 다음 문제로 조정
            if (currentQuizIndex >= newWrongAnswerNotes.length) {
              // 현재 인덱스가 남은 문제 수보다 크면 마지막 문제로 이동
              setCurrentQuizIndex(newWrongAnswerNotes.length - 1)
            } else {
              // 현재 인덱스가 남은 문제 범위 내에 있으면 그대로 유지
              // (React가 자동으로 다음 문제를 표시함)
            }
          }
        }
      }
      
      return newWrongAnswerNotes
    })
    
    // 삭제 후 즉시 다음 문제로 이동하기 위해 currentQuizIndex 조정
    if (isWrongAnswerMode) {
      // 현재 문제가 삭제된 문제인지 확인
      if (currentQuiz && currentQuiz.id === quizId) {
        // 삭제된 문제의 인덱스를 찾아서 다음 문제로 이동
        const currentIndex = wrongAnswerNotes.findIndex(quiz => quiz.id === quizId)
        if (currentIndex !== -1) {
          // 삭제 후 남은 문제들 중에서 다음 문제 선택
          const remainingQuizzes = wrongAnswerNotes.filter(quiz => quiz.id !== quizId)
          if (remainingQuizzes.length > 0) {
            // 다음 문제가 있으면 다음 문제로, 마지막이면 마지막 문제로
            const nextIndex = currentIndex < remainingQuizzes.length ? currentIndex : remainingQuizzes.length - 1
            setCurrentQuizIndex(nextIndex)
          }
        }
      }
      
      // 문제 삭제 후 진행 상황 업데이트를 위해 quizData 강제 리페치
      setTimeout(() => {
        refetch()
      }, 100)
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
    // 오답 노트 모드일 때는 quizData를 수동으로 업데이트하지 않음
  }

  // 각 날짜별 AI 정보 가져오기
  const { data: dateBasedAIInfo = [], isLoading: isLoadingDateBased } = useQuery<AIInfoItem[]>({
    queryKey: ['date-based-ai-info', allDates, currentLanguage],
    queryFn: async () => {
      if (allDates.length === 0) return []
      
      const allInfo: AIInfoItem[] = []
      
      for (const date of allDates) {
        try {
          const response = await aiInfoAPI.getByDate(date)
          const dateInfos = response.data
          
          if (Array.isArray(dateInfos)) {
            dateInfos.forEach((info: any, index: number) => {
              // 백엔드 API 응답 구조에 맞게 제목과 내용 가져오기
              const title = info[`title_${currentLanguage}`] || info.title_ko || ''
              const content = info[`content_${currentLanguage}`] || info.content_ko || ''
              const terms = info[`terms_${currentLanguage}`] || info.terms_ko || []
              
              if (title && title.trim() && content && content.trim()) {
                allInfo.push({
                  id: `${date}_${index}`,
                  date: date,
                  title: title.trim(),
                  content: content.trim(),
                  terms: Array.isArray(terms) ? terms : [],
                  info_index: index
                })
              }
            })
          }
        } catch (error) {
          console.log(`날짜 ${date}의 AI Info 가져오기 실패:`, error)
        }
      }
      
      return allInfo
    },
    enabled: allDates.length > 0,
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
  })

  // 실제 사용할 AI 정보 (getAll이 성공하면 그것을, 실패하면 날짜별 정보를 사용)
  const actualAIInfo = allAIInfo.length > 0 ? allAIInfo : dateBasedAIInfo
  const isLoadingAIInfo = isLoadingAll || isLoadingDates || isLoadingDateBased

  // 퀴즈 주제 옵션들 (AI 정보 제목들)
  const quizTitleOptions = [t('quiz.tab.today.topic'), ...actualAIInfo.map(info => info.title)]

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
  const selectedAIInfo = selectedQuizTitle !== t('quiz.tab.today.topic') 
    ? actualAIInfo.find(info => info.title === selectedQuizTitle)
    : null

  // 퀴즈 데이터 가져오기 (선택된 제목이 있으면 해당 내용의 용어로, 없으면 날짜별로)
  const { data: quizData, isLoading, refetch } = useQuery<TermsQuizResponse>({
    queryKey: ['terms-quiz', selectedDate, selectedQuizTitle, selectedAIInfo?.id],
    queryFn: async () => {
      if (selectedQuizTitle === t('quiz.tab.wrong.notes')) {
        // 오답 노트 모드: 저장된 오답 문제들로 퀴즈 생성
        if (wrongAnswerNotes.length === 0) {
          return { quizzes: [], total_terms: 0, message: getWrongNotesEmptyMessageByLanguage(currentLanguage) }
        }

        // 오답 노트에서 퀴즈 생성 (최대 10개)
        const shuffledQuizzes = wrongAnswerNotes
          .sort(() => Math.random() - 0.5)
          .slice(0, Math.min(10, wrongAnswerNotes.length))

        return {
          quizzes: shuffledQuizzes,
          total_terms: wrongAnswerNotes.length,
          message: getWrongNotesQuizMessageByLanguage(currentLanguage, shuffledQuizzes.length)
        }
      } else if (selectedQuizTitle !== t('quiz.tab.today.topic') && selectedAIInfo) {
        // 선택된 제목의 용어로 퀴즈 생성
        const terms = selectedAIInfo.terms || []
        if (terms.length === 0) {
          return { quizzes: [], total_terms: 0, message: getNoTermsMessageByLanguage(currentLanguage) }
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
            question: currentLanguage === 'ko' ? `"${term.term}"의 의미로 가장 적절한 것은?` :
                     currentLanguage === 'en' ? `What is the most appropriate meaning of "${term.term}"?` :
                     currentLanguage === 'ja' ? `"${term.term}"の意味として最も適切なものは？` :
                     `"${term.term}"最恰当的含义是什么？`,
            option1: shuffledOptions[0],
            option2: shuffledOptions[1],
            option3: shuffledOptions[2],
            option4: shuffledOptions[3],
            correct: correctIndex,
            explanation: currentLanguage === 'ko' ? `${term.term}의 정확한 의미는: ${term.description}` :
                         currentLanguage === 'en' ? `The correct meaning of "${term.term}" is: ${term.description}` :
                         currentLanguage === 'ja' ? `"${term.term}"の正確な意味は: ${term.description}` :
                         `"${term.term}"的正确含义是: ${term.description}`
          }
        })

        return {
          quizzes,
          total_terms: terms.length,
          message: getQuizGeneratedMessageByLanguage(currentLanguage, selectedAIInfo.title)
        }
      } else {
        // 기존 방식: 날짜별 퀴즈
        const response = await aiInfoAPI.getTermsQuizByDate(selectedDate, currentLanguage)
        return response.data
      }
    },
    enabled: !!selectedDate && (selectedQuizTitle === t('quiz.tab.today.topic') || selectedQuizTitle === t('quiz.tab.wrong.notes') || !!selectedAIInfo),
    staleTime: 10 * 60 * 1000, // 10분간 데이터를 신선하게 유지
    gcTime: 20 * 60 * 1000, // 20분간 캐시 유지
    refetchOnWindowFocus: false, // 윈도우 포커스 시 새로고침 비활성화
    refetchOnMount: false, // 컴포넌트 마운트 시 새로고침 비활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 새로고침 비활성화
    retry: 1, // 재시도 횟수 제한
    retryDelay: 1000, // 재시도 간격 1초
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
    if (title === t('quiz.tab.wrong.notes')) {
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

  // 다국어 점수 메시지 함수
  const getScoreMessageByLanguage = (percentage: number, language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        if (percentage >= 90) return "🎉 Perfect! Excellent skills!"
        if (percentage >= 80) return "🌟 Very well done! Almost all correct!"
        if (percentage >= 70) return "👍 Good! You know quite a lot!"
        if (percentage >= 60) return "💪 Not bad! Just need a little more effort!"
        return "📚 Study more! You can do better next time!"
      case 'ja':
        if (percentage >= 90) return "🎉 完璧です！素晴らしい実力ですね！"
        if (percentage >= 80) return "🌟 とてもよくできました！ほぼ全問正解です！"
        if (percentage >= 70) return "👍 いいですね！かなりよく知っています！"
        if (percentage >= 60) return "💪 悪くないです！もう少し努力すれば大丈夫です！"
        return "📚 もっと勉強しましょう！次はもっと良くできます！"
      case 'zh':
        if (percentage >= 90) return "🎉 完美！出色的技能！"
        if (percentage >= 80) return "🌟 做得很好！几乎全对了！"
        if (percentage >= 70) return "👍 不错！你知道得很多！"
        if (percentage >= 60) return "💪 还可以！再努力一点就好了！"
        return "📚 多学习！下次会做得更好！"
      default:
        if (percentage >= 90) return "🎉 완벽합니다! 훌륭한 실력이네요!"
        if (percentage >= 80) return "🌟 아주 잘했어요! 거의 다 맞췄네요!"
        if (percentage >= 70) return "👍 좋아요! 꽤 잘 알고 있네요!"
        if (percentage >= 60) return "💪 괜찮아요! 조금만 더 노력하면 됩니다!"
        return "📚 더 공부해보세요! 다음엔 더 잘할 수 있을 거예요!"
    }
  }

  // 다국어 점수 텍스트 함수
  const getScoreTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Score"
      case 'ja':
        return "点数"
      case 'zh':
        return "分数"
      default:
        return "점수"
    }
  }

  // 다국어 답안 제출 버튼 텍스트 함수
  const getSubmitAnswerTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Submit Answer"
      case 'ja':
        return "回答を提出"
      case 'zh':
        return "提交答案"
      default:
        return "답안 제출"
    }
  }

  // 다국어 정답/오답 메시지 함수
  const getResultMessageByLanguage = (isCorrect: boolean, language: 'ko' | 'en' | 'ja' | 'zh') => {
    if (isCorrect) {
      switch (language) {
        case 'en':
          return "Correct! 🎉"
        case 'ja':
          return "正解です！🎉"
        case 'zh':
          return "答对了！🎉"
        default:
          return "정답입니다! 🎉"
      }
    } else {
      switch (language) {
        case 'en':
          return "Incorrect 😅"
        case 'ja':
          return "不正解です😅"
        case 'zh':
          return "答错了😅"
        default:
          return "틀렸습니다 😅"
      }
    }
  }

  // 다국어 정답률 텍스트 함수
  const getAccuracyTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Accuracy"
      case 'ja':
        return "正答率"
      case 'zh':
        return "正确率"
      default:
        return "정답률"
    }
  }

  // 다국어 다음 문제 버튼 텍스트 함수
  const getNextQuestionTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Next Question"
      case 'ja':
        return "次の問題"
      case 'zh':
        return "下一题"
      default:
        return t('quiz.tab.next.question')
    }
  }

  // 다국어 퀴즈 완료하기 버튼 텍스트 함수
  const getCompleteQuizTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Complete Quiz"
      case 'ja':
        return "クイズ完了"
      case 'zh':
        return "完成测验"
      default:
        return t('quiz.tab.complete.quiz')
    }
  }

  // 다국어 오답 노트에서 제거 버튼 텍스트 함수
  const getRemoveFromWrongNotesTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Remove from Wrong Notes"
      case 'ja':
        return "間違いノートから削除"
      case 'zh':
        return "从错题本中移除"
      default:
        return t('quiz.tab.remove.from.wrong.notes')
    }
  }

  // 다국어 제거 버튼 텍스트 함수 (모바일용)
  const getRemoveTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Remove"
      case 'ja':
        return "削除"
      case 'zh':
        return "移除"
      default:
        return t('quiz.tab.remove')
    }
  }

  // 다국어 오답 노트에 추가 버튼 텍스트 함수
  const getAddToWrongNotesTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Add to Wrong Notes"
      case 'ja':
        return "間違いノートに追加"
      case 'zh':
        return "添加到错题本"
      default:
        return t('quiz.tab.add.to.wrong.notes')
    }
  }

  // 다국어 오답 노트 추가 버튼 텍스트 함수 (모바일용)
  const getAddWrongNoteTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Add Note"
      case 'ja':
        return "ノート追加"
      case 'zh':
        return "添加笔记"
      default:
        return t('quiz.tab.add.wrong.note')
    }
  }

  // 다국어 퀴즈 완료 텍스트 함수
  const getQuizCompletedTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Quiz Completed!"
      case 'ja':
        return "クイズ完了！"
      case 'zh':
        return "测验完成！"
      default:
        return t('quiz.tab.quiz.completed')
    }
  }

  // 다국어 재도전 버튼 텍스트 함수
  const getTryAgainTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Try Again"
      case 'ja':
        return "再挑戦"
      case 'zh':
        return "再试一次"
      default:
        return t('quiz.tab.try.again')
    }
  }

  // 다국어 재도전 버튼 텍스트 함수 (모바일용)
  const getReTryTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Re-try"
      case 'ja':
        return "再挑戦"
      case 'zh':
        return "重试"
      default:
        return t('quiz.tab.re.try')
    }
  }

  // 다국어 오답 노트 개수 텍스트 함수
  const getWrongNotesCountTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh', count: number) => {
    switch (language) {
      case 'ko':
        return `${count}개 문제`
      case 'en':
        return `${count} problems`
      case 'ja':
        return `${count}問題`
      case 'zh':
        return `${count}题`
      default:
        return `${count}개 문제`
    }
  }

  // 다국어 날짜별 퀴즈 텍스트 함수
  const getDateBasedQuizTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'en':
        return "Daily Quiz"
      case 'ja':
        return "日別クイズ"
      case 'zh':
        return "每日测验"
      default:
        return "날짜별 퀴즈"
    }
  }

  // 다국어 용어 개수 텍스트 함수
  const getTermsCountTextByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh', count: number) => {
    switch (language) {
      case 'ko':
        return `${count}개 용어`
      case 'en':
        return `${count} terms`
      case 'ja':
        return `${count}語`
      case 'zh':
        return `${count}个术语`
      default:
        return `${count}개 용어`
    }
  }

  // 다국어 텍스트 번역 함수들
  const getWrongNotesEmptyMessageByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'ko': return '오답 노트에 등록된 문제가 없습니다.'
      case 'en': return 'No questions registered in wrong notes.'
      case 'ja': return '間違いノートに登録された問題がありません。'
      case 'zh': return '错题本中没有注册的问题。'
      default: return '오답 노트에 등록된 문제가 없습니다.'
    }
  }

  const getWrongNotesQuizMessageByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh', count: number) => {
    switch (language) {
      case 'ko': return `오답 노트에서 ${count}개 문제를 가져왔습니다.`
      case 'en': return `Retrieved ${count} questions from wrong notes.`
      case 'ja': return `間違いノートから${count}個の問題を取得しました。`
      case 'zh': return `从错题本中获取了${count}个问题。`
      default: return `오답 노트에서 ${count}개 문제를 가져왔습니다.`
    }
  }

  const getNoTermsMessageByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh') => {
    switch (language) {
      case 'ko': return '선택된 주제에 등록된 용어가 없습니다.'
      case 'en': return 'No terms registered for the selected topic.'
      case 'ja': return '選択されたトピックに登録された用語がありません。'
      case 'zh': return '所选主题没有注册的术语。'
      default: return '선택된 주제에 등록된 용어가 없습니다.'
    }
  }

  const getQuizGeneratedMessageByLanguage = (language: 'ko' | 'en' | 'ja' | 'zh', title: string) => {
    switch (language) {
      case 'ko': return `${title} 주제의 용어로 퀴즈를 생성했습니다.`
      case 'en': return `Generated quiz using terms from topic: ${title}`
      case 'ja': return `${title}トピックの用語でクイズを生成しました。`
      case 'zh': return `使用主题"${title}"的术语生成了测验。`
      default: return `${title} 주제의 용어로 퀴즈를 생성했습니다.`
    }
  }

  // 백엔드 메시지를 언어별로 번역하는 함수
  const translateBackendMessage = (message: string, language: 'ko' | 'en' | 'ja' | 'zh') => {
    if (!message) return ''
    
    // 영어 메시지를 언어별로 번역
    if (message.includes('No AI information available for date')) {
      const dateMatch = message.match(/date (\d{4}-\d{2}-\d{2})/)
      const date = dateMatch ? dateMatch[1] : ''
      
      switch (language) {
        case 'ko': return `선택하신 날짜(${date})에는 AI 정보가 등록되지 않았습니다.`
        case 'en': return message // 영어는 그대로
        case 'ja': return `選択された日付(${date})にはAI情報が登録されていません。`
        case 'zh': return `所选日期(${date})没有注册AI信息。`
        default: return `선택하신 날짜(${date})에는 AI 정보가 등록되지 않았습니다.`
      }
    }
    
    if (message.includes('No quiz available for date')) {
      const dateMatch = message.match(/date (\d{4}-\d{2}-\d{2})/)
      const date = dateMatch ? dateMatch[1] : ''
      
      switch (language) {
        case 'ko': return `선택하신 날짜(${date})에는 퀴즈가 등록되지 않았습니다.`
        case 'en': return message // 영어는 그대로
        case 'ja': return `選択された日付(${date})にはクイズが登録されていません。`
        case 'zh': return `所选日期(${date})没有注册测验。`
        default: return `선택하신 날짜(${date})에는 퀴즈가 등록되지 않았습니다.`
      }
    }
    
    if (message.includes('No terms available for date')) {
      const dateMatch = message.match(/date (\d{4}-\d{2}-\d{2})/)
      const date = dateMatch ? dateMatch[1] : ''
      
      switch (language) {
        case 'ko': return `선택하신 날짜(${date})에는 용어가 등록되지 않았습니다.`
        case 'en': return message // 영어는 그대로
        case 'ja': return `選択された日付(${date})には用語が登録されていません。`
        case 'zh': return `所选日期(${date})没有注册术语。`
        default: return `선택하신 날짜(${date})에는 용어가 등록되지 않았습니다.`
      }
    }
    
    // 기타 일반적인 영어 메시지들
    if (message.includes('No data available')) {
      switch (language) {
        case 'ko': return '사용 가능한 데이터가 없습니다.'
        case 'en': return message
        case 'ja': return '利用可能なデータがありません。'
        case 'zh': return '没有可用数据。'
        default: return '사용 가능한 데이터가 없습니다.'
      }
    }
    
    if (message.includes('No information found')) {
      switch (language) {
        case 'ko': return '찾을 수 있는 정보가 없습니다.'
        case 'en': return message
        case 'ja': return '見つかる情報がありません。'
        case 'zh': return '找不到信息。'
        default: return '찾을 수 있는 정보가 없습니다.'
      }
    }
    
    // 번역할 수 없는 메시지는 원본 반환
    return message
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
                     <span className="text-sm">{t('quiz.tab.select.topic')}</span>
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
                         <div className="text-white/95 text-xs font-semibold mb-1">{t('quiz.tab.select.topic')}</div>
                         <div className="w-full bg-white/20 rounded-full h-0.5">
                           <div className="bg-gradient-to-r from-purple-400 via-violet-500 to-purple-600 h-0.5 rounded-full transition-all duration-300" />
                         </div>
                       </div>
                       
                       {/* AI 정보 로딩 중 표시 */}
                       {isLoadingAIInfo && (
                         <div className="flex items-center justify-center gap-2 text-white/70">
                           <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                           <div className="text-white/80 text-sm font-medium whitespace-nowrap">{t('loading.please.wait')}</div>
                         </div>
                       )}
                       
                                                  {/* AI 정보 목록 */}
                           {!isLoadingAIInfo && (
                             <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                               {/* 오답 노트 옵션 추가 */}
                               <button
                                 onClick={() => handleQuizTitleChange(t('quiz.tab.wrong.notes'))}
                                 className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-red-600/30 via-red-500/35 to-red-600/30 hover:from-red-500/50 hover:via-red-400/55 hover:to-red-500/50 transition-all duration-200 group border border-red-400/50 hover:border-red-400/70"
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="flex-1 min-w-0">
                                     <div className="text-red-100 font-semibold text-xs group-hover:text-red-50 transition-colors leading-tight flex items-center gap-2">
                                       <BookOpen className="w-3 h-3" />
                                       {t('quiz.tab.wrong.notes')}
                                     </div>
                                     <div className="text-red-100/80 text-xs mt-0.5 leading-tight">
                                       {getWrongNotesCountTextByLanguage(currentLanguage, wrongAnswerNotes.length)}
                                     </div>
                                   </div>
                                   <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                     <ChevronRight className="w-3 h-3 text-red-200" />
                                   </div>
                                 </div>
                               </button>
                               
                               {/* 오늘의 주제 옵션 추가 */}
                               <button
                                 onClick={() => handleQuizTitleChange(t('quiz.tab.today.topic'))}
                                 className="w-full text-left p-2.5 rounded-xl bg-gradient-to-r from-emerald-600/30 via-emerald-500/35 to-emerald-600/30 hover:from-emerald-500/50 hover:via-emerald-400/55 hover:to-emerald-500/50 transition-all duration-200 group border border-emerald-400/50 hover:border-emerald-400/70"
                               >
                                 <div className="flex items-center justify-between">
                                   <div className="flex-1 min-w-0">
                                     <div className="text-emerald-100 font-semibold text-xs group-hover:text-emerald-50 transition-colors leading-tight flex items-center gap-2">
                                       <Zap className="w-3 h-3" />
                                       {t('quiz.tab.today.topic')}
                                     </div>
                                     <div className="text-emerald-100/80 text-xs mt-0.5 leading-tight">
                                       {getDateBasedQuizTextByLanguage(currentLanguage)}
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
                                   </div>
                                   <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5">
                                     <ChevronRight className="w-3 h-3 text-purple-300" />
                                   </div>
                                 </div>
                               </button>
                             ))
                           ) : (
                             <div className="text-center py-4">
                               <div className="text-white/80 text-xs font-medium">{t('quiz.tab.no.topics.available')}</div>
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
                   <span className="text-sm">{t('quiz.tab.random')}</span>
                 </span>
               </button>
            </div>
          </div>

          {/* 선택된 주제 표시 */}
          <div className="mt-4 pt-3 border-t border-purple-500/20">
            <div className="flex items-center gap-2 text-white/80 text-sm font-medium">
              <Target className="w-4 h-4 text-purple-400" />
              <span>{t('quiz.tab.selected.topic')}: <span className="text-white font-semibold bg-gradient-to-r from-purple-400 to-violet-500 bg-clip-text text-transparent">{selectedQuizTitle}</span></span>
            </div>
          </div>
        </div>
      </div>

      

      {/* 로딩 상태 */}
      {isLoading ? (
        <div className="glass rounded-2xl p-48 md:p-64 min-h-[50vh] flex items-center justify-center">
          <div className="flex flex-col items-center justify-center text-white -mt-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white/80 text-lg font-medium whitespace-nowrap">{t('loading.please.wait')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* 데이터가 없을 때 */}
          {!quizData?.quizzes || quizData.quizzes.length === 0 && (
            <div className="glass rounded-3xl p-16 md:p-24 min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-purple-800/20 via-purple-700/25 to-purple-800/20 border border-purple-500/30 shadow-2xl shadow-purple-900/30">
              <div className="text-center text-white max-w-2xl mx-auto">
                {/* 메인 아이콘 */}
                <div className="relative mb-6">
                  <Target className="w-16 h-16 md:w-20 md:h-20 text-purple-400 mb-4 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">✨</span>
                  </div>
                </div>
                
                {/* 메인 제목 */}
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                  {selectedQuizTitle === t('quiz.tab.wrong.notes') ? 
                    (currentLanguage === 'ko' ? '오답 노트가 비어있습니다 📝' :
                     currentLanguage === 'en' ? 'Wrong Notes is Empty 📝' :
                     currentLanguage === 'ja' ? '間違いノートが空です 📝' :
                     '错题本是空的 📝') :
                   selectedQuizTitle === t('quiz.tab.today.topic') ? 
                    (currentLanguage === 'ko' ? '오늘은 퀴즈가 준비되지 않았습니다 🎯' :
                     currentLanguage === 'en' ? 'No Quiz Prepared for Today 🎯' :
                     currentLanguage === 'ja' ? '今日はクイズが準備されていません 🎯' :
                     '今天没有准备测验 🎯') : 
                    (currentLanguage === 'ko' ? `"${selectedQuizTitle}" 퀴즈가 준비되지 않았습니다 🎯` :
                     currentLanguage === 'en' ? `"${selectedQuizTitle}" Quiz Not Prepared 🎯` :
                     currentLanguage === 'ja' ? `"${selectedQuizTitle}"クイズが準備されていません 🎯` :
                     `"${selectedQuizTitle}"测验未准备 🎯`)}
                </h3>
                
                {/* 설명 텍스트 */}
                <p className="text-white/80 text-base md:text-lg leading-relaxed mb-6 max-w-md mx-auto">
                  {translateBackendMessage(quizData?.message || '', currentLanguage) || 
                    (selectedQuizTitle === t('quiz.tab.wrong.notes')
                      ? (currentLanguage === 'ko' ? '아직 틀린 문제가 없습니다. 퀴즈를 풀어보고 오답을 만들어보세요!' :
                         currentLanguage === 'en' ? 'No wrong questions yet. Try solving quizzes and create wrong notes!' :
                         currentLanguage === 'ja' ? 'まだ間違った問題がありません。クイズを解いて間違いノートを作ってみてください！' :
                         '还没有错题。尝试解答测验并创建错题本！')
                      : selectedQuizTitle === t('quiz.tab.today.topic') 
                      ? (currentLanguage === 'ko' ? `선택하신 날짜(${selectedDate})에는 퀴즈가 등록되지 않았습니다. 다른 날짜를 선택하거나 다른 학습 모드를 시도해보세요!` :
                         currentLanguage === 'en' ? `No quiz is registered for the selected date (${selectedDate}). Try selecting a different date or another learning mode!` :
                         currentLanguage === 'ja' ? `選択された日付(${selectedDate})にはクイズが登録されていません。別の日付を選択するか、別の学習モードを試してみてください！` :
                         `所选日期(${selectedDate})没有注册测验。请尝试选择其他日期或其他学习模式！`)
                      : (currentLanguage === 'ko' ? `"${selectedQuizTitle}" 주제에는 아직 퀴즈가 준비되지 않았습니다. 다른 주제를 선택해보세요!` :
                         currentLanguage === 'en' ? `Quiz for topic "${selectedQuizTitle}" is not prepared yet. Try selecting another topic!` :
                         currentLanguage === 'ja' ? `"${selectedQuizTitle}"トピックにはまだクイズが準備されていません。別のトピックを選択してみてください！` :
                         `主题"${selectedQuizTitle}"的测验尚未准备。请尝试选择其他主题！`))
                  }
                </p>
                
                {/* 액션 버튼들 */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center">
                  {selectedQuizTitle === t('quiz.tab.today.topic') && (
                    <>
                      <button
                        onClick={() => setSelectedQuizTitle(t('quiz.tab.wrong.notes'))}
                        className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        📝 {currentLanguage === 'ko' ? '오답 노트 보기' :
                            currentLanguage === 'en' ? 'View Wrong Notes' :
                            currentLanguage === 'ja' ? '間違いノートを見る' :
                            '查看错题本'}
                      </button>
                      <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium text-sm hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        🔄 {currentLanguage === 'ko' ? '새로고침' :
                            currentLanguage === 'en' ? 'Refresh' :
                            currentLanguage === 'ja' ? '更新' :
                            '刷新'}
                      </button>
                    </>
                  )}
                  {selectedQuizTitle === t('quiz.tab.wrong.notes') && (
                    <button
                      onClick={() => setSelectedQuizTitle(t('quiz.tab.today.topic'))}
                      className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium text-sm hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      🎯 {currentLanguage === 'ko' ? '오늘의 주제로 돌아가기' :
                          currentLanguage === 'en' ? 'Back to Today\'s Topic' :
                          currentLanguage === 'ja' ? '今日のトピックに戻る' :
                          '回到今日主题'}
                    </button>
                  )}
                </div>
                
                {/* 학습 팁 */}
                <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border border-emerald-400/30 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-emerald-400">💡</span>
                    <span className="text-emerald-200 font-semibold text-sm">
                      {currentLanguage === 'ko' ? '학습 팁' :
                       currentLanguage === 'en' ? 'Learning Tip' :
                       currentLanguage === 'ja' ? '学習のヒント' :
                       '学习提示'}
                    </span>
                  </div>
                  <p className="text-emerald-100 text-sm leading-relaxed">
                    {selectedQuizTitle === t('quiz.tab.wrong.notes') 
                      ? (currentLanguage === 'ko' ? '틀린 문제를 복습하면 학습 효과가 높아집니다. 꾸준한 연습으로 실력을 키워보세요!' :
                         currentLanguage === 'en' ? 'Reviewing wrong questions improves learning effectiveness. Build your skills through consistent practice!' :
                         currentLanguage === 'ja' ? '間違った問題を復習すると学習効果が高まります。継続的な練習でスキルを向上させましょう！' :
                         '复习错题可以提高学习效果。通过持续练习提升技能！')
                      : (currentLanguage === 'ko' ? '매일 새로운 퀴즈가 업데이트됩니다. 꾸준한 학습으로 AI 마스터가 되어보세요!' :
                         currentLanguage === 'en' ? 'New quizzes are updated daily. Become an AI master through consistent learning!' :
                         currentLanguage === 'ja' ? '毎日新しいクイズが更新されます。継続的な学習でAIマスターになりましょう！' :
                         '每天都会更新新的测验。通过持续学习成为AI大师！')
                    }
                  </p>
                </div>
                
                {/* 통계 정보 */}
                <div className="flex items-center gap-6 text-sm text-white/60 justify-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    <span>
                      {currentLanguage === 'ko' ? '퀴즈 학습' :
                       currentLanguage === 'en' ? 'Quiz Learning' :
                       currentLanguage === 'ja' ? 'クイズ学習' :
                       '测验学习'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
                    <span>
                      {currentLanguage === 'ko' ? '오답 복습' :
                       currentLanguage === 'en' ? 'Wrong Answer Review' :
                       currentLanguage === 'ja' ? '間違い復習' :
                       '错题复习'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span>
                      {currentLanguage === 'ko' ? '성장 발전' :
                       currentLanguage === 'en' ? 'Growth & Development' :
                       currentLanguage === 'ja' ? '成長発展' :
                       '成长发展'}
                    </span>
                  </div>
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
                    {getScoreTextByLanguage(currentLanguage)}: {score} / {quizData.quizzes.length}
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
                      {getQuizContent(currentQuiz, currentLanguage).question}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      getQuizContent(currentQuiz, currentLanguage).option1,
                      getQuizContent(currentQuiz, currentLanguage).option2,
                      getQuizContent(currentQuiz, currentLanguage).option3,
                      getQuizContent(currentQuiz, currentLanguage).option4
                    ].map((option, index) => (
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
                          {getResultMessageByLanguage(selectedAnswer === currentQuiz.correct, currentLanguage)}
                        </h4>
                        <p className="text-white/90 text-base mobile-text leading-relaxed font-medium">{getQuizContent(currentQuiz, currentLanguage).explanation}</p>
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
                          <span className="font-semibold text-sm">{t('quiz.tab.wrong.note.added')}</span>
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
                        {getSubmitAnswerTextByLanguage(currentLanguage)}
                      </button>
                    ) : (
                      <>
                        {currentQuizIndex < quizData.quizzes.length - 1 ? (
                          <button
                            onClick={handleNextQuiz}
                            className="flex-1 bg-gradient-to-r from-emerald-400 via-green-500 to-emerald-600 text-white py-4 rounded-2xl font-bold hover:from-emerald-500 hover:via-green-600 hover:to-emerald-700 touch-optimized mobile-touch-target text-base shadow-xl hover:shadow-2xl transition-all duration-300 border border-emerald-300/30"
                          >
                            {getNextQuestionTextByLanguage(currentLanguage)}
                          </button>
                        ) : (
                          <button
                            onClick={handleNextQuiz}
                            className="flex-1 bg-gradient-to-r from-amber-400 via-yellow-500 to-orange-500 text-white py-4 rounded-2xl font-bold hover:from-amber-500 hover:via-yellow-600 hover:to-orange-600 touch-optimized mobile-touch-target text-base shadow-xl hover:shadow-2xl transition-all duration-300 border border-amber-300/30"
                          >
                            {getCompleteQuizTextByLanguage(currentLanguage)}
                          </button>
                        )}
                        {isWrongAnswerMode ? (
                          <button
                            onClick={() => removeFromWrongAnswerNotes(currentQuiz.id)}
                            className="px-6 py-4 bg-gradient-to-br from-red-600/30 via-red-700/35 to-red-600/30 text-red-100 rounded-2xl hover:from-red-700/40 hover:via-red-800/45 hover:to-red-700/40 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base font-semibold border border-red-500/40 hover:border-red-500/60 transition-all duration-300 shadow-lg hover:shadow-xl"
                          >
                            <XCircle className="w-5 h-5" />
                            <span className="hidden sm:inline">{getRemoveFromWrongNotesTextByLanguage(currentLanguage)}</span>
                            <span className="sm:hidden">{getRemoveTextByLanguage(currentLanguage)}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => currentQuiz && addToWrongAnswerNotes(currentQuiz)}
                            disabled={!currentQuiz}
                            className="px-6 py-4 bg-gradient-to-br from-red-500/20 via-red-600/25 to-red-500/20 text-red-200 rounded-2xl hover:from-red-600/30 hover:via-red-700/35 hover:to-red-600/30 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base font-semibold border border-red-400/30 hover:border-red-400/50 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <BookOpen className="w-5 h-5" />
                            <span className="hidden sm:inline">{getAddToWrongNotesTextByLanguage(currentLanguage)}</span>
                            <span className="sm:hidden">{getAddWrongNoteTextByLanguage(currentLanguage)}</span>
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
                      {getQuizCompletedTextByLanguage(currentLanguage)}
                    </h3>
                    
                    <div className="text-2xl md:text-3xl font-bold text-white mb-4 mobile-text bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 bg-clip-text text-transparent">
                      {finalScore.score} / {finalScore.total}
                    </div>
                    
                    <div className="text-xl md:text-2xl text-white/90 mb-4 md:mb-6 mobile-text font-semibold">
                      {getAccuracyTextByLanguage(currentLanguage)}: {finalScore.percentage}%
                    </div>
                    
                    <div className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 mobile-text font-medium">
                      {getScoreMessageByLanguage(finalScore.percentage, currentLanguage)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center">
                    <button
                      onClick={handleResetQuiz}
                      className="px-8 md:px-10 py-4 bg-gradient-to-r from-purple-500 via-violet-600 to-purple-700 text-white rounded-2xl font-bold hover:from-purple-600 hover:via-violet-700 hover:to-purple-800 flex items-center justify-center gap-3 touch-optimized mobile-touch-target text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 border border-purple-400/30"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="hidden sm:inline">{getTryAgainTextByLanguage(currentLanguage)}</span>
                      <span className="sm:hidden">{getReTryTextByLanguage(currentLanguage)}</span>
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
                <div className="font-bold text-lg md:text-xl">{getQuizCompletedTextByLanguage(currentLanguage)}</div>
                <div className="text-sm md:text-base opacity-95 font-medium">{t('quiz.tab.score.saved')}</div>
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
                <div className="font-bold text-lg md:text-xl">{t('quiz.tab.achievement.achieved')}</div>
                <div className="text-sm md:text-base opacity-95 font-medium">{t('quiz.tab.new.achievement')}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

export default TermsQuizSection 

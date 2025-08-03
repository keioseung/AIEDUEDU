import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userProgressAPI } from '@/lib/api'
import type { UserProgress, UserStats } from '@/types'

function useUserProgress(sessionId: string) {
  return useQuery({
    queryKey: ['user-progress', sessionId],
    queryFn: async () => {
      const response = await userProgressAPI.get(sessionId)
      return response.data as UserProgress
    },
    enabled: !!sessionId,
  })
}

export default useUserProgress

export function useUserStats(sessionId: string) {
  return useQuery({
    queryKey: ['user-stats', sessionId],
    queryFn: async () => {
      const response = await userProgressAPI.getStats(sessionId)
      return response.data as UserStats
    },
    enabled: !!sessionId,
  })
}

export function useUpdateUserProgress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      date, 
      infoIndex 
    }: { 
      sessionId: string
      date: string
      infoIndex: number 
    }) => {
      console.log('🚀 useUpdateUserProgress 호출:', { sessionId, date, infoIndex })
      const response = await userProgressAPI.update(sessionId, date, infoIndex)
      console.log('✅ useUpdateUserProgress 응답:', response.data)
      return response.data
    },
    onSuccess: (data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-progress', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['period-stats', sessionId] })
    },
  })
}

export function useUpdateUserStats() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      stats 
    }: { 
      sessionId: string
      stats: UserStats 
    }) => {
      const response = await userProgressAPI.updateStats(sessionId, stats)
      return response.data
    },
    onSuccess: (data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    },
  })
}

export function useUpdateQuizScore() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      score, 
      totalQuestions 
    }: { 
      sessionId: string
      score: number
      totalQuestions: number 
    }) => {
      const response = await userProgressAPI.updateQuizScore(sessionId, {
        score,
        total_questions: totalQuestions
      })
      return response.data
    },
    onSuccess: (data, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    },
  })
}

export function useUpdateTermProgress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      term, 
      date, 
      infoIndex 
    }: { 
      sessionId: string
      term: string
      date: string
      infoIndex: number 
    }) => {
      const response = await userProgressAPI.updateTermProgress(sessionId, {
        term,
        date,
        info_index: infoIndex
      })
      return response.data
    },
    onMutate: async ({ sessionId, term, date, infoIndex }) => {
      // 낙관적 업데이트: 즉시 UI에 반영
      const queryKey = ['learned-terms-detail', sessionId, date, infoIndex]
      const previousData = queryClient.getQueryData(queryKey)
      
      queryClient.setQueryData(queryKey, (old: Set<string> | undefined) => {
        const currentSet = old || new Set()
        return new Set([...currentSet, term])
      })
      
      return { previousData, queryKey }
    },
    onError: (err, { sessionId, date, infoIndex }, context) => {
      // 에러 시 이전 상태로 롤백
      if (context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData)
      }
    },
    onSuccess: (data, { sessionId, date, infoIndex }) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['learned-terms', sessionId] })
      queryClient.invalidateQueries({ queryKey: ['learned-terms-detail', sessionId, date, infoIndex] })
    },
    onSettled: (data, error, { sessionId }) => {
      // 성공/실패 관계없이 learned-terms 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['learned-terms', sessionId] })
    },
  })
}

export function useCheckAchievements() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await userProgressAPI.checkAchievements(sessionId)
      return response.data
    },
    onSuccess: (data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['user-stats', sessionId] })
    },
  })
}

export function useLearnedTerms(sessionId: string, date: string, infoIndex: number) {
  return useQuery({
    queryKey: ['learned-terms-detail', sessionId, date, infoIndex],
    queryFn: async () => {
      const response = await userProgressAPI.get(sessionId)
      const data = response.data
      
      // __terms__{date}_{info_index} 형식의 키 찾기
      const termKey = `__terms__${date}_${infoIndex}`
      if (data[termKey]) {
        return new Set(data[termKey])
      }
      return new Set<string>()
    },
    enabled: !!sessionId && !!date,
    staleTime: 30 * 1000, // 30초간 캐시 유지 (너무 자주 새로고침 방지)
    gcTime: 5 * 60 * 1000, // 5분간 캐시 유지
    refetchOnWindowFocus: false, // 창 포커스 시 새로고침 비활성화
    refetchOnMount: true, // 컴포넌트 마운트 시 새로고침 활성화
    refetchOnReconnect: false, // 네트워크 재연결 시 새로고침 비활성화
  })
} 

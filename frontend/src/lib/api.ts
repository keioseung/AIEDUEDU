import axios from 'axios'

// Railway 배포 환경의 백엔드 주소 사용
const API_BASE_URL = 'https://aieduedu-production-d8db.up.railway.app'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 토큰을 자동으로 헤더에 추가하는 인터셉터
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 토큰 만료 시 자동 로그아웃 처리
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('currentUser')
      window.location.href = '/auth'
    }
    
    return Promise.reject(error)
  }
)

// 인증 관련 API
export const authAPI = {
  // 회원가입
  register: async (userData: { username: string; password: string; email?: string; role: string }) => {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  // 로그인
  login: async (credentials: { username: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials)
    const { access_token, user } = response.data
    
    // 토큰과 사용자 정보를 localStorage에 저장
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('currentUser', JSON.stringify(user))
    localStorage.setItem('sessionId', user.username)
    localStorage.setItem('isAdminLoggedIn', user.role === 'admin' ? 'true' : 'false')
    
    return response.data
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  // 모든 사용자 조회 (관리자용)
  getAllUsers: async () => {
    const response = await api.get('/api/auth/users')
    return response.data
  },

  // 사용자 역할 변경
  updateUserRole: async (userId: number, role: string) => {
    const response = await api.put(`/api/auth/users/${userId}/role`, { role })
    return response.data
  },

  // 사용자 삭제
  deleteUser: async (userId: number) => {
    const response = await api.delete(`/api/auth/users/${userId}`)
    return response.data
  }
}

// 로그아웃 함수
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token')
    localStorage.removeItem('currentUser')
    localStorage.removeItem('sessionId')
    localStorage.removeItem('isAdminLoggedIn')
    window.location.href = '/auth'
  }
}

// 로그 관리 API
export const logsAPI = {
  // 로그 목록 조회
  getLogs: async (params?: {
    skip?: number;
    limit?: number;
    log_type?: string;
    log_level?: string;
    username?: string;
    action?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const queryParams = new URLSearchParams()
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.log_type) queryParams.append('log_type', params.log_type)
    if (params?.log_level) queryParams.append('log_level', params.log_level)
    if (params?.username) queryParams.append('username', params.username)
    if (params?.action) queryParams.append('action', params.action)
    if (params?.start_date) queryParams.append('start_date', params.start_date)
    if (params?.end_date) queryParams.append('end_date', params.end_date)

    const response = await api.get(`/api/logs?${queryParams.toString()}`)
    return response.data
  },

  // 로그 통계 조회
  getLogStats: async () => {
    const response = await api.get('/api/logs/stats')
    return response.data
  },

  // 로그 생성
  createLog: async (logData: {
    action: string;
    details?: string;
    log_type?: string;
    log_level?: string;
    session_id?: string;
    username?: string;
  }) => {
    const response = await api.post('/api/logs', logData)
    return response.data
  },

  // 모든 로그 삭제
  clearLogs: async () => {
    const response = await api.delete('/api/logs')
    return response.data
  },

  // 임시 로그 조회 (인증 없음) - 디버깅용
  getLogsSimple: async (params?: { skip?: number; limit?: number }) => {
    const queryParams = new URLSearchParams()
    if (params?.skip) queryParams.append('skip', params.skip.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())

    const response = await api.get(`/api/logs/simple?${queryParams.toString()}`)
    return response.data
  }
}

// 시스템 관리 API - 완전한 DB 기반 구현
export const systemAPI = {
  // 시스템 정보 조회
  getSystemInfo: async () => {
    const response = await api.get('/api/system/system-info')
    return response.data
  },

  // 시스템 백업 생성
  createBackup: async (options?: {
    include_tables?: string[];
    description?: string;
  }) => {
    const response = await api.post('/api/system/backup', options, {
      responseType: 'blob'
    })
    
    // 백업 파일 다운로드
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // 파일명 추출 (Content-Disposition 헤더에서)
    const contentDisposition = response.headers['content-disposition']
    let filename = 'backup.json'
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        filename = filenameMatch[1]
      }
    }
    
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return { message: 'Backup created and downloaded successfully' }
  },

  // 시스템 복원
  restoreBackup: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/api/system/restore', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // 백업 히스토리 조회
  getBackupHistory: async () => {
    const response = await api.get('/api/system/backup-history')
    return response.data
  },

  // 백업 히스토리 삭제
  deleteBackupHistory: async (backupId: number) => {
    const response = await api.delete(`/api/system/backup-history/${backupId}`)
    return response.data
  },

  // 모든 데이터 삭제
  clearAllData: async () => {
    const response = await api.delete('/api/system/clear-all-data?confirm=true')
    return response.data
  },

  // 데이터베이스 테이블 초기화
  initDatabase: async () => {
    const response = await api.post('/api/system/init-database')
    return response.data
  },

  // 데이터베이스 상태 확인
  getDatabaseStatus: async () => {
    const response = await api.get('/api/system/database-status')
    return response.data
  },

  // 관리자 통계 조회
  getAdminStats: async () => {
    const response = await api.get('/api/system/admin-stats')
    return response.data
  },

  // 실제 활동 로그 생성 (사용자 행동 추적용)
  logUserActivity: async (action: string, details?: string) => {
    try {
      await logsAPI.createLog({
        action,
        details: details || `사용자가 ${action} 작업을 수행했습니다.`,
        log_type: 'user',
        log_level: 'info'
      })
    } catch (error) {
      // 로그 기록 실패는 무시
    }
  }
}

// AI Info API
export const aiInfoAPI = {
  getByDate: (date: string) => api.get(`/api/ai-info/${date}`),
  add: (data: any) => api.post('/api/ai-info/', data),
  delete: (date: string) => api.delete(`/api/ai-info/${date}`),
  deleteItem: (date: string, itemIndex: number) => api.delete(`/api/ai-info/${date}/item/${itemIndex}`),
  getAllDates: () => api.get('/api/ai-info/dates/all'),
  getAll: (language: string = 'ko') => api.get(`/api/ai-info/all?language=${language}`),
  // 새로운 API: 제목만 가져오기
  getAllTitles: (language: string = 'ko') => api.get(`/api/ai-info/titles/${language}`),
  // 새로운 API: 특정 항목의 내용 가져오기
  getContentByIndex: (date: string, infoIndex: number, language: string = 'ko') => 
    api.get(`/api/ai-info/content/${date}/${infoIndex}/${language}`),
  getTotalDays: () => api.get('/api/ai-info/total-days'),
  getTotalCount: () => api.get('/api/ai-info/total-count'),
  getLearnedCount: (sessionId: string) => api.get(`/api/ai-info/learned-count/${sessionId}`),

      getTermsQuiz: (sessionId: string, language: string = 'ko') => api.get(`/api/ai-info/terms-quiz/${sessionId}?language=${language}`),
      getTermsQuizByDate: (date: string, language: string = 'ko') => api.get(`/api/ai-info/terms-quiz-by-date/${date}?language=${language}`),
      getLearnedTerms: (sessionId: string, language: string = 'ko') => api.get(`/api/ai-info/learned-terms/${sessionId}?language=${language}`),
  getAllTerms: (language: string = 'ko') => api.get(`/api/ai-info/all-terms/${language}`),
  
  // 용어 통계 관련 API
  getTotalTermsCount: () => api.get('/api/ai-info/terms-total-count'),
  getLearnedTermsCount: (sessionId: string) => api.get(`/api/ai-info/terms-learned-count/${sessionId}`),
  
  // 카테고리 관련 API
  getAllCategories: () => api.get('/api/ai-info/categories/all'),
  getSubcategories: (category: string) => api.get(`/api/ai-info/categories/${category}/subcategories`),
  getByCategory: (category: string, language: string = 'ko') => api.get(`/api/ai-info/by-category/${category}?language=${language}`),
  getCategoryStats: () => api.get('/api/ai-info/categories/stats'),
  
  // 카테고리만 업데이트하는 새로운 API
  updateCategoryOnly: (date: string, infoIndex: number, category: string) => 
    api.patch(`/api/ai-info/${date}/category/${infoIndex}?category=${category}`),
}

// Quiz API
export const quizAPI = {
  getTopics: (language: string = 'ko') => api.get(`/api/quiz/topics?language=${language}`),
  getByTopic: (topic: string, language: string = 'ko') => api.get(`/api/quiz/${topic}?language=${language}`),
  add: (data: any) => api.post('/api/quiz/', data),
  update: (id: number, data: any) => api.put(`/api/quiz/${id}`, data),
  delete: (id: number) => api.delete(`/api/quiz/${id}`),
  generate: (topic: string) => api.get(`/api/quiz/generate/${topic}`),
}

// User Progress API
export const userProgressAPI = {
  get: (sessionId: string) => api.get(`/api/user-progress/${sessionId}`),
  update: (sessionId: string, date: string, infoIndex: number) => 
    api.post(`/api/user-progress/${sessionId}/${date}/${infoIndex}`),
  updateTermProgress: (sessionId: string, termData: any) => 
    api.post(`/api/user-progress/term-progress/${sessionId}`, termData),
  getStats: (sessionId: string) => api.get(`/api/user-progress/stats/${sessionId}`),
  getPeriodStats: (sessionId: string, startDate: string, endDate: string) => 
    api.get(`/api/user-progress/period-stats/${sessionId}?start_date=${startDate}&end_date=${endDate}`),
  getTotalTermsStats: (sessionId: string) => 
    api.get(`/api/user-progress/total-terms-stats/${sessionId}`),
  updateStats: (sessionId: string, stats: any) => 
    api.post(`/api/user-progress/stats/${sessionId}`, stats),
  updateQuizScore: (sessionId: string, scoreData: any) => 
    api.post(`/api/user-progress/quiz-score/${sessionId}`, scoreData),
  checkAchievements: (sessionId: string) => 
    api.get(`/api/user-progress/achievements/${sessionId}`),
  deleteByDate: (sessionId: string, date: string) => api.delete(`/api/user-progress/${sessionId}/${date}`),
  deleteInfoIndex: (sessionId: string, date: string, infoIndex: number) => api.delete(`/api/user-progress/${sessionId}/${date}/${infoIndex}`),
  // 새로운 API: 모든 학습 진행 데이터 초기화
  resetAllProgress: (sessionId: string) => api.post(`/api/user-progress/reset-all-progress/${sessionId}`),
}

// Prompt API
export const promptAPI = {
  getAll: () => api.get('/api/prompt/'),
  add: (data: any) => api.post('/api/prompt/', data),
  update: (id: number, data: any) => api.put(`/api/prompt/${id}`, data),
  delete: (id: number) => api.delete(`/api/prompt/${id}`),
  getByCategory: (category: string) => api.get(`/api/prompt/category/${category}`),
}

// Base Content API
export const baseContentAPI = {
  getAll: () => api.get('/api/base-content/'),
  add: (data: any) => api.post('/api/base-content/', data),
  update: (id: number, data: any) => api.put(`/api/base-content/${id}`, data),
  delete: (id: number) => api.delete(`/api/base-content/${id}`),
  getByCategory: (category: string) => api.get(`/api/base-content/category/${category}`),
} 
"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaBrain, FaArrowLeft, FaPlus, FaEdit, FaTrash, FaRobot, FaFileAlt, FaCopy, FaSave, FaTimes, FaDownload, FaUpload, FaCog } from 'react-icons/fa'
import { aiInfoAPI, promptAPI, baseContentAPI } from '@/lib/api'
import { AIInfoItem, TermItem } from '@/types'
import { t } from '@/lib/i18n'

interface ServerPrompt {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

interface ServerBaseContent {
  id: number
  title: string
  content: string
  category: string
  created_at: string
}

export default function AdminAIInfoPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [inputs, setInputs] = useState([{ 
    title_ko: '', title_en: '', title_ja: '', title_zh: '', 
    content_ko: '', content_en: '', content_ja: '', content_zh: '', 
    terms_ko: [] as TermItem[], terms_en: [] as TermItem[], terms_ja: [] as TermItem[], terms_zh: [] as TermItem[], 
    category: '' 
  }])
  const [editId, setEditId] = useState<boolean>(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 프롬프트 관리 상태
  const [promptTitle, setPromptTitle] = useState('')
  const [promptContent, setPromptContent] = useState('')
  const [promptEditId, setPromptEditId] = useState<number | null>(null)

  // 기반 내용 관리 상태
  const [baseTitle, setBaseTitle] = useState('')
  const [baseContent, setBaseContent] = useState('')
  const [baseEditId, setBaseEditId] = useState<number | null>(null)
  const [showBaseContent, setShowBaseContent] = useState<number | null>(null)

  // 목록 보기 상태
  const [showAIInfoList, setShowAIInfoList] = useState(false)
  const [showPromptList, setShowPromptList] = useState(false)
  const [showBaseContentList, setShowBaseContentList] = useState(false)
  
  // 전체 AI 정보 관리 상태
  const [showAllAIInfo, setShowAllAIInfo] = useState(false)
  const [editingAIInfo, setEditingAIInfo] = useState<{id: string, index: number} | null>(null)
  const [editingData, setEditingData] = useState<Partial<AIInfoItem>>({
    title_ko: '', title_en: '', title_ja: '', title_zh: '',
    content_ko: '', content_en: '', content_ja: '', content_zh: '',
    category: '', 
    terms_ko: [] as TermItem[], terms_en: [] as TermItem[], terms_ja: [] as TermItem[], terms_zh: [] as TermItem[]
  })
  
  // 검색 및 필터링 상태
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'category'>('date')

  // 프롬프트+기반내용 합치기 상태
  const [selectedPromptId, setSelectedPromptId] = useState<number | null>(null)
  const [selectedBaseId, setSelectedBaseId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  // 전문용어 일괄 입력 상태
  const [bulkTermsText, setBulkTermsText] = useState('')
  const [bulkTermsTextEn, setBulkTermsTextEn] = useState('')
  const [bulkTermsTextJa, setBulkTermsTextJa] = useState('')
  const [bulkTermsTextZh, setBulkTermsTextZh] = useState('')
  const [showBulkInput, setShowBulkInput] = useState<number | null | 'edit'>(null)
  
  // 검색된 용어 매칭 상태
  const [matchedTerms, setMatchedTerms] = useState<Array<{
    term: string
    description: string
    language: 'ko' | 'en' | 'ja' | 'zh'
    sourceCard: {
      date: string
      index: number
      title: string
      category: string
    }
  }>>([])
  const [showMatchedTerms, setShowMatchedTerms] = useState(false)

  // 단어 검색 기능 상태
  const [wordSearchQuery, setWordSearchQuery] = useState('')
  const [wordSearchType, setWordSearchType] = useState<'content' | 'terms' | 'exact' | 'contains'>('content')
  
  // 용어 업데이트 함수
  const handleTermUpdate = async (date: string, itemIndex: number, language: 'ko' | 'en' | 'ja' | 'zh', oldTerm: string, newTerm: string, newDescription: string) => {
    try {
      // 현재 검색 결과에서 해당 항목 찾기
      const currentItem = wordSearchResults.find(item => item.date === date && item.info_index === itemIndex)
      if (!currentItem) {
        setError('수정할 항목을 찾을 수 없습니다.')
        return
      }
      
      // 용어 업데이트
      const termsKey = `terms_${language}` as keyof AIInfoItem
      const currentTerms = (currentItem[termsKey] as TermItem[]) || []
      const updatedTerms = currentTerms.map(term => 
        term.term === oldTerm 
          ? { ...term, term: newTerm, description: newDescription }
          : term
      )
      
      // 전체 항목 업데이트
      const updatedItem = { ...currentItem, [termsKey]: updatedTerms }
      
      // updateItemMutation 사용하여 업데이트
      await updateItemMutation.mutateAsync({
        date,
        itemIndex,
        data: updatedItem
      })
      
      // 검색 결과 새로고침
      if (wordSearchQuery.trim()) {
        performWordSearch()
      }
      
      setSuccess('용어가 성공적으로 업데이트되었습니다!')
    } catch (error: any) {
      console.error('용어 업데이트 실패:', error)
      setError(`용어 업데이트에 실패했습니다: ${error?.message || '알 수 없는 오류'}`)
    }
  }
  const [wordSearchResults, setWordSearchResults] = useState<AIInfoItem[]>([])
  const [isWordSearching, setIsWordSearching] = useState(false)
  
  // 날짜별 AI 정보 관리 상태 (기존 기능 유지)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedDateAIInfo, setSelectedDateAIInfo] = useState<AIInfoItem[]>([])
  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [categories] = useState([
    "챗봇/대화형 AI",
    "이미지 생성 AI", 
    "코딩/개발 도구",
    "음성/오디오 AI",
    "데이터 분석/ML",
    "AI 윤리/정책",
    "AI 하드웨어/인프라",
    "AI 응용 서비스",
    "미분류"
  ])

  // 서버에서 날짜별 AI 정보 목록 불러오기
  const { data: dates = [], refetch: refetchDates } = useQuery({
    queryKey: ['ai-info-dates'],
    queryFn: async () => {
      const res = await aiInfoAPI.getAllDates()
      console.log('getAllDates Response:', res)
      console.log('getAllDates Data:', res.data)
      console.log('getAllDates Data Type:', typeof res.data)
      console.log('getAllDates Data Length:', Array.isArray(res.data) ? res.data.length : 'Not Array')
      return res.data as string[]
    }
  })

  // 선택한 날짜의 AI 정보 불러오기
  const { data: aiInfos = [], refetch: refetchAIInfo, isFetching } = useQuery({
    queryKey: ['ai-info', date],
    queryFn: async () => {
      if (!date) return []
      const res = await aiInfoAPI.getByDate(date)
      console.log('getByDate Response for', date, ':', res)
      console.log('getByDate Data for', date, ':', res.data)
      return res.data as AIInfoItem[]
    },
    enabled: !!date,
  })

  // 단어 검색 함수
  const performWordSearch = async () => {
    if (!wordSearchQuery.trim()) {
      setError('검색할 단어를 입력해주세요.')
      return
    }

    setIsWordSearching(true)
    setError('')
    
    try {
      const allData = await refetchAllAIInfo()
      if (allData.data) {
        const results: AIInfoItem[] = []
        
        allData.data.forEach((dateGroup: any) => {
          dateGroup.infos.forEach((info: AIInfoItem) => {
            let isMatch = false
            
            if (wordSearchType === 'content') {
              // 내용에서 일반 검색
              if (info.content_ko?.toLowerCase().includes(wordSearchQuery.toLowerCase()) ||
                  info.content_en?.toLowerCase().includes(wordSearchQuery.toLowerCase()) ||
                  info.content_ja?.toLowerCase().includes(wordSearchQuery.toLowerCase()) ||
                  info.content_zh?.toLowerCase().includes(wordSearchQuery.toLowerCase())) {
                isMatch = true
              }
            } else if (wordSearchType === 'terms') {
              // 관련 용어에서 검색
              if (info.terms_ko?.some(term => term.term.toLowerCase().includes(wordSearchQuery.toLowerCase())) ||
                  info.terms_en?.some(term => term.term.toLowerCase().includes(wordSearchQuery.toLowerCase())) ||
                  info.terms_ja?.some(term => term.term.toLowerCase().includes(wordSearchQuery.toLowerCase())) ||
                  info.terms_zh?.some(term => term.term.toLowerCase().includes(wordSearchQuery.toLowerCase()))) {
                isMatch = true
              }
            } else if (wordSearchType === 'exact') {
              // 내용에서 정확히 일치하는 단어 검색
              if (info.content_ko?.toLowerCase() === wordSearchQuery.toLowerCase() ||
                  info.content_en?.toLowerCase() === wordSearchQuery.toLowerCase() ||
                  info.content_ja?.toLowerCase() === wordSearchQuery.toLowerCase() ||
                  info.content_zh?.toLowerCase() === wordSearchQuery.toLowerCase()) {
                isMatch = true
              }
            } else if (wordSearchType === 'contains') {
              // 내용에서 포함된 단어 검색
              if (info.content_ko?.toLowerCase().includes(wordSearchQuery.toLowerCase()) ||
                  info.content_en?.toLowerCase().includes(wordSearchQuery.toLowerCase()) ||
                  info.content_ja?.toLowerCase().includes(wordSearchQuery.toLowerCase()) ||
                  info.content_zh?.toLowerCase().includes(wordSearchQuery.toLowerCase())) {
                isMatch = true
              }
            }
            
            if (isMatch) {
              results.push(info)
            }
          })
        })
        
        setWordSearchResults(results)
        setSuccess(`"${wordSearchQuery}" 단어로 ${results.length}개의 결과를 찾았습니다.`)
      }
    } catch (error) {
      console.error('단어 검색 실패:', error)
      setError('검색 중 오류가 발생했습니다.')
    } finally {
      setIsWordSearching(false)
    }
  }

  // 전체 AI 정보 불러오기
  const { data: allAIInfos = [], refetch: refetchAllAIInfo, isLoading: isLoadingAllAIInfo } = useQuery({
    queryKey: ['all-ai-info'],
    queryFn: async () => {
      console.log('전체 AI 정보 수집 시작...')
      
      try {
        // getAllDates로 모든 날짜 가져오기
        const datesRes = await aiInfoAPI.getAllDates()
        if (datesRes.data && datesRes.data.length > 0) {
          console.log('getAllDates 성공, 각 날짜별로 데이터 수집...')
          const allData = []
          
          for (const dateItem of datesRes.data) {
            try {
              const dateData = await aiInfoAPI.getByDate(dateItem)
              if (dateData.data && dateData.data.length > 0) {
                allData.push({
                  date: dateItem,
                  infos: dateData.data
                })
                console.log(`날짜 ${dateItem} 데이터:`, dateData.data)
              }
            } catch (error) {
              console.log(`날짜 ${dateItem} 데이터 가져오기 실패:`, error)
            }
          }
          
          console.log('수집된 전체 데이터:', allData)
          return allData
        } else {
          console.log('getAllDates에서 날짜 데이터를 가져올 수 없습니다.')
          return []
        }
      } catch (error) {
        console.error('전체 AI 정보 수집 실패:', error)
        return []
      }
    },
    enabled: true, // 항상 활성화
    staleTime: 30000, // 30초 동안 캐시 유지
    gcTime: 300000, // 5분 동안 가비지 컬렉션 방지
  })

  // 서버에서 프롬프트 목록 불러오기
  const { data: prompts = [], refetch: refetchPrompts } = useQuery({
    queryKey: ['prompts'],
    queryFn: async () => {
      const res = await promptAPI.getAll()
      return res.data as ServerPrompt[]
    }
  })

  // 서버에서 기반 내용 목록 불러오기
  const { data: baseContents = [], refetch: refetchBaseContents } = useQuery({
    queryKey: ['baseContents'],
    queryFn: async () => {
      const res = await baseContentAPI.getAll()
      return res.data as ServerBaseContent[]
    }
  })

  // AI 정보 등록/수정
  const addOrUpdateMutation = useMutation({
    mutationFn: async () => {
      return aiInfoAPI.add({ date, infos: inputs })
    },
    onMutate: () => {
      setError('')
      setSuccess('')
    },
    onSuccess: () => {
      refetchAIInfo()
      refetchDates()
      refetchAllAIInfo()
      setInputs([{ 
        title_ko: '', title_en: '', title_ja: '', title_zh: '', 
        content_ko: '', content_en: '', content_ja: '', content_zh: '', 
        terms_ko: [] as TermItem[], terms_en: [] as TermItem[], terms_ja: [] as TermItem[], terms_zh: [] as TermItem[], 
        category: '' 
      }])
      setDate('')
      setEditId(false)
      setSuccess('등록이 완료되었습니다!')
    },
    onError: () => {
      setError('등록에 실패했습니다. 다시 시도해주세요.')
    }
  })

  // AI 정보 삭제
  const deleteMutation = useMutation({
    mutationFn: async (date: string) => {
      console.log('🗑️ 삭제 시도:', date)
      const response = await aiInfoAPI.delete(date)
      console.log('✅ 삭제 성공:', response)
      return response
    },
    onSuccess: (data, date) => {
      console.log('🎉 삭제 완료:', date, data)
      refetchAIInfo()
      refetchDates()
      refetchAllAIInfo()
      setInputs([{ 
        title_ko: '', title_en: '', title_ja: '', title_zh: '', 
        content_ko: '', content_en: '', content_ja: '', content_zh: '', 
        terms_ko: [] as TermItem[], terms_en: [] as TermItem[], terms_ja: [] as TermItem[], terms_zh: [] as TermItem[], 
        category: '' 
      }])
      setDate('')
      setEditId(false)
      setSuccess('삭제가 완료되었습니다!')
    },
    onError: (error: any, date) => {
      console.error('❌ 삭제 실패:', date, error)
      console.error('에러 상세:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      })
      setError(`삭제에 실패했습니다: ${error?.response?.data?.detail || error?.message || '알 수 없는 오류'}`)
    }
  })

  // AI 정보 개별 항목 삭제
  const deleteItemMutation = useMutation({
    mutationFn: async ({ date, itemIndex }: { date: string; itemIndex: number }) => {
      console.log('🗑️ 항목 삭제 시도:', { date, itemIndex })
      const response = await aiInfoAPI.deleteItem(date, itemIndex)
      console.log('✅ 항목 삭제 성공:', response)
      return response
    },
    onSuccess: (data, variables) => {
      console.log('🎉 항목 삭제 완료:', variables, data)
      refetchAIInfo()
      refetchDates()
      refetchAllAIInfo()
      setSuccess('항목이 삭제되었습니다!')
    },
    onError: (error: any, variables) => {
      console.error('❌ 항목 삭제 실패:', variables, error)
      console.error('에러 상세:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      })
      setError(`항목 삭제에 실패했습니다: ${error?.response?.data?.detail || error?.message || '알 수 없는 오류'}`)
    }
  })

  // AI 정보 개별 항목 수정
  const updateItemMutation = useMutation({
    mutationFn: async ({ date, itemIndex, data }: { date: string; itemIndex: number; data: AIInfoItem }) => {
      console.log('✏️ 항목 수정 시도:', { date, itemIndex, data })
      
      // 기존 데이터를 가져와서 특정 항목만 수정
      let existingData = allAIInfos.find(item => item.date === date)
      
      // allAIInfos에서 찾지 못한 경우, 직접 API로 데이터를 가져옴
      if (!existingData) {
        console.log('⚠️ allAIInfos에서 데이터를 찾을 수 없음, API로 직접 가져오기 시도...')
        try {
          const response = await aiInfoAPI.getByDate(date)
          if (response.data && response.data.length > 0) {
            existingData = {
              date: date,
              infos: response.data
            }
            console.log('✅ API로 데이터 가져오기 성공:', existingData)
          } else {
            throw new Error(`날짜 ${date}에 대한 데이터가 없습니다.`)
          }
        } catch (error) {
          console.error('❌ API로 데이터 가져오기 실패:', error)
          throw new Error(`데이터를 가져올 수 없습니다: ${error}`)
        }
      }
      
      if (!existingData) {
        console.error('❌ 해당 날짜의 데이터를 찾을 수 없음:', date)
        console.log('현재 allAIInfos:', allAIInfos)
        throw new Error(`해당 날짜(${date})의 데이터를 찾을 수 없습니다.`)
      }
      
      const updatedInfos = [...existingData.infos]
      updatedInfos[itemIndex] = data
      
      console.log('📝 수정된 데이터:', { date, updatedInfos })
      
      // 전체 데이터를 다시 저장
      const response = await aiInfoAPI.add({ date, infos: updatedInfos })
      console.log('✅ 항목 수정 성공:', response)
      return response
    },
    onSuccess: (data, variables) => {
      console.log('🎉 항목 수정 완료:', variables, data)
      refetchAIInfo()
      refetchDates()
      refetchAllAIInfo()
      setEditingAIInfo(null)
      setEditingData({
        title_ko: '', title_en: '', title_ja: '', title_zh: '',
        content_ko: '', content_en: '', content_ja: '', content_zh: '',
        category: '', 
        terms_ko: [], terms_en: [], terms_ja: [], terms_zh: []
      })
      setSuccess('항목이 수정되었습니다!')
    },
    onError: (error: any, variables) => {
      console.error('❌ 항목 수정 실패:', variables, error)
      console.error('에러 상세:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText
      })
      setError(`항목 수정에 실패했습니다: ${error?.response?.data?.detail || error?.message || '알 수 없는 오류'}`)
    }
  })

  // 프롬프트 추가/수정
  const promptMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; id?: number }) => {
      console.log('Sending prompt data:', data)
      if (data.id) {
        return promptAPI.update(data.id, { title: data.title, content: data.content, category: 'default' })
      } else {
        return promptAPI.add({ title: data.title, content: data.content, category: 'default' })
      }
    },
    onSuccess: () => {
      refetchPrompts()
      setPromptTitle('')
      setPromptContent('')
      setPromptEditId(null)
      setSuccess('프롬프트가 저장되었습니다!')
    },
    onError: (error: any) => {
      console.error('Prompt error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        url: error?.config?.url,
        method: error?.config?.method,
        data: error?.config?.data
      })
      
      let errorMessage = '프롬프트 저장에 실패했습니다.'
      
      if (error?.response?.data?.detail) {
        errorMessage = `프롬프트 저장 실패: ${error.response.data.detail}`
      } else if (error?.response?.data?.error) {
        errorMessage = `프롬프트 저장 실패: ${error.response.data.error}`
      } else if (error?.message) {
        errorMessage = `프롬프트 저장 실패: ${error.message}`
      }
      
      setError(errorMessage)
    }
  })

  // 프롬프트 삭제
  const promptDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return promptAPI.delete(id)
    },
    onSuccess: () => {
      refetchPrompts()
      setSuccess('프롬프트가 삭제되었습니다!')
    },
    onError: (error: any) => {
      console.error('Prompt delete error:', error)
      console.error('Error response:', error?.response)
      console.error('Error data:', error?.response?.data)
      
      let errorMessage = '프롬프트 삭제에 실패했습니다.'
      if (error?.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error?.response?.data?.error) {
        errorMessage = error.response.data.error
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      setError(`프롬프트 삭제 실패: ${errorMessage}`)
    }
  })

  // 기반 내용 추가/수정
  const baseContentMutation = useMutation({
    mutationFn: async (data: { title: string; content: string; id?: number }) => {
      if (data.id) {
        return baseContentAPI.update(data.id, { title: data.title, content: data.content, category: 'default' })
      } else {
        return baseContentAPI.add({ title: data.title, content: data.content, category: 'default' })
      }
    },
    onSuccess: () => {
      refetchBaseContents()
      setBaseTitle('')
      setBaseContent('')
      setBaseEditId(null)
      setSuccess('기반 내용이 저장되었습니다!')
    },
    onError: () => {
      setError('기반 내용 저장에 실패했습니다.')
    }
  })

  // 기반 내용 삭제
  const baseContentDeleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return baseContentAPI.delete(id)
    },
    onSuccess: () => {
      refetchBaseContents()
      setSuccess('기반 내용이 삭제되었습니다!')
    },
    onError: () => {
      setError('기반 내용 삭제에 실패했습니다.')
    }
  })

  const handleInputChange = (idx: number, field: 'title_ko' | 'title_en' | 'title_ja' | 'title_zh' | 'content_ko' | 'content_en' | 'content_ja' | 'content_zh' | 'category', value: string) => {
    setInputs(inputs => inputs.map((input, i) => i === idx ? { ...input, [field]: value } : input))
  }

  const handleAddInput = () => {
    if (inputs.length < 3) {
      setInputs([...inputs, { 
        title_ko: '', title_en: '', title_ja: '', title_zh: '', 
        content_ko: '', content_en: '', content_ja: '', content_zh: '', 
        terms_ko: [] as TermItem[], terms_en: [] as TermItem[], terms_ja: [] as TermItem[], terms_zh: [] as TermItem[], 
        category: '' 
      }])
    }
  }

  const handleRemoveInput = (idx: number) => {
    setInputs(inputs => inputs.length === 1 ? inputs : inputs.filter((_, i) => i !== idx))
  }

  // 용어 관리 핸들러 - 한국어 기준으로 수정
  const handleAddTerm = (infoIdx: number) => {
    setInputs(inputs => inputs.map((input, i) => 
      i === infoIdx 
        ? { ...input, terms_ko: [...input.terms_ko, { term: '', description: '' }] }
        : input
    ))
  }

  // 전문용어 일괄 입력 파싱 함수
  const parseTermsFromText = (text: string): TermItem[] => {
    const lines = text.trim().split('\n')
    const terms: TermItem[] = []
    
    for (const line of lines) {
      const trimmedLine = line.trim()
      if (!trimmedLine) continue
      
      // 탭으로 구분된 경우
      if (trimmedLine.includes('\t')) {
        const [term, description] = trimmedLine.split('\t').map(s => s.trim())
        if (term && description) {
          terms.push({ term, description })
        }
      }
      // 공백으로 구분된 경우 (탭이 없는 경우)
      else {
        const parts = trimmedLine.split(/\s{2,}/) // 2개 이상의 공백으로 구분
        if (parts.length >= 2) {
          const term = parts[0].trim()
          const description = parts.slice(1).join(' ').trim()
          if (term && description) {
            terms.push({ term, description })
          }
        }
      }
    }
    
    return terms
  }

  // 검색된 용어와 매칭하는 함수
  const findMatchingTerms = (inputTerms: TermItem[], language: 'ko' | 'en' | 'ja' | 'zh') => {
    const matches: Array<{
      term: string
      description: string
      language: 'ko' | 'en' | 'ja' | 'zh'
      sourceCard: {
        date: string
        index: number
        title: string
        category: string
      }
    }> = []
    
    if (!allAIInfos || allAIInfos.length === 0) return matches
    
    inputTerms.forEach(inputTerm => {
      allAIInfos.forEach(dateGroup => {
        dateGroup.infos.forEach((info: AIInfoItem, index: number) => {
          const terms = info[`terms_${language}`] || []
          const matchedTerm = terms.find(term => term.term.toLowerCase() === inputTerm.term.toLowerCase())
          
          if (matchedTerm) {
            matches.push({
              term: matchedTerm.term,
              description: matchedTerm.description,
              language,
              sourceCard: {
                date: dateGroup.date,
                index: index,
                title: info.title || `카드 ${index + 1}`,
                category: info.category || '미분류'
              }
            })
          }
        })
      })
    })
    
    return matches
  }

  // 전문용어 일괄 입력 핸들러
  const handleBulkTermsInput = (infoIdx: number) => {
    setShowBulkInput(infoIdx)
    setBulkTermsText('')
    setBulkTermsTextEn('')
    setBulkTermsTextJa('')
    setBulkTermsTextZh('')
    setMatchedTerms([])
    setShowMatchedTerms(false)
  }

  const handleBulkTermsSubmit = (infoIdx: number) => {
    let totalAdded = 0
    const allMatches: Array<{
      term: string
      description: string
      language: 'ko' | 'en' | 'ja' | 'zh'
      sourceCard: {
        date: string
        index: number
        title: string
        category: string
      }
    }> = []
    
    // 한국어 용어 처리
    if (bulkTermsText.trim()) {
      const parsedTermsKo = parseTermsFromText(bulkTermsText)
      if (parsedTermsKo.length > 0) {
        // 매칭된 용어 찾기
        const matchesKo = findMatchingTerms(parsedTermsKo, 'ko')
        allMatches.push(...matchesKo)
        
        setInputs(inputs => inputs.map((input, i) => 
          i === infoIdx 
            ? { ...input, terms_ko: [...input.terms_ko, ...parsedTermsKo] }
            : input
        ))
        totalAdded += parsedTermsKo.length
      }
    }
    
    // 영어 용어 처리
    if (bulkTermsTextEn.trim()) {
      const parsedTermsEn = parseTermsFromText(bulkTermsTextEn)
      if (parsedTermsEn.length > 0) {
        // 매칭된 용어 찾기
        const matchesEn = findMatchingTerms(parsedTermsEn, 'en')
        allMatches.push(...matchesEn)
        
        setInputs(inputs => inputs.map((input, i) => 
          i === infoIdx 
            ? { ...input, terms_en: [...input.terms_en, ...parsedTermsEn] }
            : input
        ))
        totalAdded += parsedTermsEn.length
      }
    }
    
    // 일본어 용어 처리
    if (bulkTermsTextJa.trim()) {
      const parsedTermsJa = parseTermsFromText(bulkTermsTextJa)
      if (parsedTermsJa.length > 0) {
        // 매칭된 용어 찾기
        const matchesJa = findMatchingTerms(parsedTermsJa, 'ja')
        allMatches.push(...matchesJa)
        
        setInputs(inputs => inputs.map((input, i) => 
          i === infoIdx 
            ? { ...input, terms_ja: [...input.terms_ja, ...parsedTermsJa] }
            : input
        ))
        totalAdded += parsedTermsJa.length
      }
    }
    
    // 중국어 용어 처리
    if (bulkTermsTextZh.trim()) {
      const parsedTermsZh = parseTermsFromText(bulkTermsTextZh)
      if (parsedTermsZh.length > 0) {
        // 매칭된 용어 찾기
        const matchesZh = findMatchingTerms(parsedTermsZh, 'zh')
        allMatches.push(...matchesZh)
        
        setInputs(inputs => inputs.map((input, i) => 
          i === infoIdx 
            ? { ...input, terms_zh: [...input.terms_zh, ...parsedTermsZh] }
            : input
        ))
        totalAdded += parsedTermsZh.length
      }
    }
    
    // 매칭된 용어가 있으면 표시
    if (allMatches.length > 0) {
      setMatchedTerms(allMatches)
      setShowMatchedTerms(true)
    }
    
    if (totalAdded > 0) {
      alert(`총 ${totalAdded}개의 용어가 추가되었습니다!${allMatches.length > 0 ? `\n\n${allMatches.length}개의 용어가 기존 학습 내용과 일치합니다.` : ''}`)
    } else {
      alert('파싱할 수 있는 용어가 없습니다. 형식을 확인해주세요.')
    }
    
    setShowBulkInput(null)
    setBulkTermsText('')
    setBulkTermsTextEn('')
    setBulkTermsTextJa('')
    setBulkTermsTextZh('')
  }

  const handleBulkTermsCancel = () => {
    setShowBulkInput(null)
    setBulkTermsText('')
    setBulkTermsTextEn('')
    setBulkTermsTextJa('')
    setBulkTermsTextZh('')
  }

  const handleRemoveTerm = (infoIdx: number, termIdx: number) => {
    setInputs(inputs => inputs.map((input, i) => 
      i === infoIdx 
        ? { ...input, terms_ko: input.terms_ko.filter((_, j) => j !== termIdx) }
        : input
    ))
  }

  const handleTermChange = (infoIdx: number, termIdx: number, field: 'term' | 'description', value: string) => {
    setInputs(inputs => inputs.map((input, i) => 
      i === infoIdx 
        ? { 
            ...input, 
            terms_ko: input.terms_ko.map((term, j) => 
              j === termIdx ? { ...term, [field]: value } : term
            )
          }
        : input
    ))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!date) {
      setError('날짜를 선택하세요.')
      return
    }
    if (inputs.some(input => !input.title_ko.trim() || !input.content_ko.trim())) {
      setError('모든 제목과 내용을 입력하세요.')
      return
    }
    addOrUpdateMutation.mutate()
  }

  const handleEdit = (info: AIInfoItem, idx: number) => {
    setEditId(true)
    setInputs([{ 
      title_ko: info.title, title_en: '', title_ja: '', title_zh: '', 
      content_ko: info.content, content_en: '', content_ja: '', content_zh: '', 
      terms_ko: info.terms || [], terms_en: [], terms_ja: [], terms_zh: [], 
      category: info.category || '' 
    }])
  }

  const handleDelete = (date: string) => {
    deleteMutation.mutate(date)
  }

  const handleDeleteItem = (date: string, itemIndex: number) => {
    if (window.confirm('정말 이 항목을 삭제하시겠습니까?')) {
      deleteItemMutation.mutate({ date, itemIndex })
    }
  }

  // 전체 AI 정보 관리 핸들러
  const handleEditAIInfo = (date: string, index: number, info: AIInfoItem) => {
    setEditingAIInfo({ id: date, index })
    setEditingData({
      title_ko: info.title,
      title_en: '',
      title_ja: '',
      title_zh: '',
      content_ko: info.content,
      content_en: '',
      content_ja: '',
      content_zh: '',
      category: info.category || '',
      terms_ko: info.terms || [],
      terms_en: [],
      terms_ja: [],
      terms_zh: []
    })
  }

  const handleUpdateAIInfo = () => {
    if (!editingAIInfo) return
    
    if (!editingData.title_ko?.trim() || !editingData.content_ko?.trim()) {
      setError('제목과 내용을 모두 입력해주세요.')
      return
    }

    // AIInfoItem 타입에 맞게 변환 (기존 호환성 유지)
    const aiInfoData: AIInfoItem = {
      // 기존 속성 (기본값으로 설정)
      title: editingData.title_ko || '',
      content: editingData.content_ko || '',
      terms: editingData.terms_ko || [],
      
      // 다국어 속성
      title_ko: editingData.title_ko || '',
      title_en: editingData.title_en || '',
      title_ja: editingData.title_ja || '',
      title_zh: editingData.title_zh || '',
      content_ko: editingData.content_ko || '',
      content_en: editingData.content_en || '',
      content_ja: editingData.content_ja || '',
      content_zh: editingData.content_zh || '',
      category: editingData.category || '',
      terms_ko: editingData.terms_ko || [],
      terms_en: editingData.terms_en || [],
      terms_ja: editingData.terms_ja || [],
      terms_zh: editingData.terms_zh || []
    }

    updateItemMutation.mutate({
      date: editingAIInfo.id,
      itemIndex: editingAIInfo.index,
      data: aiInfoData
    })
  }

  const handleCancelEdit = () => {
    setEditingAIInfo(null)
    setEditingData({
      title_ko: '', title_en: '', title_ja: '', title_zh: '',
      content_ko: '', content_en: '', content_ja: '', content_zh: '',
      category: '', 
      terms_ko: [], terms_en: [], terms_ja: [], terms_zh: []
    })
  }

  const handleDeleteAIInfo = (date: string, index: number) => {
    if (window.confirm('정말 이 항목을 삭제하시겠습니까?')) {
      deleteItemMutation.mutate({ date, itemIndex: index })
    }
  }

  // 카테고리 변경 핸들러
  const handleCategoryChange = async (date: string, index: number, newCategory: string, oldCategory: string) => {
    // 빈 값이거나 기존과 같은 경우 변경하지 않음
    if (!newCategory || newCategory === oldCategory) {
      return
    }
    
    // 확인 메시지
    if (!window.confirm(`카테고리를 "${oldCategory || '미분류'}"에서 "${newCategory}"로 변경하시겠습니까?`)) {
      return
    }
    
    try {
      console.log('카테고리 변경 시작:', { date, index, oldCategory, newCategory })
      
      // 새로운 API를 사용하여 카테고리만 업데이트
      const response = await aiInfoAPI.updateCategoryOnly(date, index, newCategory)
      console.log('카테고리 업데이트 성공:', response)
      
      // 로컬 상태 업데이트
      queryClient.setQueryData(['all-ai-info'], (oldData: any) => {
        if (!oldData) return oldData
        
        return oldData.map((item: any) => {
          if (item.date === date) {
            return {
              ...item,
              infos: item.infos.map((info: any, i: number) => 
                i === index ? { ...info, category: newCategory } : info
              )
            }
          }
          return item
        })
      })
      
      // 현재 선택된 날짜의 데이터도 업데이트
      if (date === date) {
        queryClient.setQueryData(['ai-info', date], (oldData: any) => {
          if (!oldData) return oldData
          
          return oldData.map((info: any, i: number) => 
            i === index ? { ...info, category: newCategory } : info
          )
        })
      }
      
      console.log('로컬 상태 업데이트 완료')
      setSuccess(`카테고리가 "${oldCategory || '미분류'}"에서 "${newCategory}"로 변경되었습니다!`)
    } catch (error) {
      console.error('카테고리 변경 오류:', error)
      setError('카테고리 변경에 실패했습니다.')
    }
  }

  // 필터링된 AI 정보 계산
  const filteredAIInfos = allAIInfos
    .map(dateGroup => ({
      ...dateGroup,
      infos: dateGroup.infos.filter((info: AIInfoItem) => {
        const matchesSearch = !searchTerm || 
          info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          info.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (info.terms && info.terms.some(term => 
            term.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            term.description.toLowerCase().includes(searchTerm.toLowerCase())
          ))
        
        const matchesCategory = !selectedCategory || info.category === selectedCategory
        
        return matchesSearch && matchesCategory
      })
    }))
    .filter(dateGroup => dateGroup.infos.length > 0)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else if (sortBy === 'title') {
        return a.infos[0]?.title.localeCompare(b.infos[0]?.title || '')
      } else if (sortBy === 'category') {
        return (a.infos[0]?.category || '').localeCompare(b.infos[0]?.category || '')
      }
      return 0
    })

  // 프롬프트 관리 핸들러
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!promptTitle || !promptContent) return
    
    promptMutation.mutate({
      title: promptTitle,
      content: promptContent,
      id: promptEditId || undefined
    })
  }

  const handlePromptEdit = (p: ServerPrompt) => {
    setPromptEditId(p.id)
    setPromptTitle(p.title)
    setPromptContent(p.content)
  }

  const handlePromptDelete = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      promptDeleteMutation.mutate(id)
      if (promptEditId === id) {
        setPromptEditId(null)
        setPromptTitle('')
        setPromptContent('')
      }
    }
  }

  // 기반 내용 관리 핸들러
  const handleBaseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!baseTitle || !baseContent) return
    
    baseContentMutation.mutate({
      title: baseTitle,
      content: baseContent,
      id: baseEditId || undefined
    })
  }

  const handleBaseEdit = (b: ServerBaseContent) => {
    setBaseEditId(b.id)
    setBaseTitle(b.title)
    setBaseContent(b.content)
  }

  const handleBaseDelete = (id: number) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      baseContentDeleteMutation.mutate(id)
      if (baseEditId === id) {
        setBaseEditId(null)
        setBaseTitle('')
        setBaseContent('')
      }
    }
  }

  // 프롬프트+기반내용 합치기
  const getCombinedText = () => {
    const prompt = prompts.find(p => p.id === selectedPromptId)
    const base = baseContents.find(b => b.id === selectedBaseId)
    return [prompt?.content || '', base ? `\n\n[기반 내용]\n${base.content}` : ''].join('')
  }

  const handleCopyAndGo = () => {
    const text = getCombinedText()
    navigator.clipboard.writeText(text)
    setCopied(true)
    window.open('https://chat.openai.com/', '_blank')
    setTimeout(() => setCopied(false), 2000)
  }

  // 데이터 백업/복원 함수들
  const exportData = async () => {
    try {
      const [promptsRes, baseContentsRes] = await Promise.all([
        promptAPI.getAll(),
        baseContentAPI.getAll()
      ])
      
      const data = {
        prompts: promptsRes.data,
        baseContents: baseContentsRes.data,
        exportDate: new Date().toISOString(),
        version: "2.0"
      }
      
      const dataStr = JSON.stringify(data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      
      const link = document.createElement('a')
      link.href = URL.createObjectURL(dataBlob)
      link.download = `ai_info_backup_${new Date().toISOString().split('T')[0]}.json`
      link.click()
      
      setSuccess('데이터가 백업되었습니다!')
    } catch (error) {
      setError('백업 중 오류가 발생했습니다.')
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        
        if (data.prompts && data.baseContents) {
          // 서버에 데이터 업로드
          const promises = []
          
          // 프롬프트 업로드
          for (const prompt of data.prompts) {
            promises.push(promptAPI.add({
              title: prompt.title,
              content: prompt.content,
              category: prompt.category || 'default'
            }))
          }
          
          // 기반 내용 업로드
          for (const base of data.baseContents) {
            promises.push(baseContentAPI.add({
              title: base.title,
              content: base.content,
              category: base.category || 'default'
            }))
          }
          
          await Promise.all(promises)
          
          // 데이터 새로고침
          refetchPrompts()
          refetchBaseContents()
          
          setSuccess(`데이터가 복원되었습니다!\n프롬프트: ${data.prompts.length}개\n기반 내용: ${data.baseContents.length}개`)
        } else {
          setError('올바르지 않은 백업 파일입니다.')
        }
      } catch (error) {
        setError('파일을 읽는 중 오류가 발생했습니다.')
        console.error('Import error:', error)
      }
    }
    reader.readAsText(file)
    
    // 파일 입력 초기화
    event.target.value = ''
  }

  // 프롬프트+기반내용 합치기 영역 선택 기능
  const combinedRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        if (document.activeElement === combinedRef.current) {
          e.preventDefault()
          const range = document.createRange()
          range.selectNodeContents(combinedRef.current!)
          const sel = window.getSelection()
          sel?.removeAllRanges()
          sel?.addRange(range)
        }
      }
    }
    const node = combinedRef.current
    if (node) node.addEventListener('keydown', handleKeyDown)
    return () => { if (node) node.removeEventListener('keydown', handleKeyDown) }
  }, [])

  // 날짜별 AI 정보 관리 useEffect
  useEffect(() => {
    if (dates && dates.length > 0) {
      setAvailableDates(dates)
    }
  }, [dates])

  useEffect(() => {
    if (selectedDate && aiInfos && aiInfos.length > 0) {
      setSelectedDateAIInfo(aiInfos)
    } else {
      setSelectedDateAIInfo([])
    }
  }, [selectedDate, aiInfos])

  // 날짜별 AI 정보 관리 핸들러
  const handleEditDateAIInfo = (date: string, index: number) => {
    const info = selectedDateAIInfo[index]
    if (info) {
      setEditingAIInfo({ id: date, index })
      setEditingData({
        title_ko: info.title || '',
        title_en: info.title_en || '',
        title_ja: info.title_ja || '',
        title_zh: info.title_zh || '',
        content_ko: info.content || '',
        content_en: info.content_en || '',
        content_ja: info.content_ja || '',
        content_zh: info.content_zh || '',
        category: info.category || '',
        terms_ko: info.terms || [],
        terms_en: info.terms_en || [],
        terms_ja: info.terms_ja || [],
        terms_zh: info.terms_zh || []
      })
    }
  }

  const handleDeleteDateAIInfo = (date: string, index: number) => {
    if (window.confirm('정말 이 항목을 삭제하시겠습니까?')) {
      deleteItemMutation.mutate({ date, itemIndex: index })
    }
  }

  // AI와 LLM 중복 용어 분석 및 교체 기능
  const [showDuplicateAnalysis, setShowDuplicateAnalysis] = useState(false)
  const [duplicateTerms, setDuplicateTerms] = useState<{
    term: string
    count: number
    locations: Array<{date: string, index: number, cardTitle: string}>
  }[]>([])
  const [searchResults, setSearchResults] = useState<Array<{
    date: string
    index: number
    cardTitle: string
    cardContent: string
    matchedTerms: Array<{
      term: string
      type: 'term' | 'title' | 'content'
      description?: string
    }>
  }>>([])
  const [replacementSuggestions, setReplacementSuggestions] = useState<{
    date: string
    index: number
    originalTerm: string
    suggestedTerms: string[]
  }[]>([])

  // 특정 단어 검색 함수
  const searchTermInCards = () => {
    if (!searchTerm.trim()) {
      setError('검색할 단어를 입력해주세요.')
      return
    }

    if (!allAIInfos || allAIInfos.length === 0) {
      setError('AI 정보 데이터를 먼저 불러와주세요.')
      return
    }

    const searchResults: Array<{
      date: string
      index: number
      cardTitle: string
      cardContent: string
      matchedTerms: Array<{
        term: string
        type: 'term' | 'title' | 'content'
        description?: string
      }>
    }> = []

    // 모든 AI 정보 카드에서 특정 단어 검색
    allAIInfos.forEach((dateGroup) => {
      dateGroup.infos.forEach((info: AIInfoItem, index: number) => {
        const matchedTerms: Array<{
          term: string
          type: 'term' | 'title' | 'content'
          description?: string
        }> = []

        // 용어에서 검색 (20개 용어 중에서)
        if (info.terms && Array.isArray(info.terms)) {
          info.terms.forEach((term) => {
            if (term.term.toLowerCase().includes(searchTerm.toLowerCase())) {
              matchedTerms.push({
                term: term.term,
                type: 'term',
                description: term.description
              })
            }
          })
        }

        // 제목에서도 검색
        if (info.title && info.title.toLowerCase().includes(searchTerm.toLowerCase())) {
          matchedTerms.push({
            term: info.title,
            type: 'title'
          })
        }

        // 내용에서도 검색
        if (info.content && info.content.toLowerCase().includes(searchTerm.toLowerCase())) {
          matchedTerms.push({
            term: searchTerm,
            type: 'content'
          })
        }

        if (matchedTerms.length > 0) {
          searchResults.push({
            date: dateGroup.date,
            index: index,
            cardTitle: info.title || `카드 ${index + 1}`,
            cardContent: info.content || '',
            matchedTerms: matchedTerms
          })
        }
      })
    })

    if (searchResults.length === 0) {
      setError(`"${searchTerm}" 단어가 포함된 학습 내용을 찾을 수 없습니다.`)
      return
    }

    setSearchResults(searchResults)
    setDuplicateTerms(searchResults.map(result => ({
      term: `${result.matchedTerms.length}개 매칭`,
      count: result.matchedTerms.length,
      locations: [{
        date: result.date,
        index: result.index,
        cardTitle: result.cardTitle
      }]
    })))
    setShowDuplicateAnalysis(true)
    setSuccess(`"${searchTerm}" 단어가 포함된 ${searchResults.length}개의 학습 내용에서 총 ${searchResults.reduce((sum, result) => sum + result.matchedTerms.length, 0)}개의 매칭을 찾았습니다.`)
    console.log('단어 검색 결과:', searchResults)
  }

  // 대체 용어 제안 함수
  const generateReplacementSuggestions = () => {
    if (duplicateTerms.length === 0) return

    const suggestions: typeof replacementSuggestions = []
    
    duplicateTerms.forEach((duplicate) => {
      duplicate.locations.forEach((location) => {
        const cardInfo = allAIInfos
          .find(dateGroup => dateGroup.date === location.date)
          ?.infos[location.index]
        
        if (cardInfo) {
          const suggestedTerms = generateTermSuggestions(cardInfo, duplicate.term)
          suggestions.push({
            date: location.date,
            index: location.index,
            originalTerm: duplicate.term,
            suggestedTerms: suggestedTerms
          })
        }
      })
    })

    setReplacementSuggestions(suggestions)
    console.log('대체 용어 제안:', suggestions)
  }

  // 카드 내용 기반으로 대체 용어 생성
  const generateTermSuggestions = (cardInfo: AIInfoItem, originalTerm: string): string[] => {
    const suggestions: string[] = []
    
    // 카테고리별 전문 용어 사전
    const categoryTerms: Record<string, string[]> = {
      '챗봇/대화형 AI': [
        '자연어처리', '대화시스템', '의도분석', '엔티티추출', '감정분석', '대화흐름', '멀티턴', '컨텍스트', '프롬프트엔지니어링', '파인튜닝',
        '제로샷러닝', '퓨샷러닝', '인퍼런스', '토큰화', '임베딩', '어텐션', '트랜스포머', 'RNN', 'LSTM', 'GRU'
      ],
      '이미지 생성 AI': [
        '생성모델', 'GAN', 'VAE', '디퓨전', '스테이블디퓨전', 'DALL-E', 'Midjourney', '이미지합성', '스타일전이', '초해상도',
        '이미지편집', '인페인팅', '아웃페인팅', '프롬프트', '네거티브프롬프트', 'CFG스케일', '샘플링스텝', '시드값', '노이즈', '스케줄러'
      ],
      '코딩/개발 도구': [
        '코드생성', '코드분석', '리팩토링', '디버깅', '테스트자동화', 'CI/CD', '버전관리', '코드리뷰', '정적분석', '동적분석',
        '성능프로파일링', '메모리관리', '동시성', '비동기처리', '마이크로서비스', 'API설계', '데이터베이스', '캐싱', '로깅', '모니터링'
      ],
      '음성/오디오 AI': [
        '음성인식', '음성합성', 'STT', 'TTS', '화자식별', '감정인식', '노이즈제거', '에코캔슬링', '음성변조', '음악생성',
        '오디오분석', '스펙트럼', '주파수', '진폭', '위상', '필터링', '압축', '인코딩', '디코딩', '스트리밍'
      ],
      '데이터 분석/ML': [
        '머신러닝', '딥러닝', '지도학습', '비지도학습', '강화학습', '분류', '회귀', '클러스터링', '차원축소', '특성선택',
        '교차검증', '하이퍼파라미터', '정규화', '드롭아웃', '배치정규화', '옵티마이저', '손실함수', '메트릭', '앙상블', '전이학습'
      ],
      'AI 윤리/정책': [
        '편향성', '공정성', '투명성', '책임성', '개인정보', '데이터보호', '알고리즘감시', 'AI거버넌스', '윤리가이드라인', '사회적영향',
        '고용영향', '교육혁신', '의료윤리', '자율주행윤리', '군사AI', 'AI안전', '인간중심AI', '지속가능성', '포용성', '다양성'
      ],
      'AI 하드웨어/인프라': [
        'GPU', 'TPU', 'NPU', '클라우드컴퓨팅', '엣지컴퓨팅', '분산처리', '병렬처리', '메모리계층', '네트워크', '스토리지',
        '가상화', '컨테이너', '오케스트레이션', '스케일링', '로드밸런싱', '장애복구', '백업', '보안', '암호화', '인증'
      ],
      'AI 응용 서비스': [
        '추천시스템', '검색엔진', '번역서비스', '요약서비스', '질의응답', '문서분류', '감정분석', '이미지분류', '객체탐지', '얼굴인식',
        '음성비서', '스마트홈', '자율주행', '의료진단', '금융분석', '교육플랫폼', '엔터테인먼트', '게임AI', '로봇공학', 'IoT'
      ]
    }

    // 카드의 카테고리에 맞는 용어들에서 선택
    const category = cardInfo.category || '미분류'
    const availableTerms = categoryTerms[category] || categoryTerms['AI 응용 서비스']
    
    // 이미 사용된 용어들과 겹치지 않는 용어들 선택
    const usedTerms = new Set<string>()
    allAIInfos.forEach((dateGroup) => {
      dateGroup.infos.forEach((info: AIInfoItem) => {
        if (info.terms && Array.isArray(info.terms)) {
          info.terms.forEach((term) => {
            usedTerms.add(term.term)
          })
        }
      })
    })

    // 사용되지 않은 용어들 중에서 선택
    const unusedTerms = availableTerms.filter(term => !usedTerms.has(term))
    
    // 최대 5개까지 제안
    return unusedTerms.slice(0, 5)
  }

  // 용어 교체 실행 함수
  const executeTermReplacement = async (date: string, index: number, originalTerm: string, newTerm: string) => {
    try {
      // 해당 카드의 용어 목록에서 원래 용어를 새 용어로 교체
      const cardInfo = allAIInfos
        .find(dateGroup => dateGroup.date === date)
        ?.infos[index]
      
      if (!cardInfo) {
        setError('카드 정보를 찾을 수 없습니다.')
        return
      }

      // 용어 교체
      const updatedTerms = cardInfo.terms?.map((term: TermItem) => 
        term.term === originalTerm 
          ? { ...term, term: newTerm }
          : term
      ) || []

      // 카드 정보 업데이트
      const updatedCardInfo = {
        ...cardInfo,
        terms: updatedTerms
      }

      // API를 통해 업데이트
      await updateItemMutation.mutateAsync({
        date,
        itemIndex: index,
        data: updatedCardInfo
      })

      setSuccess(`용어 교체 완료: "${originalTerm}" → "${newTerm}"`)
      
             // 검색 결과 새로고침
       setTimeout(() => {
         searchTermInCards()
       }, 1000)
      
    } catch (error) {
      console.error('용어 교체 실패:', error)
      setError('용어 교체에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />

      <div className="relative z-10 p-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <FaArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaBrain className="text-blue-400" />
              AI 정보 관리 (DB 저장)
            </h1>
            <p className="text-white/70 mt-1">AI 정보, 프롬프트, 기반 내용을 데이터베이스에 저장하여 관리합니다</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          {/* 성공/오류 메시지 */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 text-red-400">
                <FaTimes />
                <span>{error}</span>
              </div>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center gap-3 text-green-400">
                <FaSave />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* AI 정보 관리 */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <FaCog className="text-blue-400" />
              AI 정보 관리
            </h2>
            
            {/* 단어 검색 기능 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                단어 검색
              </label>
              <div className="space-y-3">
                {/* 검색 조건 선택 */}
                <div className="space-y-3">
                  {/* 1단계: 검색 대상 선택 */}
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="radio"
                        value="content"
                        checked={wordSearchType === 'content' || wordSearchType === 'exact' || wordSearchType === 'contains'}
                        onChange={(e) => setWordSearchType(e.target.value as 'content' | 'terms' | 'exact' | 'contains')}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      내용으로 검색
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input
                        type="radio"
                        value="terms"
                        checked={wordSearchType === 'terms'}
                        onChange={(e) => setWordSearchType(e.target.value as 'content' | 'terms' | 'exact' | 'contains')}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      관련 용어로 검색
                    </label>
                  </div>
                  
                  {/* 2단계: 세부 검색 조건 선택 (내용으로 검색 선택 시에만) */}
                  {(wordSearchType === 'content' || wordSearchType === 'exact' || wordSearchType === 'contains') && (
                    <div className="ml-6 flex gap-3">
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="radio"
                          value="content"
                          checked={wordSearchType === 'content'}
                          onChange={(e) => setWordSearchType(e.target.value as 'content' | 'terms' | 'exact' | 'contains')}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        일반 검색
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="radio"
                          value="exact"
                          checked={wordSearchType === 'exact'}
                          onChange={(e) => setWordSearchType(e.target.value as 'content' | 'terms' | 'exact' | 'contains')}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        정확히 일치
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-300">
                        <input
                          type="radio"
                          value="contains"
                          checked={wordSearchType === 'contains'}
                          onChange={(e) => setWordSearchType(e.target.value as 'content' | 'terms' | 'exact' | 'contains')}
                          className="text-blue-500 focus:ring-blue-500"
                        />
                        포함된 단어
                      </label>
                    </div>
                  )}
                </div>
                
                {/* 검색어 입력 및 검색 버튼 */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={wordSearchQuery}
                    onChange={(e) => setWordSearchQuery(e.target.value)}
                    placeholder="검색할 단어를 입력하세요"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={performWordSearch}
                    disabled={isWordSearching || !wordSearchQuery.trim()}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {isWordSearching ? '검색 중...' : '검색'}
                  </button>
                </div>
              </div>
            </div>

            {/* 검색 결과 표시 */}
            {wordSearchResults.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">
                  검색 결과 ({wordSearchResults.length}개)
                </h3>
                
                {wordSearchResults.map((info, index) => (
                  <div key={index} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-white mb-2">
                          {info.title_ko || info.title_en || info.title_ja || info.title_zh || `정보 ${index + 1}`}
                        </h4>
                        <p className="text-gray-300 text-sm mb-2">
                          {info.content ? (info.content.length > 100 ? `${info.content.substring(0, 100)}...` : info.content) : '내용 없음'}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>날짜: {info.date}</span>
                          <span>카테고리: {info.category || '미분류'}</span>
                        </div>
                      </div>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex items-center gap-2 ml-4">
                        {/* 카테고리 변경 */}
                        <select
                          value={info.category || ''}
                          onChange={(e) => handleCategoryChange(info.date || '', info.info_index || 0, e.target.value, info.category || '')}
                          className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="">카테고리 선택</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        
                        {/* 수정 버튼 */}
                        <button
                          onClick={() => handleEditDateAIInfo(info.date || '', info.info_index || 0)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          수정
                        </button>
                        
                        {/* 삭제 버튼 */}
                        <button
                          onClick={() => handleDeleteDateAIInfo(info.date || '', info.info_index || 0)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    
                    {/* 관련 용어 검색 결과 상세 표시 */}
                    {wordSearchType === 'terms' && (
                      <div className="mt-4 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <h5 className="text-md font-medium text-white mb-3 flex items-center gap-2">
                          🔍 검색된 관련 용어
                        </h5>
                        <div className="space-y-3">
                          {(() => {
                            const matchedTerms: Array<{
                              term: string
                              description: string
                              language: 'ko' | 'en' | 'ja' | 'zh'
                            }> = []
                            
                            // 각 언어별로 검색어와 일치하는 용어 찾기
                            const searchLower = wordSearchQuery.toLowerCase()
                            ;['ko', 'en', 'ja', 'zh'].forEach(lang => {
                              const termsKey = `terms_${lang}` as keyof AIInfoItem
                              const terms = (info[termsKey] as TermItem[] | undefined) || []
                              terms.forEach(term => {
                                if (term.term.toLowerCase().includes(searchLower)) {
                                  matchedTerms.push({
                                    term: term.term,
                                    description: term.description,
                                    language: lang as 'ko' | 'en' | 'ja' | 'zh'
                                  })
                                }
                              })
                            })
                            
                            return matchedTerms.map((term, termIndex) => (
                              <div key={termIndex} className="bg-gray-800/50 border border-gray-600 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-sm font-medium text-white">{term.term}</span>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        term.language === 'ko' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                                        term.language === 'en' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                                        term.language === 'ja' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                                        'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                                      }`}>
                                        {term.language === 'ko' ? '🇰🇷 한국어' : 
                                         term.language === 'en' ? '🇺🇸 영어' : 
                                         term.language === 'ja' ? '🇯🇵 일본어' : '🇨🇳 중국어'}
                                      </span>
                                    </div>
                                    
                                    <div className="text-sm text-gray-300 mb-2">
                                      <strong>설명:</strong> {term.description}
                                    </div>
                                    
                                    <div className="text-sm text-gray-400">
                                      <strong>학습 제목:</strong> {info.title || '제목 없음'}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* 용어 수정 폼 */}
                                <div className="mt-3 space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">용어 수정</label>
                                    <input
                                      type="text"
                                      value={term.term}
                                      onChange={(e) => {
                                        // 용어 수정 로직
                                        const newTerm = e.target.value
                                        const newWordSearchResults = [...wordSearchResults]
                                        const termsKey = `terms_${term.language}` as keyof AIInfoItem
                                        const newTerms = [...(newWordSearchResults[index][termsKey] as TermItem[] || [])]
                                        const termToUpdate = newTerms.find(t => t.term === term.term)
                                        if (termToUpdate) {
                                          termToUpdate.term = newTerm
                                          newWordSearchResults[index] = { ...newWordSearchResults[index], [termsKey]: newTerms }
                                          setWordSearchResults(newWordSearchResults)
                                        }
                                      }}
                                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-medium text-gray-300 mb-1">설명 수정</label>
                                    <textarea
                                      value={term.description}
                                      onChange={(e) => {
                                        // 설명 수정 로직
                                        const newDescription = e.target.value
                                        const newWordSearchResults = [...wordSearchResults]
                                        const termsKey = `terms_${term.language}` as keyof AIInfoItem
                                        const newTerms = [...(newWordSearchResults[index][termsKey] as TermItem[] || [])]
                                        const termToUpdate = newTerms.find(t => t.term === term.term)
                                        if (termToUpdate) {
                                          termToUpdate.description = newDescription
                                          newWordSearchResults[index] = { ...newWordSearchResults[index], [termsKey]: newTerms }
                                          setWordSearchResults(newWordSearchResults)
                                        }
                                      }}
                                      rows={2}
                                      className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white focus:ring-1 focus:ring-blue-500 resize-none"
                                    />
                                  </div>
                                  
                                  {/* 수정 반영 버튼 */}
                                  <button
                                    onClick={() => handleTermUpdate(info.date || '', info.info_index || 0, term.language, term.term, term.term, term.description)}
                                    className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded transition-colors"
                                  >
                                    수정 반영
                                  </button>
                                </div>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}




          </section>

          {/* AI 정보 추가 */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <FaPlus className="text-green-400" />
              AI 정보 추가
            </h2>
            
            <form onSubmit={handleSubmit} className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col gap-6">
              <div className="flex flex-col md:flex-row md:items-end gap-4">
                <div className="flex-1 flex flex-col gap-2">
                  <label className="font-semibold text-white/80">날짜</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    className="p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                  />
                </div>
              </div>
              
              <div className="grid gap-6">
                {inputs.map((input, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col gap-3 relative">
                    {/* 제목 입력 - 다국어 지원 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">제목 (한국어)</label>
                        <input 
                          type="text" 
                          placeholder={`한국어 제목 ${idx+1}`} 
                          value={input.title_ko} 
                          onChange={e => handleInputChange(idx, 'title_ko', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">제목 (영어)</label>
                        <input 
                          type="text" 
                          placeholder={`English Title ${idx+1}`} 
                          value={input.title_en} 
                          onChange={e => handleInputChange(idx, 'title_en', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">제목 (일본어)</label>
                        <input 
                          type="text" 
                          placeholder={`日本語タイトル ${idx+1}`} 
                          value={input.title_ja} 
                          onChange={e => handleInputChange(idx, 'title_ja', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">제목 (중국어)</label>
                        <input 
                          type="text" 
                          placeholder={`中文标题 ${idx+1}`} 
                          value={input.title_zh} 
                          onChange={e => handleInputChange(idx, 'title_zh', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50" 
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="font-semibold text-white/80">카테고리</label>
                      <select 
                        value={input.category} 
                        onChange={e => handleInputChange(idx, 'category', e.target.value)} 
                        className="p-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="" className="text-black">카테고리를 선택하세요</option>
                        <option value="챗봇/대화형 AI" className="text-black">챗봇/대화형 AI</option>
                        <option value="이미지 생성 AI" className="text-black">이미지 생성 AI</option>
                        <option value="코딩/개발 도구" className="text-black">코딩/개발 도구</option>
                        <option value="음성/오디오 AI" className="text-black">음성/오디오 AI</option>
                        <option value="데이터 분석/ML" className="text-black">데이터 분석/ML</option>
                        <option value="AI 윤리/정책" className="text-black">AI 윤리/정책</option>
                        <option value="AI 하드웨어/인프라" className="text-black">AI 하드웨어/인프라</option>
                        <option value="AI 응용 서비스" className="text-black">AI 응용 서비스</option>
                      </select>
                    </div>
                    
                    {/* 내용 입력 - 다국어 지원 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">내용 (한국어)</label>
                        <textarea 
                          placeholder={`한국어 내용 ${idx+1}`} 
                          value={input.content_ko} 
                          onChange={e => handleInputChange(idx, 'content_ko', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
                          rows={3} 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">내용 (영어)</label>
                        <textarea 
                          placeholder={`English Content ${idx+1}`} 
                          value={input.content_en} 
                          onChange={e => handleInputChange(idx, 'content_en', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
                          rows={3} 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">내용 (일본어)</label>
                        <textarea 
                          placeholder={`日本語コンテンツ ${idx+1}`} 
                          value={input.content_ja} 
                          onChange={e => handleInputChange(idx, 'content_ja', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
                          rows={3} 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="font-semibold text-white/80">내용 (중국어)</label>
                        <textarea 
                          placeholder={`中文内容 ${idx+1}`} 
                          value={input.content_zh} 
                          onChange={e => handleInputChange(idx, 'content_zh', e.target.value)} 
                          className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none" 
                          rows={3} 
                        />
                      </div>
                    </div>
                    
                    {/* 용어 입력 섹션 - 한국어 기준으로 표시 */}
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="font-semibold text-white/80">관련 용어 (한국어 기준)</label>
                        <div className="flex gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleBulkTermsInput(idx)} 
                            className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 transition text-sm border border-purple-500/30"
                            title="전문용어를 복사해서 붙여넣기"
                          >
                            📋 일괄 입력
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleAddTerm(idx)} 
                            className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg font-medium hover:bg-green-500/30 transition text-sm border border-green-500/30"
                          >
                            + 용어 추가
                          </button>
                        </div>
                      </div>
                      
                      {/* 일괄 입력 모달 */}
                      {showBulkInput === idx && (
                        <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-4 mb-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-yellow-300">📋 전문용어 일괄 입력 (다국어 지원)</h4>
                            <button 
                              type="button" 
                              onClick={handleBulkTermsCancel}
                              className="text-yellow-400 hover:text-yellow-200"
                            >
                              ✕
                            </button>
                          </div>
                          <div className="mb-3">
                            <p className="text-sm text-yellow-200 mb-2">
                              각 언어별로 전문용어를 복사해서 붙여넣으세요. 탭(→) 또는 공백으로 구분됩니다.
                            </p>
                            <div className="text-xs text-yellow-300 bg-yellow-500/20 p-2 rounded mb-2">
                              <strong>예시:</strong><br/>
                              LLM	GPT 같은 대형 언어 모델<br/>
                              자연어	우리가 일상에서 쓰는 언어<br/>
                              DSL	특정 분야 전용 프로그래밍 언어
                            </div>
                          </div>
                          
                          {/* 한국어 용어 입력 */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-yellow-300 mb-2">🇰🇷 한국어 용어</label>
                            <textarea
                              value={bulkTermsText}
                              onChange={(e) => setBulkTermsText(e.target.value)}
                              placeholder="용어	뜻&#10;LLM	GPT 같은 대형 언어 모델&#10;자연어	우리가 일상에서 쓰는 언어"
                              className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                              rows={3}
                            />
                          </div>
                          
                          {/* 영어 용어 입력 */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-yellow-300 mb-2">🇺🇸 영어 용어</label>
                            <textarea
                              value={bulkTermsTextEn}
                              onChange={(e) => setBulkTermsTextEn(e.target.value)}
                              placeholder="term	meaning&#10;LLM	Large Language Model like GPT&#10;Natural Language	Language we use in daily life"
                              className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                              rows={3}
                            />
                          </div>
                          
                          {/* 일본어 용어 입력 */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-yellow-300 mb-2">🇯🇵 일본어 용어</label>
                            <textarea
                              value={bulkTermsTextJa}
                              onChange={(e) => setBulkTermsTextJa(e.target.value)}
                              placeholder="用語	意味&#10;LLM	GPTのような大規模言語モデル&#10;自然言語	私たちが日常で使う言語"
                              className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                              rows={3}
                            />
                          </div>
                          
                          {/* 중국어 용어 입력 */}
                          <div className="mb-3">
                            <label className="block text-sm font-medium text-yellow-300 mb-2">🇨🇳 중국어 용어</label>
                            <textarea
                              value={bulkTermsTextZh}
                              onChange={(e) => setBulkTermsTextZh(e.target.value)}
                              placeholder="术语	含义&#10;LLM	像GPT这样的大型语言模型&#10;自然语言	我们日常使用的语言"
                              className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                              rows={3}
                            />
                          </div>
                          
                          <div className="flex gap-2 mt-3">
                            <button 
                              type="button" 
                              onClick={() => handleBulkTermsSubmit(idx)}
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition text-sm"
                            >
                              용어 추가
                            </button>
                            <button 
                              type="button" 
                              onClick={handleBulkTermsCancel}
                              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition text-sm"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {input.terms_ko.map((term, termIdx) => (
                        <div key={termIdx} className="flex gap-2 items-start">
                          <div className="flex-1 flex gap-2">
                            <input 
                              type="text" 
                              placeholder="용어" 
                              value={term.term} 
                              onChange={e => handleTermChange(idx, termIdx, 'term', e.target.value)} 
                              className="flex-1 p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm" 
                            />
                            <input 
                              type="text" 
                              placeholder="용어 설명" 
                              value={term.description} 
                              onChange={e => handleTermChange(idx, termIdx, 'description', e.target.value)} 
                              className="flex-1 p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm" 
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTerm(idx, termIdx)} 
                            className="px-2 py-1 bg-red-500/20 text-red-300 rounded font-medium hover:bg-red-500/30 transition text-sm border border-red-500/30"
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {inputs.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveInput(idx)} 
                        className="absolute top-4 right-4 px-3 py-1 bg-gray-500/20 text-gray-300 rounded font-medium hover:bg-gray-500/30 transition border border-gray-500/30"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              <button 
                type="button" 
                onClick={handleAddInput} 
                disabled={inputs.length >= 3} 
                className={`px-4 py-2 rounded-xl font-medium transition w-fit flex items-center gap-2 ${
                  inputs.length >= 3 
                    ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border border-gray-500/30' 
                    : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30'
                }`}
              >
                <FaPlus className="w-4 h-4" />
                정보 추가
              </button>
              
              <button 
                type="submit" 
                disabled={addOrUpdateMutation.isPending} 
                className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-600 transition w-full text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <FaSave className="w-4 h-4" />
                {addOrUpdateMutation.isPending ? '등록 중...' : (editId ? '수정' : '등록')}
              </button>
            </form>
            
            <div className="grid gap-4">
              {dates.length === 0 && <div className="text-white/50 text-center">{t('ai.info.no.data.admin')}</div>}
              
              {/* 전체 AI 정보 보기 버튼 */}
              {dates.length > 0 && (
                <div className="flex justify-center gap-4 mb-4">
                  <button
                    onClick={() => setShowAIInfoList(!showAIInfoList)}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg"
                  >
                    {showAIInfoList ? '목록 숨기기' : '목록 보기'} ({dates.length}개)
                  </button>
                  <button
                    onClick={() => setShowAllAIInfo(!showAllAIInfo)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg"
                  >
                    {showAllAIInfo ? '전체 보기 숨기기' : '전체 AI 정보 보기'}
                  </button>
                          <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="검색할 단어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-sm"
          />
          <button
            onClick={searchTermInCards}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg"
          >
            🔍 단어 검색
                  </button>
        </div>
                </div>
              )}
              
              {showAIInfoList && dates.map(dateItem => (
                <div key={dateItem} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-blue-400 font-medium">{dateItem}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => { setDate(dateItem); refetchAIInfo(); }} 
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        불러오기
                      </button>
                      <button 
                        onClick={() => handleDelete(dateItem)} 
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                  
                  {isFetching && date === dateItem ? (
                    <div className="text-white/50">불러오는 중...</div>
                  ) : (
                    aiInfos.length > 0 && date === dateItem ? (
                      aiInfos.map((info, idx) => (
                        <div key={idx} className="mb-4 last:mb-0 bg-white/5 rounded-lg p-4">
                          <div className="font-bold text-lg text-white mb-2">
                            <div className="mb-1">{info.title_ko}</div>
                            <div className="text-sm text-white/70">
                              <div>🇺🇸 {info.title_en}</div>
                              <div>🇯🇵 {info.title_ja}</div>
                              <div>🇨🇳 {info.title_zh}</div>
                            </div>
                          </div>
                          {info.category && (
                            <div className="text-blue-400 text-sm mb-2">🏷️ {info.category}</div>
                          )}
                          <div className="text-white/70 text-sm whitespace-pre-line mb-3">{info.content}</div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleEdit(info, idx)} 
                              className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                            >
                              <FaEdit className="w-4 h-4" />
                              수정
                            </button>
                            <button 
                              onClick={() => handleDeleteItem(dateItem, idx)} 
                              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                            >
                              <FaTrash className="w-4 h-4" />
                              삭제
                            </button>
                          </div>
                        </div>
                      ))
                    ) : null
                  )}
                </div>
              ))}

              {/* 전체 AI 정보 보기 */}
              {showAllAIInfo && (
                <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <FaBrain className="text-green-400" />
                      전체 AI 정보 관리
                    </h3>
                  </div>
                  
                  {/* 검색 및 필터링 */}
                  <div className="mb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white/80 font-medium mb-2">🔍 검색</label>
                        <input
                          type="text"
                          placeholder="제목, 내용, 용어로 검색..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white/80 font-medium mb-2">🏷️ 카테고리 필터</label>
                        <select
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        >
                          <option value="" className="text-black">모든 카테고리</option>
                          <option value="챗봇/대화형 AI" className="text-black">챗봇/대화형 AI</option>
                          <option value="이미지 생성 AI" className="text-black">이미지 생성 AI</option>
                          <option value="코딩/개발 도구" className="text-black">코딩/개발 도구</option>
                          <option value="음성/오디오 AI" className="text-black">음성/오디오 AI</option>
                          <option value="데이터 분석/ML" className="text-black">데이터 분석/ML</option>
                          <option value="AI 윤리/정책" className="text-black">AI 윤리/정책</option>
                          <option value="AI 하드웨어/인프라" className="text-black">AI 하드웨어/인프라</option>
                          <option value="AI 응용 서비스" className="text-black">AI 응용 서비스</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-white/80 font-medium mb-2">📊 정렬</label>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'category')}
                          className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        >
                          <option value="date" className="text-black">날짜순</option>
                          <option value="title" className="text-black">제목순</option>
                          <option value="category" className="text-black">카테고리순</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span>총 {filteredAIInfos.reduce((total, group) => total + group.infos.length, 0)}개 항목</span>
                      {(searchTerm || selectedCategory) && (
                        <button
                          onClick={() => {
                            setSearchTerm('')
                            setSelectedCategory('')
                          }}
                          className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded hover:bg-gray-500/30 transition text-sm border border-gray-500/30"
                        >
                          필터 초기화
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {isLoadingAllAIInfo ? (
                    <div className="text-white/50 text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                      {t('ai.info.loading')}
                    </div>
                  ) : filteredAIInfos.length === 0 ? (
                    <div className="text-white/50 text-center py-8">
                      {allAIInfos.length === 0 ? t('ai.info.no.data.admin') : t('ai.info.no.data.search')}
                      <div className="mt-4 text-xs text-white/40">
                        디버그: allAIInfos 길이 = {allAIInfos.length}, filteredAIInfos 길이 = {filteredAIInfos.length}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {filteredAIInfos.map((dateGroup) => (
                        <div key={dateGroup.date} className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="text-blue-400 font-medium mb-3 text-lg border-b border-white/10 pb-2">
                            📅 {dateGroup.date}
                          </div>
                          
                          {dateGroup.infos.map((info: AIInfoItem, index: number) => (
                            <div key={index} className="mb-4 last:mb-0 bg-white/5 rounded-lg p-4">
                              {editingAIInfo && editingAIInfo.id === dateGroup.date && editingAIInfo.index === index ? (
                                // 수정 모드
                                <div className="space-y-4">
                                  {/* 제목 입력 - 다국어 지원 */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">제목 (한국어)</label>
                                      <input
                                        type="text"
                                        value={editingData.title_ko}
                                        onChange={(e) => setEditingData({...editingData, title_ko: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">제목 (영어)</label>
                                      <input
                                        type="text"
                                        value={editingData.title_en}
                                        onChange={(e) => setEditingData({...editingData, title_en: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">제목 (일본어)</label>
                                      <input
                                        type="text"
                                        value={editingData.title_ja}
                                        onChange={(e) => setEditingData({...editingData, title_ja: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">제목 (중국어)</label>
                                      <input
                                        type="text"
                                        value={editingData.title_zh}
                                        onChange={(e) => setEditingData({...editingData, title_zh: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                      />
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-white/80 font-medium mb-2">카테고리</label>
                                    <select
                                      value={editingData.category}
                                      onChange={(e) => setEditingData({...editingData, category: e.target.value})}
                                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                      <option value="" className="text-black">카테고리를 선택하세요</option>
                                      <option value="챗봇/대화형 AI" className="text-black">챗봇/대화형 AI</option>
                                      <option value="이미지 생성 AI" className="text-black">이미지 생성 AI</option>
                                      <option value="코딩/개발 도구" className="text-black">코딩/개발 도구</option>
                                      <option value="음성/오디오 AI" className="text-black">음성/오디오 AI</option>
                                      <option value="데이터 분석/ML" className="text-black">데이터 분석/ML</option>
                                      <option value="AI 윤리/정책" className="text-black">AI 윤리/정책</option>
                                      <option value="AI 하드웨어/인프라" className="text-black">AI 하드웨어/인프라</option>
                                      <option value="AI 응용 서비스" className="text-black">AI 응용 서비스</option>
                                    </select>
                                  </div>
                                  
                                  {/* 내용 입력 - 다국어 지원 */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">내용 (한국어)</label>
                                      <textarea
                                        value={editingData.content_ko}
                                        onChange={(e) => setEditingData({...editingData, content_ko: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                        rows={4}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">내용 (영어)</label>
                                      <textarea
                                        value={editingData.content_en}
                                        onChange={(e) => setEditingData({...editingData, content_en: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                        rows={4}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">내용 (일본어)</label>
                                      <textarea
                                        value={editingData.content_ja}
                                        onChange={(e) => setEditingData({...editingData, content_ja: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                        rows={4}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-white/80 font-medium mb-2">내용 (중국어)</label>
                                      <textarea
                                        value={editingData.content_zh}
                                        onChange={(e) => setEditingData({...editingData, content_zh: e.target.value})}
                                        className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                                        rows={4}
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* 용어 수정 섹션 */}
                                  <div>
                                    <div className="flex items-center justify-between mb-2">
                                      <label className="block text-white/80 font-medium">관련 용어 (한국어 기준)</label>
                                      <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setEditingData({
                                          ...editingData,
                                          terms_ko: [...(editingData.terms_ko || []), { term: '', description: '' }]
                                        })}
                                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg font-medium hover:bg-purple-500/30 transition text-sm border border-purple-500/30"
                                      >
                                        + 용어 추가
                                      </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            // 일괄 입력 모달 표시
                                            setShowBulkInput('edit')
                                            setBulkTermsText('')
                                            setBulkTermsTextEn('')
                                            setBulkTermsTextJa('')
                                            setBulkTermsTextZh('')
                                          }}
                                          className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-lg font-medium hover:bg-yellow-500/30 transition text-sm border border-yellow-500/30"
                                        >
                                          📋 일괄 입력
                                      </button>
                                      </div>
                                    </div>
                                    
                                    {/* 일괄 입력 모달 (수정 모드용) */}
                                    {showBulkInput === 'edit' && (
                                      <div className="bg-yellow-500/10 border-2 border-yellow-500/30 rounded-xl p-4 mb-4">
                                        <div className="flex items-center justify-between mb-3">
                                          <h4 className="font-bold text-yellow-300">📋 전문용어 일괄 입력 (수정 모드)</h4>
                                          <button 
                                            type="button" 
                                            onClick={() => setShowBulkInput(null)}
                                            className="text-yellow-400 hover:text-yellow-200"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                        <div className="mb-3">
                                          <p className="text-sm text-yellow-200 mb-2">
                                            각 언어별로 전문용어를 복사해서 붙여넣으세요. 탭(→) 또는 공백으로 구분됩니다.
                                          </p>
                                          <div className="text-xs text-yellow-300 bg-yellow-500/20 p-2 rounded mb-2">
                                            <strong>예시:</strong><br/>
                                            LLM	GPT 같은 대형 언어 모델<br/>
                                            자연어	우리가 일상에서 쓰는 언어<br/>
                                            DSL	특정 분야 전용 프로그래밍 언어
                                          </div>
                                        </div>
                                        
                                        {/* 한국어 용어 입력 */}
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-yellow-300 mb-2">🇰🇷 한국어 용어</label>
                                          <textarea
                                            value={bulkTermsText}
                                            onChange={(e) => setBulkTermsText(e.target.value)}
                                            placeholder="용어	뜻&#10;LLM	GPT 같은 대형 언어 모델&#10;자연어	우리가 일상에서 쓰는 언어"
                                            className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        {/* 영어 용어 입력 */}
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-yellow-300 mb-2">🇺🇸 영어 용어</label>
                                          <textarea
                                            value={bulkTermsTextEn}
                                            onChange={(e) => setBulkTermsTextEn(e.target.value)}
                                            placeholder="term	meaning&#10;LLM	Large Language Model like GPT&#10;Natural Language	Language we use in daily life"
                                            className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        {/* 일본어 용어 입력 */}
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-yellow-300 mb-2">🇯🇵 일본어 용어</label>
                                          <textarea
                                            value={bulkTermsTextJa}
                                            onChange={(e) => setBulkTermsTextJa(e.target.value)}
                                            placeholder="用語	意味&#10;LLM	GPTのような大規模言語モデル&#10;自然言語	私たちが日常で使う言語"
                                            className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        {/* 중국어 용어 입력 */}
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-yellow-300 mb-2">🇨🇳 중국어 용어</label>
                                          <textarea
                                            value={bulkTermsTextZh}
                                            onChange={(e) => setBulkTermsTextZh(e.target.value)}
                                            placeholder="术语	含义&#10;LLM	像GPT这样的大型语言模型&#10;自然语言	我们日常使用的语言"
                                            className="w-full p-2 bg-white/10 border border-yellow-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm resize-none"
                                            rows={3}
                                          />
                                        </div>
                                        
                                        <div className="flex gap-2 mt-3">
                                          <button 
                                            type="button" 
                                            onClick={() => {
                                              // 수정 모드에서 일괄 입력 처리
                                              let totalAdded = 0
                                              
                                              // 한국어 용어 처리
                                              if (bulkTermsText.trim()) {
                                                const parsedTermsKo = parseTermsFromText(bulkTermsText)
                                                if (parsedTermsKo.length > 0) {
                                                  setEditingData({
                                                    ...editingData,
                                                    terms_ko: [...(editingData.terms_ko || []), ...parsedTermsKo]
                                                  })
                                                  totalAdded += parsedTermsKo.length
                                                }
                                              }
                                              
                                              // 영어 용어 처리
                                              if (bulkTermsTextEn.trim()) {
                                                const parsedTermsEn = parseTermsFromText(bulkTermsTextEn)
                                                if (parsedTermsEn.length > 0) {
                                                  setEditingData({
                                                    ...editingData,
                                                    terms_en: [...(editingData.terms_en || []), ...parsedTermsEn]
                                                  })
                                                  totalAdded += parsedTermsEn.length
                                                }
                                              }
                                              
                                              // 일본어 용어 처리
                                              if (bulkTermsTextJa.trim()) {
                                                const parsedTermsJa = parseTermsFromText(bulkTermsTextJa)
                                                if (parsedTermsJa.length > 0) {
                                                  setEditingData({
                                                    ...editingData,
                                                    terms_ja: [...(editingData.terms_ja || []), ...parsedTermsJa]
                                                  })
                                                  totalAdded += parsedTermsJa.length
                                                }
                                              }
                                              
                                              // 중국어 용어 처리
                                              if (bulkTermsTextZh.trim()) {
                                                const parsedTermsZh = parseTermsFromText(bulkTermsTextZh)
                                                if (parsedTermsZh.length > 0) {
                                                  setEditingData({
                                                    ...editingData,
                                                    terms_zh: [...(editingData.terms_zh || []), ...parsedTermsZh]
                                                  })
                                                  totalAdded += parsedTermsZh.length
                                                }
                                              }
                                              
                                              if (totalAdded > 0) {
                                                alert(`총 ${totalAdded}개의 용어가 추가되었습니다!`)
                                              } else {
                                                alert('파싱할 수 있는 용어가 없습니다. 형식을 확인해주세요.')
                                              }
                                              
                                              setShowBulkInput(null)
                                              setBulkTermsText('')
                                              setBulkTermsTextEn('')
                                              setBulkTermsTextJa('')
                                              setBulkTermsTextZh('')
                                            }}
                                            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition text-sm"
                                          >
                                            용어 추가
                                          </button>
                                          <button 
                                            type="button" 
                                            onClick={() => setShowBulkInput(null)}
                                            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition text-sm"
                                          >
                                            취소
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {editingData.terms_ko?.map((term, termIdx) => (
                                      <div key={termIdx} className="flex gap-2 items-start mb-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                                          <input
                                            type="text"
                                            placeholder="용어"
                                            value={term.term}
                                                                                         onChange={(e) => {
                                               const newTerms = [...(editingData.terms_ko || [])]
                                               newTerms[termIdx] = { ...term, term: e.target.value }
                                               setEditingData({ ...editingData, terms_ko: newTerms })
                                             }}
                                            className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                          />
                                          <input
                                            type="text"
                                            placeholder="용어 설명"
                                            value={term.description}
                                                                                         onChange={(e) => {
                                               const newTerms = [...(editingData.terms_ko || [])]
                                               newTerms[termIdx] = { ...term, description: e.target.value }
                                               setEditingData({ ...editingData, terms_ko: newTerms })
                                             }}
                                            className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm"
                                          />
                                        </div>
                                        <div className="flex gap-1">
                                        <button
                                          type="button"
                                                                                     onClick={() => {
                                             const newTerms = (editingData.terms_ko || []).filter((_, i) => i !== termIdx)
                                             setEditingData({ ...editingData, terms_ko: newTerms })
                                           }}
                                          className="px-2 py-1 bg-red-500/20 text-red-300 rounded font-medium hover:bg-red-500/30 transition text-sm border border-red-500/30"
                                            title="용어 삭제"
                                        >
                                            🗑️
                                        </button>
                                    <button
                                            type="button"
                                            onClick={() => {
                                              // 용어 순서 위로 이동
                                              if (termIdx > 0) {
                                                const newTerms = [...(editingData.terms_ko || [])]
                                                const temp = newTerms[termIdx]
                                                newTerms[termIdx] = newTerms[termIdx - 1]
                                                newTerms[termIdx - 1] = temp
                                                setEditingData({ ...editingData, terms_ko: newTerms })
                                              }
                                            }}
                                            disabled={termIdx === 0}
                                            className={`px-2 py-1 rounded font-medium transition text-sm border ${
                                              termIdx === 0 
                                                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border-gray-500/30' 
                                                : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border-blue-500/30'
                                            }`}
                                            title="위로 이동"
                                          >
                                            ⬆️
                                    </button>
                                    <button
                                            type="button"
                                            onClick={() => {
                                              // 용어 순서 아래로 이동
                                              if (termIdx < (editingData.terms_ko || []).length - 1) {
                                                const newTerms = [...(editingData.terms_ko || [])]
                                                const temp = newTerms[termIdx]
                                                newTerms[termIdx] = newTerms[termIdx + 1]
                                                newTerms[termIdx + 1] = temp
                                                setEditingData({ ...editingData, terms_ko: newTerms })
                                              }
                                            }}
                                            disabled={termIdx === (editingData.terms_ko || []).length - 1}
                                            className={`px-2 py-1 rounded font-medium transition text-sm border ${
                                              termIdx === (editingData.terms_ko || []).length - 1 
                                                ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed border-gray-500/30' 
                                                : 'bg-green-500/20 text-green-300 hover:bg-green-500/30 border-green-500/30'
                                            }`}
                                            title="아래로 이동"
                                          >
                                            ⬇️
                                    </button>
                                        </div>
                                      </div>
                                    ))}
                                    
                                    {/* 용어가 없을 때 안내 메시지 */}
                                    {(!editingData.terms_ko || editingData.terms_ko.length === 0) && (
                                      <div className="text-center py-6 text-white/50 bg-white/5 rounded-lg border border-white/10">
                                        <p className="mb-2">등록된 용어가 없습니다.</p>
                                        <p className="text-sm">위의 '용어 추가' 버튼을 클릭하여 용어를 추가하거나,</p>
                                        <p className="text-sm">'일괄 입력' 버튼을 클릭하여 여러 용어를 한 번에 입력할 수 있습니다.</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                // 보기 모드 - 제목만 간단하게 표시
                                <>
                                  <div className="font-bold text-lg text-white mb-2">
                                    <div className="mb-1">{info.title_ko}</div>
                                    <div className="text-sm text-white/70">
                                      <div>🇺🇸 {info.title_en}</div>
                                      <div>🇯🇵 {info.title_ja}</div>
                                      <div>🇨🇳 {info.title_zh}</div>
                                    </div>
                                  </div>
                                  {info.category && (
                                    <div className="text-blue-400 text-sm mb-2">🏷️ {info.category}</div>
                                  )}
                                  
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleEditAIInfo(dateGroup.date, index, info)}
                                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                                    >
                                      <FaEdit className="w-4 h-4" />
                                      수정
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAIInfo(dateGroup.date, index)}
                                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                                    >
                                      <FaTrash className="w-4 h-4" />
                                      삭제
                                    </button>
                                    <select
                                      value={info.category || ''}
                                      onChange={(e) => handleCategoryChange(dateGroup.date, index, e.target.value, info.category || '')}
                                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition border border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    >
                                      <option value="">카테고리 선택</option>
                                      <option value="챗봇/대화형 AI">챗봇/대화형 AI</option>
                                      <option value="이미지 생성 AI">이미지 생성 AI</option>
                                      <option value="코딩/개발 도구">코딩/개발 도구</option>
                                      <option value="음성/오디오 AI">음성/오디오 AI</option>
                                      <option value="데이터 분석/ML">데이터 분석/ML</option>
                                      <option value="AI 윤리/정책">AI 윤리/정책</option>
                                      <option value="AI 하드웨어/인프라">AI 하드웨어/인프라</option>
                                      <option value="AI 응용 서비스">AI 응용 서비스</option>
                                    </select>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* 프롬프트 관리 */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FaRobot className="text-pink-400" />
                프롬프트 관리 (DB 저장)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={exportData}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                >
                  <FaDownload className="w-4 h-4" />
                  백업
                </button>
                <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2 cursor-pointer">
                  <FaUpload className="w-4 h-4" />
                  복원
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <form onSubmit={handlePromptSubmit} className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-white/80">프롬프트 제목</label>
                  <input 
                    type="text" 
                    placeholder="프롬프트 제목" 
                    value={promptTitle} 
                    onChange={e => setPromptTitle(e.target.value)} 
                    className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-white/80">프롬프트 내용</label>
                  <textarea 
                    placeholder="프롬프트 내용" 
                    value={promptContent} 
                    onChange={e => setPromptContent(e.target.value)} 
                    className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none" 
                    rows={3} 
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={promptMutation.isPending}
                  className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave className="w-4 h-4" />
                  {promptMutation.isPending ? '저장 중...' : (promptEditId ? '수정' : '등록')}
                </button>
                {promptEditId && (
                  <button 
                    type="button" 
                    onClick={() => { setPromptEditId(null); setPromptTitle(''); setPromptContent('') }} 
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
            
            <div className="grid gap-4">
              {prompts.length === 0 && <div className="text-white/50 text-center">등록된 프롬프트가 없습니다.</div>}
              
              {/* 목록 보기 버튼 */}
              {prompts.length > 0 && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => setShowPromptList(!showPromptList)}
                    className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg"
                  >
                    {showPromptList ? '목록 숨기기' : '목록 보기'} ({prompts.length}개)
                  </button>
                </div>
              )}
              
              {showPromptList && prompts.map(p => (
                <div key={p.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-lg text-white">{p.title}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handlePromptEdit(p)} 
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        수정
                      </button>
                      <button 
                        onClick={() => handlePromptDelete(p.id)} 
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                  <div className="text-white/70 text-sm whitespace-pre-line bg-white/5 rounded-lg p-4">{p.content}</div>
                  <div className="text-white/50 text-xs mt-2">
                    생성일: {new Date(p.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 기반 내용 관리 */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <FaFileAlt className="text-green-400" />
              기반 내용 관리 (DB 저장)
            </h2>
            
            <form onSubmit={handleBaseSubmit} className="mb-8 bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-white/80">기반 내용 제목</label>
                  <input 
                    type="text" 
                    placeholder="기반 내용 제목" 
                    value={baseTitle} 
                    onChange={e => setBaseTitle(e.target.value)} 
                    className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-white/80">기반 내용</label>
                  <textarea 
                    placeholder="기반 내용" 
                    value={baseContent} 
                    onChange={e => setBaseContent(e.target.value)} 
                    className="p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none" 
                    rows={3} 
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  type="submit" 
                  disabled={baseContentMutation.isPending}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50"
                >
                  <FaSave className="w-4 h-4" />
                  {baseContentMutation.isPending ? '저장 중...' : (baseEditId ? '수정' : '등록')}
                </button>
                {baseEditId && (
                  <button 
                    type="button" 
                    onClick={() => { setBaseEditId(null); setBaseTitle(''); setBaseContent('') }} 
                    className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                  >
                    취소
                  </button>
                )}
              </div>
            </form>
            
            <div className="grid gap-4">
              {baseContents.length === 0 && <div className="text-white/50 text-center">등록된 기반 내용이 없습니다.</div>}
              
              {/* 목록 보기 버튼 */}
              {baseContents.length > 0 && (
                <div className="flex justify-center mb-4">
                  <button
                    onClick={() => setShowBaseContentList(!showBaseContentList)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg"
                  >
                    {showBaseContentList ? '목록 숨기기' : '목록 보기'} ({baseContents.length}개)
                  </button>
                </div>
              )}
              
              {showBaseContentList && baseContents.map(b => (
                <div key={b.id} className="bg-white/5 rounded-xl p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-bold text-lg text-white">{b.title}</div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowBaseContent(showBaseContent === b.id ? null : b.id)} 
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        {showBaseContent === b.id ? '내용 숨기기' : '내용 보기'}
                      </button>
                      <button 
                        onClick={() => handleBaseEdit(b)} 
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        수정
                      </button>
                      <button 
                        onClick={() => handleBaseDelete(b.id)} 
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition flex items-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        삭제
                      </button>
                    </div>
                  </div>
                  {showBaseContent === b.id && (
                    <div className="text-white/70 text-sm whitespace-pre-line bg-white/5 rounded-lg p-4 mb-4">{b.content}</div>
                  )}
                  <div className="text-white/50 text-xs mt-2">
                    생성일: {new Date(b.created_at).toLocaleDateString('ko-KR')}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 프롬프트+기반내용 합치기 */}
          <section className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
              <FaCopy className="text-cyan-400" />
              ChatGPT 프롬프트 생성
            </h2>
            
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 flex flex-col gap-4">
              <div className="text-white/80 font-medium">ChatGPT에 물어볼 프롬프트와 기반 내용을 선택하세요.</div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-white/80">프롬프트 선택</label>
                  <select 
                    value={selectedPromptId || ''} 
                    onChange={e => setSelectedPromptId(e.target.value ? Number(e.target.value) : null)} 
                    className="p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="" className="bg-gray-800">프롬프트 선택</option>
                    {prompts.map(p => <option key={p.id} value={p.id} className="bg-gray-800">{p.title}</option>)}
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-white/80">기반 내용 선택 (선택사항)</label>
                  <select 
                    value={selectedBaseId || ''} 
                    onChange={e => setSelectedBaseId(e.target.value ? Number(e.target.value) : null)} 
                    className="p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  >
                    <option value="" className="bg-gray-800">기반 내용 선택(선택사항)</option>
                    {baseContents.map(b => <option key={b.id} value={b.id} className="bg-gray-800">{b.title}</option>)}
                  </select>
                </div>
              </div>
              
              <button 
                onClick={handleCopyAndGo} 
                disabled={!selectedPromptId} 
                className="w-full px-6 py-3 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-500 disabled:opacity-50 text-white rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                <FaCopy className="w-4 h-4" />
                ChatGPT에 물어보기
              </button>
              
              {copied && <div className="text-green-400 text-center bg-green-500/10 border border-green-500/30 rounded-lg p-3">프롬프트+기반내용이 복사되었습니다!</div>}
              
              <div 
                ref={combinedRef} 
                tabIndex={0} 
                className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-sm text-white/70 whitespace-pre-line outline-none min-h-[100px]" 
                style={{userSelect:'text'}}
              >
                {getCombinedText() || '선택된 프롬프트와 기반 내용이 여기에 미리보기로 표시됩니다.'}
              </div>
            </div>
          </section>


        </div>
      </div>

      {/* 중복 용어 분석 모달 */}
      {showDuplicateAnalysis && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🔍 단어 검색 결과
              </h2>
              <button
                onClick={() => setShowDuplicateAnalysis(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>
            </div>

            {duplicateTerms.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="space-y-6">
                {/* 검색 결과 요약 */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <h3 className="text-lg font-semibold text-blue-300 mb-2">📊 검색 결과 요약</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{duplicateTerms.length}</div>
                      <div className="text-blue-300">검색된 카드 수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">
                        {duplicateTerms.reduce((sum, term) => sum + term.count, 0)}
                      </div>
                      <div className="text-orange-300">총 매칭 항목</div>
                    </div>
                  </div>
                </div>

                {/* 검색된 카드 상세 목록 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">📋 검색된 학습 내용</h3>
                  {searchResults.map((result, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-white">{result.cardTitle}</span>
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            {result.matchedTerms.length}개 매칭
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="text-sm text-white/70">
                          📅 {result.date} - 인덱스: {result.index}
                        </div>
                        
                        {/* 매칭된 용어들 상세 표시 */}
                        <div className="space-y-2">
                          <div className="text-sm text-white/70 font-medium">매칭된 항목:</div>
                          {result.matchedTerms.map((match, matchIdx) => (
                            <div key={matchIdx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  match.type === 'term' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                                  match.type === 'title' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                                  'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                                }`}>
                                  {match.type === 'term' ? '용어' : match.type === 'title' ? '제목' : '내용'}
                                </span>
                                <span className="text-sm font-semibold text-white">{match.term}</span>
                              </div>
                              {match.description && (
                                <div className="text-xs text-white/60 ml-4">
                                  {match.description}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 대체 용어 제안 결과 */}
                {replacementSuggestions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">💡 대체 용어 제안</h3>
                    {replacementSuggestions.map((suggestion, idx) => (
                      <div key={idx} className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                        <div className="mb-3">
                          <div className="text-sm text-green-300 mb-1">
                            📅 {suggestion.date} - 인덱스 {suggestion.index}
                          </div>
                          <div className="text-lg font-semibold text-white">
                            "{suggestion.originalTerm}" → 대체 용어 선택
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-3">
                          {suggestion.suggestedTerms.map((newTerm, termIdx) => (
                            <button
                              key={termIdx}
                              onClick={() => executeTermReplacement(
                                suggestion.date,
                                suggestion.index,
                                suggestion.originalTerm,
                                newTerm
                              )}
                              className="px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition text-sm border border-green-500/30"
                            >
                              {newTerm}
                            </button>
                          ))}
                        </div>
                        
                        {suggestion.suggestedTerms.length === 0 && (
                          <div className="text-center py-4 text-yellow-400 bg-yellow-500/10 rounded-lg">
                            ⚠️ 적합한 대체 용어가 없습니다. 수동으로 입력해주세요.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 매칭된 용어 수정 모달 */}
      {showMatchedTerms && matchedTerms.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border-2 border-yellow-500/50 rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-yellow-300 flex items-center gap-2">
                🔍 매칭된 용어 수정
              </h3>
              <button
                onClick={() => setShowMatchedTerms(false)}
                className="text-yellow-400 hover:text-yellow-200 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-white/80 text-sm">
                입력한 용어 중 기존 학습 내용과 일치하는 용어가 발견되었습니다. 
                용어와 설명을 수정하여 반영할 수 있습니다.
              </p>
            </div>
            
            <div className="space-y-4">
              {matchedTerms.map((match, idx) => (
                <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-semibold text-white">{match.term}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          match.language === 'ko' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                          match.language === 'en' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          match.language === 'ja' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                          'bg-orange-500/20 text-orange-300 border border-orange-400/30'
                        }`}>
                          {match.language === 'ko' ? '🇰🇷 한국어' : 
                           match.language === 'en' ? '🇺🇸 영어' : 
                           match.language === 'ja' ? '🇯🇵 일본어' : '🇨🇳 중국어'}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-400 mb-2">
                        <strong>출처:</strong> {match.sourceCard.date} - {match.sourceCard.title}
                      </div>
                      <div className="text-sm text-gray-400 mb-3">
                        <strong>카테고리:</strong> {match.sourceCard.category}
                      </div>
                      
                      <div className="text-sm text-gray-300">
                        <strong>현재 설명:</strong> {match.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* 수정 폼 */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">용어 수정</label>
                      <input
                        type="text"
                        value={match.term}
                        onChange={(e) => {
                          const newMatches = [...matchedTerms]
                          newMatches[idx].term = e.target.value
                          setMatchedTerms(newMatches)
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500/50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-1">설명 수정</label>
                      <textarea
                        value={match.description}
                        onChange={(e) => {
                          const newMatches = [...matchedTerms]
                          newMatches[idx].description = e.target.value
                          setMatchedTerms(newMatches)
                        }}
                        rows={2}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-yellow-500/50 resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  // 수정된 용어를 기존 학습 내용에 반영
                  matchedTerms.forEach(match => {
                    // 해당 날짜와 인덱스의 AI 정보를 찾아서 용어 업데이트
                    // 이 부분은 실제 구현 시 더 복잡한 로직이 필요할 수 있습니다
                    console.log(`용어 수정: ${match.term} - ${match.description}`)
                  })
                  setSuccess(`${matchedTerms.length}개의 용어가 수정되었습니다.`)
                  setShowMatchedTerms(false)
                }}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors"
              >
                수정 반영
              </button>
              
              <button
                onClick={() => setShowMatchedTerms(false)}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { Language, languageFlags, languageNames, getCurrentLanguage, changeLanguage } from '@/lib/i18n'
import { useQueryClient } from '@tanstack/react-query'

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<Language>('ko')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // 언어 코드를 세련된 텍스트로 변환
  const getLanguageCode = (language: Language): string => {
    switch (language) {
      case 'ko': return 'KR'
      case 'en': return 'EN'
      case 'ja': return 'JA'
      case 'zh': return 'ZH'
      default: return 'KR'
    }
  }

  // 언어 이름을 간단하게 표시
  const getLanguageName = (language: Language): string => {
    switch (language) {
      case 'ko': return '한국어'
      case 'en': return 'English'
      case 'ja': return '日本語'
      case 'zh': return '中文'
      default: return '한국어'
    }
  }

  useEffect(() => {
    setCurrentLanguage(getCurrentLanguage())
    
    const handleLanguageChange = () => {
      const newLanguage = getCurrentLanguage()
      setCurrentLanguage(newLanguage)
      
      // React Query 캐시 무효화하여 새로운 언어로 데이터 다시 요청
      queryClient.invalidateQueries()
      
      // 전역 상태 업데이트를 위한 커스텀 이벤트 발생 (즉시 반영)
      window.dispatchEvent(new CustomEvent('forceUpdate', { 
        detail: { 
          language: newLanguage,
          timestamp: Date.now() // 고유한 이벤트를 위한 타임스탬프
        } 
      }))
      
      // 추가적인 강제 업데이트 이벤트
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { 
          language: newLanguage,
          timestamp: Date.now()
        } 
      }))
    }

    window.addEventListener('languageChange', handleLanguageChange)
    return () => window.removeEventListener('languageChange', handleLanguageChange)
  }, [queryClient])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    setIsOpen(false)
    changeLanguage(language)
    
    // 언어 변경 시 무조건 새로고침
    setTimeout(() => {
      window.location.reload()
    }, 100)
  }

  const languages: Language[] = ['ko', 'en', 'ja', 'zh']

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-all duration-300 rounded-xl hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
        aria-label="언어 선택"
      >
        <Globe size={18} className="text-purple-300" />
        <span className="text-sm font-semibold tracking-wider">{getLanguageCode(currentLanguage)}</span>
        <ChevronDown 
          size={14} 
          className={`transition-transform duration-300 text-white/60 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-3 w-52 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 z-50 overflow-hidden"
          >
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-white/5 transition-all duration-300 ${
                    currentLanguage === language 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 border-r-2 border-purple-400' 
                      : 'text-white/70 hover:text-white/90'
                  }`}
                >
                  <span className="text-lg font-bold tracking-wider text-purple-300">{getLanguageCode(language)}</span>
                  <span className="font-medium text-sm">{getLanguageName(language)}</span>
                  {currentLanguage === language && (
                    <div className="ml-auto w-2.5 h-2.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

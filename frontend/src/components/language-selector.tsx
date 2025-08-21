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
        className="flex items-center gap-2 px-3 py-2 text-white/80 hover:text-white transition-colors duration-200 rounded-lg hover:bg-white/10"
        aria-label="언어 선택"
      >
        <Globe size={20} />
        <span className="text-lg">{languageFlags[currentLanguage]}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-sm border border-gray-700 rounded-lg shadow-xl z-50"
          >
            <div className="py-2">
              {languages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageChange(language)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors duration-200 ${
                    currentLanguage === language ? 'bg-blue-500/20 text-blue-300' : 'text-white/80 hover:text-white'
                  }`}
                >
                  <span className="text-xl">{languageFlags[language]}</span>
                  {currentLanguage === language && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
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

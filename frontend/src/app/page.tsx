"use client"

import { useRouter } from 'next/navigation'
import { FaRobot, FaArrowRight, FaBrain, FaRocket, FaChartLine, FaTrophy } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function IntroPage() {
  const router = useRouter()
  const [typedText, setTypedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [clickedCard, setClickedCard] = useState<number | null>(null)
  const [clickedStat, setClickedStat] = useState<number | null>(null)
  
  const fullText = "AI Mastery Hub"
  const taglines = [
    "매일 새로운 AI 정보로 지식을 쌓아보세요.",
    "실전 퀴즈로 학습한 내용을 점검하세요.",
    "개인별 학습 진행률을 체계적으로 관리하세요.",
    "AI 세계의 핵심 개념을 쉽게 이해하세요."
  ]
  const [currentTagline, setCurrentTagline] = useState(0)

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 타이핑 애니메이션
  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setTypedText(fullText.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 150)
      return () => clearTimeout(timeout)
    } else {
      setIsTyping(false)
    }
  }, [currentIndex, fullText])

  // 태그라인 순환
  useEffect(() => {
    if (!isTyping) {
      const interval = setInterval(() => {
        setCurrentTagline((prev) => (prev + 1) % taglines.length)
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [isTyping, taglines.length])

  // 마우스 위치 추적 (데스크톱에서만)
  useEffect(() => {
    if (!isMobile) {
      const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.clientX, y: e.clientY })
      }
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isMobile])

  // 카드 클릭 효과
  const handleCardClick = (index: number) => {
    // 이미 클릭된 카드라면 상태 종료
    if (clickedCard === index) {
      setClickedCard(null)
      return
    }
    
    // 다른 카드 클릭 시 이전 상태 종료 후 새 상태 시작
    if (clickedCard !== null) {
      setClickedCard(null)
    }
    
    setClickedCard(index)
  }

  // 카드 확장/축소 토글 (제거 - 단순 클릭으로 변경)
  const toggleCard = (index: number) => {
    handleCardClick(index)
  }

  // 통계 아이콘 클릭 효과 - 개선된 버전
  const handleStatClick = (index: number) => {
    console.log('=== handleStatClick 호출됨 ===')
    console.log('클릭된 아이콘 인덱스:', index)
    console.log('현재 선택된 아이콘:', clickedStat)
    console.log('아이콘 상태:', clickedStat === null ? '선택 안됨' : '선택됨')
    
    // 같은 아이콘을 다시 클릭하면 상태 종료 (아이콘들이 뭉침)
    if (clickedStat === index) {
      console.log('같은 아이콘 재클릭 - 아이콘들 뭉침')
      setClickedStat(null)
      return
    }
    
    // 다른 아이콘을 클릭하면 해당 아이콘의 설명 표시 (기존 상태 유지하면서 새 아이콘 선택)
    console.log('다른 아이콘 클릭 - 아이콘 설명 전환:', index)
    console.log('이전 선택:', clickedStat, '-> 새 선택:', index)
    
    // 상태 업데이트
    setClickedStat(index)
    
    console.log('상태 업데이트 완료:', index)
  }

  // 배경 클릭 시 아이콘들이 원래 위치로 돌아가도록 하는 함수
  const handleBackgroundClick = () => {
    setClickedStat(null)
  }

  // 아이콘 클릭 이벤트 핸들러 - 이벤트 전파 방지
  const handleIconClick = (index: number, event: React.MouseEvent) => {
    console.log('=== handleIconClick 호출됨 ===')
    console.log('아이콘 인덱스:', index)
    console.log('이벤트 타입:', event.type)
    
    // 이벤트 전파 완벽 방지
    event.preventDefault()
    event.stopPropagation()
    
    console.log('이벤트 전파 방지 완료')
    console.log('handleStatClick 호출 시작')
    
    // handleStatClick 함수 호출
    handleStatClick(index)
    
    console.log('handleIconClick 완료')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 고급스러운 배경 효과 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,255,0.15),transparent_50%)]" />
      
      {/* 움직이는 그라데이션 배경 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10 animate-gradient-float" />
      
      {/* 인터랙티브 마우스 효과 (데스크톱에서만) */}
      {!isMobile && (
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: 'translate(-50%, -50%)'
          }}
        />
      )}
      
      {/* 움직이는 파티클 효과 (모바일에서는 줄임) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(isMobile ? 15 : 30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 빛나는 효과 (모바일에서는 줄임) */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 md:w-96 md:h-96 bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-40 h-40 md:w-80 md:h-80 bg-gradient-to-r from-pink-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* 움직이는 선 효과 (모바일에서는 줄임) */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(isMobile ? 3 : 5)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-16 md:h-32 bg-gradient-to-b from-transparent via-purple-500/30 to-transparent animate-slide-down"
            style={{
              left: `${20 + i * 15}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

             {/* 메인 컨텐츠 */}
       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-1 py-8 md:py-12">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16 w-full max-w-6xl mx-auto">
          {/* 로고 및 제목 */}
          <div className="flex flex-col items-center gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="relative">
              <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl animate-glow">
                <FaRobot className="text-2xl md:text-3xl lg:text-4xl text-white" />
              </div>
              <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-4 h-4 md:w-6 md:h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              {/* 빛나는 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-2xl blur-xl animate-pulse" />
            </div>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-4xl lg:text-6xl xl:text-7xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight mb-3 md:mb-4 animate-text-glow mobile-text text-center">
                {typedText}
                {isTyping && <span className="animate-blink">|</span>}
              </h1>
              <div className="h-6 md:h-8 lg:h-10 flex items-center justify-center">
                <p className="text-base md:text-lg lg:text-xl xl:text-2xl text-purple-300 font-medium mobile-text text-center max-w-3xl mx-auto leading-relaxed">
                  <span 
                    key={currentTagline}
                    className="inline-block animate-tagline-fade"
                  >
                    {taglines[currentTagline]}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* 메인 텍스트 */}
          <div className="text-center mb-6 md:mb-8 lg:mb-12 max-w-5xl mx-auto px-1">
            <h2 className="text-lg md:text-xl lg:text-3xl xl:text-4xl font-bold text-white mb-3 md:mb-4 leading-tight mobile-text text-center">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent block mb-2 md:mb-3">
                매일 업데이트되는 AI 정보
              </span>
              <span className="text-white/90 block mb-2 md:mb-3">
                관련 용어를 학습
              </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent block">
                실전 퀴즈로 지식을 점검
              </span>
            </h2>

          </div>

          {/* CTA 버튼 */}
          <div className="flex justify-center mb-6 md:mb-8">
            <button
              className="group px-6 md:px-10 lg:px-12 py-3 md:py-4 lg:py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-base md:text-lg lg:text-xl rounded-xl font-bold shadow-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all flex items-center gap-2 md:gap-3 animate-fade-in hover:scale-105 active:scale-95 relative overflow-hidden animate-button-glow touch-optimized mobile-touch-target"
              onClick={() => router.push('/auth')}
            >
              <span className="relative z-10">지금 시작하기</span>
              <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-200 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>

        

                                                                       {/* 하단 통계 섹션 */}
                       <div className="w-full max-w-5xl mb-12 md:mb-16">
             <div className="relative">
              {/* 4개 아이콘을 2행2열로 배치하고 클릭하면 펼쳐지는 애니메이션 */}
              <div className="relative h-72 md:h-96">
               {/* 첫 번째 행 */}
               <div className="flex items-center justify-center gap-4 md:gap-6 mb-4 md:mb-6">
                 {/* 첫 번째 아이콘 - AI 정보 */}
                 <div 
                   className={`text-center cursor-pointer transition-all duration-700 ease-out relative z-70 ${
                     clickedStat === null 
                       ? 'transform scale-100' 
                       : 'transform translate-x-[-80px] md:translate-x-[-100px] translate-y-[-60px] md:translate-y-[-80px] scale-90'
                   }`}
                   onClick={(event) => handleIconClick(0, event)}
                 >
                   <div className={`relative transition-all duration-300 ${
                     clickedStat === 0 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center transition-all duration-300 ${
                       clickedStat === 0 ? 'animate-stat-glow scale-110' : 'hover:scale-105'
                     }`}>
                       <FaBrain className="text-purple-300 text-3xl md:text-5xl" />
                     </div>
                   </div>
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">매일 새로운</div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">AI 정보</div>
                   </div>
                   
                                       {/* 고급스러운 선택 효과 */}
                    {clickedStat === 0 && (
                      <>
                        {/* 메인 선택 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 animate-stat-aura" />
                        
                        {/* 빛나는 테두리 */}
                        <div className="absolute inset-0 rounded-full border-2 border-purple-400/60 animate-stat-border-glow" />
                        
                        {/* 중앙 빛나는 원 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse-scale" />
                        
                        {/* 파티클 효과 */}
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-stat-particle"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              '--angle': `${i * 30}deg`,
                              '--distance': '25px'
                            } as React.CSSProperties}
                          />
                        ))}
                        
                        {/* 빛나는 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-stat-shine" />
                        
                        {/* 상단 장식 */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full animate-decoration-slide-down" />
                        
                        {/* 하단 장식 */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent rounded-full animate-decoration-slide-up" />
                      </>
                    )}
                 </div>

                                   {/* 두 번째 아이콘 - 관련 용어 */}
                  <div 
                    className={`text-center cursor-pointer transition-all duration-700 ease-out relative z-70 ${
                      clickedStat === null 
                        ? 'transform scale-100' 
                        : 'transform translate-x-[80px] md:translate-x-[100px] translate-y-[-60px] md:translate-y-[-80px] scale-90'
                    }`}
                    onClick={(event) => handleIconClick(1, event)}
                  >
                   <div className={`relative transition-all duration-300 ${
                     clickedStat === 1 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center transition-all duration-300 ${
                       clickedStat === 1 ? 'animate-stat-glow scale-110' : 'hover:scale-105'
                     }`}>
                       <FaRocket className="text-purple-300 text-3xl md:text-5xl" />
                     </div>
                   </div>
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">핵심 개념</div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">관련 용어</div>
                   </div>
                   
                                       {/* 고급스러운 선택 효과 */}
                    {clickedStat === 1 && (
                      <>
                        {/* 메인 선택 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 animate-stat-aura" />
                        
                        {/* 빛나는 테두리 */}
                        <div className="absolute inset-0 rounded-full border-2 border-blue-400/60 animate-stat-border-glow" />
                        
                        {/* 중앙 빛나는 원 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 animate-pulse-scale" />
                        
                        {/* 파티클 효과 */}
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-stat-particle"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              '--angle': `${i * 30}deg`,
                              '--distance': '25px'
                            } as React.CSSProperties}
                          />
                        ))}
                        
                        {/* 빛나는 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-stat-shine" />
                        
                        {/* 상단 장식 */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full animate-decoration-slide-down" />
                        
                        {/* 하단 장식 */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent rounded-full animate-decoration-slide-up" />
                      </>
                    )}
                 </div>
               </div>

               {/* 두 번째 행 */}
               <div className="flex items-center justify-center gap-4 md:gap-6">
                                   {/* 세 번째 아이콘 - 실전 퀴즈 */}
                  <div 
                    className={`text-center cursor-pointer transition-all duration-700 ease-out relative z-70 ${
                      clickedStat === null 
                        ? 'transform scale-100' 
                        : 'transform translate-x-[-80px] md:translate-x-[-100px] translate-y-[40px] md:translate-y-[60px] scale-90'
                    }`}
                    onClick={(event) => handleIconClick(2, event)}
                  >
                   <div className={`relative transition-all duration-300 ${
                     clickedStat === 2 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center transition-all duration-300 ${
                       clickedStat === 2 ? 'animate-stat-glow scale-110' : 'hover:scale-105'
                     }`}>
                       <FaChartLine className="text-purple-300 text-3xl md:text-5xl" />
                     </div>
                   </div>
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">지식 점검</div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">실전 퀴즈</div>
                   </div>
                   
                                       {/* 고급스러운 선택 효과 */}
                    {clickedStat === 2 && (
                      <>
                        {/* 메인 선택 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30 animate-stat-aura" />
                        
                        {/* 빛나는 테두리 */}
                        <div className="absolute inset-0 rounded-full border-2 border-green-400/60 animate-stat-border-glow" />
                        
                        {/* 중앙 빛나는 원 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400/20 to-emerald-400/20 animate-pulse-scale" />
                        
                        {/* 파티클 효과 */}
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-stat-particle"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              '--angle': `${i * 30}deg`,
                              '--distance': '25px'
                            } as React.CSSProperties}
                          />
                        ))}
                        
                        {/* 빛나는 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-stat-shine" />
                        
                        {/* 상단 장식 */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent rounded-full animate-decoration-slide-down" />
                        
                        {/* 하단 장식 */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full animate-decoration-slide-up" />
                      </>
                    )}
                 </div>

                                   {/* 네 번째 아이콘 - 학습 진행률 */}
                  <div 
                    className={`text-center cursor-pointer transition-all duration-700 ease-out relative z-70 ${
                      clickedStat === null 
                        ? 'transform scale-100' 
                        : 'transform translate-x-[80px] md:translate-x-[100px] translate-y-[40px] md:translate-y-[60px] scale-90'
                    }`}
                    onClick={(event) => handleIconClick(3, event)}
                  >
                   <div className={`relative transition-all duration-300 ${
                     clickedStat === 3 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-20 h-20 md:w-24 md:h-24 mx-auto rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center transition-all duration-300 ${
                       clickedStat === 3 ? 'animate-stat-glow scale-110' : 'hover:scale-105'
                     }`}>
                       <FaTrophy className="text-purple-300 text-3xl md:text-5xl" />
                     </div>
                   </div>
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">학습 현황</div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">진행률</div>
                   </div>
                   
                                       {/* 고급스러운 선택 효과 */}
                    {clickedStat === 3 && (
                      <>
                        {/* 메인 선택 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-amber-500/30 animate-stat-aura" />
                        
                        {/* 빛나는 테두리 */}
                        <div className="absolute inset-0 rounded-full border-2 border-yellow-400/60 animate-stat-border-glow" />
                        
                        {/* 중앙 빛나는 원 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 to-orange-400/20 animate-pulse-scale" />
                        
                        {/* 파티클 효과 */}
                        {[...Array(12)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute w-1.5 h-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-stat-particle"
                            style={{
                              left: '50%',
                              top: '50%',
                              transform: 'translate(-50%, -50%)',
                              '--angle': `${i * 30}deg`,
                              '--distance': '25px'
                            } as React.CSSProperties}
                          />
                        ))}
                        
                        {/* 빛나는 효과 */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-stat-shine" />
                        
                        {/* 상단 장식 */}
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full animate-decoration-slide-down" />
                        
                        {/* 하단 장식 */}
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full animate-decoration-slide-up" />
                      </>
                    )}
                 </div>
               </div>

                                               {/* 중앙 텍스트 - 4개 아이콘이 펼쳐진 후 나타남 (위치 조정 및 애니메이션 개선) */}
                 {clickedStat !== null && (
                   <div className="absolute inset-0 flex items-center justify-center z-40" style={{ transform: 'translateY(-20px)' }}>
                     {/* 메인 텍스트 상자 */}
                     <div className="relative group">
                      {/* 메인 텍스트 상자 - 더 멋진 애니메이션 효과 추가 */}
                      <div className="bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-slate-800/95 backdrop-blur-2xl rounded-3xl p-4 md:p-6 border border-white/20 shadow-2xl w-52 md:w-60 h-32 md:h-36 flex items-center justify-center relative overflow-hidden animate-text-box-appear">
                       {/* 내부 그라데이션 오버레이 */}
                       <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 rounded-3xl" />
                       
                       {/* 빛나는 테두리 효과 */}
                       <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-blue-500/30 p-[1px]">
                         <div className="bg-gradient-to-br from-slate-800/95 via-purple-900/95 to-slate-800/95 rounded-3xl h-full w-full flex items-center justify-center">
                           <div className="text-white/90 text-sm md:text-base font-medium leading-relaxed px-4 text-center relative z-10 animate-text-fade-in">
                             {[
                               "최신 AI 트렌드와\n기술 동향을 매일 업데이트하여 제공합니다.",
                               "AI 학습에 필수적인\n핵심 용어들을 체계적으로 정리했습니다.",
                               "학습한 내용을 다양한\n퀴즈로 점검하여 확실한 이해를 확인합니다.",
                               "개인별 학습 진행 상황을\n체계적으로 추적하고 목표를 달성합니다."
                             ][clickedStat]}
                           </div>
                         </div>
                       </div>
                       
                       {/* 상단 장식 요소 - 애니메이션 추가 */}
                       <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full opacity-60 animate-decoration-slide-down" />
                       
                       {/* 하단 장식 요소 - 애니메이션 추가 */}
                       <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full opacity-40 animate-decoration-slide-up" />
                       
                       {/* 추가 빛나는 효과 */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shine-effect" />
                       
                       {/* 입체감을 위한 그림자 효과 */}
                       <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-transparent rounded-3xl" />
                     </div>
                     
                     {/* 주변 빛나는 효과 - 더 강화 */}
                     <div className="absolute inset-0 -m-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-surround-glow" />
                     
                     {/* 추가 파티클 효과 - 더 멋진 애니메이션 */}
                     {[...Array(8)].map((_, i) => (
                       <div
                         key={i}
                         className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-floating-particle"
                         style={{
                           left: `${15 + i * 12}%`,
                           top: `${25 + (i % 3) * 25}%`,
                           animationDelay: `${i * 0.15}s`,
                           animationDuration: `${2.5 + i * 0.5}s`
                         }}
                       />
                     ))}
                     
                     {/* 추가 빛나는 원형 효과 */}
                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 via-transparent to-pink-500/10 animate-pulse-scale" />
                     
                     {/* 상단 빛나는 선 효과 */}
                     <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent rounded-full opacity-40 animate-decoration-slide-down" />
                     
                     {/* 하단 빛나는 선 효과 */}
                     <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full opacity-30 animate-decoration-slide-up" />
                   </div>
                 </div>
               )}
                           </div>
              
              {/* 배경 클릭 영역 - 아이콘들이 펼쳐진 상태에서만 표시 */}
              {clickedStat !== null && (
                <div 
                  className="fixed inset-0 z-40 cursor-pointer"
                  onClick={handleBackgroundClick}
                  style={{ 
                    background: 'transparent'
                  }}
                />
              )}
            </div>
          </div>
       </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.8; }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        .animate-blink {
          animation: blink 1s infinite;
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0; transform: translateY(10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 1.5s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes gradient-shift {
          0%, 100% { transform: translateX(0) translateY(0); }
          25% { transform: translateX(10px) translateY(-10px); }
          50% { transform: translateX(-5px) translateY(5px); }
          75% { transform: translateX(5px) translateY(-5px); }
        }
        .animate-gradient-shift {
          animation: gradient-shift 8s ease-in-out infinite;
        }
        @keyframes gradient-float {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        .animate-gradient-float {
          animation: gradient-float 6s ease-in-out infinite;
        }
        @keyframes slide-down {
          0% { transform: translateY(-100vh); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        .animate-slide-down {
          animation: slide-down 4s linear infinite;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
          50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        @keyframes text-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(147, 51, 234, 0.3)); }
          50% { filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.6)); }
        }
        .animate-text-glow {
          animation: text-glow 4s ease-in-out infinite;
        }
        @keyframes button-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(147, 51, 234, 0.2); }
          50% { box-shadow: 0 0 50px rgba(147, 51, 234, 0.4); }
        }
        .animate-button-glow {
          animation: button-glow 3s ease-in-out infinite;
        }
        @keyframes card-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-card-float {
          animation: card-float 4s ease-in-out infinite;
        }
        @keyframes icon-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 255, 255, 0.2); }
          50% { box-shadow: 0 0 20px rgba(255, 255, 255, 0.4); }
        }
        .animate-icon-glow {
          animation: icon-glow 2s ease-in-out infinite;
        }
        @keyframes stat-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-stat-fade-in {
          animation: stat-fade-in 1s ease-out both;
        }
        @keyframes stat-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(147, 51, 234, 0.2); }
          50% { box-shadow: 0 0 25px rgba(147, 51, 234, 0.4); }
        }
        .animate-stat-glow {
          animation: stat-glow 3s ease-in-out infinite;
        }
        
        /* 태그라인 애니메이션 */
        @keyframes tagline-fade {
          0% { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95);
          }
          20% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
          80% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-20px) scale(0.95);
          }
        }
        .animate-tagline-fade {
          animation: tagline-fade 3s ease-in-out;
        }
        
        /* 카드 클릭 효과 애니메이션 */
        @keyframes particle-explosion {
          0% { 
            opacity: 1; 
            transform: translate(0, 0) scale(1);
          }
          100% { 
            opacity: 0; 
            transform: translate(var(--x), var(--y)) scale(0);
          }
        }
        .animate-particle-explosion {
          animation: particle-explosion 1s ease-out forwards;
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .animate-shine {
          animation: shine 0.8s ease-out;
        }
        
        @keyframes pulse-scale {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.05); opacity: 0.6; }
        }
        .animate-pulse-scale {
          animation: pulse-scale 1s ease-in-out infinite;
        }
        
        @keyframes bounce-scale {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        .animate-bounce-scale {
          animation: bounce-scale 0.6s ease-in-out infinite;
        }
        
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.5s ease-out;
        }
        
        /* 새로운 고급스러운 효과 애니메이션 */
        @keyframes aura-glow {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1);
            filter: blur(0px);
          }
          50% { 
            opacity: 0.4; 
            transform: scale(1.02);
            filter: blur(1px);
          }
        }
        .animate-aura-glow {
          animation: aura-glow 2s ease-in-out infinite;
        }
        
        @keyframes gradient-wave {
          0%, 100% { 
            opacity: 0.15; 
            transform: scale(1) rotate(0deg);
          }
          25% { 
            opacity: 0.25; 
            transform: scale(1.01) rotate(1deg);
          }
          50% { 
            opacity: 0.2; 
            transform: scale(1.02) rotate(0deg);
          }
          75% { 
            opacity: 0.25; 
            transform: scale(1.01) rotate(-1deg);
          }
        }
        .animate-gradient-wave {
          animation: gradient-wave 3s ease-in-out infinite;
        }
        
        @keyframes smooth-expand {
          0% { 
            opacity: 0; 
            transform: scale(0.95);
          }
          100% { 
            opacity: 1; 
            transform: scale(1);
          }
        }
        .animate-smooth-expand {
          animation: smooth-expand 0.6s ease-out;
        }
        
        @keyframes border-glow {
          0%, 100% { 
            border-color: rgba(147, 51, 234, 0.4);
            box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
          }
          50% { 
            border-color: rgba(236, 72, 153, 0.6);
            box-shadow: 0 0 30px rgba(236, 72, 153, 0.5);
          }
        }
        .animate-border-glow {
          animation: border-glow 2s ease-in-out infinite;
        }
        
        /* 통계 아이콘 클릭 효과 애니메이션 */
        @keyframes stat-aura {
          0%, 100% { 
            opacity: 0.2; 
            transform: scale(1);
            filter: blur(0px);
          }
          50% { 
            opacity: 0.4; 
            transform: scale(1.05);
            filter: blur(1px);
          }
        }
        .animate-stat-aura {
          animation: stat-aura 2s ease-in-out infinite;
        }
        
                 @keyframes stat-particle {
           0% { 
             opacity: 1; 
             transform: translate(-50%, -50%) scale(1);
           }
           100% { 
             opacity: 0; 
             transform: translate(-50%, -50%) scale(0) translate(var(--x, 25px), var(--y, -25px));
           }
         }
         .animate-stat-particle {
           animation: stat-particle 2s ease-out forwards;
         }
         
         /* 고급스러운 선택 효과 애니메이션 */
         @keyframes stat-selection-glow {
           0%, 100% { 
             opacity: 0.3; 
             transform: scale(1);
             filter: blur(0px);
           }
           50% { 
             opacity: 0.6; 
             transform: scale(1.1);
             filter: blur(1px);
           }
         }
         .animate-stat-selection-glow {
           animation: stat-selection-glow 2.5s ease-in-out infinite;
         }
         
         @keyframes stat-selection-border {
           0%, 100% { 
             border-color: rgba(147, 51, 234, 0.6);
             box-shadow: 0 0 20px rgba(147, 51, 234, 0.4);
           }
           50% { 
             border-color: rgba(236, 72, 153, 0.8);
             box-shadow: 0 0 30px rgba(236, 72, 153, 0.6);
           }
         }
         .animate-stat-selection-border {
           animation: stat-selection-border 2s ease-in-out infinite;
         }
         
         @keyframes stat-selection-particle {
           0% { 
             opacity: 1; 
             transform: translate(-50%, -50%) scale(1) rotate(0deg);
           }
           100% { 
             opacity: 0; 
             transform: translate(-50%, -50%) scale(0) rotate(360deg) translate(var(--x, 30px), var(--y, -30px));
           }
         }
         .animate-stat-selection-particle {
           animation: stat-selection-particle 2.5s ease-out forwards;
         }
        
        @keyframes stat-shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .animate-stat-shine {
          animation: stat-shine 1s ease-out;
        }
        
        @keyframes stat-info-slide {
          0% { 
            opacity: 0; 
            transform: translateY(10px) scale(0.95);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        .animate-stat-info-slide {
          animation: stat-info-slide 0.4s ease-out;
        }
        
        @keyframes stat-border-glow {
          0%, 100% { 
            border-color: rgba(147, 51, 234, 0.4);
            box-shadow: 0 0 15px rgba(147, 51, 234, 0.3);
          }
          50% { 
            border-color: rgba(236, 72, 153, 0.6);
            box-shadow: 0 0 25px rgba(236, 72, 153, 0.5);
          }
        }
        .animate-stat-border-glow {
          animation: stat-border-glow 2s ease-in-out infinite;
        }
        
        /* 새로운 텍스트 박스 애니메이션 */
        @keyframes text-box-appear {
          0% { 
            opacity: 0; 
            transform: scale(0.8) translateY(20px);
            filter: blur(4px);
          }
          50% { 
            opacity: 0.8; 
            transform: scale(1.05) translateY(-5px);
            filter: blur(1px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0);
            filter: blur(0px);
          }
        }
        .animate-text-box-appear {
          animation: text-box-appear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        @keyframes text-fade-in {
          0% { 
            opacity: 0; 
            transform: translateY(10px) scale(0.95);
          }
          100% { 
            opacity: 1; 
            transform: translateY(0) scale(1);
          }
        }
        .animate-text-fade-in {
          animation: text-fade-in 0.6s ease-out 0.3s forwards;
        }
        
        @keyframes decoration-slide-down {
          0% { 
            opacity: 0; 
            transform: translateY(-10px) scaleX(0);
          }
          100% { 
            opacity: 0.6; 
            transform: translateY(0) scaleX(1);
          }
        }
        .animate-decoration-slide-down {
          animation: decoration-slide-down 0.8s ease-out 0.4s forwards;
        }
        
        @keyframes decoration-slide-up {
          0% { 
            opacity: 0; 
            transform: translateY(10px) scaleX(0);
          }
          100% { 
            opacity: 0.4; 
            transform: translateY(0) scaleX(1);
          }
        }
        .animate-decoration-slide-up {
          animation: decoration-slide-up 0.8s ease-out 0.5s forwards;
        }
        
        @keyframes shine-effect {
          0% { transform: translateX(-100%) skewX(-15deg); }
          100% { transform: translateX(200%) skewX(-15deg); }
        }
        .animate-shine-effect {
          animation: shine-effect 2s ease-out 0.6s forwards;
        }
        
        @keyframes surround-glow {
          0% { 
            opacity: 0; 
            transform: scale(0.8);
            filter: blur(8px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1);
            filter: blur(4px);
          }
        }
        .animate-surround-glow {
          animation: surround-glow 1s ease-out 0.7s forwards;
        }
        
        @keyframes floating-particle {
          0%, 100% { 
            opacity: 0.4; 
            transform: translateY(0) scale(1);
          }
          50% { 
            opacity: 0.8; 
            transform: translateY(-8px) scale(1.2);
          }
        }
        .animate-floating-particle {
          animation: floating-particle 3s ease-in-out infinite;
        }
        
        /* 모바일 최적화 */
        @media (max-width: 768px) {
          .animate-float {
            animation-duration: 8s;
          }
          .animate-gradient-shift {
            animation-duration: 12s;
          }
          .animate-gradient-float {
            animation-duration: 8s;
          }
          .animate-card-float {
            animation-duration: 6s;
          }
          .animate-text-box-appear {
            animation-duration: 0.6s;
          }
          .animate-text-fade-in {
            animation-duration: 0.4s;
          }
        }
      `}</style>
    </div>
  )
} 


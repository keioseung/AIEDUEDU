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

  // 통계 아이콘 클릭 효과
  const handleStatClick = (index: number) => {
    // 이미 클릭된 통계라면 상태 종료
    if (clickedStat === index) {
      setClickedStat(null)
      return
    }
    
    // 다른 통계 클릭 시 이전 상태 종료 후 새 상태 시작
    if (clickedStat !== null) {
      setClickedStat(null)
    }
    
    setClickedStat(index)
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
       <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-1 py-16 md:py-24">
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
          <div className="w-full max-w-5xl mb-24 md:mb-32">
           <div className="relative">
             {/* 중앙 텍스트 표시 영역 */}
             {clickedStat !== null && (
               <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                 <div className="bg-white/15 backdrop-blur-lg rounded-lg p-4 text-white text-center max-w-md shadow-lg border border-white/20 animate-slide-up">
                   <p className="font-medium leading-relaxed text-sm md:text-base">
                     {[
                       "최신 AI 트렌드와 기술 동향을 매일 업데이트하여 제공합니다.",
                       "AI 학습에 필수적인 핵심 용어들을 체계적으로 정리했습니다.",
                       "학습한 내용을 다양한 퀴즈로 점검하여 확실한 이해를 확인합니다.",
                       "개인별 학습 진행 상황을 체계적으로 추적하고 목표를 달성합니다."
                     ][clickedStat]}
                   </p>
                 </div>
               </div>
             )}
             
             {/* 4개 아이콘을 2행 2열로 배치 */}
             <div className="grid grid-cols-2 gap-8 md:gap-12 h-64 md:h-80">
               {/* 첫 번째 행 */}
               <div className="flex items-center justify-center">
                 <div
                   className="text-center animate-stat-fade-in cursor-pointer transition-all duration-300 hover:scale-110 relative z-10"
                   style={{ animationDelay: '0s' }}
                   onClick={() => handleStatClick(0)}
                 >
                   {/* Click effects */}
                   {clickedStat === 0 && (
                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-stat-aura" />
                   )}
                   {clickedStat === 0 && [...Array(8)].map((_, i) => (
                     <div
                       key={i}
                       className="absolute w-1 h-1 bg-white/60 rounded-full animate-stat-particle"
                       style={{
                         left: '50%',
                         top: '50%',
                         transform: 'translate(-50%, -50%)',
                         '--angle': `${i * 45}deg`,
                         '--distance': '20px'
                       } as React.CSSProperties}
                     />
                   ))}
                   {clickedStat === 0 && (
                     <div className="absolute inset-0 rounded-full bg-white/10 animate-stat-shine" />
                   )}
                   {clickedStat === 0 && (
                     <div className="absolute inset-0 rounded-full border-2 border-transparent animate-stat-border-glow" />
                   )}
                   
                   {/* Icon */}
                   <div className={`relative z-10 transition-all duration-300 ${
                     clickedStat === 0 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center ${
                       clickedStat === 0 ? 'animate-stat-glow' : ''
                     }`}>
                       <FaBrain className="text-purple-300 text-lg md:text-xl" />
                     </div>
                   </div>
                   
                   {/* Text */}
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">
                       매일 새로운
                     </div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">
                       AI 정보
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center justify-center">
                 <div
                   className="text-center animate-stat-fade-in cursor-pointer transition-all duration-300 hover:scale-110 relative z-10"
                   style={{ animationDelay: '0.3s' }}
                   onClick={() => handleStatClick(1)}
                 >
                   {/* Click effects */}
                   {clickedStat === 1 && (
                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-stat-aura" />
                   )}
                   {clickedStat === 1 && [...Array(8)].map((_, i) => (
                     <div
                       key={i}
                       className="absolute w-1 h-1 bg-white/60 rounded-full animate-stat-particle"
                       style={{
                         left: '50%',
                         top: '50%',
                         transform: 'translate(-50%, -50%)',
                         '--angle': `${i * 45}deg`,
                         '--distance': '20px'
                       } as React.CSSProperties}
                     />
                   ))}
                   {clickedStat === 1 && (
                     <div className="absolute inset-0 rounded-full bg-white/10 animate-stat-shine" />
                   )}
                   {clickedStat === 1 && (
                     <div className="absolute inset-0 rounded-full border-2 border-transparent animate-stat-border-glow" />
                   )}
                   
                   {/* Icon */}
                   <div className={`relative z-10 transition-all duration-300 ${
                     clickedStat === 1 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center ${
                       clickedStat === 1 ? 'animate-stat-glow' : ''
                     }`}>
                       <FaRocket className="text-purple-300 text-lg md:text-xl" />
                     </div>
                   </div>
                   
                   {/* Text */}
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">
                       핵심 개념
                     </div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">
                       관련 용어
                     </div>
                   </div>
                 </div>
               </div>
               
               {/* 두 번째 행 */}
               <div className="flex items-center justify-center">
                 <div
                   className="text-center animate-stat-fade-in cursor-pointer transition-all duration-300 hover:scale-110 relative z-10"
                   style={{ animationDelay: '0.6s' }}
                   onClick={() => handleStatClick(2)}
                 >
                   {/* Click effects */}
                   {clickedStat === 2 && (
                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-stat-aura" />
                   )}
                   {clickedStat === 2 && [...Array(8)].map((_, i) => (
                     <div
                       key={i}
                       className="absolute w-1 h-1 bg-white/60 rounded-full animate-stat-particle"
                       style={{
                         left: '50%',
                         top: '50%',
                         transform: 'translate(-50%, -50%)',
                         '--angle': `${i * 45}deg`,
                         '--distance': '20px'
                       } as React.CSSProperties}
                     />
                   ))}
                   {clickedStat === 2 && (
                     <div className="absolute inset-0 rounded-full bg-white/10 animate-stat-shine" />
                   )}
                   {clickedStat === 2 && (
                     <div className="absolute inset-0 rounded-full border-2 border-transparent animate-stat-border-glow" />
                   )}
                   
                   {/* Icon */}
                   <div className={`relative z-10 transition-all duration-300 ${
                     clickedStat === 2 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center ${
                       clickedStat === 2 ? 'animate-stat-glow' : ''
                     }`}>
                       <FaChartLine className="text-purple-300 text-lg md:text-xl" />
                     </div>
                   </div>
                   
                   {/* Text */}
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">
                       지식 점검
                     </div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">
                       실전 퀴즈
                     </div>
                   </div>
                 </div>
               </div>
               
               <div className="flex items-center justify-center">
                 <div
                   className="text-center animate-stat-fade-in cursor-pointer transition-all duration-300 hover:scale-110 relative z-10"
                   style={{ animationDelay: '0.9s' }}
                   onClick={() => handleStatClick(3)}
                 >
                   {/* Click effects */}
                   {clickedStat === 3 && (
                     <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-stat-aura" />
                   )}
                   {clickedStat === 3 && [...Array(8)].map((_, i) => (
                     <div
                       key={i}
                       className="absolute w-1 h-1 bg-white/60 rounded-full animate-stat-particle"
                       style={{
                         left: '50%',
                         top: '50%',
                         transform: 'translate(-50%, -50%)',
                         '--angle': `${i * 45}deg`,
                         '--distance': '20px'
                       } as React.CSSProperties}
                     />
                   ))}
                   {clickedStat === 3 && (
                     <div className="absolute inset-0 rounded-full bg-white/10 animate-stat-shine" />
                   )}
                   {clickedStat === 3 && (
                     <div className="absolute inset-0 rounded-full border-2 border-transparent animate-stat-border-glow" />
                   )}
                   
                   {/* Icon */}
                   <div className={`relative z-10 transition-all duration-300 ${
                     clickedStat === 3 ? 'mb-1 md:mb-2' : 'mb-2 md:mb-3'
                   }`}>
                     <div className={`w-8 h-8 md:w-10 md:h-10 mx-auto rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20 flex items-center justify-center ${
                       clickedStat === 3 ? 'animate-stat-glow' : ''
                     }`}>
                       <FaTrophy className="text-purple-300 text-lg md:text-xl" />
                     </div>
                   </div>
                   
                   {/* Text */}
                   <div className="relative z-10">
                     <div className="text-white/70 text-xs md:text-sm font-medium mb-1">
                       학습 현황
                     </div>
                     <div className="text-white font-bold text-sm md:text-base mb-1">
                       진행률
                     </div>
                   </div>
                 </div>
               </div>
             </div>
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
            transform: translate(-50%, -50%) scale(0) translate(var(--x, 20px), var(--y, -20px));
          }
        }
        .animate-stat-particle {
          animation: stat-particle 1.5s ease-out forwards;
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
        }
      `}</style>
    </div>
  )
} 


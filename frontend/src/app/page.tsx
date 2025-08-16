"use client"

import { useRouter } from 'next/navigation'
import { FaRobot, FaArrowRight, FaBrain, FaRocket, FaChartLine } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function IntroPage() {
  const router = useRouter()
  const [typedText, setTypedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isMobile, setIsMobile] = useState(false)
  const [clickedCard, setClickedCard] = useState<number | null>(null)
  
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-1 py-6 md:py-8">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12 md:mb-16 lg:mb-20 w-full max-w-6xl mx-auto">
          {/* 로고 및 제목 */}
          <div className="flex flex-col items-center gap-6 md:gap-8 mb-8 md:mb-12">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl animate-glow">
                <FaRobot className="text-3xl md:text-4xl lg:text-5xl text-white" />
              </div>
              <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              {/* 빛나는 효과 */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur-xl animate-pulse" />
            </div>
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl lg:text-7xl xl:text-8xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-2xl tracking-tight leading-tight mb-4 md:mb-6 animate-text-glow mobile-text text-center">
                {typedText}
                {isTyping && <span className="animate-blink">|</span>}
              </h1>
              <div className="h-8 md:h-10 lg:h-12 flex items-center justify-center">
                <p className="text-lg md:text-xl lg:text-2xl xl:text-3xl text-purple-300 font-medium mobile-text text-center max-w-3xl mx-auto leading-relaxed">
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
          <div className="text-center mb-8 md:mb-12 lg:mb-16 max-w-5xl mx-auto px-1">
            <h2 className="text-xl md:text-2xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight mobile-text text-center">
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
            <p className="text-white/70 text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto mobile-text text-center" style={{ wordBreak: 'keep-all' }}>
              최신 AI 트렌드와 핵심 개념을 체계적으로 학습하고,<br className="hidden sm:block" />
              실전 문제를 통해 확실한 이해를 확인하세요.
            </p>
          </div>

          {/* CTA 버튼 */}
          <div className="flex justify-center mb-8 md:mb-12">
            <button
              className="group px-8 md:px-12 lg:px-16 py-4 md:py-5 lg:py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white text-lg md:text-xl lg:text-2xl rounded-2xl font-bold shadow-2xl hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all flex items-center gap-3 md:gap-4 animate-fade-in hover:scale-105 active:scale-95 relative overflow-hidden animate-button-glow touch-optimized mobile-touch-target"
              onClick={() => router.push('/auth')}
            >
              <span className="relative z-10">지금 시작하기</span>
              <FaArrowRight className="group-hover:translate-x-2 transition-transform duration-200 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </button>
          </div>
        </div>

        {/* 기능 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 w-full max-w-6xl mb-16 md:mb-20 px-1">
          {[
            { 
              icon: FaBrain, 
              title: "AI 정보 학습", 
              desc: "매일 새로운 AI 정보를 제공합니다. 각 정보에는<br className='hidden sm:block' />관련 용어들이 포함되어 있어 AI 개념을<br className='hidden sm:block' />체계적으로 학습할 수 있습니다.", 
              color: "from-blue-500 to-cyan-500"
            },
            { 
              icon: FaRocket, 
              title: "용어 퀴즈", 
              desc: "학습한 AI 정보의 관련 용어들을 퀴즈로 점검합니다. 다양한 난이도의 문제로 지식 이해도를 확인하고<br className='hidden sm:block' />실력을 향상시켜보세요.", 
              color: "from-purple-500 to-pink-500"
            },
            { 
              icon: FaChartLine, 
              title: "학습 진행률", 
              desc: "개인별 학습 진행 상황을 상세한 통계로 추적합니다. 일별, 주별, 월별 학습 현황을 확인하고 목표를<br className='hidden sm:block' />설정해보세요.", 
              color: "from-green-500 to-emerald-500"
            }
          ].map((feature, index) => (
            <div
              key={index}
              className={`group bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105 hover:bg-white/10 relative overflow-hidden animate-card-float touch-optimized text-center cursor-pointer transform-gpu ${
                clickedCard === index ? 'scale-110 bg-white/20 border-white/40 shadow-2xl' : ''
              }`}
              style={{ 
                animationDelay: `${index * 0.2}s`,
                transform: clickedCard === index ? 'scale(1.1) rotate(2deg)' : 'scale(1) rotate(0deg)'
              }}
              onClick={() => toggleCard(index)}
            >
               {/* 클릭 시 고급스러운 오라 효과 */}
               {clickedCard === index && (
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-3xl animate-aura-glow" />
               )}
               
               {/* 클릭 시 그라데이션 웨이브 효과 */}
               {clickedCard === index && (
                 <div className="absolute inset-0 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 rounded-3xl animate-gradient-wave" />
               )}
               
               {/* 클릭 시 부드러운 확장 효과 */}
               {clickedCard === index && (
                 <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10 rounded-3xl animate-smooth-expand" />
               )}
               
               {/* 클릭 시 빛나는 테두리 효과 */}
               {clickedCard === index && (
                 <div className="absolute inset-0 rounded-3xl border-2 border-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-border-glow" />
               )}
               
               <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform duration-300 animate-icon-glow shadow-2xl group-hover:shadow-3xl ${
                  clickedCard === index ? 'animate-bounce-scale' : ''
                }`}>
                  <feature.icon className="text-white text-xl md:text-2xl" />
                </div>
                <h3 className={`text-white font-bold text-xl md:text-2xl mb-3 md:mb-4 mobile-text text-center ${
                  clickedCard === index ? 'animate-text-glow' : ''
                }`}>{feature.title}</h3>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed mobile-text text-center" dangerouslySetInnerHTML={{ __html: feature.desc }}></p>
                
                {/* 클릭 시 추가 정보 표시 */}
                {clickedCard === index && (
                  <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/20 animate-slide-up">
                    <p className="text-white/80 text-sm font-medium">
                      {index === 0 && "🚀 매일 새로운 AI 트렌드와 최신 정보를 제공합니다!"}
                      {index === 1 && "🎯 다양한 난이도의 퀴즈로 지식을 점검하세요!"}
                      {index === 2 && "📊 상세한 통계로 학습 진행 상황을 추적하세요!"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 하단 통계 */}
        <div className="grid grid-cols-3 gap-4 md:gap-8 lg:gap-12 w-full max-w-5xl px-4">
          {[
            { label: "매일 새로운", value: "AI 정보", icon: FaBrain },
            { label: "핵심 개념", value: "관련 용어", icon: FaRocket },
            { label: "지식 점검", value: "실전 퀴즈", icon: FaChartLine }
          ].map((stat, index) => (
            <div key={index} className="text-center animate-stat-fade-in" style={{ animationDelay: `${index * 0.3}s` }}>
              <div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-2 md:mb-3 animate-stat-glow">
                <stat.icon className="text-purple-400 text-lg md:text-xl lg:text-2xl" />
              </div>
              <div className="text-lg md:text-xl lg:text-2xl font-bold text-white mb-1 mobile-text text-center">{stat.value}</div>
              <div className="text-white/60 text-xs md:text-sm mobile-text text-center">{stat.label}</div>
            </div>
          ))}
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


"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaRobot, FaUser, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaStar } from 'react-icons/fa'
import { User } from '@/types'
import { authAPI } from '@/lib/api'

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'user'>('user')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isTabTransitioning, setIsTabTransitioning] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 마우스 위치 추적 (데스크톱에서만)
  useEffect(() => {
    if (isMobile) return
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isMobile])

  // 회원가입
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('모든 필드를 입력하세요.')
      return
    }
    
    try {
      await authAPI.register({ username, password, role })
    setError('')
    setError('')
    setTab('login')
    setUsername('')
    setPassword('')
    } catch (error: any) {
      if (error.response?.data?.detail) {
        if (error.response.data.detail === 'Username already registered') {
          setError('이미 존재하는 아이디입니다.')
        } else {
          setError(error.response.data.detail)
        }
      } else {
        setError('회원가입 중 오류가 발생했습니다.')
      }
    }
  }

  // 탭 전환 최적화 - 모바일 안정성 강화
  const handleTabChange = (newTab: 'login' | 'register') => {
    if (isTabTransitioning || tab === newTab) return
    
    setIsTabTransitioning(true)
    setError('')
    
    // 모바일에서는 즉시 전환하고 추가 지연 없음
    if (isMobile) {
      setTab(newTab)
      // 모바일에서는 즉시 전환 완료
      setTimeout(() => setIsTabTransitioning(false), 50)
    } else {
      // 데스크톱에서는 부드러운 전환
      setTimeout(() => {
        setTab(newTab)
        setIsTabTransitioning(false)
      }, 150)
    }
  }

  // 로그인
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('모든 필드를 입력하세요.')
      return
    }
    
    try {
      const result = await authAPI.login({ username, password })
      setError('')
      
      if (result.user.role === 'admin') {
        router.replace('/admin')
      } else {
        router.replace('/dashboard')
      }
    } catch (error: any) {
      if (error.response?.data?.detail) {
        if (error.response.data.detail === 'Incorrect username or password') {
          setError('아이디 또는 비밀번호가 올바르지 않습니다.')
        } else {
          setError(error.response.data.detail)
        }
      } else {
        setError('로그인 중 오류가 발생했습니다.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden auth-container">
      {/* 고급스러운 배경 효과 - 더 크게 확장 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,255,0.15),transparent_50%)]" />
      
      {/* 움직이는 그라데이션 배경 - 더 크게 확장 */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-pink-900/20 animate-gradient-shift" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-purple-900/10 animate-gradient-float" />
      
      {/* 인터랙티브 마우스 효과 - 더 크게 확장 */}
      <div 
        className="absolute w-[120%] h-[120%] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 240,
          top: mousePosition.y - 240,
          transform: 'translate(-50%, -50%)'
        }}
      />
      
      {/* 움직이는 파티클 효과 - 더 많은 파티클과 넓은 범위 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 120 - 10}%`,
              top: `${Math.random() * 120 - 10}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 빛나는 효과 - 더 크게 확장 */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[120%] h-[120%] bg-gradient-to-r from-blue-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-[140%] h-[140%] bg-gradient-to-r from-pink-500/10 to-yellow-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-32 md:py-48 lg:py-64">
        <div className="w-full max-w-sm">
          {/* 뒤로 가기 버튼 */}
          <div className="absolute top-3 left-3 md:top-4 md:left-4 z-20">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center justify-center hover:scale-110 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* 로고 및 제목 */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-xl animate-glow">
                  <FaRobot className="text-xl text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse flex items-center justify-center">
                  <FaStar className="text-xs text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent drop-shadow-xl tracking-tight leading-tight mb-1">
              AI Mastery Hub
            </h1>
            <p className="text-purple-300 text-sm font-medium">지금 시작하고 AI 세계를 탐험하세요.</p>
          </div>

          {/* 인증 카드 */}
          <div className="bg-gradient-to-br from-purple-900/60 via-purple-800/70 to-purple-900/60 backdrop-blur-2xl rounded-2xl p-6 shadow-2xl border-2 border-purple-600/60 relative overflow-hidden shadow-purple-900/50">
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              {/* 탭 메뉴 */}
              <div className="flex mb-6 bg-purple-900/40 rounded-xl p-1 border border-purple-500/30">
                <button
                  className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    tab === 'login' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  } ${isTabTransitioning ? 'pointer-events-none opacity-80' : ''}`}
                  onClick={() => handleTabChange('login')}
                  disabled={isTabTransitioning}
                >
                  로그인
                </button>
                <button
                  className={`flex-1 py-2.5 px-3 rounded-lg font-bold text-sm transition-all duration-300 ${
                    tab === 'register' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md' 
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  } ${isTabTransitioning ? 'pointer-events-none opacity-80' : ''}`}
                  onClick={() => handleTabChange('register')}
                  disabled={isTabTransitioning}
                >
                  회원가입
                </button>
              </div>

              {/* 폼 */}
              <div className={`tab-transition ${isTabTransitioning ? 'opacity-90' : 'opacity-100'}`} style={{ minHeight: '280px' }}>
                {tab === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1.5 flex items-center gap-1.5">
                      <FaUser className="text-purple-400 text-xs" />
                      아이디
                    </label>
                    <input
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full p-3 bg-purple-900/40 border-2 border-purple-500/50 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/70 transition-all text-sm min-h-[44px] input-stable"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        fontSize: '16px',
                        backgroundColor: 'rgba(88, 28, 135, 0.4)',
                        transition: 'all 0.2s ease-in-out',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        perspective: '1000px',
                        willChange: 'transform'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1.5 flex items-center gap-1.5">
                      <FaLock className="text-purple-400 text-xs" />
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm min-h-[44px] input-stable"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          fontSize: '16px',
                          transform: 'translateZ(0)',
                          backfaceVisibility: 'hidden',
                          perspective: '1000px',
                          willChange: 'transform'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>
                  {error && (
                    <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                      {error}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group hover:scale-105 active:scale-95 text-sm"
                  >
                    <span>로그인</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform text-xs" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1.5 flex items-center gap-1.5">
                      <FaUser className="text-purple-400 text-xs" />
                      아이디
                    </label>
                    <input
                      type="text"
                      placeholder="아이디를 입력하세요"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm min-h-[44px] input-stable"
                      style={{
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        WebkitTouchCallout: 'none',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        fontSize: '16px',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        transition: 'all 0.2s ease-in-out',
                        transform: 'translateZ(0)',
                        backfaceVisibility: 'hidden',
                        perspective: '1000px',
                        willChange: 'transform'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-white/80 text-xs font-medium mb-1.5 flex items-center gap-1.5">
                      <FaLock className="text-purple-400 text-xs" />
                      비밀번호
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="비밀번호를 입력하세요"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-3 pr-10 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all text-sm min-h-[44px] input-stable"
                        style={{
                          WebkitAppearance: 'none',
                          MozAppearance: 'none',
                          appearance: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          WebkitTouchCallout: 'none',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          fontSize: '16px',
                          transform: 'translateZ(0)',
                          backfaceVisibility: 'hidden',
                          perspective: '1000px',
                          willChange: 'transform'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                      >
                        {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-400 text-xs text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
                      {error}
                    </div>
                  )}
                  <button 
                    type="submit" 
                    className="w-full py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg font-bold shadow-lg hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group hover:scale-105 active:scale-95 text-sm"
                  >
                    <span>회원가입</span>
                    <FaArrowRight className="group-hover:translate-x-1 transition-transform text-xs" />
                  </button>
                </form>
              )}
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
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.3); }
          50% { box-shadow: 0 0 40px rgba(147, 51, 234, 0.6); }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        
        /* 모바일 최적화 스타일 */
        @media (max-width: 768px) {
          input[type="text"], input[type="password"] {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            font-size: 16px !important;
            transform: translateZ(0);
            backface-visibility: hidden;
            perspective: 1000px;
          }
          
          /* 모바일에서 포커스 시 레이아웃 안정화 */
          input[type="text"]:focus, input[type="password"]:focus {
            transform: translateZ(0);
            outline: none;
            -webkit-appearance: none;
            border-radius: 8px;
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(147, 51, 234, 0.5) !important;
          }
          
          /* 모바일 터치 최적화 */
          * {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: 'none';
          }
          
                  /* 모바일에서 탭 전환 시 레이아웃 안정화 */
        .tab-transition {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
          will-change: transform;
          transition: opacity 0.1s ease-out;
        }
        
        /* 모바일에서 애니메이션 최적화 */
        .animate-gradient-shift,
        .animate-gradient-float,
        .animate-float {
          animation-duration: 8s;
          animation-timing-function: ease-out;
        }
        
        /* 모바일에서 파티클 효과 최적화 */
        .particle-optimized {
          transform: translateZ(0);
          will-change: transform;
        }
        
        /* 모바일에서 탭 전환 시 깜박임 방지 */
        .tab-transition * {
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        /* 모바일에서 배경 안정화 */
        .tab-transition {
          background: transparent !important;
          background-color: transparent !important;
        }
        
        /* 모바일에서 폼 전환 시 레이아웃 고정 */
        .tab-transition form {
          position: relative;
          z-index: 1;
        }
        }
        
        /* 포커스 시 검정색 방지 */
        input[type="text"]:focus, input[type="password"]:focus {
          background-color: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(147, 51, 234, 0.5) !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(147, 51, 234, 0.5) !important;
        }
        
        /* 입력 필드 배경 안정화 */
        input[type="text"], input[type="password"] {
          background-color: rgba(255, 255, 255, 0.1) !important;
          transition: all 0.2s ease-in-out !important;
        }
        
        /* 포커스 시 애니메이션 최적화 */
        input[type="text"]:focus, input[type="password"]:focus {
          transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out !important;
        }
        
        /* 모바일에서 전체 페이지 안정화 */
        @media (max-width: 768px) {
          body {
            -webkit-overflow-scrolling: touch;
            overflow-scrolling: touch;
            position: fixed;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          /* 모바일에서 탭 전환 시 깜박임 완전 방지 */
          .tab-transition {
            opacity: 1 !important;
            visibility: visible !important;
            display: block !important;
          }
          
          /* 모바일에서 배경 효과 최소화 */
          .animate-gradient-shift,
          .animate-gradient-float {
            animation: none;
          }
          
          /* 모바일에서 파티클 효과 최소화 */
          .animate-float {
            animation: none;
            opacity: 0.3;
          }
          
          /* 모바일에서 입력 필드 클릭 시 스크롤 방지 */
          input:focus {
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
            position: relative !important;
            z-index: 1000 !important;
          }
          
          /* 모바일에서 뷰포트 안정화 */
          .auth-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
        }
        
        /* 입력 필드 안정화 강화 */
        .input-stable {
          transform: translateZ(0) !important;
          backface-visibility: hidden !important;
          perspective: 1000px !important;
          will-change: transform !important;
          -webkit-transform: translateZ(0) !important;
          -webkit-backface-visibility: hidden !important;
          -webkit-perspective: 1000px !important;
        }
        
        /* 입력 필드 포커스 시 안정화 */
        .input-stable:focus {
          transform: translateZ(0) !important;
          -webkit-transform: translateZ(0) !important;
          outline: none !important;
          -webkit-outline: none !important;
        }
        
        /* 입력 필드 스크롤 시 안정화 */
        .input-stable {
          -webkit-overflow-scrolling: touch !important;
          overflow-scrolling: touch !important;
        }
        
        /* 모바일에서 입력 필드 터치 최적화 */
        @media (max-width: 768px) {
          .input-stable {
            -webkit-tap-highlight-color: transparent !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
            font-size: 16px !important;
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
          }
          
          .input-stable:focus {
            transform: translateZ(0) !important;
            -webkit-transform: translateZ(0) !important;
            background-color: rgba(255, 255, 255, 0.1) !important;
            border-color: rgba(147, 51, 234, 0.5) !important;
          }
        }
      `}</style>
    </div>
  )
} 
'use client'

import { useEffect } from 'react'

// Background Sync API 타입 확장
interface ServiceWorkerRegistration {
  sync: {
    register(tag: string): Promise<void>;
  };
}

declare global {
  interface ServiceWorkerRegistration {
    sync: {
      register(tag: string): Promise<void>;
    };
  }
}

export default function PWARegister() {
  useEffect(() => {
    // PWA 서비스 워커 등록
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // PWA 설치 프롬프트 처리
    let deferredPrompt: any;
    
    window.addEventListener('beforeinstallprompt', (e) => {
      // 기본 설치 프롬프트 방지
      e.preventDefault();
      // 나중에 사용하기 위해 이벤트 저장
      deferredPrompt = e;
      
      // 설치 버튼 표시 로직 (필요시 구현)
      console.log('PWA install prompt available');
    });

    // PWA 설치 완료 이벤트
    window.addEventListener('appinstalled', (evt) => {
      console.log('PWA was installed');
      // 설치 완료 후 처리
    });

    // Android 15 호환성을 위한 백그라운드 동기화 등록
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      navigator.serviceWorker.ready.then((registration) => {
        // 백그라운드 동기화 등록
        (registration as any).sync.register('background-sync')
          .then(() => {
            console.log('Background sync registered');
          })
          .catch((error) => {
            console.log('Background sync registration failed:', error);
          });
      });
    }

    // 푸시 알림 권한 요청
    const requestNotificationPermission = async () => {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      }
    };

    // 사용자 상호작용 시 알림 권한 요청
    const handleUserInteraction = () => {
      requestNotificationPermission();
      document.removeEventListener('click', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
    };
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}

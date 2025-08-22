export type Language = 'ko' | 'en' | 'ja' | 'zh'

export interface Translations {
  ko: Record<string, string>
  en: Record<string, string>
  ja: Record<string, string>
  zh: Record<string, string>
}

// 한국어 (기본 언어)
const ko: Record<string, string> = {
  // 메인 페이지
  'app.title': 'AI Mastery Hub',
  'app.tagline.1': '매일 새로운 AI 정보로 지식을 쌓아보세요.',
  'app.tagline.2': '실전 퀴즈로 학습한 내용을 점검하세요.',
  'app.tagline.3': '개인별 학습 진행률을 체계적으로 관리하세요.',
  'app.tagline.4': 'AI 세계의 핵심 개념을 쉽게 이해하세요.',
  'app.feature.ai.info': '매일 업데이트되는 AI 정보',
  'app.feature.terms': '관련 용어를 학습',
  'app.feature.quiz': '실전 퀴즈로 지식을 점검',
  'app.start.button': '지금 시작하기',
  'app.stats.ai.info.label': '매일 새로운',
  'app.stats.ai.info.section.title': 'AI 정보',
  'app.stats.quiz.label': '실전 퀴즈로',
  'app.stats.quiz.title': '지식 점검',
  'app.stats.progress.label': '개인별',
  'app.stats.progress.title': '학습 진행률',
  'app.stats.terms.label': 'AI 용어',
  'app.stats.terms.title': '체계 학습',
  
  // 웰컴페이지 아이콘 설명
  'welcome.ai.info.description': '매일 새로운 AI 정보로 지식을 쌓아보세요. 최신 AI 트렌드와 기술 동향을 파악하고, 실무에 바로 적용할 수 있는 인사이트를 얻을 수 있습니다.',
  'welcome.quiz.description': '실전 퀴즈로 학습한 내용을 점검하세요. 다양한 난이도의 문제를 통해 AI 지식을 체계적으로 정리하고, 취약한 부분을 보완할 수 있습니다.',
  'welcome.progress.description': '개인별 학습 진행률을 체계적으로 관리하세요. 학습 현황을 한눈에 파악하고, 목표 달성을 위한 맞춤형 학습 계획을 세울 수 있습니다.',
  'welcome.terms.description': 'AI 세계의 핵심 개념을 쉽게 이해하세요. 복잡한 AI 용어들을 체계적으로 정리하고, 실무에서 활용할 수 있는 지식을 쌓을 수 있습니다.',
  
  // 웰컴페이지 아이콘 클릭 시 텍스트 상자
  'welcome.ai.info.click.description': '최신 AI 트렌드와\n기술 동향을 매일 업데이트하여 제공합니다.',
  'welcome.terms.click.description': 'AI 학습에 필수적인\n핵심 용어들을 체계적으로 정리했습니다.',
  'welcome.quiz.click.description': '학습한 내용을 다양한\n퀴즈로 점검하여 확실한 이해를 확인합니다.',
  'welcome.progress.click.description': '개인별 학습 진행 상황을\n체계적으로 추적하고 목표를 달성합니다.',
  
  // 네비게이션
  'nav.dashboard': '대시보드',
  'nav.ai.info': 'AI 정보',
  'nav.quiz': '퀴즈',
  'nav.progress': '진행률',
      'nav.terms': '모든 용어',
  'nav.admin': '관리자',
  'nav.logout': '로그아웃',
  
  // 대시보드
  'dashboard.title': '대시보드',
  'dashboard.welcome': 'AI Mastery Hub에 오신 것을 환영합니다!',
  'dashboard.today': '오늘',
  'dashboard.weekly': '주간',
  'dashboard.monthly': '월간',
  'dashboard.total': '전체',
  'dashboard.ai': 'AI',
  'dashboard.terms': '용어',
  'dashboard.quiz': '퀴즈',
  'dashboard.tab.ai.description': 'AI 정보 학습',
  'dashboard.tab.quiz.description': '용어 퀴즈 풀기',
  'dashboard.tab.progress.description': '학습 진행 상황',
      'dashboard.tab.terms.description': '시스템 등록 모든 용어',
  'dashboard.welcome.message.1': '오늘도 AI 학습을 시작해보세요! 🚀',
  'dashboard.welcome.message.2': '새로운 지식이 여러분을 기다리고 있어요! 💡',
  'dashboard.welcome.message.3': '함께 성장하는 AI 여정을 떠나볼까요? 🌟',
  
  // AI 정보
  'ai.info.section.title': 'AI 정보',
  'ai.info.daily': '일일 AI 정보',
  'ai.info.category.view': '카테고리별',
  'ai.info.list': '목록 보기',
  'ai.info.favorite': '즐겨찾기',
  'ai.info.search': '검색',
  'ai.info.filter': '필터',
  'ai.info.sort': '정렬',
  'ai.info.date': '날짜',
  'ai.info.field.title': '제목',
  'ai.info.content': '내용',
  'ai.info.terms': '용어',
  'ai.info.category': '카테고리',
  'ai.info.subcategory': '하위 카테고리',
  
  // AI 정보 목록 모드 UI
  'ai.info.list.mode.title': 'AI 정보 목록',
  'ai.info.list.total.count': '총 {count}개 정보',
  'ai.info.list.search.placeholder': '제목, 내용, 용어로 검색...',
  'ai.info.search.placeholder': 'AI 정보 검색...',
  
  // 카테고리 헤더 문구
  'category.header.total.infos': '총 {count}개 정보',
  'category.header.updated.days': '{days}일간 업데이트',
  
  // AI 정보 모드
  'ai.info.mode.date': '날짜별',
  'ai.info.mode.category': '카테고리별',
  'ai.info.mode.full': '전체목록',
  'ai.info.sort.options': '정렬 옵션',
  
  // AI 정보 없음 메시지
  'ai.info.no.data.title': 'AI 정보가 없습니다',
  'ai.info.no.data.description': '아직 등록된 AI 정보가 없습니다.\n관리자가 AI 정보를 등록한 후 이용해주세요!',
  'ai.info.no.data.waiting': '새로운 AI 정보를 기다리고 있습니다',
  'ai.info.no.data.admin': '등록된 AI 정보가 없습니다.',
  'ai.info.no.data.search': '검색 조건에 맞는 AI 정보가 없습니다.',
  'ai.info.loading': 'AI 정보를 불러오는 중...',
  'ai.info.items.per.page.select': '항목 수 선택',
  
  // AI 정보 정렬 옵션
  'ai.info.sort.by.date': '날짜순',
  'ai.info.sort.by.title': '제목순',
  'ai.info.sort.by.category': '카테고리순',
  'ai.info.sort.by.favorite': '즐겨찾기순',
  
  // AI 정보 정렬 옵션 상세 설명
  'ai.info.sort.by.date.description': '날짜순 정렬',
  'ai.info.sort.by.title.description': '제목순 정렬',
  'ai.info.sort.by.length.description': '내용 길이순 정렬',
  
  // AI 정보 항목 수 옵션
  'ai.info.items.5': '5개',
  'ai.info.items.10': '10개',
  'ai.info.items.30': '30개',
  'ai.info.items.50': '50개',
  
  // AI 정보 항목 수 옵션 상세 설명
  'ai.info.items.per.page.display': '페이지당 {count}개 표시',
  
  // AI 정보 목록 제목
  'ai.info.list.title': 'AI 정보 목록',
  
  // AI 정보 카드 UI
  'ai.info.card.learning.complete': '학습 완료',
  'ai.info.card.learning.required': '학습 필요',
  'ai.info.card.terms.learning': '용어 학습',
  'ai.info.card.terms.learning.hide': '용어 학습 숨기기',
  'ai.info.card.terms.learning.show': '관련 용어 학습하기',
  'ai.info.card.terms.hide': '숨기기',
  'ai.info.card.terms.learning.short': '용어 학습',
  'ai.info.card.terms.complete.count': '개 완료',
  'ai.info.card.terms.learning.complete.count': '개 학습완료',
  'ai.info.card.terms.swipe.guide': '← 스와이프하여 용어 이동 →',
  'ai.info.card.terms.previous': '이전',
  'ai.info.card.terms.next': '다음',
  'ai.info.card.terms.all.complete': '🎉 모든 용어 학습 완료!',
  'ai.info.card.learning.button': '학습완료',
  'ai.info.card.learning.button.short': '학습',
  'ai.info.card.complete.button': '완료',
  'ai.info.card.learning.complete.notification': '🎉 학습 완료!',
  'ai.info.card.achievement.notification': '🎉 성취 달성!',
  'ai.info.card.new.achievement': '새로운 성취를 획득했습니다!',
  'ai.info.card.expand': '더보기',
  'ai.info.card.collapse': '접기',
  
  // 날짜 계산기
  'date.calculator.today': '오늘',
  'date.calculator.calendar': '달력',
  
  // 카테고리 모드
  'category.mode.select': '카테고리 목록',
  'category.mode.loading': '잠시만 기다려 주세요.',
  'category.mode.count': '개',
  
  // 카테고리 이름 (표시 문자열 기준)
  'category.name.이미지 생성 AI': '이미지 생성 AI',
  'category.name.챗봇/대화형 AI': '챗봇/대화형 AI',
  'category.name.자연어 처리 AI': '자연어 처리 AI',
  'category.name.음성 인식/합성 AI': '음성 인식/합성 AI',
  'category.name.AI 응용 서비스': 'AI 응용 서비스',
  'category.name.AI 보안/윤리': 'AI 보안/윤리',
  'category.name.AI 개발 도구': 'AI 개발 도구',
  'category.name.AI 창작 도구': 'AI 창작 도구',
  'category.name.코딩/개발 도구': '코딩/개발 도구',
  'category.name.음성/오디오 AI': '음성/오디오 AI',
  'category.name.데이터 분석/ML': '데이터 분석/ML',
  'category.name.AI 윤리/정책': 'AI 윤리/정책',
  'category.name.AI 하드웨어/인프라': 'AI 하드웨어/인프라',
  
  // AI 카테고리 이름
  'category.image.generation': '이미지 생성 AI',
  'category.chatbot.conversational': '챗봇/대화형 AI',
  'category.text.generation': '텍스트 생성 AI',
  'category.code.generation': '코드 생성 AI',
  'category.audio.generation': '오디오 생성 AI',
  'category.video.generation': '비디오 생성 AI',
  'category.data.analysis': '데이터 분석 AI',
  'category.automation': '자동화 AI',
  
  // 퀴즈 주제
  'quiz.topic.selector': '주제선택',
  'quiz.random': '랜덤',
  'quiz.topic.today': '오늘의 주제',
  'quiz.topic.selected': '선택된 주제',
  'quiz.section.title': '퀴즈 도전',
  'quiz.topic.selection': '주제 선택',
  'quiz.score': '점수',
  'quiz.submit.answer': '답안 제출',
  'quiz.next.question': '다음 문제',
  'quiz.restart': '다시 시작',
  'quiz.complete': '퀴즈 완료!',
  'quiz.final.score': '최종 점수',
  'quiz.score.saved': '점수가 저장되었습니다! 🎉',
  'quiz.correct': '정답입니다! 🎉',
  'quiz.incorrect': '틀렸습니다 😅',
  'quiz.no.quizzes': '선택한 주제에 대한 퀴즈가 없습니다.',
  
  // 퀴즈 질문과 선택지
  'quiz.question.meaning': '의 의미로 가장 적절한 것은?',
  'quiz.question.wrong.note': '오답 노트',
  'quiz.message.no.wrong.notes': '오답 노트에 등록된 문제가 없습니다.',
  'quiz.message.wrong.notes.loaded': '오답 노트에서 {count}개 문제를 가져왔습니다.',
  'quiz.message.no.terms.selected': '선택된 주제에 등록된 용어가 없습니다.',
  'quiz.option.unrelated': '과 관련이 없는 설명입니다.',
  'quiz.explanation.correct.meaning': '의 정확한 의미는:',
  
  // 로딩 메시지
  'loading.please.wait': '잠시만 기다려 주세요.',
  
  // 퀴즈
  'quiz.title': '퀴즈',
  'quiz.start': '퀴즈 시작',
  'quiz.question': '문제',
  'quiz.answer': '답변',
  'quiz.explanation': '설명',
  'quiz.retry': '다시 시도',
  'quiz.next': '다음',
  'quiz.previous': '이전',
  'quiz.finish': '마치기',
  'quiz.wrong.notes': '오답 노트',
  'quiz.achievement': '성취',
  
  // 진행률
  'progress.title': '학습 진행률',
  'progress.overall': '전체 진행률',
  'progress.ai.info': 'AI 정보 학습',
  'progress.terms': '용어 학습',
  'progress.quiz': '퀴즈 점수',
  'progress.streak': '연속 학습',
  'progress.today': '오늘',
  'progress.week': '이번 주',
  'progress.month': '이번 달',
  'progress.year': '올해',
  
  // 진행률 모드
  'progress.mode.trend.card': '학습 추이 카드',
  'progress.mode.trend.graph': '학습 추이 그래프',
  
  // 진행률 기간 선택
  'progress.period.weekly': '주간',
  'progress.period.monthly': '월간',
  'progress.period.custom': '사용자정의',
  'progress.period.settings': '사용자 정의 기간 설정',
  
  // 진행률 카드 내용
  'progress.ai.info.learning': 'AI 정보 학습',
  'progress.ai.info.today.count': '오늘 학습 수',
  'progress.ai.info.daily.total': '일별 총 정보 수',
  'progress.ai.info.accumulated.total': '누적 총 학습 수',
  'progress.terms.learning.count': '학습 수',
  'progress.quiz.daily.accuracy': '일일 정답률',
  'progress.quiz.daily.accumulated': '일일 누적',
  'progress.quiz.accuracy': '일일 정답률',
  'progress.quiz.accumulated.score': '일일 누적',
  
  // 용어학습
  'terms.title': '용어 학습',
  'terms.learned': '학습 완료',
  'terms.favorite': '즐겨찾기',
  'terms.search': '검색',
  'terms.sort': '정렬',
  'terms.filter': '필터',
  'terms.export': '내보내기',
  'terms.import': '가져오기',
  'terms.auto.play': '자동 재생',
  'terms.speed': '속도',
  'terms.shuffle': '섞기',
  
  // 용어학습 필터/목록
  'terms.filter.button': '필터',
  'terms.list.button': '목록',
  'terms.search.placeholder': '용어나 설명으로 검색...',
  'terms.display.terms': '표시된 용어',
  'terms.favorites': '즐겨찾기',
  'terms.learning.progress': '학습진행률',
  'terms.learning.complete': '학습완료',
  
  // 용어학습 필터/목록 메뉴
  'terms.filter.menu.title': '필터 옵션',
  'terms.filter.menu.category': '카테고리별',
  'terms.filter.menu.difficulty': '난이도별',
  'terms.filter.menu.status': '상태별',
  'terms.list.menu.title': '목록 옵션',
  'terms.list.menu.sort.by': '정렬 기준',
  'terms.list.menu.sort.order': '정렬 순서',
  'terms.list.menu.view.mode': '보기 모드',
  
  // 관리자
  'admin.title': '관리자 대시보드',
  'admin.welcome': 'AI Mastery Hub를 관리하세요!',
  'admin.ai.info.manage': 'AI 정보 관리',
  'admin.user.manage': '회원 관리',
  'admin.system.manage': '시스템 관리',
  'admin.stats': '사용자 통계',
  'admin.logs': '로그 관리',
  'admin.quiz.manage': '퀴즈 관리',
  'admin.prompt.manage': '프롬프트 관리',
  
  // 공통
  'common.loading': '로딩 중...',
  'common.error': '오류가 발생했습니다',
  'common.success': '성공',
  'common.cancel': '취소',
  'common.confirm': '확인',
  'common.save': '저장',
  'common.edit': '수정',
  'common.delete': '삭제',
  'common.add': '추가',
  'common.search': '검색',
  'common.filter': '필터',
  'common.sort': '정렬',
  'common.refresh': '새로고침',
  'common.back': '뒤로',
  'common.next': '다음',
  'common.previous': '이전',
  'common.close': '닫기',
  'common.yes': '예',
  'common.no': '아니오',
  'common.ok': '확인',
  'common.day.mon': '월',
  'common.day.tue': '화',
  'common.day.wed': '수',
  'common.day.thu': '목',
  'common.day.fri': '금',
  'common.day.sat': '토',
  'common.day.sun': '일',
  
  // 인증
  'auth.title': 'AI Mastery Hub',
  'auth.subtitle': '지금 시작하고 AI 세계를 탐험하세요.',
  'auth.login': '로그인',
  'auth.register': '회원가입',
  'auth.username': '아이디',
  'auth.username.placeholder': '아이디를 입력하세요',
  'auth.password': '비밀번호',
  'auth.password.placeholder': '비밀번호를 입력하세요',
  'auth.login.button': '로그인',
  'auth.register.button': '회원가입',
  'auth.error.all.fields': '모든 필드를 입력하세요.',
  'auth.error.username.exists': '이미 존재하는 아이디입니다.',
  'auth.error.login.failed': '로그인 중 오류가 발생했습니다.',
  'auth.error.register.failed': '회원가입 중 오류가 발생했습니다.',
  'auth.error.incorrect.credentials': '아이디 또는 비밀번호가 올바르지 않습니다.',
  'auth.back': '뒤로 가기',
  
  // 언어 선택
  'language.ko': '한국어',
  'language.en': 'English',
  'language.ja': '日本語',
  'language.zh': '中文',
  'language.select': '언어 선택',
  
  // 퀴즈 탭 UI 요소
  'quiz.tab.topic.selector': '주제 선택',
  'quiz.tab.random': '랜덤',
  'quiz.tab.selected.topic': '선택된 주제',
  'quiz.tab.today.topic': '오늘의 주제',
  'quiz.tab.wrong.notes': '오답 노트',
  'quiz.tab.no.terms.message': '등록된 용어가 없습니다',
  'quiz.tab.no.terms.selected.message': '선택된 주제에 용어가 없습니다',
  'quiz.tab.no.wrong.notes.message': '오답 노트에 등록된 문제가 없습니다. 퀴즈를 풀면서 틀린 문제를 오답 노트에 등록해보세요!',
  'quiz.tab.no.terms.date.message': '{date} 날짜에 등록된 용어가 없습니다. 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!',
  'quiz.tab.no.terms.topic.message': '"{topic}" 주제에 등록된 용어가 없습니다. 다른 주제를 선택하거나 관리자가 용어를 등록한 후 퀴즈를 풀어보세요!',
  'quiz.tab.wrong.notes.mode': '오답 노트 모드',
  'quiz.tab.selected.date': '선택한 날짜: {date}',
  'quiz.tab.selected.topic.info': '선택한 주제: {topic}',
  
  // 진행률 탭 모드명
  'progress.tab.trend.card': '학습 추이 카드',
  'progress.tab.trend.graph': '학습 추이 그래프',
  
  // 진행률 탭 카드 내용
  'progress.card.ai.info.learning': 'AI 정보 학습',
  'progress.card.today.learning.count': '오늘 학습 수',
  'progress.card.daily.total.info': '일별 총 정보 수',
  'progress.card.accumulated.total.learning': '누적 총 학습 수',
  'progress.card.terms.learning.count': '용어 학습',
  'progress.card.terms.learning': '용어학습',
  'progress.card.learning.count': '학습 수',
  'progress.card.quiz.score': '퀴즈 점수',
  'progress.card.daily.accuracy': '일일 정답률',
  'progress.card.daily.accumulated': '일일 누적',
  'progress.card.accuracy': '정답률',
  'progress.card.accumulated.score': '누적 점수',
  'progress.card.terms.daily.total': '일별 총 용어 수',
  'progress.card.terms.accumulated.total': '누적 총 용어 수',
  
  // 진행률 그래프 카드 통계
  'progress.graph.card.average': '평균',
  'progress.graph.card.max': '최대',
  'progress.graph.card.items': '개',
  'progress.graph.y.axis.0': '0개',
  'progress.graph.y.axis.1': '1개',
  'progress.graph.y.axis.2': '2개',
  
  // 진행률 그래프 메시지
  'progress.graph.no.data': '선택한 기간에 학습 데이터가 없습니다.',
  
  // 진행률 기간 변경 로딩
  'progress.period.change.loading': '잠시만 기다려 주세요.',
  
  // 진행률 사용자 정의 기간 설정
  'progress.custom.period.start.date': '시작일',
  'progress.custom.period.end.date': '종료일',
  'progress.custom.period.select.dates': '시작일과 종료일을 선택해주세요',
  
  // 진행률 날짜 포맷
  'progress.date.format.month': '월',
  'progress.date.format.day': '일',
  
  // 퀴즈 탭 추가 UI 요소
  'quiz.tab.select.topic': '주제 선택',
  'quiz.tab.no.topics.available': '사용 가능한 주제가 없습니다',
  'quiz.tab.wrong.note.added': '오답 노트에 등록되었습니다!',
  'quiz.tab.next.question': '다음 문제',
  'quiz.tab.complete.quiz': '퀴즈 완료하기',
  'quiz.tab.remove.from.wrong.notes': '오답 노트에서 삭제',
  'quiz.tab.remove': '삭제',
  'quiz.tab.add.to.wrong.notes': '오답 노트 등록',
  'quiz.tab.add.wrong.note': '오답 등록',
  'quiz.tab.quiz.completed': '퀴즈 완료!',
  'quiz.tab.try.again': '다시 도전',
  'quiz.tab.re.try': '재도전',
  'quiz.tab.score.saved': '성적이 저장되었습니다!',
  'quiz.tab.achievement.achieved': '🎉 성취 달성!',
  'quiz.tab.new.achievement': '새로운 성취를 획득했습니다!',
  
  // 용어학습 탭 추가 UI 요소
  'terms.tab.no.terms.message': '학습한 용어가 없습니다',
  'terms.tab.no.terms.description': 'AI 정보를 학습하고 용어를 등록한 후 여기서 확인해보세요!',
  'terms.tab.total.available.terms': '총 학습 가능한 용어: {count}개',
  
  // 용어학습 탭 필터 UI 요소
  'terms.tab.filter.date.filter': '날짜별 필터',
  'terms.tab.filter.all': '전체',
  'terms.tab.filter.sort': '정렬',
  'terms.tab.filter.sort.options': '정렬 옵션',
  'terms.tab.filter.sort.by.date': '🕒 최신순',
  'terms.tab.filter.sort.by.date.description': '날짜순 정렬',
  'terms.tab.filter.sort.by.alphabet': '🔤 가나다순',
  'terms.tab.filter.sort.by.alphabet.description': '알파벳순 정렬',
  'terms.tab.filter.sort.by.length': '📏 길이순',
  'terms.tab.filter.sort.by.length.description': '용어 길이순 정렬',
  'terms.tab.filter.favorites': '즐겨찾기',
  'terms.tab.filter.random': '랜덤',
  'terms.tab.filter.export': '내보내기',
  'terms.tab.filter.total.terms': '전체 용어 목록 ({count}개)',
  
  // 용어학습 탭 하단 통계 카드
  'terms.tab.stats.displayed.terms': '표시된 용어',
  'terms.tab.stats.favorites': '즐겨찾기',
  'terms.tab.stats.learning.progress': '학습진행률',
  'terms.tab.stats.learning.completed': '학습완료',
  
  // 용어학습 탭 단어 카드
  'terms.card.learning.completed.count': '{count}개 학습완료',
  'terms.card.learning.date': '학습일',
  'terms.card.swipe.guide': '← 스와이프하여 다음/이전 용어 보기 →',
  'terms.card.difficulty.beginner': '초급',
  'terms.card.difficulty.intermediate': '중급',
  'terms.card.difficulty.advanced': '고급',
  'terms.card.playing': '재생중',
  'terms.card.auto.play': '자동재생',
  'terms.card.stop': '정지',
  
  // 용어학습 탭 목록 모드
  'terms.list.difficulty': '난이도',
  'terms.list.scroll.lock': '스크롤 고정(1초이상클릭)',
  
  // 용어학습 탭 로딩 페이지
  'terms.tab.loading': '잠시만 기다려 주세요.',
  
  // 용어학습 탭 재생 속도 설정
  'terms.playback.speed': '재생 속도',
  'terms.playback.speed.1s': '1초',
  'terms.playback.speed.2s': '2초',
  'terms.playback.speed.3s': '3초',
  'terms.playback.speed.5s': '5초',
  'terms.playback.speed.7s': '7초',
  'terms.playback.speed.10s': '10초',
  
  // 용어학습 탭 목록 카드
  'terms.list.card.current': '현재',
  
  // 용어학습 탭 날짜 필터
  'terms.date.filter.year': '년',
  'terms.date.filter.month': '월',
  'terms.date.filter.day': '일',
  'terms.date.filter.items.count': '{count}개',
}

// 영어
const en: Record<string, string> = {
  // Main page
  'app.title': 'AI Mastery Hub',
  'app.tagline.1': 'Build knowledge with new AI information every day.',
  'app.tagline.2': 'Check your learning with practical quizzes.',
  'app.tagline.3': 'Systematically manage your personal learning progress.',
  'app.tagline.4': 'Easily understand core concepts of the AI world.',
  'app.feature.ai.info': 'Daily updated AI information',
  'app.feature.terms': 'Learn related terms',
  'app.feature.quiz': 'Check knowledge with practical quizzes',
  'app.start.button': 'Start Now',
  'app.stats.ai.info.label': 'Daily New',
  'app.stats.ai.info.section.title': 'AI Info',
  'app.stats.quiz.label': 'Practical',
  'app.stats.quiz.title': 'Quiz Check',
  'app.stats.progress.label': 'Personal',
  'app.stats.progress.title': 'Progress',
  'app.stats.terms.label': 'AI Terms',
  'app.stats.terms.title': 'Systematic',
  
  // Welcome page icon descriptions
  'welcome.ai.info.description': 'Build knowledge with new AI information every day. Stay updated with the latest AI trends and technology developments, and gain insights that can be immediately applied to your work.',
  'welcome.quiz.description': 'Check your learning with practical quizzes. Organize your AI knowledge systematically through various difficulty levels and identify areas for improvement.',
  'welcome.progress.description': 'Systematically manage your personal learning progress. Get a comprehensive view of your learning status and create customized learning plans to achieve your goals.',
  'welcome.terms.description': 'Easily understand core concepts of the AI world. Systematically organize complex AI terms and build knowledge that can be applied in practical work.',
  
  // Welcome page icon click text box
  'welcome.ai.info.click.description': 'Provides daily updates on\nlatest AI trends and technology developments.',
  'welcome.terms.click.description': 'Systematically organized\nessential AI learning terms.',
  'welcome.quiz.click.description': 'Check your learning with various\nquizzes to ensure solid understanding.',
  'welcome.progress.click.description': 'Systematically track your\npersonal learning progress and achieve goals.',
  
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.ai.info': 'AI Info',
  'nav.quiz': 'Quiz',
  'nav.progress': 'Progress',
      'nav.terms': 'All Terms',
  'nav.admin': 'Admin',
  'nav.logout': 'Logout',
  
  // Dashboard
  'dashboard.title': 'Dashboard',
  'dashboard.welcome': 'Welcome to AI Mastery Hub!',
  'dashboard.today': 'Today',
  'dashboard.weekly': 'Weekly',
  'dashboard.monthly': 'Monthly',
  'dashboard.total': 'Total',
  'dashboard.ai': 'AI',
  'dashboard.terms': 'Terms',
  'dashboard.quiz': 'Quiz',
  'dashboard.tab.ai.description': 'AI Info Learning',
  'dashboard.tab.quiz.description': 'Take Terms Quiz',
  'dashboard.tab.progress.description': 'Learning Progress',
      'dashboard.tab.terms.description': 'All System Terms',
  'dashboard.welcome.message.1': 'Start your AI learning today! 🚀',
  'dashboard.welcome.message.2': 'New knowledge is waiting for you! 💡',
  'dashboard.welcome.message.3': 'Shall we embark on a growing AI journey together? 🌟',
  
  // AI Info
  'ai.info.section.title': 'AI Information',
  'ai.info.daily': 'Daily AI Info',
  'ai.info.category.view': 'By Category',
  'ai.info.list': 'List View',
  'ai.info.favorite': 'Favorites',
  'ai.info.search': 'Search',
  'ai.info.filter': 'Filter',
  'ai.info.sort': 'Sort',
  'ai.info.date': 'Date',
  'ai.info.field.title': 'Title',
  'ai.info.content': 'Content',
  'ai.info.terms': 'Terms',
  'ai.info.category': 'Category',
  'ai.info.subcategory': 'Subcategory',
  
  // AI 정보 없음 메시지
  'ai.info.no.data.title': 'No AI Information Available',
  'ai.info.no.data.description': 'No AI information has been registered yet.\nPlease wait for the administrator to register AI information!',
  'ai.info.no.data.waiting': 'Waiting for new AI information',
  'ai.info.no.data.admin': 'No registered AI information.',
  'ai.info.no.data.search': 'No AI information matches your search criteria.',
  'ai.info.loading': 'Loading AI information...',
  'ai.info.sort.options': 'Sort Options',
  'ai.info.items.per.page.select': 'Select Items Per Page',
  
  // AI Info Sort Options
  'ai.info.sort.by.date': 'By Date',
  'ai.info.sort.by.title': 'By Title',
  'ai.info.sort.by.category': 'By Category',
  'ai.info.sort.by.favorite': 'By Favorite',
  
  // AI Info Sort Options Detailed Descriptions
  'ai.info.sort.by.date.description': 'Sort by date',
  'ai.info.sort.by.title.description': 'Sort by title',
  'ai.info.sort.by.length.description': 'Sort by content length',
  
  // AI Info Items Count Options
  'ai.info.items.5': '5 items',
  'ai.info.items.10': '10 items',
  'ai.info.items.30': '30 items',
  'ai.info.items.50': '50 items',
  
  // AI Info Items Count Options Detailed Descriptions
  'ai.info.items.per.page.display': 'Display {count} items per page',
  
  // AI Info List Title
  'ai.info.list.title': 'AI Info List',
  
  // AI Info List Mode UI
  'ai.info.list.mode.title': 'AI Info List',
  'ai.info.list.total.count': 'Total {count} items',
  'ai.info.list.search.placeholder': 'Search by title, content, or term...',
  'ai.info.search.placeholder': 'Search AI info...',
  
  // Category header phrases
  'category.header.total.infos': 'Total {count} items',
  'category.header.updated.days': 'Updated over {days} days',
  
  // AI Info Mode
  'ai.info.mode.date': 'Date',
  'ai.info.mode.category': 'Category',
  'ai.info.mode.full': 'Full List',
  
  // AI Info Card UI
  'ai.info.card.learning.complete': 'Learning Complete',
  'ai.info.card.learning.required': 'Learning Required',
  'ai.info.card.terms.learning': 'Terms Learning',
  'ai.info.card.terms.learning.hide': 'Hide Terms Learning',
  'ai.info.card.terms.learning.show': 'Learn Related Terms',
  'ai.info.card.terms.hide': 'Hide',
  'ai.info.card.terms.learning.short': 'Terms Learning',
  'ai.info.card.terms.complete.count': ' completed',
  'ai.info.card.terms.learning.complete.count': ' learning completed',
  'ai.info.card.terms.swipe.guide': '← Swipe to navigate terms →',
  'ai.info.card.terms.previous': 'Previous',
  'ai.info.card.terms.next': 'Next',
  'ai.info.card.terms.all.complete': '🎉 All terms learning completed!',
  'ai.info.card.learning.button': 'Learning Complete',
  'ai.info.card.learning.button.short': 'Learn',
  'ai.info.card.complete.button': 'Complete',
  'ai.info.card.learning.complete.notification': '🎉 Learning Complete!',
  'ai.info.card.achievement.notification': '🎉 Achievement Achieved!',
  'ai.info.card.new.achievement': 'New achievement gained!',
  'ai.info.card.expand': 'More',
  'ai.info.card.collapse': 'Collapse',
  
  // Date Calculator
  'date.calculator.today': 'Today',
  'date.calculator.calendar': 'Calendar',
  
  // Category Mode
  'category.mode.select': 'Category List',
  'category.mode.loading': 'Please wait a moment.',
  'category.mode.count': 'items',
  
  // Category names (display string based)
  'category.name.이미지 생성 AI': 'Image Generation AI',
  'category.name.챗봇/대화형 AI': 'Chatbot/Conversational AI',
  'category.name.자연어 처리 AI': 'Natural Language Processing AI',
  'category.name.음성 인식/합성 AI': 'Speech Recognition/Synthesis AI',
  'category.name.AI 응용 서비스': 'AI Application Services',
  'category.name.AI 보안/윤리': 'AI Security/Ethics',
  'category.name.AI 개발 도구': 'AI Development Tools',
  'category.name.AI 창작 도구': 'AI Creative Tools',
  'category.name.코딩/개발 도구': 'Coding/Development Tools',
  'category.name.음성/오디오 AI': 'Voice/Audio AI',
  'category.name.데이터 분석/ML': 'Data Analysis/ML',
  'category.name.AI 윤리/정책': 'AI Ethics/Policy',
  'category.name.AI 하드웨어/인프라': 'AI Hardware/Infrastructure',
  
  // AI Category Names
  'category.image.generation': 'Image Generation AI',
  'category.chatbot.conversational': 'Chatbot/Conversational AI',
  'category.text.generation': 'Text Generation AI',
  'category.code.generation': 'Code Generation AI',
  'category.audio.generation': 'Audio Generation AI',
  'category.video.generation': 'Video Generation AI',
  'category.data.analysis': 'Data Analysis AI',
  'category.automation': 'Automation AI',
  
  // Quiz Topic
  'quiz.topic.selector': 'Select Topic',
  'quiz.random': 'Random',
  'quiz.topic.today': 'Today\'s Topic',
  'quiz.topic.selected': 'Selected Topic',
  
  // Quiz Questions and Options
  'quiz.question.meaning': 'What is the most appropriate meaning of',
  'quiz.question.wrong.note': 'Wrong Answer Notes',
  'quiz.message.no.wrong.notes': 'No problems registered in wrong answer notes.',
  'quiz.message.wrong.notes.loaded': 'Loaded {count} problems from wrong answer notes.',
  'quiz.message.no.terms.selected': 'No terms registered for the selected topic.',
  'quiz.option.unrelated': 'This description is unrelated to',
  'quiz.explanation.correct.meaning': 'The correct meaning of',
  
  // Loading Message
  'loading.please.wait': 'Please wait a moment.',
  
  // Quiz
  'quiz.title': 'Quiz',
  'quiz.start': 'Start Quiz',
  'quiz.question': 'Question',
  'quiz.answer': 'Answer',
  'quiz.correct': 'Correct',
  'quiz.incorrect': 'Incorrect',
  'quiz.explanation': 'Explanation',
  'quiz.score': 'Score',
  'quiz.complete': 'Complete',
  'quiz.retry': 'Retry',
  'quiz.next': 'Next',
  'quiz.previous': 'Previous',
  'quiz.finish': 'Finish',
  'quiz.wrong.notes': 'Wrong Answer Notes',
  'quiz.achievement': 'Achievement',
  'quiz.submit.answer': 'Submit Answer',
  'quiz.next.question': 'Next Question',
  'quiz.restart': 'Restart',
  'quiz.final.score': 'Final Score',
  'quiz.score.saved': 'Score saved! 🎉',
  'quiz.no.quizzes': 'No quizzes available for the selected topic.',
  
  // Progress
  'progress.title': 'Learning Progress',
  'progress.overall': 'Overall Progress',
  'progress.ai.info': 'AI Info Learning',
  'progress.terms': 'Terms Learning',
  'progress.quiz': 'Quiz Score',
  'progress.streak': 'Learning Streak',
  'progress.today': 'Today',
  'progress.week': 'This Week',
  'progress.month': 'This Month',
  'progress.year': 'This Year',
  
  // Progress Mode
  'progress.mode.trend.card': 'Learning Trend Card',
  'progress.mode.trend.graph': 'Learning Trend Graph',
  
  // Progress Period Selection
  'progress.period.weekly': 'Weekly',
  'progress.period.monthly': 'Monthly',
  'progress.period.custom': 'Custom',
  'progress.period.settings': 'Custom Period Settings',
  
  // Progress Card Content
  'progress.ai.info.learning': 'AI Info Learning',
  'progress.ai.info.today.count': 'Today\'s Learning Count',
  'progress.ai.info.daily.total': 'Daily Total Info Count',
  'progress.ai.info.accumulated.total': 'Accumulated Total Learning Count',
  'progress.terms.learning.count': 'Learning Count',
  'progress.quiz.daily.accuracy': 'Daily Accuracy',
  'progress.quiz.daily.accumulated': 'Daily Accumulated',
  'progress.quiz.accuracy': 'Daily Accuracy',
  'progress.quiz.accumulated.score': 'Daily Accumulated',
  'progress.card.learning.count': 'Learning Count',
  'progress.card.accumulated.score': 'Accumulated Score',
  'progress.card.accuracy': 'Accuracy Rate',
  'progress.card.daily.accumulated': 'Daily Accumulated',
  'progress.card.quiz.score': 'Quiz Score',
  'progress.card.terms.learning': 'Terms',
  'progress.card.terms.daily.total': 'Daily Total Terms Count',
  'progress.card.terms.accumulated.total': 'Accumulated Total Terms Count',
  
  // Terms Learning
  'terms.title': 'Terms Learning',
  'terms.learned': 'Learned',
  'terms.favorite': 'Favorites',
  'terms.search': 'Search',
  'terms.sort': 'Sort',
  'terms.filter': 'Filter',
  'terms.export': 'Export',
  'terms.import': 'Import',
  'terms.auto.play': 'Auto Play',
  'terms.speed': 'Speed',
  'terms.shuffle': 'Shuffle',
  
  // Terms Filter/List
  'terms.filter.button': 'Filter',
  'terms.list.button': 'List',
  'terms.search.placeholder': 'Search by term or description...',
  'terms.display.terms': 'Displayed Terms',
  'terms.favorites': 'Favorites',
  'terms.learning.progress': 'Learning Progress',
  'terms.learning.complete': 'Learning Complete',
  
  // Terms Filter/List Menu
  'terms.filter.menu.title': 'Filter Options',
  'terms.filter.menu.category': 'By Category',
  'terms.filter.menu.difficulty': 'By Difficulty',
  'terms.filter.menu.status': 'By Status',
  'terms.list.menu.title': 'List Options',
  'terms.list.menu.sort.by': 'Sort By',
  'terms.list.menu.sort.order': 'Sort Order',
  'terms.list.menu.view.mode': 'View Mode',
  
  // Admin
  'admin.title': 'Admin Dashboard',
  'admin.welcome': 'Manage AI Mastery Hub!',
  'admin.ai.info.manage': 'AI Info Management',
  'admin.user.manage': 'User Management',
  'admin.system.manage': 'System Management',
  'admin.stats': 'User Statistics',
  'admin.logs': 'Log Management',
  'admin.quiz.manage': 'Quiz Management',
  'admin.prompt.manage': 'Prompt Management',
  
  // Common
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'common.success': 'Success',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.save': 'Save',
  'common.edit': 'Edit',
  'common.delete': 'Delete',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',
  'common.refresh': 'Refresh',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.close': 'Close',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.ok': 'OK',
  'common.day.mon': 'Mon',
  'common.day.tue': 'Tue',
  'common.day.wed': 'Wed',
  'common.day.thu': 'Thu',
  'common.day.fri': 'Fri',
  'common.day.sat': 'Sat',
  'common.day.sun': 'Sun',
  
  // Authentication
  'auth.title': 'AI Mastery Hub',
  'auth.subtitle': 'Start now and explore the AI world.',
  'auth.login': 'Login',
  'auth.register': 'Register',
  'auth.username': 'Username',
  'auth.username.placeholder': 'Enter your username',
  'auth.password': 'Password',
  'auth.password.placeholder': 'Enter your password',
  'auth.login.button': 'Login',
  'auth.register.button': 'Register',
  'auth.error.all.fields': 'Please fill in all fields.',
  'auth.error.username.exists': 'Username already exists.',
  'auth.error.login.failed': 'An error occurred during login.',
  'auth.error.register.failed': 'An error occurred during registration.',
  'auth.error.incorrect.credentials': 'Incorrect username or password.',
  'auth.back': 'Back',
  
  // Language selection
  'language.ko': '한국어',
  'language.en': 'English',
  'language.ja': '日本語',
  'language.zh': '中文',
  'language.select': 'Select Language',
  
  // 퀴즈 탭 UI 요소
  'quiz.tab.topic.selector': 'Topic Selector',
  'quiz.tab.random': 'Random',
  'quiz.tab.selected.topic': 'Selected Topic',
  'quiz.tab.today.topic': 'Today\'s Topic',
  'quiz.tab.wrong.notes': 'Wrong Notes',
  'quiz.tab.no.terms.message': 'No terms registered',
  'quiz.tab.no.terms.selected.message': 'No terms for selected topic',
  'quiz.tab.no.wrong.notes.message': 'No problems registered in wrong notes. Register wrong problems in wrong notes while taking quizzes!',
  'quiz.tab.no.terms.date.message': '{date} date has no terms registered. Please take quizzes after the administrator registers terms!',
  'quiz.tab.no.terms.topic.message': '"{topic}" topic has no terms registered. Please select another topic or take quizzes after the administrator registers terms!',
  'quiz.tab.wrong.notes.mode': 'Wrong Notes Mode',
  'quiz.tab.selected.date': 'Selected Date: {date}',
  'quiz.tab.selected.topic.info': 'Selected Topic: {topic}',
  
  // 퀴즈 탭 추가 UI 요소
  'quiz.tab.select.topic': 'Select Topic',
  'quiz.tab.no.topics.available': 'No topics available',
  'quiz.tab.wrong.note.added': 'Wrong answer note added!',
  'quiz.tab.next.question': 'Next Question',
  'quiz.tab.complete.quiz': 'Complete Quiz',
  'quiz.tab.remove.from.wrong.notes': 'Remove from wrong notes',
  'quiz.tab.remove': 'Remove',
  'quiz.tab.add.to.wrong.notes': 'Add to wrong notes',
  'quiz.tab.add.wrong.note': 'Add Wrong Answer',
  'quiz.tab.quiz.completed': 'Quiz Completed!',
  'quiz.tab.try.again': 'Try Again',
  'quiz.tab.re.try': 'Re-try',
  'quiz.tab.score.saved': 'Score saved!',
  'quiz.tab.achievement.achieved': '🎉 Achievement Achieved!',
  'quiz.tab.new.achievement': 'New achievement gained!',
  
  // Terms Learning Tab Additional UI Elements
  'terms.tab.no.terms.message': 'No terms learned yet',
  'terms.tab.no.terms.description': 'Learn AI information and register terms to check them here!',
  'terms.tab.total.available.terms': 'Total available terms: {count}',
  
  // Terms Learning Tab Filter UI Elements
  'terms.tab.filter.date.filter': 'Filter by Date',
  'terms.tab.filter.all': 'All',
  'terms.tab.filter.sort': 'Sort',
  'terms.tab.filter.sort.options': 'Sort Options',
  'terms.tab.filter.sort.by.date': '🕒 Latest',
  'terms.tab.filter.sort.by.date.description': 'Sort by date',
  'terms.tab.filter.sort.by.alphabet': '🔤 Alphabetical',
  'terms.tab.filter.sort.by.alphabet.description': 'Sort alphabetically',
  'terms.tab.filter.sort.by.length': '📏 By Length',
  'terms.tab.filter.sort.by.length.description': 'Sort by term length',
  'terms.tab.filter.favorites': 'Favorites',
  'terms.tab.filter.random': 'Random',
  'terms.tab.filter.export': 'Export',
  'terms.tab.filter.total.terms': 'All Terms ({count})',
  
  // Terms Learning Tab Bottom Statistics Cards
  'terms.tab.stats.displayed.terms': 'Displayed Terms',
  'terms.tab.stats.favorites': 'Favorites',
  'terms.tab.stats.learning.progress': 'Learning Progress',
  'terms.tab.stats.learning.completed': 'Learning Completed',
  
  // Terms Learning Tab Word Cards
  'terms.card.learning.completed.count': '{count} Learning Completed',
  'terms.card.learning.date': 'Learning Date',
  'terms.card.swipe.guide': '← Swipe to view next/previous terms →',
  'terms.card.difficulty.beginner': 'Beginner',
  'terms.card.difficulty.intermediate': 'Intermediate',
  'terms.card.difficulty.advanced': 'Advanced',
  'terms.card.playing': 'Playing',
  'terms.card.auto.play': 'Auto Play',
  'terms.card.stop': 'Stop',
  
  // Terms Learning Tab List Mode
  'terms.list.difficulty': 'Difficulty',
  'terms.list.scroll.lock': 'Scroll Lock (Hold 1+ seconds)',
  
  // Terms Learning Tab Loading Page
  'terms.tab.loading': 'Please wait a moment.',
  
  // Terms Learning Tab Playback Speed Settings
  'terms.playback.speed': 'Playback Speed',
  'terms.playback.speed.1s': '1 second',
  'terms.playback.speed.2s': '2 seconds',
  'terms.playback.speed.3s': '3 seconds',
  'terms.playback.speed.5s': '5 seconds',
  'terms.playback.speed.7s': '7 seconds',
  'terms.playback.speed.10s': '10 seconds',
  
  // Terms Learning Tab List Card
  'terms.list.card.current': 'Current',
  
  // Terms Learning Tab Date Filter
  'terms.date.filter.year': 'Year',
  'terms.date.filter.month': 'Month',
  'terms.date.filter.day': 'Day',
  'terms.date.filter.items.count': '{count} items',
  
  // 진행률 탭 모드명
  'progress.tab.trend.card': 'Trend Card',
  'progress.tab.trend.graph': 'Trend Graph',
  
  // 진행률 탭 카드 내용
  'progress.card.ai.info.learning': 'AI Info',
  'progress.card.today.learning.count': 'Today\'s Learning Count',
  'progress.card.daily.total.info': 'Daily Total Info Count',
  'progress.card.accumulated.total.learning': 'Accumulated Total Learning',
  
  // Progress Graph Card Statistics
  'progress.graph.card.average': 'Average',
  'progress.graph.card.max': 'Max',
  'progress.graph.card.items': 'items',
  'progress.graph.y.axis.0': '0 items',
  'progress.graph.y.axis.1': '1 item',
  'progress.graph.y.axis.2': '2 items',
  
  // Progress Graph Messages
  'progress.graph.no.data': 'No learning data available for the selected period.',
  
  // Progress Period Change Loading
  'progress.period.change.loading': 'Please wait a moment.',
  
  // Progress Custom Period Settings
  'progress.custom.period.start.date': 'Start Date',
  'progress.custom.period.end.date': 'End Date',
  'progress.custom.period.select.dates': 'Please select start and end dates',
  
  // Progress Date Format
  'progress.date.format.month': 'M',
  'progress.date.format.day': 'D',
}

// 일본어
const ja: Record<string, string> = {
  // メインページ
  'app.title': 'AI Mastery Hub',
  'app.tagline.1': '毎日新しいAI情報で知識を積み重ねましょう。',
  'app.tagline.2': '実践クイズで学習した内容を確認しましょう。',
  'app.tagline.3': '個人別学習進捗を体系的に管理しましょう。',
  'app.tagline.4': 'AI世界の核心概念を簡単に理解しましょう。',
  'app.feature.ai.info': '毎日更新されるAI情報',
  'app.feature.terms': '関連用語を学習',
  'app.feature.quiz': '実践クイズで知識を確認',
  'app.start.button': '今すぐ始める',
  'app.stats.ai.info.label': '毎日新しい',
  'app.stats.ai.info.section.title': 'AI情報',
  'app.stats.quiz.label': '実践クイズで',
  'app.stats.quiz.title': '知識確認',
  'app.stats.progress.label': '個人別',
  'app.stats.progress.title': '学習進捗',
  'app.stats.terms.label': 'AI用語',
  'app.stats.terms.title': '体系的学習',
  
  // ウェルカムページアイコン説明
  'welcome.ai.info.description': '毎日新しいAI情報で知識を積み重ねましょう。最新のAIトレンドと技術動向を把握し、実務にすぐに適用できるインサイトを得ることができます。',
  
  // ウェルカムページアイコンクリック時テキストボックス
  'welcome.ai.info.click.description': '最新のAIトレンドと\n技術動向を毎日更新して提供します。',
  'welcome.terms.click.description': 'AI学習に必須な\n核心用語を体系的に整理しました。',
  'welcome.quiz.click.description': '学習した内容を様々な\nクイズで確認し確実な理解を確認します。',
  'welcome.progress.click.description': '個人別学習進捗状況を\n体系的に追跡し目標を達成します。',
  'welcome.quiz.description': '実践クイズで学習した内容を確認しましょう。様々な難易度の問題を通じてAI知識を体系的に整理し、弱点を補完できます。',
  'welcome.progress.description': '個人別学習進捗を体系的に管理しましょう。学習状況を一目で把握し、目標達成のためのカスタマイズされた学習計画を立てることができます。',
  'welcome.terms.description': 'AI世界の核心概念を簡単に理解しましょう。複雑なAI用語を体系的に整理し、実務で活用できる知識を積み重ねることができます。',
  
  // ナビゲーション
  'nav.dashboard': 'ダッシュボード',
  'nav.ai.info': 'AI情報',
  'nav.quiz': 'クイズ',
  'nav.progress': '進捗',
      'nav.terms': '全用語',
  'nav.admin': '管理者',
  'nav.logout': 'ログアウト',
  
  // ダッシュボード
  'dashboard.title': 'ダッシュボード',
  'dashboard.welcome': 'AI Mastery Hubへようこそ！',
  'dashboard.today': '今日',
  'dashboard.weekly': '今週',
  'dashboard.monthly': '今月',
  'dashboard.total': '合計',
  'dashboard.ai': 'AI',
  'dashboard.terms': '用語',
  'dashboard.quiz': 'クイズ',
  'dashboard.tab.ai.description': 'AI情報学習',
  'dashboard.tab.quiz.description': '用語クイズを解く',
  'dashboard.tab.progress.description': '学習進捗状況',
      'dashboard.tab.terms.description': 'システム登録全用語',
  'dashboard.welcome.message.1': '今日もAI学習を始めましょう！🚀',
  'dashboard.welcome.message.2': '新しい知識があなたを待っています！💡',
  'dashboard.welcome.message.3': '一緒に成長するAIの旅に出発しましょうか？🌟',
  
  // AI情報
  'ai.info.section.title': 'AI情報',
  'ai.info.daily': '日次AI情報',
  'ai.info.category.view': 'カテゴリ別',
  'ai.info.list': 'リスト表示',
  'ai.info.favorite': 'お気に入り',
  'ai.info.search': '検索',
  'ai.info.filter': 'フィルター',
  'ai.info.sort': '並び替え',
  'ai.info.sort.options': '並び替えオプション',
  'ai.info.items.per.page.select': 'ページあたりの項目数選択',
  
  // AI情報並び替えオプション
  'ai.info.sort.by.date': '日付順',
  'ai.info.sort.by.title': 'タイトル順',
  'ai.info.sort.by.category': 'カテゴリ順',
  'ai.info.sort.by.favorite': 'お気に入り順',
  
  // AI情報並び替えオプション詳細説明
  'ai.info.sort.by.date.description': '日付順並び替え',
  'ai.info.sort.by.title.description': 'タイトル順並び替え',
  'ai.info.sort.by.length.description': '内容長さ順並び替え',
  
  // AI情報項目数オプション
  'ai.info.items.5': '5件',
  'ai.info.items.10': '10件',
  'ai.info.items.30': '30件',
  'ai.info.items.50': '50件',
  
  // AI情報項目数オプション詳細説明
  'ai.info.items.per.page.display': 'ページあたり{count}件表示',
  
  // AI情報リストタイトル
  'ai.info.list.title': 'AI情報リスト',
  
  'ai.info.date': '日付',
  'ai.info.field.title': 'タイトル',
  'ai.info.content': '内容',
  'ai.info.terms': '用語',
  'ai.info.category': 'カテゴリ',
  'ai.info.subcategory': 'サブカテゴリ',
  
  // AI情報なしメッセージ
  'ai.info.no.data.title': 'AI情報がありません',
  'ai.info.no.data.description': 'まだ登録されたAI情報がありません。\n管理者がAI情報を登録するまでお待ちください！',
  'ai.info.no.data.waiting': '新しいAI情報をお待ちしています',
  'ai.info.no.data.admin': '登録されたAI情報がありません。',
  'ai.info.no.data.search': '検索条件に一致するAI情報がありません。',
  'ai.info.loading': 'AI情報を読み込み中...',
  
  // AI Info List Mode UI
  'ai.info.list.mode.title': 'AI情報リスト',
  'ai.info.list.total.count': '合計 {count} 件',
  'ai.info.list.search.placeholder': 'タイトル、内容、用語で検索...',
  'ai.info.search.placeholder': 'AI情報を検索...',
  
  // カテゴリヘッダー文句
  'category.header.total.infos': '合計 {count} 件',
  'category.header.updated.days': '{days}日間更新',
  
  // AI Info Mode
  'ai.info.mode.date': '日付別',
  'ai.info.mode.category': 'カテゴリ別',
  'ai.info.mode.full': '全リスト',
  
  // AI情報カードUI
  'ai.info.card.learning.complete': '学習完了',
  'ai.info.card.learning.required': '学習必要',
  'ai.info.card.terms.learning': '用語学習',
  'ai.info.card.terms.learning.hide': '用語学習を隠す',
  'ai.info.card.terms.learning.show': '関連用語を学習する',
  'ai.info.card.terms.hide': '隠す',
  'ai.info.card.terms.learning.short': '用語学習',
  'ai.info.card.terms.complete.count': '件完了',
  'ai.info.card.terms.learning.complete.count': '件学習完了',
  'ai.info.card.terms.swipe.guide': '← スワイプして用語を移動 →',
  'ai.info.card.terms.previous': '前へ',
  'ai.info.card.terms.next': '次へ',
  'ai.info.card.terms.all.complete': '🎉 すべての用語学習完了！',
  'ai.info.card.learning.button': '学習完了',
  'ai.info.card.learning.button.short': '学習',
  'ai.info.card.complete.button': '完了',
  'ai.info.card.learning.complete.notification': '🎉 学習完了！',
  'ai.info.card.achievement.notification': '🎉 達成達成！',
  'ai.info.card.new.achievement': '新しい達成を獲得しました！',
  'ai.info.card.expand': 'もっと見る',
  'ai.info.card.collapse': '折りたたむ',
  
  // Date Calculator
  'date.calculator.today': '今日',
  'date.calculator.calendar': 'カレンダー',
  
  // Category Mode
  'category.mode.select': 'カテゴリリスト',
  'category.mode.loading': 'しばらくお待ちください。',
  'category.mode.count': '件',
  
  // カテゴリ名（表示文字列ベース）
  'category.name.이미지 생성 AI': '画像生成AI',
  'category.name.챗봇/대화형 AI': 'チャットボット/対話型AI',
  'category.name.자연어 처리 AI': '自然言語処理AI',
  'category.name.음성 인식/합성 AI': '音声認識/合成AI',
  'category.name.AI 응용 서비스': 'AI応用サービス',
  'category.name.AI 보안/윤리': 'AIセキュリティ/倫理',
  'category.name.AI 개발 도구': 'AI開発ツール',
  'category.name.AI 창작 도구': 'AI創作ツール',
  'category.name.코딩/개발 도구': 'コーディング/開発ツール',
  'category.name.음성/오디오 AI': '音声/オーディオAI',
  'category.name.데이터 분석/ML': 'データ分析/ML',
  'category.name.AI 윤리/정책': 'AI倫理/政策',
  'category.name.AI 하드웨어/인프라': 'AIハードウェア/インフラ',
  
  // AI Category Names
  'category.image.generation': '画像生成AI',
  'category.chatbot.conversational': 'チャットボット/対話型AI',
  'category.text.generation': 'テキスト生成AI',
  'category.code.generation': 'コード生成AI',
  'category.audio.generation': '音声生成AI',
  'category.video.generation': '動画生成AI',
  'category.data.analysis': 'データ分析AI',
  'category.automation': '自動化AI',
  
  // Quiz Topic
  'quiz.topic.selector': 'トピック選択',
  'quiz.random': 'ランダム',
  'quiz.topic.today': '今日のトピック',
  'quiz.topic.selected': '選択されたトピック',
  
  // Quiz Questions and Options
  'quiz.question.meaning': 'の意味として最も適切なものは？',
  'quiz.question.wrong.note': '不正解ノート',
  'quiz.message.no.wrong.notes': '不正解ノートに登録された問題がありません。',
  'quiz.message.wrong.notes.loaded': '不正解ノートから{count}個の問題を読み込みました。',
  'quiz.message.no.terms.selected': '選択されたトピックに登録された用語がありません。',
  'quiz.option.unrelated': 'とは関係のない説明です。',
  'quiz.explanation.correct.meaning': 'の正確な意味は：',
  
  // Loading Message
  'loading.please.wait': 'しばらくお待ちください。',
  
  // Quiz
  'quiz.title': 'クイズ',
  'quiz.start': 'クイズ開始',
  'quiz.question': '問題',
  'quiz.answer': '回答',
  'quiz.correct': '正解',
  'quiz.incorrect': '不正解',
  'quiz.explanation': '説明',
  'quiz.score': 'スコア',
  'quiz.complete': '完了',
  'quiz.retry': '再試行',
  'quiz.next': '次へ',
  'quiz.previous': '前へ',
  'quiz.finish': '終了',
  'quiz.wrong.notes': '不正解ノート',
  'quiz.achievement': '達成',
  
  // Progress
  'progress.title': '学習進捗',
  'progress.overall': '全体進捗',
  'progress.ai.info': 'AI情報学習',
  'progress.terms': '用語学習',
  'progress.quiz': 'クイズスコア',
  'progress.streak': '連続学習',
  'progress.today': '今日',
  'progress.week': '今週',
  'progress.month': '今月',
  'progress.year': '今年',
  
  // Progress Mode
  'progress.mode.trend.card': '学習トレンドカード',
  'progress.mode.trend.graph': '学習トレンドグラフ',
  
  // Progress Period Selection
  'progress.period.weekly': '週間',
  'progress.period.monthly': '月間',
  'progress.period.custom': 'カスタム',
  'progress.period.settings': 'カスタム期間設定',
  
  // Progress Card Content
  'progress.ai.info.learning': 'AI情報学習',
  'progress.ai.info.today.count': '今日の学習数',
  'progress.ai.info.daily.total': '日次総情報数',
  'progress.ai.info.accumulated.total': '累積総学習数',
  'progress.terms.learning.count': '学習数',
  'progress.quiz.daily.accuracy': '日次正解率',
  'progress.quiz.daily.accumulated': '日次累積',
  'progress.quiz.accuracy': '日次正解率',
  'progress.quiz.accumulated.score': '日次累積',
  'progress.card.accuracy': '正答率',
  'progress.card.accumulated.score': '累積スコア',
  'progress.card.terms.daily.total': '日次総用語数',
  'progress.card.terms.accumulated.total': '累積総用語数',
  
  // Terms Learning
  'terms.title': '用語学習',
  'terms.learned': '学習完了',
  'terms.favorite': 'お気に入り',
  'terms.search': '検索',
  'terms.sort': '並び替え',
  'terms.filter': 'フィルター',
  'terms.export': 'エクスポート',
  'terms.import': 'インポート',
  'terms.auto.play': '自動再生',
  'terms.speed': '速度',
  'terms.shuffle': 'シャッフル',
  
  // Terms Filter/List
  'terms.filter.button': 'フィルター',
  'terms.list.button': 'リスト',
  'terms.search.placeholder': '用語や説明で検索...',
  'terms.display.terms': '表示された用語',
  'terms.favorites': 'お気に入り',
  'terms.learning.progress': '学習進捗',
  'terms.learning.complete': '学習完了',
  
  // Terms Filter/List Menu
  'terms.filter.menu.title': 'フィルターオプション',
  'terms.filter.menu.category': 'カテゴリ別',
  'terms.filter.menu.difficulty': '難易度別',
  'terms.filter.menu.status': '状態別',
  'terms.list.menu.title': 'リストオプション',
  'terms.list.menu.sort.by': '並び替え基準',
  'terms.list.menu.sort.order': '並び替え順序',
  'terms.list.menu.view.mode': '表示モード',
  
  // Admin
  'admin.title': '管理者ダッシュボード',
  'admin.welcome': 'AI Mastery Hubを管理しましょう！',
  'admin.ai.info.manage': 'AI情報管理',
  'admin.user.manage': 'ユーザー管理',
  'admin.system.manage': 'システム管理',
  'admin.stats': 'ユーザー統計',
  'admin.logs': 'ログ管理',
  'admin.quiz.manage': 'クイズ管理',
  'admin.prompt.manage': 'プロンプト管理',
  
  // 共通
  'common.loading': '読み込み中...',
  'common.error': 'エラーが発生しました',
  'common.success': '成功',
  'common.cancel': 'キャンセル',
  'common.confirm': '確認',
  'common.save': '保存',
  'common.edit': '編集',
  'common.delete': '削除',
  'common.add': '追加',
  'common.search': '検索',
  'common.filter': 'フィルター',
  'common.sort': '並び替え',
  'common.refresh': '更新',
  'common.back': '戻る',
  'common.next': '次へ',
  'common.previous': '前へ',
  'common.close': '閉じる',
  'common.yes': 'はい',
  'common.no': 'いいえ',
  'common.ok': 'OK',
  'common.day.mon': '月',
  'common.day.tue': '火',
  'common.day.wed': '水',
  'common.day.thu': '木',
  'common.day.fri': '金',
  'common.day.sat': '土',
  'common.day.sun': '日',
  
  // 認証
  'auth.title': 'AI Mastery Hub',
  'auth.subtitle': '今すぐ始めてAI世界を探検しましょう。',
  'auth.login': 'ログイン',
  'auth.register': '会員登録',
  'auth.username': 'ユーザー名',
  'auth.username.placeholder': 'ユーザー名を入力してください',
  'auth.password': 'パスワード',
  'auth.password.placeholder': 'パスワードを入力してください',
  'auth.login.button': 'ログイン',
  'auth.register.button': '会員登録',
  'auth.error.all.fields': 'すべてのフィールドを入力してください。',
  'auth.error.username.exists': '既に存在するユーザー名です。',
  'auth.error.login.failed': 'ログイン中にエラーが発生しました。',
  'auth.error.register.failed': '会員登録中にエラーが発生しました。',
  'auth.error.incorrect.credentials': 'ユーザー名またはパスワードが正しくありません。',
  'auth.back': '戻る',
  
  // 言語選択
  'language.ko': '한국어',
  'language.en': 'English',
  'language.ja': '日本語',
  'language.zh': '中文',
  'language.select': '言語選択',
  
  // 퀴즈 탭 UI 요소
  'quiz.tab.topic.selector': 'トピック選択',
  'quiz.tab.random': 'ランダム',
  'quiz.tab.selected.topic': '選択されたトピック',
  'quiz.tab.today.topic': '今日のトピック',
  'quiz.tab.wrong.notes': '間違いノート',
  'quiz.tab.no.terms.message': '登録された用語がありません',
  'quiz.tab.no.terms.selected.message': '選択されたトピックに用語がありません',
  'quiz.tab.no.wrong.notes.message': '間違いノートに登録された問題がありません。クイズを解きながら間違った問題を間違いノートに登録してみてください！',
  'quiz.tab.no.terms.date.message': '{date} 日に登録された用語がありません。管理者が用語を登録した後にクイズを解いてみてください！',
  'quiz.tab.no.terms.topic.message': '"{topic}" トピックに登録された用語がありません。別のトピックを選択するか、管理者が用語を登録した後にクイズを解いてみてください！',
  'quiz.tab.wrong.notes.mode': '間違いノートモード',
  'quiz.tab.selected.date': '選択した日付: {date}',
  'quiz.tab.selected.topic.info': '選択したトピック: {topic}',
  
  // 進捗率タブモード名
  'progress.tab.trend.card': '学習推移カード',
  'progress.tab.trend.graph': '学習推移グラフ',
  
  // 進捗率タブカード内容
  'progress.card.ai.info.learning': 'AI情報学習',
  'progress.card.today.learning.count': '今日の学習数',
  'progress.card.daily.total.info': '日別総情報数',
  'progress.card.accumulated.total.learning': '累積総学習数',
  'progress.card.terms.learning.count': '用語学習',
  'progress.card.terms.learning': '用語学習',
  'progress.card.learning.count': '学習数',
  'progress.card.quiz.score': 'クイズスコア',
  'progress.card.daily.accuracy': '日別正答率',
  'progress.card.daily.accumulated': '日別累積',
  
  // 進捗グラフカード統計
  'progress.graph.card.average': '平均',
  'progress.graph.card.max': '最大',
  'progress.graph.card.items': '件',
  'progress.graph.y.axis.0': '0件',
  'progress.graph.y.axis.1': '1件',
  'progress.graph.y.axis.2': '2件',
  
  // 進捗グラフメッセージ
  'progress.graph.no.data': '選択した期間に学習データがありません。',
  
  // 進捗期間変更ローディング
  'progress.period.change.loading': 'しばらくお待ちください。',
  
  // 進捗カスタム期間設定
  'progress.custom.period.start.date': '開始日',
  'progress.custom.period.end.date': '終了日',
  'progress.custom.period.select.dates': '開始日と終了日を選択してください',
  
  // 進捗日付フォーマット
  'progress.date.format.month': '月',
  'progress.date.format.day': '日',
  
  // 퀴즈 탭 추가 UI 요소
  'quiz.tab.select.topic': 'トピック選択',
  'quiz.tab.no.topics.available': '사용 가능한 주제가 없습니다',
  'quiz.tab.wrong.note.added': '오답 노트에 등록되었습니다!',
  'quiz.tab.next.question': '다음 문제',
  'quiz.tab.complete.quiz': '퀴즈 완료하기',
  'quiz.tab.remove.from.wrong.notes': '오답 노트에서 삭제',
  'quiz.tab.remove': '삭제',
  'quiz.tab.add.to.wrong.notes': '오답 노트 등록',
  'quiz.tab.add.wrong.note': '오답 등록',
  'quiz.tab.quiz.completed': '퀴즈 완료!',
  'quiz.tab.try.again': '다시 도전',
  'quiz.tab.re.try': '재도전',
  'quiz.tab.score.saved': '성적이 저장되었습니다!',
  'quiz.tab.achievement.achieved': '🎉 성취 달성!',
  'quiz.tab.new.achievement': '🎉 성취 달성!',
  
  // 用語学習タブ追加UI要素
  'terms.tab.no.terms.message': '学習した用語がありません',
  'terms.tab.no.terms.description': 'AI情報を学習して用語を登録した後、ここで確認してください！',
  'terms.tab.total.available.terms': '総学習可能用語: {count}件',
  
  // 用語学習タブフィルターUI要素
  'terms.tab.filter.date.filter': '日付別フィルター',
  'terms.tab.filter.all': '全体',
  'terms.tab.filter.sort': '並び替え',
  'terms.tab.filter.sort.options': '並び替えオプション',
  'terms.tab.filter.sort.by.date': '🕒 最新順',
  'terms.tab.filter.sort.by.date.description': '日付順並び替え',
  'terms.tab.filter.sort.by.alphabet': '🔤 あいうえお順',
  'terms.tab.filter.sort.by.alphabet.description': 'アルファベット順並び替え',
  'terms.tab.filter.sort.by.length': '📏 長さ順',
  'terms.tab.filter.sort.by.length.description': '用語長さ順並び替え',
  'terms.tab.filter.favorites': 'お気に入り',
  'terms.tab.filter.random': 'ランダム',
  'terms.tab.filter.export': 'エクスポート',
  'terms.tab.filter.total.terms': '全体用語リスト ({count}件)',
  
  // 用語学習タブ下部統計カード
  'terms.tab.stats.displayed.terms': '表示された用語',
  'terms.tab.stats.favorites': 'お気に入り',
  'terms.tab.stats.learning.progress': '学習進捗率',
  'terms.tab.stats.learning.completed': '学習完了',
  
  // 用語学習タブ単語カード
  'terms.card.learning.completed.count': '{count}件学習完了',
  'terms.card.learning.date': '学習日',
  'terms.card.swipe.guide': '← スワイプして次/前の用語を表示 →',
  'terms.card.difficulty.beginner': '初級',
  'terms.card.difficulty.intermediate': '中級',
  'terms.card.difficulty.advanced': '上級',
  'terms.card.playing': '再生中',
  'terms.card.auto.play': '自動再生',
  'terms.card.stop': '停止',
  
  // 用語学習タブリストモード
  'terms.list.difficulty': '難易度',
  'terms.list.scroll.lock': 'スクロール固定(1秒以上長押し)',
  
  // 用語学習タブローディングページ
  'terms.tab.loading': 'しばらくお待ちください。',
  
  // 用語学習タブ再生速度設定
  'terms.playback.speed': '再生速度',
  'terms.playback.speed.1s': '1秒',
  'terms.playback.speed.2s': '2秒',
  'terms.playback.speed.3s': '3秒',
  'terms.playback.speed.5s': '5秒',
  'terms.playback.speed.7s': '7秒',
  'terms.playback.speed.10s': '10秒',
  
  // 用語学習タブリストカード
  'terms.list.card.current': '現在',
  
  // 用語学習タブ日付フィルター
  'terms.date.filter.year': '年',
  'terms.date.filter.month': '月',
  'terms.date.filter.day': '日',
  'terms.date.filter.items.count': '{count}件',
}

// 중국어
const zh: Record<string, string> = {
  // 主页面
  'app.title': 'AI Mastery Hub',
  'app.tagline.1': '每天用新的AI信息积累知识。',
  'app.tagline.2': '通过实践测验检查学习内容。',
  'app.tagline.3': '系统管理个人学习进度。',
  'app.tagline.4': '轻松理解AI世界的核心概念。',
  'app.feature.ai.info': '每日更新的AI信息',
  'app.feature.terms': '学习相关术语',
  'app.feature.quiz': '通过实践测验检查知识',
  'app.start.button': '立即开始',
  'app.stats.ai.info.label': '每日新的',
  'app.stats.ai.info.section.title': 'AI信息',
  'app.stats.quiz.label': '实践测验',
  'app.stats.quiz.title': '知识检查',
  'app.stats.progress.label': '个性化',
  'app.stats.progress.title': '学习进度',
  'app.stats.terms.label': 'AI术语',
  'app.stats.terms.title': '系统学习',
  
  // 欢迎页面图标描述
  'welcome.ai.info.description': '每天用新的AI信息积累知识。了解最新AI趋势和技术发展，获得可以立即应用到工作中的见解。',
  'welcome.quiz.description': '通过实践测验检查学习内容。通过各种难度的问题系统整理AI知识，识别需要改进的领域。',
  'welcome.progress.description': '系统管理个人学习进度。全面了解学习状况，制定实现目标的定制化学习计划。',
  'welcome.terms.description': '轻松理解AI世界的核心概念。系统整理复杂的AI术语，积累可以在实际工作中应用的知识。',
  
  // 欢迎页面图标点击文本框
  'welcome.ai.info.click.description': '每日更新最新AI趋势\n和技术发展动态。',
  'welcome.terms.click.description': '系统整理AI学习\n必备核心术语。',
  'welcome.quiz.click.description': '通过各种测验检查\n学习内容确保深入理解。',
  'welcome.progress.click.description': '系统跟踪个人\n学习进度并实现目标。',
  
  // 导航
  'nav.dashboard': '仪表板',
  'nav.ai.info': 'AI信息',
  'nav.quiz': '测验',
  'nav.progress': '进度',
      'nav.terms': '所有术语',
  'nav.admin': '管理员',
  'nav.logout': '登出',
  
  // 仪表板
  'dashboard.title': '仪表板',
  'dashboard.welcome': '欢迎来到AI Mastery Hub！',
  'dashboard.today': '今天',
  'dashboard.weekly': '本周',
  'dashboard.monthly': '本月',
  'dashboard.total': '总计',
  'dashboard.ai': 'AI',
  'dashboard.terms': '术语',
  'dashboard.quiz': '测验',
  'dashboard.tab.ai.description': 'AI信息学习',
  'dashboard.tab.quiz.description': '术语测验',
  'dashboard.tab.progress.description': '学习进度情况',
      'dashboard.tab.terms.description': '系统注册所有术语',
  'dashboard.welcome.message.1': '今天也开始AI学习吧！🚀',
  'dashboard.welcome.message.2': '新知识正在等待着你！💡',
  'dashboard.welcome.message.3': '一起踏上成长的AI旅程吧？🌟',
  
  // AI信息
  'ai.info.section.title': 'AI信息',
  'ai.info.daily': '每日AI信息',
  'ai.info.category.view': '按类别',
  'ai.info.list': '列表视图',
  'ai.info.favorite': '收藏',
  'ai.info.search': '搜索',
  'ai.info.filter': '筛选',
  'ai.info.sort': '排序',
  'ai.info.sort.options': '排序选项',
  'ai.info.items.per.page.select': '选择每页项目数',
  
  // AI信息排序选项
  'ai.info.sort.by.date': '按日期',
  'ai.info.sort.by.title': '按标题',
  'ai.info.sort.by.category': '按类别',
  'ai.info.sort.by.favorite': '按收藏',
  
  // AI信息排序选项详细说明
  'ai.info.sort.by.date.description': '按日期排序',
  'ai.info.sort.by.title.description': '按标题排序',
  'ai.info.sort.by.length.description': '按内容长度排序',
  
  // AI信息项目数选项
  'ai.info.items.5': '5个',
  'ai.info.items.10': '10个',
  'ai.info.items.30': '30个',
  'ai.info.items.50': '50个',
  
  // AI信息项目数选项详细说明
  'ai.info.items.per.page.display': '每页显示{count}个',
  
  // AI信息列表标题
  'ai.info.list.title': 'AI信息列表',
  
  'ai.info.date': '日期',
  'ai.info.field.title': '标题',
  'ai.info.content': '内容',
  'ai.info.terms': '术语',
  'ai.info.category': '类别',
  'ai.info.subcategory': '子类别',
  
  // AI信息无数据消息
  'ai.info.no.data.title': '暂无AI信息',
  'ai.info.no.data.description': '尚未注册任何AI信息。\n请等待管理员注册AI信息后再使用！',
  'ai.info.no.data.waiting': '正在等待新的AI信息',
  'ai.info.no.data.admin': '没有注册的AI信息。',
  'ai.info.no.data.search': '没有符合搜索条件的AI信息。',
  'ai.info.loading': '正在加载AI信息...',
  
  // AI Info List Mode UI
  'ai.info.list.mode.title': 'AI 信息列表',
  'ai.info.list.total.count': '共 {count} 个信息',
  'ai.info.list.search.placeholder': '按标题、内容或术语搜索...',
  'ai.info.search.placeholder': '搜索 AI 信息...',
  
  // 分类头部短语
  'category.header.total.infos': '共 {count} 个信息',
  'category.header.updated.days': '在 {days} 天内更新',
  
  // AI Info Mode
  'ai.info.mode.date': '按日期',
  'ai.info.mode.category': '按类别',
  'ai.info.mode.full': '全列表',
  
  // AI信息卡片UI
  'ai.info.card.learning.complete': '学习完成',
  'ai.info.card.learning.required': '需要学习',
  'ai.info.card.terms.learning': '术语学习',
  'ai.info.card.terms.learning.hide': '隐藏术语学习',
  'ai.info.card.terms.learning.show': '学习相关术语',
  'ai.info.card.terms.hide': '隐藏',
  'ai.info.card.terms.learning.short': '术语学习',
  'ai.info.card.terms.complete.count': '个完成',
  'ai.info.card.terms.learning.complete.count': '个学习完成',
  'ai.info.card.terms.swipe.guide': '← 滑动切换术语 →',
  'ai.info.card.terms.previous': '上一个',
  'ai.info.card.terms.next': '下一个',
  'ai.info.card.terms.all.complete': '🎉 所有术语学习完成！',
  'ai.info.card.learning.button': '学习完成',
  'ai.info.card.learning.button.short': '学习',
  'ai.info.card.complete.button': '完成',
  'ai.info.card.learning.complete.notification': '🎉 学习完成！',
  'ai.info.card.achievement.notification': '🎉 成就达成！',
  'ai.info.card.new.achievement': '获得新成就！',
  'ai.info.card.expand': '更多',
  'ai.info.card.collapse': '收起',
  
  // Date Calculator
  'date.calculator.today': '今天',
  'date.calculator.calendar': '日历',
  
  // Category Mode
  'category.mode.select': '类别列表',
  'category.mode.loading': '请稍候...',
  'category.mode.count': '个',
  
  // 分类名称（基于显示字符串）
  'category.name.이미지 생성 AI': '图像生成AI',
  'category.name.챗봇/대화형 AI': '聊天机器人/对话型AI',
  'category.name.자연어 처리 AI': '自然语言处理AI',
  'category.name.음성 인식/합성 AI': '语音识别/合成AI',
  'category.name.AI 응용 서비스': 'AI应用服务',
  'category.name.AI 보안/윤리': 'AI安全/伦理',
  'category.name.AI 개발 도구': 'AI开发工具',
  'category.name.AI 창작 도구': 'AI创作工具',
  'category.name.코딩/개발 도구': '编码/开发工具',
  'category.name.음성/오디오 AI': '语音/音频AI',
  'category.name.데이터 분석/ML': '数据分析/机器学习',
  'category.name.AI 윤리/정책': 'AI伦理/政策',
  'category.name.AI 하드웨어/인프라': 'AI硬件/基础设施',
  
  // AI Category Names
  'category.image.generation': '图像生成AI',
  'category.chatbot.conversational': '聊天机器人/对话型AI',
  'category.text.generation': '文本生成AI',
  'category.code.generation': '代码生成AI',
  'category.audio.generation': '音频生成AI',
  'category.video.generation': '视频生成AI',
  'category.data.analysis': '数据分析AI',
  'category.automation': '自动化AI',
  
  // Quiz Topic
  'quiz.topic.selector': '选择主题',
  'quiz.random': '随机',
  'quiz.topic.today': '今日主题',
  'quiz.topic.selected': '已选主题',
  
  // Quiz Questions and Options
  'quiz.question.meaning': '的含义最恰当的是什么？',
  'quiz.question.wrong.note': '错题笔记',
  'quiz.message.no.wrong.notes': '错题笔记中没有注册的问题。',
  'quiz.message.wrong.notes.loaded': '从错题笔记中加载了{count}个问题。',
  'quiz.message.no.terms.selected': '选定主题没有注册术语。',
  'quiz.option.unrelated': '与此无关的描述。',
  'quiz.explanation.correct.meaning': '的正确含义是：',
  
  // Loading Message
  'loading.please.wait': '请稍等片刻。',
  
  // Quiz
  'quiz.title': '测验',
  'quiz.start': '开始测验',
  'quiz.question': '问题',
  'quiz.answer': '答案',
  'quiz.correct': '正确',
  'quiz.incorrect': '错误',
  'quiz.explanation': '解释',
  'quiz.score': '分数',
  'quiz.complete': '完成',
  'quiz.retry': '重试',
  'quiz.next': '下一个',
  'quiz.previous': '上一个',
  'quiz.finish': '结束',
  'quiz.wrong.notes': '错题笔记',
  'quiz.achievement': '成就',
  
  // 进度
  'progress.title': '学习进度',
  'progress.overall': '总体进度',
  'progress.ai.info': 'AI信息学习',
  'progress.terms': '术语学习',
  'progress.quiz': '测验分数',
  'progress.streak': '连续学习',
  'progress.today': '今天',
  'progress.week': '本周',
  'progress.month': '本月',
  'progress.year': '今年',
  
  // 进度模式
  'progress.mode.trend.card': '学习趋势卡片',
  'progress.mode.trend.graph': '学习趋势图',
  
  // 进度期间选择
  'progress.period.weekly': '周',
  'progress.period.monthly': '月',
  'progress.period.custom': '自定义',
  'progress.period.settings': '自定义期间设置',
  
  // 进度卡片内容
  'progress.ai.info.learning': 'AI信息学习',
  'progress.ai.info.today.count': '今日学习数',
  'progress.ai.info.daily.total': '每日总信息数',
  'progress.ai.info.accumulated.total': '累计总学习数',
  'progress.terms.learning.count': '术语学习',
  'progress.quiz.daily.accuracy': '每日正确率',
  'progress.quiz.daily.accumulated': '每日累计',
  'progress.quiz.accuracy': '正确率',
  'progress.quiz.accumulated.score': '累计分数',
  
  // 术语学习
  'terms.title': '术语学习',
  'terms.learned': '已学习',
  'terms.favorite': '收藏',
  'terms.search': '搜索',
  'terms.sort': '排序',
  'terms.filter': '筛选',
  'terms.export': '导出',
  'terms.import': '导入',
  'terms.auto.play': '自动播放',
  'terms.speed': '速度',
  'terms.shuffle': '随机播放',
  
  // 术语过滤/列表
  'terms.filter.button': '筛选',
  'terms.list.button': '列表',
  'terms.search.placeholder': '用语或描述搜索...',
  'terms.display.terms': '显示术语',
  'terms.favorites': '收藏',
  'terms.learning.progress': '学习进度',
  'terms.learning.complete': '学习完成',
  
  // 术语过滤/列表菜单
  'terms.filter.menu.title': '筛选选项',
  'terms.filter.menu.category': '按类别',
  'terms.filter.menu.difficulty': '按难度',
  'terms.filter.menu.status': '按状态',
  'terms.list.menu.title': '列表选项',
  'terms.list.menu.sort.by': '排序依据',
  'terms.list.menu.sort.order': '排序顺序',
  'terms.list.menu.view.mode': '显示模式',
  
  // 管理员
  'admin.title': '管理员仪表板',
  'admin.welcome': '管理AI Mastery Hub！',
  'admin.ai.info.manage': 'AI信息管理',
  'admin.user.manage': '用户管理',
  'admin.system.manage': '系统管理',
  'admin.stats': '用户统计',
  'admin.logs': '日志管理',
  'admin.quiz.manage': '测验管理',
  'admin.prompt.manage': '提示管理',
  
  // 通用
  'common.loading': '加载中...',
  'common.error': '发生错误',
  'common.success': '成功',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.save': '保存',
  'common.edit': '编辑',
  'common.delete': '删除',
  'common.add': '添加',
  'common.search': '搜索',
  'common.filter': '筛选',
  'common.sort': '排序',
  'common.refresh': '刷新',
  'common.back': '返回',
  'common.next': '下一个',
  'common.previous': '上一个',
  'common.close': '关闭',
  'common.yes': '是',
  'common.no': '否',
  'common.ok': '确定',
  'common.day.mon': '周一',
  'common.day.tue': '周二',
  'common.day.wed': '周三',
  'common.day.thu': '周四',
  'common.day.fri': '周五',
  'common.day.sat': '周六',
  'common.day.sun': '周日',
  
  // 认证
  'auth.title': 'AI Mastery Hub',
  'auth.subtitle': '立即开始探索AI世界。',
  'auth.login': '登录',
  'auth.register': '注册',
  'auth.username': '用户名',
  'auth.username.placeholder': '请输入用户名',
  'auth.password': '密码',
  'auth.password.placeholder': '请输入密码',
  'auth.login.button': '登录',
  'auth.register.button': '注册',
  'auth.error.all.fields': '请填写所有字段。',
  'auth.error.username.exists': '用户名已存在。',
  'auth.error.login.failed': '登录时发生错误。',
  'auth.error.register.failed': '注册时发生错误。',
  'auth.error.incorrect.credentials': '用户名或密码不正确。',
  'auth.back': '返回',
  
  // 语言选择
  'language.ko': '한국어',
  'language.en': 'English',
  'language.ja': '日本語',
  'language.zh': '中文',
  'language.select': '选择语言',
  
  // 퀴즈 탭 UI 요소
  'quiz.tab.topic.selector': '主题选择',
  'quiz.tab.random': '随机',
  'quiz.tab.selected.topic': '已选主题',
  'quiz.tab.today.topic': '今日主题',
  'quiz.tab.wrong.notes': '错题笔记',
  'quiz.tab.no.terms.message': '没有注册的术语',
  'quiz.tab.no.terms.selected.message': '所选主题没有术语',
  'quiz.tab.no.wrong.notes.message': '错题笔记中没有注册的问题。在做测验时，请将错误的问题注册到错题笔记中！',
  'quiz.tab.no.terms.date.message': '{date} 日期没有注册的术语。请管理员注册术语后再做测验！',
  'quiz.tab.no.terms.topic.message': '"{topic}" 主题没有注册的术语。请选择其他主题或管理员注册术语后再做测验！',
  'quiz.tab.wrong.notes.mode': '错题笔记模式',
  'quiz.tab.selected.date': '选择日期: {date}',
  'quiz.tab.selected.topic.info': '选择主题: {topic}',
  
  // 进度标签页模式名
  'progress.tab.trend.card': '学习趋势卡片',
  'progress.tab.trend.graph': '学习趋势图表',
  
  // 进度标签页卡片内容
  'progress.card.ai.info.learning': 'AI信息学习',
  'progress.card.today.learning.count': '今日学习数',
  'progress.card.daily.total.info': '每日总信息数',
  'progress.card.accumulated.total.learning': '累计总学习数',
  'progress.card.terms.learning.count': '术语学习',
  'progress.card.terms.learning': '术语学习',
  'progress.card.learning.count': '学习数',
  'progress.card.quiz.score': '测验分数',
  'progress.card.daily.accuracy': '每日正确率',
  'progress.card.daily.accumulated': '每日累计',
  'progress.card.accuracy': '正确率',
  'progress.card.accumulated.score': '累计分数',
  'progress.card.terms.daily.total': '每日总术语数',
  'progress.card.terms.accumulated.total': '累计总术语数',
  
  // 进度图表卡片统计
  'progress.graph.card.average': '平均',
  'progress.graph.card.max': '最大',
  'progress.graph.card.items': '个',
  'progress.graph.y.axis.0': '0个',
  'progress.graph.y.axis.1': '1个',
  'progress.graph.y.axis.2': '2个',
  
  // 进度图表消息
  'progress.graph.no.data': '所选期间没有学习数据。',
  
  // 进度期间更改加载
  'progress.period.change.loading': '请稍候。',
  
  // 进度自定义期间设置
  'progress.custom.period.start.date': '开始日期',
  'progress.custom.period.end.date': '结束日期',
  'progress.custom.period.select.dates': '请选择开始和结束日期',
  
  // 进度日期格式
  'progress.date.format.month': '月',
  'progress.date.format.day': '日',
  
  // 퀴즈 탭 추가 UI 요소
  'quiz.tab.select.topic': '选择主题',
  'quiz.tab.no.topics.available': '사용 가능한 주제가 없습니다',
  'quiz.tab.wrong.note.added': '오답 노트에 등록되었습니다!',
  'quiz.tab.next.question': '다음 문제',
  'quiz.tab.complete.quiz': '퀴즈 완료하기',
  'quiz.tab.remove.from.wrong.notes': '오답 노트에서 삭제',
  'quiz.tab.remove': '삭제',
  'quiz.tab.add.to.wrong.notes': '오답 노트 등록',
  'quiz.tab.add.wrong.note': '오답 등록',
  'quiz.tab.quiz.completed': '퀴즈 완료!',
  'quiz.tab.try.again': '다시 도전',
  'quiz.tab.re.try': '재도전',
  'quiz.tab.score.saved': '성적이 저장되었습니다!',
  'quiz.tab.achievement.achieved': '🎉 성취 달성!',
  'quiz.tab.new.achievement': '🎉 성취 달성!',
  
  // 术语学习标签页附加UI元素
  'terms.tab.no.terms.message': '没有学习过的术语',
  'terms.tab.no.terms.description': '学习AI信息并注册术语后，在这里查看！',
  'terms.tab.total.available.terms': '总可学习术语: {count}个',
  
  // 术语学习标签页过滤器UI元素
  'terms.tab.filter.date.filter': '按日期筛选',
  'terms.tab.filter.all': '全部',
  'terms.tab.filter.sort': '排序',
  'terms.tab.filter.sort.options': '排序选项',
  'terms.tab.filter.sort.by.date': '🕒 最新',
  'terms.tab.filter.sort.by.date.description': '按日期排序',
  'terms.tab.filter.sort.by.alphabet': '🔤 字母顺序',
  'terms.tab.filter.sort.by.alphabet.description': '按字母排序',
  'terms.tab.filter.sort.by.length': '📏 按长度',
  'terms.tab.filter.sort.by.length.description': '按术语长度排序',
  'terms.tab.filter.favorites': '收藏',
  'terms.tab.filter.random': '随机',
  'terms.tab.filter.export': '导出',
  'terms.tab.filter.total.terms': '所有术语 ({count}个)',
  
  // 术语学习标签页底部统计卡片
  'terms.tab.stats.displayed.terms': '显示的术语',
  'terms.tab.stats.favorites': '收藏',
  'terms.tab.stats.learning.progress': '学习进度',
  'terms.tab.stats.learning.completed': '学习完成',
  
  // 术语学习标签页单词卡片
  'terms.card.learning.completed.count': '{count}个学习完成',
  'terms.card.learning.date': '学习日期',
  'terms.card.swipe.guide': '← 滑动查看下一个/上一个术语 →',
  'terms.card.difficulty.beginner': '初级',
  'terms.card.difficulty.intermediate': '中级',
  'terms.card.difficulty.advanced': '高级',
  'terms.card.playing': '播放中',
  'terms.card.auto.play': '自动播放',
  'terms.card.stop': '停止',
  
  // 术语学习标签页列表模式
  'terms.list.difficulty': '难度',
  'terms.list.scroll.lock': '滚动锁定(长按1秒以上)',
  
  // 术语学习标签页加载页面
  'terms.tab.loading': '请稍候。',
  
  // 术语学习标签页播放速度设置
  'terms.playback.speed': '播放速度',
  'terms.playback.speed.1s': '1秒',
  'terms.playback.speed.2s': '2秒',
  'terms.playback.speed.3s': '3秒',
  'terms.playback.speed.5s': '5秒',
  'terms.playback.speed.7s': '7秒',
  'terms.playback.speed.10s': '10秒',
  
  // 术语学习标签页列表卡片
  'terms.list.card.current': '当前',
  
  // 术语学习标签页日期筛选
  'terms.date.filter.year': '年',
  'terms.date.filter.month': '月',
  'terms.date.filter.day': '日',
  'terms.date.filter.items.count': '{count}个',
}

export const translations: Translations = {
  ko,
  en,
  ja,
  zh,
}

// 언어별 플래그 이모지
export const languageFlags: Record<Language, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
}

// 언어별 이름
export const languageNames: Record<Language, string> = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
}

// 언어 변경 함수
export const changeLanguage = (language: Language) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language)
    // 언어 변경 이벤트 발생
    window.dispatchEvent(new CustomEvent('languageChange', { detail: language }))
  }
}

// 현재 언어 가져오기
export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language') as Language
    if (saved && ['ko', 'en', 'ja', 'zh'].includes(saved)) {
      return saved
    }
  }
  return 'ko' // 기본값은 한국어
}

// 번역 함수
export const t = (key: string, languageOrOptions?: Language | { language?: Language; [key: string]: any }): string => {
  let language: Language = getCurrentLanguage()
  let options: Record<string, any> = {}
  
  if (languageOrOptions) {
    if (typeof languageOrOptions === 'string') {
      language = languageOrOptions
    } else {
      language = languageOrOptions.language || getCurrentLanguage()
      options = languageOrOptions
    }
  }
  
  let result = translations[language][key] || translations.ko[key] || key
  
  // 옵션이 있으면 문자열 보간 수행
  if (Object.keys(options).length > 0) {
    Object.entries(options).forEach(([key, value]) => {
      if (key !== 'language') {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value))
      }
    })
  }
  
  return result
}

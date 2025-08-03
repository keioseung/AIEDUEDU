import os
import json
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in environment variables")
    DATABASE_URL = "postgresql://postgres.jzfwqunitwpczhartwdh:rhdqngo123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

print(f"Fixing UserProgress data from: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # 모든 세션의 AI 정보 학습 데이터를 확인하고 통계를 수정
        sessions = connection.execute(text("""
            SELECT DISTINCT session_id 
            FROM user_progress 
            WHERE date NOT LIKE '__%'
        """)).fetchall()
        
        print(f"Found {len(sessions)} sessions with AI info learning data")
        
        for session_row in sessions:
            session_id = session_row[0]
            print(f"\n=== Processing session: {session_id} ===")
            
            # 해당 세션의 AI 정보 학습 데이터 가져오기
            ai_progress = connection.execute(text("""
                SELECT date, learned_info 
                FROM user_progress 
                WHERE session_id = :session_id AND date NOT LIKE '__%'
                ORDER BY date
            """), {"session_id": session_id}).fetchall()
            
            total_learned = 0
            learned_dates = []
            
            for row in ai_progress:
                date = row[0]
                learned_info = row[1]
                
                if learned_info:
                    try:
                        learned_data = json.loads(learned_info)
                        if isinstance(learned_data, list):
                            total_learned += len(learned_data)
                            learned_dates.append(date)
                            print(f"  Date {date}: {learned_data} (count: {len(learned_data)})")
                        else:
                            print(f"  Date {date}: learned_data is not a list: {learned_data}")
                    except json.JSONDecodeError as e:
                        print(f"  Date {date}: JSON decode error: {e}")
                        continue
            
            print(f"  Total learned: {total_learned}")
            print(f"  Learned dates: {learned_dates}")
            
            # 통계 데이터 업데이트
            stats_progress = connection.execute(text("""
                SELECT stats 
                FROM user_progress 
                WHERE session_id = :session_id AND date = '__stats__'
            """), {"session_id": session_id}).fetchfirst()
            
            if stats_progress and stats_progress[0]:
                try:
                    current_stats = json.loads(stats_progress[0])
                    current_stats['total_learned'] = total_learned
                    current_stats['last_learned_date'] = learned_dates[-1] if learned_dates else None
                    
                    # 연속 학습일 계산
                    if learned_dates:
                        from datetime import datetime, timedelta
                        learned_dates.sort()
                        last_learned_date = learned_dates[-1]
                        
                        # 연속 학습일 계산
                        current_date = last_learned_date
                        streak_count = 0
                        
                        while current_date in learned_dates:
                            streak_count += 1
                            # 이전 날짜 계산
                            current_dt = datetime.strptime(current_date, '%Y-%m-%d')
                            current_dt = current_dt - timedelta(days=1)
                            current_date = current_dt.strftime('%Y-%m-%d')
                        
                        current_stats['streak_days'] = streak_count
                        current_stats['max_streak'] = max(current_stats.get('max_streak', 0), streak_count)
                    
                    # 통계 업데이트
                    connection.execute(text("""
                        UPDATE user_progress 
                        SET stats = :stats 
                        WHERE session_id = :session_id AND date = '__stats__'
                    """), {
                        "session_id": session_id,
                        "stats": json.dumps(current_stats)
                    })
                    
                    print(f"  Updated stats: {current_stats}")
                    
                except json.JSONDecodeError as e:
                    print(f"  Error parsing stats: {e}")
            else:
                print(f"  No stats record found for session {session_id}")
        
        # 변경사항 커밋
        connection.commit()
        print("\n=== All updates completed successfully! ===")
            
except Exception as e:
    print(f"Database operation failed: {e}")
    import traceback
    traceback.print_exc() 
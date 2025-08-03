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

print(f"Testing UserProgress data from: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # 모든 UserProgress 데이터 확인
        result = connection.execute(text("""
            SELECT session_id, date, learned_info, stats 
            FROM user_progress 
            ORDER BY session_id, date
        """))
        
        print("\n=== 모든 UserProgress 데이터 ===")
        for row in result:
            print(f"Session: {row[0]}, Date: {row[1]}")
            print(f"  Learned Info: {row[2]}")
            print(f"  Stats: {row[3]}")
            print()
        
        # AI 정보 학습 데이터만 확인 (date가 __로 시작하지 않는 것들)
        result = connection.execute(text("""
            SELECT session_id, date, learned_info 
            FROM user_progress 
            WHERE date NOT LIKE '__%'
            ORDER BY session_id, date
        """))
        
        print("\n=== AI 정보 학습 데이터 ===")
        for row in result:
            print(f"Session: {row[0]}, Date: {row[1]}, Learned: {row[2]}")
            if row[2]:
                try:
                    learned_data = json.loads(row[2])
                    print(f"  Parsed: {learned_data} (count: {len(learned_data) if isinstance(learned_data, list) else 0})")
                except json.JSONDecodeError as e:
                    print(f"  JSON Parse Error: {e}")
            print()
        
        # 통계 데이터 확인
        result = connection.execute(text("""
            SELECT session_id, date, stats 
            FROM user_progress 
            WHERE date = '__stats__'
            ORDER BY session_id
        """))
        
        print("\n=== 통계 데이터 ===")
        for row in result:
            print(f"Session: {row[0]}, Stats: {row[2]}")
            if row[2]:
                try:
                    stats_data = json.loads(row[2])
                    print(f"  Parsed: {stats_data}")
                except json.JSONDecodeError as e:
                    print(f"  JSON Parse Error: {e}")
            print()
            
except Exception as e:
    print(f"Database connection failed: {e}")
    import traceback
    traceback.print_exc() 
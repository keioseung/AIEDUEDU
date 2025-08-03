import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in environment variables")
    # 직접 설정
    DATABASE_URL = "postgresql://postgres.jzfwqunitwpczhartwdh:rhdqngo123@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"

print(f"Checking UserProgress data from: {DATABASE_URL}")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as connection:
        # UserProgress 테이블 구조 확인
        result = connection.execute(text("""
            SELECT column_name, data_type, is_nullable 
            FROM information_schema.columns 
            WHERE table_name = 'user_progress'
            ORDER BY ordinal_position
        """))
        
        print("\nUserProgress table structure:")
        for row in result:
            print(f"  {row[0]}: {row[1]} (nullable: {row[2]})")
        
        # UserProgress 데이터 확인
        result = connection.execute(text("""
            SELECT session_id, date, learned_info, stats 
            FROM user_progress 
            ORDER BY session_id, date
        """))
        
        print("\nUserProgress data:")
        for row in result:
            print(f"  Session: {row[0]}, Date: {row[1]}")
            print(f"    Learned Info: {row[2]}")
            print(f"    Stats: {row[3]}")
            print()
        
        # AI 정보 학습 데이터만 확인 (date가 __로 시작하지 않는 것들)
        result = connection.execute(text("""
            SELECT session_id, date, learned_info 
            FROM user_progress 
            WHERE date NOT LIKE '__%'
            ORDER BY session_id, date
        """))
        
        print("\nAI Info Learning data:")
        for row in result:
            print(f"  Session: {row[0]}, Date: {row[1]}, Learned: {row[2]}")
        
        # 특정 세션의 통계 확인
        result = connection.execute(text("""
            SELECT session_id, date, stats 
            FROM user_progress 
            WHERE date = '__stats__'
            ORDER BY session_id
        """))
        
        print("\nStats data:")
        for row in result:
            print(f"  Session: {row[0]}, Stats: {row[2]}")
            
except Exception as e:
    print(f"Database connection failed: {e}")
    import traceback
    traceback.print_exc() 
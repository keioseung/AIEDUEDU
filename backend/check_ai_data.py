#!/usr/bin/env python3
"""
DB에 저장된 AI 정보 데이터 확인 스크립트
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import json

load_dotenv()

def check_ai_data():
    """DB에 저장된 AI 정보 데이터를 확인합니다."""
    try:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            print("❌ DATABASE_URL 환경변수가 설정되지 않았습니다.")
            return False
            
        print(f"📡 데이터베이스 연결 중...")
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("✅ 데이터베이스 연결 성공\n")
            
            # 1. AI 정보 테이블 확인
            print("🤖 AI 정보 테이블 데이터:")
            print("=" * 50)
            result = conn.execute(text("SELECT * FROM ai_info ORDER BY created_at DESC LIMIT 5"))
            ai_infos = result.fetchall()
            
            if ai_infos:
                for i, row in enumerate(ai_infos):
                    print(f"\n📅 AI 정보 {i+1}:")
                    print(f"  ID: {row.id}")
                    print(f"  날짜: {row.date}")
                    print(f"  제목1: {row.info1_title}")
                    print(f"  제목2: {row.info2_title}")
                    print(f"  제목3: {row.info3_title}")
                    print(f"  생성일: {row.created_at}")
            else:
                print("  등록된 AI 정보가 없습니다.")
            
            print("\n" + "=" * 50)
            
            # 2. 프롬프트 테이블 확인
            print("💬 프롬프트 테이블 데이터:")
            print("=" * 50)
            result = conn.execute(text("SELECT * FROM prompt ORDER BY created_at DESC LIMIT 10"))
            prompts = result.fetchall()
            
            if prompts:
                for i, row in enumerate(prompts):
                    print(f"\n📝 프롬프트 {i+1}:")
                    print(f"  ID: {row.id}")
                    print(f"  제목: {row.title}")
                    print(f"  카테고리: {row.category}")
                    print(f"  생성일: {row.created_at}")
            else:
                print("  등록된 프롬프트가 없습니다.")
            
            print("\n" + "=" * 50)
            
            # 3. 기반 내용 테이블 확인
            print("📚 기반 내용 테이블 데이터:")
            print("=" * 50)
            result = conn.execute(text("SELECT * FROM base_content ORDER BY created_at DESC LIMIT 10"))
            base_contents = result.fetchall()
            
            if base_contents:
                for i, row in enumerate(base_contents):
                    print(f"\n📖 기반 내용 {i+1}:")
                    print(f"  ID: {row.id}")
                    print(f"  제목: {row.title}")
                    print(f"  카테고리: {row.category}")
                    print(f"  생성일: {row.created_at}")
            else:
                print("  등록된 기반 내용이 없습니다.")
            
            print("\n" + "=" * 50)
            
            # 4. 카테고리별 통계
            print("📊 카테고리별 통계:")
            print("=" * 50)
            
            # 프롬프트 카테고리 통계
            result = conn.execute(text("SELECT category, COUNT(*) as count FROM prompt GROUP BY category ORDER BY count DESC"))
            prompt_categories = result.fetchall()
            print("\n💬 프롬프트 카테고리:")
            for row in prompt_categories:
                print(f"  {row.category}: {row.count}개")
            
            # 기반 내용 카테고리 통계
            result = conn.execute(text("SELECT category, COUNT(*) as count FROM base_content GROUP BY category ORDER BY count DESC"))
            base_categories = result.fetchall()
            print("\n📖 기반 내용 카테고리:")
            for row in base_categories:
                print(f"  {row.category}: {row.count}개")
            
            print("\n" + "=" * 50)
            
            # 5. 실제 내용 샘플 확인
            print("🔍 실제 내용 샘플:")
            print("=" * 50)
            
            if prompts:
                sample_prompt = prompts[0]
                print(f"\n📝 프롬프트 샘플 (ID: {sample_prompt.id}):")
                print(f"  제목: {sample_prompt.title}")
                print(f"  카테고리: {sample_prompt.category}")
                print(f"  내용: {sample_prompt.content[:200]}...")
            
            if base_contents:
                sample_base = base_contents[0]
                print(f"\n📖 기반 내용 샘플 (ID: {sample_base.id}):")
                print(f"  제목: {sample_base.title}")
                print(f"  카테고리: {sample_base.category}")
                print(f"  내용: {sample_base.content[:200]}...")
                
        return True
        
    except Exception as e:
        print(f"❌ 데이터 확인 실패: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🔍 DB AI 정보 데이터 확인 시작...\n")
    success = check_ai_data()
    if success:
        print("\n🎉 데이터 확인이 완료되었습니다!")
    else:
        print("\n�� 데이터 확인이 실패했습니다!")

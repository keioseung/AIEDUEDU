-- AIInfo 테이블을 다국어 지원하도록 수정하는 마이그레이션 스크립트

-- 기존 컬럼들을 백업용으로 이름 변경
ALTER TABLE ai_info RENAME COLUMN info1_title TO info1_title_old;
ALTER TABLE ai_info RENAME COLUMN info1_content TO info1_content_old;
ALTER TABLE ai_info RENAME COLUMN info1_terms TO info1_terms_old;
ALTER TABLE ai_info RENAME COLUMN info2_title TO info2_title_old;
ALTER TABLE ai_info RENAME COLUMN info2_content TO info2_content_old;
ALTER TABLE ai_info RENAME COLUMN info2_terms TO info2_terms_old;
ALTER TABLE ai_info RENAME COLUMN info3_title TO info3_title_old;
ALTER TABLE ai_info RENAME COLUMN info3_content TO info3_content_old;
ALTER TABLE ai_info RENAME COLUMN info3_terms TO info3_terms_old;

-- 새로운 다국어 컬럼들 추가
-- Info 1 - 다국어 지원
ALTER TABLE ai_info ADD COLUMN info1_title_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info1_title_en TEXT;
ALTER TABLE ai_info ADD COLUMN info1_title_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info1_title_zh TEXT;
ALTER TABLE ai_info ADD COLUMN info1_content_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info1_content_en TEXT;
ALTER TABLE ai_info ADD COLUMN info1_content_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info1_content_zh TEXT;
ALTER TABLE ai_info ADD COLUMN info1_terms_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info1_terms_en TEXT;
ALTER TABLE ai_info ADD COLUMN info1_terms_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info1_terms_zh TEXT;

-- Info 2 - 다국어 지원
ALTER TABLE ai_info ADD COLUMN info2_title_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info2_title_en TEXT;
ALTER TABLE ai_info ADD COLUMN info2_title_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info2_title_zh TEXT;
ALTER TABLE ai_info ADD COLUMN info2_content_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info2_content_en TEXT;
ALTER TABLE ai_info ADD COLUMN info2_content_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info2_content_zh TEXT;
ALTER TABLE ai_info ADD COLUMN info2_terms_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info2_terms_en TEXT;
ALTER TABLE ai_info ADD COLUMN info2_terms_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info2_terms_zh TEXT;

-- Info 3 - 다국어 지원
ALTER TABLE ai_info ADD COLUMN info3_title_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info3_title_en TEXT;
ALTER TABLE ai_info ADD COLUMN info3_title_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info3_title_zh TEXT;
ALTER TABLE ai_info ADD COLUMN info3_content_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info3_content_en TEXT;
ALTER TABLE ai_info ADD COLUMN info3_content_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info3_content_zh TEXT;
ALTER TABLE ai_info ADD COLUMN info3_terms_ko TEXT;
ALTER TABLE ai_info ADD COLUMN info3_terms_en TEXT;
ALTER TABLE ai_info ADD COLUMN info3_terms_ja TEXT;
ALTER TABLE ai_info ADD COLUMN info3_terms_zh TEXT;

-- 기존 데이터를 한국어 컬럼으로 복사 (기존 데이터는 한국어로 간주)
UPDATE ai_info SET 
  info1_title_ko = info1_title_old,
  info1_content_ko = info1_content_old,
  info1_terms_ko = info1_terms_old,
  info2_title_ko = info2_title_old,
  info2_content_ko = info2_content_old,
  info2_terms_ko = info2_terms_old,
  info3_title_ko = info3_title_old,
  info3_content_ko = info3_content_old,
  info3_terms_ko = info3_terms_old;

-- 기존 백업 컬럼들 삭제
ALTER TABLE ai_info DROP COLUMN info1_title_old;
ALTER TABLE ai_info DROP COLUMN info1_content_old;
ALTER TABLE ai_info DROP COLUMN info1_terms_old;
ALTER TABLE ai_info DROP COLUMN info2_title_old;
ALTER TABLE ai_info DROP COLUMN info2_content_old;
ALTER TABLE ai_info DROP COLUMN info2_terms_old;
ALTER TABLE ai_info DROP COLUMN info3_title_old;
ALTER TABLE ai_info DROP COLUMN info3_content_old;
ALTER TABLE ai_info DROP COLUMN info3_terms_old;

-- 인덱스 추가 (필요한 경우)
CREATE INDEX IF NOT EXISTS idx_ai_info_date ON ai_info(date);
CREATE INDEX IF NOT EXISTS idx_ai_info_title_ko ON ai_info(info1_title_ko);
CREATE INDEX IF NOT EXISTS idx_ai_info_title_en ON ai_info(info1_title_en);
CREATE INDEX IF NOT EXISTS idx_ai_info_title_ja ON ai_info(info1_title_ja);
CREATE INDEX IF NOT EXISTS idx_ai_info_title_zh ON ai_info(info1_title_zh); 
-- compatibilitiesテーブルのreverse_compatibility_score_idをNOT NULLに変更

-- 既存のNULL値を適切な値で更新
-- デフォルトでreverse_compatibility_score_idをcompatibility_score_idと同じ値に設定
UPDATE compatibilities 
SET reverse_compatibility_score_id = compatibility_score_id 
WHERE reverse_compatibility_score_id IS NULL;

-- カラムをNOT NULLに変更
ALTER TABLE compatibilities 
ALTER COLUMN reverse_compatibility_score_id SET NOT NULL;

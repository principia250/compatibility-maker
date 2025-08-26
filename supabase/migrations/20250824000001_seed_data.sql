-- 初期データ投入用のマイグレーションファイル
-- 作成日: 2025-08-24
-- 説明: 相性メーカーアプリの初期データ

-- 1. プランデータの投入
INSERT INTO plans (name, max_charts, monthly_price, yearly_price) VALUES
('free', 3, 0.00, 0.00),
('supporter', 100, 0.00, 0.00),
('premium', 100, 9.99, 99.99);

-- 2. 相性スコアマスターデータの投入
INSERT INTO compatibility_scores (score, notation) VALUES
(-2, '×'),
(-1, '△'),
(0, '-'),
(1, '○'),
(2, '◎');

-- 3. サンプルユーザーデータの投入（auth.usersテーブルが存在することを前提）
-- 注意: 実際の運用では、auth.usersテーブルにユーザーが作成された後に実行する必要があります
-- 以下のINSERT文は、auth.usersテーブルにユーザーが存在する場合のみ実行してください

-- サンプルユーザー（実際のauth.usersテーブルのIDに置き換えてください）
-- INSERT INTO users (auth_user_id, username, plan_type) VALUES
-- ('00000000-0000-0000-0000-000000000001', 'fighting_master', 'premium'),
-- ('00000000-0000-0000-0000-000000000002', 'beginner_player', 'free'),
-- ('00000000-0000-0000-0000-000000000003', 'game_dev', 'supporter');

-- 4. サンプル相性図データ（ユーザーデータが投入された後に実行）
-- INSERT INTO compatibility_charts (title, user_id, is_public) VALUES
-- (
--   'ストリートファイター6 基本テクニック相性',
--   (SELECT id FROM users WHERE username = 'fighting_master'),
--   true
-- );

-- 5. サンプル要素データ（相性図データが投入された後に実行）
-- INSERT INTO elements (name, chart_id, side) VALUES
-- -- 攻めのテクニック
-- ((SELECT id FROM compatibility_charts WHERE title LIKE '%ストリートファイター6%'), 'ドライブラッシュ', 'left'),
-- ((SELECT id FROM compatibility_charts WHERE title LIKE '%ストリートファイター6%'), 'ドライブパーリー', 'left'),
-- ((SELECT id FROM compatibility_charts WHERE title LIKE '%ストリートファイター6%'), 'ドライブインパクト', 'left'),
-- 
-- -- 守りのテクニック
-- ((SELECT id FROM compatibility_charts WHERE title LIKE '%ストリートファイター6%'), 'ブロッキング', 'right'),
-- ((SELECT id FROM compatibility_charts WHERE title LIKE '%ストリートファイター6%'), 'パーリー', 'right'),
-- ((SELECT id FROM compatibility_charts WHERE title LIKE '%ストリートファイター6%'), 'しゃがみ', 'right');

-- 6. サンプル相性データ（要素データが投入された後に実行）
-- INSERT INTO compatibilities (left_element_id, right_element_id, compatibility_score_id) VALUES
-- -- ドライブラッシュ vs ブロッキング
-- (
--   (SELECT id FROM elements WHERE name = 'ドライブラッシュ' AND side = 'left'),
--   (SELECT id FROM elements WHERE name = 'ブロッキング' AND side = 'right'),
--   (SELECT id FROM compatibility_scores WHERE score = 1)
-- ),
-- -- ドライブラッシュ vs パーリー
-- (
--   (SELECT id FROM elements WHERE name = 'ドライブラッシュ' AND side = 'left'),
--   (SELECT id FROM elements WHERE name = 'パーリー' AND side = 'right'),
--   (SELECT id FROM compatibility_scores WHERE score = -1)
-- );

-- 注意事項:
-- 1. このファイルは、初期スキーマのマイグレーションが完了した後に実行してください
-- 2. サンプルユーザーデータの投入は、Supabase Authでユーザーが作成された後に実行してください
-- 3. 実際の運用では、本番環境でのサンプルデータ投入は慎重に行ってください
-- 4. 開発・テスト環境でのみサンプルデータを投入することを推奨します

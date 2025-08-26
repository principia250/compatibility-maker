# Supabase マイグレーション実行手順

このディレクトリには、相性メーカーアプリのデータベーススキーマとセキュリティ設定が含まれています。

## ファイル構成

```
supabase/
├── migrations/
│   ├── 20250824000000_initial_schema.sql      # 初期スキーマ
│   ├── 20250824000001_seed_data.sql           # 初期データ
│   ├── 20250824000002_rls_policies.sql        # RLSポリシー
│   └── ...以降追加のマイグレーションファイル
└── README.md                                   # このファイル
```

## マイグレーション実行手順

### 1. 初期スキーマの作成

```bash
# Supabase CLIを使用する場合
supabase db reset

# または、個別に実行する場合
psql -h [YOUR_SUPABASE_HOST] -U [YOUR_SUPABASE_USER] -d [YOUR_SUPABASE_DB] -f migrations/20250824000000_initial_schema.sql
```

### 2. 初期データの投入

```bash
psql -h [YOUR_SUPABASE_HOST] -U [YOUR_SUPABASE_USER] -d [YOUR_SUPABASE_DB] -f migrations/20250824000001_seed_data.sql
```

**注意**: このファイルにはサンプルユーザーデータが含まれていますが、コメントアウトされています。
実際のユーザーデータを投入する前に、Supabase Authでユーザーが作成されていることを確認してください。

### 3. RLSポリシーの設定

```bash
psql -h [YOUR_SUPABASE_HOST] -U [YOUR_SUPABASE_USER] -d [YOUR_SUPABASE_DB] -f migrations/20250824000002_rls_policies.sql
```

## 環境変数の設定

`.env.local`ファイルに以下の環境変数を設定してください：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## テーブル構造

### 主要テーブル

1. **users** - ユーザー情報
2. **plans** - プラン情報
3. **compatibility_charts** - 相性図
4. **elements** - 比較対象要素
5. **element_categories** - 比較項目
6. **compatibilities** - 相性データ
7. **compatibility_scores** - 相性スコア
8. **comments** - コメント
9. **goods** - Good
10. **bookmarks** - ブックマーク

### セキュリティ

- すべてのテーブルでRow Level Security (RLS) が有効化されています
- ユーザーは自分のデータのみアクセス可能
- 公開された相性図は誰でも閲覧可能
- 適切な権限チェックが実装されています

## トラブルシューティング

### よくある問題

1. **権限エラー**: RLSポリシーが正しく設定されているか確認
2. **外部キー制約エラー**: テーブルの作成順序を確認
3. **認証エラー**: Supabase Authの設定を確認

### ログの確認

```bash
# Supabase CLIを使用する場合
supabase logs

# データベースログの確認
psql -h [YOUR_SUPABASE_HOST] -U [YOUR_SUPABASE_USER] -d [YOUR_SUPABASE_DB] -c "SELECT * FROM pg_stat_activity;"
```

## 開発・テスト環境での注意事項

- 開発環境では、サンプルデータの投入を推奨します
- 本番環境では、サンプルデータの投入は慎重に行ってください
- 定期的なバックアップを実施してください

## サポート

問題が発生した場合は、以下を確認してください：

1. Supabaseのドキュメント
2. マイグレーションファイルの構文
3. データベースのログ
4. 環境変数の設定

# セットアップ手順

## 1. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定してください：

```bash
# Supabase設定
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# アプリケーション設定
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Supabaseプロジェクトの設定値の取得方法

1. [Supabase](https://supabase.com)にログイン
2. プロジェクトを選択
3. Settings > API から以下を取得：
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role secret → `SUPABASE_SERVICE_ROLE_KEY`

## 2. データベースのセットアップ

### マイグレーションの実行

```bash
# Supabase CLIがインストールされている場合
supabase db reset

# または個別に実行
supabase db push
```

### 手動でSQLを実行する場合

1. Supabase Dashboard > SQL Editor に移動
2. 以下のファイルの内容を順番に実行：
   - `supabase/migrations/20250824000000_initial_schema.sql`
   - `supabase/migrations/20250824000001_seed_data.sql`
   - `supabase/migrations/20250824000002_rls_policies.sql`

## 3. 開発サーバーの起動

```bash
npm run dev
```

## 4. 動作確認

1. ブラウザで `http://localhost:3000` にアクセス
2. エラーが発生しないことを確認
3. コンソールでSupabase接続エラーがないことを確認

## 5. トラブルシューティング

### 環境変数が読み込まれない場合

- `.env.local`ファイルが正しい場所にあることを確認
- 開発サーバーを再起動

### Supabase接続エラーの場合

- 環境変数の値が正しいことを確認
- Supabaseプロジェクトが有効であることを確認
- ネットワーク接続を確認

### Tailwind CSSが適用されない場合

- `npm run dev`で開発サーバーを再起動
- ブラウザのキャッシュをクリア

# API詳細設計書

## 1. API概要

### 1.1 基本情報

- **フレームワーク**: Next.js 14 API Routes
- **ベースURL**: `/api`
- **認証方式**: Supabase Auth (JWT)
- **データ形式**: JSON
- **エンコーディング**: UTF-8

### 1.2 設計方針

- RESTful API設計
- 一貫したエラーハンドリング
- 適切なHTTPステータスコード
- バリデーションとセキュリティ
- パフォーマンス最適化

### 1.3 共通レスポンス形式

```typescript
// 成功レスポンス
interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// エラーレスポンス
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

## 2. 認証・認可

### 2.1 認証フロー

```typescript
// 認証ミドルウェア
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 認証が必要なエンドポイントのチェック
  if (req.nextUrl.pathname.startsWith('/api/auth') && !session) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
      },
      { status: 401 }
    );
  }

  return res;
}

export const config = {
  matcher: ['/api/:path*'],
};
```

### 2.2 認可チェック

```typescript
// 権限チェックユーティリティ
export async function checkChartOwnership(chartId: string, authUserId: string) {
  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUserId)
    .single();

  if (!user) {
    throw new Error('ユーザーが見つかりません');
  }

  const { data: chart } = await supabase
    .from('compatibility_charts')
    .select('user_id')
    .eq('id', chartId)
    .single();

  if (!chart || chart.user_id !== user.id) {
    throw new Error('アクセス権限がありません');
  }

  return chart;
}
```

## 3. エンドポイント詳細

### 3.1 認証関連API

#### 3.1.1 ユーザー登録

```typescript
// POST /api/auth/register
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface RegisterResponse {
  user: {
    id: string;
    username: string;
    email: string;
    plan_type: string;
  };
  session: any;
}

// 実装例
export async function POST(request: Request) {
  try {
    const { username, email, password }: RegisterRequest = await request.json();

    // バリデーション
    if (!username || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '必須項目が不足しています',
          },
        },
        { status: 400 }
      );
    }

    // Supabaseでユーザー作成
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (error) throw error;

    // ユーザープロフィール作成
    const { error: profileError } = await supabase.from('users').insert({
      auth_user_id: data.user!.id,
      username,
      plan_type: 'free',
    });

    if (profileError) throw profileError;

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: data.user!.id,
          username,
          email,
          plan_type: 'free',
        },
        session: data.session,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'REGISTRATION_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

#### 3.1.2 ログイン

```typescript
// POST /api/auth/login
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    plan_type: string;
  };
  session: any;
}

// 実装例
export async function POST(request: Request) {
  try {
    const { email, password }: LoginRequest = await request.json();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // ユーザープロフィール取得
    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', data.user!.id)
      .single();

    return NextResponse.json({
      success: true,
      data: {
        user: profile,
        session: data.session,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'LOGIN_ERROR', message: error.message },
      },
      { status: 401 }
    );
  }
}
```

#### 3.1.3 ログアウト

```typescript
// POST /api/auth/logout
export async function POST(request: Request) {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'ログアウトしました',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'LOGOUT_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

### 3.2 相性図管理API

#### 3.2.1 相性図一覧取得

```typescript
// GET /api/charts
interface ChartsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'created_at' | 'good_count';
  order?: 'asc' | 'desc';
  user_id?: string;
}

interface ChartListItem {
  id: string;
  title: string;
  created_at: string;
  creator_name: string;
  good_count: number;
  bookmark_count: number;
}

interface ChartsResponse {
  charts: ChartListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// 実装例
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    const userId = searchParams.get('user_id');

    let query = supabase
      .from('compatibility_charts')
      .select(
        `
        id,
        title,
        created_at,
        users!inner(username),
        goods(id),
        bookmarks(id)
      `
      )
      .eq('is_public', true);

    // 検索条件
    if (search) {
      query = query.textSearch('title', search);
    }

    // ユーザーIDフィルター
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // ソート
    if (sort === 'good_count') {
      // Good数でのソートは別途処理が必要
      query = query.order('created_at', { ascending: order === 'asc' });
    } else {
      query = query.order(sort, { ascending: order === 'asc' });
    }

    // ページネーション
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw error;

    // データ整形
    const charts =
      data?.map((chart) => ({
        id: chart.id,
        title: chart.title,
        created_at: chart.created_at,
        creator_name: chart.users.username,
        good_count: chart.goods?.length || 0,
        bookmark_count: chart.bookmarks?.length || 0,
      })) || [];

    return NextResponse.json({
      success: true,
      data: {
        charts,
        pagination: {
          page,
          limit,
          total: count || 0,
          total_pages: Math.ceil((count || 0) / limit),
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

#### 3.2.2 相性図編集

```typescript
// POST /api/charts
interface CreateChartRequest {
  title: string;
  is_public: boolean;
}

interface CreateChartResponse {
  chart: {
    id: string;
    title: string;
    is_public: boolean;
    created_at: string;
  };
}

// 実装例
export async function POST(request: Request) {
  try {
    const { title, is_public }: CreateChartRequest = await request.json();

    // 認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    // プラン制限チェック
    const { data: user } = await supabase
      .from('users')
      .select('plan_type')
      .eq('auth_user_id', session.user.id)
      .single();

    const { count: chartCount } = await supabase
      .from('compatibility_charts')
      .select('*', { count: 'exact', head: true })
      .eq(
        'user_id',
        (
          await supabase
            .from('users')
            .select('id')
            .eq('auth_user_id', session.user.id)
            .single()
        ).data?.id
      );

    const maxCharts =
      user?.plan_type === 'premium'
        ? 100
        : user?.plan_type === 'supporter'
          ? 100
          : 3;
    if ((chartCount || 0) >= maxCharts) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PLAN_LIMIT',
            message: '作成可能な相性図の上限に達しています',
          },
        },
        { status: 403 }
      );
    }

    // バリデーション
    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'VALIDATION_ERROR', message: 'タイトルは必須です' },
        },
        { status: 400 }
      );
    }

    // 相性図編集
    const { data: chart, error } = await supabase
      .from('compatibility_charts')
      .insert({
        user_id: session.user.id,
        title,
        is_public,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: { chart },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CREATE_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

#### 3.2.3 相性図詳細取得

```typescript
// GET /api/charts/[id]
interface ChartDetailResponse {
  chart: {
    id: string;
    title: string;
    is_public: boolean;
    created_at: string;
    creator_name: string;
    good_count: number;
    bookmark_count: number;
    is_bookmarked: boolean;
    is_gooded: boolean;
  };
  elements: {
    id: string;
    name: string;
    side: 'left' | 'right';
  }[];
  compatibilities: {
    left_element_id: string;
    right_element_id: string;
    compatibility_score_id: string;
    reverse_compatibility_score_id?: string;
  }[];
}

// 実装例
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;

    // 相性図基本情報取得
    const { data: chart, error: chartError } = await supabase
      .from('compatibility_charts')
      .select(
        `
        *,
        users!inner(username),
        goods(id),
        bookmarks(id)
      `
      )
      .eq('id', chartId)
      .eq('is_public', true)
      .single();

    if (chartError || !chart) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '相性図が見つかりません' },
        },
        { status: 404 }
      );
    }

    // 要素取得
    const { data: elements, error: elementsError } = await supabase
      .from('elements')
      .select('*')
      .eq('chart_id', chartId)
      .order('side');

    if (elementsError) throw elementsError;

    // 相性データ取得
    const { data: compatibilities, error: compatibilitiesError } =
      await supabase
        .from('compatibilities')
        .select('*')
        .in('left_element_id', elements?.map((e) => e.id) || [])
        .in('right_element_id', elements?.map((e) => e.id) || []);

    if (compatibilitiesError) throw compatibilitiesError;

    // ユーザーのGood・ブックマーク状態確認
    const {
      data: { session },
    } = await supabase.auth.getSession();
    let isBookmarked = false;
    let isGooded = false;

    if (session) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', session.user.id)
        .single();

      if (user) {
        const { data: bookmark } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('chart_id', chartId)
          .eq('user_id', user.id)
          .single();

        const { data: good } = await supabase
          .from('goods')
          .select('id')
          .eq('chart_id', chartId)
          .eq('user_id', user.id)
          .single();

        isBookmarked = !!bookmark;
        isGooded = !!good;
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        chart: {
          id: chart.id,
          title: chart.title,
          is_public: chart.is_public,
          created_at: chart.created_at,
          creator_name: chart.users.username,
          good_count: chart.goods?.length || 0,
          bookmark_count: chart.bookmarks?.length || 0,
          is_bookmarked: isBookmarked,
          is_gooded: isGooded,
        },
        elements: elements || [],
        compatibilities: compatibilities || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

#### 3.2.4 相性図更新

```typescript
// PUT /api/charts/[id]
interface UpdateChartRequest {
  title?: string;
  is_public?: boolean;
}

// 実装例
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;
    const updates: UpdateChartRequest = await request.json();

    // 認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    // 権限チェック
    await checkChartOwnership(chartId, session.user.id);

    // 更新
    const { data: chart, error } = await supabase
      .from('compatibility_charts')
      .update(updates)
      .eq('id', chartId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { chart },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UPDATE_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

#### 3.2.5 相性図削除

```typescript
// DELETE /api/charts/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;

    // 認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    // 権限チェック
    await checkChartOwnership(chartId, session.user.id);

    // 削除（カスケード削除により関連データも削除される）
    const { error } = await supabase
      .from('compatibility_charts')
      .delete()
      .eq('id', chartId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: '相性図を削除しました',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'DELETE_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

### 3.3 要素管理API

#### 3.3.1 要素追加

```typescript
// POST /api/charts/[id]/elements
interface CreateElementRequest {
  name: string;
  side: 'left' | 'right';
}

// 実装例
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;
    const { name, side }: CreateElementRequest = await request.json();

    // 認証・権限チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    await checkChartOwnership(chartId, session.user.id);

    // 要素作成

    // 要素作成
    const { data: element, error } = await supabase
      .from('elements')
      .insert({
        chart_id: chartId,
        name,
        side,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: { element },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CREATE_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

### 3.4 相性管理API

#### 3.4.1 相性設定

```typescript
// POST /api/charts/[id]/compatibilities
interface CreateCompatibilityRequest {
  left_element_id: string;
  right_element_id: string;
  compatibility_score_id: string;
  reverse_compatibility_score_id?: string;
}

// 実装例
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;
    const {
      left_element_id,
      right_element_id,
      compatibility_score_id,
      reverse_compatibility_score_id,
    }: CreateCompatibilityRequest = await request.json();

    // 認証・権限チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    await checkChartOwnership(chartId, session.user.id);

    // バリデーション
    if (!compatibility_score_id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '相性スコアIDが指定されていません',
          },
        },
        { status: 400 }
      );
    }

    // 要素が同じチャートに属しているかチェック
    const { data: elements } = await supabase
      .from('elements')
      .select('id')
      .eq('chart_id', chartId)
      .in('id', [left_element_id, right_element_id]);

    if (!elements || elements.length !== 2) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: '無効な要素IDが指定されています',
          },
        },
        { status: 400 }
      );
    }

    // 相性作成（upsert）
    const { data: compatibility, error } = await supabase
      .from('compatibilities')
      .upsert({
        left_element_id,
        right_element_id,
        compatibility_score_id,
        reverse_compatibility_score_id,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: { compatibility },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'CREATE_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

### 3.5 インタラクションAPI

#### 3.5.1 Good機能

```typescript
// POST /api/charts/[id]/goods
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;

    // 認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    // 既存のGoodチェック
    const { data: existingGood } = await supabase
      .from('goods')
      .select('id')
      .eq('chart_id', chartId)
      .eq('user_id', session.user.id)
      .single();

    if (existingGood) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'ALREADY_GOODED', message: '既にGood済みです' },
        },
        { status: 400 }
      );
    }

    // Good作成
    const { error } = await supabase.from('goods').insert({
      chart_id: chartId,
      user_id: session.user.id,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Goodしました',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'GOOD_ERROR', message: error.message } },
      { status: 500 }
    );
  }
}

// DELETE /api/charts/[id]/goods
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;

    // 認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    // Good削除
    const { error } = await supabase
      .from('goods')
      .delete()
      .eq('chart_id', chartId)
      .eq('user_id', session.user.id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Goodを取り消しました',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNGOOD_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

#### 3.5.2 ブックマーク機能

```typescript
// POST /api/charts/[id]/bookmarks
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;

    // 認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    // 既存のブックマークチェック
    const { data: existingBookmark } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('chart_id', chartId)
      .eq('user_id', session.user.id)
      .single();

    if (existingBookmark) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ALREADY_BOOKMARKED',
            message: '既にブックマーク済みです',
          },
        },
        { status: 400 }
      );
    }

    // ブックマーク作成
    const { error } = await supabase.from('bookmarks').insert({
      chart_id: chartId,
      user_id: session.user.id,
    });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'ブックマークしました',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'BOOKMARK_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

### 3.6 コメントAPI

#### 3.6.1 コメント投稿

```typescript
// POST /api/charts/[id]/comments
interface CreateCommentRequest {
  content: string;
}

// 実装例
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;
    const { content }: CreateCommentRequest = await request.json();

    // 認証チェック
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: '認証が必要です' },
        },
        { status: 401 }
      );
    }

    // バリデーション
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'コメント内容を入力してください',
          },
        },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'コメントは1000文字以内で入力してください',
          },
        },
        { status: 400 }
      );
    }

    // コメント作成
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        chart_id: chartId,
        user_id: session.user.id,
        content: content.trim(),
      })
      .select(
        `
        *,
        users(username)
      `
      )
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: { comment },
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'COMMENT_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

#### 3.6.2 コメント一覧取得

```typescript
// GET /api/charts/[id]/comments
interface CommentsResponse {
  comments: {
    id: string;
    content: string;
    created_at: string;
    username: string;
  }[];
}

// 実装例
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chartId = params.id;

    // 相性図が公開されているかチェック
    const { data: chart } = await supabase
      .from('compatibility_charts')
      .select('is_public')
      .eq('id', chartId)
      .single();

    if (!chart || !chart.is_public) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'NOT_FOUND', message: '相性図が見つかりません' },
        },
        { status: 404 }
      );
    }

    // コメント取得
    const { data: comments, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        content,
        created_at,
        users(username)
      `
      )
      .eq('chart_id', chartId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: {
        comments:
          comments?.map((comment) => ({
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            username: comment.users.username,
          })) || [],
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message },
      },
      { status: 500 }
    );
  }
}
```

## 4. エラーハンドリング

### 4.1 HTTPステータスコード

- **200**: 成功
- **201**: 作成成功
- **400**: バリデーションエラー
- **401**: 認証エラー
- **403**: 権限エラー
- **404**: リソースが見つからない
- **500**: サーバーエラー

### 4.2 エラーコード一覧

```typescript
enum ErrorCode {
  // 認証・認可
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',

  // バリデーション
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // ビジネスロジック
  PLAN_LIMIT = 'PLAN_LIMIT',
  ALREADY_GOODED = 'ALREADY_GOODED',
  ALREADY_BOOKMARKED = 'ALREADY_BOOKMARKED',

  // リソース
  NOT_FOUND = 'NOT_FOUND',

  // システム
  FETCH_ERROR = 'FETCH_ERROR',
  CREATE_ERROR = 'CREATE_ERROR',
  UPDATE_ERROR = 'UPDATE_ERROR',
  DELETE_ERROR = 'DELETE_ERROR',
  REGISTRATION_ERROR = 'REGISTRATION_ERROR',
  LOGIN_ERROR = 'LOGIN_ERROR',
  LOGOUT_ERROR = 'LOGOUT_ERROR',
  GOOD_ERROR = 'GOOD_ERROR',
  UNGOOD_ERROR = 'UNGOOD_ERROR',
  BOOKMARK_ERROR = 'BOOKMARK_ERROR',
  COMMENT_ERROR = 'COMMENT_ERROR',
}
```

## 5. バリデーション

### 5.1 入力バリデーション

```typescript
// Zodスキーマ例
import { z } from 'zod';

export const CreateChartSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  is_public: z.boolean(),
});

export const CreateElementSchema = z.object({
  name: z
    .string()
    .min(1, '要素名は必須です')
    .max(100, '要素名は100文字以内で入力してください'),
  side: z.enum(['left', 'right'], {
    errorMap: () => ({ message: 'サイドはleftまたはrightで指定してください' }),
  }),
});

export const CreateCompatibilitySchema = z.object({
  left_element_id: z.string().uuid('無効な要素IDです'),
  right_element_id: z.string().uuid('無効な要素IDです'),
  compatibility_score_id: z.string().uuid('無効な相性スコアIDです'),
  reverse_compatibility_score_id: z
    .string()
    .uuid('無効な相性スコアIDです')
    .optional(),
});
```

## 6. レート制限

### 6.1 実装方針

```typescript
// レート制限ミドルウェア例
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(identifier: string, limit: number, windowMs: number) {
  const now = Date.now();
  const key = identifier;
  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count++;
  return true;
}

// 使用例
export async function middleware(req: NextRequest) {
  const ip = req.ip || 'unknown';

  if (!rateLimit(ip, 100, 60000)) {
    // 1分間に100リクエスト
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'リクエストが多すぎます',
        },
      },
      { status: 429 }
    );
  }

  return NextResponse.next();
}
```

## 7. セキュリティ

### 7.1 CORS設定

```typescript
// CORS設定例
export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
```

### 7.2 入力サニタイゼーション

- SQLインジェクション対策: Supabaseクライアントの使用
- XSS対策: 出力時のエスケープ処理
- CSRF対策: SameSite Cookie設定

## 8. パフォーマンス最適化

### 8.1 キャッシュ戦略

- 静的データのキャッシュ
- データベースクエリの最適化
- レスポンス圧縮

### 8.2 非同期処理

```typescript
// 非同期処理例
export async function POST(request: Request) {
  // メイン処理
  const result = await processMainLogic();

  // 非同期でログ記録
  setImmediate(async () => {
    await logActivity(request, result);
  });

  return NextResponse.json(result);
}
```

## 9. テスト戦略

### 9.1 単体テスト

- 各API関数のテスト
- バリデーション関数のテスト
- ユーティリティ関数のテスト

### 9.2 統合テスト

- APIエンドポイントのテスト
- データベース連携のテスト
- 認証・認可のテスト

### 9.3 テストツール

- Jest
- Supertest
- MSW (Mock Service Worker)

## 10. 次のステップ

このAPI詳細設計書が完了したら、以下の順序で設計書を作成：

1. **フロントエンド詳細設計書** - APIを活用するUI/UX設計
2. **実装順序・タスク分解書** - 開発計画

各設計書は、このAPI詳細設計書のエンドポイントとデータ構造を前提として作成される。

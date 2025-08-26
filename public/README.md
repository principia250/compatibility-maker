# Public フォルダ

このフォルダには、静的ファイル（画像、アイコン、ロゴなど）を格納します。

## フォルダ構成

```
public/
├── images/
│   ├── logos/          # ロゴ画像
│   ├── icons/          # アイコン画像
│   └── backgrounds/    # 背景画像
├── favicon.ico         # ファビコン
└── README.md           # このファイル
```

## 使用方法

### Next.jsでの参照方法

```tsx
// ロゴ画像の参照例
<img src="/images/logos/logo.png" alt="ロゴ" />

// アイコンの参照例
<img src="/images/icons/icon.svg" alt="アイコン" />

// 背景画像の参照例
<div style={{ backgroundImage: 'url(/images/backgrounds/bg.jpg)' }}>
```

### 推奨ファイル形式

- **ロゴ**: PNG, SVG（透明背景推奨）
- **アイコン**: SVG, PNG
- **背景画像**: JPG, PNG, WebP
- **ファビコン**: ICO, PNG

## 注意事項

- ファイル名は小文字とハイフンを使用（例: `logo-main.png`）
- 画像サイズは必要最小限に最適化
- SVGファイルは可能な限り使用（スケーラブルで軽量）

## 画像の最適化

Next.jsの`next/image`コンポーネントを使用することで、自動的に画像の最適化が行われます：

```tsx
import Image from 'next/image';

<Image
  src="/images/logos/logo.png"
  alt="ロゴ"
  width={200}
  height={60}
  priority
/>
```

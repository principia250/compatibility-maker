'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Github, 
  Twitter, 
  Mail,
  Heart
} from 'lucide-react';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-background border-t border-border mt-auto ${className}`}>
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ロゴ・説明 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CM</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                Compatibility Maker
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              格闘ゲームやゲーム全般における相性を整理し、可視化するアプリケーションです。
              テクニックの相性スコア管理やコメント・評価機能を提供します。
            </p>
          </div>

          {/* ナビゲーションリンク */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold">ナビゲーション</h3>
            <nav className="space-y-2">
              <Link 
                href="/charts" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                相性図一覧
              </Link>
              <Link 
                href="/demo" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                デモ
              </Link>
              <Link 
                href="/guidelines" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                ガイドライン
              </Link>
              <Link 
                href="/how-to-use" 
                className="block text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                使い方
              </Link>
            </nav>
          </div>

          {/* お問い合わせ・ソーシャル */}
          <div className="space-y-4">
            <h3 className="text-foreground font-semibold">お問い合わせ</h3>
            <div className="space-y-2">
              <Link 
                href="mailto:contact@example.com" 
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>お問い合わせ</span>
              </Link>
            </div>
            
            <div className="pt-4">
              <h4 className="text-foreground font-semibold text-sm mb-3">フォローする</h4>
              <div className="flex space-x-4">
                <Link 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Github className="w-5 h-5" />
                </Link>
                <Link 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* コピーライト・セパレーター */}
        <div className="border-t border-border mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-muted-foreground text-sm">
              <span>© {currentYear} Compatibility Maker. Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>in Japan</span>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <Link 
                href="/privacy" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                プライバシーポリシー
              </Link>
              <Link 
                href="/terms" 
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                利用規約
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

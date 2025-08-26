'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  User, 
  LogOut, 
  Settings, 
  Menu,
  X 
} from 'lucide-react';

export interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className={`bg-background border-b border-border shadow-sm ${className}`}>
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">CM</span>
              </div>
              <span className="text-xl font-bold text-foreground">
                Compatibility Maker
              </span>
            </Link>
          </div>

          {/* デスクトップナビゲーション */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/charts" 
              className="text-foreground hover:text-primary transition-colors"
            >
              相性図一覧
            </Link>
            <Link 
              href="/demo" 
              className="text-foreground hover:text-primary transition-colors"
            >
              デモ
            </Link>
            <Link 
              href="/guidelines" 
              className="text-foreground hover:text-primary transition-colors"
            >
              ガイドライン
            </Link>
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            {/* デスクトップユーザーメニュー */}
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleUserMenu}>
                <User className="w-4 h-4 mr-2" />
                ユーザー名
              </Button>
              <Button variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                ログアウト
              </Button>
            </div>

            {/* モバイルメニューボタン */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/charts" 
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                相性図一覧
              </Link>
              <Link 
                href="/demo" 
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                デモ
              </Link>
              <Link 
                href="/guidelines" 
                className="text-foreground hover:text-primary transition-colors px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                ガイドライン
              </Link>
              <div className="border-t border-border pt-3 mt-3">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <User className="w-4 h-4 mr-2" />
                  ユーザー名
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start mt-2">
                  <LogOut className="w-4 h-4 mr-2" />
                  ログアウト
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

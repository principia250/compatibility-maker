'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Pencil,
  User, 
  LogOut, 
  Menu,
  X,
  Globe,
  ChevronDown
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';

export interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [language, setLanguage] = useState<'ja' | 'en'>('en');
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);
  
  // カスタムフックからユーザーデータを取得
  const { user, isLoading, isAuthenticated, username, fetchUser, logout } = useUser();

  // クライアントサイドでのみ実行されることを保証
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 言語設定の読み込み
  useEffect(() => {
    if (isClient) {
      const savedLanguage = localStorage.getItem('language') as 'ja' | 'en' | null;
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
      setIsLanguageLoaded(true);
    }
  }, [isClient]);

  // ユーザーデータの取得
  useEffect(() => {
    if (isClient) {
      fetchUser();
    }
  }, [isClient, fetchUser]);

  // ドロップダウン外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isLanguageDropdownOpen) {
        const target = event.target as Element;
        if (!target.closest('.language-dropdown')) {
          setIsLanguageDropdownOpen(false);
        }
      }
    };

    if (isClient) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isLanguageDropdownOpen, isClient]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLanguageChange = (newLanguage: 'ja' | 'en') => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
    setIsLanguageDropdownOpen(false);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const getLanguageLabel = (lang: 'ja' | 'en') => {
    return lang === 'ja' ? '日本語' : 'English';
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
              className="hover:text-primary transition-colors"
            >
              <span className="flex items-center">
                Make
                <Pencil className="w-6 h-6" />
              </span>
            </Link>
          </nav>

          {/* ユーザーメニュー */}
          <div className="flex items-center space-x-4">
            {/* 言語選択セレクトボックス */}
            <div className="relative language-dropdown">
              <button
                onClick={toggleLanguageDropdown}
                className="flex items-center space-x-2 px-3 py-2 text-sm border border-border rounded-md bg-background hover:bg-accent transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span>{isLanguageLoaded ? getLanguageLabel(language) : 'English'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-background border border-border rounded-md shadow-lg z-50">
                  <button
                    onClick={() => handleLanguageChange('ja')}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors first:rounded-t-md ${
                      language === 'ja' ? 'bg-accent' : ''
                    }`}
                  >
                    日本語
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors last:rounded-b-md ${
                      language === 'en' ? 'bg-accent' : ''
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* デスクトップユーザーメニュー */}
            <div className="hidden md:flex items-center space-x-2">
               {isAuthenticated ? (
                 <>
                   <Button variant="ghost" size="sm" onClick={toggleUserMenu} disabled={isLoading}>
                     <User className="w-4 h-4 mr-2" />
                     {isLoading ? '読み込み中...' : username}
                   </Button>
                   <Button variant="outline" size="sm" onClick={logout} disabled={isLoading}>
                     <LogOut className="w-4 h-4 mr-2" />
                     ログアウト
                   </Button>
                 </>
               ) : (
                 <Button variant="outline" size="sm" asChild>
                   <Link href="/auth/sign-in">ログイン</Link>
                 </Button>
               )}
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
              {/* モバイル言語選択 */}
              <div className="px-2 py-1">
                <div className="relative language-dropdown">
                  <button
                    onClick={toggleLanguageDropdown}
                    className="flex items-center justify-between w-full px-3 py-2 text-sm border border-border rounded-md bg-background hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>{isLanguageLoaded ? getLanguageLabel(language) : 'English'}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isLanguageDropdownOpen && (
                    <div className="absolute left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-lg z-50">
                      <button
                        onClick={() => handleLanguageChange('ja')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors first:rounded-t-md ${
                          language === 'ja' ? 'bg-accent' : ''
                        }`}
                      >
                        日本語
                      </button>
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`w-full px-3 py-2 text-sm text-left hover:bg-accent transition-colors last:rounded-b-md ${
                          language === 'en' ? 'bg-accent' : ''
                        }`}
                      >
                        English
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-border pt-3 mt-3">
                {isAuthenticated ? (
                  <>
                    <Button variant="ghost" size="sm" className="w-full justify-start" disabled={isLoading}>
                      <User className="w-4 h-4 mr-2" />
                      {isLoading ? '読み込み中...' : username}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start mt-2"
                      onClick={logout}
                      disabled={isLoading}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      ログアウト
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/auth/sign-in">ログイン</Link>
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

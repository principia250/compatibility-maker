'use client';

import React, {useEffect, useState} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { 
  Pencil,
  User, 
  LogOut, 
  Menu,
  X,
  Globe,
  ChevronDown,
  Search,
} from 'lucide-react';
import { useUser } from '@/hooks/use-user';
import { useLanguage } from '@/hooks/use-language';
import clsx from 'clsx';

export interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  
  // カスタムフックからユーザーデータを取得
  const { user, isLoading, isAuthenticated, username, fetchUser, logout } = useUser();
  
  // 言語設定を取得
  const { language, changeLanguage } = useLanguage();

  // クライアントサイドでのみ実行されることを保証
  useEffect(() => {
    setIsClient(true);
  }, []);


  // ユーザーデータの取得
  useEffect(() => {
    if (isClient) {
      fetchUser();
    }
  }, [isClient, fetchUser]);

  // ドロップダウン外側クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      if (isLanguageDropdownOpen && !target.closest('.language-dropdown')) {
        setIsLanguageDropdownOpen(false);
      }
      
      if (isUserMenuOpen && !target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isClient) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isLanguageDropdownOpen, isUserMenuOpen, isClient]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLanguageChange = (newLanguage: 'ja' | 'en') => {
    changeLanguage(newLanguage);
    setIsLanguageDropdownOpen(false);
  };

  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen);
  };

  const getLanguageLabel = (lang: 'ja' | 'en') => {
    return lang === 'ja' ? '日本語' : 'English';
  };

  return (
    <header className={`bg-background border-b border-white ${className}`}>
      <div className="max-w-[900px] mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 左寄り */}
          <div className="flex sm:flex-row flex-col items-center space-x-2">
            {/* ロゴ */}
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/images/logos/logo.png"
                alt="Compatibility Maker"
                width={48}
                height={48}
                className="hidden sm:block"
              />
              <div>
                <div className="text-lg sm:text-xl font-bold text-primary">SOUKOKU</div>
                <div className="text-sm hidden sm:block">Compatibility Maker</div>
              </div>
            </Link>
            <div className="text-sm bg-red-700 h-[20px] w-[56px] rounded-full flex items-center justify-center">Alpha</div>
            {/* <div className="text-sm bg-blue-700 h-[20px] w-[56px] rounded-full flex items-center justify-center">Beta</div> */}
          </div>

          {/* 右寄り */}
          <div className="flex items-center space-x-2">
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/search" 
                className="hover:text-primary flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
              <Link 
                href={isAuthenticated ? "/mypage" : "/auth/login"}
                className="hover:text-primary flex items-center gap-2"
              >
                <Pencil className="w-4 h-4" />
                Create
              </Link>
            </nav>
            {/* 言語選択セレクトボックス */}
            <div className="relative language-dropdown text-xs sm:text-sm">
              <button
                onClick={toggleLanguageDropdown}
                className="flex items-center space-x-2 px-3 py-2 rounded-md bg-background"
              >
                <Globe className="w-4 h-4" />
                <span>{getLanguageLabel(language)}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isLanguageDropdownOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-background border border-white rounded-md z-50 p-1">
                  <button
                    onClick={() => handleLanguageChange('ja')}
                    className={clsx(
                      "w-full px-3 py-2 text-left rounded-sm",
                      "border border-transparent hover:border-white"
                    )}
                  >
                    日本語
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={clsx(
                      "w-full px-3 py-2 text-left rounded-sm",
                      "border border-transparent hover:border-white"
                    )}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {/* ユーザーメニュー */}
            <div className="flex items-center space-x-4">
              {/* デスクトップユーザーメニュー */}
              <div className="hidden md:flex items-center space-x-2">
                {isAuthenticated ? (
                  <div className="relative user-menu">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={toggleUserMenu} 
                      disabled={isLoading}
                      className="flex items-center gap-2"
                    >
                      {isLoading ? 'Loading...' : username}
                      <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                    </Button>
                    
                    {isUserMenuOpen && (
                      <div className="absolute right-0 mt-1 w-40 bg-background border border-white rounded-md z-50 p-1">
                        <Link
                          href="/mypage"
                          className="block w-full px-3 py-2 text-sm text-left rounded-sm border border-transparent hover:border-white"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          My page
                        </Link>
                        <Link
                          href="/account"
                          className="block w-full px-3 py-2 text-sm text-left rounded-sm border border-transparent hover:border-white"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Account
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="text-destructive flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-sm border border-transparent hover:border-white"
                          disabled={isLoading}
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/auth/login">Log in</Link>
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
        </div>


        {/* モバイルメニュー */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-white py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/search" 
                className="hover:text-primary flex items-center px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Link>
              <Link 
                href={isAuthenticated ? "/mypage" : "/auth/login"}
                className="hover:text-primary flex items-center px-2 py-1"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Create
              </Link>

              <div className="border-t border-white pt-3 mt-3">
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
                      Log out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                    <Link href="/auth/login">Log in</Link>
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

'use client';

import React from 'react';
import CustomLink from '@/components/CustomLink';
import { 
  X,
  Mail,
  Heart,
  ExternalLink
} from 'lucide-react';

export interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = '' }) => {

  return (
    <footer className={`bg-background border-t border-white mt-auto ${className}`}>
      <div className="max-w-[900px] mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          {/* 左側: リンク */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <CustomLink href="/privacy" className="text-sm hover:text-primary transition-colors">
              Privacy Policy
            </CustomLink>
            <CustomLink href="/guidelines" className="text-sm hover:text-primary transition-colors">
              Guidelines
            </CustomLink>
          </div>
          
          {/* 右側: 連絡先 */}
          <div className="flex flex-col gap-3">
            <div className="text-sm text-gray-400">Contact</div>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Xアカウント */}
              <a
                href="https://x.com/SOUKOKU_app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
              >
                <X className="w-4 h-4" />
                <span>@SOUKOKU_app</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              {/* メールアドレス */}
              <a
                href="mailto:soukoku.app@gmail.com"
                className="flex items-center gap-2 text-sm hover:text-primary transition-colors group"
              >
                <Mail className="w-4 h-4" />
                <span>soukoku.app@gmail.com</span>
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </div>
        
        {/* 下部: コピーライト */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-red-500" />
              <span>by SOUKOKU</span>
            </div>
            <div>© 2025 SOUKOKU Compatibility Maker. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

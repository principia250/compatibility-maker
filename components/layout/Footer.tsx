'use client';

import React from 'react';
import CustomLink from '@/components/CustomLink';
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

  return (
    <footer className={`bg-background border-t border-white mt-auto ${className}`}>
      <div className="max-w-[900px] mx-auto px-4 py-8 flex flex-row sm:justify-end">
       <div className="flex flex-col gap-2">
        <CustomLink href="/privacy">Privacy Policy</CustomLink>
        <CustomLink href="/guidelines">Guidelines</CustomLink>
        <span>Contact:(ここにXのアカウントとメアド)</span>
       </div>
      </div>
    </footer>
  );
};

export default Footer;

import React from 'react';
import fs from 'fs';
import path from 'path';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

export default function PrivacyPage() {
  // マークダウンファイルを読み込み
  const markdownPath = path.join(process.cwd(), 'app/privacy/privacy-policy.md');
  const markdownContent = fs.readFileSync(markdownPath, 'utf8');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MarkdownRenderer content={markdownContent} />
      </div>
    </div>
  );
}

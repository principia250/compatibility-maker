import React from 'react';
import fs from 'fs';
import path from 'path';
import { MarkdownRenderer } from '@/components/markdown/markdown-renderer';

export default function GuidelinesPage() {
  // マークダウンファイルを読み込み
  const markdownPath = path.join(process.cwd(), 'app/guidelines/guidelines.md');
  const markdownContent = fs.readFileSync(markdownPath, 'utf8');

  return (
    <MarkdownRenderer content={markdownContent} />
  );
}

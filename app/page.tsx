'use client';

import Image from 'next/image';
import { useTranslation } from '@/lib/i18n';

const NewsCard = ({ date, content }: { date: string, content: string }) => {
  const { t } = useTranslation();
  
  return (
    <div className="border-b border-white p-2">
      <div className="text-sm text-white">
        {date}
      </div>
      <div className="text-white">
        {content}
      </div>
    </div>
  );
};

export default function HomePage() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col gap-4">
      {/* タイトル */}
      <div className="flex justify-center">
        <div className="flex flex-row gap-2">
          <Image
            src="/images/logos/logo.png"
            alt="Compatibility Maker"
            width={60}
            height={60}
          />
          <div>
            <h1 className="text-3xl font-bold text-primary">
              SOUKOKU
            </h1>
            <div className="text-xl">{t("相性メーカー","Compatibility Maker")}</div>
          </div>
        </div>
      </div>

      {/* 説明 */}
      <div 
        dangerouslySetInnerHTML={{
          __html: t(
            'このサイトは、ゲーム等における相性を整理し、可視化するアプリケーションです。あなたがゲームの理解を深めることを助け、戦略を立てることを支援します。<br /><br />作成した相性図は公開し、他のユーザーと共有することができます。<br /><br />ゲームを愛するすべての人にとって、このサイトが役立つことを願っています。',
            'This site is an application for organizing and visualizing compatibility in games. It helps you deepen your understanding of games and supports you in developing strategies.<br /><br />Created compatibility charts can be made public and shared with other users.<br /><br />We hope this site will be useful for everyone who loves games.'
          )
        }}
      />

      {/* 開発中のお知らせ */}
      <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 text-sm">
        <div className="font-semibold text-yellow-400 mb-2">
          ⚠️ {t('開発中のお知らせ', 'Development Notice')}
        </div>
        <ul className="space-y-1 text-yellow-200">
          <li>• {t('現在アルファ版のため、サービス内容が変更される可能性があります', 'Currently in alpha version, service content may change')}</li>
          <li>• {t('不具合が発生する場合があります', 'Bugs may occur')}</li>
          <li>• {t('将来的に広告や有料プランを導入予定です', 'We plan to introduce ads and paid plans in the future')}</li>
        </ul>
      </div>

      {/* お知らせ */}
      <div>
        {/* 見出し */}
        <h2>
          News
        </h2>
        {/* コンテンツ部分 */}
        <div className="border border-white rounded-lg p-4">
          <NewsCard date="2025/09/05" content={t('サイトを公開しました。', 'The site is now open.')} />
        </div>
      </div>
    </div>
  );
}

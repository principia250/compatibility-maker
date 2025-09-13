'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTranslation } from '@/lib/i18n';

export default function Page() {
  const { t } = useTranslation();
  return (
    <div className="flex w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                Thank you for signing up!
              </CardTitle>
              <CardDescription>
                {t(
                  'メールを確認してアカウントを確定してください',
                  'Check your email to confirm'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {t(
                  'サインアップが完了しました。メールを確認してアカウントを確定してください。',
                  'You&apos;ve successfully signed up. Please check your email to confirm your account before signing in.'
                )}
              </p>
              <p className="text-sm">
                {t(
                  '迷惑メールフォルダに入っている場合がありますので、お手数ですがご確認ください。',
                  'Please check your email folder for spam.'
                )}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

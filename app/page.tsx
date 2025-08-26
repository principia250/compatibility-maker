import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectSupabaseSteps } from "@/components/tutorial/connect-supabase-steps";
import { SignUpUserSteps } from "@/components/tutorial/sign-up-user-steps";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen p-8">
      <div className="w-full">
        <h1 className="text-3xl font-bold mb-6">
          Compatibility Maker
        </h1>
        <p className="text-lg mb-4">
          格闘ゲームやゲーム全般における相性を整理し、可視化するアプリケーションです。
        </p>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">機能</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>相性図の作成・編集</li>
              <li>テクニックの相性スコア管理</li>
              <li>コメント・評価機能</li>
              <li>ユーザー管理</li>
            </ul>
          </div>
          <div className="p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">デモ</h2>
            <p>
              <a href="/demo" className="text-primary hover:underline">
                相性図のデモ画面を見る
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

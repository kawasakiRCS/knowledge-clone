/**
 * パスワードリセット完了ページ
 * 
 * 旧システムの reset_result.jsp を移植
 * - パスワードリセット処理が完了したことを通知
 * - トップページへのリンクを提供
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';

export default function PasswordResetResultPage() {
  const { t } = useLocale();

  return (
    <>
      <h4 className="title">{t('knowledge.auth.title.forgot.password')}</h4>

      {t('knowledge.auth.msg.changed')}

      <br /><br />
      <br /><br />

      <Link href="/">{t('knowledge.auth.label.back.top')}</Link>
    </>
  );
}
/**
 * サインアップ完了ページ
 * 
 * @description メール認証後のサインアップ完了通知
 */
'use client';

import React from 'react';
import Link from 'next/link';
import { useLocale } from '@/hooks/useLocale';
import { MainLayout } from '@/components/layout/MainLayout';

const SignupDonePage: React.FC = () => {
  const { t } = useLocale();

  return (
    <MainLayout>
      <h4 className="title">{t('knowledge.signup.title')}</h4>

      <p>
        {t('knowledge.signup.done')}
      </p>

      <p>
        <Link 
          href="/open/knowledge/list" 
          className="btn btn-info"
        >
          {t('knowledge.signup.done.link')}
        </Link>
      </p>
    </MainLayout>
  );
};

export default SignupDonePage;
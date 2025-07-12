/**
 * メール送信完了ページ
 * 
 * @description サインアップ時のメール送信完了通知
 */
'use client';

import React from 'react';
import { useLocale } from '@/hooks/useLocale';
import { MainLayout } from '@/components/layout/MainLayout';

const MailSendedPage: React.FC = () => {
  const { t } = useLocale();

  return (
    <MainLayout>
      <h4 className="title">{t('knowledge.registration.result.title')}</h4>

      <p dangerouslySetInnerHTML={{ __html: t('knowledge.registration.msg.mail') }} />

      <hr />

      <div className="alert alert-info" role="alert">
        <span dangerouslySetInnerHTML={{ __html: t('knowledge.registration.msg.mail.info') }} />
      </div>
    </MainLayout>
  );
};

export default MailSendedPage;
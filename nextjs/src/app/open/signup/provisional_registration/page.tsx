'use client';

import React from 'react';
import { MainLayout } from '@/components/layout';

/**
 * 仮登録ページコンポーネント
 * 
 * @description 管理者承認待ち状態を通知するページ
 */
const ProvisionalRegistrationPage: React.FC = () => {
  return (
    <MainLayout>
      <h4 className="title">登録受付結果</h4>
      
      <div dangerouslySetInnerHTML={{ 
        __html: '登録を受け付けました。<br/>本サービスの利用開始は、管理者の確認が必要になっています。<br/>管理者の確認までしばらくお待ちください。' 
      }} />
    </MainLayout>
  );
};

export default ProvisionalRegistrationPage;
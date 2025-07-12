'use client';

import React from 'react';
import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';

/**
 * サインアップ完了ページコンポーネント
 * 
 * @description ユーザー登録完了後に表示される確認ページ
 * @returns サインアップ完了ページ
 */
const SignupDonePage: React.FC = () => {
  return (
    <MainLayout>
      <h4 className="title">ユーザ新規登録</h4>
      
      <p>
        ユーザ登録が完了しました
      </p>
      
      <p>
        <Link href="/open/knowledge/list" className="btn btn-info">
          Knowledge の利用開始
        </Link>
      </p>
    </MainLayout>
  );
};

export default SignupDonePage;
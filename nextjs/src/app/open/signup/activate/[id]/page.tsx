/**
 * メール認証ページ
 * 
 * @description 招待メールからの本登録処理
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import MainLayout from '@/components/layout/MainLayout';

interface ActivatePageProps {
  params: {
    id: string;
  };
}

const ActivatePage: React.FC<ActivatePageProps> = ({ params }) => {
  const router = useRouter();
  const { t } = useLocale();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const activate = async () => {
      try {
        const response = await fetch(`/api/signup/activate/${params.id}`);
        const data = await response.json();

        if (response.ok) {
          // Set authentication (in real app, this would set cookies/session)
          // For now, just redirect to signup done page
          router.push('/open/signup/signup_done');
        } else {
          setError(data.error || 'Activation failed');
          setIsProcessing(false);
        }
      } catch (err) {
        console.error('Activation error:', err);
        setError('An error occurred during activation');
        setIsProcessing(false);
      }
    };

    activate();
  }, [params.id, router]);

  if (isProcessing) {
    return (
      <MainLayout>
        <div className="text-center">
          <i className="fa fa-spinner fa-spin fa-3x"></i>
          <p className="mt-3">Processing activation...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Activation Error</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Please check your activation link or contact support if the problem persists.
          </p>
        </div>
      </MainLayout>
    );
  }

  return null;
};

export default ActivatePage;
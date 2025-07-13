'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import KnowledgeView from '@/components/knowledge/KnowledgeView';
// エラーページコンポーネント
import ErrorPageComponent from '@/components/error/ErrorPage';
import NotFoundPageComponent from '@/components/error/NotFoundPage';
import ForbiddenPageComponent from '@/components/error/ForbiddenPage';
import { Knowledge } from '@/types/knowledge';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

const KnowledgeViewPage: React.FC<Props> = ({ params }) => {
  const [knowledge, setKnowledge] = useState<Knowledge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<number | null>(null);
  const [knowledgeId, setKnowledgeId] = useState<string | null>(null);

  useEffect(() => {
    // Promise型のparamsを解決
    params.then((resolvedParams) => {
      setKnowledgeId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (!knowledgeId) return;
    
    const fetchKnowledge = async () => {
      try {
        const response = await fetch(`/api/knowledge/${knowledgeId}`);
        
        if (!response.ok) {
          setError(response.status);
          return;
        }

        const data = await response.json();
        setKnowledge(data);
      } catch (err) {
        console.error('Failed to fetch knowledge:', err);
        setError(500);
      } finally {
        setLoading(false);
      }
    };

    fetchKnowledge();
  }, [knowledgeId]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center" style={{ padding: '100px 0' }}>
          <i className="fa fa-spinner fa-spin fa-3x"></i>
          <p>読み込み中...</p>
        </div>
      </MainLayout>
    );
  }

  if (error === 404) {
    return <NotFoundPageComponent />;
  }

  if (error === 403) {
    return <ForbiddenPageComponent />;
  }

  if (error) {
    return <ErrorPageComponent statusCode={error} />;
  }

  if (!knowledge) {
    return (
      <MainLayout>
        <div className="text-center" style={{ padding: '100px 0' }}>
          <p>ナレッジが見つかりません。</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle={`${knowledge.title} - Knowledge`}>
      <KnowledgeView knowledge={knowledge as any} />
    </MainLayout>
  );
};

export default KnowledgeViewPage;
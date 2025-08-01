'use client';

import React, { useEffect, useState } from 'react';
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
    // Promise型のparamsを解決（テスト環境対応）
    const resolveParams = async () => {
      try {
        // paramsがPromiseかどうかを確認
        const resolvedParams = await Promise.resolve(params);
        setKnowledgeId(resolvedParams.id);
      } catch (error) {
        console.error('Failed to resolve params:', error);
      }
    };
    
    resolveParams();
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
      <div className="text-center" style={{ padding: '100px 0' }}>
        <i className="fa fa-spinner fa-spin fa-3x"></i>
        <p>読み込み中...</p>
      </div>
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
      <div className="text-center" style={{ padding: '100px 0' }}>
        <p>ナレッジが見つかりません。</p>
      </div>
    );
  }

  return <KnowledgeView knowledge={knowledge as any} />;
};

export default KnowledgeViewPage;
/**
 * 閲覧履歴表示ページ
 * 
 * @description Cookie/LocalStorageに保存された閲覧履歴を表示する
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLocale } from '@/lib/hooks/useLocale';
import { StockKnowledge } from '@/types/knowledge';
import KnowledgeListItem from '@/components/knowledge/KnowledgeListItem';
import KnowledgeSubList from '@/components/knowledge/KnowledgeSubList';

// 履歴IDを取得する関数
const getHistoryIds = (): string[] => {
  const ids: string[] = [];
  
  // Cookieから取得
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'KNOWLEDGE_HISTORY' && value) {
      const cookieIds = value.split(',').filter(id => /^\d+$/.test(id));
      ids.push(...cookieIds);
    }
  }
  
  // LocalStorageから取得（Cookieになければ）
  if (ids.length === 0) {
    const localHistory = localStorage.getItem('knowledge_history');
    if (localHistory) {
      const localIds = localHistory.split(',').filter(id => /^\d+$/.test(id));
      ids.push(...localIds);
    }
  }
  
  // 重複を除去して返す
  return [...new Set(ids)];
};

export default function KnowledgeShowHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { t, locale } = useLocale();
  const [knowledges, setKnowledges] = useState<StockKnowledge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoryKnowledges = async () => {
      try {
        setLoading(true);
        const historyIds = getHistoryIds();
        
        if (historyIds.length === 0) {
          setKnowledges([]);
          return;
        }
        
        const response = await fetch(`/api/knowledge/show-history?ids=${historyIds.join(',')}`, {
          headers: {
            'Accept-Language': locale,
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch history: ${response.status}`);
        }
        
        const data = await response.json();
        setKnowledges(data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoryKnowledges();
  }, [locale]);

  return (
    <>
      {/* タブナビゲーション */}
      <div className="row">
        <ul className="nav nav-tabs">
          <li role="presentation">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push('/open/knowledge/list');
              }}
              role="tab"
            >
              {t('knowledge.list.kind.list')}
            </a>
          </li>
          <li role="presentation">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push('/open/knowledge/popularity');
              }}
              role="tab"
            >
              {t('knowledge.list.kind.popular')}
            </a>
          </li>
          {user && (
            <li role="presentation">
              <a 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/open/knowledge/stocks');
                }}
                role="tab"
              >
                {t('knowledge.list.kind.stock')}
              </a>
            </li>
          )}
          <li role="presentation" className="active">
            <a 
              href="#"
              onClick={(e) => {
                e.preventDefault();
              }}
              role="tab"
            >
              {t('knowledge.list.kind.history')}
            </a>
          </li>
        </ul>
      </div>

      {/* リスト */}
      <div className="row" id="knowledgeList">
        {/* メインコンテンツ */}
        <div className="col-sm-12 col-md-8 knowledge_list">
          {loading ? (
            <div className="text-center">
              <i className="fa fa-spinner fa-pulse fa-2x"></i>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              {error}
            </div>
          ) : knowledges.length === 0 ? (
            <div>{t('knowledge.list.empty')}</div>
          ) : (
            knowledges.map((knowledge) => (
              <KnowledgeListItem 
                key={knowledge.knowledgeId}
                knowledge={knowledge}
                showUnread={!knowledge.viewed}
              />
            ))
          )}
        </div>

        {/* サイドバー */}
        <div className="col-sm-12 col-md-4 sub_list">
          <KnowledgeSubList />
        </div>
      </div>
    </>
  );
}
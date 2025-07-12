/**
 * ナレッジ編集履歴一覧ページ
 * 
 * @description 特定のナレッジの編集履歴を表示
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, notFound } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';

interface KnowledgeHistory {
  historyNo: number;
  knowledgeId: number;
  title: string;
  updateUser: number;
  userName: string;
  updateDatetime: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function KnowledgeHistoriesPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const knowledgeId = params.id;
  const pageParam = searchParams.get('page') || '0';
  const page = parseInt(pageParam, 10);
  
  const [histories, setHistories] = useState<KnowledgeHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URLパラメータの維持
  const currentParams = searchParams.toString();
  const connect = currentParams ? '&' : '?';
  const paramsWithConnect = currentParams ? `?${currentParams}` : '';

  useEffect(() => {
    fetchHistories();
  }, [knowledgeId, page]);

  useEffect(() => {
    // echo.js初期化（画像遅延読み込み）
    if (typeof window !== 'undefined' && (window as any).echo) {
      (window as any).echo.init();
    }
  }, [histories]);

  const fetchHistories = async () => {
    try {
      const response = await fetch(`/api/knowledge/histories/${knowledgeId}?page=${page}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error('Failed to fetch histories');
      }

      const data = await response.json();
      setHistories(data.histories || []);
    } catch (err) {
      console.error('Error fetching histories:', err);
      setError('履歴の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const headContent = (
    <>
      <script src="/bower/echojs/dist/echo.min.js"></script>
    </>
  );

  const scriptsContent = (
    <script dangerouslySetInnerHTML={{
      __html: `
        if (typeof echo !== 'undefined') {
          echo.init();
        }
      `
    }} />
  );

  if (loading) {
    return (
      <MainLayout pageTitle="ナレッジの編集履歴" headContent={headContent}>
        <div className="container">
          <h4 className="title">読み込み中...</h4>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout pageTitle="ナレッジの編集履歴" headContent={headContent}>
        <div className="container">
          <h4 className="title">エラー</h4>
          <p>{error}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      pageTitle="ナレッジの編集履歴" 
      headContent={headContent}
      scriptsContent={scriptsContent}
    >
      <div className="container">
        <h4 className="title">
          ナレッジの編集履歴 page[{page + 1}]
        </h4>

        {/* ページネーション（上部） */}
        <nav>
          <ul className="pager">
            <li className="previous">
              <Link href={`/open.knowledge/histories/${knowledgeId}${paramsWithConnect}${connect}page=${Math.max(0, page - 1)}`}>
                <span aria-hidden="true">&larr;</span>前へ
              </Link>
            </li>
            <li className="next">
              <Link href={`/open.knowledge/histories/${knowledgeId}${paramsWithConnect}${connect}page=${page + 1}`}>
                次へ <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* 履歴一覧 */}
        <div className="list-group">
          {histories.length === 0 ? (
            <div>履歴はありません</div>
          ) : (
            histories.map((history) => (
              <Link
                key={history.historyNo}
                href={`/open.knowledge/history/${knowledgeId}${paramsWithConnect}${connect}page=${page}&history_no=${history.historyNo}`}
                className="list-group-item"
              >
                <img
                  src="/images/loader.gif"
                  data-echo={`/open.account/icon/${history.updateUser}`}
                  alt="icon"
                  width="36"
                  height="36"
                  style={{ float: 'left' }}
                />

                <h4 className="list-group-item-heading">
                  {history.historyNo} {history.title}
                </h4>

                <p className="list-group-item-text">
                  <i className="fa fa-calendar"></i>&nbsp;{formatDate(history.updateDatetime)}
                  <i className="fa fa-user"></i>&nbsp;
                  {history.userName}
                </p>
              </Link>
            ))
          )}
        </div>

        {/* ページネーション（下部） */}
        <nav>
          <ul className="pager">
            <li className="previous">
              <Link href={`/open.knowledge/histories/${knowledgeId}${paramsWithConnect}${connect}page=${Math.max(0, page - 1)}`}>
                <span aria-hidden="true">&larr;</span>前へ
              </Link>
            </li>
            <li className="next">
              <Link href={`/open.knowledge/histories/${knowledgeId}${paramsWithConnect}${connect}page=${page + 1}`}>
                次へ <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* 戻るボタン */}
        <Link
          href={`/open.knowledge/view/${knowledgeId}${paramsWithConnect}`}
          className="btn btn-warning"
          role="button"
        >
          <i className="fa fa-undo"></i>&nbsp;戻る
        </Link>

        <Link
          href={`/open.knowledge/list/0${paramsWithConnect}`}
          className="btn btn-success"
          role="button"
        >
          <i className="fa fa-list-ul"></i>&nbsp;ナレッジ一覧へ戻る
        </Link>
      </div>
    </MainLayout>
  );
}
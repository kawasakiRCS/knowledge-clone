'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import NotFoundPage from '@/components/error/NotFoundPage';
import ForbiddenPage from '@/components/error/ForbiddenPage';
import ServerErrorPage from '@/components/error/ServerErrorPage';

interface Like {
  no: number;
  knowledgeId: number;
  insertUser: number;
  userName?: string | null;
  insertDatetime: string;
}

interface LikesResponse {
  knowledgeId: number;
  likes: Like[];
  page: number;
  previous: number;
  next: number;
}

interface PageProps {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function KnowledgeLikesPage({ params, searchParams }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [data, setData] = useState<LikesResponse | null>(null);
  const { isAuthenticated } = useAuth();

  const knowledgeId = params.id;
  const page = searchParams.page ? parseInt(searchParams.page as string) : 0;

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        
        const response = await fetch(`/api/knowledge/likes/${knowledgeId}?${queryParams}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          setError({ status: response.status, message: errorData.error });
          setLoading(false);
          return;
        }

        const result: LikesResponse = await response.json();
        setData(result);
      } catch (err) {
        setError({ status: 500, message: 'Failed to fetch likes' });
      } finally {
        setLoading(false);
      }
    };

    fetchLikes();
  }, [knowledgeId, page]);

  // クエリパラメータを保持してページ番号を追加する関数
  const buildPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'page' && value) {
        params.append(key, Array.isArray(value) ? value[0] : value);
      }
    });
    params.append('page', pageNum.toString());
    return `/knowledge/likes/${knowledgeId}?${params.toString()}`;
  };

  // 日時フォーマット関数
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    if (error.status === 404) {
      return <NotFoundPage />;
    } else if (error.status === 403) {
      return <ForbiddenPage />;
    } else {
      return <ServerErrorPage />;
    }
  }

  if (!data) {
    return <ServerErrorPage />;
  }

  return (
    <div className="container">
      <h4 className="title">「いいね！」を押してくれたユーザ一覧</h4>

      {/* ページネーション（上部） */}
      <nav>
        <ul className="pager">
          {data.previous >= 0 && (
            <li className="previous">
              <Link href={buildPageUrl(data.previous)} aria-label="Previous">
                <span aria-hidden="true">&larr;</span> Previous
              </Link>
            </li>
          )}
          {data.next >= 0 && (
            <li className="next">
              <Link href={buildPageUrl(data.next)} aria-label="Next">
                Next <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* ユーザー一覧 */}
      <div className="list-group" role="list">
        {data.likes.map((like) => (
          <div key={like.no} className="list-group-item">
            <h4 className="list-group-item-heading">
              <i className="fa fa-user"></i>&nbsp;
              {like.userName || 'Anonymous'}
            </h4>
            <p className="list-group-item-text">
              <i className="fa fa-calendar"></i>&nbsp;
              {formatDateTime(like.insertDatetime)}
            </p>
          </div>
        ))}
      </div>

      {/* ページネーション（下部） */}
      <nav>
        <ul className="pager">
          {data.previous >= 0 && (
            <li className="previous">
              <Link href={buildPageUrl(data.previous)} aria-label="Previous">
                <span aria-hidden="true">&larr;</span> Previous
              </Link>
            </li>
          )}
          {data.next >= 0 && (
            <li className="next">
              <Link href={buildPageUrl(data.next)} aria-label="Next">
                Next <span aria-hidden="true">&rarr;</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* 戻るボタン */}
      <Link href={`/knowledge/view/${knowledgeId}`} className="btn btn-warning" role="button">
        <i className="fa fa-undo"></i>&nbsp;← 戻る
      </Link>
      <Link href="/knowledge/list" className="btn btn-success" role="button">
        <i className="fa fa-list-ul"></i>&nbsp;ナレッジ一覧へ
      </Link>
    </div>
  );
}
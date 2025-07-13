'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import MainLayout from '@/components/layout/MainLayout';
import KnowledgeListItem from '@/components/knowledge/KnowledgeListItem';
import KnowledgeSubList from '@/components/knowledge/KnowledgeSubList';
import { StockKnowledge } from '@/types/knowledge';
import { StocksEntity } from '@/types/stock';

interface PageParams {
  searchParams: {
    stockid?: string;
    offset?: string;
  };
}

interface StocksResponse {
  stocks: StockKnowledge[];
  stock: StocksEntity | null;
  pagination: {
    offset: number;
    limit: number;
    total: number;
  };
}

export function KnowledgeStocksPage({ searchParams }: PageParams) {
  const { isAuthenticated } = useAuth();
  const [stocks, setStocks] = useState<StockKnowledge[]>([]);
  const [selectedStock, setSelectedStock] = useState<StocksEntity | null>(null);
  const [pagination, setPagination] = useState({ offset: 0, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const offset = parseInt(searchParams.offset || '0', 10);
  const stockId = searchParams.stockid;

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('offset', offset.toString());
        if (stockId) {
          params.append('stockid', stockId);
        }

        const response = await fetch(`/api/knowledge/stocks?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch stocks');
        }

        const data: StocksResponse = await response.json();
        setStocks(data.stocks);
        setSelectedStock(data.stock);
        setPagination(data.pagination);
      } catch (err) {
        setError('エラーが発生しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, [offset, stockId]);

  const stockParam = stockId ? `?stockid=${stockId}` : '';
  const previousOffset = Math.max(0, offset - 1);
  const nextOffset = offset + 1;
  const hasNext = (offset + 1) * pagination.limit < pagination.total;
  const hasPrevious = offset > 0;

  return (
    <MainLayout>
      {/* Title */}
      <div className="row">
        <ul className="nav nav-tabs" role="tablist">
          <li role="presentation">
            <Link href="/open/knowledge/list" role="tab">
              一覧
            </Link>
          </li>
          <li role="presentation">
            <Link href="/open/knowledge/show_popularity" role="tab">
              人気
            </Link>
          </li>
          {isAuthenticated && (
            <li role="presentation" className="active">
              <Link href="/open/knowledge/stocks" role="tab">
                ストック一覧
              </Link>
            </li>
          )}
          <li role="presentation">
            <Link href="/open/knowledge/show_history" role="tab">
              履歴
            </Link>
          </li>
        </ul>
      </div>

      <div className="row">
        <div className="col-sm-12 selected_tag">
          {selectedStock && (
            <Link
              className="text-link"
              href={`/open/knowledge/stocks?stockid=${selectedStock.stockId}`}
            >
              <i className="fa fa-star-o"></i>&nbsp;{selectedStock.stockName}
            </Link>
          )}
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12 text-right">
          <Link href="/protect/stock/mylist">
            &gt;&gt; ストック管理
          </Link>
        </div>
      </div>

      {/* リスト */}
      <div className="row" id="knowledgeList">
        {loading ? (
          <div className="col-sm-12">
            <p>読み込み中...</p>
          </div>
        ) : error ? (
          <div className="col-sm-12">
            <p className="text-danger">{error}</p>
          </div>
        ) : (
          <>
            <div className="col-sm-9">
              {stocks.length === 0 ? (
                <div className="well">
                  <p>ストックしたナレッジはありません。</p>
                </div>
              ) : (
                stocks.map((stock) => (
                  <KnowledgeListItem key={stock.knowledgeId} knowledge={stock} />
                ))
              )}
            </div>
            <div className="col-sm-3">
              <KnowledgeSubList />
            </div>
          </>
        )}
      </div>

      {/* Pager */}
      {!loading && !error && stocks.length > 0 && (
        <nav>
          <ul className="pager">
            <li className={`previous ${!hasPrevious ? 'disabled' : ''}`}>
              {hasPrevious ? (
                <Link href={`/open/knowledge/stocks/${previousOffset}${stockParam}`}>
                  <span aria-hidden="true">&larr;</span>前へ
                </Link>
              ) : (
                <span>
                  <span aria-hidden="true">&larr;</span>前へ
                </span>
              )}
            </li>
            <li className={`next ${!hasNext ? 'disabled' : ''}`}>
              {hasNext ? (
                <Link href={`/open/knowledge/stocks/${nextOffset}${stockParam}`}>
                  次へ <span aria-hidden="true">&rarr;</span>
                </Link>
              ) : (
                <span>
                  次へ <span aria-hidden="true">&rarr;</span>
                </span>
              )}
            </li>
          </ul>
        </nav>
      )}
    </MainLayout>
  );
}

export default KnowledgeStocksPage;
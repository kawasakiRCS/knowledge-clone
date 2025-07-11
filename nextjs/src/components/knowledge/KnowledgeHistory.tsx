'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { formatDate } from '@/lib/utils';

/**
 * 履歴エンティティの型定義
 */
interface KnowledgeHistory {
  historyNo: number;
  knowledgeId: number;
  updateUser: string;
  userName: string;
  updateDatetime: string;
  content: string;
}

/**
 * 現在のナレッジエンティティの型定義
 */
interface CurrentKnowledge {
  knowledgeId: number;
  title: string;
  content: string;
}

/**
 * KnowledgeHistoryコンポーネントのプロパティ
 */
interface KnowledgeHistoryProps {
  history: KnowledgeHistory;
  current: CurrentKnowledge;
  page: number;
  params?: string;
}

/**
 * ナレッジ履歴詳細表示コンポーネント
 * 
 * @description 特定の履歴バージョンと現在のバージョンの差分を表示
 */
export default function KnowledgeHistory({
  history,
  current,
  page,
  params = '',
}: KnowledgeHistoryProps) {
  const diffContainerRef = useRef<HTMLDivElement>(null);
  const historyContentRef = useRef<HTMLTextAreaElement>(null);
  const nowContentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // diff2htmlライブラリの動的読み込みと差分表示
    const loadDiffLibraries = async () => {
      if (!diffContainerRef.current || !historyContentRef.current || !nowContentRef.current) {
        return;
      }

      try {
        // ライブラリの動的インポート
        const [{ createPatch }, { Diff2Html }] = await Promise.all([
          import('diff'),
          import('diff2html'),
        ]);

        // 差分の計算
        const historyContent = historyContentRef.current.value;
        const nowContent = nowContentRef.current.value;
        const unifiedDiff = createPatch(
          'History → Now',
          historyContent,
          nowContent,
          'History',
          'Now'
        );

        // diff2htmlで差分をHTML化
        const diffHtml = Diff2Html.html(unifiedDiff, {
          inputFormat: 'diff',
          outputFormat: 'side-by-side',
          matching: 'lines',
          drawFileList: false,
        });

        // 差分を表示
        if (diffContainerRef.current) {
          diffContainerRef.current.innerHTML = diffHtml;
        }
      } catch (error) {
        console.error('Failed to load diff libraries:', error);
      }
    };

    loadDiffLibraries();

    // echo.jsの初期化（画像遅延読み込み）
    if (typeof window !== 'undefined' && window.echo) {
      window.echo.init();
    }
  }, [history.content, current.content]);

  // URLパラメータの構築
  const buildBackUrl = () => {
    const baseUrl = `/open.knowledge/histories/${history.knowledgeId}`;
    const separator = params ? '&' : '?';
    return `${baseUrl}${params}${separator}page=${page}`;
  };

  return (
    <>
      <h4 className="title">編集履歴詳細</h4>

      <p>
        <img
          src="/images/loader.gif"
          data-src={`/open.account/icon/${history.updateUser}`}
          alt="icon"
          width="36"
          height="36"
          style={{ float: 'left' }}
        />
        <br />
        <i className="fa fa-user"></i>&nbsp;{history.userName}&nbsp;
        <i className="fa fa-calendar"></i>&nbsp;{formatDate(history.updateDatetime)}
      </p>

      <h5 className="sub_title">差分</h5>
      <div id="content-diff" ref={diffContainerRef} data-testid="content-diff"></div>

      <br />
      <h5 className="sub_title">履歴時点</h5>
      <div className="form-group" data-testid="history-form-group">
        <label htmlFor="history-content">履歴時点の内容</label>
        <textarea
          ref={historyContentRef}
          id="history-content"
          className="form-control"
          name="content"
          rows={5}
          placeholder="内容"
          readOnly
          value={history.content}
        />
      </div>

      <br />
      <h5 className="sub_title">現在</h5>
      <div className="form-group" data-testid="current-form-group">
        <label htmlFor="now-content">現在の内容</label>
        <textarea
          ref={nowContentRef}
          id="now-content"
          className="form-control"
          name="content"
          rows={5}
          placeholder="内容"
          readOnly
          value={current.content}
        />
      </div>

      <Link
        href={buildBackUrl()}
        className="btn btn-warning"
        role="button"
      >
        <i className="fa fa-undo"></i>&nbsp;戻る
      </Link>
    </>
  );
}
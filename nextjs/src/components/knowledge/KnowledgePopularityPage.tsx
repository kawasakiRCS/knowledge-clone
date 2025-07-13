'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export interface Knowledge {
  knowledgeId: number;
  title: string;
  content: string;
  insertUser: string;
  insertUserName: string;
  insertDatetime: string;
  updateUser: string;
  updateUserName: string;
  updateDatetime: string;
  likeCount: number;
  commentCount: number;
  point: number;
  pointOnTerm?: number;
  publicFlag: number;
  typeId: number;
  template: {
    typeId: number;
    typeName: string;
    typeIcon: string;
  };
  tagNames: string;
  tagIds: string;
  stocks: Array<{ stockId: number; userId: number }>;
  pin: boolean;
  targets?: Array<{ targetId: number; targetName: string }>;
  events?: {
    eventId: number;
    eventName: string;
    eventDateTime: string;
  };
  participations?: {
    count: number;
    limit: number;
    status?: number;
  };
}

interface Tag {
  tagId: number;
  tagName: string;
  knowledgeCount: number;
}

interface Group {
  groupId: number;
  groupName: string;
  groupKnowledgeCount: number;
}

export const KnowledgePopularityPage: React.FC = () => {
  const [knowledges, setKnowledges] = useState<Knowledge[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  
  const { isLoggedIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchPopularKnowledges();
  }, []);

  const fetchPopularKnowledges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/knowledge/popularity', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch popular knowledges');
      }

      const data = await response.json();
      setKnowledges(data.knowledges || []);
      setTags(data.tags || []);
      setGroups(data.groups || []);
      setEvents(data.events || []);
    } catch (err) {
      setError('エラーが発生しました');
      console.error('Error fetching popular knowledges:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center">
          <i className="fa fa-spinner fa-pulse fa-3x fa-fw"></i>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* タブナビゲーション */}
      <div className="row">
        <ul className="nav nav-tabs">
          <li role="presentation">
            <Link href="/open/knowledge/list">一覧</Link>
          </li>
          <li role="presentation" className="active">
            <Link href="/open/knowledge/popularity">人気の投稿</Link>
          </li>
          {isLoggedIn && (
            <li role="presentation">
              <Link href="/open/knowledge/stocks">ストック</Link>
            </li>
          )}
          <li role="presentation">
            <Link href="/open/knowledge/history">履歴</Link>
          </li>
        </ul>
      </div>

      {/* リスト */}
      <div className="row" id="knowledgeList">
        {/* メインリスト */}
        <div className="col-sm-12 col-md-8 knowledge_list">
          {knowledges.length === 0 ? (
            <p>データがありません</p>
          ) : (
            knowledges.map((knowledge) => (
              <div key={knowledge.knowledgeId} className="knowledge_item" data-testid="knowledge-item">
                <div className="insert_info">
                  <Link
                    href={`/open/knowledge/view/${knowledge.knowledgeId}`}
                    className="text-primary btn-link"
                  >
                    <div className="list-title">
                      <span className="dispKnowledgeId">
                        #{knowledge.knowledgeId}
                      </span>
                      {knowledge.title}
                      {knowledge.pin && (
                        <span className="badge" style={{ fontSize: '10pt' }}>
                          <i className="fa fa-bullhorn" aria-hidden="true"></i>
                        </span>
                      )}
                    </div>
                  </Link>

                  <div>
                    <img
                      src="/images/loader.gif"
                      data-echo={`/open/account/icon/${knowledge.insertUser}`}
                      alt="icon"
                      width="20"
                      height="20"
                    />
                    <Link href={`/open/account/info/${knowledge.insertUser}`} className="text-primary btn-link">
                      {knowledge.insertUserName}
                    </Link>
                    により {new Date(knowledge.insertDatetime).toLocaleString()} に登録
                    {knowledge.insertDatetime !== knowledge.updateDatetime && (
                      <>
                        (
                        <img
                          src="/images/loader.gif"
                          data-echo={`/open/account/icon/${knowledge.updateUser}`}
                          alt="icon"
                          width="20"
                          height="20"
                        />
                        <Link href={`/open/account/info/${knowledge.updateUser}`} className="text-primary btn-link">
                          {knowledge.updateUserName}
                        </Link>
                        により {new Date(knowledge.updateDatetime).toLocaleString()} に更新
                        )
                      </>
                    )}
                  </div>
                </div>

                <div className="item-info">
                  <i className="fa fa-heart-o" style={{ marginLeft: '5px' }}></i>&nbsp;× {knowledge.point} &nbsp;
                  {knowledge.pointOnTerm && knowledge.pointOnTerm > 0 && (
                    <>(<i className="fa fa-line-chart" aria-hidden="true"></i>&nbsp;× {knowledge.pointOnTerm}) &nbsp;</>
                  )}
                  <Link
                    className="text-primary btn-link"
                    href={`/open/knowledge/likes/${knowledge.knowledgeId}`}
                  >
                    <i className="fa fa-thumbs-o-up"></i>&nbsp;× <span id="like_count">{knowledge.likeCount}</span>
                  </Link> &nbsp;
                  <Link
                    className="text-primary btn-link"
                    href={`/open/knowledge/view/${knowledge.knowledgeId}#comments`}
                  >
                    <i className="fa fa-comments-o"></i>&nbsp;× {knowledge.commentCount}
                  </Link> &nbsp;
                  <i className={knowledge.template.typeIcon}></i>
                  {knowledge.template.typeName}
                  &nbsp;
                  {knowledge.publicFlag === 1 && '公開'}
                  {knowledge.publicFlag === 2 && '保護'}
                  {knowledge.publicFlag === 3 && '非公開'}
                  &nbsp;&nbsp;&nbsp;
                  {knowledge.tagNames && (
                    <>
                      <i className="fa fa-tags"></i>
                      {knowledge.tagNames.split(',').map((tagName, index) => (
                        <span key={index}>
                          <Link href={`/open/knowledge/list?tagNames=${encodeURIComponent(tagName)}`}>
                            <span className="tag label label-info">
                              <i className="fa fa-tag"></i>{tagName}
                            </span>
                          </Link>
                          &nbsp;
                        </span>
                      ))}
                    </>
                  )}
                  &nbsp;&nbsp;&nbsp;
                  {knowledge.stocks && knowledge.stocks.length > 0 && (
                    <>
                      <i className="fa fa-star-o"></i>
                      {knowledge.stocks.map((stock: { stockId: number; stockName: string }) => (
                        <span key={stock.stockId}>
                          <Link href={`/open/knowledge/stocks?stockid=${stock.stockId}`}>
                            <span className="tag label label-primary">
                              <i className="fa fa-star"></i>{stock.stockName}
                            </span>
                          </Link>
                          &nbsp;
                        </span>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* サブリスト */}
        <div className="col-sm-12 col-md-4">
          {/* イベントカレンダー */}
          <h5>
            - <i className="fa fa-calendar"></i>&nbsp;イベント -
            <span id="loading" className="hide">
              <i className="fa fa-spinner fa-pulse fa-1x fa-fw"></i>
            </span>
          </h5>
          <div className="events">
            <div id="datepicker"></div>
          </div>
          <div style={{ width: '100%', textAlign: 'right' }}>
            &nbsp;&nbsp;
          </div>

          {/* グループ一覧 */}
          <h5>
            - <i className="fa fa-group"></i>&nbsp;グループ -
          </h5>
          {groups.length > 0 ? (
            <>
              <div className="list-group">
                {groups.map((group) => (
                  <Link
                    key={group.groupId}
                    href={`/open/knowledge/list?group=${group.groupId}`}
                    className="list-group-item"
                  >
                    <span className="badge">{group.groupKnowledgeCount}</span>
                    <i className="fa fa-group"></i>&nbsp;{group.groupName}
                  </Link>
                ))}
              </div>
              <div style={{ width: '100%', textAlign: 'right' }}>
                <Link href="/protect/group/list">
                  <i className="fa fa-group"></i>&nbsp;グループ一覧
                </Link>
                &nbsp;&nbsp;&nbsp;
              </div>
            </>
          ) : (
            <>
              <p>グループに所属していません</p>
              <div style={{ width: '100%', textAlign: 'right' }}>
                <Link href="/protect/group/mygroups">
                  <i className="fa fa-group"></i>&nbsp;グループ一覧
                </Link>
                &nbsp;&nbsp;&nbsp;
              </div>
            </>
          )}
          <br />

          {/* 人気のタグ */}
          <h5>
            - <i className="fa fa-tags"></i>&nbsp;人気のタグ -
          </h5>
          <div className="list-group">
            {tags.map((tag) => (
              <Link
                key={tag.tagId}
                href={`/open/knowledge/list?tag=${tag.tagId}`}
                className="list-group-item"
              >
                <span className="badge">{tag.knowledgeCount}</span>
                <i className="fa fa-tag"></i>&nbsp;{tag.tagName}
              </Link>
            ))}
          </div>
          <div style={{ width: '100%', textAlign: 'right' }}>
            <Link href="/open/tag/list">
              <i className="fa fa-tags"></i>&nbsp;タグ一覧
            </Link>
            &nbsp;&nbsp;&nbsp;
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * ナレッジ一覧ページコンポーネント
 * 
 * @description 旧システムのopen/knowledge/list.jspと完全互換
 */
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLocale } from '@/lib/hooks/useLocale';
import { Knowledge, KnowledgeListResponse, KnowledgeListParams, TemplateType, Tag, Group } from '../../types/knowledge';
import '@/styles/knowledge-list.css';

interface KnowledgeListPageProps {
  initialData?: KnowledgeListResponse;
}

// useSearchParams を使用するコンポーネントを分離
const KnowledgeListContent: React.FC<KnowledgeListPageProps> = ({ initialData }) => {
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();

  const [knowledges, setKnowledges] = useState<Knowledge[]>(initialData?.knowledges || []);
  const [loading, setLoading] = useState(!initialData);
  const [tags, setTags] = useState<Tag[]>(initialData?.tags || []);
  const [groups, setGroups] = useState<Group[]>(initialData?.groups || []);
  const [templates, setTemplates] = useState<Record<number, TemplateType>>(initialData?.templates || {});

  // URLパラメータ取得
  const getParams = (): KnowledgeListParams => {
    const offset = parseInt(searchParams.get('offset') || '0');
    return {
      offset,
      keyword: searchParams.get('keyword') || undefined,
      tag: searchParams.get('tag') || undefined,
      group: searchParams.get('group') || undefined,
      user: searchParams.get('user') || undefined,
      tagNames: searchParams.get('tagNames') || undefined,
      template: searchParams.getAll('template'),
    };
  };

  const params = getParams();

  // データ取得
  const fetchData = useCallback(async (params: KnowledgeListParams) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });

      const response = await fetch(`/api/knowledge/list?${queryParams}`);
      if (!response.ok) throw new Error('データ取得に失敗しました');
      
      const data: KnowledgeListResponse = await response.json();
      setKnowledges(data.knowledges);
      setTags(data.tags || []);
      setGroups(data.groups || []);
      setTemplates(data.templates || {});
    } catch (error) {
      console.error('Error fetching knowledge list:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!initialData) {
      const params = getParams();
      fetchData(params);
    }
  }, [searchParams, initialData]);

  // LazyLoad画像の実装
  useEffect(() => {
    const images = document.querySelectorAll('img[data-echo]');
    images.forEach(img => {
      const src = img.getAttribute('data-echo');
      if (src) {
        const imgElement = img as HTMLImageElement;
        imgElement.src = src;
        imgElement.classList.add('loaded');
      }
    });
  }, [knowledges]);

  // ユーザー情報表示コンポーネント
  const renderUserInfo = (userId: number, userName: string, showLink: boolean = true) => (
    <>
      <img
        src="/images/loader.gif"
        data-echo={`/open/account/icon/${userId}`}
        alt="icon"
        width="20"
        height="20"
        style={{ borderRadius: '50%', marginRight: '5px' }}
      />
      {showLink ? (
        <a href={`/open/account/info/${userId}`} className="text-primary btn-link">
          {userName}
        </a>
      ) : (
        <span>{userName}</span>
      )}
    </>
  );

  // ナレッジアイテムレンダリング
  const renderKnowledgeItem = (knowledge: Knowledge) => (
    <div key={knowledge.knowledgeId} className="knowledge_item" data-testid="knowledge-item">
      <div className="insert_info">
        <a
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
        </a>
        
        <div>
          {renderUserInfo(knowledge.insertUser, knowledge.insertUserName)}
          {` ${t('knowledge.view.info.insert', knowledge.insertUserName, new Date(knowledge.insertDatetime).toLocaleDateString())}`}
          {knowledge.insertDatetime !== knowledge.updateDatetime && (
            <>
              {' ('}
              {renderUserInfo(knowledge.updateUser, knowledge.updateUserName)}
              {` ${t('knowledge.view.info.update', knowledge.updateUserName, new Date(knowledge.updateDatetime).toLocaleDateString())}`}
              {')'}
            </>
          )}
        </div>
      </div>

      <div className="item-info">
        <i className="fa fa-heart-o" style={{ marginLeft: '5px' }}></i>&nbsp;× {knowledge.point} &nbsp;
        {knowledge.pointOnTerm && knowledge.pointOnTerm > 0 && (
          <>
            (<i className="fa fa-line-chart" aria-hidden="true"></i>&nbsp;× {knowledge.pointOnTerm}) &nbsp;
          </>
        )}
        <a className="text-primary btn-link" href={`/open/knowledge/likes/${knowledge.knowledgeId}`}>
          <i className="fa fa-thumbs-o-up"></i>&nbsp;× <span id="like_count">{knowledge.likeCount}</span>
        </a> &nbsp;
        <a className="text-primary btn-link" href={`/open/knowledge/view/${knowledge.knowledgeId}#comments`}>
          <i className="fa fa-comments-o"></i>&nbsp;× {knowledge.commentCount}
        </a> &nbsp;
        
        {templates[knowledge.typeId] && (
          <>
            <i className={`fa ${templates[knowledge.typeId].typeIcon}`}></i>&nbsp;
            {templates[knowledge.typeId].typeName}
            &nbsp;
          </>
        )}

        {/* 公開区分 */}
        {knowledge.publicFlag === 1 && <i className="fa fa-globe" title="公開"></i>}
        {knowledge.publicFlag === 2 && <i className="fa fa-lock" title="非公開"></i>}
        {knowledge.publicFlag === 3 && <i className="fa fa-shield" title="保護"></i>}
        &nbsp;

        {/* タグ表示 */}
        {knowledge.tagNames && (
          <>
            &nbsp;&nbsp;&nbsp;
            {knowledge.tagNames.split(',').map((tagName, index) => (
              <a key={index} href={`/open/knowledge/list?tagNames=${encodeURIComponent(tagName)}`}>
                <span className="tag label label-info">
                  <i className="fa fa-tag"></i>&nbsp;{tagName}
                </span>
              </a>
            ))}
          </>
        )}
      </div>
    </div>
  );

  return (
    <div data-testid="knowledge-list-container" className="knowledge_list">
      {/* タブ */}
      <div className="row">
        <ul className="nav nav-tabs">
          <li role="presentation" className="active">
            <a href="/open/knowledge/list">{t('knowledge.list.kind.list')}</a>
          </li>
          <li role="presentation">
            <a href="/open/knowledge/show_popularity">{t('knowledge.list.kind.popular')}</a>
          </li>
          {isAuthenticated && (
            <li role="presentation">
              <Link href="/open/knowledge/stocks">{t('knowledge.list.kind.stock')}</Link>
            </li>
          )}
          <li role="presentation">
            <a href="/open/knowledge/show_history">{t('knowledge.list.kind.history')}</a>
          </li>
        </ul>
      </div>

      {/* フィルタ表示 */}
      {(params.keyword || params.tag) && (
        <div className="row">
          <div className="col-sm-12 selected_tag">
            {params.keyword && (
              <a className="text-link" href={`/open/knowledge/list?keyword=${params.keyword}`}>
                <i className="fa fa-search"></i>&nbsp;{params.keyword}
              </a>
            )}
            <a className="text-link" href="/open/knowledge/list" aria-label="フィルタクリア">
              <i className="fa fa-times-circle"></i>&nbsp;
            </a>
          </div>
        </div>
      )}

      {/* クイックフィルタ */}
      <div className="row">
        <div className="col-sm-12">
          <form role="form" action="/open/knowledge/list">
            <input type="hidden" name="from" value="quickFilter" />
            <a href="#quickFilter" data-toggle="collapse">
              <i className="fa fa-angle-double-right" aria-hidden="true"></i>
              <i className="fa fa-filter" aria-hidden="true"></i>Filter
            </a>
            <div id="quickFilter" className="collapse">
              {Object.values(templates).map(template => (
                <label key={template.typeId} aria-label={template.typeName}>
                  <input type="checkbox" name="template" value={template.typeId} />
                  <i className={`fa ${template.typeIcon}`}></i>
                  {template.typeName}&nbsp;
                </label>
              ))}
              <button className="btn btn-primary btn-xs" type="submit">
                <i className="fa fa-search"></i>&nbsp;{t('label.apply')}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ナレッジリスト */}
      <div className="row" id="knowledgeList">
        <div className="col-sm-12 col-md-8 knowledge_list">
          {loading ? (
            <div>Loading...</div>
          ) : knowledges.length === 0 ? (
            <div>{t('knowledge.list.empty')}</div>
          ) : (
            knowledges.map(renderKnowledgeItem)
          )}
        </div>

        {/* サイドバー */}
        <div className="col-sm-12 col-md-4">
          <h5>- <i className="fa fa-calendar"></i>&nbsp;{t('knowledge.list.events')} - </h5>
          <div className="events">
            <div id="datepicker"></div>
          </div>

          <h5>- <i className="fa fa-group"></i>&nbsp;{t('knowledge.navbar.config.group')} - </h5>
          {groups.length > 0 ? (
            <div className="list-group">
              {groups.map(group => (
                <a
                  key={group.groupId}
                  className="list-group-item"
                  href={`/open/knowledge/list?group=${group.groupId}`}
                >
                  <span className="badge">{group.groupKnowledgeCount}</span>
                  <i className="fa fa-group"></i>&nbsp;{group.groupName}
                </a>
              ))}
            </div>
          ) : (
            <p>{t('knowledge.list.info.group')}</p>
          )}

          <h5>- <i className="fa fa-tags"></i>&nbsp;{t('knowledge.list.popular.tags')} - </h5>
          <div className="list-group">
            {tags.map(tag => (
              <a
                key={tag.tagId}
                className="list-group-item"
                href={`/open/knowledge/list?tag=${tag.tagId}`}
              >
                <span className="badge">{tag.knowledgeCount}</span>
                <i className="fa fa-tag"></i>&nbsp;{tag.tagName}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ページネーション */}
      <nav>
        <ul className="pager">
          <li className="previous">
            <a href={`/open/knowledge/list/${Math.max(0, (params.offset || 0) - 1)}`}>
              <span aria-hidden="true">&larr;</span>{t('label.previous')}
            </a>
          </li>
          <li className="next">
            <a href={`/open/knowledge/list/${(params.offset || 0) + 1}`}>
              {t('label.next')} <span aria-hidden="true">&rarr;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

// Suspense境界でラップしたメインコンポーネント
export const KnowledgeListPage: React.FC<KnowledgeListPageProps> = ({ initialData }) => {
  return (
    <Suspense fallback={<div className="text-center"><div>Loading...</div></div>}>
      <KnowledgeListContent initialData={initialData} />
    </Suspense>
  );
};

export default KnowledgeListPage;
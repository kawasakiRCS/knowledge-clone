/**
 * ナレッジ一覧ページコンポーネント
 * 
 * @description 旧システムのopen/knowledge/list.jspと完全互換
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/hooks/useAuth';
import { useLocale } from '../../lib/hooks/useLocale';
import { Knowledge, KnowledgeListResponse, KnowledgeListParams, TemplateType, Tag, Group } from '../../types/knowledge';

interface KnowledgeListPageProps {
  initialData?: KnowledgeListResponse;
}

export const KnowledgeListPage: React.FC<KnowledgeListPageProps> = ({ initialData }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { locale, label } = useLocale();

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
  const fetchData = async (params: KnowledgeListParams) => {
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
  };

  useEffect(() => {
    if (!initialData) {
      fetchData(params);
    }
  }, [searchParams]);

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
          <img
            src="/images/loader.gif"
            data-echo={`/open/account/icon/${knowledge.insertUser}`}
            alt="icon"
            width="20"
            height="20"
          />
          <a href={`/open/account/info/${knowledge.insertUser}`} className="text-primary btn-link">
            {knowledge.insertUserName}
          </a>
          {` ${label('knowledge.view.info.insert')} ${new Date(knowledge.insertDatetime).toLocaleDateString()}`}
        </div>
      </div>

      <div className="item-info">
        <i className="fa fa-heart-o" style={{ marginLeft: '5px' }}></i>&nbsp;× {knowledge.point} &nbsp;
        <a className="text-primary btn-link" href={`/open/knowledge/likes/${knowledge.knowledgeId}`}>
          <i className="fa fa-thumbs-o-up"></i>&nbsp;× {knowledge.likeCount}
        </a> &nbsp;
        <a className="text-primary btn-link" href={`/open/knowledge/view/${knowledge.knowledgeId}#comments`}>
          <i className="fa fa-comments-o"></i>&nbsp;× {knowledge.commentCount}
        </a> &nbsp;
        
        {templates[knowledge.typeId] && (
          <>
            <i className={`fa ${templates[knowledge.typeId].typeIcon}`}></i>
            {templates[knowledge.typeId].typeName}
            &nbsp;
          </>
        )}

        {knowledge.tagNames && (
          <>
            &nbsp;&nbsp;&nbsp;
            <i className="fa fa-tags"></i>
            {knowledge.tagNames.split(',').map((tagName, index) => (
              <a key={index} href={`/open/knowledge/list?tagNames=${encodeURIComponent(tagName)}`}>
                <span className="tag label label-info">
                  <i className="fa fa-tag"></i>{tagName}
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
            <a href="/open/knowledge/list">{label('knowledge.list.kind.list')}</a>
          </li>
          <li role="presentation">
            <a href="/open/knowledge/show_popularity">{label('knowledge.list.kind.popular')}</a>
          </li>
          {isAuthenticated && (
            <li role="presentation">
              <a href="/open/knowledge/stocks">{label('knowledge.list.kind.stock')}</a>
            </li>
          )}
          <li role="presentation">
            <a href="/open/knowledge/show_history">{label('knowledge.list.kind.history')}</a>
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
          </div>
        </div>
      </div>

      {/* ナレッジリスト */}
      <div className="row" id="knowledgeList">
        <div className="col-sm-12 col-md-8 knowledge_list">
          {loading ? (
            <div>Loading...</div>
          ) : knowledges.length === 0 ? (
            <div>{label('knowledge.list.empty')}</div>
          ) : (
            knowledges.map(renderKnowledgeItem)
          )}
        </div>

        {/* サイドバー */}
        <div className="col-sm-12 col-md-4">
          <h5>- <i className="fa fa-calendar"></i>&nbsp;{label('knowledge.list.events')} - </h5>
          <div className="events">
            <div id="datepicker"></div>
          </div>

          <h5>- <i className="fa fa-group"></i>&nbsp;{label('knowledge.navbar.config.group')} - </h5>
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
            <p>{label('knowledge.list.info.group')}</p>
          )}

          <h5>- <i className="fa fa-tags"></i>&nbsp;{label('knowledge.list.popular.tags')} - </h5>
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
              <span aria-hidden="true">&larr;</span>{label('label.previous')}
            </a>
          </li>
          <li className="next">
            <a href={`/open/knowledge/list/${(params.offset || 0) + 1}`}>
              {label('label.next')} <span aria-hidden="true">&rarr;</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default KnowledgeListPage;
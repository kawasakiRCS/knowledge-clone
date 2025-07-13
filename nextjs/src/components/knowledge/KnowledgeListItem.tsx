/**
 * ナレッジリストアイテムコンポーネント
 * 
 * @description 一覧画面で使用する個別のナレッジ表示コンポーネント
 */
'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StockKnowledge } from '@/types/knowledge';
import { useLocale } from '@/hooks/useLocale';
import { formatDate } from '@/lib/utils';

interface KnowledgeListItemProps {
  knowledge: StockKnowledge;
  showUnread?: boolean;
  params?: string;
}

export default function KnowledgeListItem({ 
  knowledge, 
  showUnread = false,
  params = ''
}: KnowledgeListItemProps) {
  const { t } = useLocale();
  
  // echo.jsの初期化
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as Window & { echo?: { init(): void } }).echo) {
      (window as Window & { echo: { init(): void } }).echo.init();
    }
  }, []);
  
  const unread = showUnread ? 'unread' : '';
  const unreadLabel = showUnread ? `[${t('label.unread')}]` : '';
  
  // 登録者リンク
  const insertUserLink = `<a href="/open/account/info/${knowledge.insertUser}" class="text-primary btn-link">${knowledge.insertUserName}</a>`;
  
  // 更新者リンク  
  const updateUserLink = `<a href="/open/account/info/${knowledge.updateUser}" class="text-primary btn-link">${knowledge.updateUserName}</a>`;
  
  return (
    <div className={`knowledge_item ${unread}`}>
      <div className="insert_info">
        <Link 
          href={`/open/knowledge/view/${knowledge.knowledgeId}${params}`}
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
          {unreadLabel}
          <Image 
            src="/images/loader.gif"
            alt="icon"
            width={20}
            height={20}
            data-echo={`/open/account/icon/${knowledge.insertUser}`}
          />
          {' '}
          <span dangerouslySetInnerHTML={{ __html: t('knowledge.view.info.insert', insertUserLink, formatDate(knowledge.insertDatetime)) }} />
          {knowledge.insertDatetime !== knowledge.updateDatetime && (
            <>
              {' ('}
              <Image 
                src="/images/loader.gif"
                alt="icon"
                width={20}
                height={20}
                data-echo={`/open/account/icon/${knowledge.updateUser}`}
              />
              {' '}
              <span dangerouslySetInnerHTML={{ __html: t('knowledge.view.info.update', updateUserLink, formatDate(knowledge.updateDatetime)) }} />
              {')'}
            </>
          )}
        </div>
        
        {knowledge.startDateTime && (
          <div>
            <i className="fa fa-calendar"></i>&nbsp;
            {t('knowledge.list.event.datetime')}: {knowledge.startDateTime}
            {knowledge.participations && (
              <>
                {' '}
                <i className="fa fa-users"></i>&nbsp;
                {knowledge.participations.count} / {knowledge.participations.limit}
                {knowledge.participations.status !== null && (
                  <span className="badge">
                    {knowledge.participations.status === 1 
                      ? t('knowledge.view.label.status.participation')
                      : t('knowledge.view.label.status.wait.cansel')
                    }
                  </span>
                )}
              </>
            )}
          </div>
        )}
        
        <div className="tags">
          {knowledge.tags.map((tag) => (
            <Link 
              key={tag.tagId}
              href={`/open/knowledge/list?tag=${tag.tagId}`}
              className="tag"
            >
              {tag.tagName}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="show_info">
        <div className="show_info_item">
          <i className="fa fa-thumbs-o-up" aria-hidden="true"></i>
          {knowledge.likeCount}
        </div>
        <div className="show_info_item">
          <i className="fa fa-comment-o" aria-hidden="true"></i>
          {knowledge.commentCount}
        </div>
        {knowledge.point !== undefined && (
          <div className="show_info_item">
            <i className="fa fa-star-o" aria-hidden="true"></i>
            {knowledge.point}
          </div>
        )}
      </div>
    </div>
  );
}
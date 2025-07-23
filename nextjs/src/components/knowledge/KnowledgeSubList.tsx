/**
 * ナレッジサブリストコンポーネント
 * 
 * @description 一覧画面の右側に表示されるサイドバーコンポーネント
 */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLocale } from '@/lib/hooks/useLocale';

interface Event {
  knowledgeId: number;
  title: string;
  startDateTime: string;
}

interface Group {
  groupId: string;
  groupName: string;
  groupDescription?: string;
}

interface Tag {
  tagId: number;
  tagName: string;
  knowledgeCount: number;
}

export default function KnowledgeSubList() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSubListData = async () => {
      try {
        // イベント情報取得（今後のイベント）
        const eventsRes = await fetch('/api/events', {
          headers: { 'Accept-Language': locale },
        });
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }
        
        // グループ情報取得（ログインユーザーのみ）
        if (user) {
          const groupsRes = await fetch('/api/groups', {
            headers: { 'Accept-Language': locale },
            credentials: 'include',
          });
          if (groupsRes.ok) {
            const groupsData = await groupsRes.json();
            setGroups(groupsData);
          }
        }
        
        // 人気タグ取得
        const tagsRes = await fetch('/api/tags/popular', {
          headers: { 'Accept-Language': locale },
        });
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData);
        }
      } catch (error) {
        console.error('Error fetching sub list data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubListData();
  }, [user, locale]);
  
  if (loading) {
    return (
      <div className="sub_list">
        <div className="text-center">
          <i className="fa fa-spinner fa-pulse"></i>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      {/* イベント */}
      {events.length > 0 && (
        <div className="event_list">
          <h4>
            <i className="fa fa-calendar"></i>&nbsp;Events
          </h4>
          {events.map((event) => (
            <div key={event.knowledgeId} className="event_item">
              <Link href={`/open/knowledge/view/${event.knowledgeId}`}>
                {event.title}
              </Link>
              <div className="event_date">{event.startDateTime}</div>
            </div>
          ))}
        </div>
      )}
      
      {/* グループ（ログインユーザーのみ） */}
      {user && groups.length > 0 && (
        <div className="group_list">
          <h4>
            <i className="fa fa-users"></i>&nbsp;Groups
          </h4>
          {groups.map((group) => (
            <div key={group.groupId} className="group_item">
              <Link href={`/open/knowledge/list?group=${group.groupId}`}>
                {group.groupName}
              </Link>
              {group.groupDescription && (
                <div className="group_desc">{group.groupDescription}</div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 人気タグ */}
      {tags.length > 0 && (
        <div className="tag_list">
          <h4>
            <i className="fa fa-tags"></i>&nbsp;Popular Tags
          </h4>
          <div className="tags">
            {tags.map((tag) => (
              <Link
                key={tag.tagId}
                href={`/open/knowledge/list?tag=${tag.tagId}`}
                className="tag"
              >
                {tag.tagName}
                {tag.knowledgeCount > 0 && (
                  <span className="tag_count">({tag.knowledgeCount})</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
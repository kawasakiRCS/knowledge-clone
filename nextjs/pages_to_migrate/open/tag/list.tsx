/**
 * タグ一覧ページ
 * 
 * @description 旧システムのopen/tag/list.jspの完全移植
 */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MainLayout from '@/components/layout/MainLayout';
import { Tag } from '@/types/knowledge';
import { useLocale } from '@/hooks/useLocale';

interface TagListResponse {
  tags: Tag[];
  total: number;
  previous?: number;
  next?: number;
  offset?: number;
}

export default function TagListPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{
    previous?: number;
    next?: number;
    offset?: number;
  }>({});

  // ページ番号の取得
  const page = router.query.page as string;
  const offset = page ? parseInt(page) : 0;

  useEffect(() => {
    fetchTags();
  }, [offset]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tags/list?offset=${offset}`);
      
      if (response.ok) {
        const data: TagListResponse = await response.json();
        setTags(data.tags || []);
        setPagination({
          previous: data.previous,
          next: data.next,
          offset: data.offset,
        });
      } else {
        setTags([]);
      }
    } catch (error) {
      console.error('Failed to fetch tags:', error);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  const renderPagination = () => (
    <nav>
      <ul className="pager">
        <li className="previous">
          <Link 
            href={`/open/tag/list/${pagination.previous || 0}`}
            className={pagination.previous === undefined ? 'disabled' : ''}
          >
            <span aria-hidden="true">&larr;</span>{t('label.previous')}
          </Link>
        </li>
        <li className="next">
          <Link 
            href={`/open/tag/list/${pagination.next || 0}`}
            className={pagination.next === undefined ? 'disabled' : ''}
          >
            {t('label.next')} <span aria-hidden="true">&rarr;</span>
          </Link>
        </li>
      </ul>
    </nav>
  );

  const content = (
    <>
      <h4 className="title">{t('knowledge.tags.title')}</h4>
      
      {renderPagination()}

      {tags.length === 0 ? (
        <div className="col-sm-12">
          Empty
        </div>
      ) : (
        <div className="list-group">
          {tags.map((tag) => (
            <Link
              key={tag.tagId}
              href={`/open/knowledge/list?tag=${tag.tagId}`}
              className="list-group-item"
            >
              <span className="badge">{tag.knowledgeCount || 0}</span>
              <i className="fa fa-tag"></i>&nbsp;{tag.tagName}
            </Link>
          ))}
        </div>
      )}

      {renderPagination()}
    </>
  );

  return (
    <MainLayout>
      {content}
    </MainLayout>
  );
}
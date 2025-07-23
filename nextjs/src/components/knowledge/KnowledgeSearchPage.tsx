'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useLocale } from '@/lib/hooks/useLocale';
import MainLayout from '../layout/MainLayout';
import '../../styles/knowledge-edit.css';

interface Template {
  typeId: number;
  typeIcon: string;
  typeName: string;
}

// 将来のタグ入力機能拡張用
// interface TagsInputRef {
//   tagsinput: (action: string, value?: string) => void;
// }

export const KnowledgeSearchPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();

  // 検索条件の状態管理
  const [keyword, setKeyword] = useState('');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplates, setSelectedTemplates] = useState<number[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [groups, setGroups] = useState<string[]>([]);
  const [tagNames, setTagNames] = useState('');
  const [groupNames, setGroupNames] = useState('');
  const [creators, setCreators] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // モーダル表示状態
  const [showTagModal, setShowTagModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // ユーザー検索用
  const [userSearchKeyword, setUserSearchKeyword] = useState('');
  const [userSearchPage, setUserSearchPage] = useState(0);
  const [searchedUsers, setSearchedUsers] = useState<Array<{
    userId: number;
    userName: string;
    email?: string;
  }>>([]);

  // タグ入力参照
  const tagInputRef = useRef<HTMLInputElement>(null);
  const groupInputRef = useRef<HTMLInputElement>(null);
  const creatorInputRef = useRef<HTMLInputElement>(null);

  // 初期データ取得
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // テンプレート取得
        const templatesRes = await fetch('/api/templates');
        if (templatesRes.ok) {
          const templatesData = await templatesRes.json();
          setTemplates(templatesData);
          setSelectedTemplates(templatesData.map((t: Template) => t.typeId));
        }

        // タグ取得
        const tagsRes = await fetch('/api/tags');
        if (tagsRes.ok) {
          const tagsData = await tagsRes.json();
          setTags(tagsData);
        }

        // ログイン時はグループも取得
        if (isAuthenticated) {
          const groupsRes = await fetch('/api/groups');
          if (groupsRes.ok) {
            const groupsData = await groupsRes.json();
            setGroups(groupsData);
          }
        }

        setLoading(false);
      } catch {
        setError('Failed to load initial data');
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [isAuthenticated]);

  // テンプレート選択の切り替え
  const handleTemplateToggle = (typeId: number) => {
    setSelectedTemplates((prev) => 
      prev.includes(typeId) 
        ? prev.filter(id => id !== typeId)
        : [...prev, typeId]
    );
  };

  // 検索実行
  const handleSearch = () => {
    const params = new URLSearchParams();
    
    if (keyword) params.append('keyword', keyword);
    if (tagNames) params.append('tagNames', tagNames);
    if (creators) params.append('creators', creators);
    if (groupNames) params.append('groupNames', groupNames);
    
    selectedTemplates.forEach(id => {
      params.append('template', id.toString());
    });

    const queryString = params.toString();
    const url = queryString ? `/open/knowledge/list?${queryString}` : '/open/knowledge/list';
    
    router.push(url);
  };

  // クリア処理
  const handleClear = () => {
    setKeyword('');
    setTagNames('');
    setCreators('');
    setGroupNames('');
    setSelectedTemplates(templates.map(t => t.typeId));
  };

  // ユーザー検索
  const searchUsers = async (page: number) => {
    try {
      const params = new URLSearchParams();
      params.append('keyword', userSearchKeyword);
      params.append('offset', page.toString());
      
      const res = await fetch(`/api/users?${params}`);
      if (res.ok) {
        const users = await res.json();
        setSearchedUsers(users);
        setUserSearchPage(page);
      }
    } catch (err) {
      console.error('Failed to search users:', err);
    }
  };

  // ユーザー選択
  const handleUserSelect = (userName: string) => {
    const current = creators ? creators.split(',') : [];
    if (!current.includes(userName)) {
      setCreators([...current, userName].join(','));
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container">
          <div className="text-center">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container">
          <div className="alert alert-danger">{error}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container">
        <h4 className="title">{t('knowledge.navbar.search')}</h4>
        
        <form role="form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
          <div className="form-group">
            <label htmlFor="searchkeyword">
              {t('knowledge.search.keyword')}
            </label>
            <input 
              type="text" 
              className="form-control" 
              placeholder={t('knowledge.search.placeholder')}
              name="keyword" 
              id="searchkeyword" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>
              {t('knowledge.add.label.type')}
            </label>
            <br/>
            {templates.map((template) => (
              <label key={template.typeId} style={{ marginRight: '10px' }}>
                <input 
                  type="checkbox" 
                  name="template" 
                  value={template.typeId}
                  checked={selectedTemplates.includes(template.typeId)}
                  onChange={() => handleTemplateToggle(template.typeId)}
                />
                <i className={`fa ${template.typeIcon}`}></i>
                &nbsp;{template.typeName}&nbsp;
              </label>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="input_tags">
              {t('knowledge.search.tags')}
              <span className="helpMarkdownLabel">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setShowTagModal(true); }}
                >
                  {t('label.search.tags')}
                </a>
              </span>
            </label>
            <p className="tags">
              <input 
                ref={tagInputRef}
                type="text" 
                className="form-control" 
                name="tagNames" 
                id="input_tags" 
                data-role="tags input"
                placeholder={t('knowledge.add.label.tags')} 
                value={tagNames}
                onChange={(e) => setTagNames(e.target.value)}
              />
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="creators">
              {t('knowledge.search.creator')}
              <span className="helpMarkdownLabel">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); setShowUserModal(true); }}
                >
                  {t('knowledge.search.creator')}
                </a>
              </span>
            </label>
            <p className="creators">
              <input 
                ref={creatorInputRef}
                type="text" 
                className="form-control" 
                name="creators" 
                id="creators" 
                data-role="tags input"
                placeholder={t('knowledge.search.creator')} 
                value={creators}
                onChange={(e) => setCreators(e.target.value)}
              />
            </p>
          </div>
          
          {isAuthenticated && (
            <div className="form-group">
              <label htmlFor="input_groups">
                {t('knowledge.search.groups')}
                <span className="helpMarkdownLabel">
                  <a 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setShowGroupModal(true); }}
                  >
                    {t('label.search.groups')}
                  </a>
                </span>
              </label>
              <p className="groups">
                <input 
                  ref={groupInputRef}
                  type="text" 
                  className="form-control" 
                  name="groupNames" 
                  id="input_groups" 
                  data-role="groups input"
                  placeholder={t('knowledge.add.label.groups')} 
                  value={groupNames}
                  onChange={(e) => setGroupNames(e.target.value)}
                />
              </p>
            </div>
          )}

          <button className="btn btn-primary" type="submit">
            <i className="fa fa-search"></i>&nbsp;{t('label.search')}
          </button>
          <button 
            className="btn btn-warning" 
            type="button" 
            onClick={handleClear}
          >
            <i className="fa fa-times-circle"></i>&nbsp;{t('label.clear')}
          </button>
          <a 
            href="/open/knowledge/list"
            className="btn btn-success" 
            role="button"
          >
            <i className="fa fa-list-ul"></i>&nbsp;{t('label.backlist')}
          </a>
        </form>

        {/* タグ選択モーダル */}
        {showTagModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <button 
                    type="button" 
                    className="close" 
                    onClick={() => setShowTagModal(false)}
                  >
                    &times;
                  </button>
                  <h4 className="modal-title">{t('label.search.tags')}</h4>
                </div>
                <div className="modal-body">
                  {/* タグ選択UI実装 */}
                  <div className="list-group">
                    {tags.map((tag, index) => (
                      <a 
                        key={index}
                        href="#" 
                        className="list-group-item"
                        onClick={(e) => {
                          e.preventDefault();
                          const current = tagNames ? tagNames.split(',') : [];
                          if (!current.includes(tag)) {
                            setTagNames([...current, tag].join(','));
                          }
                        }}
                      >
                        {tag}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => setShowTagModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ユーザー選択モーダル */}
        {showUserModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <button 
                    type="button" 
                    className="close" 
                    onClick={() => setShowUserModal(false)}
                  >
                    &times;
                  </button>
                  <h4 className="modal-title">
                    {t('knowledge.search.creator')} [page-{userSearchPage + 1}]
                  </h4>
                </div>
                <div className="modal-body">
                  <div role="form" className="form-inline">
                    <input 
                      type="text" 
                      className="form-control" 
                      value={userSearchKeyword} 
                      placeholder="Keyword" 
                      onChange={(e) => setUserSearchKeyword(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={() => searchUsers(0)}
                    >
                      <i className="fa fa-search"></i>&nbsp;{t('label.filter')}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-default"
                      onClick={() => searchUsers(Math.max(0, userSearchPage - 1))}
                    >
                      <i className="fa fa-arrow-circle-left"></i>&nbsp;{t('label.previous')}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-default"
                      onClick={() => searchUsers(userSearchPage + 1)}
                    >
                      {t('label.next')}&nbsp;<i className="fa fa-arrow-circle-right"></i>
                    </button>
                  </div>
                  <br/>
                  <div className="te">
                    <ul className="list-group">
                      {searchedUsers.map((user) => (
                        <li 
                          key={user.userId} 
                          className="list-group-item"
                          onClick={() => handleUserSelect(user.userName)}
                          style={{ cursor: 'pointer' }}
                        >
                          <span className="name cursor-pointer">
                            <i className="fa fa-user"></i>&nbsp;
                            {user.userName}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => setShowUserModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* グループ選択モーダル（ログイン時のみ） */}
        {isAuthenticated && showGroupModal && (
          <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <button 
                    type="button" 
                    className="close" 
                    onClick={() => setShowGroupModal(false)}
                  >
                    &times;
                  </button>
                  <h4 className="modal-title">{t('label.search.groups')}</h4>
                </div>
                <div className="modal-body">
                  {/* グループ選択UI実装 */}
                  <div className="list-group">
                    {groups.map((group, index) => (
                      <a 
                        key={index}
                        href="#" 
                        className="list-group-item"
                        onClick={(e) => {
                          e.preventDefault();
                          const current = groupNames ? groupNames.split(',') : [];
                          if (!current.includes(group)) {
                            setGroupNames([...current, group].join(','));
                          }
                        }}
                      >
                        {group}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-default" 
                    onClick={() => setShowGroupModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};
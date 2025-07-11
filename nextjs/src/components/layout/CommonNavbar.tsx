/**
 * 共通ナビゲーションバーコンポーネント
 * 
 * @description 旧システムのcommonNavbar.jspを移植
 * Bootstrap 3.3.7ベースのナビゲーションバー
 * @since 1.0.0
 */

'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';

interface CommonNavbarProps {
  searchKeyword?: string;
  serviceLabel?: string;
  serviceIcon?: string;
}

export function CommonNavbar({ 
  searchKeyword = '',
  serviceLabel = 'Knowledge',
  serviceIcon = 'fa-book'
}: CommonNavbarProps) {
  const { isLoggedIn, user, unreadCount } = useAuth();
  const router = useRouter();
  const [keyword, setKeyword] = useState(searchKeyword);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const searchUrl = `/open.knowledge/list${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`;
    router.push(searchUrl);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar navbar-default navbar-fixed-top">
      <div className="container">
        {/* Brand and toggle get grouped for better mobile display */}
        <div className="navbar-header">
          <button 
            type="button" 
            className="navbar-toggle collapsed"
            data-toggle="collapse" 
            data-target="#bs-example-navbar-collapse-1"
            aria-expanded={isMenuOpen}
            onClick={toggleMenu}
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand" href="/open.knowledge/list" style={{ cursor: 'pointer' }}>
            <i className={`fa ${serviceIcon}`}></i>&nbsp;
            {serviceLabel}
          </a>
        </div>

        {/* Collect the nav links, forms, and other content for toggling */}
        <div 
          className={`collapse navbar-collapse ${isMenuOpen ? 'in' : ''}`} 
          id="bs-example-navbar-collapse-1"
          data-testid="navbar-collapse"
        >
          <form 
            className="nav navbar-nav navbar-form" 
            role="search"
            onSubmit={handleSearch}
          >
            <div className="input-group">
              <input 
                type="text" 
                className="form-control" 
                placeholder="検索キーワードを入力"
                name="keyword" 
                id="navSearch" 
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
              <div className="input-group-btn">
                <button className="btn btn-default" type="submit" aria-label="search">
                  <i className="fa fa-search"></i>
                </button>
              </div>
            </div>
          </form>

          <ul className="nav navbar-nav navbar-right">
            {isLoggedIn && (
              <>
                {/* ナレッジ追加ボタン */}
                <li className="navButton navAddButton">
                  <div className="btn-group">
                    <button 
                      type="button" 
                      onClick={() => router.push('/protect.knowledge/view_add')} 
                      className="btn btn-info" 
                      id="navAddButtonLink" 
                      tabIndex={-1}
                    >
                      <i className="fa fa-plus-circle"></i>&nbsp;
                      <span className="navListButtonText">ナレッジ追加</span>
                    </button>
                    <a 
                      href="#" 
                      className="btn btn-info dropdown-toggle dropdown-toggle-split" 
                      data-toggle="dropdown" 
                      aria-haspopup="true" 
                      aria-expanded="false"
                    >
                      <span className="caret"></span>
                    </a>
                    <ul className="dropdown-menu" role="menu">
                      <li>
                        <a className="dropdown-item" href="/protect.knowledge/view_add">
                          <i className="fa fa-plus-circle"></i>&nbsp;ナレッジ追加
                        </a>
                      </li>
                      <li>
                        <a className="dropdown-item" href="/protect.draft/list">
                          <i className="fa fa-database"></i>&nbsp;下書き一覧
                        </a>
                      </li>
                    </ul>
                  </div>
                </li>

                {/* マイストックボタン */}
                <li className="navButton navListButton">
                  <div className="btn-group">
                    <a href="/protect.stock/mylist" className="btn btn-warning" id="navListButtonLink">
                      <i className="fa fa-star-o"></i>&nbsp;
                      <span className="navListButtonText">マイストック</span>
                    </a>
                  </div>
                </li>
              </>
            )}

            {!isLoggedIn ? (
              /* 未ログイン時のメニュー */
              <li className="navButton navMenuButton">
                <div className="btn-group">
                  <a 
                    href="#" 
                    className="btn btn-default dropdown-toggle" 
                    id="navMenuButtonLink" 
                    data-toggle="dropdown" 
                    aria-haspopup="true" 
                    aria-expanded="false"
                  >
                    <img 
                      src="/open.account/icon/0" 
                      alt="icon" 
                      width="15" 
                      height="15"
                    />
                    <span className="caret"></span>
                  </a>
                  <ul className="dropdown-menu" role="menu">
                    <li>
                      <a href="/open.knowledge/list">
                        <i className="fa fa-list"></i>&nbsp;ナレッジ一覧
                      </a>
                    </li>
                    <li className="divider"></li>
                    <li>
                      <a href="/open.knowledge/search">
                        <i className="fa fa-search"></i>&nbsp;検索
                      </a>
                    </li>
                    <li className="divider"></li>
                    <li>
                      <a id="menuSignin" href="/signin?page=/open.knowledge/list" style={{ cursor: 'pointer' }}>
                        <i className="fa fa-sign-in"></i>&nbsp;サインイン
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            ) : (
              /* ログイン時のメニュー */
              <li className="navButton navLoginedMenuButton">
                <div className="btn-group">
                  <a 
                    href="#" 
                    className="btn btn-success dropdown-toggle" 
                    id="navMenuButtonLink" 
                    data-toggle="dropdown"
                    aria-label="user menu"
                  >
                    <img 
                      src={`/open.account/icon/${user?.id || 0}`} 
                      alt="icon" 
                      width="15" 
                      height="15"
                    />
                    {unreadCount > 0 && (
                      <small>
                        <span className="badge badge-pill">{unreadCount}</span>
                      </small>
                    )}
                    <span className="caret"></span>
                  </a>
                  <ul className="dropdown-menu" role="menu">
                    <li>
                      <a href="/open.knowledge/list">
                        <i className="fa fa-list"></i>&nbsp;ナレッジ一覧
                      </a>
                    </li>
                    <li className="divider"></li>
                    <li>
                      <a href="/protect.notification/list">
                        <i className="fa fa-bullhorn"></i>&nbsp;通知
                      </a>
                    </li>
                    <li className="divider"></li>
                    <li>
                      <a href="/open.knowledge/search">
                        <i className="fa fa-search"></i>&nbsp;検索
                      </a>
                    </li>
                    {user?.isAdmin && (
                      <>
                        <li className="divider"></li>
                        <li>
                          <a href="/admin.systemconfig/index">
                            <i className="fa fa-cogs"></i>&nbsp;システム設定
                          </a>
                        </li>
                      </>
                    )}
                    <li className="divider"></li>
                    <li>
                      <a href="/protect.config/index">
                        <i className="fa fa-cog"></i>&nbsp;設定
                      </a>
                    </li>
                    <li className="divider"></li>
                    <li>
                      <a id="menuSignout" href="/signout" style={{ cursor: 'pointer' }}>
                        <i className="fa fa-sign-out"></i>&nbsp;サインアウト
                      </a>
                    </li>
                  </ul>
                </div>
              </li>
            )}
          </ul>
        </div>
        {/* /.navbar-collapse */}
      </div>
      {/* /.container-fluid */}
    </nav>
  );
}
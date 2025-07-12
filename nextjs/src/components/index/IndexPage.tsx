'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * トップページコンポーネント
 * 
 * @description 旧システムのindex/index.jspを完全移植
 * Free Knowledge Base Systemのランディングページ
 */
export const IndexPage: React.FC = () => {
  const router = useRouter();

  /**
   * ヘッダーセクションクリック時の処理
   * ナレッジ一覧ページへ遷移
   */
  const handleHeaderClick = () => {
    router.push('/open/knowledge/list');
  };

  return (
    <>
      {/* ヘッダーイメージセクション */}
      <div id="headerimg">
        <div 
          id="headerwrap" 
          data-testid="header-section"
          onClick={handleHeaderClick}
          style={{ cursor: 'pointer' }}
        >
          <h1>
            <span>
              <i className="fa fa-book"></i>&nbsp;Knowledge
            </span>
          </h1>
          <h2>
            <span>Free Knowledge Base System</span>
          </h2>
          <br />
          <Link 
            id="showlist" 
            className="btn btn-lg get-start" 
            role="button"
            href="/open/knowledge/list"
            onClick={(e) => e.stopPropagation()} // ヘッダークリックとの競合防止
          >
            Get Started!
          </Link>
          <br /><br />
          <br /><br />
        </div>
      </div>

      {/* Aboutセクション */}
      <div className="container">
        <div className="contects" id="about" data-testid="about-section">
          <div className="row">
            <div className="col-sm-12 subtitle">
              About Knowledge
              <div className="description">
                Knowledge is a free information sharing service of open source
              </div>
            </div>
          </div>

          <div className="row">
            {/* Free */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-github icon-img" data-testid="feature-icon-fa-github"></i>
              </div>
              <div className="about-title">Free</div>
              <div className="about-description">
                Service is free. This is open source.
              </div>
            </div>

            {/* Easy set up */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-download icon-img" data-testid="feature-icon-fa-download"></i>
              </div>
              <div className="about-title">Easy set up</div>
              <div className="about-description">
                Easy setup of just put the downloaded file.
              </div>
            </div>

            {/* Mobile */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-mobile-phone icon-img" data-testid="feature-icon-fa-mobile-phone"></i>
              </div>
              <div className="about-title">Mobile</div>
              <div className="about-description">
                It is corresponding to the display of the PC and mobile and tablet.
              </div>
            </div>

            {/* Nimble editing */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-pencil icon-img" data-testid="feature-icon-fa-pencil"></i>
              </div>
              <div className="about-title">Nimble editing</div>
              <div className="about-description">
                You will edit lightly in Markdown. the registered content, you can specify whether to publish to anyone.
              </div>
            </div>
          </div>

          <div className="row">
            {/* Find */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-search icon-img" data-testid="feature-icon-fa-search"></i>
              </div>
              <div className="about-title">Find</div>
              <div className="about-description">
                You can find knowledge with full-text search.<br />
                also you can also grouping by the tag.
              </div>
            </div>

            {/* Notification */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-bell-o icon-img" data-testid="feature-icon-fa-bell-o"></i>
              </div>
              <div className="about-title">Notification</div>
              <div className="about-description">
                Email notification and desktop notification to your knowledge of the update.
              </div>
            </div>

            {/* Attach File */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-paperclip icon-img" data-testid="feature-icon-fa-paperclip"></i>
              </div>
              <div className="about-title">Attach File</div>
              <div className="about-description">
                Various files of Word, Excel and Zip and PDF also attachable.
              </div>
            </div>

            {/* Social */}
            <div className="col-sm-6 col-md-3 col-lg-3" data-testid="feature-column">
              <div className="about-icon">
                <i className="fa fa-comments icon-img" data-testid="feature-icon-fa-comments"></i>
              </div>
              <div className="about-title">Social</div>
              <div className="about-description">
                By a like and comment function, you will share the tacit knowledge.
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-12 subtitle">
              <div className="description">
                <Link href="https://support-project.org/knowledge_info/index">
                  -&gt; More Information
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
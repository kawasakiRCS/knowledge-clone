'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import { useSafeHTMLProps } from '@/hooks/useSafeHTML';
import { convertEmoji } from '@/lib/emoji';
// React Markdown imports - conditionally loaded to avoid Jest ESM issues
let ReactMarkdown: any = null;
let remarkGfm: any = null;
let remarkBreaks: any = null;
let rehypeHighlight: any = null;
let rehypeSanitize: any = null;

// Only import these in non-test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    ReactMarkdown = require('react-markdown').default;
    remarkGfm = require('remark-gfm').default;
    remarkBreaks = require('remark-breaks').default;
    rehypeHighlight = require('rehype-highlight').default;
    rehypeSanitize = require('rehype-sanitize').default;
    require('@/styles/knowledge-view.css');
    require('highlight.js/styles/default.css');
  } catch (error) {
    console.warn('Failed to load markdown dependencies:', error);
  }
}

interface Tag {
  tagId: number;
  tagName: string;
}

interface Stock {
  stockId: number;
  stockName: string;
}

interface LabelValue {
  value: string;
  label: string;
}

interface UploadFile {
  fileNo: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface Comment {
  commentNo: number;
  comment: string;
  insertUser: string;
  insertDatetime: string;
  likeCount: number;
}

interface Knowledge {
  knowledgeId: number;
  title: string;
  content: string;
  publicFlag: number;
  typeId: number;
  point: number;
  likeCount: number;
  commentCount: number;
  tags: Tag[];
  stocks: Stock[];
  targets: LabelValue[];
  groups: LabelValue[];
  editors: LabelValue[];
  editable: boolean;
  insertUser: string;
  insertDatetime: string;
  updateUser: string;
  updateDatetime: string;
  files: UploadFile[];
  comments: Comment[];
}

interface Props {
  knowledge: Knowledge;
}

const KnowledgeView: React.FC<Props> = ({ knowledge }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [showToc, setShowToc] = useState(false);

  // formatDate関数は@/lib/utilsから使用

  const handleEdit = () => {
    router.push(`/protect/knowledge/edit/${knowledge.knowledgeId}`);
  };

  const handleTagClick = (tagId: number) => {
    router.push(`/open/knowledge/list?tag=${tagId}`);
  };

  const handleStockClick = (stockId: number) => {
    router.push(`/protect/stock/knowledge/${stockId}`);
  };

  const handleLike = () => {
    // TODO: いいね機能の実装
    console.log('Like clicked');
  };

  const handleStock = () => {
    // TODO: ストック機能の実装
    console.log('Stock clicked');
  };

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/open/knowledge/view/${knowledge.knowledgeId}`;
    navigator.clipboard.writeText(url);
    alert('URLをコピーしました');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: コメント投稿機能の実装
    console.log('Comment submitted');
  };

  return (
    <>
      <div className="row" id="content_head">
        {/* 左上のヘッダー部分 */}
        <div className="col-sm-8">
          <h4 className="title">
            <span className="dispKnowledgeId">
              #{knowledge.knowledgeId}
            </span>
            {' '}
            <span dangerouslySetInnerHTML={useSafeHTMLProps(knowledge.title)} />
          </h4>

          <div className="meta-info">
            {/* いいね、コメント、参加者 */}
            <div className="row">
              <div className="col-xs-3 text-center">
                <div className="text-muted">CP</div>
                <div className="text-primary" style={{ fontSize: '20px' }}>{knowledge.point}</div>
              </div>
              <div className="col-xs-3 text-center">
                <div className="text-muted">Likes</div>
                <div className="text-primary" style={{ fontSize: '20px' }}>{knowledge.likeCount}</div>
              </div>
              <div className="col-xs-3 text-center">
                <div className="text-muted">Comments</div>
                <div className="text-primary" style={{ fontSize: '20px' }}>{knowledge.commentCount}</div>
              </div>
              {knowledge.files.length > 0 && (
                <div className="col-xs-3 text-center">
                  <div className="text-muted">Files</div>
                  <div className="text-primary" style={{ fontSize: '20px' }}>{knowledge.files.length}</div>
                </div>
              )}
            </div>
          </div>

          <div className="meta-info">
            {/* テンプレートの種類表示 */}
            <span id="template_items"></span>

            {/* タグ */}
            {knowledge.tags.map(tag => (
              <span key={tag.tagId} className="tag-item">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleTagClick(tag.tagId);
                  }}
                  className="text-primary"
                >
                  <i className="fa fa-tag"></i> {tag.tagName}
                </a>
                {' '}
              </span>
            ))}

            {/* ストックに入れているか */}
            {knowledge.stocks.map(stock => (
              <span key={stock.stockId} className="stock-item">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleStockClick(stock.stockId);
                  }}
                  className="text-info"
                >
                  <i className="fa fa-star"></i> {stock.stockName}
                </a>
                {' '}
              </span>
            ))}

            {/* 公開区分 */}
            <span className="public-flag">
              {knowledge.publicFlag === 1 && (
                <span title="公開">
                  <i className="fa fa-globe"></i> 公開
                </span>
              )}
              {knowledge.publicFlag === 2 && (
                <span title="非公開">
                  <i className="fa fa-lock"></i> 非公開
                </span>
              )}
              {knowledge.publicFlag === 3 && (
                <>
                  <span title="保護">
                    <i className="fa fa-shield"></i> 保護
                  </span>
                  {knowledge.groups.length > 0 && (
                    <span>
                      {' '}(
                      {knowledge.groups.map((group, index) => (
                        <span key={group.value}>
                          {index > 0 && ', '}
                          {group.label}
                        </span>
                      ))}
                      )
                    </span>
                  )}
                </>
              )}
            </span>
          </div>

          <div className="meta-info">
            {/* 更新者情報 */}
            <div className="editor-info">
              <span>作成: {knowledge.insertUser} ({formatDate(knowledge.insertDatetime)})</span>
              {knowledge.updateUser !== knowledge.insertUser && (
                <>
                  {' / '}
                  <span>更新: {knowledge.updateUser} ({formatDate(knowledge.updateDatetime)})</span>
                </>
              )}
              {' '}
              <a href={`/open/knowledge/histories/${knowledge.knowledgeId}`}>
                <i className="fa fa-history"></i> 更新履歴
              </a>
            </div>
          </div>
        </div>

        {/* 右上のボタン部分 */}
        <div className="col-sm-4">
          <div className="btn-group-vertical btn-block" role="group">
            {/* 編集ボタン - 旧システムと同じ3状態実装 */}
            {user ? (
              knowledge.editable ? (
                <button 
                  type="button" 
                  className="btn btn-primary btn-block btn_edit"
                  onClick={handleEdit}
                >
                  <i className="fa fa-edit"></i> 投稿を編集
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn btn-primary btn-block btn_edit disabled"
                  disabled
                >
                  <i className="fa fa-info-circle"></i> 編集権限がありません
                </button>
              )
            ) : (
              <a 
                href={`/protect/knowledge/view_edit/${knowledge.knowledgeId}`}
                className="btn btn-primary btn-block btn_edit"
              >
                <i className="fa fa-edit"></i> ログインして編集
              </a>
            )}
            
            <button 
              type="button" 
              className="btn btn-info btn-block"
              onClick={handleStock}
            >
              <i className="fa fa-star-o"></i> ストック
            </button>

            <button 
              type="button" 
              className="btn btn-success btn-block"
              onClick={handleLike}
            >
              <i className="fa fa-thumbs-o-up"></i> いいね ({knowledge.likeCount})
            </button>

            <button 
              type="button" 
              className="btn btn-default btn-block"
              onClick={() => setShowToc(!showToc)}
            >
              <i className="fa fa-list"></i> 目次
            </button>

            <button 
              type="button" 
              className="btn btn-default btn-block"
              onClick={handleCopyUrl}
            >
              <i className="fa fa-link"></i> URL
            </button>
          </div>

          {/* 目次 */}
          {showToc && (
            <div id="toc" className="panel panel-default" style={{ marginTop: '10px' }}>
              <div className="panel-heading">
                <h3 className="panel-title">目次</h3>
              </div>
              <div className="panel-body">
                {/* TODO: 目次の実装 */}
                <p className="text-muted">目次は自動生成されます</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ナレッジ表示（メインのコンテンツ部分） */}
      <div className="row" id="content_main">
        <div className="col-sm-12">
          <div className="knowledge-content">
            {ReactMarkdown ? (
              <ReactMarkdown
                remarkPlugins={[
                  ...(remarkGfm ? [remarkGfm] : []),
                  ...(remarkBreaks ? [remarkBreaks] : [])
                ]}
                rehypePlugins={[
                  ...(rehypeHighlight ? [rehypeHighlight] : []),
                  ...(rehypeSanitize ? [rehypeSanitize] : [])
                ]}
                components={{
                  // 見出しにIDを付与（旧システム互換）
                  h1: ({ children, ...props }) => (
                    <h1 id={`markdown-agenda-${String(children).toLowerCase().replace(/\s+/g, '-')}`} {...props}>
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2 id={`markdown-agenda-${String(children).toLowerCase().replace(/\s+/g, '-')}`} {...props}>
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3 id={`markdown-agenda-${String(children).toLowerCase().replace(/\s+/g, '-')}`} {...props}>
                      {children}
                    </h3>
                  ),
                  h4: ({ children, ...props }) => (
                    <h4 id={`markdown-agenda-${String(children).toLowerCase().replace(/\s+/g, '-')}`} {...props}>
                      {children}
                    </h4>
                  ),
                  h5: ({ children, ...props }) => (
                    <h5 id={`markdown-agenda-${String(children).toLowerCase().replace(/\s+/g, '-')}`} {...props}>
                      {children}
                    </h5>
                  ),
                  h6: ({ children, ...props }) => (
                    <h6 id={`markdown-agenda-${String(children).toLowerCase().replace(/\s+/g, '-')}`} {...props}>
                      {children}
                    </h6>
                  ),
                  // リンクを新しいタブで開く（旧システム互換）
                  a: ({ href, children, ...props }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                      {children}
                    </a>
                  ),
                  // テキストノードの絵文字変換
                  p: ({ children, ...props }) => (
                    <p {...props}>
                      {typeof children === 'string' ? convertEmoji(children) : children}
                    </p>
                  ),
                }}
              >
                {convertEmoji(knowledge.content)}
              </ReactMarkdown>
            ) : (
              // Test environment fallback - use safe HTML with emoji conversion
              <div dangerouslySetInnerHTML={useSafeHTMLProps(convertEmoji(knowledge.content))} />
            )}
          </div>
        </div>
      </div>

      {/* 添付ファイル */}
      {knowledge.files.length > 0 && (
        <div className="row">
          <div className="col-sm-12">
            <h4>添付ファイル</h4>
            <div className="attach-files">
              {knowledge.files.map(file => (
                <div key={file.fileNo} className="attach-file-item">
                  <a href={`/open/knowledge/download/${knowledge.knowledgeId}/${file.fileNo}`}>
                    <i className="fa fa-file"></i> {file.fileName}
                  </a>
                  <span className="text-muted"> ({Math.round(file.fileSize / 1024)} KB)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* コメント表示 */}
      <hr />
      <div className="row">
        <div className="col-sm-12">
          <h4>コメント</h4>
          {knowledge.comments.map(comment => (
            <div key={comment.commentNo} className="comment-item">
              <div className="comment-header">
                <strong>{comment.insertUser}</strong>
                <span className="text-muted"> - {formatDate(comment.insertDatetime)}</span>
                <span className="pull-right">
                  <i className="fa fa-thumbs-o-up"></i> {comment.likeCount}
                </span>
              </div>
              <div className="comment-body" dangerouslySetInnerHTML={useSafeHTMLProps(comment.comment)} />
            </div>
          ))}
        </div>
      </div>

      {/* コメント登録 */}
      <hr />
      <div className="row">
        <div className="col-sm-12">
          {user ? (
            <form onSubmit={handleCommentSubmit}>
              <div className="form-group">
                <textarea 
                  className="form-control" 
                  rows={4}
                  placeholder="コメントを入力..."
                />
              </div>
              <button type="submit" className="btn btn-primary">
                <i className="fa fa-comment"></i> コメント投稿
              </button>
            </form>
          ) : (
            <div className="text-center">
              <p>コメントするにはログインしてください</p>
              <a href="/signin" className="btn btn-primary">
                <i className="fa fa-sign-in"></i> ログイン
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default KnowledgeView;
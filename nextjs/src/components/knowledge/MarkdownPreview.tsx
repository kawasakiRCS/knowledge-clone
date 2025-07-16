/**
 * マークダウンプレビューコンポーネント
 * 
 * @description 編集ページで使用するマークダウンプレビュー機能
 * @description 既存のKnowledgeViewコンポーネントのレンダリング処理を再利用
 */
'use client';

import React from 'react';
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
    require('highlight.js/styles/default.css');
  } catch (error) {
    console.warn('Failed to load markdown dependencies:', error);
  }
}

interface MarkdownPreviewProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * マークダウンプレビューコンポーネント
 * 
 * @description 旧システムと同等のマークダウンレンダリング処理
 * @description 絵文字変換、構文ハイライト、見出しIDなどを含む完全互換実装
 */
export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ 
  content, 
  className = '', 
  style = {} 
}) => {
  if (!content) {
    return (
      <div className={`knowledge-preview ${className}`} style={style}>
        <div className="text-muted">プレビュー内容がありません</div>
      </div>
    );
  }

  return (
    <div className={`knowledge-preview ${className}`} style={style}>
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
              // コードブロックの言語対応
              code: ({ className, children, ...props }) => (
                <code className={className} {...props}>
                  {children}
                </code>
              ),
              // 表の responsive対応
              table: ({ children, ...props }) => (
                <div className="table-responsive">
                  <table className="table table-bordered" {...props}>
                    {children}
                  </table>
                </div>
              ),
            }}
          >
            {convertEmoji(content)}
          </ReactMarkdown>
        ) : (
          // Test environment fallback - use safe HTML with emoji conversion
          <div dangerouslySetInnerHTML={useSafeHTMLProps(convertEmoji(content))} />
        )}
      </div>
    </div>
  );
};

export default MarkdownPreview;
/**
 * ナレッジ編集ページ
 * 
 * @description Issue #34 - ナレッジ作成・編集ページの実装
 * @description 旧システム protect/knowledge/edit.jsp の完全移植
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import MarkdownPreview from '@/components/knowledge/MarkdownPreview';
import TagInput from '@/components/knowledge/TagInput';
import FileUpload from '@/components/knowledge/FileUpload';

// バリデーションスキーマ
const knowledgeSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(1024, 'タイトルは1024文字以内で入力してください'),
  content: z.string().min(1, '内容は必須です'),
  publicFlag: z.number().int().min(1).max(3).default(2), // 1=公開, 2=非公開, 3=保護
  tags: z.array(z.string()).default([]),
  typeId: z.number().int().min(1).default(1), // デフォルト: ナレッジ
  editors: z.array(z.number()).default([]),
  viewers: z.array(z.number()).default([]),
  commentFlag: z.boolean().default(true),
  tagNames: z.string().default(''),
});

type KnowledgeFormData = z.infer<typeof knowledgeSchema>;

interface KnowledgeEditPageProps {
  params: Promise<{ params?: string[] }>;
}

/**
 * ナレッジ編集ページコンポーネント
 * 
 * @description 新規作成（params未指定）と編集（params[0]にID指定）を同一ページで処理
 */
export default function KnowledgeEditPage({ params: paramsPromise }: KnowledgeEditPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [knowledgeId, setKnowledgeId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [params, setParams] = useState<{ params?: string[] }>({ params: undefined });

  // フォーム初期化
  const methods = useForm<KnowledgeFormData>({
    resolver: zodResolver(knowledgeSchema),
    defaultValues: {
      title: '',
      content: '',
      publicFlag: 2, // 2=非公開
      tags: [],
      typeId: 1, // デフォルト: ナレッジ
      editors: [],
      viewers: [],
      commentFlag: true,
      tagNames: '',
    },
  });

  const { handleSubmit, formState: { errors }, reset, watch } = methods;
  
  // 自動保存用にタイトルと内容を監視
  const titleValue = watch('title');
  const contentValue = watch('content');

  // パラメータ取得
  useEffect(() => {
    paramsPromise.then(setParams);
  }, [paramsPromise]);

  // 認証チェック
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/signin');
    }
  }, [status, router]);

  // パラメータ解析とデータ読み込み
  useEffect(() => {
    if (params.params && params.params[0]) {
      const id = parseInt(params.params[0], 10);
      if (!isNaN(id)) {
        setKnowledgeId(id);
        setIsEditing(true);
        loadKnowledge(id);
      }
    }
  }, [params.params]);

  // 自動保存機能
  useEffect(() => {
    if (!titleValue && !contentValue) return;
    
    // 前回のタイマーをクリア
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    // 1分後に自動保存
    const timer = setTimeout(() => {
      autoSave();
    }, 60000); // 1分間隔
    
    setAutoSaveTimer(timer);
    
    // クリーンアップ
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [titleValue, contentValue]);

  // コンポーネントのクリーンアップ
  useEffect(() => {
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [autoSaveTimer]);

  /**
   * 既存記事の読み込み
   */
  const loadKnowledge = async (id: number) => {
    try {
      setIsLoading(true);
      // TODO: KnowledgeService.getForEdit(id) を実装
      const knowledge = await fetch(`/api/protect/knowledge/${id}`).then(res => res.json());
      
      if (knowledge.error) {
        throw new Error(knowledge.error);
      }
      
      // フォームに初期値を設定
      reset({
        title: knowledge.title || '',
        content: knowledge.content || '',
        publicFlag: knowledge.publicFlag || 2, // 2=非公開
        tags: knowledge.tags || [],
        typeId: knowledge.typeId || 1, // デフォルト: ナレッジ
        editors: knowledge.editors || [],
        viewers: knowledge.viewers || [],
        commentFlag: knowledge.commentFlag ?? true,
        tagNames: knowledge.tags?.join(',') || '',
      });
    } catch (error) {
      console.error('記事の読み込みに失敗しました:', error);
      // TODO: エラー通知の実装
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 公開処理
   */
  const onPublish = async (data: KnowledgeFormData) => {
    try {
      setIsLoading(true);
      const endpoint = isEditing ? `/api/protect/knowledge/${knowledgeId}` : '/api/protect/knowledge';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          draft: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('保存に失敗しました');
      }
      
      const result = await response.json();
      
      // 成功時のみ詳細ページにリダイレクト
      if (result && result.knowledgeId) {
        router.push(`/open/knowledge/view/${result.knowledgeId}`);
      }
    } catch (error) {
      console.error('公開処理でエラーが発生しました:', error);
      // TODO: エラー通知の実装
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 下書き保存処理
   */
  const onSaveDraft = async (data: KnowledgeFormData) => {
    try {
      setIsLoading(true);
      const endpoint = isEditing ? `/api/protect/knowledge/${knowledgeId}` : '/api/protect/knowledge';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          draft: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('下書き保存に失敗しました');
      }
      
      const result = await response.json();
      
      // 新規作成の場合、IDを設定
      if (!isEditing && result.knowledgeId) {
        setKnowledgeId(result.knowledgeId);
        setIsEditing(true);
        // URLを更新
        router.replace(`/protect/knowledge/edit/${result.knowledgeId}`);
      }
      
      setLastSaveTime(new Date());
      console.log('下書きを保存しました');
    } catch (error) {
      console.error('下書き保存でエラーが発生しました:', error);
      // TODO: エラー通知の実装
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 自動保存処理
   */
  const autoSave = async () => {
    if (isSaving) return;
    
    const currentData = methods.getValues();
    
    // タイトルまたは内容が空の場合はスキップ
    if (!currentData.title?.trim() && !currentData.content?.trim()) {
      return;
    }
    
    try {
      setIsSaving(true);
      
      const endpoint = isEditing ? `/api/protect/knowledge/${knowledgeId}` : '/api/protect/knowledge';
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...currentData,
          draft: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('自動保存に失敗しました');
      }
      
      const result = await response.json();
      
      // 新規作成の場合、IDを設定
      if (!isEditing && result.knowledgeId) {
        setKnowledgeId(result.knowledgeId);
        setIsEditing(true);
        // URLを更新
        router.replace(`/protect/knowledge/edit/${result.knowledgeId}`);
      }
      
      setLastSaveTime(new Date());
      console.log('自動保存しました');
    } catch (error) {
      console.error('自動保存でエラーが発生しました:', error);
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * 削除処理
   */
  const onDelete = async () => {
    if (!knowledgeId || !confirm('この記事を削除しますか？')) {
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/protect/knowledge/${knowledgeId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }
      
      // 成功時は一覧ページにリダイレクト
      router.push('/open/knowledge/list');
    } catch (error) {
      console.error('削除処理でエラーが発生しました:', error);
      // TODO: エラー通知の実装
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * キャンセル処理
   */
  const onCancel = () => {
    if (isEditing && knowledgeId) {
      router.push(`/open/knowledge/view/${knowledgeId}`);
    } else {
      router.push('/open/knowledge/list');
    }
  };

  /**
   * Enterキー無効化（タイトルフィールド用）
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="container-fluid">読み込み中...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="container-fluid" data-testid="knowledge-edit-container">
      <FormProvider {...methods}>
        <form 
          className="form-horizontal" 
          data-testid="knowledge-edit-form"
          onSubmit={handleSubmit(onPublish)}
        >
          <div className="row">
            {/* メインエディタ部分（左8カラム） */}
            <div className="col-md-8" data-testid="main-editor-section">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">
                    {isEditing ? '記事の編集' : '記事の作成'}
                  </h3>
                  {/* 自動保存ステータス */}
                  <div className="auto-save-status" style={{ float: 'right', marginTop: '5px' }}>
                    {isSaving && (
                      <small className="text-info">
                        <i className="fa fa-spinner fa-spin"></i> 保存中...
                      </small>
                    )}
                    {lastSaveTime && !isSaving && (
                      <small className="text-success">
                        <i className="fa fa-check"></i> 
                        {' '}最終保存: {lastSaveTime.toLocaleTimeString()}
                      </small>
                    )}
                  </div>
                </div>
                <div className="panel-body">
                  {/* タイトル入力 */}
                  <div className="form-group">
                    <label className="col-sm-2 control-label">タイトル</label>
                    <div className="col-sm-10">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="タイトルを入力してください"
                        onKeyDown={handleKeyDown}
                        {...methods.register('title')}
                      />
                      {errors.title && (
                        <div className="text-danger">{errors.title.message}</div>
                      )}
                    </div>
                  </div>

                  {/* エディタタブ */}
                  <div className="form-group">
                    <div className="col-sm-12">
                      <ul className="nav nav-tabs">
                        <li className={activeTab === 'write' ? 'active' : ''}>
                          <a
                            href="#"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveTab('write');
                            }}
                          >
                            Write
                          </a>
                        </li>
                        <li className={activeTab === 'preview' ? 'active' : ''}>
                          <a
                            href="#"
                            role="tab"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveTab('preview');
                            }}
                          >
                            Preview
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* 内容入力・プレビュー */}
                  <div className="form-group">
                    <div className="col-sm-12">
                      {activeTab === 'write' ? (
                        <div>
                          <textarea
                            className="form-control"
                            rows={20}
                            placeholder="内容をMarkdownで入力してください"
                            {...methods.register('content')}
                          />
                          {errors.content && (
                            <div className="text-danger">{errors.content.message}</div>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="form-control" 
                          style={{ height: '500px', overflow: 'auto' }}
                          data-testid="preview-content"
                        >
                          <MarkdownPreview content={watch('content') || ''} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 操作ボタン */}
                  <div className="form-group">
                    <div className="col-sm-12">
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isLoading}
                      >
                        公開
                      </button>
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={handleSubmit(onSaveDraft)}
                        disabled={isLoading}
                        style={{ marginLeft: '10px' }}
                      >
                        下書き保存
                      </button>
                      <button
                        type="button"
                        className="btn btn-info"
                        onClick={onCancel}
                        disabled={isLoading}
                        style={{ marginLeft: '10px' }}
                      >
                        キャンセル
                      </button>
                      {isEditing && (
                        <button
                          type="button"
                          className="btn btn-warning"
                          onClick={onDelete}
                          disabled={isLoading}
                          style={{ marginLeft: '10px' }}
                        >
                          削除
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* サイドバー部分（右4カラム） */}
            <div className="col-md-4" data-testid="sidebar-section">
              <div className="panel panel-default">
                <div className="panel-heading">
                  <h3 className="panel-title">記事設定</h3>
                </div>
                <div className="panel-body">
                  {/* 公開設定 */}
                  <div className="form-group">
                    <label className="control-label">公開設定</label>
                    <div>
                      <div className="radio">
                        <label>
                          <input
                            type="radio"
                            value="2"
                            defaultChecked={true}
                            {...methods.register('publicFlag', {
                              setValueAs: (value) => parseInt(value, 10)
                            })}
                          />
                          プライベート（自分のみ）
                        </label>
                      </div>
                      <div className="radio">
                        <label>
                          <input
                            type="radio"
                            value="1"
                            {...methods.register('publicFlag', {
                              setValueAs: (value) => parseInt(value, 10)
                            })}
                          />
                          パブリック（全員）
                        </label>
                      </div>
                      <div className="radio">
                        <label>
                          <input
                            type="radio"
                            value="3"
                            {...methods.register('publicFlag', {
                              setValueAs: (value) => parseInt(value, 10)
                            })}
                          />
                          保護（指定グループのみ）
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* テンプレートタイプ */}
                  <div className="form-group">
                    <label className="control-label">テンプレートタイプ</label>
                    <div>
                      <select
                        className="form-control"
                        {...methods.register('typeId', {
                          setValueAs: (value) => parseInt(value, 10)
                        })}
                      >
                        <option value={1}>ナレッジ</option>
                        <option value={2}>イベント</option>
                        <option value={3}>プレゼンテーション</option>
                        <option value={4}>ブックマーク</option>
                        <option value={5}>障害情報</option>
                      </select>
                    </div>
                  </div>

                  {/* タグ入力 */}
                  <div className="form-group">
                    <label className="control-label">タグ</label>
                    <TagInput
                      value={watch('tags') || []}
                      onChange={(tags) => {
                        methods.setValue('tags', tags);
                        methods.setValue('tagNames', tags.join(','));
                      }}
                      placeholder="タグを入力してください"
                      maxTags={20}
                    />
                  </div>

                  {/* コメント設定 */}
                  <div className="form-group">
                    <div className="checkbox">
                      <label>
                        <input
                          type="checkbox"
                          {...methods.register('commentFlag')}
                        />
                        コメントを許可する
                      </label>
                    </div>
                  </div>

                  {/* ファイルアップロード */}
                  <div className="form-group">
                    <label className="control-label">ファイル添付</label>
                    <FileUpload
                      onFileUploaded={(fileInfo) => {
                        setUploadedFiles(prev => [...prev, fileInfo]);
                      }}
                      onFileRemoved={(fileNo) => {
                        setUploadedFiles(prev => prev.filter(f => f.fileNo !== fileNo));
                      }}
                      existingFiles={uploadedFiles}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
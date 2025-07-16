/**
 * ファイルアップロードコンポーネント
 * 
 * @description 旧システムのjQuery File Uploadの代替実装
 * @description ドラッグ&ドロップ、プログレスバー、サムネイル表示を含む
 */
'use client';

import React, { useState, useRef, useCallback } from 'react';

interface UploadFile {
  file: File;
  uploadId: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  fileNo?: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

interface FileUploadProps {
  onFileUploaded?: (fileInfo: any) => void;
  onFileRemoved?: (fileNo: number) => void;
  maxFileSize?: number; // bytes
  allowedTypes?: string[];
  multiple?: boolean;
  disabled?: boolean;
  existingFiles?: any[];
}

/**
 * ファイルアップロードコンポーネント
 * 
 * @description ドラッグ&ドロップ対応のファイルアップロード
 */
export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileRemoved,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'],
  multiple = true,
  disabled = false,
  existingFiles = [],
}) => {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * ファイルサイズをフォーマット
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * ファイルタイプをチェック
   */
  const isValidFileType = (file: File): boolean => {
    return allowedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    });
  };

  /**
   * ファイルをアップロード
   */
  const uploadFile = async (file: File): Promise<void> => {
    const uploadId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    const uploadFile: UploadFile = {
      file,
      uploadId,
      progress: 0,
      status: 'pending',
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };

    setUploadFiles(prev => [...prev, uploadFile]);

    try {
      // ファイルサイズチェック
      if (file.size > maxFileSize) {
        throw new Error(`ファイルサイズが制限を超えています (最大: ${formatFileSize(maxFileSize)})`);
      }

      // ファイルタイプチェック
      if (!isValidFileType(file)) {
        throw new Error('サポートされていないファイル形式です');
      }

      // アップロード開始
      setUploadFiles(prev => prev.map(f => 
        f.uploadId === uploadId ? { ...f, status: 'uploading' } : f
      ));

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/protect/files', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'アップロードに失敗しました');
      }

      const result = await response.json();

      // アップロード完了
      setUploadFiles(prev => prev.map(f => 
        f.uploadId === uploadId ? { 
          ...f, 
          status: 'completed', 
          progress: 100, 
          fileNo: result.fileNo 
        } : f
      ));

      // 親コンポーネントに通知
      if (onFileUploaded) {
        onFileUploaded(result);
      }

    } catch (error) {
      console.error('File upload error:', error);
      
      setUploadFiles(prev => prev.map(f => 
        f.uploadId === uploadId ? { 
          ...f, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'アップロードに失敗しました'
        } : f
      ));
    }
  };

  /**
   * ファイル選択ハンドラー
   */
  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || disabled) return;

    Array.from(files).forEach(file => {
      uploadFile(file);
    });
  }, [disabled, uploadFile]);

  /**
   * ドラッグオーバーハンドラー
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  /**
   * ドラッグリーブハンドラー
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  /**
   * ドロップハンドラー
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  /**
   * ファイル削除ハンドラー
   */
  const handleRemoveFile = (uploadId: string, fileNo?: number) => {
    setUploadFiles(prev => prev.filter(f => f.uploadId !== uploadId));
    
    if (fileNo && onFileRemoved) {
      onFileRemoved(fileNo);
    }
  };

  /**
   * 既存ファイル削除ハンドラー
   */
  const handleRemoveExistingFile = (fileNo: number) => {
    if (onFileRemoved) {
      onFileRemoved(fileNo);
    }
  };

  /**
   * ファイル選択ボタンクリック
   */
  const handleSelectClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-upload-container">
      {/* ドロップゾーン */}
      <div
        className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectClick}
      >
        <div className="drop-zone-content">
          <i className="fa fa-cloud-upload fa-3x text-muted"></i>
          <p className="text-muted">
            ファイルをここにドラッグするか、クリックしてファイルを選択
          </p>
          <p className="text-muted small">
            最大サイズ: {formatFileSize(maxFileSize)}
          </p>
        </div>
      </div>

      {/* ファイル選択入力 */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        multiple={multiple}
        disabled={disabled}
        accept={allowedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* 既存ファイル一覧 */}
      {existingFiles.length > 0 && (
        <div className="existing-files">
          <h5>既存ファイル</h5>
          {existingFiles.map((file, index) => (
            <div key={`existing-${index}`} className="file-item">
              <div className="file-info">
                <i className="fa fa-file-o"></i>
                <span className="file-name">{file.fileName}</span>
                <span className="file-size text-muted">
                  ({formatFileSize(file.fileSize)})
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  className="btn btn-danger btn-xs"
                  onClick={() => handleRemoveExistingFile(file.fileNo)}
                >
                  <i className="fa fa-trash"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* アップロード中・完了ファイル一覧 */}
      {uploadFiles.length > 0 && (
        <div className="upload-files">
          <h5>アップロード中・完了</h5>
          {uploadFiles.map((uploadFile) => (
            <div key={uploadFile.uploadId} className="file-item">
              <div className="file-info">
                <i className={`fa ${uploadFile.status === 'error' ? 'fa-exclamation-triangle text-danger' : 'fa-file-o'}`}></i>
                <span className="file-name">{uploadFile.fileName}</span>
                <span className="file-size text-muted">
                  ({formatFileSize(uploadFile.fileSize || 0)})
                </span>
              </div>
              
              {/* ステータス表示 */}
              <div className="file-status">
                {uploadFile.status === 'uploading' && (
                  <div className="progress" style={{ width: '100px', height: '10px' }}>
                    <div
                      className="progress-bar progress-bar-info"
                      style={{ width: `${uploadFile.progress}%` }}
                    ></div>
                  </div>
                )}
                {uploadFile.status === 'completed' && (
                  <span className="text-success">
                    <i className="fa fa-check"></i> 完了
                  </span>
                )}
                {uploadFile.status === 'error' && (
                  <span className="text-danger">
                    <i className="fa fa-exclamation-triangle"></i> {uploadFile.error}
                  </span>
                )}
              </div>

              {/* 削除ボタン */}
              {!disabled && (
                <button
                  type="button"
                  className="btn btn-danger btn-xs"
                  onClick={() => handleRemoveFile(uploadFile.uploadId, uploadFile.fileNo)}
                >
                  <i className="fa fa-trash"></i>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* スタイル定義 */}
      <style jsx>{`
        .file-upload-container {
          margin-top: 10px;
        }

        .drop-zone {
          border: 2px dashed #ccc;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: #fafafa;
        }

        .drop-zone:hover:not(.disabled) {
          border-color: #5bc0de;
          background-color: #f0f8ff;
        }

        .drop-zone.drag-over {
          border-color: #5bc0de;
          background-color: #e6f3ff;
        }

        .drop-zone.disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: #f5f5f5;
        }

        .drop-zone-content {
          pointer-events: none;
        }

        .existing-files,
        .upload-files {
          margin-top: 20px;
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 8px;
          background-color: #f9f9f9;
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
        }

        .file-name {
          font-weight: 500;
        }

        .file-size {
          font-size: 0.9em;
        }

        .file-status {
          display: flex;
          align-items: center;
          margin-left: 12px;
          margin-right: 12px;
        }

        .progress {
          background-color: #f5f5f5;
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-bar {
          height: 100%;
          background-color: #5bc0de;
          transition: width 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
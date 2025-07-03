<?php

namespace App\Services;

use App\Models\Knowledge\KnowledgeFile;
use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
class FileService
{
    public function __construct()
    {
        //
    }

    /**
     * 複数ファイルをアップロード
     */
    public function uploadFiles(array $files, ?int $knowledgeId, ?int $commentNo, User $user): Collection
    {
        $uploadedFiles = collect();

        DB::transaction(function () use ($files, $knowledgeId, $commentNo, $user, &$uploadedFiles) {
            foreach ($files as $file) {
                $uploadedFile = $this->uploadSingleFile($file, $knowledgeId, $commentNo, $user);
                $uploadedFiles->push($uploadedFile);
            }
        });

        return $uploadedFiles;
    }

    /**
     * 単一ファイルをアップロード
     */
    public function uploadSingleFile(UploadedFile $file, ?int $knowledgeId, ?int $commentNo, User $user): KnowledgeFile
    {
        // ファイル情報取得
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        $extension = $file->getClientOriginalExtension();

        // ユニークなファイル名生成
        $realFileName = $this->generateUniqueFileName($originalName, $extension);
        
        // ファイル保存
        $path = $file->storeAs('knowledge-files', $realFileName, 'private');
        
        // バイナリデータ取得（既存システム互換性のため）
        $binaryData = file_get_contents($file->getPathname());

        // データベースに保存
        $knowledgeFile = KnowledgeFile::create([
            'knowledge_id' => $knowledgeId,
            'comment_no' => $commentNo,
            'file_name' => $originalName,
            'real_file_name' => $realFileName,
            'file_size' => $size,
            'file_type' => $mimeType,
            'file_binary' => $binaryData,
            'insert_user' => $user->user_id,
        ]);

        // 画像の場合はサムネイル生成
        if ($this->isImage($mimeType)) {
            $this->generateThumbnail($knowledgeFile, $file->getPathname());
        }

        return $knowledgeFile->load('uploader');
    }

    /**
     * ファイルダウンロード
     */
    public function downloadFile(KnowledgeFile $file): Response
    {
        // ストレージからファイル取得を試行
        $filePath = 'knowledge-files/' . $file->real_file_name;
        
        if (Storage::disk('private')->exists($filePath)) {
            // ストレージから提供
            return response()->download(
                Storage::disk('private')->path($filePath),
                $file->file_name
            );
        } else {
            // データベースのバイナリデータから提供
            return response($file->file_binary, 200, [
                'Content-Type' => $file->file_type,
                'Content-Disposition' => 'attachment; filename="' . $file->file_name . '"',
                'Content-Length' => $file->file_size,
            ]);
        }
    }

    /**
     * ファイル表示（ブラウザ内）
     */
    public function displayFile(KnowledgeFile $file): Response
    {
        // ストレージからファイル取得を試行
        $filePath = 'knowledge-files/' . $file->real_file_name;
        
        if (Storage::disk('private')->exists($filePath)) {
            // ストレージから提供
            return response()->file(Storage::disk('private')->path($filePath));
        } else {
            // データベースのバイナリデータから提供
            return response($file->file_binary, 200, [
                'Content-Type' => $file->file_type,
                'Content-Length' => $file->file_size,
            ]);
        }
    }

    /**
     * サムネイル取得
     */
    public function getThumbnail(KnowledgeFile $file): Response
    {
        if (!$this->isImage($file->file_type)) {
            abort(404, 'サムネイルは画像ファイルのみ対応しています。');
        }

        $thumbnailPath = 'thumbnails/' . $file->real_file_name;
        
        if (Storage::disk('private')->exists($thumbnailPath)) {
            // 既存のサムネイルを提供
            return response()->file(Storage::disk('private')->path($thumbnailPath));
        } else {
            // サムネイルを動的生成
            return $this->generateThumbnailResponse($file);
        }
    }

    /**
     * ファイル削除
     */
    public function deleteFile(KnowledgeFile $file): void
    {
        DB::transaction(function () use ($file) {
            // ストレージからファイル削除
            $filePath = 'knowledge-files/' . $file->real_file_name;
            if (Storage::disk('private')->exists($filePath)) {
                Storage::disk('private')->delete($filePath);
            }

            // サムネイル削除
            $thumbnailPath = 'thumbnails/' . $file->real_file_name;
            if (Storage::disk('private')->exists($thumbnailPath)) {
                Storage::disk('private')->delete($thumbnailPath);
            }

            // データベースから削除（ソフトデリート）
            $file->delete();
        });
    }

    /**
     * 一時ファイルアップロード
     */
    public function uploadTemporaryFile(UploadedFile $file, User $user): array
    {
        $originalName = $file->getClientOriginalName();
        $mimeType = $file->getMimeType();
        $size = $file->getSize();
        $extension = $file->getClientOriginalExtension();

        // 一時ファイルID生成
        $tempId = Str::uuid();
        
        // 一時ファイル名生成
        $tempFileName = $tempId . '.' . $extension;
        
        // 一時フォルダに保存
        $path = $file->storeAs('temp-files/' . $user->user_id, $tempFileName, 'private');

        return [
            'temp_id' => $tempId,
            'file_name' => $originalName,
            'file_size' => $size,
            'file_type' => $mimeType,
            'url' => route('files.temp.show', ['temp_id' => $tempId]),
        ];
    }

    /**
     * 一時ファイルを本ファイルに変換
     */
    public function convertTemporaryFiles(array $tempIds, int $knowledgeId, ?int $commentNo, User $user): Collection
    {
        $convertedFiles = collect();

        DB::transaction(function () use ($tempIds, $knowledgeId, $commentNo, $user, &$convertedFiles) {
            foreach ($tempIds as $tempId) {
                $convertedFile = $this->convertSingleTemporaryFile($tempId, $knowledgeId, $commentNo, $user);
                if ($convertedFile) {
                    $convertedFiles->push($convertedFile);
                }
            }
        });

        return $convertedFiles;
    }

    /**
     * 一時ファイルを本ファイルに変換（単一）
     */
    protected function convertSingleTemporaryFile(string $tempId, int $knowledgeId, ?int $commentNo, User $user): ?KnowledgeFile
    {
        // 一時ファイルのパスを検索
        $tempDir = 'temp-files/' . $user->user_id;
        $files = Storage::disk('private')->files($tempDir);
        
        $tempFilePath = null;
        foreach ($files as $file) {
            if (str_contains($file, $tempId)) {
                $tempFilePath = $file;
                break;
            }
        }

        if (!$tempFilePath || !Storage::disk('private')->exists($tempFilePath)) {
            return null;
        }

        // ファイル情報取得
        $fullPath = Storage::disk('private')->path($tempFilePath);
        $pathInfo = pathinfo($tempFilePath);
        $extension = $pathInfo['extension'] ?? '';
        $mimeType = mime_content_type($fullPath);
        $size = filesize($fullPath);

        // オリジナルファイル名を推測（実際の実装では別途保存が必要）
        $originalName = 'uploaded_file.' . $extension;

        // 本ファイル名生成
        $realFileName = $this->generateUniqueFileName($originalName, $extension);
        
        // 本ファイルディレクトリに移動
        $newPath = 'knowledge-files/' . $realFileName;
        Storage::disk('private')->move($tempFilePath, $newPath);

        // バイナリデータ取得
        $binaryData = Storage::disk('private')->get($newPath);

        // データベースに保存
        $knowledgeFile = KnowledgeFile::create([
            'knowledge_id' => $knowledgeId,
            'comment_no' => $commentNo,
            'file_name' => $originalName,
            'real_file_name' => $realFileName,
            'file_size' => $size,
            'file_type' => $mimeType,
            'file_binary' => $binaryData,
            'insert_user' => $user->user_id,
        ]);

        // 画像の場合はサムネイル生成
        if ($this->isImage($mimeType)) {
            $this->generateThumbnail($knowledgeFile, Storage::disk('private')->path($newPath));
        }

        return $knowledgeFile->load('uploader');
    }

    /**
     * ユニークなファイル名を生成
     */
    protected function generateUniqueFileName(string $originalName, string $extension): string
    {
        $baseName = pathinfo($originalName, PATHINFO_FILENAME);
        $safeName = preg_replace('/[^a-zA-Z0-9_-]/', '_', $baseName);
        $timestamp = now()->format('YmdHis');
        $random = Str::random(8);
        
        return "{$timestamp}_{$random}_{$safeName}.{$extension}";
    }

    /**
     * 画像ファイルかチェック
     */
    protected function isImage(string $mimeType): bool
    {
        return str_starts_with($mimeType, 'image/');
    }

    /**
     * サムネイル生成（簡易版）
     */
    protected function generateThumbnail(KnowledgeFile $file, string $sourcePath): void
    {
        // 今後の実装：Intervention ImageやGDライブラリを使用してサムネイル生成
        // 現在は何もしない（オリジナル画像をそのまま使用）
        logger()->info('Thumbnail generation skipped for now', [
            'file_id' => $file->file_no,
            'file_name' => $file->file_name
        ]);
    }

    /**
     * サムネイルレスポンス生成
     */
    protected function generateThumbnailResponse(KnowledgeFile $file): Response
    {
        // 簡易版：オリジナル画像をそのまま返す
        return $this->displayFile($file);
    }
}
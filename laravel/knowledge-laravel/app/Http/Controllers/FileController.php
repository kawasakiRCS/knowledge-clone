<?php

namespace App\Http\Controllers;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\KnowledgeFile;
use App\Models\Knowledge\Comment;
use App\Http\Requests\FileUploadRequest;
use App\Services\FileService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class FileController extends Controller
{
    public function __construct(
        protected FileService $fileService
    ) {}

    /**
     * ファイルアップロード
     */
    public function upload(FileUploadRequest $request): JsonResponse
    {
        $user = Auth::user();
        
        try {
            $files = $this->fileService->uploadFiles(
                $request->file('files'),
                $request->get('knowledge_id'),
                $request->get('comment_no'),
                $user
            );

            return response()->json([
                'success' => true,
                'files' => $files,
                'message' => 'ファイルをアップロードしました。'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * ファイルダウンロード
     */
    public function download(KnowledgeFile $file): Response
    {
        $user = Auth::user();

        // アクセス権限チェック
        if ($file->knowledge_id) {
            if (!$file->knowledge->isAccessibleBy($user->user_id)) {
                abort(403, 'このファイルへのアクセス権限がありません。');
            }
        }

        return $this->fileService->downloadFile($file);
    }

    /**
     * ファイル表示（画像など）
     */
    public function show(KnowledgeFile $file): Response
    {
        $user = Auth::user();

        // アクセス権限チェック
        if ($file->knowledge_id) {
            if (!$file->knowledge->isAccessibleBy($user->user_id)) {
                abort(403, 'このファイルへのアクセス権限がありません。');
            }
        }

        return $this->fileService->displayFile($file);
    }

    /**
     * サムネイル表示
     */
    public function thumbnail(KnowledgeFile $file): Response
    {
        $user = Auth::user();

        // アクセス権限チェック
        if ($file->knowledge_id) {
            if (!$file->knowledge->isAccessibleBy($user->user_id)) {
                abort(403, 'このファイルへのアクセス権限がありません。');
            }
        }

        return $this->fileService->getThumbnail($file);
    }

    /**
     * ファイル削除
     */
    public function destroy(KnowledgeFile $file): JsonResponse
    {
        $user = Auth::user();

        // 削除権限チェック（ファイルの投稿者またはナレッジの編集権限）
        $canDelete = false;
        
        if ($file->insert_user === $user->user_id) {
            $canDelete = true;
        } elseif ($file->knowledge_id && $file->knowledge->isEditableBy($user->user_id)) {
            $canDelete = true;
        }

        if (!$canDelete) {
            return response()->json([
                'success' => false,
                'message' => 'このファイルの削除権限がありません。'
            ], 403);
        }

        try {
            $this->fileService->deleteFile($file);

            return response()->json([
                'success' => true,
                'message' => 'ファイルを削除しました。'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ナレッジのファイル一覧取得
     */
    public function knowledgeFiles(Knowledge $knowledge): JsonResponse
    {
        $user = Auth::user();

        // アクセス権限チェック
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            return response()->json([
                'success' => false,
                'message' => 'このナレッジへのアクセス権限がありません。'
            ], 403);
        }

        $files = $knowledge->files()
                          ->with('uploader')
                          ->orderBy('insert_datetime', 'desc')
                          ->get()
                          ->map(function ($file) {
                              return [
                                  'file_no' => $file->file_no,
                                  'file_name' => $file->file_name,
                                  'real_file_name' => $file->real_file_name,
                                  'file_size' => $file->file_size,
                                  'formatted_file_size' => $file->formatted_file_size,
                                  'file_type' => $file->file_type,
                                  'is_image' => $file->is_image,
                                  'upload_date' => $file->insert_datetime,
                                  'uploader' => $file->uploader ? [
                                      'user_id' => $file->uploader->user_id,
                                      'user_name' => $file->uploader->user_name,
                                  ] : null,
                                  'download_url' => route('files.download', $file),
                                  'view_url' => $file->is_image ? route('files.show', $file) : null,
                                  'thumbnail_url' => $file->is_image ? route('files.thumbnail', $file) : null,
                              ];
                          });

        return response()->json([
            'success' => true,
            'files' => $files
        ]);
    }

    /**
     * 一時ファイルアップロード（編集中用）
     */
    public function uploadTemporary(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|max:10240', // 10MB
        ]);

        $user = Auth::user();
        
        try {
            $tempFile = $this->fileService->uploadTemporaryFile(
                $request->file('file'),
                $user
            );

            return response()->json([
                'success' => true,
                'temp_id' => $tempFile['temp_id'],
                'file_name' => $tempFile['file_name'],
                'file_size' => $tempFile['file_size'],
                'file_type' => $tempFile['file_type'],
                'url' => $tempFile['url'],
                'message' => '一時ファイルをアップロードしました。'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * 一時ファイルを本ファイルに変換
     */
    public function convertTemporary(Request $request): JsonResponse
    {
        $request->validate([
            'temp_ids' => 'required|array',
            'temp_ids.*' => 'required|string',
            'knowledge_id' => 'required|integer|exists:knowledges,knowledge_id',
            'comment_no' => 'nullable|integer|exists:comments,comment_no',
        ]);

        $user = Auth::user();

        try {
            $files = $this->fileService->convertTemporaryFiles(
                $request->temp_ids,
                $request->knowledge_id,
                $request->comment_no,
                $user
            );

            return response()->json([
                'success' => true,
                'files' => $files,
                'message' => 'ファイルを保存しました。'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
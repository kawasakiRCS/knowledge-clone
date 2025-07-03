<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FileUploadMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // ファイルアップロード制限の追加チェック
        if ($request->hasFile('files')) {
            $totalSize = 0;
            $fileCount = 0;

            foreach ($request->file('files') as $file) {
                if ($file && $file->isValid()) {
                    $totalSize += $file->getSize();
                    $fileCount++;
                }
            }

            // ファイル数制限（10ファイル）
            if ($fileCount > 10) {
                return response()->json([
                    'success' => false,
                    'message' => 'アップロードできるファイル数は10個までです。'
                ], 400);
            }

            // 合計サイズ制限（100MB）
            if ($totalSize > 104857600) {
                return response()->json([
                    'success' => false,
                    'message' => 'アップロードファイルの合計サイズは100MB以下にしてください。'
                ], 400);
            }

            // 個別ファイルサイズ制限（50MB）
            foreach ($request->file('files') as $file) {
                if ($file && $file->isValid() && $file->getSize() > 52428800) {
                    return response()->json([
                        'success' => false,
                        'message' => 'ファイルサイズは50MB以下にしてください。'
                    ], 400);
                }
            }
        }

        // 単一ファイルの場合
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            
            if ($file && $file->isValid() && $file->getSize() > 52428800) {
                return response()->json([
                    'success' => false,
                    'message' => 'ファイルサイズは50MB以下にしてください。'
                ], 400);
            }
        }

        return $next($request);
    }
}
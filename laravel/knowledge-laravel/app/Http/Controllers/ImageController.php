<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class ImageController extends Controller
{
    /**
     * 画像をアップロードして、URLを返す
     */
    public function upload(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:10240', // 10MB max
            ]);

            $image = $request->file('image');
            $userId = Auth::id();
            
            // ファイル名を生成（ユニークで安全）
            $filename = $userId . '_' . time() . '_' . Str::random(10) . '.' . $image->getClientOriginalExtension();
            
            // 画像マネージャーを作成
            $manager = new ImageManager(new Driver());
            
            // 画像を最適化して保存
            $imageInstance = $manager->read($image->getPathname());
            
            // 大きすぎる画像はリサイズ
            if ($imageInstance->width() > 1920 || $imageInstance->height() > 1080) {
                $imageInstance->scaleDown(1920, 1080);
            }
            
            // 画像を保存
            $path = 'images/' . $filename;
            Storage::disk('public')->put($path, $imageInstance->encode());
            
            // サムネイルも作成
            $thumbnailPath = 'images/thumbnails/' . $filename;
            $thumbnail = $manager->read($image->getPathname())->scaleDown(300, 300);
            Storage::disk('public')->put($thumbnailPath, $thumbnail->encode());
            
            // URLを生成
            $url = Storage::disk('public')->url($path);
            $thumbnailUrl = Storage::disk('public')->url($thumbnailPath);
            
            return response()->json([
                'success' => true,
                'filename' => $filename,
                'url' => $url,
                'thumbnailUrl' => $thumbnailUrl,
                'markdown' => "![image]({$url})",
            ]);
            
        } catch (\Exception $e) {
            \Log::error('Image upload error: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => '画像のアップロードに失敗しました: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 画像を表示
     */
    public function show(string $filename): Response
    {
        $path = 'images/' . $filename;
        
        if (!Storage::disk('public')->exists($path)) {
            abort(404);
        }
        
        $file = Storage::disk('public')->get($path);
        $mimeType = Storage::disk('public')->mimeType($path);
        
        return response($file, 200, [
            'Content-Type' => $mimeType,
            'Cache-Control' => 'public, max-age=31536000', // 1年キャッシュ
        ]);
    }
}
<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\KnowledgeController;
use App\Http\Controllers\SearchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// ホームページ（ナレッジ一覧にリダイレクト）
Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('knowledge.index');
    }
    
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// ダッシュボード（ナレッジ一覧）
Route::get('/dashboard', function () {
    try {
        \Log::info('Dashboard accessed by user: ' . (Auth::check() ? Auth::id() : 'guest'));
        if (!Auth::check()) {
            \Log::error('User not authenticated on dashboard access');
            return redirect('/login');
        }
        \Log::info('Redirecting to knowledge.index');
        return redirect()->route('knowledge.index');
    } catch (\Exception $e) {
        \Log::error('Dashboard redirect error: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 500);
    }
})->middleware(['auth'])->name('dashboard');

// 認証が必要なルート
Route::middleware('auth')->group(function () {
    // プロフィール管理
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // ナレッジ管理
    Route::resource('knowledge', KnowledgeController::class);
    Route::post('/knowledge/{knowledge}/like', [KnowledgeController::class, 'like'])->name('knowledge.like');
    
    // コメント管理
    Route::get('/knowledge/{knowledge}/comments', [\App\Http\Controllers\CommentController::class, 'index'])->name('comments.index');
    Route::post('/comments', [\App\Http\Controllers\CommentController::class, 'store'])->name('comments.store');
    Route::get('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'show'])->name('comments.show');
    Route::get('/comments/{comment}/edit', [\App\Http\Controllers\CommentController::class, 'edit'])->name('comments.edit');
    Route::put('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'update'])->name('comments.update');
    Route::delete('/comments/{comment}', [\App\Http\Controllers\CommentController::class, 'destroy'])->name('comments.destroy');
    Route::post('/comments/{comment}/like', [\App\Http\Controllers\CommentController::class, 'like'])->name('comments.like');
    Route::post('/comments/{comment}/toggle-status', [\App\Http\Controllers\CommentController::class, 'toggleStatus'])->name('comments.toggle-status');
    Route::get('/my/comments', [\App\Http\Controllers\CommentController::class, 'userComments'])->name('my.comments');
    
    // 検索機能
    Route::get('/search', [SearchController::class, 'index'])->name('search.index');
    Route::get('/search/advanced', [SearchController::class, 'advanced'])->name('search.advanced');
    Route::get('/api/search/suggest', [SearchController::class, 'suggest'])->name('search.suggest');
    
    // ファイル管理
    Route::post('/files/upload', [\App\Http\Controllers\FileController::class, 'upload'])->middleware('file.upload')->name('files.upload');
    Route::get('/files/{file}/download', [\App\Http\Controllers\FileController::class, 'download'])->name('files.download');
    Route::get('/files/{file}/show', [\App\Http\Controllers\FileController::class, 'show'])->name('files.show');
    Route::get('/files/{file}/thumbnail', [\App\Http\Controllers\FileController::class, 'thumbnail'])->name('files.thumbnail');
    Route::delete('/files/{file}', [\App\Http\Controllers\FileController::class, 'destroy'])->name('files.destroy');
    Route::get('/knowledge/{knowledge}/files', [\App\Http\Controllers\FileController::class, 'knowledgeFiles'])->name('knowledge.files');
    
    // 一時ファイル管理
    Route::post('/files/temp/upload', [\App\Http\Controllers\FileController::class, 'uploadTemporary'])->middleware('file.upload')->name('files.temp.upload');
    Route::post('/files/temp/convert', [\App\Http\Controllers\FileController::class, 'convertTemporary'])->name('files.temp.convert');
});

// Test login route
Route::get('/test-login', function () {
    return view('test-login');
})->name('test.login');

// 画像アップロードAPI（認証必要）
Route::middleware('auth')->group(function () {
    Route::post('/api/images/upload', [\App\Http\Controllers\ImageController::class, 'upload'])->name('api.images.upload');
    Route::get('/api/images/{filename}', [\App\Http\Controllers\ImageController::class, 'show'])->name('api.images.show');
});

require __DIR__.'/auth.php';

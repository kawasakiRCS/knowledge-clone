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
    return redirect()->route('knowledge.index');
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
    
    // 検索機能
    Route::get('/search', [SearchController::class, 'index'])->name('search.index');
    Route::get('/search/advanced', [SearchController::class, 'advanced'])->name('search.advanced');
    Route::get('/api/search/suggest', [SearchController::class, 'suggest'])->name('search.suggest');
});

require __DIR__.'/auth.php';

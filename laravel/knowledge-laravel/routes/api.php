<?php

use App\Http\Controllers\Api\KnowledgeController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// API認証が必要なルート
Route::middleware('auth:sanctum')->group(function () {
    // ナレッジAPI
    Route::apiResource('knowledge', KnowledgeController::class)->only(['index', 'show']);
    Route::get('/knowledge/{knowledge}/like-status', [KnowledgeController::class, 'likeStatus']);
    Route::post('/knowledge/{knowledge}/toggle-like', [KnowledgeController::class, 'toggleLike']);
    
    // ファイルAPI
    Route::post('/files/upload', [\App\Http\Controllers\FileController::class, 'upload']);
    Route::get('/knowledge/{knowledge}/files', [\App\Http\Controllers\FileController::class, 'knowledgeFiles']);
    Route::delete('/files/{file}', [\App\Http\Controllers\FileController::class, 'destroy']);
    
    // その他のAPI
    Route::get('/tags', [KnowledgeController::class, 'tags']);
    Route::get('/knowledge/recent', [KnowledgeController::class, 'recent']);
    Route::get('/knowledge/popular', [KnowledgeController::class, 'popular']);
});
<?php

namespace App\Models\Knowledge;

use App\Models\BaseModel;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

/**
 * ナレッジ添付ファイルモデル
 * 
 * @property int $file_no
 * @property int $knowledge_id
 * @property int $comment_no
 * @property string $file_name
 * @property string $real_file_name
 * @property int $file_size
 * @property string $file_type
 * @property string $file_binary
 * @property int $insert_user
 * @property \Carbon\Carbon $insert_datetime
 * @property int $update_user
 * @property \Carbon\Carbon $update_datetime
 * @property int $delete_flag
 */
class KnowledgeFile extends BaseModel implements HasMedia
{
    use InteractsWithMedia;

    /**
     * テーブル名
     */
    protected $table = 'knowledge_files';

    /**
     * 主キー
     */
    protected $primaryKey = 'file_no';

    /**
     * データベース接続名
     */
    protected $connection = 'knowledge_legacy';

    /**
     * 一括代入可能なカラム
     */
    protected $fillable = [
        'knowledge_id',
        'comment_no',
        'file_name',
        'real_file_name',
        'file_size',
        'file_type'
    ];

    /**
     * キャストするカラム
     */
    protected $casts = [
        'file_no' => 'integer',
        'knowledge_id' => 'integer',
        'comment_no' => 'integer',
        'file_size' => 'integer',
        'insert_user' => 'integer',
        'update_user' => 'integer',
        'delete_flag' => 'integer',
    ];

    /**
     * 非表示カラム
     */
    protected $hidden = [
        'file_binary'
    ];

    /**
     * ナレッジとの関係
     */
    public function knowledge(): BelongsTo
    {
        return $this->belongsTo(Knowledge::class, 'knowledge_id', 'knowledge_id');
    }

    /**
     * コメントとの関係（nullable）
     */
    public function comment(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'comment_no', 'comment_no');
    }

    /**
     * アップロードユーザーとの関係
     */
    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'insert_user', 'user_id');
    }

    /**
     * 画像ファイルのスコープ
     */
    public function scopeImages($query)
    {
        return $query->where('file_type', 'LIKE', 'image/%');
    }

    /**
     * 特定ナレッジのファイルを取得するスコープ
     */
    public function scopeForKnowledge($query, $knowledgeId)
    {
        return $query->where('knowledge_id', $knowledgeId);
    }

    /**
     * 特定コメントのファイルを取得するスコープ
     */
    public function scopeForComment($query, $commentNo)
    {
        return $query->where('comment_no', $commentNo);
    }

    /**
     * ファイルサイズを人間が読みやすい形式で取得
     */
    public function getFormattedFileSizeAttribute(): string
    {
        $bytes = $this->file_size;
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        
        return round($bytes, 2) . ' ' . $units[$i];
    }

    /**
     * ファイルが画像かどうかチェック
     */
    public function getIsImageAttribute(): bool
    {
        return str_starts_with($this->file_type, 'image/');
    }

    /**
     * メディアコレクション定義
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('attachments')
              ->acceptsMimeTypes(['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'text/plain'])
              ->singleFile();
              
        $this->addMediaCollection('thumbnails')
              ->acceptsMimeTypes(['image/jpeg', 'image/png'])
              ->singleFile();
    }

    /**
     * メディア変換定義
     */
    public function registerMediaConversions(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
              ->width(300)
              ->height(300)
              ->sharpen(10)
              ->performOnCollections('attachments');
    }
}
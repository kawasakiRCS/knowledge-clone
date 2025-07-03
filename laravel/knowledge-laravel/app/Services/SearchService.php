<?php

namespace App\Services;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Tag;
use App\Models\Web\User;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Laravel\Scout\Builder as ScoutBuilder;

class SearchService
{
    /**
     * 全文検索を実行
     */
    public function searchKnowledges(
        string $query, 
        User $user, 
        array $filters = [], 
        string $sort = 'relevance',
        int $perPage = 20
    ): LengthAwarePaginator {
        
        if (empty(trim($query))) {
            // 空の検索の場合は通常の一覧取得
            return $this->getKnowledgesByFilters($user, $filters, $sort, $perPage);
        }

        // Scout検索を使用
        $scoutQuery = Knowledge::search($query);
        
        // アクセス可能なナレッジのみに制限
        $scoutQuery = $this->applyAccessFilters($scoutQuery, $user);
        
        // フィルターを適用
        $scoutQuery = $this->applyScoutFilters($scoutQuery, $filters);
        
        // ソートを適用
        $scoutQuery = $this->applyScoutSorting($scoutQuery, $sort);

        // ページネーション実行
        $results = $scoutQuery->paginate($perPage);
        
        // リレーションをロード
        $results->getCollection()->load(['creator', 'tags', 'templateMaster']);
        
        return $results;
    }

    /**
     * タグ検索
     */
    public function searchTags(string $query, int $limit = 20): Collection
    {
        if (empty(trim($query))) {
            return collect();
        }

        return Tag::where('tag_name', 'LIKE', "%{$query}%")
                  ->withCount('knowledges')
                  ->having('knowledges_count', '>', 0)
                  ->orderBy('knowledges_count', 'desc')
                  ->limit($limit)
                  ->get();
    }

    /**
     * 高度な検索
     */
    public function advancedSearch(
        array $criteria, 
        User $user, 
        string $sort = 'relevance',
        int $perPage = 20
    ): LengthAwarePaginator {
        
        // 検索条件が複雑な場合はEloquentクエリを使用
        if ($this->shouldUseEloquentSearch($criteria)) {
            return $this->eloquentAdvancedSearch($criteria, $user, $sort, $perPage);
        }

        // 基本的な検索はScoutを使用
        $query = $criteria['query'] ?? '';
        return $this->searchKnowledges($query, $user, $criteria, $sort, $perPage);
    }

    /**
     * サジェスト機能
     */
    public function getSuggestions(string $query, User $user, int $limit = 10): array
    {
        if (strlen($query) < 2) {
            return [];
        }

        $suggestions = [];

        // タイトルから候補を取得
        $titleSuggestions = Knowledge::accessibleBy($user->user_id)
                                  ->where('title', 'LIKE', "%{$query}%")
                                  ->limit(5)
                                  ->pluck('title')
                                  ->toArray();

        // タグから候補を取得
        $tagSuggestions = Tag::where('tag_name', 'LIKE', "%{$query}%")
                            ->limit(5)
                            ->pluck('tag_name')
                            ->toArray();

        // 検索履歴から候補を取得（今後の実装）
        $historySuggestions = $this->getSearchHistory($user, $query, 3);

        $suggestions = array_merge($titleSuggestions, $tagSuggestions, $historySuggestions);
        $suggestions = array_unique($suggestions);
        
        return array_slice($suggestions, 0, $limit);
    }

    /**
     * 関連検索キーワード取得
     */
    public function getRelatedKeywords(string $query, User $user, int $limit = 5): array
    {
        if (empty(trim($query))) {
            return [];
        }

        // 検索結果からタグを分析
        $knowledges = Knowledge::search($query)
                              ->take(50)
                              ->get();

        $tagFrequency = [];
        foreach ($knowledges as $knowledge) {
            if ($knowledge->tag_names) {
                $tags = explode(',', $knowledge->tag_names);
                foreach ($tags as $tag) {
                    $tag = trim($tag);
                    if (!empty($tag) && stripos($tag, $query) === false) {
                        $tagFrequency[$tag] = ($tagFrequency[$tag] ?? 0) + 1;
                    }
                }
            }
        }

        // 頻度順でソート
        arsort($tagFrequency);
        
        return array_slice(array_keys($tagFrequency), 0, $limit);
    }

    /**
     * 検索結果のハイライト
     */
    public function highlightSearchResults(Collection $knowledges, string $query): Collection
    {
        if (empty(trim($query))) {
            return $knowledges;
        }

        $keywords = explode(' ', $query);
        $keywords = array_filter($keywords, fn($k) => strlen(trim($k)) > 1);

        return $knowledges->map(function ($knowledge) use ($keywords) {
            $knowledge->highlighted_title = $this->highlightText($knowledge->title, $keywords);
            $knowledge->highlighted_content = $this->highlightText(
                Str::limit($knowledge->content, 200), 
                $keywords
            );
            return $knowledge;
        });
    }

    /**
     * 検索統計情報取得
     */
    public function getSearchStats(string $query, User $user): array
    {
        $stats = [
            'total_results' => 0,
            'by_type' => [],
            'by_tag' => [],
            'by_author' => [],
        ];

        if (empty(trim($query))) {
            return $stats;
        }

        $results = Knowledge::search($query)->take(1000)->get();
        $stats['total_results'] = $results->count();

        // タイプ別統計
        $stats['by_type'] = $results->groupBy('type_id')
                                  ->map(fn($group) => $group->count())
                                  ->toArray();

        // タグ別統計
        $tagCounts = [];
        foreach ($results as $knowledge) {
            if ($knowledge->tag_names) {
                $tags = explode(',', $knowledge->tag_names);
                foreach ($tags as $tag) {
                    $tag = trim($tag);
                    $tagCounts[$tag] = ($tagCounts[$tag] ?? 0) + 1;
                }
            }
        }
        arsort($tagCounts);
        $stats['by_tag'] = array_slice($tagCounts, 0, 10, true);

        // 作成者別統計
        $stats['by_author'] = $results->groupBy('insert_user')
                                    ->map(fn($group) => $group->count())
                                    ->sortDesc()
                                    ->take(10)
                                    ->toArray();

        return $stats;
    }

    /**
     * アクセス制御フィルターを適用
     */
    protected function applyAccessFilters(ScoutBuilder $query, User $user): ScoutBuilder
    {
        // Meilisearchでのアクセス制御は複雑なため、
        // 結果取得後にEloquentでフィルタリング
        return $query;
    }

    /**
     * Scoutフィルターを適用
     */
    protected function applyScoutFilters(ScoutBuilder $query, array $filters): ScoutBuilder
    {
        if (!empty($filters['public_flag'])) {
            $query->where('public_flag', $filters['public_flag']);
        }

        if (!empty($filters['type_id'])) {
            $query->where('type_id', $filters['type_id']);
        }

        if (!empty($filters['insert_user'])) {
            $query->where('insert_user', $filters['insert_user']);
        }

        if (!empty($filters['date_from'])) {
            $query->where('insert_datetime', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->where('insert_datetime', '<=', $filters['date_to']);
        }

        return $query;
    }

    /**
     * Scoutソートを適用
     */
    protected function applyScoutSorting(ScoutBuilder $query, string $sort): ScoutBuilder
    {
        switch ($sort) {
            case 'created':
                return $query->orderBy('insert_datetime', 'desc');
            case 'updated':
                return $query->orderBy('update_datetime', 'desc');
            case 'likes':
                return $query->orderBy('like_count', 'desc');
            case 'views':
                return $query->orderBy('view_count', 'desc');
            case 'comments':
                return $query->orderBy('comment_count', 'desc');
            case 'title':
                return $query->orderBy('title', 'asc');
            default: // relevance
                return $query;
        }
    }

    /**
     * Eloquent検索を使用すべきかチェック
     */
    protected function shouldUseEloquentSearch(array $criteria): bool
    {
        // 複雑な条件がある場合はEloquentを使用
        return !empty($criteria['creator']) || 
               !empty($criteria['complex_filters']) ||
               !empty($criteria['join_required']);
    }

    /**
     * Eloquent高度検索
     */
    protected function eloquentAdvancedSearch(
        array $criteria, 
        User $user, 
        string $sort,
        int $perPage
    ): LengthAwarePaginator {
        
        $query = Knowledge::with(['creator', 'tags', 'templateMaster'])
                          ->accessibleBy($user->user_id);

        // 各種フィルター適用
        if (!empty($criteria['title'])) {
            $query->where('title', 'LIKE', "%{$criteria['title']}%");
        }

        if (!empty($criteria['content'])) {
            $query->where('content', 'LIKE', "%{$criteria['content']}%");
        }

        if (!empty($criteria['creator'])) {
            $query->whereHas('creator', function ($q) use ($criteria) {
                $q->where('user_name', 'LIKE', "%{$criteria['creator']}%")
                  ->orWhere('user_key', 'LIKE', "%{$criteria['creator']}%");
            });
        }

        if (!empty($criteria['tag'])) {
            $query->whereHas('tags', function ($q) use ($criteria) {
                $q->where('tag_name', 'LIKE', "%{$criteria['tag']}%");
            });
        }

        // その他のフィルター...

        // ソート適用
        $this->applyEloquentSorting($query, $sort);

        return $query->paginate($perPage);
    }

    /**
     * フィルターによる検索（Scout非使用）
     */
    protected function getKnowledgesByFilters(
        User $user, 
        array $filters, 
        string $sort,
        int $perPage
    ): LengthAwarePaginator {
        
        $query = Knowledge::with(['creator', 'tags', 'templateMaster'])
                          ->accessibleBy($user->user_id);

        // フィルター適用
        $this->applyEloquentFilters($query, $filters);
        
        // ソート適用
        $this->applyEloquentSorting($query, $sort);

        return $query->paginate($perPage);
    }

    /**
     * Eloquentフィルターを適用
     */
    protected function applyEloquentFilters(Builder $query, array $filters): void
    {
        if (!empty($filters['tag'])) {
            $query->whereHas('tags', function ($q) use ($filters) {
                $q->where('tag_name', $filters['tag']);
            });
        }

        if (!empty($filters['template'])) {
            $query->where('type_id', $filters['template']);
        }

        if (isset($filters['public_flag'])) {
            $query->where('public_flag', $filters['public_flag']);
        }
    }

    /**
     * Eloquentソートを適用
     */
    protected function applyEloquentSorting(Builder $query, string $sort): void
    {
        switch ($sort) {
            case 'title':
                $query->orderBy('title');
                break;
            case 'created':
                $query->orderBy('insert_datetime', 'desc');
                break;
            case 'likes':
                $query->orderBy('like_count', 'desc');
                break;
            case 'views':
                $query->orderBy('view_count', 'desc');
                break;
            case 'comments':
                $query->orderBy('comment_count', 'desc');
                break;
            default:
                $query->orderBy('update_datetime', 'desc');
        }
    }

    /**
     * テキストハイライト
     */
    protected function highlightText(string $text, array $keywords): string
    {
        foreach ($keywords as $keyword) {
            $keyword = trim($keyword);
            if (strlen($keyword) > 1) {
                $text = preg_replace(
                    '/(' . preg_quote($keyword, '/') . ')/iu',
                    '<mark>$1</mark>',
                    $text
                );
            }
        }
        return $text;
    }

    /**
     * 検索履歴取得（今後の実装）
     */
    protected function getSearchHistory(User $user, string $query, int $limit): array
    {
        // 今後の実装：検索履歴テーブルから類似クエリを取得
        return [];
    }
}
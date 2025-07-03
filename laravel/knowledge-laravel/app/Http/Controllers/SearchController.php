<?php

namespace App\Http\Controllers;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Tag;
use App\Services\SearchService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    public function __construct(
        protected SearchService $searchService
    ) {}
    /**
     * 検索結果表示
     */
    public function index(Request $request): Response
    {
        $query = $request->get('q', '');
        $user = Auth::user();
        $sort = $request->get('sort', 'relevance');
        $filters = $request->only(['tag', 'template', 'public_flag']);
        
        $knowledges = collect();
        $tags = collect();
        $stats = [];
        $relatedKeywords = [];
        
        if (strlen($query) >= 2) {
            // ナレッジ検索
            $knowledges = $this->searchService->searchKnowledges($query, $user, $filters, $sort, 20);
            
            // 検索結果をハイライト
            $knowledges->getCollection()->transform(function ($knowledge) use ($query) {
                return $this->searchService->highlightSearchResults(collect([$knowledge]), $query)->first();
            });

            // タグ検索
            $tags = $this->searchService->searchTags($query, 10);

            // 検索統計
            $stats = $this->searchService->getSearchStats($query, $user);

            // 関連キーワード
            $relatedKeywords = $this->searchService->getRelatedKeywords($query, $user);
        }

        return Inertia::render('Search/Index', [
            'query' => $query,
            'knowledges' => $knowledges,
            'tags' => $tags,
            'stats' => $stats,
            'relatedKeywords' => $relatedKeywords,
            'filters' => array_merge($filters, ['sort' => $sort]),
        ]);
    }

    /**
     * 高度な検索
     */
    public function advanced(Request $request): Response
    {
        $user = Auth::user();
        $criteria = $request->only([
            'query', 'title', 'content', 'creator', 'tag', 'template', 
            'public_flag', 'date_from', 'date_to'
        ]);
        $sort = $request->get('sort', 'relevance');

        $knowledges = $this->searchService->advancedSearch($criteria, $user, $sort, 20);

        // 検索結果をハイライト（クエリがある場合）
        if (!empty($criteria['query'])) {
            $knowledges->getCollection()->transform(function ($knowledge) use ($criteria) {
                return $this->searchService->highlightSearchResults(collect([$knowledge]), $criteria['query'])->first();
            });
        }

        // フィルター用データ
        $templates = \App\Models\Knowledge\TemplateMaster::active()->get();

        return Inertia::render('Search/Advanced', [
            'knowledges' => $knowledges,
            'templates' => $templates,
            'criteria' => $criteria,
            'sort' => $sort,
        ]);
    }

    /**
     * サジェスト API
     */
    public function suggest(Request $request)
    {
        $query = $request->get('q', '');
        $user = Auth::user();
        
        $suggestions = $this->searchService->getSuggestions($query, $user, 10);

        return response()->json([
            'suggestions' => $suggestions,
        ]);
    }
}
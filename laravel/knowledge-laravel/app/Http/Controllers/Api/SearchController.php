<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SearchController extends Controller
{
    public function __construct(
        protected SearchService $searchService
    ) {}

    /**
     * 検索API
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
            'sort' => 'nullable|string|in:relevance,created,updated,likes,views,comments,title',
            'per_page' => 'nullable|integer|min:1|max:100',
            'public_flag' => 'nullable|integer|in:0,1,2',
            'type_id' => 'nullable|integer',
        ]);

        $user = Auth::user();
        $query = $request->input('q');
        $sort = $request->input('sort', 'relevance');
        $perPage = $request->input('per_page', 20);
        $filters = $request->only(['tag', 'template', 'public_flag', 'type_id']);

        try {
            $results = $this->searchService->searchKnowledges($query, $user, $filters, $sort, $perPage);
            
            // 検索結果をハイライト
            $results->getCollection()->transform(function ($knowledge) use ($query) {
                return $this->searchService->highlightSearchResults(collect([$knowledge]), $query)->first();
            });

            return response()->json([
                'success' => true,
                'data' => $results,
                'query' => $query,
                'sort' => $sort,
                'filters' => $filters,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Search failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * サジェストAPI
     */
    public function suggest(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:1|max:50',
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $user = Auth::user();
        $query = $request->input('q');
        $limit = $request->input('limit', 10);

        try {
            $suggestions = $this->searchService->getSuggestions($query, $user, $limit);

            return response()->json([
                'success' => true,
                'suggestions' => $suggestions,
                'query' => $query,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Suggestion failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 高度な検索API
     */
    public function advanced(Request $request): JsonResponse
    {
        $request->validate([
            'query' => 'nullable|string|max:100',
            'title' => 'nullable|string|max:100',
            'content' => 'nullable|string|max:200',
            'creator' => 'nullable|string|max:50',
            'tag' => 'nullable|string|max:50',
            'template' => 'nullable|integer',
            'public_flag' => 'nullable|integer|in:0,1,2',
            'date_from' => 'nullable|date',
            'date_to' => 'nullable|date|after_or_equal:date_from',
            'sort' => 'nullable|string|in:relevance,created,updated,likes,views,comments,title',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $user = Auth::user();
        $criteria = $request->only([
            'query', 'title', 'content', 'creator', 'tag', 'template', 
            'public_flag', 'date_from', 'date_to'
        ]);
        $sort = $request->input('sort', 'relevance');
        $perPage = $request->input('per_page', 20);

        try {
            $results = $this->searchService->advancedSearch($criteria, $user, $sort, $perPage);

            // 検索結果をハイライト（クエリがある場合）
            if (!empty($criteria['query'])) {
                $results->getCollection()->transform(function ($knowledge) use ($criteria) {
                    return $this->searchService->highlightSearchResults(collect([$knowledge]), $criteria['query'])->first();
                });
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'criteria' => $criteria,
                'sort' => $sort,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Advanced search failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 検索統計API
     */
    public function stats(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
        ]);

        $user = Auth::user();
        $query = $request->input('q');

        try {
            $stats = $this->searchService->getSearchStats($query, $user);

            return response()->json([
                'success' => true,
                'stats' => $stats,
                'query' => $query,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Stats retrieval failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * 関連キーワードAPI
     */
    public function relatedKeywords(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100',
            'limit' => 'nullable|integer|min:1|max:10',
        ]);

        $user = Auth::user();
        $query = $request->input('q');
        $limit = $request->input('limit', 5);

        try {
            $keywords = $this->searchService->getRelatedKeywords($query, $user, $limit);

            return response()->json([
                'success' => true,
                'keywords' => $keywords,
                'query' => $query,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Related keywords retrieval failed: ' . $e->getMessage(),
            ], 500);
        }
    }
}
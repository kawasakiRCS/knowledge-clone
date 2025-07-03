<?php

namespace App\Http\Controllers;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    /**
     * 検索結果表示
     */
    public function index(Request $request): Response
    {
        $query = $request->get('q', '');
        $user = Auth::user();
        
        $knowledges = collect();
        $tags = collect();
        
        if (strlen($query) >= 2) {
            // ナレッジ検索
            $knowledgeQuery = Knowledge::search($query)
                                    ->where('public_flag', Knowledge::PUBLIC_FLAG_PUBLIC)
                                    ->orWhere('insert_user', $user->user_id);

            $knowledges = $knowledgeQuery->paginate(10, 'knowledges_page')
                                       ->withQueryString();

            // タグ検索
            $tags = Tag::byName($query)
                      ->withCount('knowledges')
                      ->having('knowledges_count', '>', 0)
                      ->limit(10)
                      ->get();
        }

        return Inertia::render('Search/Index', [
            'query' => $query,
            'knowledges' => $knowledges,
            'tags' => $tags,
        ]);
    }

    /**
     * 高度な検索
     */
    public function advanced(Request $request): Response
    {
        $user = Auth::user();
        $filters = $request->only([
            'title', 'content', 'creator', 'tag', 'template', 
            'public_flag', 'date_from', 'date_to'
        ]);

        $query = Knowledge::with(['creator', 'tags', 'templateMaster'])
                          ->accessibleBy($user->user_id);

        // フィルター適用
        if ($request->filled('title')) {
            $query->where('title', 'LIKE', "%{$request->title}%");
        }

        if ($request->filled('content')) {
            $query->where('content', 'LIKE', "%{$request->content}%");
        }

        if ($request->filled('creator')) {
            $query->whereHas('creator', function ($q) use ($request) {
                $q->where('user_name', 'LIKE', "%{$request->creator}%")
                  ->orWhere('user_key', 'LIKE', "%{$request->creator}%");
            });
        }

        if ($request->filled('tag')) {
            $query->whereHas('tags', function ($q) use ($request) {
                $q->where('tag_name', 'LIKE', "%{$request->tag}%");
            });
        }

        if ($request->filled('template')) {
            $query->where('type_id', $request->template);
        }

        if ($request->filled('public_flag')) {
            $query->where('public_flag', $request->public_flag);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('insert_datetime', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('insert_datetime', '<=', $request->date_to);
        }

        // ソート
        $sortBy = $request->get('sort', 'relevance');
        switch ($sortBy) {
            case 'title':
                $query->orderBy('title');
                break;
            case 'created':
                $query->orderBy('insert_datetime', 'desc');
                break;
            case 'updated':
                $query->orderBy('update_datetime', 'desc');
                break;
            case 'likes':
                $query->orderBy('like_count', 'desc');
                break;
            case 'views':
                $query->orderBy('view_count', 'desc');
                break;
            default:
                $query->orderBy('update_datetime', 'desc');
        }

        $knowledges = $query->paginate(20)->withQueryString();

        // フィルター用データ
        $templates = \App\Models\Knowledge\TemplateMaster::active()->get();

        return Inertia::render('Search/Advanced', [
            'knowledges' => $knowledges,
            'templates' => $templates,
            'filters' => $filters,
            'sort' => $sortBy,
        ]);
    }

    /**
     * サジェスト API
     */
    public function suggest(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'suggestions' => [],
            ]);
        }

        $user = Auth::user();

        // タイトルからサジェスト
        $titleSuggestions = Knowledge::accessibleBy($user->user_id)
                                  ->where('title', 'LIKE', "%{$query}%")
                                  ->limit(5)
                                  ->pluck('title')
                                  ->toArray();

        // タグからサジェスト
        $tagSuggestions = Tag::byName($query)
                            ->limit(5)
                            ->pluck('tag_name')
                            ->toArray();

        $suggestions = array_unique(array_merge($titleSuggestions, $tagSuggestions));

        return response()->json([
            'suggestions' => array_slice($suggestions, 0, 10),
        ]);
    }
}
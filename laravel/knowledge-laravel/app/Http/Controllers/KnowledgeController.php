<?php

namespace App\Http\Controllers;

use App\Models\Knowledge\Knowledge;
use App\Models\Knowledge\Tag;
use App\Models\Knowledge\TemplateMaster;
use App\Http\Requests\KnowledgeStoreRequest;
use App\Http\Requests\KnowledgeUpdateRequest;
use App\Services\KnowledgeService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KnowledgeController extends Controller
{
    public function __construct(
        protected KnowledgeService $knowledgeService
    ) {}
    /**
     * ナレッジ一覧表示
     */
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $filters = $request->only(['search', 'tag', 'template', 'public_flag', 'creator', 'date_from', 'date_to']);
        $sort = $request->get('sort', 'updated');
        
        $knowledges = $this->knowledgeService->getAccessibleKnowledges($user, $filters, $sort, 20);
        
        // フィルター用データ
        $tags = Tag::popular(50)->get();
        $templates = TemplateMaster::active()->get();

        return Inertia::render('Knowledge/Index', [
            'knowledges' => $knowledges,
            'tags' => $tags,
            'templates' => $templates,
            'filters' => array_merge($filters, ['sort' => $sort]),
        ]);
    }

    /**
     * ナレッジ詳細表示
     */
    public function show(Knowledge $knowledge): Response
    {
        $user = Auth::user();

        // アクセス権限チェック
        if (!$knowledge->isAccessibleBy($user->user_id)) {
            abort(403, 'このナレッジへのアクセス権限がありません。');
        }

        // 閲覧履歴を記録
        $this->knowledgeService->recordView($knowledge, $user);

        $knowledge->load([
            'creator',
            'updater',
            'tags',
            'templateMaster',
            'comments.creator',
            'comments.likes',
            'files',
            'likes.user'
        ]);

        // ユーザーがいいねしているかチェック
        $userLiked = $knowledge->likes()->where('insert_user', $user->user_id)->exists();

        // 編集権限チェック
        $canEdit = $knowledge->isEditableBy($user->user_id);

        // 関連ナレッジ
        $relatedKnowledges = $this->knowledgeService->getRelatedKnowledges($knowledge, $user);

        return Inertia::render('Knowledge/Show', [
            'knowledge' => $knowledge,
            'userLiked' => $userLiked,
            'canEdit' => $canEdit,
            'relatedKnowledges' => $relatedKnowledges,
        ]);
    }

    /**
     * ナレッジ作成フォーム表示
     */
    public function create(): Response
    {
        $templates = TemplateMaster::active()->get();
        $tags = Tag::popular(100)->get();

        return Inertia::render('Knowledge/Create', [
            'templates' => $templates,
            'tags' => $tags,
        ]);
    }

    /**
     * ナレッジ保存
     */
    public function store(KnowledgeStoreRequest $request): RedirectResponse
    {
        $user = Auth::user();
        $knowledge = $this->knowledgeService->createKnowledge($request->validated(), $user);

        return redirect()->route('knowledge.show', $knowledge)
                        ->with('success', 'ナレッジを作成しました。');
    }

    /**
     * ナレッジ編集フォーム表示
     */
    public function edit(Knowledge $knowledge): Response
    {
        $user = Auth::user();

        // 編集権限チェック
        if (!$knowledge->isEditableBy($user->user_id)) {
            abort(403, 'このナレッジの編集権限がありません。');
        }

        $knowledge->load(['tags', 'allowedUsers', 'allowedGroups', 'editUsers', 'editGroups']);
        
        $templates = TemplateMaster::active()->get();
        $allTags = Tag::popular(100)->get();

        return Inertia::render('Knowledge/Edit', [
            'knowledge' => $knowledge,
            'templates' => $templates,
            'tags' => $allTags,
        ]);
    }

    /**
     * ナレッジ更新
     */
    public function update(KnowledgeUpdateRequest $request, Knowledge $knowledge): RedirectResponse
    {
        $user = Auth::user();
        $updatedKnowledge = $this->knowledgeService->updateKnowledge($knowledge, $request->validated(), $user);

        return redirect()->route('knowledge.show', $updatedKnowledge)
                        ->with('success', 'ナレッジを更新しました。');
    }

    /**
     * ナレッジ削除
     */
    public function destroy(Knowledge $knowledge): RedirectResponse
    {
        $user = Auth::user();
        $this->knowledgeService->deleteKnowledge($knowledge, $user);

        return redirect()->route('knowledge.index')
                        ->with('success', 'ナレッジを削除しました。');
    }

    /**
     * いいね機能
     */
    public function like(Knowledge $knowledge): RedirectResponse
    {
        $user = Auth::user();
        $result = $this->knowledgeService->toggleLike($knowledge, $user);

        return back()->with('success', $result['message']);
    }
}
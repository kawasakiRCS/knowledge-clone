<template>
    <Head :title="knowledge.title" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex justify-between items-center">
                <div class="flex items-center space-x-4">
                    <Link
                        :href="route('knowledge.index')"
                        class="text-gray-600 hover:text-gray-900"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                        {{ props.knowledge.title }}
                    </h2>
                </div>
                
                <div class="flex items-center space-x-2">
                    <!-- 編集ボタン -->
                    <Link
                        v-if="props.canEdit"
                        :href="route('knowledge.edit', props.knowledge.knowledge_id)"
                        class="inline-flex items-center px-3 py-2 bg-gray-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                    >
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        編集
                    </Link>
                    
                    <!-- いいねボタン -->
                    <button
                        @click="toggleLike"
                        :disabled="likeLoading"
                        :class="[
                            'inline-flex items-center px-3 py-2 border border-transparent rounded-md font-semibold text-xs uppercase tracking-widest transition ease-in-out duration-150',
                            knowledge.user_liked
                                ? 'bg-red-600 text-white hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:ring-red-500'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:bg-gray-300 active:bg-gray-400 focus:ring-gray-500',
                            likeLoading ? 'opacity-50 cursor-not-allowed' : ''
                        ]"
                    >
                        <svg 
                            :class="[
                                'w-4 h-4 mr-1',
                                knowledge.user_liked ? 'fill-current' : 'fill-none'
                            ]"
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        {{ knowledge.like_count || 0 }}
                    </button>
                </div>
            </div>
        </template>

        <div class="py-6">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                <!-- ナレッジメタ情報 -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <!-- 基本情報 -->
                            <div class="md:col-span-2">
                                <div class="flex flex-wrap items-center gap-4 mb-4">
                                    <!-- 公開状態 -->
                                    <span 
                                        :class="getPublicFlagClass(knowledge.public_flag)"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        {{ getPublicFlagText(knowledge.public_flag) }}
                                    </span>
                                    
                                    <!-- テンプレート -->
                                    <span 
                                        v-if="knowledge.templateMaster"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                                    >
                                        <span v-if="knowledge.templateMaster.type_icon" class="mr-1">
                                            {{ knowledge.templateMaster.type_icon }}
                                        </span>
                                        {{ knowledge.templateMaster.type_name }}
                                    </span>
                                    
                                    <!-- 匿名投稿 -->
                                    <span 
                                        v-if="knowledge.anonymous"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                                    >
                                        匿名投稿
                                    </span>
                                </div>
                                
                                <!-- 作成者情報 -->
                                <div class="text-sm text-gray-600 space-y-1">
                                    <div>
                                        <span class="font-medium">作成者:</span>
                                        {{ knowledge.anonymous ? '匿名' : (knowledge.creator?.user_name || '不明') }}
                                    </div>
                                    <div>
                                        <span class="font-medium">作成日:</span>
                                        {{ formatFullDate(knowledge.insert_datetime) }}
                                    </div>
                                    <div v-if="knowledge.update_datetime !== knowledge.insert_datetime">
                                        <span class="font-medium">更新日:</span>
                                        {{ formatFullDate(knowledge.update_datetime) }}
                                        <span v-if="knowledge.updater && knowledge.updater.user_id !== knowledge.creator?.user_id">
                                            （{{ knowledge.updater.user_name }}）
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- 統計情報 -->
                            <div class="space-y-4">
                                <div class="grid grid-cols-3 gap-4 text-center">
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-2xl font-bold text-gray-900">{{ knowledge.like_count || 0 }}</div>
                                        <div class="text-sm text-gray-500">いいね</div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-2xl font-bold text-gray-900">{{ knowledge.comment_count || 0 }}</div>
                                        <div class="text-sm text-gray-500">コメント</div>
                                    </div>
                                    <div class="bg-gray-50 rounded-lg p-3">
                                        <div class="text-2xl font-bold text-gray-900">{{ knowledge.view_count || 0 }}</div>
                                        <div class="text-sm text-gray-500">閲覧</div>
                                    </div>
                                </div>
                                
                                <!-- ポイント（もしあれば） -->
                                <div v-if="knowledge.point > 0" class="text-center bg-yellow-50 rounded-lg p-3">
                                    <div class="text-xl font-bold text-yellow-800">{{ knowledge.point }}</div>
                                    <div class="text-sm text-yellow-600">ポイント</div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- タグ -->
                        <div v-if="knowledge.tags && knowledge.tags.length > 0" class="mt-6">
                            <h4 class="text-sm font-medium text-gray-900 mb-2">タグ</h4>
                            <div class="flex flex-wrap gap-2">
                                <Link
                                    v-for="tag in knowledge.tags"
                                    :key="tag.tag_id"
                                    :href="route('knowledge.index', { tag: tag.tag_name })"
                                    class="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                                >
                                    #{{ tag.tag_name }}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ナレッジ本文 -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <div 
                            class="prose max-w-none text-gray-900"
                            v-html="renderedContent"
                        ></div>
                    </div>
                </div>
                
                <!-- 添付ファイル -->
                <div v-if="knowledge.files && knowledge.files.length > 0" class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">添付ファイル</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div
                                v-for="file in knowledge.files"
                                :key="file.file_no"
                                class="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                            >
                                <div class="flex items-center space-x-3">
                                    <div class="flex-shrink-0">
                                        <svg v-if="file.is_image" class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                    </div>
                                    <div class="flex-1 min-w-0">
                                        <p class="text-sm font-medium text-gray-900 truncate">
                                            {{ file.file_name }}
                                        </p>
                                        <p class="text-sm text-gray-500">
                                            {{ file.formatted_file_size }}
                                        </p>
                                    </div>
                                    <div class="flex-shrink-0">
                                        <a
                                            :href="file.download_url"
                                            class="text-blue-600 hover:text-blue-800"
                                            target="_blank"
                                        >
                                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 関連ナレッジ -->
                <div v-if="knowledge.related_knowledges && knowledge.related_knowledges.length > 0" class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <h3 class="text-lg font-medium text-gray-900 mb-4">関連ナレッジ</h3>
                        <div class="space-y-3">
                            <Link
                                v-for="related in knowledge.related_knowledges.slice(0, 5)"
                                :key="related.knowledge_id"
                                :href="route('knowledge.show', related.knowledge_id)"
                                class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <h4 class="text-sm font-medium text-gray-900 hover:text-blue-600">
                                    {{ related.title }}
                                </h4>
                                <div class="flex items-center justify-between mt-1">
                                    <div class="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>👍 {{ related.like_count || 0 }}</span>
                                        <span>💬 {{ related.comment_count || 0 }}</span>
                                        <span>👁 {{ related.view_count || 0 }}</span>
                                    </div>
                                    <span class="text-xs text-gray-400">
                                        {{ formatDate(related.update_datetime || related.insert_datetime) }}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                <!-- コメントセクション -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-lg font-medium text-gray-900">
                                コメント ({{ knowledge.comments?.length || 0 }})
                            </h3>
                            <button
                                @click="showCommentForm = !showCommentForm"
                                class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                            >
                                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                コメント追加
                            </button>
                        </div>

                        <!-- コメント投稿フォーム -->
                        <div v-if="showCommentForm" class="mb-6 p-4 bg-gray-50 rounded-lg">
                            <form @submit.prevent="submitComment">
                                <div class="mb-4">
                                    <textarea
                                        v-model="commentForm.comment"
                                        placeholder="コメントを入力してください..."
                                        rows="4"
                                        class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        required
                                    ></textarea>
                                </div>
                                
                                <div class="flex items-center justify-between">
                                    <label class="flex items-center">
                                        <input
                                            type="checkbox"
                                            v-model="commentForm.anonymous"
                                            class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                        />
                                        <span class="ml-2 text-sm text-gray-600">匿名でコメント</span>
                                    </label>
                                    
                                    <div class="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            @click="showCommentForm = false"
                                            class="px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            キャンセル
                                        </button>
                                        <button
                                            type="submit"
                                            :disabled="commentLoading || !commentForm.comment.trim()"
                                            class="px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {{ commentLoading ? '投稿中...' : '投稿' }}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <!-- コメント一覧 -->
                        <div v-if="knowledge.comments && knowledge.comments.length > 0" class="space-y-4">
                            <CommentCard
                                v-for="comment in knowledge.comments"
                                :key="comment.comment_no"
                                :comment="comment"
                                @edit="editComment"
                                @delete="deleteComment"
                                @toggle-status="toggleCommentStatus"
                                @toggle-like="toggleCommentLike"
                                @reply="replyToComment"
                            />
                        </div>
                        
                        <!-- コメントが空の場合 -->
                        <div v-else class="text-center py-8">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">まだコメントがありません</h3>
                            <p class="mt-1 text-sm text-gray-500">最初のコメントを投稿してみましょう！</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<style>
/* Highlight.js のスタイル */
@import 'highlight.js/styles/github.css';

/* プロースタイル調整 */
.prose {
    @apply text-gray-900;
}

.prose h1 {
    @apply text-2xl font-bold mb-4 mt-6;
}

.prose h2 {
    @apply text-xl font-bold mb-3 mt-5;
}

.prose h3 {
    @apply text-lg font-bold mb-2 mt-4;
}

.prose p {
    @apply mb-4;
}

.prose ul, .prose ol {
    @apply mb-4 pl-6;
}

.prose li {
    @apply mb-1;
}

.prose blockquote {
    @apply border-l-4 border-gray-300 pl-4 py-2 bg-gray-50 mb-4;
}

.prose code {
    @apply bg-gray-100 px-1 py-0.5 rounded text-sm font-mono;
}

.prose pre {
    @apply bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4;
}

.prose pre code {
    @apply bg-transparent p-0;
}

.prose table {
    @apply w-full border-collapse border border-gray-300 mb-4;
}

.prose th, .prose td {
    @apply border border-gray-300 px-4 py-2;
}

.prose th {
    @apply bg-gray-50 font-bold;
}
</style>

<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import { marked } from 'marked';
import hljs from 'highlight.js';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import CommentCard from '@/Components/CommentCard.vue';
import type { Knowledge, Comment, CommentFormData } from '@/types';
import { PUBLIC_FLAGS } from '@/types';

interface Props {
    knowledge: Knowledge;
    userLiked: boolean;
    canEdit: boolean;
    relatedKnowledges: Knowledge[];
}

const props = defineProps<Props>();

// デバッグ: propsの内容を確認
console.log('Knowledge Show Props:', props);
console.log('canEdit value:', props.canEdit);

// マークダウンレンダリング設定
// カスタムレンダラーを作成
const renderer = new marked.Renderer();

// リストアイテムのレンダリングをカスタマイズ
renderer.listitem = function(text, task, checked) {
    // タスクリストの場合はそのまま返す
    if (task) {
        return '<li class="task-list-item">' + text + '</li>\n';
    }
    
    // 既に「・」で始まる場合はそのまま返す（ネストされたリストの重複を防ぐ）
    if (text.trim().startsWith('・')) {
        return '<li>' + text + '</li>\n';
    }
    
    // 日本語の箇条書きに「・」を追加
    return '<li>・' + text + '</li>\n';
};

// 番号付きリストはデフォルトの動作を維持
renderer.list = function(body, ordered, start) {
    const type = ordered ? 'ol' : 'ul';
    const startAttr = (ordered && start !== 1) ? (' start="' + start + '"') : '';
    return '<' + type + startAttr + '>\n' + body + '</' + type + '>\n';
};

marked.setOptions({
    renderer: renderer,
    highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
                console.error('Highlight.js error:', err);
            }
        }
        return hljs.highlightAuto(code).value;
    },
    breaks: true,
    gfm: true
});

// マークダウンレンダリング
const renderedContent = computed(() => {
    if (!props.knowledge.content) return '';
    try {
        return marked(props.knowledge.content);
    } catch (error) {
        console.error('Markdown rendering error:', error);
        return props.knowledge.content; // フォールバック
    }
});

// リアクティブな状態
const showCommentForm = ref(false);
const likeLoading = ref(false);
const commentLoading = ref(false);

const commentForm = reactive<CommentFormData>({
    knowledge_id: props.knowledge.knowledge_id,
    comment: '',
    anonymous: false,
    temp_file_ids: [],
});

// 公開フラグのスタイル
const getPublicFlagClass = (publicFlag: number): string => {
    switch (publicFlag) {
        case PUBLIC_FLAGS.PUBLIC:
            return 'bg-green-100 text-green-800';
        case PUBLIC_FLAGS.PROTECT:
            return 'bg-yellow-100 text-yellow-800';
        case PUBLIC_FLAGS.PRIVATE:
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const getPublicFlagText = (publicFlag: number): string => {
    switch (publicFlag) {
        case PUBLIC_FLAGS.PUBLIC:
            return '公開';
        case PUBLIC_FLAGS.PROTECT:
            return '保護';
        case PUBLIC_FLAGS.PRIVATE:
            return '非公開';
        default:
            return '不明';
    }
};

// 日付フォーマット
const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
        return '今すぐ';
    } else if (diffInHours < 24) {
        return `${diffInHours}時間前`;
    } else if (diffInHours < 24 * 7) {
        const days = Math.floor(diffInHours / 24);
        return `${days}日前`;
    } else {
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
};

const formatFullDate = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// いいねトグル
const toggleLike = async () => {
    if (likeLoading.value) return;
    
    likeLoading.value = true;
    
    try {
        const response = await axios.post(`/api/knowledge/${props.knowledge.knowledge_id}/toggle-like`);
        
        // データを更新
        props.knowledge.user_liked = response.data.data.liked;
        props.knowledge.like_count = response.data.data.like_count;
        
    } catch (error) {
        console.error('いいねの更新に失敗しました:', error);
        // エラーハンドリング
    } finally {
        likeLoading.value = false;
    }
};

// コメント投稿
const submitComment = async () => {
    if (commentLoading.value) return;
    
    commentLoading.value = true;
    
    try {
        await router.post(route('comments.store'), commentForm, {
            preserveScroll: true,
            onSuccess: () => {
                commentForm.comment = '';
                commentForm.anonymous = false;
                showCommentForm.value = false;
            },
        });
    } finally {
        commentLoading.value = false;
    }
};

// コメント関連のハンドラー
const editComment = (comment: Comment) => {
    // 編集フォームの表示（実装は省略）
    console.log('コメント編集:', comment);
};

const deleteComment = (comment: Comment) => {
    if (confirm('このコメントを削除してもよろしいですか？')) {
        router.delete(route('comments.destroy', comment.comment_no), {
            preserveScroll: true,
        });
    }
};

const toggleCommentStatus = async (comment: Comment) => {
    try {
        await axios.post(`/api/comments/${comment.comment_no}/toggle-status`);
        router.reload({ only: ['comments'] });
    } catch (error) {
        console.error('コメントステータスの更新に失敗しました:', error);
    }
};

const toggleCommentLike = async (comment: Comment) => {
    try {
        const response = await axios.post(`/api/comments/${comment.comment_no}/like`);
        comment.user_liked = response.data.data.liked;
        comment.like_count = response.data.data.like_count;
    } catch (error) {
        console.error('コメントいいねの更新に失敗しました:', error);
    }
};

const replyToComment = (comment: Comment) => {
    // 返信機能（実装は省略）
    console.log('コメントに返信:', comment);
    showCommentForm.value = true;
    commentForm.comment = `@${comment.creator?.user_name || '匿名'} `;
};
</script>

<style>
.prose {
    max-width: none;
}

.prose h1,
.prose h2,
.prose h3,
.prose h4,
.prose h5,
.prose h6 {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 600;
}

.prose p {
    margin-bottom: 1em;
    line-height: 1.6;
}

.prose ul,
.prose ol {
    margin-bottom: 1em;
    padding-left: 1.5em;
}

.prose li {
    margin-bottom: 0.25em;
}

.prose blockquote {
    border-left: 4px solid #e5e7eb;
    padding-left: 1em;
    margin: 1em 0;
    font-style: italic;
    color: #6b7280;
}

.prose code {
    background-color: #f3f4f6;
    padding: 0.125em 0.25em;
    border-radius: 0.25rem;
    font-size: 0.875em;
}

.prose pre {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 1em;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin: 1em 0;
}

.prose pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
}
</style>
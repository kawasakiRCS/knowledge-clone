<template>
    <div class="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
        <!-- ヘッダー -->
        <div class="flex items-start justify-between mb-3">
            <div class="flex items-center space-x-3">
                <!-- ユーザー情報 -->
                <div class="flex-shrink-0">
                    <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span class="text-sm font-medium text-gray-600">
                            {{ getUserInitial(comment) }}
                        </span>
                    </div>
                </div>
                
                <div>
                    <div class="flex items-center space-x-2">
                        <span class="text-sm font-medium text-gray-900">
                            {{ getUserName(comment) }}
                        </span>
                        <span class="text-xs text-gray-500">
                            {{ formatDate(comment.insert_datetime) }}
                        </span>
                    </div>
                    <div v-if="comment.update_datetime !== comment.insert_datetime" class="text-xs text-gray-400">
                        編集済み: {{ formatDate(comment.update_datetime) }}
                    </div>
                </div>
            </div>
            
            <!-- アクションボタン -->
            <div class="flex items-center space-x-2">
                <!-- ステータス表示 -->
                <span
                    v-if="comment.comment_status === COMMENT_STATUS.HIDDEN"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                >
                    非表示
                </span>
                
                <!-- 編集・削除メニュー -->
                <div v-if="comment.can_edit" class="relative">
                    <button
                        @click="showMenu = !showMenu"
                        class="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                    
                    <!-- ドロップダウンメニュー -->
                    <div
                        v-if="showMenu"
                        v-click-outside="() => showMenu = false"
                        class="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10"
                    >
                        <button
                            @click="$emit('edit', comment)"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            編集
                        </button>
                        <button
                            v-if="comment.comment_status === COMMENT_STATUS.ACTIVE"
                            @click="$emit('toggleStatus', comment)"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            非表示にする
                        </button>
                        <button
                            v-else
                            @click="$emit('toggleStatus', comment)"
                            class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                            表示する
                        </button>
                        <button
                            v-if="comment.can_delete"
                            @click="$emit('delete', comment)"
                            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                            削除
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- コメント内容 -->
        <div class="mb-3">
            <div 
                class="text-sm text-gray-700 whitespace-pre-wrap"
                v-html="formatComment(comment.comment)"
            ></div>
        </div>

        <!-- 添付ファイル -->
        <div v-if="comment.files && comment.files.length > 0" class="mb-3">
            <div class="border-t border-gray-100 pt-3">
                <p class="text-xs font-medium text-gray-500 mb-2">添付ファイル</p>
                <div class="space-y-2">
                    <div
                        v-for="file in comment.files"
                        :key="file.file_no"
                        class="flex items-center space-x-2 text-sm"
                    >
                        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <a
                            :href="file.download_url"
                            class="text-blue-600 hover:text-blue-800 hover:underline"
                            target="_blank"
                        >
                            {{ file.file_name }}
                        </a>
                        <span class="text-gray-400">
                            ({{ file.formatted_file_size }})
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <!-- フッター（いいねボタンなど） -->
        <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex items-center space-x-4">
                <!-- いいねボタン -->
                <button
                    @click="$emit('toggleLike', comment)"
                    :class="[
                        'flex items-center space-x-1 text-sm rounded-md px-2 py-1 transition-colors',
                        comment.user_liked
                            ? 'text-red-600 bg-red-50 hover:bg-red-100'
                            : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                    ]"
                >
                    <svg 
                        :class="[
                            'w-4 h-4',
                            comment.user_liked ? 'fill-current' : 'fill-none'
                        ]"
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ comment.like_count || 0 }}</span>
                </button>
                
                <!-- 返信ボタン -->
                <button
                    @click="$emit('reply', comment)"
                    class="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 rounded-md px-2 py-1 hover:bg-blue-50 transition-colors"
                >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    <span>返信</span>
                </button>
            </div>
            
            <div class="text-xs text-gray-400">
                #{{ comment.comment_no }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Comment } from '@/types';
import { COMMENT_STATUS } from '@/types';

interface Props {
    comment: Comment;
}

interface Emits {
    (e: 'edit', comment: Comment): void;
    (e: 'delete', comment: Comment): void;
    (e: 'toggleStatus', comment: Comment): void;
    (e: 'toggleLike', comment: Comment): void;
    (e: 'reply', comment: Comment): void;
}

defineProps<Props>();
defineEmits<Emits>();

const showMenu = ref(false);

const getUserName = (comment: Comment): string => {
    if (comment.anonymous) {
        return '匿名ユーザー';
    }
    return comment.creator?.user_name || '不明なユーザー';
};

const getUserInitial = (comment: Comment): string => {
    if (comment.anonymous) {
        return '匿';
    }
    const name = comment.creator?.user_name || '?';
    return name.charAt(0).toUpperCase();
};

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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

const formatComment = (content: string): string => {
    if (!content) return '';
    
    // 簡単なHTMLエスケープ（実際の実装では適切なサニタイズライブラリを使用）
    return content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\n/g, '<br>');
};

// クリック外しのディレクティブ（簡単な実装）
const vClickOutside = {
    beforeMount(el: HTMLElement, binding: any) {
        el.clickOutsideEvent = (event: Event) => {
            if (!(el === event.target || el.contains(event.target as Node))) {
                binding.value();
            }
        };
        document.addEventListener('click', el.clickOutsideEvent);
    },
    unmounted(el: HTMLElement) {
        document.removeEventListener('click', el.clickOutsideEvent);
    },
};
</script>
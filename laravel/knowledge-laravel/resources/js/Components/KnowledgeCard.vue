<template>
    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
        <!-- ヘッダー -->
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <Link 
                    :href="route('knowledge.show', knowledge.knowledge_id)"
                    class="block"
                >
                    <h3 
                        class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        v-html="knowledge.highlighted_title || knowledge.title"
                    ></h3>
                </Link>
                
                <!-- テンプレート表示 -->
                <div v-if="knowledge.templateMaster" class="mt-2 flex items-center">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <span v-if="knowledge.templateMaster.type_icon" class="mr-1">{{ knowledge.templateMaster.type_icon }}</span>
                        {{ knowledge.templateMaster.type_name }}
                    </span>
                </div>
            </div>
            
            <!-- 公開状態 -->
            <div class="ml-4">
                <span 
                    :class="getPublicFlagClass(knowledge.public_flag)"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                >
                    {{ getPublicFlagText(knowledge.public_flag) }}
                </span>
            </div>
        </div>

        <!-- コンテンツプレビュー -->
        <div class="mb-4">
            <p 
                class="text-gray-700 text-sm line-clamp-3"
                v-html="knowledge.highlighted_content || getContentPreview(knowledge.content)"
            ></p>
        </div>

        <!-- タグ -->
        <div v-if="knowledge.tags && knowledge.tags.length > 0" class="mb-4">
            <div class="flex flex-wrap gap-2">
                <span
                    v-for="tag in knowledge.tags.slice(0, 5)"
                    :key="tag.tag_id"
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                >
                    #{{ tag.tag_name }}
                </span>
                <span 
                    v-if="knowledge.tags.length > 5"
                    class="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500"
                >
                    +{{ knowledge.tags.length - 5 }}
                </span>
            </div>
        </div>

        <!-- 統計情報 -->
        <div class="flex items-center justify-between text-sm text-gray-500">
            <div class="flex items-center space-x-4">
                <!-- いいね数 -->
                <div class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <span>{{ knowledge.like_count || 0 }}</span>
                </div>
                
                <!-- コメント数 -->
                <div class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{{ knowledge.comment_count || 0 }}</span>
                </div>
                
                <!-- 閲覧数 -->
                <div class="flex items-center">
                    <svg class="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{{ knowledge.view_count || 0 }}</span>
                </div>
            </div>
            
            <!-- 作成者・更新日時 -->
            <div class="flex items-center space-x-2">
                <span v-if="!knowledge.anonymous && knowledge.creator">
                    {{ knowledge.creator.user_name }}
                </span>
                <span v-else-if="knowledge.anonymous" class="text-gray-400">
                    匿名
                </span>
                <span>•</span>
                <span>{{ formatDate(knowledge.update_datetime || knowledge.insert_datetime) }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import type { Knowledge } from '@/types';
import { PUBLIC_FLAGS } from '@/types';

interface Props {
    knowledge: Knowledge;
}

defineProps<Props>();

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

const getContentPreview = (content: string): string => {
    if (!content) return '';
    
    // HTMLタグを除去
    const textContent = content.replace(/<[^>]*>/g, '');
    
    // 200文字でカット
    return textContent.length > 200 
        ? textContent.substring(0, 200) + '...'
        : textContent;
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
            day: 'numeric'
        });
    }
};
</script>

<style>
.line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
</style>
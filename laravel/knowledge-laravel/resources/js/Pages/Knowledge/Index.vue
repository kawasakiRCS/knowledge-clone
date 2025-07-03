<template>
    <Head title="ナレッジ一覧" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex justify-between items-center">
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    ナレッジ一覧
                </h2>
                <Link
                    :href="route('knowledge.create')"
                    class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    新規作成
                </Link>
            </div>
        </template>

        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <!-- 検索・フィルター -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                    <div class="p-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <!-- 検索ボックス -->
                            <div class="lg:col-span-2">
                                <SearchBox
                                    v-model="filters.search"
                                    @search="onSearch"
                                    placeholder="ナレッジを検索..."
                                />
                            </div>
                            
                            <!-- テンプレートフィルター -->
                            <div>
                                <select
                                    v-model="filters.template"
                                    @change="applyFilters"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">すべてのテンプレート</option>
                                    <option
                                        v-for="template in templates"
                                        :key="template.type_id"
                                        :value="template.type_id"
                                    >
                                        {{ template.type_name }}
                                    </option>
                                </select>
                            </div>
                            
                            <!-- 公開状態フィルター -->
                            <div>
                                <select
                                    v-model="filters.public_flag"
                                    @change="applyFilters"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">すべての公開状態</option>
                                    <option :value="PUBLIC_FLAGS.PUBLIC">公開</option>
                                    <option :value="PUBLIC_FLAGS.PROTECT">保護</option>
                                    <option :value="PUBLIC_FLAGS.PRIVATE">非公開</option>
                                </select>
                            </div>
                        </div>
                        
                        <!-- 追加フィルター -->
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            <!-- 作成者フィルター -->
                            <div>
                                <input
                                    type="text"
                                    v-model="filters.creator"
                                    @input="onCreatorInput"
                                    placeholder="作成者で絞り込み..."
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            
                            <!-- 日付範囲フィルター -->
                            <div>
                                <input
                                    type="date"
                                    v-model="filters.date_from"
                                    @change="applyFilters"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <input
                                    type="date"
                                    v-model="filters.date_to"
                                    @change="applyFilters"
                                    class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        
                        <!-- ソート -->
                        <div class="flex justify-between items-center mt-4">
                            <div class="flex items-center space-x-2">
                                <label class="text-sm font-medium text-gray-700">並び順:</label>
                                <select
                                    v-model="filters.sort"
                                    @change="applyFilters"
                                    class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option :value="SORT_OPTIONS.UPDATED">更新日時（新しい順）</option>
                                    <option :value="SORT_OPTIONS.CREATED">作成日時（新しい順）</option>
                                    <option :value="SORT_OPTIONS.LIKES">いいね数（多い順）</option>
                                    <option :value="SORT_OPTIONS.VIEWS">閲覧数（多い順）</option>
                                    <option :value="SORT_OPTIONS.COMMENTS">コメント数（多い順）</option>
                                    <option :value="SORT_OPTIONS.TITLE">タイトル（昇順）</option>
                                </select>
                            </div>
                            
                            <!-- フィルター状態表示 -->
                            <div v-if="hasActiveFilters" class="flex items-center space-x-2">
                                <span class="text-sm text-gray-600">フィルター適用中</span>
                                <button
                                    @click="clearFilters"
                                    class="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    クリア
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- ナレッジ一覧 -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div class="p-6">
                        <!-- 結果の統計 -->
                        <div class="mb-6">
                            <p class="text-sm text-gray-600">
                                {{ knowledges.total }}件のナレッジが見つかりました
                                <span v-if="filters.search">
                                    （検索キーワード: "{{ filters.search }}"）
                                </span>
                            </p>
                        </div>

                        <!-- ナレッジカード -->
                        <div v-if="knowledges.data.length > 0" class="space-y-4">
                            <KnowledgeCard
                                v-for="knowledge in knowledges.data"
                                :key="knowledge.knowledge_id"
                                :knowledge="knowledge"
                            />
                        </div>

                        <!-- 空の状態 -->
                        <div v-else class="text-center py-12">
                            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <h3 class="mt-2 text-sm font-medium text-gray-900">ナレッジが見つかりません</h3>
                            <p class="mt-1 text-sm text-gray-500">
                                {{ hasActiveFilters ? 'フィルター条件を変更してみてください。' : '最初のナレッジを作成しましょう！' }}
                            </p>
                            <div v-if="!hasActiveFilters" class="mt-6">
                                <Link
                                    :href="route('knowledge.create')"
                                    class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    新規作成
                                </Link>
                            </div>
                        </div>

                        <!-- ページネーション -->
                        <div v-if="knowledges.data.length > 0" class="mt-6">
                            <Pagination :data="knowledges" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, computed, watch } from 'vue';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import SearchBox from '@/Components/SearchBox.vue';
import KnowledgeCard from '@/Components/KnowledgeCard.vue';
import Pagination from '@/Components/Pagination.vue';
import type { 
    Knowledge, 
    PaginationData, 
    TemplateMaster, 
    SearchFilters 
} from '@/types';
import { PUBLIC_FLAGS, SORT_OPTIONS } from '@/types';

interface Props {
    knowledges: PaginationData<Knowledge>;
    templates: TemplateMaster[];
    filters: SearchFilters;
}

const props = defineProps<Props>();

// リアクティブなフィルター状態
const filters = ref<SearchFilters>({
    search: props.filters.search || '',
    template: props.filters.template || undefined,
    public_flag: props.filters.public_flag || undefined,
    creator: props.filters.creator || '',
    date_from: props.filters.date_from || '',
    date_to: props.filters.date_to || '',
    sort: props.filters.sort || SORT_OPTIONS.UPDATED,
});

// デバウンス用のタイマー
let creatorFilterTimeout: NodeJS.Timeout | null = null;

// アクティブなフィルターがあるかどうか
const hasActiveFilters = computed(() => {
    return Boolean(
        filters.value.search ||
        filters.value.template ||
        filters.value.public_flag !== undefined ||
        filters.value.creator ||
        filters.value.date_from ||
        filters.value.date_to
    );
});

// 検索実行
const onSearch = (query: string) => {
    filters.value.search = query;
    applyFilters();
};

// 作成者フィルターの入力（デバウンス付き）
const onCreatorInput = () => {
    if (creatorFilterTimeout) {
        clearTimeout(creatorFilterTimeout);
    }
    
    creatorFilterTimeout = setTimeout(() => {
        applyFilters();
    }, 500);
};

// フィルター適用
const applyFilters = () => {
    // 空の値を除去
    const cleanFilters: Record<string, string | number> = {};
    
    Object.entries(filters.value).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            cleanFilters[key] = value;
        }
    });
    
    router.get(route('knowledge.index'), cleanFilters, {
        preserveState: true,
        preserveScroll: true,
    });
};

// フィルタークリア
const clearFilters = () => {
    filters.value = {
        search: '',
        template: undefined,
        public_flag: undefined,
        creator: '',
        date_from: '',
        date_to: '',
        sort: SORT_OPTIONS.UPDATED,
    };
    
    router.get(route('knowledge.index'), { sort: SORT_OPTIONS.UPDATED }, {
        preserveState: true,
        preserveScroll: true,
    });
};
</script>
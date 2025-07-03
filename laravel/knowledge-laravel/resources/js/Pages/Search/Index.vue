<template>
    <Head title="検索" />

    <AuthenticatedLayout>
        <template #header>
            <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                検索
            </h2>
        </template>

        <div class="py-6">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <!-- 検索フォーム -->
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                    <div class="p-6">
                        <div class="space-y-4">
                            <!-- メイン検索ボックス -->
                            <div>
                                <SearchBox
                                    v-model="searchQuery"
                                    @search="performSearch"
                                    placeholder="ナレッジを検索..."
                                    class="text-lg"
                                />
                            </div>

                            <!-- 高度な検索オプション -->
                            <div class="border-t border-gray-200 pt-4">
                                <button
                                    @click="showAdvancedSearch = !showAdvancedSearch"
                                    type="button"
                                    class="flex items-center text-sm text-blue-600 hover:text-blue-800"
                                >
                                    <svg 
                                        :class="['w-4 h-4 mr-1 transform transition-transform', showAdvancedSearch ? 'rotate-180' : '']"
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    高度な検索
                                </button>

                                <div v-if="showAdvancedSearch" class="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <!-- テンプレートフィルター -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            テンプレート
                                        </label>
                                        <select
                                            v-model="filters.template"
                                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">すべて</option>
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
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            公開状態
                                        </label>
                                        <select
                                            v-model="filters.public_flag"
                                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">すべて</option>
                                            <option :value="PUBLIC_FLAGS.PUBLIC">公開</option>
                                            <option :value="PUBLIC_FLAGS.PROTECT">保護</option>
                                            <option :value="PUBLIC_FLAGS.PRIVATE">非公開</option>
                                        </select>
                                    </div>

                                    <!-- 作成者フィルター -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            作成者
                                        </label>
                                        <input
                                            type="text"
                                            v-model="filters.creator"
                                            placeholder="作成者名..."
                                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <!-- タグフィルター -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            タグ
                                        </label>
                                        <input
                                            type="text"
                                            v-model="filters.tag"
                                            placeholder="タグ名..."
                                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <!-- 日付範囲 -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            作成日（開始）
                                        </label>
                                        <input
                                            type="date"
                                            v-model="filters.date_from"
                                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            作成日（終了）
                                        </label>
                                        <input
                                            type="date"
                                            v-model="filters.date_to"
                                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        />
                                    </div>

                                    <!-- ソート -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-1">
                                            並び順
                                        </label>
                                        <select
                                            v-model="filters.sort"
                                            class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option :value="SORT_OPTIONS.RELEVANCE">関連度</option>
                                            <option :value="SORT_OPTIONS.UPDATED">更新日時（新しい順）</option>
                                            <option :value="SORT_OPTIONS.CREATED">作成日時（新しい順）</option>
                                            <option :value="SORT_OPTIONS.LIKES">いいね数（多い順）</option>
                                            <option :value="SORT_OPTIONS.VIEWS">閲覧数（多い順）</option>
                                            <option :value="SORT_OPTIONS.COMMENTS">コメント数（多い順）</option>
                                        </select>
                                    </div>

                                    <!-- 検索ボタン -->
                                    <div class="flex items-end">
                                        <button
                                            @click="performAdvancedSearch"
                                            type="button"
                                            class="w-full px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                        >
                                            検索実行
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 検索結果 -->
                <div v-if="hasSearched" class="space-y-6">
                    <!-- 検索統計 -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h3 class="text-lg font-medium text-gray-900">
                                        検索結果
                                    </h3>
                                    <p class="text-sm text-gray-600">
                                        "{{ currentQuery }}" の検索結果: {{ results.total }}件
                                        <span v-if="searchTime">（{{ searchTime }}秒）</span>
                                    </p>
                                </div>
                                
                                <!-- 検索設定リセット -->
                                <button
                                    v-if="hasActiveFilters"
                                    @click="resetSearch"
                                    type="button"
                                    class="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    フィルターをリセット
                                </button>
                            </div>

                            <!-- 検索統計（詳細） -->
                            <div v-if="stats" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-blue-600">{{ stats.total_results }}</div>
                                    <div class="text-sm text-gray-500">総件数</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-green-600">{{ Object.keys(stats.by_type).length }}</div>
                                    <div class="text-sm text-gray-500">テンプレート種類</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-yellow-600">{{ Object.keys(stats.by_tag).length }}</div>
                                    <div class="text-sm text-gray-500">関連タグ</div>
                                </div>
                                <div class="text-center">
                                    <div class="text-2xl font-bold text-purple-600">{{ Object.keys(stats.by_author).length }}</div>
                                    <div class="text-sm text-gray-500">作成者数</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 検索結果一覧 -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <div v-if="results.data.length > 0" class="space-y-4">
                                <KnowledgeCard
                                    v-for="knowledge in results.data"
                                    :key="knowledge.knowledge_id"
                                    :knowledge="knowledge"
                                />
                            </div>

                            <!-- 検索結果が空の場合 -->
                            <div v-else class="text-center py-12">
                                <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 class="mt-2 text-sm font-medium text-gray-900">検索結果が見つかりませんでした</h3>
                                <p class="mt-1 text-sm text-gray-500">
                                    別のキーワードで検索するか、フィルター条件を変更してみてください。
                                </p>
                                <div class="mt-6">
                                    <button
                                        @click="resetSearch"
                                        type="button"
                                        class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        検索をリセット
                                    </button>
                                </div>
                            </div>

                            <!-- ページネーション -->
                            <div v-if="results.data.length > 0" class="mt-6">
                                <Pagination :data="results" />
                            </div>
                        </div>
                    </div>

                    <!-- 関連キーワード・タグ -->
                    <div v-if="relatedKeywords.length > 0 || popularTags.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- 関連キーワード -->
                        <div v-if="relatedKeywords.length > 0" class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">関連キーワード</h3>
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        v-for="keyword in relatedKeywords"
                                        :key="keyword"
                                        @click="searchRelatedKeyword(keyword)"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                                    >
                                        {{ keyword }}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 人気のタグ -->
                        <div v-if="popularTags.length > 0" class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">人気のタグ</h3>
                                <div class="flex flex-wrap gap-2">
                                    <button
                                        v-for="tag in popularTags"
                                        :key="tag.tag_name"
                                        @click="searchByTag(tag.tag_name)"
                                        class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                                    >
                                        #{{ tag.tag_name }}
                                        <span class="ml-1 text-xs text-gray-500">({{ tag.usage_count }})</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 初期表示（検索前） -->
                <div v-else class="space-y-6">
                    <!-- 人気のナレッジ -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">人気のナレッジ</h3>
                            <div v-if="popularKnowledges.length > 0" class="space-y-3">
                                <Link
                                    v-for="knowledge in popularKnowledges.slice(0, 5)"
                                    :key="knowledge.knowledge_id"
                                    :href="route('knowledge.show', knowledge.knowledge_id)"
                                    class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <h4 class="text-sm font-medium text-gray-900 hover:text-blue-600">
                                        {{ knowledge.title }}
                                    </h4>
                                    <div class="flex items-center justify-between mt-1">
                                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>👍 {{ knowledge.like_count || 0 }}</span>
                                            <span>💬 {{ knowledge.comment_count || 0 }}</span>
                                            <span>👁 {{ knowledge.view_count || 0 }}</span>
                                        </div>
                                        <span class="text-xs text-gray-400">
                                            {{ formatDate(knowledge.update_datetime || knowledge.insert_datetime) }}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <!-- 最近のナレッジ -->
                    <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div class="p-6">
                            <h3 class="text-lg font-medium text-gray-900 mb-4">最近のナレッジ</h3>
                            <div v-if="recentKnowledges.length > 0" class="space-y-3">
                                <Link
                                    v-for="knowledge in recentKnowledges.slice(0, 5)"
                                    :key="knowledge.knowledge_id"
                                    :href="route('knowledge.show', knowledge.knowledge_id)"
                                    class="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <h4 class="text-sm font-medium text-gray-900 hover:text-blue-600">
                                        {{ knowledge.title }}
                                    </h4>
                                    <div class="flex items-center justify-between mt-1">
                                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                                            <span>👍 {{ knowledge.like_count || 0 }}</span>
                                            <span>💬 {{ knowledge.comment_count || 0 }}</span>
                                            <span>👁 {{ knowledge.view_count || 0 }}</span>
                                        </div>
                                        <span class="text-xs text-gray-400">
                                            {{ formatDate(knowledge.update_datetime || knowledge.insert_datetime) }}
                                        </span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import SearchBox from '@/Components/SearchBox.vue';
import KnowledgeCard from '@/Components/KnowledgeCard.vue';
import Pagination from '@/Components/Pagination.vue';
import type { 
    Knowledge, 
    PaginationData, 
    TemplateMaster, 
    Tag,
    SearchStats,
    SearchFilters
} from '@/types';
import { PUBLIC_FLAGS, SORT_OPTIONS } from '@/types';

interface Props {
    query?: string;
    templates: TemplateMaster[];
    popularKnowledges: Knowledge[];
    recentKnowledges: Knowledge[];
    popularTags: Tag[];
    filters?: SearchFilters;
}

const props = defineProps<Props>();

// リアクティブな状態
const searchQuery = ref(props.query || '');
const currentQuery = ref(props.query || '');
const showAdvancedSearch = ref(false);
const hasSearched = ref(Boolean(props.query));
const searchTime = ref<number | null>(null);

const results = ref<PaginationData<Knowledge>>({
    data: [],
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1,
    from: 0,
    to: 0,
    links: [],
});

const stats = ref<SearchStats | null>(null);
const relatedKeywords = ref<string[]>([]);

// フィルター
const filters = reactive<SearchFilters>({
    search: props.filters?.search || '',
    template: props.filters?.template || undefined,
    public_flag: props.filters?.public_flag || undefined,
    creator: props.filters?.creator || '',
    tag: props.filters?.tag || '',
    date_from: props.filters?.date_from || '',
    date_to: props.filters?.date_to || '',
    sort: props.filters?.sort || SORT_OPTIONS.RELEVANCE,
});

// アクティブなフィルターがあるかどうか
const hasActiveFilters = computed(() => {
    return Boolean(
        filters.template ||
        filters.public_flag !== undefined ||
        filters.creator ||
        filters.tag ||
        filters.date_from ||
        filters.date_to ||
        (filters.sort && filters.sort !== SORT_OPTIONS.RELEVANCE)
    );
});

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

// 検索実行
const performSearch = async (query?: string) => {
    const searchQuery = query || searchQuery.value;
    if (!searchQuery.trim()) return;
    
    currentQuery.value = searchQuery;
    hasSearched.value = true;
    
    const startTime = performance.now();
    
    try {
        const response = await axios.get('/api/search', {
            params: {
                q: searchQuery,
                ...Object.fromEntries(
                    Object.entries(filters).filter(([_, value]) => 
                        value !== undefined && value !== null && value !== ''
                    )
                ),
            }
        });
        
        results.value = response.data.data;
        stats.value = response.data.stats;
        relatedKeywords.value = response.data.related_keywords || [];
        
        const endTime = performance.now();
        searchTime.value = Math.round((endTime - startTime) / 100) / 10;
        
    } catch (error) {
        console.error('検索エラー:', error);
        results.value = {
            data: [],
            current_page: 1,
            per_page: 20,
            total: 0,
            last_page: 1,
            from: 0,
            to: 0,
            links: [],
        };
    }
};

// 高度な検索実行
const performAdvancedSearch = () => {
    filters.search = searchQuery.value;
    performSearch(searchQuery.value);
};

// 関連キーワードで検索
const searchRelatedKeyword = (keyword: string) => {
    searchQuery.value = keyword;
    resetFilters();
    performSearch(keyword);
};

// タグで検索
const searchByTag = (tagName: string) => {
    searchQuery.value = '';
    resetFilters();
    filters.tag = tagName;
    performAdvancedSearch();
};

// フィルターリセット
const resetFilters = () => {
    Object.assign(filters, {
        search: '',
        template: undefined,
        public_flag: undefined,
        creator: '',
        tag: '',
        date_from: '',
        date_to: '',
        sort: SORT_OPTIONS.RELEVANCE,
    });
};

// 検索リセット
const resetSearch = () => {
    searchQuery.value = '';
    currentQuery.value = '';
    hasSearched.value = false;
    searchTime.value = null;
    results.value = {
        data: [],
        current_page: 1,
        per_page: 20,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
        links: [],
    };
    stats.value = null;
    relatedKeywords.value = [];
    resetFilters();
    showAdvancedSearch.value = false;
};

// 初期検索実行
if (props.query) {
    performSearch(props.query);
}
</script>
<template>
    <nav v-if="data.last_page > 1" class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <!-- モバイル用ページネーション -->
        <div class="flex flex-1 justify-between sm:hidden">
            <Link
                v-if="data.current_page > 1"
                :href="getPreviousPageUrl()"
                class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
                前へ
            </Link>
            <span v-else class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md">
                前へ
            </span>

            <Link
                v-if="data.current_page < data.last_page"
                :href="getNextPageUrl()"
                class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
                次へ
            </Link>
            <span v-else class="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-300 rounded-md">
                次へ
            </span>
        </div>

        <!-- デスクトップ用ページネーション -->
        <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
                <p class="text-sm text-gray-700">
                    <span class="font-medium">{{ data.from }}</span>
                    から
                    <span class="font-medium">{{ data.to }}</span>
                    までを表示（全
                    <span class="font-medium">{{ data.total }}</span>
                    件中）
                </p>
            </div>
            <div>
                <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <!-- 前へボタン -->
                    <Link
                        v-if="data.current_page > 1"
                        :href="getPreviousPageUrl()"
                        class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                        <span class="sr-only">前へ</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                        </svg>
                    </Link>
                    <span v-else class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300">
                        <span class="sr-only">前へ</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                        </svg>
                    </span>

                    <!-- ページ番号 -->
                    <template v-for="page in getPages()" :key="page">
                        <Link
                            v-if="page !== '...'"
                            :href="getPageUrl(page as number)"
                            :class="getPageClass(page as number)"
                        >
                            {{ page }}
                        </Link>
                        <span v-else class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                            ...
                        </span>
                    </template>

                    <!-- 次へボタン -->
                    <Link
                        v-if="data.current_page < data.last_page"
                        :href="getNextPageUrl()"
                        class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                    >
                        <span class="sr-only">次へ</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                        </svg>
                    </Link>
                    <span v-else class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-300 ring-1 ring-inset ring-gray-300">
                        <span class="sr-only">次へ</span>
                        <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                        </svg>
                    </span>
                </nav>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3';
import type { PaginationData } from '@/types';

interface Props {
    data: PaginationData<any>;
}

const props = defineProps<Props>();

const getPageUrl = (page: number): string => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page.toString());
    return url.toString();
};

const getPreviousPageUrl = (): string => {
    return getPageUrl(props.data.current_page - 1);
};

const getNextPageUrl = (): string => {
    return getPageUrl(props.data.current_page + 1);
};

const getPageClass = (page: number): string => {
    const baseClass = "relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0";
    
    if (page === props.data.current_page) {
        return `${baseClass} z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`;
    }
    
    return `${baseClass} text-gray-900 hover:bg-gray-50`;
};

const getPages = (): (number | string)[] => {
    const current = props.data.current_page;
    const last = props.data.last_page;
    const delta = 2; // 現在のページの前後に表示するページ数
    
    const pages: (number | string)[] = [];
    
    // 最初のページ
    if (current - delta > 1) {
        pages.push(1);
        if (current - delta > 2) {
            pages.push('...');
        }
    }
    
    // 現在のページ周辺
    for (let i = Math.max(1, current - delta); i <= Math.min(last, current + delta); i++) {
        pages.push(i);
    }
    
    // 最後のページ
    if (current + delta < last) {
        if (current + delta < last - 1) {
            pages.push('...');
        }
        pages.push(last);
    }
    
    return pages;
};
</script>
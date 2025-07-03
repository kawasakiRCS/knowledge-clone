<template>
    <div class="relative">
        <div class="relative">
            <input
                type="text"
                v-model="query"
                @input="onInput"
                @keydown.enter="onSearch"
                @focus="showSuggestions = true"
                @blur="onBlur"
                :placeholder="placeholder"
                class="w-full rounded-lg border border-gray-300 px-4 py-2 pl-10 pr-12 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <div class="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
                </svg>
            </div>
            <button
                v-if="query"
                @click="clearSearch"
                type="button"
                class="absolute inset-y-0 right-8 flex items-center pr-2"
            >
                <svg class="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <button
                @click="onSearch"
                type="button"
                class="absolute inset-y-0 right-0 flex items-center pr-3"
            >
                <svg class="h-4 w-4 text-blue-500 hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
                </svg>
            </button>
        </div>

        <!-- サジェスト -->
        <div
            v-if="showSuggestions && suggestions.length > 0"
            class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg"
        >
            <ul class="max-h-60 overflow-auto py-1">
                <li
                    v-for="(suggestion, index) in suggestions"
                    :key="index"
                    @mousedown="selectSuggestion(suggestion)"
                    class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
                >
                    <div class="flex items-center">
                        <svg class="mr-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" />
                        </svg>
                        <span>{{ suggestion }}</span>
                    </div>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import axios from 'axios';

interface Props {
    placeholder?: string;
    modelValue?: string;
    showSuggestions?: boolean;
}

interface Emits {
    (e: 'update:modelValue', value: string): void;
    (e: 'search', query: string): void;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: '検索...',
    modelValue: '',
    showSuggestions: true,
});

const emit = defineEmits<Emits>();

const query = ref(props.modelValue);
const suggestions = ref<string[]>([]);
const showSuggestions = ref(false);
const suggestionsTimeout = ref<number | null>(null);

// モデル値が変更されたら内部の値も更新
watch(() => props.modelValue, (newValue) => {
    query.value = newValue;
});

// 内部の値が変更されたらモデル値も更新
watch(query, (newValue) => {
    emit('update:modelValue', newValue);
});

const onInput = () => {
    if (suggestionsTimeout.value) {
        clearTimeout(suggestionsTimeout.value);
    }

    if (query.value.length >= 2) {
        suggestionsTimeout.value = window.setTimeout(() => {
            fetchSuggestions();
        }, 300);
    } else {
        suggestions.value = [];
    }
};

const fetchSuggestions = async () => {
    if (!props.showSuggestions || query.value.length < 2) {
        return;
    }

    try {
        const response = await axios.get('/api/search/suggest', {
            params: { q: query.value }
        });
        suggestions.value = response.data.data || [];
    } catch (error) {
        console.error('サジェスト取得エラー:', error);
        suggestions.value = [];
    }
};

const selectSuggestion = (suggestion: string) => {
    query.value = suggestion;
    suggestions.value = [];
    showSuggestions.value = false;
    onSearch();
};

const onSearch = () => {
    if (query.value.trim()) {
        emit('search', query.value.trim());
        suggestions.value = [];
        showSuggestions.value = false;
    }
};

const clearSearch = () => {
    query.value = '';
    suggestions.value = [];
    showSuggestions.value = false;
};

const onBlur = () => {
    // 少し遅延してサジェストを非表示にする（クリックイベントが先に実行されるように）
    window.setTimeout(() => {
        showSuggestions.value = false;
    }, 150);
};
</script>
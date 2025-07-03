<template>
    <div class="space-y-2">
        <!-- 選択済みタグ -->
        <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-2">
            <span
                v-for="tag in selectedTags"
                :key="tag"
                class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
            >
                #{{ tag }}
                <button
                    @click="removeTag(tag)"
                    type="button"
                    class="ml-2 text-blue-600 hover:text-blue-800"
                >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </span>
        </div>

        <!-- タグ入力フィールド -->
        <div class="relative">
            <input
                ref="input"
                type="text"
                v-model="inputValue"
                @input="onInput"
                @keydown.enter.prevent="addTag"
                @keydown.tab="onTab"
                @keydown.backspace="onBackspace"
                @keydown.arrow-down="onArrowDown"
                @keydown.arrow-up="onArrowUp"
                @focus="showSuggestions = true"
                @blur="onBlur"
                :placeholder="placeholder"
                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            <!-- サジェスト -->
            <div
                v-if="showSuggestions && filteredSuggestions.length > 0"
                class="absolute z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg max-h-48 overflow-auto"
            >
                <ul class="py-1">
                    <li
                        v-for="(suggestion, index) in filteredSuggestions"
                        :key="suggestion.tag_name || suggestion"
                        @mousedown="selectSuggestion(suggestion)"
                        :class="[
                            'cursor-pointer px-4 py-2 text-sm transition-colors',
                            index === highlightedIndex 
                                ? 'bg-blue-100 text-blue-900' 
                                : 'text-gray-700 hover:bg-gray-100'
                        ]"
                    >
                        <div class="flex items-center justify-between">
                            <span class="font-medium">
                                #{{ typeof suggestion === 'string' ? suggestion : suggestion.tag_name }}
                            </span>
                            <span 
                                v-if="typeof suggestion === 'object' && suggestion.usage_count"
                                class="text-xs text-gray-500"
                            >
                                {{ suggestion.usage_count }}回使用
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>

        <!-- ヘルプテキスト -->
        <p class="text-xs text-gray-500">
            Enterキーまたはカンマでタグを追加します。既存のタグから選択することもできます。
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import axios from 'axios';
import type { Tag } from '@/types';

interface Props {
    modelValue: string[];
    placeholder?: string;
    maxTags?: number;
    suggestions?: Tag[] | string[];
}

interface Emits {
    (e: 'update:modelValue', value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'タグを入力...',
    maxTags: 10,
    suggestions: () => [],
});

const emit = defineEmits<Emits>();

const input = ref<HTMLInputElement>();
const inputValue = ref('');
const showSuggestions = ref(false);
const highlightedIndex = ref(-1);
const availableTags = ref<Tag[]>([]);
const suggestionsTimeout = ref<NodeJS.Timeout | null>(null);

const selectedTags = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const filteredSuggestions = computed(() => {
    if (!inputValue.value) {
        return props.suggestions.slice(0, 10);
    }

    const query = inputValue.value.toLowerCase();
    const filtered = [
        ...props.suggestions,
        ...availableTags.value,
    ].filter(suggestion => {
        const tagName = typeof suggestion === 'string' ? suggestion : suggestion.tag_name;
        return tagName.toLowerCase().includes(query) && 
               !selectedTags.value.includes(tagName);
    });

    // 重複を除去
    const seen = new Set();
    return filtered.filter(suggestion => {
        const tagName = typeof suggestion === 'string' ? suggestion : suggestion.tag_name;
        if (seen.has(tagName)) {
            return false;
        }
        seen.add(tagName);
        return true;
    }).slice(0, 10);
});

watch(inputValue, (newValue) => {
    highlightedIndex.value = -1;
    
    if (suggestionsTimeout.value) {
        clearTimeout(suggestionsTimeout.value);
    }

    if (newValue.length >= 1) {
        suggestionsTimeout.value = setTimeout(() => {
            fetchTagSuggestions();
        }, 300);
    }
});

const onInput = () => {
    // カンマが入力された場合、タグを追加
    if (inputValue.value.includes(',')) {
        const tags = inputValue.value.split(',');
        const tagToAdd = tags[0].trim();
        
        if (tagToAdd) {
            addTagByName(tagToAdd);
        }
        
        inputValue.value = tags.slice(1).join(',');
    }
};

const addTag = () => {
    const tagName = inputValue.value.trim();
    
    if (tagName) {
        addTagByName(tagName);
        inputValue.value = '';
        showSuggestions.value = false;
    } else if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
        selectSuggestion(filteredSuggestions.value[highlightedIndex.value]);
    }
};

const addTagByName = (tagName: string) => {
    // バリデーション
    if (!tagName || tagName.length > 50) {
        return;
    }
    
    if (selectedTags.value.includes(tagName)) {
        return;
    }
    
    if (selectedTags.value.length >= props.maxTags) {
        return;
    }
    
    selectedTags.value = [...selectedTags.value, tagName];
};

const removeTag = (tagName: string) => {
    selectedTags.value = selectedTags.value.filter(tag => tag !== tagName);
};

const selectSuggestion = (suggestion: Tag | string) => {
    const tagName = typeof suggestion === 'string' ? suggestion : suggestion.tag_name;
    addTagByName(tagName);
    inputValue.value = '';
    showSuggestions.value = false;
    highlightedIndex.value = -1;
    
    nextTick(() => {
        input.value?.focus();
    });
};

const onTab = (event: KeyboardEvent) => {
    if (highlightedIndex.value >= 0 && filteredSuggestions.value[highlightedIndex.value]) {
        event.preventDefault();
        selectSuggestion(filteredSuggestions.value[highlightedIndex.value]);
    }
};

const onBackspace = () => {
    if (inputValue.value === '' && selectedTags.value.length > 0) {
        removeTag(selectedTags.value[selectedTags.value.length - 1]);
    }
};

const onArrowDown = (event: KeyboardEvent) => {
    event.preventDefault();
    if (filteredSuggestions.value.length > 0) {
        highlightedIndex.value = Math.min(
            highlightedIndex.value + 1,
            filteredSuggestions.value.length - 1
        );
    }
};

const onArrowUp = (event: KeyboardEvent) => {
    event.preventDefault();
    if (filteredSuggestions.value.length > 0) {
        highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0);
    }
};

const onBlur = () => {
    // 少し遅延してサジェストを非表示にする
    setTimeout(() => {
        showSuggestions.value = false;
        highlightedIndex.value = -1;
    }, 150);
};

const fetchTagSuggestions = async () => {
    try {
        const response = await axios.get('/api/tags', {
            params: { q: inputValue.value }
        });
        availableTags.value = response.data.data || [];
    } catch (error) {
        console.error('タグサジェスト取得エラー:', error);
        availableTags.value = [];
    }
};
</script>
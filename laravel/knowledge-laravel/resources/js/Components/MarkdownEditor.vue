<template>
    <div class="markdown-editor">
        <div class="border border-gray-300 rounded-lg overflow-hidden">
            <!-- タブヘッダー -->
            <div class="flex justify-between items-center border-b border-gray-300 bg-gray-50">
                <div class="flex">
                    <button
                        type="button"
                        @click="activeTab = 'edit'"
                        :class="[
                            'px-4 py-2 text-sm font-medium',
                            activeTab === 'edit' 
                                ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                                : 'text-gray-600 hover:text-gray-800'
                        ]"
                    >
                        編集
                    </button>
                <button
                    type="button"
                    @click="activeTab = 'preview'"
                    :class="[
                        'px-4 py-2 text-sm font-medium',
                        activeTab === 'preview' 
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                            : 'text-gray-600 hover:text-gray-800'
                    ]"
                >
                    プレビュー
                </button>
                <button
                    type="button"
                    @click="activeTab = 'split'"
                    :class="[
                        'px-4 py-2 text-sm font-medium',
                        activeTab === 'split' 
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                            : 'text-gray-600 hover:text-gray-800'
                    ]"
                >
                    分割表示
                </button>
                </div>
                
                <!-- アップロード状態表示 -->
                <div v-if="isUploading" class="flex items-center px-4 py-2 text-sm text-blue-600">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    画像をアップロード中...
                </div>
            </div>

            <!-- コンテンツエリア -->
            <div class="min-h-[400px]">
                <!-- 編集のみ -->
                <div v-if="activeTab === 'edit'" class="h-full">
                    <textarea
                        ref="textareaRef"
                        v-model="localValue"
                        @input="$emit('update:modelValue', localValue)"
                        @paste="handlePaste"
                        :placeholder="placeholder"
                        class="w-full h-[400px] p-4 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm"
                    ></textarea>
                </div>

                <!-- プレビューのみ -->
                <div v-else-if="activeTab === 'preview'" class="h-full">
                    <div 
                        class="p-4 h-[400px] overflow-y-auto prose max-w-none"
                        v-html="renderedMarkdown"
                    ></div>
                </div>

                <!-- 分割表示 -->
                <div v-else class="flex h-[400px]">
                    <div class="w-1/2 border-r border-gray-300">
                        <textarea
                            ref="textareaRef2"
                            v-model="localValue"
                            @input="$emit('update:modelValue', localValue)"
                            @paste="handlePaste"
                            :placeholder="placeholder"
                            class="w-full h-full p-4 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm"
                        ></textarea>
                    </div>
                    <div class="w-1/2">
                        <div 
                            class="p-4 h-full overflow-y-auto prose max-w-none"
                            v-html="renderedMarkdown"
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import axios from 'axios';

interface Props {
    modelValue: string;
    placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
    placeholder: 'マークダウンで記述してください...'
});

defineEmits<{
    'update:modelValue': [value: string];
}>();

const activeTab = ref<'edit' | 'preview' | 'split'>('edit');
const localValue = ref(props.modelValue);
const textareaRef = ref<HTMLTextAreaElement>();
const textareaRef2 = ref<HTMLTextAreaElement>();
const isUploading = ref(false);

// マークダウンレンダリング設定
marked.setOptions({
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

// propsの変更を監視
watch(() => props.modelValue, (newValue) => {
    localValue.value = newValue;
});

// マークダウンをHTMLに変換
const renderedMarkdown = computed(() => {
    if (!localValue.value) return '';
    try {
        return marked(localValue.value);
    } catch (error) {
        console.error('Markdown rendering error:', error);
        return '<p>マークダウンの解析中にエラーが発生しました。</p>';
    }
});

// 画像のペースト処理
const handlePaste = async (event: ClipboardEvent) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // 画像ファイルかチェック
        if (item.type.indexOf('image/') === 0) {
            event.preventDefault();
            
            const file = item.getAsFile();
            if (file) {
                await uploadImage(file);
            }
            break;
        }
    }
};

// 画像アップロード処理
const uploadImage = async (file: File) => {
    if (isUploading.value) return;
    
    isUploading.value = true;
    
    try {
        const formData = new FormData();
        formData.append('image', file);
        
        // CSRFトークンを取得
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        const response = await axios.post('/api/images/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'X-CSRF-TOKEN': token,
            },
        });
        
        if (response.data.success) {
            // カーソル位置に画像のマークダウンを挿入
            insertAtCursor(response.data.markdown);
        } else {
            console.error('Upload failed:', response.data.message);
            alert('画像のアップロードに失敗しました: ' + response.data.message);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('画像のアップロードに失敗しました。');
    } finally {
        isUploading.value = false;
    }
};

// カーソル位置にテキストを挿入
const insertAtCursor = (text: string) => {
    const textarea = textareaRef.value || textareaRef2.value;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = localValue.value.substring(0, start);
    const after = localValue.value.substring(end);
    
    localValue.value = before + text + after;
    
    // カーソル位置を更新
    setTimeout(() => {
        const newPos = start + text.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
    }, 0);
};
</script>

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
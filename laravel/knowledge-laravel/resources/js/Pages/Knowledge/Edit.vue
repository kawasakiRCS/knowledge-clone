<template>
    <Head :title="`${knowledge.title} - 編集`" />

    <AuthenticatedLayout>
        <template #header>
            <div class="flex items-center space-x-4">
                <Link
                    :href="route('knowledge.show', knowledge.knowledge_id)"
                    class="text-gray-600 hover:text-gray-900"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
                <h2 class="font-semibold text-xl text-gray-800 leading-tight">
                    ナレッジ編集: {{ knowledge.title }}
                </h2>
            </div>
        </template>

        <div class="py-6">
            <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
                <form @submit.prevent="submit">
                    <div class="space-y-6">
                        <!-- 基本情報 -->
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                                
                                <div class="space-y-4">
                                    <!-- タイトル -->
                                    <div>
                                        <label for="title" class="block text-sm font-medium text-gray-700">
                                            タイトル <span class="text-red-500">*</span>
                                        </label>
                                        <input
                                            id="title"
                                            type="text"
                                            v-model="form.title"
                                            required
                                            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            placeholder="ナレッジのタイトルを入力してください"
                                        />
                                        <div v-if="errors.title" class="mt-1 text-sm text-red-600">
                                            {{ errors.title }}
                                        </div>
                                    </div>

                                    <!-- テンプレート選択 -->
                                    <div>
                                        <label for="type_id" class="block text-sm font-medium text-gray-700">
                                            テンプレート
                                        </label>
                                        <select
                                            id="type_id"
                                            v-model="form.type_id"
                                            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                            <option value="">テンプレートを選択（任意）</option>
                                            <option
                                                v-for="template in templates"
                                                :key="template.type_id"
                                                :value="template.type_id"
                                            >
                                                {{ template.type_icon }} {{ template.type_name }}
                                                <span v-if="template.description">- {{ template.description }}</span>
                                            </option>
                                        </select>
                                        <div v-if="errors.type_id" class="mt-1 text-sm text-red-600">
                                            {{ errors.type_id }}
                                        </div>
                                    </div>

                                    <!-- 公開設定 -->
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">
                                            公開設定 <span class="text-red-500">*</span>
                                        </label>
                                        <div class="space-y-2">
                                            <label class="flex items-center">
                                                <input
                                                    type="radio"
                                                    v-model="form.public_flag"
                                                    :value="PUBLIC_FLAGS.PUBLIC"
                                                    class="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span class="ml-2 text-sm text-gray-700">
                                                    <span class="font-medium">公開</span> - 全てのユーザーが閲覧可能
                                                </span>
                                            </label>
                                            <label class="flex items-center">
                                                <input
                                                    type="radio"
                                                    v-model="form.public_flag"
                                                    :value="PUBLIC_FLAGS.PROTECT"
                                                    class="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span class="ml-2 text-sm text-gray-700">
                                                    <span class="font-medium">保護</span> - 指定したユーザー・グループのみ閲覧可能
                                                </span>
                                            </label>
                                            <label class="flex items-center">
                                                <input
                                                    type="radio"
                                                    v-model="form.public_flag"
                                                    :value="PUBLIC_FLAGS.PRIVATE"
                                                    class="text-blue-600 focus:ring-blue-500"
                                                />
                                                <span class="ml-2 text-sm text-gray-700">
                                                    <span class="font-medium">非公開</span> - 自分のみ閲覧可能
                                                </span>
                                            </label>
                                        </div>
                                        <div v-if="errors.public_flag" class="mt-1 text-sm text-red-600">
                                            {{ errors.public_flag }}
                                        </div>
                                    </div>

                                    <!-- 匿名投稿 -->
                                    <div>
                                        <label class="flex items-center">
                                            <input
                                                type="checkbox"
                                                v-model="form.anonymous"
                                                class="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                            />
                                            <span class="ml-2 text-sm text-gray-700">匿名で投稿する</span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- アクセス権限設定（保護の場合のみ表示） -->
                        <div v-if="form.public_flag === PUBLIC_FLAGS.PROTECT" class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">アクセス権限設定</h3>
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <!-- 閲覧権限 -->
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-700 mb-2">閲覧権限</h4>
                                        
                                        <!-- 既存の権限表示 -->
                                        <div v-if="form.allowed_users.length > 0 || form.allowed_groups.length > 0" class="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p class="text-xs font-medium text-gray-600 mb-2">現在の設定</p>
                                            <div class="space-y-1">
                                                <div v-if="form.allowed_users.length > 0" class="text-sm text-gray-700">
                                                    ユーザー: {{ form.allowed_users.length }}人
                                                </div>
                                                <div v-if="form.allowed_groups.length > 0" class="text-sm text-gray-700">
                                                    グループ: {{ getGroupNames(form.allowed_groups).join(', ') }}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 閲覧可能グループ -->
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">
                                                閲覧可能グループ
                                            </label>
                                            <select
                                                v-model="selectedViewGroup"
                                                @change="addViewGroup"
                                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">グループを選択...</option>
                                                <option
                                                    v-for="group in availableViewGroups"
                                                    :key="group.group_id"
                                                    :value="group.group_id"
                                                >
                                                    {{ group.group_name }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>

                                    <!-- 編集権限 -->
                                    <div>
                                        <h4 class="text-sm font-medium text-gray-700 mb-2">編集権限</h4>
                                        
                                        <!-- 既存の権限表示 -->
                                        <div v-if="form.edit_users.length > 0 || form.edit_groups.length > 0" class="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p class="text-xs font-medium text-gray-600 mb-2">現在の設定</p>
                                            <div class="space-y-1">
                                                <div v-if="form.edit_users.length > 0" class="text-sm text-gray-700">
                                                    ユーザー: {{ form.edit_users.length }}人
                                                </div>
                                                <div v-if="form.edit_groups.length > 0" class="text-sm text-gray-700">
                                                    グループ: {{ getGroupNames(form.edit_groups).join(', ') }}
                                                </div>
                                            </div>
                                        </div>

                                        <!-- 編集可能グループ -->
                                        <div>
                                            <label class="block text-xs font-medium text-gray-600 mb-1">
                                                編集可能グループ
                                            </label>
                                            <select
                                                v-model="selectedEditGroup"
                                                @change="addEditGroup"
                                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="">グループを選択...</option>
                                                <option
                                                    v-for="group in availableEditGroups"
                                                    :key="group.group_id"
                                                    :value="group.group_id"
                                                >
                                                    {{ group.group_name }}
                                                </option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- タグ -->
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">タグ</h3>
                                <TagInput
                                    v-model="form.tags"
                                    placeholder="タグを入力してください..."
                                    :max-tags="10"
                                />
                                <div v-if="errors.tags" class="mt-1 text-sm text-red-600">
                                    {{ errors.tags }}
                                </div>
                            </div>
                        </div>

                        <!-- コンテンツ -->
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">
                                    コンテンツ <span class="text-red-500">*</span>
                                </h3>
                                
                                <div>
                                    <MarkdownEditor
                                        v-model="form.content"
                                        placeholder="ナレッジの内容をマークダウンで入力してください..."
                                    />
                                    <div v-if="errors.content" class="mt-1 text-sm text-red-600">
                                        {{ errors.content }}
                                    </div>
                                    <p class="mt-2 text-xs text-gray-500">
                                        Markdown記法をサポートしています。編集・プレビュー・分割表示を切り替えできます。
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- ファイル添付 -->
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <h3 class="text-lg font-medium text-gray-900 mb-4">ファイル添付</h3>
                                
                                <!-- 既存ファイル -->
                                <div v-if="knowledge.files && knowledge.files.length > 0" class="mb-6">
                                    <h4 class="text-sm font-medium text-gray-700 mb-2">既存のファイル</h4>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div
                                            v-for="file in knowledge.files"
                                            :key="file.file_no"
                                            class="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md"
                                        >
                                            <div class="flex items-center space-x-3">
                                                <svg v-if="file.is_image" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <div>
                                                    <p class="text-sm font-medium text-gray-900">{{ file.file_name }}</p>
                                                    <p class="text-xs text-gray-500">{{ file.formatted_file_size }}</p>
                                                </div>
                                            </div>
                                            <button
                                                @click="removeExistingFile(file.file_no)"
                                                type="button"
                                                class="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- 新しいファイルアップロード -->
                                <div>
                                    <h4 class="text-sm font-medium text-gray-700 mb-2">新しいファイルを追加</h4>
                                    <FileUploader
                                        :knowledge-id="knowledge.knowledge_id"
                                        :can-delete="true"
                                        @uploaded="handleFilesUploaded"
                                        @deleted="handleFileDeleted"
                                        @error="handleFileError"
                                    />
                                    <div v-if="errors.files" class="mt-1 text-sm text-red-600">
                                        {{ errors.files }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 操作ボタン -->
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <div class="flex items-center justify-between">
                                    <Link
                                        :href="route('knowledge.show', knowledge.knowledge_id)"
                                        class="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        キャンセル
                                    </Link>
                                    
                                    <div class="flex items-center space-x-3">
                                        <button
                                            type="submit"
                                            :disabled="processing || !isFormValid"
                                            class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {{ processing ? '更新中...' : '更新' }}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </AuthenticatedLayout>
</template>

<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3';
import { ref, reactive, computed } from 'vue';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import FileUploader from '@/Components/FileUploader.vue';
import TagInput from '@/Components/TagInput.vue';
import MarkdownEditor from '@/Components/MarkdownEditor.vue';
import type { Knowledge, TemplateMaster, Group, KnowledgeFormData } from '@/types';
import { PUBLIC_FLAGS } from '@/types';

interface Props {
    knowledge: Knowledge;
    templates: TemplateMaster[];
    groups: Group[];
    errors: Record<string, string>;
}

const props = defineProps<Props>();

const processing = ref(false);

// フォームデータを既存データで初期化
const form = reactive<KnowledgeFormData>({
    title: props.knowledge.title,
    content: props.knowledge.content,
    public_flag: props.knowledge.public_flag,
    type_id: props.knowledge.type_id || undefined,
    anonymous: Boolean(props.knowledge.anonymous),
    tags: props.knowledge.tags?.map(tag => tag.tag_name) || [],
    allowed_users: [], // 実際の実装では既存の権限データを取得
    allowed_groups: [], // 実際の実装では既存の権限データを取得
    edit_users: [], // 実際の実装では既存の権限データを取得
    edit_groups: [], // 実際の実装では既存の権限データを取得
    temp_file_ids: [],
});

// 削除対象の既存ファイル
const filesToRemove = ref<number[]>([]);

// 権限設定用の状態
const selectedViewGroup = ref('');
const selectedEditGroup = ref('');

// 利用可能なグループ
const availableViewGroups = computed(() => {
    return props.groups.filter(group => !form.allowed_groups.includes(group.group_id));
});

const availableEditGroups = computed(() => {
    return props.groups.filter(group => !form.edit_groups.includes(group.group_id));
});

// フォームバリデーション
const isFormValid = computed(() => {
    return form.title.trim() !== '' && 
           form.content.trim() !== '' && 
           form.public_flag !== undefined;
});

// グループ名取得
const getGroupNames = (groupIds: number[]): string[] => {
    return groupIds.map(id => {
        const group = props.groups.find(g => g.group_id === id);
        return group?.group_name || `グループ${id}`;
    });
};

// グループ追加
const addViewGroup = () => {
    if (selectedViewGroup.value && !form.allowed_groups.includes(Number(selectedViewGroup.value))) {
        form.allowed_groups.push(Number(selectedViewGroup.value));
        selectedViewGroup.value = '';
    }
};

const addEditGroup = () => {
    if (selectedEditGroup.value && !form.edit_groups.includes(Number(selectedEditGroup.value))) {
        form.edit_groups.push(Number(selectedEditGroup.value));
        selectedEditGroup.value = '';
    }
};

// 既存ファイル削除
const removeExistingFile = (fileNo: number) => {
    if (confirm('このファイルを削除してもよろしいですか？')) {
        filesToRemove.value.push(fileNo);
        // UIから非表示にする
        const index = props.knowledge.files?.findIndex(f => f.file_no === fileNo);
        if (index !== undefined && index !== -1 && props.knowledge.files) {
            props.knowledge.files.splice(index, 1);
        }
    }
};

// ファイルアップロードハンドラー
const handleFilesUploaded = (files: any[]) => {
    // ファイルがアップロードされたときの処理
    console.log('Files uploaded:', files);
};

const handleFileDeleted = (file: any) => {
    // ファイルが削除されたときの処理
    console.log('File deleted:', file);
};

const handleFileError = (message: string) => {
    // エラーが発生したときの処理
    alert(message);
};

// フォーム送信
const submit = () => {
    if (processing.value) return;
    
    processing.value = true;
    
    const submitData = {
        ...form,
        files_to_remove: filesToRemove.value,
        _method: 'PUT',
    };
    
    router.post(route('knowledge.update', props.knowledge.knowledge_id), submitData, {
        onFinish: () => {
            processing.value = false;
        },
    });
};
</script>
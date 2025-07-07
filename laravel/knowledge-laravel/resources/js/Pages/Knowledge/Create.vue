<template>
    <Head title="ナレッジ作成" />

    <AuthenticatedLayout>
        <template #header>
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
                    ナレッジ作成
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
                                        
                                        <!-- 閲覧可能ユーザー -->
                                        <div class="mb-4">
                                            <label class="block text-xs font-medium text-gray-600 mb-1">
                                                閲覧可能ユーザー
                                            </label>
                                            <input
                                                type="text"
                                                v-model="userSearchQuery"
                                                @input="searchUsers"
                                                placeholder="ユーザー名で検索..."
                                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <!-- ユーザー検索結果は省略 -->
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
                                        
                                        <!-- 編集可能ユーザー -->
                                        <div class="mb-4">
                                            <label class="block text-xs font-medium text-gray-600 mb-1">
                                                編集可能ユーザー
                                            </label>
                                            <input
                                                type="text"
                                                v-model="editUserSearchQuery"
                                                @input="searchEditUsers"
                                                placeholder="ユーザー名で検索..."
                                                class="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                            <!-- ユーザー検索結果は省略 -->
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
                                <FileUpload
                                    v-model="form.temp_file_ids"
                                    :max-file-size="10 * 1024 * 1024"
                                    :max-files="10"
                                />
                                <div v-if="errors.temp_file_ids" class="mt-1 text-sm text-red-600">
                                    {{ errors.temp_file_ids }}
                                </div>
                            </div>
                        </div>

                        <!-- 操作ボタン -->
                        <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div class="p-6">
                                <div class="flex items-center justify-between">
                                    <Link
                                        :href="route('knowledge.index')"
                                        class="inline-flex items-center px-4 py-2 bg-gray-300 border border-transparent rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest hover:bg-gray-400 focus:bg-gray-400 active:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        キャンセル
                                    </Link>
                                    
                                    <div class="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            @click="saveAsDraft"
                                            :disabled="processing"
                                            class="inline-flex items-center px-4 py-2 bg-yellow-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-yellow-700 focus:bg-yellow-700 active:bg-yellow-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            下書き保存
                                        </button>
                                        
                                        <button
                                            type="submit"
                                            :disabled="processing || !isFormValid"
                                            class="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {{ processing ? '作成中...' : '作成' }}
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
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import FileUpload from '@/Components/FileUpload.vue';
import TagInput from '@/Components/TagInput.vue';
import MarkdownEditor from '@/Components/MarkdownEditor.vue';
import type { TemplateMaster, Group, KnowledgeFormData } from '@/types';
import { PUBLIC_FLAGS } from '@/types';

interface Props {
    templates: TemplateMaster[];
    groups: Group[];
    errors: Record<string, string>;
}

const props = defineProps<Props>();

const processing = ref(false);

// フォームデータ
const form = reactive<KnowledgeFormData>({
    title: '',
    content: '',
    public_flag: PUBLIC_FLAGS.PUBLIC,
    type_id: undefined,
    anonymous: false,
    tags: [],
    allowed_users: [],
    allowed_groups: [],
    edit_users: [],
    edit_groups: [],
    temp_file_ids: [],
});

// 権限設定用の状態
const userSearchQuery = ref('');
const editUserSearchQuery = ref('');
const selectedViewGroup = ref('');
const selectedEditGroup = ref('');

// 利用可能なグループ（既に選択されたものを除く）
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

// ユーザー検索（省略 - 実際の実装では検索APIを使用）
const searchUsers = () => {
    // 実装省略
};

const searchEditUsers = () => {
    // 実装省略
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

// フォーム送信
const submit = () => {
    if (processing.value) return;
    
    processing.value = true;
    
    router.post(route('knowledge.store'), form, {
        onFinish: () => {
            processing.value = false;
        },
    });
};

// 下書き保存
const saveAsDraft = () => {
    if (processing.value) return;
    
    processing.value = true;
    
    // 下書きフラグを付けて保存
    router.post(route('knowledge.store'), { ...form, is_draft: true }, {
        onFinish: () => {
            processing.value = false;
        },
    });
};
</script>
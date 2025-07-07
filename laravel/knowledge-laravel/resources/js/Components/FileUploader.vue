<template>
    <div class="file-uploader">
        <!-- ファイル選択エリア -->
        <div
            @click="$refs.fileInput.click()"
            @drop.prevent="handleDrop"
            @dragover.prevent
            @dragenter.prevent
            :class="[
                'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            ]"
        >
            <input
                ref="fileInput"
                type="file"
                multiple
                @change="handleFileSelect"
                class="hidden"
                :accept="acceptTypes"
            />
            
            <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            
            <p class="mt-2 text-sm text-gray-600">
                <span class="font-semibold">クリックしてファイルを選択</span>
                またはドラッグ＆ドロップ
            </p>
            <p class="text-xs text-gray-500 mt-1">
                最大サイズ: 10MB
            </p>
        </div>

        <!-- アップロード中の表示 -->
        <div v-if="isUploading" class="mt-4">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">アップロード中...</span>
                <span class="text-sm text-gray-600">{{ uploadProgress }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
                <div
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: uploadProgress + '%' }"
                ></div>
            </div>
        </div>

        <!-- ファイルリスト -->
        <div v-if="files.length > 0" class="mt-6">
            <h4 class="text-sm font-medium text-gray-900 mb-3">添付ファイル ({{ files.length }})</h4>
            <div class="space-y-2">
                <div
                    v-for="file in files"
                    :key="file.file_no"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                    <div class="flex items-center space-x-3">
                        <!-- ファイルアイコン -->
                        <div class="flex-shrink-0">
                            <svg v-if="isImage(file.file_type)" class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <svg v-else-if="isPDF(file.file_type)" class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <svg v-else class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        
                        <!-- ファイル情報 -->
                        <div class="flex-1 min-w-0">
                            <p class="text-sm font-medium text-gray-900 truncate">
                                {{ file.file_name }}
                            </p>
                            <p class="text-sm text-gray-500">
                                {{ file.formatted_file_size }}
                            </p>
                        </div>
                    </div>
                    
                    <!-- アクション -->
                    <div class="flex items-center space-x-2">
                        <a
                            v-if="file.download_url"
                            :href="file.download_url"
                            class="text-blue-600 hover:text-blue-800"
                            target="_blank"
                            title="ダウンロード"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </a>
                        <button
                            v-if="canDelete"
                            @click="deleteFile(file)"
                            class="text-red-600 hover:text-red-800"
                            title="削除"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';

interface FileItem {
    file_no: number;
    file_name: string;
    file_size: number;
    formatted_file_size: string;
    file_type: string;
    is_image: boolean;
    download_url?: string;
}

interface Props {
    knowledgeId: number;
    canDelete?: boolean;
    acceptTypes?: string;
}

const props = withDefaults(defineProps<Props>(), {
    canDelete: false,
    acceptTypes: '*/*'
});

const emit = defineEmits<{
    uploaded: [files: FileItem[]];
    deleted: [file: FileItem];
    error: [message: string];
}>();

// リアクティブな状態
const files = ref<FileItem[]>([]);
const isUploading = ref(false);
const uploadProgress = ref(0);
const isDragging = ref(false);

// ファイルタイプ判定
const isImage = (mimeType: string): boolean => {
    return mimeType.startsWith('image/');
};

const isPDF = (mimeType: string): boolean => {
    return mimeType === 'application/pdf';
};

// ファイル選択ハンドラー
const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
        uploadFiles(Array.from(target.files));
    }
};

// ドラッグ＆ドロップハンドラー
const handleDrop = (event: DragEvent) => {
    isDragging.value = false;
    
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
        uploadFiles(Array.from(event.dataTransfer.files));
    }
};

// ファイルアップロード
const uploadFiles = async (filesToUpload: File[]) => {
    isUploading.value = true;
    uploadProgress.value = 0;
    
    try {
        const formData = new FormData();
        formData.append('knowledge_id', props.knowledgeId.toString());
        
        // 複数ファイルを追加
        filesToUpload.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });
        
        const response = await axios.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                }
            },
        });
        
        if (response.data.success) {
            // アップロード成功したファイルをリストに追加
            files.value.push(...response.data.files);
            emit('uploaded', response.data.files);
        }
        
    } catch (error: any) {
        console.error('File upload error:', error);
        const message = error.response?.data?.message || 'ファイルのアップロードに失敗しました。';
        emit('error', message);
    } finally {
        isUploading.value = false;
        uploadProgress.value = 0;
    }
};

// ファイル削除
const deleteFile = async (file: FileItem) => {
    if (!confirm(`${file.file_name} を削除してもよろしいですか？`)) {
        return;
    }
    
    try {
        const response = await axios.delete(`/api/files/${file.file_no}`);
        
        if (response.data.success) {
            // リストから削除
            files.value = files.value.filter(f => f.file_no !== file.file_no);
            emit('deleted', file);
        }
        
    } catch (error: any) {
        console.error('File delete error:', error);
        const message = error.response?.data?.message || 'ファイルの削除に失敗しました。';
        emit('error', message);
    }
};

// 既存ファイルを読み込む
const loadFiles = async () => {
    try {
        const response = await axios.get(`/api/knowledge/${props.knowledgeId}/files`);
        
        if (response.data.success) {
            files.value = response.data.files;
        }
        
    } catch (error) {
        console.error('Failed to load files:', error);
    }
};

// コンポーネントマウント時に既存ファイルを読み込む
loadFiles();
</script>
<template>
    <div class="space-y-4">
        <!-- ファイル選択エリア -->
        <div
            @drop="onDrop"
            @dragover.prevent
            @dragenter.prevent
            :class="[
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            ]"
        >
            <input
                ref="fileInput"
                type="file"
                multiple
                @change="onFileSelect"
                class="hidden"
                :accept="accept"
            />
            
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            
            <div class="mt-4">
                <button
                    type="button"
                    @click="(fileInput as HTMLInputElement)?.click()"
                    class="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
                >
                    ファイルを選択
                </button>
                <p class="mt-2 text-sm text-gray-500">
                    または、ここにファイルをドラッグ&ドロップ
                </p>
                <p class="text-xs text-gray-400 mt-1">
                    最大ファイルサイズ: {{ formatFileSize(maxFileSize) }}
                    <span v-if="accept">・対応形式: {{ accept }}</span>
                </p>
            </div>
        </div>

        <!-- アップロード中のファイル -->
        <div v-if="uploadingFiles.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-900">アップロード中</h4>
            <div
                v-for="file in uploadingFiles"
                :key="file.id"
                class="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-md"
            >
                <div class="flex-shrink-0">
                    <svg class="w-5 h-5 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                    <div class="mt-1 bg-blue-200 rounded-full h-2">
                        <div 
                            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            :style="{ width: file.progress + '%' }"
                        ></div>
                    </div>
                </div>
                <div class="text-sm text-blue-600">{{ file.progress }}%</div>
            </div>
        </div>

        <!-- アップロード済みファイル -->
        <div v-if="uploadedFiles.length > 0" class="space-y-2">
            <h4 class="text-sm font-medium text-gray-900">添付ファイル</h4>
            <div class="space-y-2">
                <div
                    v-for="file in uploadedFiles"
                    :key="file.id"
                    class="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-md"
                >
                    <div class="flex-shrink-0">
                        <svg v-if="isImageFile(file.name)" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <svg v-else class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 truncate">{{ file.name }}</p>
                        <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                    </div>
                    <button
                        @click="removeFile(file.id)"
                        type="button"
                        class="text-red-400 hover:text-red-600 transition-colors"
                    >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- エラー表示 -->
        <div v-if="errors.length > 0" class="space-y-1">
            <div
                v-for="error in errors"
                :key="error"
                class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2"
            >
                {{ error }}
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';

interface UploadingFile {
    id: string;
    name: string;
    size: number;
    progress: number;
}

interface UploadedFile {
    id: string;
    name: string;
    size: number;
    temp_file_id?: string;
}

interface Props {
    modelValue: string[];
    accept?: string;
    maxFileSize?: number;
    maxFiles?: number;
}

interface Emits {
    (e: 'update:modelValue', value: string[]): void;
}

const props = withDefaults(defineProps<Props>(), {
    accept: '',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 10,
});

const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement>();
const isDragging = ref(false);
const uploadingFiles = ref<UploadingFile[]>([]);
const uploadedFiles = ref<UploadedFile[]>([]);
const errors = ref<string[]>([]);

const tempFileIds = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const onDrop = (event: DragEvent) => {
    event.preventDefault();
    isDragging.value = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
        handleFiles(Array.from(files));
    }
};

const onFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        handleFiles(Array.from(target.files));
        target.value = ''; // リセット
    }
};

const handleFiles = (files: File[]) => {
    errors.value = [];
    
    // ファイル数チェック
    if (uploadedFiles.value.length + files.length > props.maxFiles) {
        errors.value.push(`最大${props.maxFiles}ファイルまでアップロードできます`);
        return;
    }
    
    for (const file of files) {
        // ファイルサイズチェック
        if (file.size > props.maxFileSize) {
            errors.value.push(`${file.name}: ファイルサイズが上限を超えています（${formatFileSize(props.maxFileSize)}）`);
            continue;
        }
        
        // ファイル形式チェック
        if (props.accept && !isFileTypeAllowed(file)) {
            errors.value.push(`${file.name}: サポートされていないファイル形式です`);
            continue;
        }
        
        uploadFile(file);
    }
};

const uploadFile = async (file: File) => {
    const fileId = generateId();
    
    // アップロード中リストに追加
    const uploadingFile: UploadingFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        progress: 0,
    };
    uploadingFiles.value.push(uploadingFile);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        const response = await axios.post('/api/files/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                if (progressEvent.total) {
                    uploadingFile.progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                }
            },
        });
        
        // アップロード完了
        const uploadedFile: UploadedFile = {
            id: fileId,
            name: file.name,
            size: file.size,
            temp_file_id: response.data.data.temp_file_id,
        };
        
        uploadedFiles.value.push(uploadedFile);
        
        // 一時ファイルIDを更新
        const newTempFileIds = [...tempFileIds.value, response.data.data.temp_file_id];
        tempFileIds.value = newTempFileIds;
        
    } catch (error: any) {
        console.error('ファイルアップロードエラー:', error);
        
        if (error.response?.data?.message) {
            errors.value.push(`${file.name}: ${error.response.data.message}`);
        } else {
            errors.value.push(`${file.name}: アップロードに失敗しました`);
        }
    } finally {
        // アップロード中リストから削除
        const index = uploadingFiles.value.findIndex(f => f.id === fileId);
        if (index !== -1) {
            uploadingFiles.value.splice(index, 1);
        }
    }
};

const removeFile = (fileId: string) => {
    const index = uploadedFiles.value.findIndex(f => f.id === fileId);
    if (index !== -1) {
        const file = uploadedFiles.value[index];
        uploadedFiles.value.splice(index, 1);
        
        // 一時ファイルIDからも削除
        if (file.temp_file_id) {
            const tempIndex = tempFileIds.value.indexOf(file.temp_file_id);
            if (tempIndex !== -1) {
                const newTempFileIds = [...tempFileIds.value];
                newTempFileIds.splice(tempIndex, 1);
                tempFileIds.value = newTempFileIds;
            }
        }
    }
};

const isFileTypeAllowed = (file: File): boolean => {
    if (!props.accept) return true;
    
    const acceptedTypes = props.accept.split(',').map(type => type.trim());
    
    return acceptedTypes.some(acceptedType => {
        if (acceptedType.startsWith('.')) {
            // 拡張子チェック
            return file.name.toLowerCase().endsWith(acceptedType.toLowerCase());
        } else if (acceptedType.includes('/')) {
            // MIMEタイプチェック
            return file.type.match(acceptedType);
        }
        return false;
    });
};

const isImageFile = (fileName: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
};

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateId = (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// ドラッグイベントハンドラー
const onDragEnter = () => {
    isDragging.value = true;
};

const onDragLeave = (event: DragEvent) => {
    // 要素の外に出た場合のみドラッグ状態を解除
    if (!event.currentTarget?.contains(event.relatedTarget as Node)) {
        isDragging.value = false;
    }
};
</script>
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FileUploadRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'files' => 'required|array|max:10',
            'files.*' => [
                'required',
                'file',
                'max:51200', // 50MB
                'mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,7z'
            ],
            'knowledge_id' => 'nullable|integer|exists:knowledges,knowledge_id',
            'comment_no' => 'nullable|integer|exists:comments,comment_no',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'files.required' => 'ファイルを選択してください。',
            'files.array' => 'ファイルの形式が正しくありません。',
            'files.max' => 'アップロードできるファイル数は10個までです。',
            'files.*.required' => 'ファイルが選択されていません。',
            'files.*.file' => '有効なファイルを選択してください。',
            'files.*.max' => 'ファイルサイズは50MB以下にしてください。',
            'files.*.mimes' => '対応していないファイル形式です。対応形式: jpg,jpeg,png,gif,webp,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,zip,rar,7z',
            'knowledge_id.exists' => '指定されたナレッジが見つかりません。',
            'comment_no.exists' => '指定されたコメントが見つかりません。',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // ナレッジが指定されている場合のアクセス権限チェック
            if ($this->knowledge_id) {
                $knowledge = \App\Models\Knowledge\Knowledge::find($this->knowledge_id);
                if ($knowledge && !$knowledge->isAccessibleBy(auth()->id())) {
                    $validator->errors()->add('knowledge_id', 'このナレッジへのアクセス権限がありません。');
                }
            }

            // コメントが指定されている場合のアクセス権限チェック
            if ($this->comment_no) {
                $comment = \App\Models\Knowledge\Comment::find($this->comment_no);
                if ($comment) {
                    $knowledge = $comment->knowledge;
                    if ($knowledge && !$knowledge->isAccessibleBy(auth()->id())) {
                        $validator->errors()->add('comment_no', 'このコメントへのアクセス権限がありません。');
                    }
                }
            }

            // ファイルサイズの合計チェック（100MB）
            if ($this->hasFile('files')) {
                $totalSize = 0;
                foreach ($this->file('files') as $file) {
                    if ($file && $file->isValid()) {
                        $totalSize += $file->getSize();
                    }
                }
                
                if ($totalSize > 104857600) { // 100MB
                    $validator->errors()->add('files', 'アップロードファイルの合計サイズは100MB以下にしてください。');
                }
            }
        });
    }
}
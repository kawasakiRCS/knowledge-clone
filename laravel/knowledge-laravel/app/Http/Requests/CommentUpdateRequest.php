<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CommentUpdateRequest extends FormRequest
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
            'comment' => 'required|string|max:10000',
            'anonymous' => 'boolean',
            'temp_file_ids' => 'nullable|array|max:5',
            'temp_file_ids.*' => 'string',
            'remove_file_ids' => 'nullable|array',
            'remove_file_ids.*' => 'integer|exists:knowledge_files,file_no',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'comment.required' => 'コメント内容は必須です。',
            'comment.max' => 'コメントは10,000文字以内で入力してください。',
            'temp_file_ids.max' => '添付ファイルは5個まで選択できます。',
            'remove_file_ids.*.exists' => '削除対象のファイルが見つかりません。',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // anonymous フィールドを boolean に変換
        if ($this->has('anonymous')) {
            $this->merge([
                'anonymous' => $this->boolean('anonymous') ? 1 : 0,
            ]);
        }
    }
}
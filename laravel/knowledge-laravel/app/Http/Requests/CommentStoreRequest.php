<?php

namespace App\Http\Requests;

use App\Models\Knowledge\Knowledge;
use Illuminate\Foundation\Http\FormRequest;

class CommentStoreRequest extends FormRequest
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
            'knowledge_id' => 'required|integer|exists:knowledges,knowledge_id',
            'comment' => 'required|string|max:10000',
            'anonymous' => 'boolean',
            'temp_file_ids' => 'nullable|array|max:5',
            'temp_file_ids.*' => 'string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'knowledge_id.required' => 'ナレッジIDは必須です。',
            'knowledge_id.exists' => '指定されたナレッジが見つかりません。',
            'comment.required' => 'コメント内容は必須です。',
            'comment.max' => 'コメントは10,000文字以内で入力してください。',
            'temp_file_ids.max' => '添付ファイルは5個まで選択できます。',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // ナレッジへのアクセス権限チェック
            if ($this->knowledge_id) {
                $knowledge = Knowledge::find($this->knowledge_id);
                if ($knowledge && !$knowledge->isAccessibleBy(auth()->id())) {
                    $validator->errors()->add('knowledge_id', 'このナレッジにコメントする権限がありません。');
                }
            }

            // 匿名コメントの制限チェック（今後の実装）
            if ($this->boolean('anonymous')) {
                // 匿名コメントが許可されているかチェック
                // 現在は全て許可
            }
        });
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
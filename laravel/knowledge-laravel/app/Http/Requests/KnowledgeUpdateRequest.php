<?php

namespace App\Http\Requests;

use App\Models\Knowledge\Knowledge;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class KnowledgeUpdateRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:1024'],
            'content' => ['required', 'string'],
            'public_flag' => [
                'required',
                'integer',
                Rule::in([
                    Knowledge::PUBLIC_FLAG_PRIVATE,
                    Knowledge::PUBLIC_FLAG_PUBLIC,
                    Knowledge::PUBLIC_FLAG_PROTECT
                ])
            ],
            'type_id' => ['nullable', 'integer', 'exists:template_masters,type_id'],
            'anonymous' => ['boolean'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:100'],
            'allowed_users' => ['nullable', 'array'],
            'allowed_users.*' => ['integer', 'exists:users,user_id'],
            'allowed_groups' => ['nullable', 'array'],
            'allowed_groups.*' => ['integer', 'exists:groups,group_id'],
            'edit_users' => ['nullable', 'array'],
            'edit_users.*' => ['integer', 'exists:users,user_id'],
            'edit_groups' => ['nullable', 'array'],
            'edit_groups.*' => ['integer', 'exists:groups,group_id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'タイトルは必須です。',
            'title.max' => 'タイトルは1024文字以内で入力してください。',
            'content.required' => '内容は必須です。',
            'public_flag.required' => '公開範囲を選択してください。',
            'public_flag.in' => '有効な公開範囲を選択してください。',
            'type_id.exists' => '選択されたテンプレートが見つかりません。',
            'tags.*.max' => 'タグは100文字以内で入力してください。',
            'allowed_users.*.exists' => '選択されたユーザーが見つかりません。',
            'allowed_groups.*.exists' => '選択されたグループが見つかりません。',
            'edit_users.*.exists' => '選択されたユーザーが見つかりません。',
            'edit_groups.*.exists' => '選択されたグループが見つかりません。',
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

        // public_flag が文字列の場合は整数に変換
        if ($this->has('public_flag') && is_string($this->public_flag)) {
            $this->merge([
                'public_flag' => (int) $this->public_flag,
            ]);
        }
    }
}
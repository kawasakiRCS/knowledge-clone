<?php

namespace App\Actions\Fortify;

use App\Models\Web\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'user_key' => [
                'required',
                'string',
                'max:256',
                Rule::unique(User::class),
            ],
            'user_name' => ['required', 'string', 'max:256'],
            'mail_address' => [
                'required',
                'string',
                'email',
                'max:256',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'user_key' => $input['user_key'],
            'user_name' => $input['user_name'],
            'mail_address' => $input['mail_address'],
            'password' => Hash::make($input['password']),
            'auth_ldap' => 0, // ローカルユーザー
            'locale_key' => app()->getLocale(),
        ]);
    }
}
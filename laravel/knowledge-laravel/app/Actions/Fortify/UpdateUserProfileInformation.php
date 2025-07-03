<?php

namespace App\Actions\Fortify;

use App\Models\Web\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\UpdatesUserProfileInformation;

class UpdateUserProfileInformation implements UpdatesUserProfileInformation
{
    /**
     * Validate and update the given user's profile information.
     *
     * @param  array<string, mixed>  $input
     */
    public function update(User $user, array $input): void
    {
        Validator::make($input, [
            'user_key' => [
                'required',
                'string',
                'max:256',
                Rule::unique(User::class)->ignore($user->user_id, 'user_id'),
            ],
            'user_name' => ['required', 'string', 'max:256'],
            'mail_address' => [
                'required',
                'string',
                'email',
                'max:256',
                Rule::unique(User::class)->ignore($user->user_id, 'user_id'),
            ],
            'locale_key' => ['nullable', 'string', 'max:12'],
        ])->validate();

        if ($input['mail_address'] !== $user->mail_address &&
            $user instanceof MustVerifyEmail) {
            $this->updateVerifiedUser($user, $input);
        } else {
            $user->forceFill([
                'user_key' => $input['user_key'],
                'user_name' => $input['user_name'],
                'mail_address' => $input['mail_address'],
                'locale_key' => $input['locale_key'] ?? $user->locale_key,
            ])->save();
        }
    }

    /**
     * Update the given verified user's profile information.
     *
     * @param  array<string, string>  $input
     */
    protected function updateVerifiedUser(User $user, array $input): void
    {
        $user->forceFill([
            'user_key' => $input['user_key'],
            'user_name' => $input['user_name'],
            'mail_address' => $input['mail_address'],
            'locale_key' => $input['locale_key'] ?? $user->locale_key,
            'email_verified_at' => null,
        ])->save();

        $user->sendEmailVerificationNotification();
    }
}
<?php

namespace App\Services;

use App\Models\Knowledge\Comment;
use App\Models\Knowledge\Knowledge;
use App\Models\User;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class CommentNotificationService
{
    /**
     * コメント投稿時の通知を送信
     */
    public function sendCommentNotification(Comment $comment): void
    {
        try {
            $knowledge = $comment->knowledge;
            $commenter = $comment->creator;

            // 通知対象者を取得
            $recipients = $this->getNotificationRecipients($comment, $knowledge);

            foreach ($recipients as $recipient) {
                // 自分自身には通知しない
                if ($recipient->user_id === $commenter->user_id) {
                    continue;
                }

                $this->sendNotificationToUser($recipient, $comment, $knowledge, $commenter);
            }

        } catch (\Exception $e) {
            Log::error('Comment notification failed', [
                'comment_id' => $comment->comment_no,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * 通知対象者を取得
     */
    protected function getNotificationRecipients(Comment $comment, Knowledge $knowledge): array
    {
        $recipients = [];

        // ナレッジの作成者
        if ($knowledge->creator) {
            $recipients[] = $knowledge->creator;
        }

        // 既存のコメント投稿者（重複排除）
        $existingCommenters = $knowledge->comments()
                                      ->with('creator')
                                      ->where('comment_no', '!=', $comment->comment_no)
                                      ->get()
                                      ->pluck('creator')
                                      ->filter()
                                      ->unique('user_id');

        foreach ($existingCommenters as $commenter) {
            $recipients[] = $commenter;
        }

        return array_unique($recipients, SORT_REGULAR);
    }

    /**
     * 個別ユーザーに通知を送信
     */
    protected function sendNotificationToUser(User $recipient, Comment $comment, Knowledge $knowledge, User $commenter): void
    {
        // メール通知（今後の実装）
        $this->sendEmailNotification($recipient, $comment, $knowledge, $commenter);

        // プッシュ通知（今後の実装）
        $this->sendPushNotification($recipient, $comment, $knowledge, $commenter);

        // システム内通知（今後の実装）
        $this->createInAppNotification($recipient, $comment, $knowledge, $commenter);
    }

    /**
     * メール通知を送信
     */
    protected function sendEmailNotification(User $recipient, Comment $comment, Knowledge $knowledge, User $commenter): void
    {
        try {
            // 今後の実装：メール送信
            Log::info('Email notification would be sent', [
                'recipient' => $recipient->mail_address,
                'comment_id' => $comment->comment_no,
                'knowledge_id' => $knowledge->knowledge_id,
                'commenter' => $commenter->user_name,
            ]);

            // Mail::to($recipient->mail_address)->send(new CommentNotificationMail($comment, $knowledge, $commenter));

        } catch (\Exception $e) {
            Log::error('Email notification failed', [
                'recipient' => $recipient->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * プッシュ通知を送信
     */
    protected function sendPushNotification(User $recipient, Comment $comment, Knowledge $knowledge, User $commenter): void
    {
        try {
            // 今後の実装：プッシュ通知
            Log::info('Push notification would be sent', [
                'recipient' => $recipient->user_id,
                'comment_id' => $comment->comment_no,
                'knowledge_id' => $knowledge->knowledge_id,
            ]);

        } catch (\Exception $e) {
            Log::error('Push notification failed', [
                'recipient' => $recipient->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * システム内通知を作成
     */
    protected function createInAppNotification(User $recipient, Comment $comment, Knowledge $knowledge, User $commenter): void
    {
        try {
            // 今後の実装：システム内通知テーブルへの保存
            Log::info('In-app notification would be created', [
                'recipient' => $recipient->user_id,
                'comment_id' => $comment->comment_no,
                'knowledge_id' => $knowledge->knowledge_id,
                'type' => 'comment_posted',
            ]);

        } catch (\Exception $e) {
            Log::error('In-app notification creation failed', [
                'recipient' => $recipient->user_id,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * いいね通知を送信
     */
    public function sendLikeNotification(Comment $comment, User $liker): void
    {
        try {
            $commenter = $comment->creator;

            // 自分自身のコメントにいいねした場合は通知しない
            if ($commenter->user_id === $liker->user_id) {
                return;
            }

            Log::info('Like notification would be sent', [
                'comment_id' => $comment->comment_no,
                'commenter' => $commenter->user_id,
                'liker' => $liker->user_id,
            ]);

            // 今後の実装：具体的な通知送信

        } catch (\Exception $e) {
            Log::error('Like notification failed', [
                'comment_id' => $comment->comment_no,
                'error' => $e->getMessage()
            ]);
        }
    }
}
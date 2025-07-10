<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {

        // account_imagesテーブル
        Schema::create('account_images', function (Blueprint $table) {
            $table->integer('image_id');
            $table->integer('user_id');
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->string('file_binary')->nullable();
            $table->string('extension')->nullable();
            $table->text('content_type')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // activitiesテーブル
        Schema::create('activities', function (Blueprint $table) {
            $table->integer('activity_no');
            $table->integer('user_id');
            $table->string('kind')->nullable();
            $table->string('target')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // commentsテーブル
        Schema::create('comments', function (Blueprint $table) {
            $table->integer('comment_no');
            $table->integer('knowledge_id');
            $table->string('comment')->nullable();
            $table->integer('comment_status')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // draft_item_valuesテーブル
        Schema::create('draft_item_values', function (Blueprint $table) {
            $table->integer('draft_id');
            $table->integer('type_id');
            $table->integer('item_no');
            $table->string('item_value')->nullable();
            $table->integer('item_status')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // draft_knowledgesテーブル
        Schema::create('draft_knowledges', function (Blueprint $table) {
            $table->integer('draft_id');
            $table->integer('knowledge_id');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('public_flag')->nullable();
            $table->string('accesses')->nullable();
            $table->string('editors')->nullable();
            $table->string('tag_names')->nullable();
            $table->integer('type_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // eventsテーブル
        Schema::create('events', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->string('start_date_time')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->string('time_zone')->nullable();
            $table->integer('notify_status')->nullable();
        });

        // groupsテーブル
        Schema::create('groups', function (Blueprint $table) {
            $table->integer('group_id');
            $table->string('group_key')->nullable();
            $table->string('group_name')->nullable();
            $table->string('description')->nullable();
            $table->string('parent_group_key')->nullable();
            $table->string('group_class')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // item_choicesテーブル
        Schema::create('item_choices', function (Blueprint $table) {
            $table->integer('type_id');
            $table->integer('item_no');
            $table->integer('choice_no');
            $table->string('choice_value')->nullable();
            $table->string('choice_label')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_edit_groupsテーブル
        Schema::create('knowledge_edit_groups', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('group_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_edit_usersテーブル
        Schema::create('knowledge_edit_users', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('user_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_filesテーブル
        Schema::create('knowledge_files', function (Blueprint $table) {
            $table->integer('file_no');
            $table->integer('knowledge_id');
            $table->integer('comment_no');
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->string('file_binary')->nullable();
            $table->integer('parse_status')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->integer('draft_id');
        });

        // knowledge_groupsテーブル
        Schema::create('knowledge_groups', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('group_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_historiesテーブル
        Schema::create('knowledge_histories', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('history_no');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('public_flag')->nullable();
            $table->id('tag_ids');
            $table->string('tag_names')->nullable();
            $table->integer('like_count')->nullable();
            $table->integer('comment_count')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // t_jyuminテーブル
        Schema::create('t_jyumin', function (Blueprint $table) {
            $table->string('"KCode"')->nullable();
            $table->string('"Name1"')->nullable();
            $table->string('"Name2"')->nullable();
            $table->integer('tenant_id');
        });

        // knowledge_item_valuesテーブル
        Schema::create('knowledge_item_values', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('type_id');
            $table->integer('item_no');
            $table->string('item_value')->nullable();
            $table->integer('item_status')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_tagsテーブル
        Schema::create('knowledge_tags', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('tag_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledge_usersテーブル
        Schema::create('knowledge_users', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('user_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // knowledgesテーブル
        Schema::create('knowledges', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('public_flag')->nullable();
            $table->id('tag_ids');
            $table->string('tag_names')->nullable();
            $table->integer('like_count')->nullable();
            $table->integer('comment_count')->nullable();
            $table->integer('type_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->integer('notify_status')->nullable();
            $table->integer('view_count')->nullable();
            $table->string('point')->nullable();
        });

        // ldap_configsテーブル
        Schema::create('ldap_configs', function (Blueprint $table) {
            $table->string('system_name')->nullable();
            $table->string('host')->nullable();
            $table->string('port')->nullable();
            $table->string('use_ssl')->nullable();
            $table->string('use_tls')->nullable();
            $table->string('bind_dn')->nullable();
            $table->string('bind_password')->nullable();
            $table->string('salt')->nullable();
            $table->string('base_dn')->nullable();
            $table->string('filter')->nullable();
            $table->id('id_attr');
            $table->string('name_attr')->nullable();
            $table->string('mail_attr')->nullable();
            $table->string('admin_check_filter')->nullable();
            $table->string('auth_type')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->string('description')->nullable();
        });

        // like_commentsテーブル
        Schema::create('like_comments', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->integer('comment_no');
            $table->string('like_class')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // likesテーブル
        Schema::create('likes', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->integer('knowledge_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->string('like_class')->nullable();
        });

        // localesテーブル
        Schema::create('locales', function (Blueprint $table) {
            $table->string('key')->nullable();
            $table->string('language')->nullable();
            $table->integer('country')->nullable();
            $table->string('variant')->nullable();
            $table->string('disp_name')->nullable();
            $table->integer('flag_icon')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // mail_configsテーブル
        Schema::create('mail_configs', function (Blueprint $table) {
            $table->string('system_name')->nullable();
            $table->string('host')->nullable();
            $table->string('port')->nullable();
            $table->string('auth_type')->nullable();
            $table->integer('smtp_id');
            $table->string('smtp_password')->nullable();
            $table->string('salt')->nullable();
            $table->string('from_address')->nullable();
            $table->string('from_name')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // mail_locale_templatesテーブル
        Schema::create('mail_locale_templates', function (Blueprint $table) {
            $table->integer('template_id');
            $table->string('key')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // mail_templatesテーブル
        Schema::create('mail_templates', function (Blueprint $table) {
            $table->integer('template_id');
            $table->string('template_title')->nullable();
            $table->string('description')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // mailsテーブル
        Schema::create('mails', function (Blueprint $table) {
            $table->integer('mail_id');
            $table->integer('status')->nullable();
            $table->string('to_address')->nullable();
            $table->string('to_name')->nullable();
            $table->string('from_address')->nullable();
            $table->string('from_name')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // noticesテーブル
        Schema::create('notices', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->string('title')->nullable();
            $table->string('message')->nullable();
            $table->timestamp('start_datetime')->useCurrent();
            $table->timestamp('end_datetime')->useCurrent();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // notification_statusテーブル
        Schema::create('notification_status', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->integer('target_id');
            $table->integer('user_id');
            $table->integer('status')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // notificationsテーブル
        Schema::create('notifications', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // notify_configsテーブル
        Schema::create('notify_configs', function (Blueprint $table) {
            $table->integer('user_id');
            $table->string('notify_mail')->nullable();
            $table->string('notify_desktop')->nullable();
            $table->string('my_item_comment')->nullable();
            $table->string('my_item_like')->nullable();
            $table->string('my_item_stock')->nullable();
            $table->string('to_item_save')->nullable();
            $table->string('to_item_comment')->nullable();
            $table->string('to_item_ignore_public')->nullable();
            $table->string('stock_item_save')->nullable();
            $table->string('stoke_item_comment')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // notify_queuesテーブル
        Schema::create('notify_queues', function (Blueprint $table) {
            $table->string('hash')->nullable();
            $table->string('type')->nullable();
            $table->id('id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // point_knowledge_historiesテーブル
        Schema::create('point_knowledge_histories', function (Blueprint $table) {
            $table->integer('knowledge_id');
            $table->integer('history_no');
            $table->integer('activity_no');
            $table->string('type')->nullable();
            $table->string('point')->nullable();
            $table->string('before_total')->nullable();
            $table->string('total')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // point_user_historiesテーブル
        Schema::create('point_user_histories', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('history_no');
            $table->integer('activity_no');
            $table->string('type')->nullable();
            $table->string('point')->nullable();
            $table->string('before_total')->nullable();
            $table->string('total')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // rolesテーブル
        Schema::create('roles', function (Blueprint $table) {
            $table->integer('role_id');
            $table->string('role_key')->nullable();
            $table->string('role_name')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // service_configsテーブル
        Schema::create('service_configs', function (Blueprint $table) {
            $table->string('service_name')->nullable();
            $table->string('service_label')->nullable();
            $table->string('service_icon')->nullable();
            $table->string('service_image')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // service_locale_configsテーブル
        Schema::create('service_locale_configs', function (Blueprint $table) {
            $table->string('service_name')->nullable();
            $table->string('locale_key')->nullable();
            $table->string('page_html')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // stock_knowledgesテーブル
        Schema::create('stock_knowledges', function (Blueprint $table) {
            $table->integer('stock_id');
            $table->integer('knowledge_id');
            $table->string('comment')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // stocksテーブル
        Schema::create('stocks', function (Blueprint $table) {
            $table->integer('stock_id');
            $table->string('stock_name')->nullable();
            $table->string('stock_type')->nullable();
            $table->string('description')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // system_configsテーブル
        Schema::create('system_configs', function (Blueprint $table) {
            $table->string('system_name')->nullable();
            $table->string('config_name')->nullable();
            $table->string('config_value')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // systemsテーブル
        Schema::create('systems', function (Blueprint $table) {
            $table->string('system_name')->nullable();
            $table->string('version')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // tagsテーブル
        Schema::create('tags', function (Blueprint $table) {
            $table->integer('tag_id');
            $table->string('tag_name')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // template_itemsテーブル
        Schema::create('template_items', function (Blueprint $table) {
            $table->integer('type_id');
            $table->integer('item_no');
            $table->string('item_name')->nullable();
            $table->string('item_type')->nullable();
            $table->string('description')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->string('initial_value')->nullable();
        });

        // template_mastersテーブル
        Schema::create('template_masters', function (Blueprint $table) {
            $table->integer('type_id');
            $table->string('type_name')->nullable();
            $table->string('type_icon')->nullable();
            $table->string('description')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->string('initial_value')->nullable();
        });

        // user_aliasテーブル
        Schema::create('user_alias', function (Blueprint $table) {
            $table->integer('user_id');
            $table->string('auth_key')->nullable();
            $table->string('alias_key')->nullable();
            $table->string('alias_name')->nullable();
            $table->string('alias_mail')->nullable();
            $table->string('user_info_update')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // user_configsテーブル
        Schema::create('user_configs', function (Blueprint $table) {
            $table->string('system_name')->nullable();
            $table->integer('user_id');
            $table->string('config_name')->nullable();
            $table->string('config_value')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // user_groupsテーブル
        Schema::create('user_groups', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('group_id');
            $table->string('group_role')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // user_notificationsテーブル
        Schema::create('user_notifications', function (Blueprint $table) {
            $table->integer('user_id');
            $table->string('no')->nullable();
            $table->integer('status')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // user_rolesテーブル
        Schema::create('user_roles', function (Blueprint $table) {
            $table->integer('user_id');
            $table->integer('role_id');
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // usersテーブル
        Schema::create('users', function (Blueprint $table) {
            $table->integer('user_id');
            $table->string('user_key')->nullable();
            $table->string('user_name')->nullable();
            $table->string('password')->nullable();
            $table->string('salt')->nullable();
            $table->string('locale_key')->nullable();
            $table->string('mail_address')->nullable();
            $table->string('auth_ldap')->nullable();
            $table->integer('row_id');
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // view_historiesテーブル
        Schema::create('view_histories', function (Blueprint $table) {
            $table->integer('history_no');
            $table->integer('knowledge_id');
            $table->string('view_date_time')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });

        // webhook_configsテーブル
        Schema::create('webhook_configs', function (Blueprint $table) {
            $table->integer('hook_id');
            $table->string('hook')->nullable();
            $table->string('url')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
            $table->string('ignore_proxy')->nullable();
            $table->string('template')->nullable();
        });

        // webhooksテーブル
        Schema::create('webhooks', function (Blueprint $table) {
            $table->integer('webhook_id');
            $table->integer('status')->nullable();
            $table->string('hook')->nullable();
            $table->text('content')->nullable();
            $table->string('insert_user')->nullable();
            $table->timestamp('insert_datetime')->useCurrent();
            $table->string('update_user')->nullable();
            $table->timestamp('update_datetime')->useCurrent();
            $table->integer('delete_flag')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('account_images');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('draft_item_values');
        Schema::dropIfExists('draft_knowledges');
        Schema::dropIfExists('events');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('item_choices');
        Schema::dropIfExists('knowledge_edit_groups');
        Schema::dropIfExists('knowledge_edit_users');
        Schema::dropIfExists('knowledge_files');
        Schema::dropIfExists('knowledge_groups');
        Schema::dropIfExists('knowledge_histories');
        Schema::dropIfExists('t_jyumin');
        Schema::dropIfExists('knowledge_item_values');
        Schema::dropIfExists('knowledge_tags');
        Schema::dropIfExists('knowledge_users');
        Schema::dropIfExists('knowledges');
        Schema::dropIfExists('ldap_configs');
        Schema::dropIfExists('like_comments');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('locales');
        Schema::dropIfExists('mail_configs');
        Schema::dropIfExists('mail_locale_templates');
        Schema::dropIfExists('mail_templates');
        Schema::dropIfExists('mails');
        Schema::dropIfExists('notices');
        Schema::dropIfExists('notification_status');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('notify_configs');
        Schema::dropIfExists('notify_queues');
        Schema::dropIfExists('point_knowledge_histories');
        Schema::dropIfExists('point_user_histories');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('service_configs');
        Schema::dropIfExists('service_locale_configs');
        Schema::dropIfExists('stock_knowledges');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('system_configs');
        Schema::dropIfExists('systems');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('template_items');
        Schema::dropIfExists('template_masters');
        Schema::dropIfExists('user_alias');
        Schema::dropIfExists('user_configs');
        Schema::dropIfExists('user_groups');
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('users');
        Schema::dropIfExists('view_histories');
        Schema::dropIfExists('webhook_configs');
        Schema::dropIfExists('webhooks');
    }
};

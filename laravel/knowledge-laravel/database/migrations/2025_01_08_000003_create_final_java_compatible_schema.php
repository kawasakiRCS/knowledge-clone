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

        // usersテーブル
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('user_id');
            $table->string('user_key')->nullable();
            $table->string('user_name')->nullable();
            $table->text('password')->nullable();
            $table->text('salt')->nullable();
            $table->string('locale_key')->nullable();
            $table->string('mail_address')->nullable();
            $table->integer('auth_ldap')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // groupsテーブル
        Schema::create('groups', function (Blueprint $table) {
            $table->bigIncrements('group_id');
            $table->string('group_key')->nullable();
            $table->string('group_name')->nullable();
            $table->text('description')->nullable();
            $table->string('parent_group_key')->nullable();
            $table->string('group_class')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // rolesテーブル
        Schema::create('roles', function (Blueprint $table) {
            $table->bigIncrements('role_id');
            $table->string('role_key')->nullable();
            $table->string('role_name')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // tagsテーブル
        Schema::create('tags', function (Blueprint $table) {
            $table->bigIncrements('tag_id');
            $table->string('tag_name')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('delete_flag');
        });

        // knowledgesテーブル
        Schema::create('knowledges', function (Blueprint $table) {
            $table->bigIncrements('knowledge_id');
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('public_flag')->nullable();
            $table->string('tag_ids')->nullable();
            $table->string('tag_names')->nullable();
            $table->integer('like_count')->nullable();
            $table->integer('comment_count')->nullable();
            $table->integer('type_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->integer('notify_status')->nullable();
            $table->integer('view_count')->nullable();
            $table->string('point')->nullable();
            $table->index('type_id');
            $table->index('delete_flag');
        });

        // commentsテーブル
        Schema::create('comments', function (Blueprint $table) {
            $table->bigIncrements('comment_no');
            $table->integer('knowledge_id')->nullable();
            $table->text('comment')->nullable();
            $table->integer('comment_status')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('delete_flag');
        });

        // knowledge_filesテーブル
        Schema::create('knowledge_files', function (Blueprint $table) {
            $table->bigIncrements('file_no');
            $table->integer('knowledge_id')->nullable();
            $table->integer('comment_no')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->text('file_binary')->nullable();
            $table->integer('parse_status')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->integer('draft_id')->nullable();
            $table->index('knowledge_id');
            $table->index('delete_flag');
            $table->index('draft_id');
        });

        // knowledge_tagsテーブル
        Schema::create('knowledge_tags', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('tag_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('tag_id');
            $table->index('delete_flag');
            $table->primary(['knowledge_id', 'tag_id']);
        });

        // likesテーブル
        Schema::create('likes', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->integer('knowledge_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->string('like_class')->nullable();
            $table->index('knowledge_id');
            $table->index('delete_flag');
        });

        // like_commentsテーブル
        Schema::create('like_comments', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->integer('comment_no')->nullable();
            $table->string('like_class')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('delete_flag');
        });

        // account_imagesテーブル
        Schema::create('account_images', function (Blueprint $table) {
            $table->bigIncrements('image_id');
            $table->integer('user_id')->nullable();
            $table->string('file_name')->nullable();
            $table->string('file_size')->nullable();
            $table->text('file_binary')->nullable();
            $table->string('extension')->nullable();
            $table->string('content_type')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('delete_flag');
        });

        // activitiesテーブル
        Schema::create('activities', function (Blueprint $table) {
            $table->bigIncrements('activity_no');
            $table->integer('user_id')->nullable();
            $table->string('kind')->nullable();
            $table->string('target')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('delete_flag');
        });

        // draft_item_valuesテーブル
        Schema::create('draft_item_values', function (Blueprint $table) {
            $table->integer('draft_id')->nullable();
            $table->integer('type_id')->nullable();
            $table->integer('item_no')->nullable();
            $table->string('item_value')->nullable();
            $table->integer('item_status')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('draft_id');
            $table->index('type_id');
            $table->index('delete_flag');
        });

        // draft_knowledgesテーブル
        Schema::create('draft_knowledges', function (Blueprint $table) {
            $table->integer('draft_id')->nullable();
            $table->integer('knowledge_id')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('public_flag')->nullable();
            $table->string('accesses')->nullable();
            $table->string('editors')->nullable();
            $table->string('tag_names')->nullable();
            $table->integer('type_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('draft_id');
            $table->index('knowledge_id');
            $table->index('type_id');
            $table->index('delete_flag');
        });

        // eventsテーブル
        Schema::create('events', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->string('start_date_time')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->string('time_zone')->nullable();
            $table->integer('notify_status')->nullable();
            $table->index('knowledge_id');
            $table->index('delete_flag');
        });

        // item_choicesテーブル
        Schema::create('item_choices', function (Blueprint $table) {
            $table->integer('type_id')->nullable();
            $table->integer('item_no')->nullable();
            $table->integer('choice_no')->nullable();
            $table->string('choice_value')->nullable();
            $table->string('choice_label')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('type_id');
            $table->index('delete_flag');
        });

        // knowledge_edit_groupsテーブル
        Schema::create('knowledge_edit_groups', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('group_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('group_id');
            $table->index('delete_flag');
            $table->primary(['knowledge_id', 'group_id']);
        });

        // knowledge_edit_usersテーブル
        Schema::create('knowledge_edit_users', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('user_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('user_id');
            $table->index('delete_flag');
            $table->primary(['knowledge_id', 'user_id']);
        });

        // knowledge_groupsテーブル
        Schema::create('knowledge_groups', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('group_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('group_id');
            $table->index('delete_flag');
            $table->primary(['knowledge_id', 'group_id']);
        });

        // knowledge_historiesテーブル
        Schema::create('knowledge_histories', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('history_no')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('public_flag')->nullable();
            $table->string('tag_ids')->nullable();
            $table->string('tag_names')->nullable();
            $table->integer('like_count')->nullable();
            $table->integer('comment_count')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('delete_flag');
        });

        // t_jyuminテーブル
        Schema::create('t_jyumin', function (Blueprint $table) {
            $table->string('"KCode"')->nullable();
            $table->string('"Name1"')->nullable();
            $table->string('"Name2"')->nullable();
            $table->integer('tenant_id')->nullable();
            $table->index('tenant_id');
        });

        // knowledge_item_valuesテーブル
        Schema::create('knowledge_item_values', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('type_id')->nullable();
            $table->integer('item_no')->nullable();
            $table->string('item_value')->nullable();
            $table->integer('item_status')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('type_id');
            $table->index('delete_flag');
        });

        // knowledge_usersテーブル
        Schema::create('knowledge_users', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('user_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('user_id');
            $table->index('delete_flag');
            $table->primary(['knowledge_id', 'user_id']);
        });

        // ldap_configsテーブル
        Schema::create('ldap_configs', function (Blueprint $table) {
            $table->string('system_name')->primary();
            $table->string('host')->nullable();
            $table->string('port')->nullable();
            $table->string('use_ssl')->nullable();
            $table->string('use_tls')->nullable();
            $table->string('bind_dn')->nullable();
            $table->string('bind_password')->nullable();
            $table->text('salt')->nullable();
            $table->string('base_dn')->nullable();
            $table->string('filter')->nullable();
            $table->string('id_attr')->nullable();
            $table->string('name_attr')->nullable();
            $table->string('mail_attr')->nullable();
            $table->string('admin_check_filter')->nullable();
            $table->string('auth_type')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->text('description')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // localesテーブル
        Schema::create('locales', function (Blueprint $table) {
            $table->string('key')->nullable();
            $table->string('language')->nullable();
            $table->integer('country')->nullable();
            $table->string('variant')->nullable();
            $table->string('disp_name')->nullable();
            $table->integer('flag_icon')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // mail_configsテーブル
        Schema::create('mail_configs', function (Blueprint $table) {
            $table->string('system_name')->primary();
            $table->string('host')->nullable();
            $table->string('port')->nullable();
            $table->string('auth_type')->nullable();
            $table->integer('smtp_id')->nullable();
            $table->string('smtp_password')->nullable();
            $table->text('salt')->nullable();
            $table->string('from_address')->nullable();
            $table->string('from_name')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('smtp_id');
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // mail_locale_templatesテーブル
        Schema::create('mail_locale_templates', function (Blueprint $table) {
            $table->string('template_id')->primary();
            $table->string('key')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('delete_flag');
        });

        // mail_templatesテーブル
        Schema::create('mail_templates', function (Blueprint $table) {
            $table->integer('template_id')->nullable();
            $table->string('template_title')->nullable();
            $table->text('description')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('template_id');
            $table->index('delete_flag');
        });

        // mailsテーブル
        Schema::create('mails', function (Blueprint $table) {
            $table->string('mail_id')->primary();
            $table->integer('status')->nullable();
            $table->string('to_address')->nullable();
            $table->string('to_name')->nullable();
            $table->string('from_address')->nullable();
            $table->string('from_name')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // noticesテーブル
        Schema::create('notices', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->string('title')->nullable();
            $table->string('message')->nullable();
            $table->timestamp('start_datetime');
            $table->timestamp('end_datetime');
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // notification_statusテーブル
        Schema::create('notification_status', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->integer('target_id')->nullable();
            $table->integer('user_id')->nullable();
            $table->integer('status')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('target_id');
            $table->index('user_id');
            $table->index('delete_flag');
        });

        // notificationsテーブル
        Schema::create('notifications', function (Blueprint $table) {
            $table->string('no')->nullable();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // notify_configsテーブル
        Schema::create('notify_configs', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
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
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('delete_flag');
        });

        // notify_queuesテーブル
        Schema::create('notify_queues', function (Blueprint $table) {
            $table->string('hash')->primary();
            $table->string('type')->nullable();
            $table->string('id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('delete_flag');
        });

        // point_knowledge_historiesテーブル
        Schema::create('point_knowledge_histories', function (Blueprint $table) {
            $table->integer('knowledge_id')->nullable();
            $table->integer('history_no')->nullable();
            $table->integer('activity_no')->nullable();
            $table->string('type')->nullable();
            $table->string('point')->nullable();
            $table->string('before_total')->nullable();
            $table->string('total')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('delete_flag');
        });

        // point_user_historiesテーブル
        Schema::create('point_user_histories', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
            $table->integer('history_no')->nullable();
            $table->integer('activity_no')->nullable();
            $table->string('type')->nullable();
            $table->string('point')->nullable();
            $table->string('before_total')->nullable();
            $table->string('total')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('delete_flag');
        });

        // service_configsテーブル
        Schema::create('service_configs', function (Blueprint $table) {
            $table->string('service_name')->primary();
            $table->string('service_label')->nullable();
            $table->string('service_icon')->nullable();
            $table->string('service_image')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('delete_flag');
        });

        // service_locale_configsテーブル
        Schema::create('service_locale_configs', function (Blueprint $table) {
            $table->string('service_name')->nullable();
            $table->string('locale_key')->nullable();
            $table->string('page_html')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('delete_flag');
        });

        // stock_knowledgesテーブル
        Schema::create('stock_knowledges', function (Blueprint $table) {
            $table->integer('stock_id')->nullable();
            $table->integer('knowledge_id')->nullable();
            $table->text('comment')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('stock_id');
            $table->index('knowledge_id');
            $table->index('delete_flag');
        });

        // stocksテーブル
        Schema::create('stocks', function (Blueprint $table) {
            $table->integer('stock_id')->nullable();
            $table->string('stock_name')->nullable();
            $table->string('stock_type')->nullable();
            $table->text('description')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('stock_id');
            $table->index('delete_flag');
        });

        // system_configsテーブル
        Schema::create('system_configs', function (Blueprint $table) {
            $table->string('system_name')->primary();
            $table->string('config_name')->nullable();
            $table->string('config_value')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // systemsテーブル
        Schema::create('systems', function (Blueprint $table) {
            $table->string('system_name')->primary();
            $table->string('version')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // template_itemsテーブル
        Schema::create('template_items', function (Blueprint $table) {
            $table->integer('type_id')->nullable();
            $table->bigIncrements('item_no');
            $table->string('item_name')->nullable();
            $table->string('item_type')->nullable();
            $table->text('description')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->string('initial_value')->nullable();
            $table->index('type_id');
            $table->index('delete_flag');
        });

        // template_mastersテーブル
        Schema::create('template_masters', function (Blueprint $table) {
            $table->bigIncrements('type_id');
            $table->string('type_name')->nullable();
            $table->string('type_icon')->nullable();
            $table->text('description')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->string('initial_value')->nullable();
            $table->index('delete_flag');
        });

        // user_aliasテーブル
        Schema::create('user_alias', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
            $table->string('auth_key')->nullable();
            $table->string('alias_key')->nullable();
            $table->string('alias_name')->nullable();
            $table->string('alias_mail')->nullable();
            $table->string('user_info_update')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // user_configsテーブル
        Schema::create('user_configs', function (Blueprint $table) {
            $table->string('system_name')->primary();
            $table->integer('user_id')->nullable();
            $table->string('config_name')->nullable();
            $table->string('config_value')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // user_groupsテーブル
        Schema::create('user_groups', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
            $table->integer('group_id')->nullable();
            $table->string('group_role')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('group_id');
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // user_notificationsテーブル
        Schema::create('user_notifications', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
            $table->string('no')->nullable();
            $table->integer('status')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // user_rolesテーブル
        Schema::create('user_roles', function (Blueprint $table) {
            $table->integer('user_id')->nullable();
            $table->integer('role_id')->nullable();
            $table->string('row_id')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('user_id');
            $table->index('role_id');
            $table->index('row_id');
            $table->index('delete_flag');
        });

        // view_historiesテーブル
        Schema::create('view_histories', function (Blueprint $table) {
            $table->integer('history_no')->nullable();
            $table->integer('knowledge_id')->nullable();
            $table->string('view_date_time')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('knowledge_id');
            $table->index('delete_flag');
        });

        // webhook_configsテーブル
        Schema::create('webhook_configs', function (Blueprint $table) {
            $table->integer('hook_id')->nullable();
            $table->string('hook')->nullable();
            $table->string('url')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->string('ignore_proxy')->nullable();
            $table->string('template')->nullable();
            $table->index('hook_id');
            $table->index('delete_flag');
        });

        // webhooksテーブル
        Schema::create('webhooks', function (Blueprint $table) {
            $table->string('webhook_id')->primary();
            $table->integer('status')->nullable();
            $table->string('hook')->nullable();
            $table->text('content')->nullable();
            $table->integer('insert_user');
            $table->timestamp('insert_datetime');
            $table->integer('update_user');
            $table->timestamp('update_datetime');
            $table->integer('delete_flag')->nullable();
            $table->index('delete_flag');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhooks');
        Schema::dropIfExists('webhook_configs');
        Schema::dropIfExists('view_histories');
        Schema::dropIfExists('user_roles');
        Schema::dropIfExists('user_notifications');
        Schema::dropIfExists('user_groups');
        Schema::dropIfExists('user_configs');
        Schema::dropIfExists('user_alias');
        Schema::dropIfExists('template_masters');
        Schema::dropIfExists('template_items');
        Schema::dropIfExists('systems');
        Schema::dropIfExists('system_configs');
        Schema::dropIfExists('stocks');
        Schema::dropIfExists('stock_knowledges');
        Schema::dropIfExists('service_locale_configs');
        Schema::dropIfExists('service_configs');
        Schema::dropIfExists('point_user_histories');
        Schema::dropIfExists('point_knowledge_histories');
        Schema::dropIfExists('notify_queues');
        Schema::dropIfExists('notify_configs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('notification_status');
        Schema::dropIfExists('notices');
        Schema::dropIfExists('mails');
        Schema::dropIfExists('mail_templates');
        Schema::dropIfExists('mail_locale_templates');
        Schema::dropIfExists('mail_configs');
        Schema::dropIfExists('locales');
        Schema::dropIfExists('ldap_configs');
        Schema::dropIfExists('knowledge_users');
        Schema::dropIfExists('knowledge_item_values');
        Schema::dropIfExists('t_jyumin');
        Schema::dropIfExists('knowledge_histories');
        Schema::dropIfExists('knowledge_groups');
        Schema::dropIfExists('knowledge_edit_users');
        Schema::dropIfExists('knowledge_edit_groups');
        Schema::dropIfExists('item_choices');
        Schema::dropIfExists('events');
        Schema::dropIfExists('draft_knowledges');
        Schema::dropIfExists('draft_item_values');
        Schema::dropIfExists('activities');
        Schema::dropIfExists('account_images');
        Schema::dropIfExists('like_comments');
        Schema::dropIfExists('likes');
        Schema::dropIfExists('knowledge_tags');
        Schema::dropIfExists('knowledge_files');
        Schema::dropIfExists('comments');
        Schema::dropIfExists('knowledges');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('groups');
        Schema::dropIfExists('users');
    }
};

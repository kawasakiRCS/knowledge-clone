--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: access_logs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE access_logs (
    no bigint NOT NULL,
    path character varying(1024),
    ip_address character varying(64),
    user_agent character varying(1024),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE access_logs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE access_logs IS 'ACCESS_LOGS';


--
-- Name: COLUMN access_logs.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.no IS 'NO';


--
-- Name: COLUMN access_logs.path; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.path IS 'PATH';


--
-- Name: COLUMN access_logs.ip_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.ip_address IS 'IP_ADDRESS';


--
-- Name: COLUMN access_logs.user_agent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.user_agent IS 'USER_AGENT';


--
-- Name: COLUMN access_logs.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.row_id IS '行ID';


--
-- Name: COLUMN access_logs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN access_logs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.insert_datetime IS '登録日時';


--
-- Name: COLUMN access_logs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.update_user IS '更新ユーザ';


--
-- Name: COLUMN access_logs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.update_datetime IS '更新日時';


--
-- Name: COLUMN access_logs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN access_logs.delete_flag IS '削除フラグ';


--
-- Name: access_logs_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE access_logs_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: access_logs_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE access_logs_no_seq OWNED BY access_logs.no;


--
-- Name: account_images; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE account_images (
    image_id bigint NOT NULL,
    user_id integer,
    file_name character varying(256),
    file_size double precision,
    file_binary bytea,
    extension character varying(256),
    content_type character varying(256),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE account_images; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE account_images IS 'アカウントの画像';


--
-- Name: COLUMN account_images.image_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.image_id IS 'IMAGE_ID';


--
-- Name: COLUMN account_images.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.user_id IS 'ユーザID';


--
-- Name: COLUMN account_images.file_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.file_name IS 'ファイル名';


--
-- Name: COLUMN account_images.file_size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.file_size IS 'ファイルサイズ';


--
-- Name: COLUMN account_images.file_binary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.file_binary IS 'バイナリ';


--
-- Name: COLUMN account_images.extension; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.extension IS '拡張子';


--
-- Name: COLUMN account_images.content_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.content_type IS 'CONTENT_TYPE';


--
-- Name: COLUMN account_images.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.insert_user IS '登録ユーザ';


--
-- Name: COLUMN account_images.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.insert_datetime IS '登録日時';


--
-- Name: COLUMN account_images.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.update_user IS '更新ユーザ';


--
-- Name: COLUMN account_images.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.update_datetime IS '更新日時';


--
-- Name: COLUMN account_images.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN account_images.delete_flag IS '削除フラグ';


--
-- Name: account_images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE account_images_image_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: account_images_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE account_images_image_id_seq OWNED BY account_images.image_id;


--
-- Name: activities; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE activities (
    activity_no bigint NOT NULL,
    user_id integer NOT NULL,
    kind integer NOT NULL,
    target character varying(64) NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE activities; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE activities IS 'アクティビティ';


--
-- Name: COLUMN activities.activity_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.activity_no IS 'アクティビティ番号';


--
-- Name: COLUMN activities.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.user_id IS 'イベントをおこしたユーザ';


--
-- Name: COLUMN activities.kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.kind IS 'アクティビティの種類';


--
-- Name: COLUMN activities.target; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.target IS 'ターゲットID';


--
-- Name: COLUMN activities.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.insert_user IS '登録ユーザ';


--
-- Name: COLUMN activities.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.insert_datetime IS '登録日時';


--
-- Name: COLUMN activities.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.update_user IS '更新ユーザ';


--
-- Name: COLUMN activities.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.update_datetime IS '更新日時';


--
-- Name: COLUMN activities.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN activities.delete_flag IS '削除フラグ';


--
-- Name: activities_activity_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE activities_activity_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activities_activity_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE activities_activity_no_seq OWNED BY activities.activity_no;


--
-- Name: badges; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE badges (
    no integer NOT NULL,
    name character varying(128) NOT NULL,
    display_text character varying(32) NOT NULL,
    description text,
    image character varying(64),
    point integer,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE badges; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE badges IS '称号';


--
-- Name: COLUMN badges.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.no IS '番号';


--
-- Name: COLUMN badges.name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.name IS '名称';


--
-- Name: COLUMN badges.display_text; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.display_text IS '表示名';


--
-- Name: COLUMN badges.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.description IS '説明';


--
-- Name: COLUMN badges.image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.image IS '画像';


--
-- Name: COLUMN badges.point; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.point IS '獲得ポイント';


--
-- Name: COLUMN badges.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.insert_user IS '登録ユーザ';


--
-- Name: COLUMN badges.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.insert_datetime IS '登録日時';


--
-- Name: COLUMN badges.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.update_user IS '更新ユーザ';


--
-- Name: COLUMN badges.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.update_datetime IS '更新日時';


--
-- Name: COLUMN badges.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN badges.delete_flag IS '削除フラグ';


--
-- Name: badges_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE badges_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: badges_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE badges_no_seq OWNED BY badges.no;


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE comments (
    comment_no bigint NOT NULL,
    knowledge_id bigint NOT NULL,
    comment text,
    comment_status integer,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE comments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE comments IS 'コメント';


--
-- Name: COLUMN comments.comment_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.comment_no IS 'コメント番号';


--
-- Name: COLUMN comments.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN comments.comment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.comment IS 'コメント';


--
-- Name: COLUMN comments.comment_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.comment_status IS 'ステータス';


--
-- Name: COLUMN comments.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.insert_user IS '登録ユーザ';


--
-- Name: COLUMN comments.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.insert_datetime IS '登録日時';


--
-- Name: COLUMN comments.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.update_user IS '更新ユーザ';


--
-- Name: COLUMN comments.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.update_datetime IS '更新日時';


--
-- Name: COLUMN comments.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN comments.delete_flag IS '削除フラグ';


--
-- Name: comments_comment_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE comments_comment_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: comments_comment_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE comments_comment_no_seq OWNED BY comments.comment_no;


--
-- Name: confirm_mail_changes; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE confirm_mail_changes (
    id character varying(256) NOT NULL,
    user_id integer NOT NULL,
    mail_address character varying(256) NOT NULL,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE confirm_mail_changes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE confirm_mail_changes IS 'メールアドレス変更確認';


--
-- Name: COLUMN confirm_mail_changes.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.id IS 'リセット用ID';


--
-- Name: COLUMN confirm_mail_changes.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.user_id IS 'ユーザID';


--
-- Name: COLUMN confirm_mail_changes.mail_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.mail_address IS 'メールアドレス';


--
-- Name: COLUMN confirm_mail_changes.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.row_id IS '行ID';


--
-- Name: COLUMN confirm_mail_changes.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.insert_user IS '登録ユーザ';


--
-- Name: COLUMN confirm_mail_changes.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.insert_datetime IS '登録日時';


--
-- Name: COLUMN confirm_mail_changes.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.update_user IS '更新ユーザ';


--
-- Name: COLUMN confirm_mail_changes.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.update_datetime IS '更新日時';


--
-- Name: COLUMN confirm_mail_changes.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN confirm_mail_changes.delete_flag IS '削除フラグ';


--
-- Name: draft_item_values; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE draft_item_values (
    draft_id bigint NOT NULL,
    type_id integer NOT NULL,
    item_no integer NOT NULL,
    item_value text,
    item_status integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE draft_item_values; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE draft_item_values IS 'ナレッジの項目値';


--
-- Name: COLUMN draft_item_values.draft_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.draft_id IS '下書きID';


--
-- Name: COLUMN draft_item_values.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.type_id IS 'テンプレートの種類ID';


--
-- Name: COLUMN draft_item_values.item_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.item_no IS '項目NO';


--
-- Name: COLUMN draft_item_values.item_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.item_value IS '項目値';


--
-- Name: COLUMN draft_item_values.item_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.item_status IS 'ステータス';


--
-- Name: COLUMN draft_item_values.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.insert_user IS '登録ユーザ';


--
-- Name: COLUMN draft_item_values.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.insert_datetime IS '登録日時';


--
-- Name: COLUMN draft_item_values.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.update_user IS '更新ユーザ';


--
-- Name: COLUMN draft_item_values.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.update_datetime IS '更新日時';


--
-- Name: COLUMN draft_item_values.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_item_values.delete_flag IS '削除フラグ';


--
-- Name: draft_knowledges; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE draft_knowledges (
    draft_id bigint NOT NULL,
    knowledge_id bigint,
    title character varying(1024) NOT NULL,
    content text,
    public_flag integer,
    accesses text,
    editors text,
    tag_names text,
    type_id integer,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE draft_knowledges; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE draft_knowledges IS 'ナレッジの下書き';


--
-- Name: COLUMN draft_knowledges.draft_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.draft_id IS '下書きID';


--
-- Name: COLUMN draft_knowledges.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN draft_knowledges.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.title IS 'タイトル';


--
-- Name: COLUMN draft_knowledges.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.content IS '内容';


--
-- Name: COLUMN draft_knowledges.public_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.public_flag IS '公開区分';


--
-- Name: COLUMN draft_knowledges.accesses; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.accesses IS '公開対象';


--
-- Name: COLUMN draft_knowledges.editors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.editors IS '共同編集対象';


--
-- Name: COLUMN draft_knowledges.tag_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.tag_names IS 'タグ名称一覧';


--
-- Name: COLUMN draft_knowledges.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.type_id IS 'テンプレートの種類ID';


--
-- Name: COLUMN draft_knowledges.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.insert_user IS '登録ユーザ';


--
-- Name: COLUMN draft_knowledges.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.insert_datetime IS '登録日時';


--
-- Name: COLUMN draft_knowledges.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.update_user IS '更新ユーザ';


--
-- Name: COLUMN draft_knowledges.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.update_datetime IS '更新日時';


--
-- Name: COLUMN draft_knowledges.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN draft_knowledges.delete_flag IS '削除フラグ';


--
-- Name: draft_knowledges_draft_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE draft_knowledges_draft_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: draft_knowledges_draft_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE draft_knowledges_draft_id_seq OWNED BY draft_knowledges.draft_id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE events (
    knowledge_id bigint NOT NULL,
    start_date_time timestamp without time zone NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    time_zone character varying(64),
    notify_status integer
);


--
-- Name: TABLE events; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE events IS 'イベント';


--
-- Name: COLUMN events.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN events.start_date_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.start_date_time IS '開催日     UTC';


--
-- Name: COLUMN events.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.insert_user IS '登録ユーザ';


--
-- Name: COLUMN events.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.insert_datetime IS '登録日時';


--
-- Name: COLUMN events.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.update_user IS '更新ユーザ';


--
-- Name: COLUMN events.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.update_datetime IS '更新日時';


--
-- Name: COLUMN events.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.delete_flag IS '削除フラグ';


--
-- Name: COLUMN events.time_zone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.time_zone IS 'タイムゾーン';


--
-- Name: COLUMN events.notify_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN events.notify_status IS '通知ステータス';


--
-- Name: functions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE functions (
    function_key character varying(64) NOT NULL,
    description character varying(256),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE functions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE functions IS '機能';


--
-- Name: COLUMN functions.function_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.function_key IS '機能';


--
-- Name: COLUMN functions.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.description IS '機能の説明';


--
-- Name: COLUMN functions.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.row_id IS '行ID';


--
-- Name: COLUMN functions.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.insert_user IS '登録ユーザ';


--
-- Name: COLUMN functions.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.insert_datetime IS '登録日時';


--
-- Name: COLUMN functions.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.update_user IS '更新ユーザ';


--
-- Name: COLUMN functions.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.update_datetime IS '更新日時';


--
-- Name: COLUMN functions.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN functions.delete_flag IS '削除フラグ';


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE groups (
    group_id integer NOT NULL,
    group_key character varying(68) NOT NULL,
    group_name character varying(128) NOT NULL,
    description character varying(256),
    parent_group_key character varying(128),
    group_class integer,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE groups IS 'グループ';


--
-- Name: COLUMN groups.group_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.group_id IS 'グループID';


--
-- Name: COLUMN groups.group_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.group_key IS 'グループKEY';


--
-- Name: COLUMN groups.group_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.group_name IS 'グループ名称';


--
-- Name: COLUMN groups.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.description IS '説明';


--
-- Name: COLUMN groups.parent_group_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.parent_group_key IS '親グループKKEY';


--
-- Name: COLUMN groups.group_class; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.group_class IS 'グループの区分';


--
-- Name: COLUMN groups.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.row_id IS '行ID';


--
-- Name: COLUMN groups.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.insert_user IS '登録ユーザ';


--
-- Name: COLUMN groups.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.insert_datetime IS '登録日時';


--
-- Name: COLUMN groups.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.update_user IS '更新ユーザ';


--
-- Name: COLUMN groups.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.update_datetime IS '更新日時';


--
-- Name: COLUMN groups.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN groups.delete_flag IS '削除フラグ';


--
-- Name: groups_group_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE groups_group_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE 0
    NO MAXVALUE
    CACHE 1;


--
-- Name: groups_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE groups_group_id_seq OWNED BY groups.group_id;


--
-- Name: hash_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE hash_configs (
    system_name character varying(64) NOT NULL,
    hash_iterations integer NOT NULL,
    hash_size_bits integer NOT NULL,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE hash_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE hash_configs IS 'ハッシュ生成の設定';


--
-- Name: COLUMN hash_configs.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.system_name IS 'システム名';


--
-- Name: COLUMN hash_configs.hash_iterations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.hash_iterations IS 'HASH_ITERATIONS';


--
-- Name: COLUMN hash_configs.hash_size_bits; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.hash_size_bits IS 'HASH_SIZE_BITS';


--
-- Name: COLUMN hash_configs.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.row_id IS '行ID';


--
-- Name: COLUMN hash_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN hash_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN hash_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN hash_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN hash_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN hash_configs.delete_flag IS '削除フラグ';


--
-- Name: item_choices; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE item_choices (
    type_id integer NOT NULL,
    item_no integer NOT NULL,
    choice_no integer NOT NULL,
    choice_value character varying(256) NOT NULL,
    choice_label character varying(256) NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE item_choices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE item_choices IS '選択肢の値';


--
-- Name: COLUMN item_choices.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.type_id IS 'テンプレートの種類ID';


--
-- Name: COLUMN item_choices.item_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.item_no IS '項目NO';


--
-- Name: COLUMN item_choices.choice_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.choice_no IS '選択肢番号';


--
-- Name: COLUMN item_choices.choice_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.choice_value IS '選択肢値';


--
-- Name: COLUMN item_choices.choice_label; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.choice_label IS '選択肢ラベル';


--
-- Name: COLUMN item_choices.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.insert_user IS '登録ユーザ';


--
-- Name: COLUMN item_choices.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.insert_datetime IS '登録日時';


--
-- Name: COLUMN item_choices.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.update_user IS '更新ユーザ';


--
-- Name: COLUMN item_choices.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.update_datetime IS '更新日時';


--
-- Name: COLUMN item_choices.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN item_choices.delete_flag IS '削除フラグ';


--
-- Name: knowledge_edit_groups; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_edit_groups (
    knowledge_id bigint NOT NULL,
    group_id integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE knowledge_edit_groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_edit_groups IS '編集可能なグループ';


--
-- Name: COLUMN knowledge_edit_groups.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_groups.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_edit_groups.group_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_groups.group_id IS 'GROUP_ID';


--
-- Name: COLUMN knowledge_edit_groups.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_groups.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_edit_groups.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_groups.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_edit_groups.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_groups.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_edit_groups.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_groups.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_edit_groups.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_groups.delete_flag IS '削除フラグ';


--
-- Name: knowledge_edit_users; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_edit_users (
    knowledge_id bigint NOT NULL,
    user_id integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE knowledge_edit_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_edit_users IS '編集可能なユーザ';


--
-- Name: COLUMN knowledge_edit_users.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_users.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_edit_users.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_users.user_id IS 'USER_ID';


--
-- Name: COLUMN knowledge_edit_users.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_users.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_edit_users.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_users.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_edit_users.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_users.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_edit_users.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_users.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_edit_users.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_edit_users.delete_flag IS '削除フラグ';


--
-- Name: knowledge_files; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_files (
    file_no bigint NOT NULL,
    knowledge_id bigint,
    comment_no bigint,
    file_name character varying(256),
    file_size double precision,
    file_binary bytea,
    parse_status integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    draft_id bigint
);


--
-- Name: TABLE knowledge_files; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_files IS '添付ファイル';


--
-- Name: COLUMN knowledge_files.file_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.file_no IS '添付ファイル番号';


--
-- Name: COLUMN knowledge_files.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_files.comment_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.comment_no IS 'コメント番号';


--
-- Name: COLUMN knowledge_files.file_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.file_name IS 'ファイル名';


--
-- Name: COLUMN knowledge_files.file_size; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.file_size IS 'ファイルサイズ';


--
-- Name: COLUMN knowledge_files.file_binary; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.file_binary IS 'バイナリ';


--
-- Name: COLUMN knowledge_files.parse_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.parse_status IS 'パース結果';


--
-- Name: COLUMN knowledge_files.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_files.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_files.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_files.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_files.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.delete_flag IS '削除フラグ';


--
-- Name: COLUMN knowledge_files.draft_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_files.draft_id IS '下書きID';


--
-- Name: knowledge_files_file_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE knowledge_files_file_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knowledge_files_file_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE knowledge_files_file_no_seq OWNED BY knowledge_files.file_no;


--
-- Name: knowledge_groups; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_groups (
    knowledge_id bigint NOT NULL,
    group_id integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE knowledge_groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_groups IS 'アクセス可能なグループ';


--
-- Name: COLUMN knowledge_groups.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_groups.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_groups.group_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_groups.group_id IS 'GROUP_ID';


--
-- Name: COLUMN knowledge_groups.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_groups.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_groups.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_groups.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_groups.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_groups.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_groups.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_groups.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_groups.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_groups.delete_flag IS '削除フラグ';


--
-- Name: knowledge_histories; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_histories (
    knowledge_id bigint NOT NULL,
    history_no integer NOT NULL,
    title character varying(1024) NOT NULL,
    content text,
    public_flag integer,
    tag_ids character varying(1024),
    tag_names text,
    like_count bigint,
    comment_count integer,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE knowledge_histories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_histories IS 'ナレッジ更新履歴';


--
-- Name: COLUMN knowledge_histories.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_histories.history_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.history_no IS '履歴番号';


--
-- Name: COLUMN knowledge_histories.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.title IS 'タイトル';


--
-- Name: COLUMN knowledge_histories.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.content IS '内容';


--
-- Name: COLUMN knowledge_histories.public_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.public_flag IS '公開区分';


--
-- Name: COLUMN knowledge_histories.tag_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.tag_ids IS 'タグID一覧';


--
-- Name: COLUMN knowledge_histories.tag_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.tag_names IS 'タグ名称一覧';


--
-- Name: COLUMN knowledge_histories.like_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.like_count IS 'いいね件数';


--
-- Name: COLUMN knowledge_histories.comment_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.comment_count IS 'コメント件数';


--
-- Name: COLUMN knowledge_histories.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_histories.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_histories.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_histories.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_histories.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_histories.delete_flag IS '削除フラグ';


--
-- Name: knowledge_item_values; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_item_values (
    knowledge_id bigint NOT NULL,
    type_id integer NOT NULL,
    item_no integer NOT NULL,
    item_value text,
    item_status integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE knowledge_item_values; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_item_values IS 'ナレッジの項目値';


--
-- Name: COLUMN knowledge_item_values.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_item_values.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.type_id IS 'テンプレートの種類ID';


--
-- Name: COLUMN knowledge_item_values.item_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.item_no IS '項目NO';


--
-- Name: COLUMN knowledge_item_values.item_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.item_value IS '項目値';


--
-- Name: COLUMN knowledge_item_values.item_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.item_status IS 'ステータス';


--
-- Name: COLUMN knowledge_item_values.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_item_values.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_item_values.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_item_values.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_item_values.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_item_values.delete_flag IS '削除フラグ';


--
-- Name: knowledge_tags; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_tags (
    knowledge_id bigint NOT NULL,
    tag_id integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE knowledge_tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_tags IS 'ナレッジが持つタグ';


--
-- Name: COLUMN knowledge_tags.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_tags.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_tags.tag_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_tags.tag_id IS 'タグ_ID';


--
-- Name: COLUMN knowledge_tags.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_tags.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_tags.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_tags.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_tags.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_tags.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_tags.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_tags.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_tags.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_tags.delete_flag IS '削除フラグ';


--
-- Name: knowledge_users; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledge_users (
    knowledge_id bigint NOT NULL,
    user_id integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE knowledge_users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledge_users IS 'アクセス可能なユーザ';


--
-- Name: COLUMN knowledge_users.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_users.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledge_users.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_users.user_id IS 'USER_ID';


--
-- Name: COLUMN knowledge_users.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_users.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledge_users.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_users.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledge_users.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_users.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledge_users.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_users.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledge_users.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledge_users.delete_flag IS '削除フラグ';


--
-- Name: knowledges; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE knowledges (
    knowledge_id bigint NOT NULL,
    title character varying(1024) NOT NULL,
    content text,
    public_flag integer,
    tag_ids character varying(1024),
    tag_names text,
    like_count bigint,
    comment_count integer,
    type_id integer,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    notify_status integer,
    view_count bigint,
    point integer DEFAULT 0 NOT NULL
);


--
-- Name: TABLE knowledges; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE knowledges IS 'ナレッジ';


--
-- Name: COLUMN knowledges.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN knowledges.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.title IS 'タイトル';


--
-- Name: COLUMN knowledges.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.content IS '内容';


--
-- Name: COLUMN knowledges.public_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.public_flag IS '公開区分';


--
-- Name: COLUMN knowledges.tag_ids; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.tag_ids IS 'タグID一覧';


--
-- Name: COLUMN knowledges.tag_names; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.tag_names IS 'タグ名称一覧';


--
-- Name: COLUMN knowledges.like_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.like_count IS 'いいね件数';


--
-- Name: COLUMN knowledges.comment_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.comment_count IS 'コメント件数';


--
-- Name: COLUMN knowledges.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.type_id IS 'テンプレートの種類ID';


--
-- Name: COLUMN knowledges.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.insert_user IS '登録ユーザ';


--
-- Name: COLUMN knowledges.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.insert_datetime IS '登録日時';


--
-- Name: COLUMN knowledges.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.update_user IS '更新ユーザ';


--
-- Name: COLUMN knowledges.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.update_datetime IS '更新日時';


--
-- Name: COLUMN knowledges.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.delete_flag IS '削除フラグ';


--
-- Name: COLUMN knowledges.notify_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.notify_status IS '通知ステータス';


--
-- Name: COLUMN knowledges.view_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.view_count IS '参照件数';


--
-- Name: COLUMN knowledges.point; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN knowledges.point IS 'ポイント';


--
-- Name: knowledges_knowledge_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE knowledges_knowledge_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: knowledges_knowledge_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE knowledges_knowledge_id_seq OWNED BY knowledges.knowledge_id;


--
-- Name: ldap_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE ldap_configs (
    system_name character varying(64) NOT NULL,
    host character varying(256) NOT NULL,
    port integer NOT NULL,
    use_ssl integer,
    use_tls integer,
    bind_dn character varying(256),
    bind_password character varying(1024),
    salt character varying(1024),
    base_dn character varying(256) NOT NULL,
    filter character varying(256),
    id_attr character varying(256) NOT NULL,
    name_attr character varying(256),
    mail_attr character varying(256),
    admin_check_filter character varying(256),
    auth_type integer NOT NULL,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    description character varying(64)
);


--
-- Name: TABLE ldap_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE ldap_configs IS 'LDAP認証設定';


--
-- Name: COLUMN ldap_configs.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.system_name IS '設定名';


--
-- Name: COLUMN ldap_configs.host; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.host IS 'HOST';


--
-- Name: COLUMN ldap_configs.port; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.port IS 'PORT';


--
-- Name: COLUMN ldap_configs.use_ssl; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.use_ssl IS 'USE_SSL';


--
-- Name: COLUMN ldap_configs.use_tls; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.use_tls IS 'USE_TLS';


--
-- Name: COLUMN ldap_configs.bind_dn; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.bind_dn IS 'BIND_DN';


--
-- Name: COLUMN ldap_configs.bind_password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.bind_password IS 'BIND_PASSWORD';


--
-- Name: COLUMN ldap_configs.salt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.salt IS 'SALT';


--
-- Name: COLUMN ldap_configs.base_dn; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.base_dn IS 'BASE_DN';


--
-- Name: COLUMN ldap_configs.filter; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.filter IS 'FILTER';


--
-- Name: COLUMN ldap_configs.id_attr; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.id_attr IS 'ID_ATTR';


--
-- Name: COLUMN ldap_configs.name_attr; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.name_attr IS 'NAME_ATTR';


--
-- Name: COLUMN ldap_configs.mail_attr; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.mail_attr IS 'MAIL_ATTR';


--
-- Name: COLUMN ldap_configs.admin_check_filter; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.admin_check_filter IS 'ADMIN_CHECK_FILTER';


--
-- Name: COLUMN ldap_configs.auth_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.auth_type IS 'AUTH_TYPE	 0:DB認証,1:LDAP認証,2:DB認証+LDAP認証(LDAP優先)';


--
-- Name: COLUMN ldap_configs.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.row_id IS '行ID';


--
-- Name: COLUMN ldap_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN ldap_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN ldap_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN ldap_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN ldap_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.delete_flag IS '削除フラグ';


--
-- Name: COLUMN ldap_configs.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN ldap_configs.description IS 'DESCRIPTION';


--
-- Name: like_comments; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE like_comments (
    no bigint NOT NULL,
    comment_no bigint NOT NULL,
    like_class integer DEFAULT 1,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE like_comments; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE like_comments IS 'コメントのイイネ';


--
-- Name: COLUMN like_comments.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.no IS 'NO';


--
-- Name: COLUMN like_comments.comment_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.comment_no IS 'コメント番号';


--
-- Name: COLUMN like_comments.like_class; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.like_class IS '種類';


--
-- Name: COLUMN like_comments.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.insert_user IS '登録ユーザ';


--
-- Name: COLUMN like_comments.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.insert_datetime IS '登録日時';


--
-- Name: COLUMN like_comments.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.update_user IS '更新ユーザ';


--
-- Name: COLUMN like_comments.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.update_datetime IS '更新日時';


--
-- Name: COLUMN like_comments.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN like_comments.delete_flag IS '削除フラグ';


--
-- Name: like_comments_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE like_comments_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: like_comments_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE like_comments_no_seq OWNED BY like_comments.no;


--
-- Name: likes; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE likes (
    no bigint NOT NULL,
    knowledge_id bigint NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    like_class integer DEFAULT 1
);


--
-- Name: TABLE likes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE likes IS 'いいね';


--
-- Name: COLUMN likes.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.no IS 'NO';


--
-- Name: COLUMN likes.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN likes.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.insert_user IS '登録ユーザ';


--
-- Name: COLUMN likes.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.insert_datetime IS '登録日時';


--
-- Name: COLUMN likes.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.update_user IS '更新ユーザ';


--
-- Name: COLUMN likes.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.update_datetime IS '更新日時';


--
-- Name: COLUMN likes.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.delete_flag IS '削除フラグ';


--
-- Name: COLUMN likes.like_class; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN likes.like_class IS '種類';


--
-- Name: likes_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE likes_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: likes_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE likes_no_seq OWNED BY likes.no;


--
-- Name: locales; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE locales (
    key character varying(12) NOT NULL,
    language character varying(4) NOT NULL,
    country character varying(4),
    variant character varying(4),
    disp_name character varying(128),
    flag_icon character varying(24),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE locales; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE locales IS 'ロケール';


--
-- Name: COLUMN locales.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.key IS 'キー';


--
-- Name: COLUMN locales.language; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.language IS '言語';


--
-- Name: COLUMN locales.country; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.country IS '国';


--
-- Name: COLUMN locales.variant; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.variant IS 'バリアント';


--
-- Name: COLUMN locales.disp_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.disp_name IS '表示名';


--
-- Name: COLUMN locales.flag_icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.flag_icon IS '国旗のアイコン';


--
-- Name: COLUMN locales.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.row_id IS '行ID';


--
-- Name: COLUMN locales.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.insert_user IS '登録ユーザ';


--
-- Name: COLUMN locales.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.insert_datetime IS '登録日時';


--
-- Name: COLUMN locales.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.update_user IS '更新ユーザ';


--
-- Name: COLUMN locales.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.update_datetime IS '更新日時';


--
-- Name: COLUMN locales.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN locales.delete_flag IS '削除フラグ';


--
-- Name: login_histories; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE login_histories (
    user_id integer NOT NULL,
    login_count double precision NOT NULL,
    lodin_date_time timestamp without time zone NOT NULL,
    ip_address character varying(15),
    user_agent character varying(256),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE login_histories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE login_histories IS 'ログイン履歴';


--
-- Name: COLUMN login_histories.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.user_id IS 'ユーザID';


--
-- Name: COLUMN login_histories.login_count; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.login_count IS 'ログイン番号';


--
-- Name: COLUMN login_histories.lodin_date_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.lodin_date_time IS 'ログイン日時';


--
-- Name: COLUMN login_histories.ip_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.ip_address IS 'IPアドレス';


--
-- Name: COLUMN login_histories.user_agent; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.user_agent IS 'エージェント';


--
-- Name: COLUMN login_histories.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.row_id IS '行ID';


--
-- Name: COLUMN login_histories.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.insert_user IS '登録ユーザ';


--
-- Name: COLUMN login_histories.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.insert_datetime IS '登録日時';


--
-- Name: COLUMN login_histories.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.update_user IS '更新ユーザ';


--
-- Name: COLUMN login_histories.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.update_datetime IS '更新日時';


--
-- Name: COLUMN login_histories.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN login_histories.delete_flag IS '削除フラグ';


--
-- Name: mail_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_configs (
    system_name character varying(64) NOT NULL,
    host character varying(256) NOT NULL,
    port integer NOT NULL,
    auth_type integer NOT NULL,
    smtp_id character varying(256),
    smtp_password character varying(1024),
    salt character varying(1024),
    from_address character varying(256),
    from_name character varying(256),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_configs IS 'メール設定';


--
-- Name: COLUMN mail_configs.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.system_name IS 'システム名';


--
-- Name: COLUMN mail_configs.host; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.host IS 'SMTP_HOST';


--
-- Name: COLUMN mail_configs.port; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.port IS 'SMTP_PORT';


--
-- Name: COLUMN mail_configs.auth_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.auth_type IS 'AUTH_TYPE';


--
-- Name: COLUMN mail_configs.smtp_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.smtp_id IS 'SMTP_ID';


--
-- Name: COLUMN mail_configs.smtp_password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.smtp_password IS 'SMTP_PASSWORD	 暗号化（可逆）';


--
-- Name: COLUMN mail_configs.salt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.salt IS 'SALT';


--
-- Name: COLUMN mail_configs.from_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.from_address IS '送信元';


--
-- Name: COLUMN mail_configs.from_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.from_name IS '送信元名';


--
-- Name: COLUMN mail_configs.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.row_id IS '行ID';


--
-- Name: COLUMN mail_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_configs.delete_flag IS '削除フラグ';


--
-- Name: mail_hook_conditions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_hook_conditions (
    hook_id integer NOT NULL,
    condition_no integer NOT NULL,
    condition_kind integer NOT NULL,
    condition character varying(256),
    process_user integer NOT NULL,
    process_user_kind integer NOT NULL,
    public_flag integer NOT NULL,
    tags text,
    viewers text,
    editors text,
    post_limit integer,
    limit_param character varying(256),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_hook_conditions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_hook_conditions IS 'メールから投稿する条件';


--
-- Name: COLUMN mail_hook_conditions.hook_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.hook_id IS 'HOOK_ID';


--
-- Name: COLUMN mail_hook_conditions.condition_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.condition_no IS 'CONDITION_NO';


--
-- Name: COLUMN mail_hook_conditions.condition_kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.condition_kind IS '条件の種類	 1:宛先が「条件文字」であった場合';


--
-- Name: COLUMN mail_hook_conditions.condition; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.condition IS '条件の文字';


--
-- Name: COLUMN mail_hook_conditions.process_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.process_user IS '投稿者';


--
-- Name: COLUMN mail_hook_conditions.process_user_kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.process_user_kind IS '投稿者の指定	 1:送信者のメールアドレスから、2:常に固定';


--
-- Name: COLUMN mail_hook_conditions.public_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.public_flag IS '公開区分';


--
-- Name: COLUMN mail_hook_conditions.tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.tags IS 'タグ';


--
-- Name: COLUMN mail_hook_conditions.viewers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.viewers IS '公開先';


--
-- Name: COLUMN mail_hook_conditions.editors; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.editors IS '共同編集者';


--
-- Name: COLUMN mail_hook_conditions.post_limit; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.post_limit IS '投稿者の制限';


--
-- Name: COLUMN mail_hook_conditions.limit_param; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.limit_param IS '制限のパラメータ';


--
-- Name: COLUMN mail_hook_conditions.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_hook_conditions.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_hook_conditions.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_hook_conditions.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_hook_conditions.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_conditions.delete_flag IS '削除フラグ';


--
-- Name: mail_hook_ignore_conditions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_hook_ignore_conditions (
    hook_id integer NOT NULL,
    condition_no integer NOT NULL,
    ignore_condition_no integer NOT NULL,
    condition_kind integer NOT NULL,
    condition character varying(256),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_hook_ignore_conditions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_hook_ignore_conditions IS 'メールから投稿の際の除外条件';


--
-- Name: COLUMN mail_hook_ignore_conditions.hook_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.hook_id IS 'HOOK_ID';


--
-- Name: COLUMN mail_hook_ignore_conditions.condition_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.condition_no IS 'CONDITION_NO';


--
-- Name: COLUMN mail_hook_ignore_conditions.ignore_condition_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.ignore_condition_no IS 'IGNORE_CONDITION_NO';


--
-- Name: COLUMN mail_hook_ignore_conditions.condition_kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.condition_kind IS '条件の種類   1:宛先が「条件文字」であった場合';


--
-- Name: COLUMN mail_hook_ignore_conditions.condition; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.condition IS '条件の文字';


--
-- Name: COLUMN mail_hook_ignore_conditions.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_hook_ignore_conditions.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_hook_ignore_conditions.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_hook_ignore_conditions.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_hook_ignore_conditions.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hook_ignore_conditions.delete_flag IS '削除フラグ';


--
-- Name: mail_hooks; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_hooks (
    hook_id integer NOT NULL,
    mail_protocol character varying(10) NOT NULL,
    mail_host character varying(256) NOT NULL,
    mail_port integer NOT NULL,
    mail_user character varying(256),
    mail_pass character varying(1024),
    mail_pass_salt character varying(1024),
    mail_folder character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_hooks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_hooks IS '受信したメールからの処理';


--
-- Name: COLUMN mail_hooks.hook_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.hook_id IS 'HOOK_ID';


--
-- Name: COLUMN mail_hooks.mail_protocol; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.mail_protocol IS 'MAIL_PROTOCOL';


--
-- Name: COLUMN mail_hooks.mail_host; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.mail_host IS 'MAIL_HOST';


--
-- Name: COLUMN mail_hooks.mail_port; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.mail_port IS 'MAIL_PORT';


--
-- Name: COLUMN mail_hooks.mail_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.mail_user IS 'MAIL_USER';


--
-- Name: COLUMN mail_hooks.mail_pass; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.mail_pass IS 'MAIL_PASS';


--
-- Name: COLUMN mail_hooks.mail_pass_salt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.mail_pass_salt IS 'MAIL_PASS_SALT';


--
-- Name: COLUMN mail_hooks.mail_folder; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.mail_folder IS 'MAIL_FOLDER';


--
-- Name: COLUMN mail_hooks.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_hooks.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_hooks.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_hooks.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_hooks.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_hooks.delete_flag IS '削除フラグ';


--
-- Name: mail_hooks_hook_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE mail_hooks_hook_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mail_hooks_hook_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE mail_hooks_hook_id_seq OWNED BY mail_hooks.hook_id;


--
-- Name: mail_locale_templates; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_locale_templates (
    template_id character varying(32) NOT NULL,
    key character varying(12) NOT NULL,
    title text NOT NULL,
    content text,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_locale_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_locale_templates IS 'ロケール毎のメールテンプレート';


--
-- Name: COLUMN mail_locale_templates.template_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.template_id IS 'テンプレートID';


--
-- Name: COLUMN mail_locale_templates.key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.key IS 'キー';


--
-- Name: COLUMN mail_locale_templates.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.title IS 'タイトル';


--
-- Name: COLUMN mail_locale_templates.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.content IS '本文';


--
-- Name: COLUMN mail_locale_templates.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_locale_templates.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_locale_templates.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_locale_templates.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_locale_templates.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_locale_templates.delete_flag IS '削除フラグ';


--
-- Name: mail_posts; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_posts (
    message_id character varying(128) NOT NULL,
    post_kind integer NOT NULL,
    id bigint NOT NULL,
    sender text,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_posts; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_posts IS 'メールから投稿';


--
-- Name: COLUMN mail_posts.message_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.message_id IS 'Message-ID';


--
-- Name: COLUMN mail_posts.post_kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.post_kind IS '投稿区分	 1: Knowledge 2:Comment';


--
-- Name: COLUMN mail_posts.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.id IS 'ID';


--
-- Name: COLUMN mail_posts.sender; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.sender IS 'SENDER';


--
-- Name: COLUMN mail_posts.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_posts.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_posts.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_posts.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_posts.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_posts.delete_flag IS '削除フラグ';


--
-- Name: mail_properties; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_properties (
    hook_id integer NOT NULL,
    property_key character varying(128) NOT NULL,
    property_value character varying(256),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_properties; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_properties IS 'メール受信設定';


--
-- Name: COLUMN mail_properties.hook_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.hook_id IS 'HOOK_ID';


--
-- Name: COLUMN mail_properties.property_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.property_key IS 'PROPERTY_KEY';


--
-- Name: COLUMN mail_properties.property_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.property_value IS 'PROPERTY_VALUE';


--
-- Name: COLUMN mail_properties.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_properties.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_properties.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_properties.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_properties.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_properties.delete_flag IS '削除フラグ';


--
-- Name: mail_templates; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mail_templates (
    template_id character varying(32) NOT NULL,
    template_title character varying(128) NOT NULL,
    description text,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mail_templates; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mail_templates IS 'メールテンプレート';


--
-- Name: COLUMN mail_templates.template_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.template_id IS 'テンプレートID';


--
-- Name: COLUMN mail_templates.template_title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.template_title IS 'テンプレートタイトル';


--
-- Name: COLUMN mail_templates.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.description IS '説明文';


--
-- Name: COLUMN mail_templates.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mail_templates.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.insert_datetime IS '登録日時';


--
-- Name: COLUMN mail_templates.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.update_user IS '更新ユーザ';


--
-- Name: COLUMN mail_templates.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.update_datetime IS '更新日時';


--
-- Name: COLUMN mail_templates.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mail_templates.delete_flag IS '削除フラグ';


--
-- Name: mails; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE mails (
    mail_id character varying(64) NOT NULL,
    status integer NOT NULL,
    to_address character varying(256) NOT NULL,
    to_name character varying(256),
    from_address character varying(256),
    from_name character varying(256),
    title character varying(256) NOT NULL,
    content text,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE mails; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE mails IS 'メール';


--
-- Name: COLUMN mails.mail_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.mail_id IS 'MAIL_ID';


--
-- Name: COLUMN mails.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.status IS 'ステータス';


--
-- Name: COLUMN mails.to_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.to_address IS '送信先';


--
-- Name: COLUMN mails.to_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.to_name IS '送信先名';


--
-- Name: COLUMN mails.from_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.from_address IS '送信元';


--
-- Name: COLUMN mails.from_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.from_name IS '送信元名';


--
-- Name: COLUMN mails.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.title IS 'タイトル';


--
-- Name: COLUMN mails.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.content IS 'メッセージ';


--
-- Name: COLUMN mails.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.row_id IS '行ID';


--
-- Name: COLUMN mails.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.insert_user IS '登録ユーザ';


--
-- Name: COLUMN mails.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.insert_datetime IS '登録日時';


--
-- Name: COLUMN mails.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.update_user IS '更新ユーザ';


--
-- Name: COLUMN mails.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.update_datetime IS '更新日時';


--
-- Name: COLUMN mails.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN mails.delete_flag IS '削除フラグ';


--
-- Name: notices; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE notices (
    no integer NOT NULL,
    title character varying(1024),
    message text,
    start_datetime timestamp without time zone,
    end_datetime timestamp without time zone,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE notices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE notices IS '告知';


--
-- Name: COLUMN notices.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.no IS 'NO';


--
-- Name: COLUMN notices.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.title IS 'タイトル';


--
-- Name: COLUMN notices.message; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.message IS 'メッセージ';


--
-- Name: COLUMN notices.start_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.start_datetime IS '掲示開始日時（UTC）';


--
-- Name: COLUMN notices.end_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.end_datetime IS '掲示終了日時（UTC）';


--
-- Name: COLUMN notices.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.row_id IS '行ID';


--
-- Name: COLUMN notices.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.insert_user IS '登録ユーザ';


--
-- Name: COLUMN notices.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.insert_datetime IS '登録日時';


--
-- Name: COLUMN notices.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.update_user IS '更新ユーザ';


--
-- Name: COLUMN notices.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.update_datetime IS '更新日時';


--
-- Name: COLUMN notices.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notices.delete_flag IS '削除フラグ';


--
-- Name: notices_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE notices_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notices_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE notices_no_seq OWNED BY notices.no;


--
-- Name: notification_status; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE notification_status (
    type integer NOT NULL,
    target_id bigint NOT NULL,
    user_id integer NOT NULL,
    status integer,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE notification_status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE notification_status IS 'いいねの通知状態';


--
-- Name: COLUMN notification_status.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.type IS '種類';


--
-- Name: COLUMN notification_status.target_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.target_id IS 'ターゲットのID';


--
-- Name: COLUMN notification_status.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.user_id IS '登録者';


--
-- Name: COLUMN notification_status.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.status IS '通知の状態';


--
-- Name: COLUMN notification_status.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.insert_user IS '登録ユーザ';


--
-- Name: COLUMN notification_status.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.insert_datetime IS '登録日時';


--
-- Name: COLUMN notification_status.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.update_user IS '更新ユーザ';


--
-- Name: COLUMN notification_status.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.update_datetime IS '更新日時';


--
-- Name: COLUMN notification_status.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notification_status.delete_flag IS '削除フラグ';


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE notifications (
    no bigint NOT NULL,
    title character varying(256),
    content text,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE notifications IS '通知';


--
-- Name: COLUMN notifications.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.no IS 'NO';


--
-- Name: COLUMN notifications.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.title IS 'タイトル';


--
-- Name: COLUMN notifications.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.content IS 'メッセージ';


--
-- Name: COLUMN notifications.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.row_id IS '行ID';


--
-- Name: COLUMN notifications.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.insert_user IS '登録ユーザ';


--
-- Name: COLUMN notifications.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.insert_datetime IS '登録日時';


--
-- Name: COLUMN notifications.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.update_user IS '更新ユーザ';


--
-- Name: COLUMN notifications.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.update_datetime IS '更新日時';


--
-- Name: COLUMN notifications.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notifications.delete_flag IS '削除フラグ';


--
-- Name: notifications_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE notifications_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE notifications_no_seq OWNED BY notifications.no;


--
-- Name: notify_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE notify_configs (
    user_id integer NOT NULL,
    notify_mail integer,
    notify_desktop integer,
    my_item_comment integer,
    my_item_like integer,
    my_item_stock integer,
    to_item_save integer,
    to_item_comment integer,
    to_item_ignore_public integer,
    stock_item_save integer,
    stoke_item_comment integer,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE notify_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE notify_configs IS '通知設定';


--
-- Name: COLUMN notify_configs.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.user_id IS 'ユーザID';


--
-- Name: COLUMN notify_configs.notify_mail; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.notify_mail IS 'メール通知する';


--
-- Name: COLUMN notify_configs.notify_desktop; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.notify_desktop IS 'デスクトップ通知する';


--
-- Name: COLUMN notify_configs.my_item_comment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.my_item_comment IS '自分が登録した投稿にコメントが登録されたら通知';


--
-- Name: COLUMN notify_configs.my_item_like; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.my_item_like IS '自分が登録した投稿にいいねが追加されたら通知';


--
-- Name: COLUMN notify_configs.my_item_stock; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.my_item_stock IS '自分が登録した投稿がストックされたら通知';


--
-- Name: COLUMN notify_configs.to_item_save; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.to_item_save IS '自分宛の投稿が更新されたら通知';


--
-- Name: COLUMN notify_configs.to_item_comment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.to_item_comment IS '自分宛の投稿にコメントが登録されたら通知';


--
-- Name: COLUMN notify_configs.to_item_ignore_public; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.to_item_ignore_public IS '自分宛の投稿で「公開」は除外';


--
-- Name: COLUMN notify_configs.stock_item_save; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.stock_item_save IS 'ストックしたナレッジが更新されたら通知';


--
-- Name: COLUMN notify_configs.stoke_item_comment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.stoke_item_comment IS 'ストックしたナレッジにコメントが登録されたら通知';


--
-- Name: COLUMN notify_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN notify_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN notify_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN notify_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN notify_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_configs.delete_flag IS '削除フラグ';


--
-- Name: notify_queues; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE notify_queues (
    hash character varying(32) NOT NULL,
    type integer NOT NULL,
    id bigint NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE notify_queues; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE notify_queues IS '通知待ちキュー';


--
-- Name: COLUMN notify_queues.hash; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.hash IS 'HASH';


--
-- Name: COLUMN notify_queues.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.type IS '種類';


--
-- Name: COLUMN notify_queues.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.id IS '通知する種類のID';


--
-- Name: COLUMN notify_queues.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.insert_user IS '登録ユーザ';


--
-- Name: COLUMN notify_queues.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.insert_datetime IS '登録日時';


--
-- Name: COLUMN notify_queues.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.update_user IS '更新ユーザ';


--
-- Name: COLUMN notify_queues.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.update_datetime IS '更新日時';


--
-- Name: COLUMN notify_queues.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN notify_queues.delete_flag IS '削除フラグ';


--
-- Name: participants; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE participants (
    knowledge_id bigint NOT NULL,
    user_id integer NOT NULL,
    status integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE participants; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE participants IS '参加者';


--
-- Name: COLUMN participants.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN participants.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.user_id IS 'ユーザID';


--
-- Name: COLUMN participants.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.status IS 'ステータス';


--
-- Name: COLUMN participants.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.insert_user IS '登録ユーザ';


--
-- Name: COLUMN participants.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.insert_datetime IS '登録日時';


--
-- Name: COLUMN participants.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.update_user IS '更新ユーザ';


--
-- Name: COLUMN participants.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.update_datetime IS '更新日時';


--
-- Name: COLUMN participants.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN participants.delete_flag IS '削除フラグ';


--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE password_resets (
    id character varying(256) NOT NULL,
    user_key character varying(256),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE password_resets; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE password_resets IS 'パスワードリセット';


--
-- Name: COLUMN password_resets.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.id IS 'パスワードリセットID';


--
-- Name: COLUMN password_resets.user_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.user_key IS 'ユーザKEY';


--
-- Name: COLUMN password_resets.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.row_id IS '行ID';


--
-- Name: COLUMN password_resets.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.insert_user IS '登録ユーザ';


--
-- Name: COLUMN password_resets.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.insert_datetime IS '登録日時';


--
-- Name: COLUMN password_resets.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.update_user IS '更新ユーザ';


--
-- Name: COLUMN password_resets.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.update_datetime IS '更新日時';


--
-- Name: COLUMN password_resets.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN password_resets.delete_flag IS '削除フラグ';


--
-- Name: pins; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE pins (
    no integer NOT NULL,
    knowledge_id bigint NOT NULL,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE pins; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE pins IS 'ピン';


--
-- Name: COLUMN pins.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.no IS 'NO';


--
-- Name: COLUMN pins.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN pins.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.row_id IS '行ID';


--
-- Name: COLUMN pins.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.insert_user IS '登録ユーザ';


--
-- Name: COLUMN pins.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.insert_datetime IS '登録日時';


--
-- Name: COLUMN pins.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.update_user IS '更新ユーザ';


--
-- Name: COLUMN pins.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.update_datetime IS '更新日時';


--
-- Name: COLUMN pins.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN pins.delete_flag IS '削除フラグ';


--
-- Name: pins_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE pins_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pins_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE pins_no_seq OWNED BY pins.no;


--
-- Name: point_knowledge_histories; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE point_knowledge_histories (
    knowledge_id bigint NOT NULL,
    history_no bigint NOT NULL,
    activity_no bigint NOT NULL,
    type integer NOT NULL,
    point integer NOT NULL,
    before_total integer NOT NULL,
    total integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE point_knowledge_histories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE point_knowledge_histories IS 'ナレッジのポイント獲得履歴';


--
-- Name: COLUMN point_knowledge_histories.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN point_knowledge_histories.history_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.history_no IS '履歴番号';


--
-- Name: COLUMN point_knowledge_histories.activity_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.activity_no IS 'アクティビティ番号';


--
-- Name: COLUMN point_knowledge_histories.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.type IS '獲得のタイプ';


--
-- Name: COLUMN point_knowledge_histories.point; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.point IS '獲得ポイント';


--
-- Name: COLUMN point_knowledge_histories.before_total; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.before_total IS '獲得前ポイント';


--
-- Name: COLUMN point_knowledge_histories.total; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.total IS 'トータルポイント';


--
-- Name: COLUMN point_knowledge_histories.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.insert_user IS '登録ユーザ';


--
-- Name: COLUMN point_knowledge_histories.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.insert_datetime IS '登録日時';


--
-- Name: COLUMN point_knowledge_histories.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.update_user IS '更新ユーザ';


--
-- Name: COLUMN point_knowledge_histories.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.update_datetime IS '更新日時';


--
-- Name: COLUMN point_knowledge_histories.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_knowledge_histories.delete_flag IS '削除フラグ';


--
-- Name: point_user_histories; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE point_user_histories (
    user_id integer NOT NULL,
    history_no bigint NOT NULL,
    activity_no bigint NOT NULL,
    type integer NOT NULL,
    point integer NOT NULL,
    before_total integer NOT NULL,
    total integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE point_user_histories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE point_user_histories IS 'ユーザのポイント獲得履歴';


--
-- Name: COLUMN point_user_histories.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.user_id IS 'ユーザID';


--
-- Name: COLUMN point_user_histories.history_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.history_no IS '履歴番号';


--
-- Name: COLUMN point_user_histories.activity_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.activity_no IS 'アクティビティ番号';


--
-- Name: COLUMN point_user_histories.type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.type IS '獲得のタイプ';


--
-- Name: COLUMN point_user_histories.point; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.point IS '獲得ポイント';


--
-- Name: COLUMN point_user_histories.before_total; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.before_total IS '獲得前ポイント';


--
-- Name: COLUMN point_user_histories.total; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.total IS 'トータルポイント';


--
-- Name: COLUMN point_user_histories.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.insert_user IS '登録ユーザ';


--
-- Name: COLUMN point_user_histories.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.insert_datetime IS '登録日時';


--
-- Name: COLUMN point_user_histories.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.update_user IS '更新ユーザ';


--
-- Name: COLUMN point_user_histories.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.update_datetime IS '更新日時';


--
-- Name: COLUMN point_user_histories.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN point_user_histories.delete_flag IS '削除フラグ';


--
-- Name: provisional_registrations; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE provisional_registrations (
    id character varying(256) NOT NULL,
    user_key character varying(256) NOT NULL,
    user_name character varying(256) NOT NULL,
    password character varying(1024) NOT NULL,
    salt character varying(1024) NOT NULL,
    locale_key character varying(12),
    mail_address character varying(256),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE provisional_registrations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE provisional_registrations IS '仮登録ユーザ';


--
-- Name: COLUMN provisional_registrations.id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.id IS '仮発行ID';


--
-- Name: COLUMN provisional_registrations.user_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.user_key IS 'ユーザKEY';


--
-- Name: COLUMN provisional_registrations.user_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.user_name IS 'ユーザ名';


--
-- Name: COLUMN provisional_registrations.password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.password IS 'パスワード';


--
-- Name: COLUMN provisional_registrations.salt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.salt IS 'SALT';


--
-- Name: COLUMN provisional_registrations.locale_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.locale_key IS 'ロケール';


--
-- Name: COLUMN provisional_registrations.mail_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.mail_address IS 'メールアドレス';


--
-- Name: COLUMN provisional_registrations.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.row_id IS '行ID';


--
-- Name: COLUMN provisional_registrations.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.insert_user IS '登録ユーザ';


--
-- Name: COLUMN provisional_registrations.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.insert_datetime IS '登録日時';


--
-- Name: COLUMN provisional_registrations.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.update_user IS '更新ユーザ';


--
-- Name: COLUMN provisional_registrations.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.update_datetime IS '更新日時';


--
-- Name: COLUMN provisional_registrations.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN provisional_registrations.delete_flag IS '削除フラグ';


--
-- Name: proxy_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE proxy_configs (
    system_name character varying(64) NOT NULL,
    proxy_host_name character varying(256) NOT NULL,
    proxy_port_no integer NOT NULL,
    proxy_auth_type integer NOT NULL,
    proxy_auth_user_id character varying(256),
    proxy_auth_password character varying(1024),
    proxy_auth_salt character varying(1024),
    proxy_auth_pc_name character varying(256),
    proxy_auth_domain character varying(256),
    third_party_certificate integer,
    test_url character varying(256),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE proxy_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE proxy_configs IS 'プロキシ設定';


--
-- Name: COLUMN proxy_configs.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.system_name IS 'システム名';


--
-- Name: COLUMN proxy_configs.proxy_host_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_host_name IS '[Proxy]ホスト名';


--
-- Name: COLUMN proxy_configs.proxy_port_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_port_no IS '[Proxy]ポート番号';


--
-- Name: COLUMN proxy_configs.proxy_auth_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_auth_type IS '[Proxy-Auth]認証タイプ';


--
-- Name: COLUMN proxy_configs.proxy_auth_user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_auth_user_id IS '[Proxy-Auth]認証ユーザID';


--
-- Name: COLUMN proxy_configs.proxy_auth_password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_auth_password IS '[Proxy-Auth]認証パスワード';


--
-- Name: COLUMN proxy_configs.proxy_auth_salt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_auth_salt IS '[Proxy-Auth]認証SALT';


--
-- Name: COLUMN proxy_configs.proxy_auth_pc_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_auth_pc_name IS '[Proxy-Auth-NTLM]認証PC名';


--
-- Name: COLUMN proxy_configs.proxy_auth_domain; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.proxy_auth_domain IS '[Auth-NTLM]認証ドメイン';


--
-- Name: COLUMN proxy_configs.third_party_certificate; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.third_party_certificate IS '[Web]SSL証明書チェック';


--
-- Name: COLUMN proxy_configs.test_url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.test_url IS '[Web]接続確認用URL';


--
-- Name: COLUMN proxy_configs.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.row_id IS '行ID';


--
-- Name: COLUMN proxy_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN proxy_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN proxy_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN proxy_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN proxy_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN proxy_configs.delete_flag IS '削除フラグ';


--
-- Name: read_marks; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE read_marks (
    no integer NOT NULL,
    user_id integer NOT NULL,
    show_next_time integer,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE read_marks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE read_marks IS '既読';


--
-- Name: COLUMN read_marks.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.no IS 'NO';


--
-- Name: COLUMN read_marks.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.user_id IS 'ユーザID';


--
-- Name: COLUMN read_marks.show_next_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.show_next_time IS '次回も表示する';


--
-- Name: COLUMN read_marks.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.row_id IS '行ID';


--
-- Name: COLUMN read_marks.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.insert_user IS '登録ユーザ';


--
-- Name: COLUMN read_marks.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.insert_datetime IS '登録日時';


--
-- Name: COLUMN read_marks.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.update_user IS '更新ユーザ';


--
-- Name: COLUMN read_marks.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.update_datetime IS '更新日時';


--
-- Name: COLUMN read_marks.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN read_marks.delete_flag IS '削除フラグ';


--
-- Name: role_functions; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE role_functions (
    role_id integer NOT NULL,
    function_key character varying(64) NOT NULL,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE role_functions; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE role_functions IS '機能にアクセスできる権限';


--
-- Name: COLUMN role_functions.role_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.role_id IS '権限ID';


--
-- Name: COLUMN role_functions.function_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.function_key IS '機能';


--
-- Name: COLUMN role_functions.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.row_id IS '行ID';


--
-- Name: COLUMN role_functions.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.insert_user IS '登録ユーザ';


--
-- Name: COLUMN role_functions.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.insert_datetime IS '登録日時';


--
-- Name: COLUMN role_functions.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.update_user IS '更新ユーザ';


--
-- Name: COLUMN role_functions.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.update_datetime IS '更新日時';


--
-- Name: COLUMN role_functions.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN role_functions.delete_flag IS '削除フラグ';


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE roles (
    role_id integer NOT NULL,
    role_key character varying(12) NOT NULL,
    role_name character varying(50),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE roles IS '権限';


--
-- Name: COLUMN roles.role_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.role_id IS '権限ID';


--
-- Name: COLUMN roles.role_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.role_key IS '権限KEY';


--
-- Name: COLUMN roles.role_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.role_name IS '権限名';


--
-- Name: COLUMN roles.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.row_id IS '行ID';


--
-- Name: COLUMN roles.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.insert_user IS '登録ユーザ';


--
-- Name: COLUMN roles.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.insert_datetime IS '登録日時';


--
-- Name: COLUMN roles.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.update_user IS '更新ユーザ';


--
-- Name: COLUMN roles.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.update_datetime IS '更新日時';


--
-- Name: COLUMN roles.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN roles.delete_flag IS '削除フラグ';


--
-- Name: roles_role_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE roles_role_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_role_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE roles_role_id_seq OWNED BY roles.role_id;


--
-- Name: service_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE service_configs (
    service_name character varying(64) NOT NULL,
    service_label character varying(24) NOT NULL,
    service_icon character varying(24) NOT NULL,
    service_image bytea,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE service_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE service_configs IS 'サービスの設定';


--
-- Name: COLUMN service_configs.service_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.service_name IS 'サービス名';


--
-- Name: COLUMN service_configs.service_label; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.service_label IS '表示名';


--
-- Name: COLUMN service_configs.service_icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.service_icon IS 'アイコン文字列';


--
-- Name: COLUMN service_configs.service_image; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.service_image IS '背景画像';


--
-- Name: COLUMN service_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN service_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN service_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN service_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN service_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_configs.delete_flag IS '削除フラグ';


--
-- Name: service_locale_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE service_locale_configs (
    service_name character varying(64) NOT NULL,
    locale_key character varying(12) NOT NULL,
    page_html text,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE service_locale_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE service_locale_configs IS 'サービスの表示言語毎の設定';


--
-- Name: COLUMN service_locale_configs.service_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.service_name IS 'サービス名';


--
-- Name: COLUMN service_locale_configs.locale_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.locale_key IS 'ロケールキー';


--
-- Name: COLUMN service_locale_configs.page_html; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.page_html IS 'トップページのHTML';


--
-- Name: COLUMN service_locale_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN service_locale_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN service_locale_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN service_locale_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN service_locale_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN service_locale_configs.delete_flag IS '削除フラグ';


--
-- Name: stock_knowledges; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE stock_knowledges (
    stock_id bigint NOT NULL,
    knowledge_id bigint NOT NULL,
    comment character varying(1024),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE stock_knowledges; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE stock_knowledges IS 'ストックしたナレッジ';


--
-- Name: COLUMN stock_knowledges.stock_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.stock_id IS 'STOCK ID';


--
-- Name: COLUMN stock_knowledges.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN stock_knowledges.comment; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.comment IS 'コメント';


--
-- Name: COLUMN stock_knowledges.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.insert_user IS '登録ユーザ';


--
-- Name: COLUMN stock_knowledges.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.insert_datetime IS '登録日時';


--
-- Name: COLUMN stock_knowledges.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.update_user IS '更新ユーザ';


--
-- Name: COLUMN stock_knowledges.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.update_datetime IS '更新日時';


--
-- Name: COLUMN stock_knowledges.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stock_knowledges.delete_flag IS '削除フラグ';


--
-- Name: stocks; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE stocks (
    stock_id bigint NOT NULL,
    stock_name character varying(256) NOT NULL,
    stock_type integer NOT NULL,
    description character varying(1024),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE stocks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE stocks IS 'ストック';


--
-- Name: COLUMN stocks.stock_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.stock_id IS 'STOCK ID';


--
-- Name: COLUMN stocks.stock_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.stock_name IS 'STOCK 名';


--
-- Name: COLUMN stocks.stock_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.stock_type IS '区分';


--
-- Name: COLUMN stocks.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.description IS '説明';


--
-- Name: COLUMN stocks.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.insert_user IS '登録ユーザ';


--
-- Name: COLUMN stocks.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.insert_datetime IS '登録日時';


--
-- Name: COLUMN stocks.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.update_user IS '更新ユーザ';


--
-- Name: COLUMN stocks.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.update_datetime IS '更新日時';


--
-- Name: COLUMN stocks.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN stocks.delete_flag IS '削除フラグ';


--
-- Name: stocks_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE stocks_stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stocks_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE stocks_stock_id_seq OWNED BY stocks.stock_id;


--
-- Name: survey_answers; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE survey_answers (
    knowledge_id bigint NOT NULL,
    answer_id integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE survey_answers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE survey_answers IS 'アンケートの回答';


--
-- Name: COLUMN survey_answers.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_answers.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN survey_answers.answer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_answers.answer_id IS '回答ID';


--
-- Name: COLUMN survey_answers.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_answers.insert_user IS '登録ユーザ';


--
-- Name: COLUMN survey_answers.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_answers.insert_datetime IS '登録日時';


--
-- Name: COLUMN survey_answers.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_answers.update_user IS '更新ユーザ';


--
-- Name: COLUMN survey_answers.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_answers.update_datetime IS '更新日時';


--
-- Name: COLUMN survey_answers.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_answers.delete_flag IS '削除フラグ';


--
-- Name: survey_choices; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE survey_choices (
    knowledge_id bigint NOT NULL,
    item_no integer NOT NULL,
    choice_no integer NOT NULL,
    choice_value character varying(256) NOT NULL,
    choice_label character varying(256) NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE survey_choices; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE survey_choices IS 'アンケートの選択肢の値';


--
-- Name: COLUMN survey_choices.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN survey_choices.item_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.item_no IS '項目NO';


--
-- Name: COLUMN survey_choices.choice_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.choice_no IS '選択肢番号';


--
-- Name: COLUMN survey_choices.choice_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.choice_value IS '選択肢値';


--
-- Name: COLUMN survey_choices.choice_label; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.choice_label IS '選択肢ラベル';


--
-- Name: COLUMN survey_choices.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.insert_user IS '登録ユーザ';


--
-- Name: COLUMN survey_choices.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.insert_datetime IS '登録日時';


--
-- Name: COLUMN survey_choices.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.update_user IS '更新ユーザ';


--
-- Name: COLUMN survey_choices.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.update_datetime IS '更新日時';


--
-- Name: COLUMN survey_choices.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_choices.delete_flag IS '削除フラグ';


--
-- Name: survey_item_answers; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE survey_item_answers (
    knowledge_id bigint NOT NULL,
    answer_id integer NOT NULL,
    item_no integer NOT NULL,
    item_value text,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE survey_item_answers; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE survey_item_answers IS 'アンケートの回答の値';


--
-- Name: COLUMN survey_item_answers.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN survey_item_answers.answer_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.answer_id IS '回答ID';


--
-- Name: COLUMN survey_item_answers.item_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.item_no IS '項目NO';


--
-- Name: COLUMN survey_item_answers.item_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.item_value IS '項目値';


--
-- Name: COLUMN survey_item_answers.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.insert_user IS '登録ユーザ';


--
-- Name: COLUMN survey_item_answers.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.insert_datetime IS '登録日時';


--
-- Name: COLUMN survey_item_answers.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.update_user IS '更新ユーザ';


--
-- Name: COLUMN survey_item_answers.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.update_datetime IS '更新日時';


--
-- Name: COLUMN survey_item_answers.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_item_answers.delete_flag IS '削除フラグ';


--
-- Name: survey_items; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE survey_items (
    knowledge_id bigint NOT NULL,
    item_no integer NOT NULL,
    item_name character varying(32) NOT NULL,
    item_type integer NOT NULL,
    description character varying(1024),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE survey_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE survey_items IS 'アンケート項目';


--
-- Name: COLUMN survey_items.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN survey_items.item_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.item_no IS '項目NO';


--
-- Name: COLUMN survey_items.item_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.item_name IS '項目名';


--
-- Name: COLUMN survey_items.item_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.item_type IS '項目の種類';


--
-- Name: COLUMN survey_items.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.description IS '説明';


--
-- Name: COLUMN survey_items.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.insert_user IS '登録ユーザ';


--
-- Name: COLUMN survey_items.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.insert_datetime IS '登録日時';


--
-- Name: COLUMN survey_items.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.update_user IS '更新ユーザ';


--
-- Name: COLUMN survey_items.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.update_datetime IS '更新日時';


--
-- Name: COLUMN survey_items.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN survey_items.delete_flag IS '削除フラグ';


--
-- Name: surveys; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE surveys (
    knowledge_id bigint NOT NULL,
    title character varying(256) NOT NULL,
    description text,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE surveys; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE surveys IS 'アンケート';


--
-- Name: COLUMN surveys.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN surveys.title; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.title IS 'タイトル';


--
-- Name: COLUMN surveys.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.description IS '説明';


--
-- Name: COLUMN surveys.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.insert_user IS '登録ユーザ';


--
-- Name: COLUMN surveys.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.insert_datetime IS '登録日時';


--
-- Name: COLUMN surveys.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.update_user IS '更新ユーザ';


--
-- Name: COLUMN surveys.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.update_datetime IS '更新日時';


--
-- Name: COLUMN surveys.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN surveys.delete_flag IS '削除フラグ';


--
-- Name: system_attributes; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE system_attributes (
    system_name character varying(64) NOT NULL,
    config_name character varying(256) NOT NULL,
    config_value text,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE system_attributes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE system_attributes IS 'システム付加情報';


--
-- Name: COLUMN system_attributes.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.system_name IS 'システム名';


--
-- Name: COLUMN system_attributes.config_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.config_name IS 'コンフィグ名';


--
-- Name: COLUMN system_attributes.config_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.config_value IS 'コンフィグ値';


--
-- Name: COLUMN system_attributes.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.row_id IS '行ID';


--
-- Name: COLUMN system_attributes.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.insert_user IS '登録ユーザ';


--
-- Name: COLUMN system_attributes.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.insert_datetime IS '登録日時';


--
-- Name: COLUMN system_attributes.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.update_user IS '更新ユーザ';


--
-- Name: COLUMN system_attributes.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.update_datetime IS '更新日時';


--
-- Name: COLUMN system_attributes.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_attributes.delete_flag IS '削除フラグ';


--
-- Name: system_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE system_configs (
    system_name character varying(64) NOT NULL,
    config_name character varying(256) NOT NULL,
    config_value character varying(1024),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE system_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE system_configs IS 'コンフィグ';


--
-- Name: COLUMN system_configs.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.system_name IS 'システム名';


--
-- Name: COLUMN system_configs.config_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.config_name IS 'コンフィグ名';


--
-- Name: COLUMN system_configs.config_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.config_value IS 'コンフィグ値';


--
-- Name: COLUMN system_configs.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.row_id IS '行ID';


--
-- Name: COLUMN system_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN system_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN system_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN system_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN system_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN system_configs.delete_flag IS '削除フラグ';


--
-- Name: systems; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE systems (
    system_name character varying(64) NOT NULL,
    version character varying(16) NOT NULL,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE systems; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE systems IS 'システムの設定';


--
-- Name: COLUMN systems.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.system_name IS 'システム名';


--
-- Name: COLUMN systems.version; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.version IS 'バージョン';


--
-- Name: COLUMN systems.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.row_id IS '行ID';


--
-- Name: COLUMN systems.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.insert_user IS '登録ユーザ';


--
-- Name: COLUMN systems.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.insert_datetime IS '登録日時';


--
-- Name: COLUMN systems.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.update_user IS '更新ユーザ';


--
-- Name: COLUMN systems.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.update_datetime IS '更新日時';


--
-- Name: COLUMN systems.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN systems.delete_flag IS '削除フラグ';


--
-- Name: tags; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE tags (
    tag_id integer NOT NULL,
    tag_name character varying(128) NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE tags; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE tags IS 'タグ';


--
-- Name: COLUMN tags.tag_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tags.tag_id IS 'タグ_ID';


--
-- Name: COLUMN tags.tag_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tags.tag_name IS 'タグ名称';


--
-- Name: COLUMN tags.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tags.insert_user IS '登録ユーザ';


--
-- Name: COLUMN tags.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tags.insert_datetime IS '登録日時';


--
-- Name: COLUMN tags.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tags.update_user IS '更新ユーザ';


--
-- Name: COLUMN tags.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tags.update_datetime IS '更新日時';


--
-- Name: COLUMN tags.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tags.delete_flag IS '削除フラグ';


--
-- Name: tags_tag_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE tags_tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tags_tag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE tags_tag_id_seq OWNED BY tags.tag_id;


--
-- Name: template_items; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE template_items (
    type_id integer NOT NULL,
    item_no integer NOT NULL,
    item_name character varying(32) NOT NULL,
    item_type integer NOT NULL,
    description character varying(1024),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    initial_value text
);


--
-- Name: TABLE template_items; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE template_items IS 'テンプレートの項目';


--
-- Name: COLUMN template_items.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.type_id IS 'テンプレートの種類ID';


--
-- Name: COLUMN template_items.item_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.item_no IS '項目NO';


--
-- Name: COLUMN template_items.item_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.item_name IS '項目名';


--
-- Name: COLUMN template_items.item_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.item_type IS '項目の種類';


--
-- Name: COLUMN template_items.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.description IS '説明';


--
-- Name: COLUMN template_items.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.insert_user IS '登録ユーザ';


--
-- Name: COLUMN template_items.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.insert_datetime IS '登録日時';


--
-- Name: COLUMN template_items.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.update_user IS '更新ユーザ';


--
-- Name: COLUMN template_items.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.update_datetime IS '更新日時';


--
-- Name: COLUMN template_items.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.delete_flag IS '削除フラグ';


--
-- Name: COLUMN template_items.initial_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_items.initial_value IS '初期値';


--
-- Name: template_masters; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE template_masters (
    type_id integer NOT NULL,
    type_name character varying(256) NOT NULL,
    type_icon character varying(64),
    description character varying(1024),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    initial_value text
);


--
-- Name: TABLE template_masters; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE template_masters IS 'テンプレートのマスタ';


--
-- Name: COLUMN template_masters.type_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.type_id IS 'テンプレートの種類ID';


--
-- Name: COLUMN template_masters.type_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.type_name IS 'テンプレート名';


--
-- Name: COLUMN template_masters.type_icon; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.type_icon IS 'アイコン';


--
-- Name: COLUMN template_masters.description; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.description IS '説明';


--
-- Name: COLUMN template_masters.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.insert_user IS '登録ユーザ';


--
-- Name: COLUMN template_masters.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.insert_datetime IS '登録日時';


--
-- Name: COLUMN template_masters.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.update_user IS '更新ユーザ';


--
-- Name: COLUMN template_masters.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.update_datetime IS '更新日時';


--
-- Name: COLUMN template_masters.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.delete_flag IS '削除フラグ';


--
-- Name: COLUMN template_masters.initial_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN template_masters.initial_value IS '本文の初期値';


--
-- Name: template_masters_type_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE template_masters_type_id_seq
    START WITH 1
    INCREMENT BY 1
    MINVALUE -100
    NO MAXVALUE
    CACHE 1;


--
-- Name: template_masters_type_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE template_masters_type_id_seq OWNED BY template_masters.type_id;


--
-- Name: tokens; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE tokens (
    token character varying(128) NOT NULL,
    user_id integer NOT NULL,
    expires timestamp without time zone NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE tokens; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE tokens IS '認証トークン';


--
-- Name: COLUMN tokens.token; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.token IS 'TOKEN';


--
-- Name: COLUMN tokens.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.user_id IS 'ユーザID';


--
-- Name: COLUMN tokens.expires; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.expires IS '有効期限';


--
-- Name: COLUMN tokens.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.insert_user IS '登録ユーザ';


--
-- Name: COLUMN tokens.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.insert_datetime IS '登録日時';


--
-- Name: COLUMN tokens.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.update_user IS '更新ユーザ';


--
-- Name: COLUMN tokens.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.update_datetime IS '更新日時';


--
-- Name: COLUMN tokens.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN tokens.delete_flag IS '削除フラグ';


--
-- Name: user_alias; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE user_alias (
    user_id integer NOT NULL,
    auth_key character varying(64) NOT NULL,
    alias_key character varying(256) NOT NULL,
    alias_name character varying(256) NOT NULL,
    alias_mail character varying(256),
    user_info_update integer,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE user_alias; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE user_alias IS 'ユーザのエイリアス';


--
-- Name: COLUMN user_alias.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.user_id IS 'ユーザID';


--
-- Name: COLUMN user_alias.auth_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.auth_key IS '認証設定キー';


--
-- Name: COLUMN user_alias.alias_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.alias_key IS 'エイリアスのキー';


--
-- Name: COLUMN user_alias.alias_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.alias_name IS 'エイリアスの表示名';


--
-- Name: COLUMN user_alias.alias_mail; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.alias_mail IS 'メールアドレス';


--
-- Name: COLUMN user_alias.user_info_update; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.user_info_update IS 'アカウント情報更新フラグ';


--
-- Name: COLUMN user_alias.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.row_id IS '行ID';


--
-- Name: COLUMN user_alias.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.insert_user IS '登録ユーザ';


--
-- Name: COLUMN user_alias.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.insert_datetime IS '登録日時';


--
-- Name: COLUMN user_alias.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.update_user IS '更新ユーザ';


--
-- Name: COLUMN user_alias.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.update_datetime IS '更新日時';


--
-- Name: COLUMN user_alias.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_alias.delete_flag IS '削除フラグ';


--
-- Name: user_badges; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE user_badges (
    user_id integer NOT NULL,
    no integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE user_badges; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE user_badges IS 'ユーザの称号';


--
-- Name: COLUMN user_badges.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_badges.user_id IS 'ユーザID';


--
-- Name: COLUMN user_badges.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_badges.no IS '番号';


--
-- Name: COLUMN user_badges.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_badges.insert_user IS '登録ユーザ';


--
-- Name: COLUMN user_badges.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_badges.insert_datetime IS '登録日時';


--
-- Name: COLUMN user_badges.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_badges.update_user IS '更新ユーザ';


--
-- Name: COLUMN user_badges.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_badges.update_datetime IS '更新日時';


--
-- Name: COLUMN user_badges.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_badges.delete_flag IS '削除フラグ';


--
-- Name: user_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE user_configs (
    system_name character varying(64) NOT NULL,
    user_id integer NOT NULL,
    config_name character varying(256) NOT NULL,
    config_value character varying(1024),
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE user_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE user_configs IS 'ユーザ設定';


--
-- Name: COLUMN user_configs.system_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.system_name IS 'システム名';


--
-- Name: COLUMN user_configs.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.user_id IS 'ユーザID';


--
-- Name: COLUMN user_configs.config_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.config_name IS 'コンフィグ名';


--
-- Name: COLUMN user_configs.config_value; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.config_value IS 'コンフィグ値';


--
-- Name: COLUMN user_configs.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.row_id IS '行ID';


--
-- Name: COLUMN user_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN user_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN user_configs.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.update_user IS '更新ユーザ';


--
-- Name: COLUMN user_configs.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.update_datetime IS '更新日時';


--
-- Name: COLUMN user_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_configs.delete_flag IS '削除フラグ';


--
-- Name: user_groups; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE user_groups (
    user_id integer NOT NULL,
    group_id integer NOT NULL,
    group_role integer,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE user_groups; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE user_groups IS 'ユーザが所属するグループ';


--
-- Name: COLUMN user_groups.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.user_id IS 'ユーザID';


--
-- Name: COLUMN user_groups.group_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.group_id IS 'グループID	 CHARACTER SET latin1';


--
-- Name: COLUMN user_groups.group_role; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.group_role IS 'グループの権限';


--
-- Name: COLUMN user_groups.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.row_id IS '行ID';


--
-- Name: COLUMN user_groups.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.insert_user IS '登録ユーザ';


--
-- Name: COLUMN user_groups.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.insert_datetime IS '登録日時';


--
-- Name: COLUMN user_groups.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.update_user IS '更新ユーザ';


--
-- Name: COLUMN user_groups.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.update_datetime IS '更新日時';


--
-- Name: COLUMN user_groups.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_groups.delete_flag IS '削除フラグ';


--
-- Name: user_notifications; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE user_notifications (
    user_id integer NOT NULL,
    no bigint NOT NULL,
    status integer,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE user_notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE user_notifications IS 'ユーザへの通知';


--
-- Name: COLUMN user_notifications.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.user_id IS 'ユーザID';


--
-- Name: COLUMN user_notifications.no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.no IS 'NO';


--
-- Name: COLUMN user_notifications.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.status IS 'ステータス';


--
-- Name: COLUMN user_notifications.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.row_id IS '行ID';


--
-- Name: COLUMN user_notifications.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.insert_user IS '登録ユーザ';


--
-- Name: COLUMN user_notifications.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.insert_datetime IS '登録日時';


--
-- Name: COLUMN user_notifications.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.update_user IS '更新ユーザ';


--
-- Name: COLUMN user_notifications.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.update_datetime IS '更新日時';


--
-- Name: COLUMN user_notifications.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_notifications.delete_flag IS '削除フラグ';


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE user_roles (
    user_id integer NOT NULL,
    role_id integer NOT NULL,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE user_roles; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE user_roles IS 'ユーザの権限';


--
-- Name: COLUMN user_roles.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.user_id IS 'ユーザID';


--
-- Name: COLUMN user_roles.role_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.role_id IS '権限ID';


--
-- Name: COLUMN user_roles.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.row_id IS '行ID';


--
-- Name: COLUMN user_roles.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.insert_user IS '登録ユーザ';


--
-- Name: COLUMN user_roles.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.insert_datetime IS '登録日時';


--
-- Name: COLUMN user_roles.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.update_user IS '更新ユーザ';


--
-- Name: COLUMN user_roles.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.update_datetime IS '更新日時';


--
-- Name: COLUMN user_roles.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN user_roles.delete_flag IS '削除フラグ';


--
-- Name: users; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE users (
    user_id integer NOT NULL,
    user_key character varying(256) NOT NULL,
    user_name character varying(256) NOT NULL,
    password character varying(1024) NOT NULL,
    salt character varying(1024),
    locale_key character varying(12),
    mail_address character varying(256),
    auth_ldap integer,
    row_id character varying(64),
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE users IS 'ユーザ';


--
-- Name: COLUMN users.user_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.user_id IS 'ユーザID';


--
-- Name: COLUMN users.user_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.user_key IS 'ユーザKEY	 ユニーク';


--
-- Name: COLUMN users.user_name; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.user_name IS 'ユーザ名';


--
-- Name: COLUMN users.password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.password IS 'パスワード	 ハッシュ(不可逆)';


--
-- Name: COLUMN users.salt; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.salt IS 'SALT';


--
-- Name: COLUMN users.locale_key; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.locale_key IS 'ロケール';


--
-- Name: COLUMN users.mail_address; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.mail_address IS 'メールアドレス';


--
-- Name: COLUMN users.auth_ldap; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.auth_ldap IS 'LDAP認証ユーザかどうか';


--
-- Name: COLUMN users.row_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.row_id IS '行ID';


--
-- Name: COLUMN users.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.insert_user IS '登録ユーザ';


--
-- Name: COLUMN users.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.insert_datetime IS '登録日時';


--
-- Name: COLUMN users.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.update_user IS '更新ユーザ';


--
-- Name: COLUMN users.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.update_datetime IS '更新日時';


--
-- Name: COLUMN users.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN users.delete_flag IS '削除フラグ';


--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE users_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE users_user_id_seq OWNED BY users.user_id;


--
-- Name: view_histories; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE view_histories (
    history_no bigint NOT NULL,
    knowledge_id bigint NOT NULL,
    view_date_time timestamp without time zone NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE view_histories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE view_histories IS 'ナレッジの参照履歴';


--
-- Name: COLUMN view_histories.history_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.history_no IS 'HISTORY_NO';


--
-- Name: COLUMN view_histories.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN view_histories.view_date_time; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.view_date_time IS '日時';


--
-- Name: COLUMN view_histories.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.insert_user IS '登録ユーザ';


--
-- Name: COLUMN view_histories.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.insert_datetime IS '登録日時';


--
-- Name: COLUMN view_histories.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.update_user IS '更新ユーザ';


--
-- Name: COLUMN view_histories.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.update_datetime IS '更新日時';


--
-- Name: COLUMN view_histories.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN view_histories.delete_flag IS '削除フラグ';


--
-- Name: view_histories_history_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE view_histories_history_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: view_histories_history_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE view_histories_history_no_seq OWNED BY view_histories.history_no;


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE votes (
    vote_no bigint NOT NULL,
    knowledge_id bigint NOT NULL,
    vote_kind integer NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE votes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE votes IS '投票';


--
-- Name: COLUMN votes.vote_no; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.vote_no IS 'VOTE_NO';


--
-- Name: COLUMN votes.knowledge_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.knowledge_id IS 'ナレッジID';


--
-- Name: COLUMN votes.vote_kind; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.vote_kind IS '投票区分';


--
-- Name: COLUMN votes.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.insert_user IS '登録ユーザ';


--
-- Name: COLUMN votes.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.insert_datetime IS '登録日時';


--
-- Name: COLUMN votes.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.update_user IS '更新ユーザ';


--
-- Name: COLUMN votes.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.update_datetime IS '更新日時';


--
-- Name: COLUMN votes.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN votes.delete_flag IS '削除フラグ';


--
-- Name: votes_vote_no_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE votes_vote_no_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: votes_vote_no_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE votes_vote_no_seq OWNED BY votes.vote_no;


--
-- Name: webhook_configs; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE webhook_configs (
    hook_id integer NOT NULL,
    hook character varying(20) NOT NULL,
    url character varying(256) NOT NULL,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer,
    ignore_proxy integer,
    template text
);


--
-- Name: TABLE webhook_configs; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE webhook_configs IS 'Webhooks 設定';


--
-- Name: COLUMN webhook_configs.hook_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.hook_id IS 'HOOK ID';


--
-- Name: COLUMN webhook_configs.hook; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.hook IS 'HOOK';


--
-- Name: COLUMN webhook_configs.url; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.url IS 'URL';


--
-- Name: COLUMN webhook_configs.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.insert_user IS '登録ユーザ';


--
-- Name: COLUMN webhook_configs.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.insert_datetime IS '登録日時';


--
-- Name: COLUMN webhook_configs.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.delete_flag IS '削除フラグ';


--
-- Name: COLUMN webhook_configs.ignore_proxy; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.ignore_proxy IS 'IGNORE_PROXY';


--
-- Name: COLUMN webhook_configs.template; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhook_configs.template IS 'TEMPLATE';


--
-- Name: webhook_configs_hook_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE webhook_configs_hook_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webhook_configs_hook_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE webhook_configs_hook_id_seq OWNED BY webhook_configs.hook_id;


--
-- Name: webhooks; Type: TABLE; Schema: public; Owner: -; Tablespace: 
--

CREATE TABLE webhooks (
    webhook_id character varying(64) NOT NULL,
    status integer NOT NULL,
    hook character varying(20),
    content text,
    insert_user integer,
    insert_datetime timestamp without time zone,
    update_user integer,
    update_datetime timestamp without time zone,
    delete_flag integer
);


--
-- Name: TABLE webhooks; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE webhooks IS 'Webhooks';


--
-- Name: COLUMN webhooks.webhook_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.webhook_id IS 'WEBHOOK ID';


--
-- Name: COLUMN webhooks.status; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.status IS 'ステータス';


--
-- Name: COLUMN webhooks.hook; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.hook IS 'HOOK';


--
-- Name: COLUMN webhooks.content; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.content IS '通知用json文字列';


--
-- Name: COLUMN webhooks.insert_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.insert_user IS '登録ユーザ';


--
-- Name: COLUMN webhooks.insert_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.insert_datetime IS '登録日時';


--
-- Name: COLUMN webhooks.update_user; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.update_user IS '更新ユーザ';


--
-- Name: COLUMN webhooks.update_datetime; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.update_datetime IS '更新日時';


--
-- Name: COLUMN webhooks.delete_flag; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN webhooks.delete_flag IS '削除フラグ';


--
-- Name: no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY access_logs ALTER COLUMN no SET DEFAULT nextval('access_logs_no_seq'::regclass);


--
-- Name: image_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY account_images ALTER COLUMN image_id SET DEFAULT nextval('account_images_image_id_seq'::regclass);


--
-- Name: activity_no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY activities ALTER COLUMN activity_no SET DEFAULT nextval('activities_activity_no_seq'::regclass);


--
-- Name: no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY badges ALTER COLUMN no SET DEFAULT nextval('badges_no_seq'::regclass);


--
-- Name: comment_no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY comments ALTER COLUMN comment_no SET DEFAULT nextval('comments_comment_no_seq'::regclass);


--
-- Name: draft_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY draft_knowledges ALTER COLUMN draft_id SET DEFAULT nextval('draft_knowledges_draft_id_seq'::regclass);


--
-- Name: group_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY groups ALTER COLUMN group_id SET DEFAULT nextval('groups_group_id_seq'::regclass);


--
-- Name: file_no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY knowledge_files ALTER COLUMN file_no SET DEFAULT nextval('knowledge_files_file_no_seq'::regclass);


--
-- Name: knowledge_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY knowledges ALTER COLUMN knowledge_id SET DEFAULT nextval('knowledges_knowledge_id_seq'::regclass);


--
-- Name: no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY like_comments ALTER COLUMN no SET DEFAULT nextval('like_comments_no_seq'::regclass);


--
-- Name: no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY likes ALTER COLUMN no SET DEFAULT nextval('likes_no_seq'::regclass);


--
-- Name: hook_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY mail_hooks ALTER COLUMN hook_id SET DEFAULT nextval('mail_hooks_hook_id_seq'::regclass);


--
-- Name: no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY notices ALTER COLUMN no SET DEFAULT nextval('notices_no_seq'::regclass);


--
-- Name: no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY notifications ALTER COLUMN no SET DEFAULT nextval('notifications_no_seq'::regclass);


--
-- Name: no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY pins ALTER COLUMN no SET DEFAULT nextval('pins_no_seq'::regclass);


--
-- Name: role_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY roles ALTER COLUMN role_id SET DEFAULT nextval('roles_role_id_seq'::regclass);


--
-- Name: stock_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY stocks ALTER COLUMN stock_id SET DEFAULT nextval('stocks_stock_id_seq'::regclass);


--
-- Name: tag_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY tags ALTER COLUMN tag_id SET DEFAULT nextval('tags_tag_id_seq'::regclass);


--
-- Name: type_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY template_masters ALTER COLUMN type_id SET DEFAULT nextval('template_masters_type_id_seq'::regclass);


--
-- Name: user_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY users ALTER COLUMN user_id SET DEFAULT nextval('users_user_id_seq'::regclass);


--
-- Name: history_no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY view_histories ALTER COLUMN history_no SET DEFAULT nextval('view_histories_history_no_seq'::regclass);


--
-- Name: vote_no; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY votes ALTER COLUMN vote_no SET DEFAULT nextval('votes_vote_no_seq'::regclass);


--
-- Name: hook_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY webhook_configs ALTER COLUMN hook_id SET DEFAULT nextval('webhook_configs_hook_id_seq'::regclass);


--
-- Name: access_logs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY access_logs
    ADD CONSTRAINT access_logs_pkc PRIMARY KEY (no);


--
-- Name: account_images_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY account_images
    ADD CONSTRAINT account_images_pkc PRIMARY KEY (image_id);


--
-- Name: activities_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY activities
    ADD CONSTRAINT activities_pkc PRIMARY KEY (activity_no);


--
-- Name: badges_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY badges
    ADD CONSTRAINT badges_pkc PRIMARY KEY (no);


--
-- Name: comments_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY comments
    ADD CONSTRAINT comments_pkc PRIMARY KEY (comment_no);


--
-- Name: confirm_mail_changes_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY confirm_mail_changes
    ADD CONSTRAINT confirm_mail_changes_pkc PRIMARY KEY (id);


--
-- Name: draft_item_values_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY draft_item_values
    ADD CONSTRAINT draft_item_values_pkc PRIMARY KEY (draft_id, type_id, item_no);


--
-- Name: draft_knowledges_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY draft_knowledges
    ADD CONSTRAINT draft_knowledges_pkc PRIMARY KEY (draft_id);


--
-- Name: events_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY events
    ADD CONSTRAINT events_pkc PRIMARY KEY (knowledge_id);


--
-- Name: functions_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY functions
    ADD CONSTRAINT functions_pkc PRIMARY KEY (function_key);


--
-- Name: groups_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY groups
    ADD CONSTRAINT groups_pkc PRIMARY KEY (group_id);


--
-- Name: hash_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY hash_configs
    ADD CONSTRAINT hash_configs_pkc PRIMARY KEY (system_name);


--
-- Name: item_choices_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY item_choices
    ADD CONSTRAINT item_choices_pkc PRIMARY KEY (type_id, item_no, choice_no);


--
-- Name: knowledge_edit_groups_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_edit_groups
    ADD CONSTRAINT knowledge_edit_groups_pkc PRIMARY KEY (knowledge_id, group_id);


--
-- Name: knowledge_edit_users_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_edit_users
    ADD CONSTRAINT knowledge_edit_users_pkc PRIMARY KEY (knowledge_id, user_id);


--
-- Name: knowledge_files_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_files
    ADD CONSTRAINT knowledge_files_pkc PRIMARY KEY (file_no);


--
-- Name: knowledge_groups_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_groups
    ADD CONSTRAINT knowledge_groups_pkc PRIMARY KEY (knowledge_id, group_id);


--
-- Name: knowledge_histories_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_histories
    ADD CONSTRAINT knowledge_histories_pkc PRIMARY KEY (knowledge_id, history_no);


--
-- Name: knowledge_item_values_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_item_values
    ADD CONSTRAINT knowledge_item_values_pkc PRIMARY KEY (knowledge_id, type_id, item_no);


--
-- Name: knowledge_tags_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_tags
    ADD CONSTRAINT knowledge_tags_pkc PRIMARY KEY (knowledge_id, tag_id);


--
-- Name: knowledge_users_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledge_users
    ADD CONSTRAINT knowledge_users_pkc PRIMARY KEY (knowledge_id, user_id);


--
-- Name: knowledges_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY knowledges
    ADD CONSTRAINT knowledges_pkc PRIMARY KEY (knowledge_id);


--
-- Name: ldap_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY ldap_configs
    ADD CONSTRAINT ldap_configs_pkc PRIMARY KEY (system_name);


--
-- Name: like_comments_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY like_comments
    ADD CONSTRAINT like_comments_pkc PRIMARY KEY (no);


--
-- Name: likes_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY likes
    ADD CONSTRAINT likes_pkc PRIMARY KEY (no);


--
-- Name: locales_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY locales
    ADD CONSTRAINT locales_pkc PRIMARY KEY (key);


--
-- Name: login_histories_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY login_histories
    ADD CONSTRAINT login_histories_pkc PRIMARY KEY (user_id, login_count);


--
-- Name: mail_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_configs
    ADD CONSTRAINT mail_configs_pkc PRIMARY KEY (system_name);


--
-- Name: mail_hook_conditions_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_hook_conditions
    ADD CONSTRAINT mail_hook_conditions_pkc PRIMARY KEY (hook_id, condition_no);


--
-- Name: mail_hook_ignore_conditions_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_hook_ignore_conditions
    ADD CONSTRAINT mail_hook_ignore_conditions_pkc PRIMARY KEY (hook_id, condition_no, ignore_condition_no);


--
-- Name: mail_hooks_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_hooks
    ADD CONSTRAINT mail_hooks_pkc PRIMARY KEY (hook_id);


--
-- Name: mail_locale_templates_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_locale_templates
    ADD CONSTRAINT mail_locale_templates_pkc PRIMARY KEY (template_id, key);


--
-- Name: mail_posts_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_posts
    ADD CONSTRAINT mail_posts_pkc PRIMARY KEY (message_id);


--
-- Name: mail_properties_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_properties
    ADD CONSTRAINT mail_properties_pkc PRIMARY KEY (hook_id, property_key);


--
-- Name: mail_templates_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mail_templates
    ADD CONSTRAINT mail_templates_pkc PRIMARY KEY (template_id);


--
-- Name: mails_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY mails
    ADD CONSTRAINT mails_pkc PRIMARY KEY (mail_id);


--
-- Name: notices_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY notices
    ADD CONSTRAINT notices_pkc PRIMARY KEY (no);


--
-- Name: notification_status_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY notification_status
    ADD CONSTRAINT notification_status_pkc PRIMARY KEY (type, target_id, user_id);


--
-- Name: notifications_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY notifications
    ADD CONSTRAINT notifications_pkc PRIMARY KEY (no);


--
-- Name: notify_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY notify_configs
    ADD CONSTRAINT notify_configs_pkc PRIMARY KEY (user_id);


--
-- Name: notify_queues_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY notify_queues
    ADD CONSTRAINT notify_queues_pkc PRIMARY KEY (hash);


--
-- Name: participants_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY participants
    ADD CONSTRAINT participants_pkc PRIMARY KEY (knowledge_id, user_id);


--
-- Name: password_resets_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY password_resets
    ADD CONSTRAINT password_resets_pkc PRIMARY KEY (id);


--
-- Name: pins_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY pins
    ADD CONSTRAINT pins_pkc PRIMARY KEY (no);


--
-- Name: point_knowledge_histories_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY point_knowledge_histories
    ADD CONSTRAINT point_knowledge_histories_pkc PRIMARY KEY (knowledge_id, history_no);


--
-- Name: point_user_histories_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY point_user_histories
    ADD CONSTRAINT point_user_histories_pkc PRIMARY KEY (user_id, history_no);


--
-- Name: provisional_registrations_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY provisional_registrations
    ADD CONSTRAINT provisional_registrations_pkc PRIMARY KEY (id);


--
-- Name: proxy_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY proxy_configs
    ADD CONSTRAINT proxy_configs_pkc PRIMARY KEY (system_name);


--
-- Name: read_marks_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY read_marks
    ADD CONSTRAINT read_marks_pkc PRIMARY KEY (no, user_id);


--
-- Name: role_functions_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY role_functions
    ADD CONSTRAINT role_functions_pkc PRIMARY KEY (role_id, function_key);


--
-- Name: roles_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_pkc PRIMARY KEY (role_id);


--
-- Name: service_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY service_configs
    ADD CONSTRAINT service_configs_pkc PRIMARY KEY (service_name);


--
-- Name: service_locale_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY service_locale_configs
    ADD CONSTRAINT service_locale_configs_pkc PRIMARY KEY (service_name, locale_key);


--
-- Name: stock_knowledges_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY stock_knowledges
    ADD CONSTRAINT stock_knowledges_pkc PRIMARY KEY (stock_id, knowledge_id);


--
-- Name: stocks_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY stocks
    ADD CONSTRAINT stocks_pkc PRIMARY KEY (stock_id);


--
-- Name: survey_answers_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY survey_answers
    ADD CONSTRAINT survey_answers_pkc PRIMARY KEY (knowledge_id, answer_id);


--
-- Name: survey_choices_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY survey_choices
    ADD CONSTRAINT survey_choices_pkc PRIMARY KEY (knowledge_id, item_no, choice_no);


--
-- Name: survey_item_answers_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY survey_item_answers
    ADD CONSTRAINT survey_item_answers_pkc PRIMARY KEY (knowledge_id, answer_id, item_no);


--
-- Name: survey_items_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY survey_items
    ADD CONSTRAINT survey_items_pkc PRIMARY KEY (knowledge_id, item_no);


--
-- Name: surveys_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY surveys
    ADD CONSTRAINT surveys_pkc PRIMARY KEY (knowledge_id);


--
-- Name: system_attributes_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY system_attributes
    ADD CONSTRAINT system_attributes_pkc PRIMARY KEY (system_name, config_name);


--
-- Name: system_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY system_configs
    ADD CONSTRAINT system_configs_pkc PRIMARY KEY (system_name, config_name);


--
-- Name: systems_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY systems
    ADD CONSTRAINT systems_pkc PRIMARY KEY (system_name);


--
-- Name: tags_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY tags
    ADD CONSTRAINT tags_pkc PRIMARY KEY (tag_id);


--
-- Name: template_items_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY template_items
    ADD CONSTRAINT template_items_pkc PRIMARY KEY (type_id, item_no);


--
-- Name: template_masters_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY template_masters
    ADD CONSTRAINT template_masters_pkc PRIMARY KEY (type_id);


--
-- Name: tokens_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY tokens
    ADD CONSTRAINT tokens_pkc PRIMARY KEY (token);


--
-- Name: user_alias_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY user_alias
    ADD CONSTRAINT user_alias_pkc PRIMARY KEY (user_id, auth_key);


--
-- Name: user_badges_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY user_badges
    ADD CONSTRAINT user_badges_pkc PRIMARY KEY (user_id, no);


--
-- Name: user_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY user_configs
    ADD CONSTRAINT user_configs_pkc PRIMARY KEY (system_name, user_id, config_name);


--
-- Name: user_groups_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY user_groups
    ADD CONSTRAINT user_groups_pkc PRIMARY KEY (user_id, group_id);


--
-- Name: user_notifications_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY user_notifications
    ADD CONSTRAINT user_notifications_pkc PRIMARY KEY (user_id, no);


--
-- Name: user_roles_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY user_roles
    ADD CONSTRAINT user_roles_pkc PRIMARY KEY (user_id, role_id);


--
-- Name: users_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkc PRIMARY KEY (user_id);


--
-- Name: view_histories_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY view_histories
    ADD CONSTRAINT view_histories_pkc PRIMARY KEY (history_no);


--
-- Name: votes_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY votes
    ADD CONSTRAINT votes_pkc PRIMARY KEY (vote_no);


--
-- Name: webhook_configs_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY webhook_configs
    ADD CONSTRAINT webhook_configs_pkc PRIMARY KEY (hook_id);


--
-- Name: webhooks_pkc; Type: CONSTRAINT; Schema: public; Owner: -; Tablespace: 
--

ALTER TABLE ONLY webhooks
    ADD CONSTRAINT webhooks_pkc PRIMARY KEY (webhook_id);


--
-- Name: idx_account_images_user_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX idx_account_images_user_id ON account_images USING btree (user_id);


--
-- Name: idx_activities_kind_target; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_activities_kind_target ON activities USING btree (kind, target);


--
-- Name: idx_activities_user_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_activities_user_id ON activities USING btree (user_id);


--
-- Name: idx_comments_knowledge_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_comments_knowledge_id ON comments USING btree (knowledge_id);


--
-- Name: idx_knowledge_files_knowledge_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_knowledge_files_knowledge_id ON knowledge_files USING btree (knowledge_id);


--
-- Name: idx_knowledge_id_varchar; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_knowledge_id_varchar ON knowledges USING btree (((knowledge_id)::character varying(20)));


--
-- Name: idx_like_comments_comment_no; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_like_comments_comment_no ON like_comments USING btree (comment_no);


--
-- Name: idx_likes_knowledge_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_likes_knowledge_id ON likes USING btree (knowledge_id);


--
-- Name: idx_mails_status; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_mails_status ON mails USING btree (status);


--
-- Name: idx_point_knowledge_histories_insert_datetime; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_point_knowledge_histories_insert_datetime ON point_knowledge_histories USING btree (insert_datetime);


--
-- Name: idx_point_user_histories_insert_datetime; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_point_user_histories_insert_datetime ON point_user_histories USING btree (insert_datetime);


--
-- Name: idx_users_user_key; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX idx_users_user_key ON users USING btree (user_key);


--
-- Name: idx_view_histories_insert_user; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_view_histories_insert_user ON view_histories USING btree (insert_user);


--
-- Name: idx_view_histories_knowledge_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_view_histories_knowledge_id ON view_histories USING btree (knowledge_id);


--
-- Name: idx_view_histories_knowledge_id_insert_user; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_view_histories_knowledge_id_insert_user ON view_histories USING btree (knowledge_id, insert_user);


--
-- Name: idx_votes_knowledge_id; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_votes_knowledge_id ON votes USING btree (knowledge_id);


--
-- Name: idx_webhooks_status; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX idx_webhooks_status ON webhooks USING btree (status);


--
-- Name: insert_user; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE INDEX insert_user ON pins USING btree (insert_user);


--
-- Name: tokens_ix1; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX tokens_ix1 ON tokens USING btree (user_id);


--
-- Name: user_alias_ix1; Type: INDEX; Schema: public; Owner: -; Tablespace: 
--

CREATE UNIQUE INDEX user_alias_ix1 ON user_alias USING btree (auth_key, alias_key);


--
-- PostgreSQL database dump complete
--


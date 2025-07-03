export interface User {
    user_id: number;
    user_key: string;
    user_name: string;
    mail_address: string;
    auth_ldap: number;
    locale_key?: string;
    insert_datetime: string;
    update_datetime: string;
    
    // Additional properties for compatibility
    name?: string;
    email?: string;
    email_verified_at?: string;
}

export interface Knowledge {
    knowledge_id: number;
    title: string;
    content: string;
    public_flag: number;
    tag_ids?: string;
    tag_names?: string;
    like_count: number;
    comment_count: number;
    view_count: number;
    type_id?: number;
    notify_status: number;
    point: number;
    anonymous: number;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Relations
    creator?: User;
    updater?: User;
    tags?: Tag[];
    templateMaster?: TemplateMaster;
    comments?: Comment[];
    files?: KnowledgeFile[];
    likes?: Like[];
    
    // Computed
    highlighted_title?: string;
    highlighted_content?: string;
    can_edit?: boolean;
    user_liked?: boolean;
    related_knowledges?: Knowledge[];
}

export interface Comment {
    comment_no: number;
    knowledge_id: number;
    comment: string;
    comment_status: number;
    anonymous: number;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Relations
    knowledge?: Knowledge;
    creator?: User;
    likes?: LikeComment[];
    files?: KnowledgeFile[];
    
    // Computed
    like_count?: number;
    user_liked?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
}

export interface Tag {
    tag_id: number;
    tag_name: string;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Computed
    knowledges_count?: number;
    usage_count?: number;
}

export interface KnowledgeFile {
    file_no: number;
    knowledge_id?: number;
    comment_no?: number;
    file_name: string;
    real_file_name: string;
    file_size: number;
    file_type: string;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Relations
    uploader?: User;
    
    // Computed
    formatted_file_size?: string;
    is_image?: boolean;
    download_url?: string;
    view_url?: string;
    thumbnail_url?: string;
}

export interface Like {
    like_no: number;
    knowledge_id: number;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Relations
    user?: User;
}

export interface LikeComment {
    like_comment_no: number;
    comment_no: number;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Relations
    user?: User;
}

export interface TemplateMaster {
    type_id: number;
    type_name: string;
    type_icon?: string;
    description?: string;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Computed
    knowledges_count?: number;
    usage_count?: number;
}

export interface Group {
    group_id: number;
    group_name: string;
    description?: string;
    insert_user: number;
    insert_datetime: string;
    update_user: number;
    update_datetime: string;
    delete_flag: number;
    
    // Relations
    users?: User[];
    
    // Computed
    member_count?: number;
}

export interface SearchStats {
    total_results: number;
    by_type: Record<number, number>;
    by_tag: Record<string, number>;
    by_author: Record<number, number>;
}

export interface CommentStats {
    total_comments: number;
    active_comments: number;
    hidden_comments: number;
    anonymous_comments: number;
    today_comments: number;
    week_comments: number;
    month_comments: number;
    top_commented_knowledges: Array<{
        knowledge_id: number;
        title: string;
        comments_count: number;
    }>;
    top_comment_users: Array<{
        insert_user: number;
        comment_count: number;
        creator?: User;
    }>;
}

export interface PaginationData<T> {
    data: T[];
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number;
    to: number;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

export interface PageProps {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        info?: string;
        warning?: string;
    };
    errors?: Record<string, string>;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: Record<string, string[]>;
}

// Form data types
export interface KnowledgeFormData {
    title: string;
    content: string;
    public_flag: number;
    type_id?: number;
    anonymous: boolean;
    tags: string[];
    allowed_users: number[];
    allowed_groups: number[];
    edit_users: number[];
    edit_groups: number[];
    temp_file_ids: string[];
}

export interface CommentFormData {
    knowledge_id: number;
    comment: string;
    anonymous: boolean;
    temp_file_ids: string[];
}

export interface SearchFilters {
    search?: string;
    tag?: string;
    template?: number;
    public_flag?: number;
    creator?: string;
    date_from?: string;
    date_to?: string;
    sort?: string;
}

// Constants
export const PUBLIC_FLAGS = {
    PRIVATE: 0,
    PUBLIC: 1,
    PROTECT: 2,
} as const;

export const COMMENT_STATUS = {
    ACTIVE: 0,
    HIDDEN: 1,
} as const;

export const SORT_OPTIONS = {
    RELEVANCE: 'relevance',
    CREATED: 'created',
    UPDATED: 'updated',
    LIKES: 'likes',
    VIEWS: 'views',
    COMMENTS: 'comments',
    TITLE: 'title',
} as const;
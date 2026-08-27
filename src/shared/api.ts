/*!
 * General types  for API communication.
 *
 * Author:  u/Beach-Brews
 * License: BSD-3-Clause
 */

export type ApiResponse<T> = {
    code: number;
    message: string;
    result: T | undefined;
};

export type MessageResponse = ApiResponse<void>;

export type SubredditInfoDto = {
    name: string;
    icon: string | null;
};

/*
export type FlairDto = {
    // TODO: handle rich text emoji flairs
    text?: string | undefined;
    cssClass?: string | undefined;
    textColor?: string | undefined;
    backgroundColor?: string | undefined;
};
*/

export type UserInfoDto = {
    //username: string;
    snoovatar: string | undefined;
    //authorFlair: FlairDto | undefined;
};

/*
export type PostModInfoDto = {
    approved: boolean;
    removed: boolean;
    stickied: boolean;
    spam: boolean;
    numReports: number;
    userReportReasons: string[];
    modReports: [string, string][];
    modReportReasons: string[];
    ignoringReports: boolean;
    collapsedBecauseCrowdControl: boolean;
};
*/

export type PostInfoDto = {
    title: string;
};

export type CommentDto = {
    id: `t1_${string}`;
    postId: `t3_${string}`;
    authorName: string;
    replyAuthorName: string | null;
    body: string;
    createdAt: number;
    score: number;
    edited: boolean;
    locked: boolean;
    removed: boolean;
    spam: boolean;
    permalink: string;
    //distinguishedBy: string | undefined;
    //modInfo?: PostModInfoDto | undefined;
};

export type UserNameToUserInfoMap = Record<string, UserInfoDto>;
export type PostIdToPostInfoMap = Record<string, PostInfoDto>;

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
};

export type CommentGroupDto = {
    users: UserNameToUserInfoMap;
    posts: PostIdToPostInfoMap;
    comments: CommentDto[];
};

export type CommentListResponse = CommentGroupDto & {
    pagination: Pagination;
};

export type InitCommentFeedResponse = {
    subInfo: SubredditInfoDto;
    isMod?: true | undefined;
};

export type ModCmdRequest = {
    cmd: 'clear' | 'preload';
    sub?: string;
};

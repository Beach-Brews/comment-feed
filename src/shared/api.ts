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
    icon: string | undefined;
};

export type UserInfoDto = {
    username: string;
    userId: string;
    snoovar: string;
};

export type PostDto = {
    id: `t3_${string}`;
    title: string;
};

export type CommentDto = {
    id: `t1_${string}`;
    post: PostDto;
    replyTo: string | null;
    user: UserInfoDto;
    body: string;
    date: number;
};

export type InitializeHubResponse = {
    comments: CommentDto[];
    subInfo: SubredditInfoDto;
};

export type Pagination = {
    page: number;
    pageSize: number;
    total: number;
};

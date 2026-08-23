/*!
* Helper to easily link to posts or comments.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import { MouseEvent } from 'react';
import { navigateTo } from '@devvit/web/client';
import { T1, T3 } from '../../shared/types';

export type BaseLinkOptions = {
    event: MouseEvent;
};

export type PathLinkOptions = BaseLinkOptions & {
    path: string;
    username?: never;
    postId?: never;
    commentId?: never;
};

export type UserLinkOptions = BaseLinkOptions & {
    path?: never;
    username: string;
    postId?: never;
    commentId?: never;
};

export type PostLinkOptions = BaseLinkOptions & {
    path?: never;
    username?: never;
    postId: T3;
    commentId?: never;
};

export type CommentLinkOptions = BaseLinkOptions & {
    path?: never;
    username?: never;
    postId: T3;
    commentId: T1;
};

export type LinkOptions =
    PathLinkOptions |
    UserLinkOptions |
    PostLinkOptions |
    CommentLinkOptions;

export const openLink = (options: LinkOptions) => {
    const { event } = options;
    event.stopPropagation();
    event.preventDefault();

    if ('path' in options) {
        navigateTo(`https://www.reddit.com${options.path}`);
    } else if ('username' in options) {
        navigateTo(`https://www.reddit.com/u/${options.username}`);
    } else if ('commentId' in options) {
        navigateTo(`https://www.reddit.com/comments/${options.postId}/comment/${options.commentId}`);
    } else if ('postId' in options) {
        navigateTo(`https://www.reddit.com/comments/${options.postId}`);
    }

};

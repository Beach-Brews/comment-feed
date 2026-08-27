/*!
* Helper to easily link to posts or comments.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import { MouseEvent } from 'react';
import { navigateTo } from '@devvit/web/client';
import { T1, T3 } from '../../shared/types';
import { context } from '@devvit/web/client';

export type BaseLinkOptions = {};

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

export const linkForThing = (options: LinkOptions) => {
    if ('path' in options) {
        return options.path.startsWith('https')
            ? options.path
            : `https://www.reddit.com${options.path}`;
    } else if ('username' in options) {
        return `https://www.reddit.com/u/${options.username}`;
    } else if ('commentId' in options) {
        return `https://www.reddit.com/r/${context.subredditName}/comments/${options.postId.substring(3)}/comment/${options.commentId.substring(3)}`;
    } else if ('postId' in options) {
        return `https://www.reddit.com/r/${context.subredditName}/comments/${options.postId.substring(3)}`;
    }
    return '#';
};

const isMeta = (e: MouseEvent) =>
    e.button !== 0 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey;

export const openLink = (event: MouseEvent, options: LinkOptions) => {
    event.stopPropagation();
    if (event.currentTarget.tagName === 'A' && isMeta(event))
        return false;
    event.preventDefault();
    navigateTo(linkForThing(options));
    return true;
};

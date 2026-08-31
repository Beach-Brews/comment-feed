/*!
 * Various helper methods for getting comment data.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { T1 } from '../../shared/types';
import { reddit, Comment, Post } from '@devvit/web/server';
import {
    CommentGroupDto,
    CommentDto,
    PostIdToPostInfoMap,
    UserNameToUserInfoMap, UserInfoDto,
} from '../../shared/api';
import { toDistinct } from './setUtils';
import { AppSettings } from './AppSettings';

type CommentIdToAuthorMap = Partial<Record<T1, string>>;

const getReplyAuthorMap = async (
    comments: Comment[]
): Promise<CommentIdToAuthorMap> => {
    // Map already fetched comments => authors
    const authorMap: CommentIdToAuthorMap = Object.fromEntries(comments.map(c => [c.id, c.authorName] as const));

    // Get any t1 parent ids (i.e. replied to a comment, not a post)
    const replyIds = toDistinct(
        comments
            .filter((c) => c.parentId.startsWith('t1_') && authorMap[c.parentId as T1] === undefined)
            .map((c) => c.parentId as T1)
    );

    // If no additional comments, return the map of comments to authors
    if (replyIds.length <= 0) return authorMap;

    // Fetch the comment details for these T1s
    // const replyComments = await Promise.all(
    //     replyIds.map(i => reddit.getCommentById(i))
    // );
    const replyComments: Comment[] = [];
    for (const id of replyIds) {
        replyComments.push(await reddit.getCommentById(id));
    }

    // Create map of commentId to author username
    return replyComments.reduce(
        (m, c) => {
            m[c.id] = c.authorName;
            return m;
        },
        authorMap
    );
};

const getPostInfoMap = async (
    comments: Comment[]
): Promise<PostIdToPostInfoMap> => {
    // Get a distinct list of postIds
    const postIds = toDistinct(comments.map((c) => c.postId));

    // Fetch the post details for the postIds
    // const posts = await Promise.all(
    //     postIds.map(i => reddit.getPostById(i))
    // );
    const posts: Post[] = [];
    for (const id of postIds) {
        posts.push(await reddit.getPostById(id));
    }

    // Create map of postIds to post infos
    return posts.reduce(
        (m, p) => {
            m[p.id] = {
                title: p.title
            };
            return m;
        },
        {} as PostIdToPostInfoMap
    );
};

const getUserInfoMap = async (
    comments: Comment[]
): Promise<UserNameToUserInfoMap> => {
    // Get a distinct list of usernames
    const usernames = toDistinct(comments.map((c) => c.authorName));

    // Fetch the user details for the usernames
    // const userInfos = await Promise.all(
    //     usernames.map(async u => [
    //         u,
    //         {
    //             snoovatar: await reddit.getSnoovatarUrl(u)
    //         } satisfies UserInfoDto
    //     ] as const)
    // );
    const userInfos: [string, UserInfoDto][] = [];
    for (const user of usernames) {
        userInfos.push([user, { snoovatar: await reddit.getSnoovatarUrl(user) }]);
    }

    // Create map of usernames to user infos
    return Object.fromEntries(userInfos);
};

export const getCommentInfoByIds = async (commentIds: T1[], userIsMod: boolean): Promise<CommentGroupDto> => {

    // Get ignore list setting
    const ignoredUsers = await AppSettings.GetUserIgnoreList();

    // Get comments from the passed in IDs
    const comments = (
        await Promise.all(commentIds.map((i) => reddit.getCommentById(i)))
    ).filter((c) => !c.removed && !c.spam && !ignoredUsers.has(c.authorName.toLowerCase()) &&
        c.body !== '[deleted]' && c.body !== '[removed]');

    // Call reddit API on users and posts
    // const [replyAuthors, postMap, userMap] = await Promise.all([
    //     getReplyAuthorMap(comments),
    //     getPostInfoMap(comments),
    //     getUserInfoMap(comments)
    // ]);
    const replyAuthors = await getReplyAuthorMap(comments);
    const postMap = await getPostInfoMap(comments);
    const userMap = await getUserInfoMap(comments);

    // Convert to DTOs
    const commentDtos = comments.map(
        (c) => {
            const commentData: CommentDto = {
                id: c.id,
                postId: c.postId,
                authorName: c.authorName,
                replyAuthorName: c.parentId.startsWith(`t1_`)
                    ? (replyAuthors[c.parentId as T1] ?? null)
                    : null,
                body: c.body,
                createdAt: c.createdAt.getTime(),
                score: c.score,
                edited: c.edited,
                locked: c.locked,
                permalink: c.permalink,
                distinguished: c.isDistinguished(),
                distinguishedBy: c.distinguishedBy,
            } satisfies CommentDto;

            if (userIsMod) {
                commentData.modInfo = {
                    approved: c.approved,
                    stickied: c.stickied,
                    numReports: c.numReports,
                    userReportReasons: c.userReportReasons,
                    modReports: c.modReports.map(r => ([r.reason, r.author] as const)),
                    ignoringReports: c.ignoringReports,
                    collapsedBecauseCrowdControl: c.collapsedBecauseCrowdControl
                };
            }

            return commentData;
        }
    );

    return {
        users: userMap,
        posts: postMap,
        comments: commentDtos
    };
};

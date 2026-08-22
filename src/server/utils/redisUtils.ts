/*!
 * Various helper methods for managing the Redis data.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { CommentV2 } from '@devvit/web/shared';
import { redis, type Comment } from '@devvit/web/server';
import { T1 } from '../../shared/types';
import { AppSettings } from './AppSettings';

const RedisKeys = {
    CommentSet: () => `com:st`
};

export const addComment = async (comment: Comment | CommentV2): Promise<void> => {
    const key = RedisKeys.CommentSet();
    await redis.zAdd(key, { member: comment.id, score: Date.now() });
    await redis.zRemRangeByRank(key, 0, -1 * (await AppSettings.GetCommentCount()));
};

export const removeCommentId = async (id: T1): Promise<void> => {
    await redis.zRem(RedisKeys.CommentSet(), [id]);
};

export const hasCommentId = async (id: T1): Promise<boolean> => {
    return await redis.zScore(RedisKeys.CommentSet(), id) !== undefined;
};

export type CommentPage = {
    comments: T1[];
    total: number;
};

export const getCommentIdsForPage = async (
    page: number,
    pageSize: number
): Promise<CommentPage> => {
    const key = RedisKeys.CommentSet();
    return {
        comments: (
            await redis.zRange(key, (page - 1) * pageSize, page * pageSize, {
                by: 'rank',
            })
        ).map((m) => m.member as T1),
        total: await redis.zCard(key),
    };
};

export const clearAllComments = async (): Promise<void> => {
    await redis.del(RedisKeys.CommentSet());
};

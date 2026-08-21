/*!
 * Various helper methods for managing the Redis data.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { redis, Comment } from '@devvit/web/server';
import { T1 } from '../../shared/types';
import { AppSettings } from './AppSettings';

const RedisKeys = {
    CommentSet: () => `com:st`
};

export const addComment = async (comment: Comment) => {
    const key = RedisKeys.CommentSet();
    await redis.zAdd(key, { member: comment.id, score: Date.now() });
    await redis.zRemRangeByRank(key, 0, -1 * (await AppSettings.GetCommentCount()));
};

export const removeCommentId = async (id: T1) => {
    await redis.zRem(RedisKeys.CommentSet(), [id]);
};

export const hasCommentId = async (id: T1) => {
    return await redis.zScore(RedisKeys.CommentSet(), id) !== undefined;
};

export const getIdsForPage = async (page: number, pageSize: number) => {
    return await redis.zRange(RedisKeys.CommentSet(), (page-1)*pageSize, page*pageSize, { by: 'rank'});
};

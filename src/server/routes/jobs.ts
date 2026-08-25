/*!
 * Defines API endpoints for schedulers/jobs.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { context, reddit, type TaskResponse, type Comment } from '@devvit/web/server';
import { Logger } from '../utils/Logger';
import { AppSettings } from '../utils/AppSettings';
import { addComment } from '../utils/redisUtils';

export const jobs = new Hono();

class TimeLimitError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

jobs.post('/preload', async (c) => {
    const logger = await Logger.Create('Job - Preload');
    try {
        logger.debug('Starting to preload comments from recent posts');

        const start = Date.now();
        let count = 0;
        const hotPosts = reddit.getHotPosts({
            subredditName: context.subredditName,
            limit: 1000,
            pageSize: 10
        });

        const ignoredUsers = await AppSettings.GetUserIgnoreList();
        const targetCount = await AppSettings.GetCommentCount();
        const addCommentRecursive = async (comment: Comment) => {
            const runTime = Date.now() - start;
            if (runTime > 15000)
               throw new TimeLimitError(`Max execution time of 15 seconds reached: ${runTime}ms`);

            if (
                !comment.isRemoved() &&
                !comment.isSpam() &&
                !ignoredUsers.has(comment.authorName.toLowerCase())
            ) {
                await addComment(comment, comment.createdAt.getTime());
                ++count;
            }

            for await (const reply of comment.replies) {
                await addCommentRecursive(reply);
            }
        };

        try {
            while (hotPosts.hasMore && count < targetCount) {
                for await (const post of hotPosts) {
                    if (post.removed || post.spam) continue;
                    for await (const comment of post.comments) {
                        await addCommentRecursive(comment);
                    }
                }
            }
        } catch (err) {
            if (err instanceof TimeLimitError) {
                logger.warn(err.message);
            } else {
                logger.error('Error during preloading: ', err);
            }
        }

        logger.info(`Preloaded a total of ${count}`);
        return c.json<TaskResponse>({ }, 200);

    } catch (error) {
        logger.error(`Error preloading comments: `, error);
        return c.json<TaskResponse>({ }, 500);
    }
});

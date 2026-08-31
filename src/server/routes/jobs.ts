/*!
 * Defines API endpoints for schedulers/jobs.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import {
    context,
    reddit,
    type TaskRequest,
    type TaskResponse,
    type Comment,
    scheduler,
} from '@devvit/web/server';
import { Logger } from '../utils/Logger';
import { AppSettings, LogLevel } from '../utils/AppSettings';
import {
    addComment,
    commentCount,
    checkAppUpdate
} from '../utils/redisUtils';

export const jobs = new Hono();

class TimeLimitError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

jobs.post('/preload', async (c) => {
    const logger = await Logger.Create('Job - Preload');
    try {
        // Save start time
        const start = Date.now();

        // Process job parameters
        const { data } = await c.req.json<TaskRequest<{
            subredditName?: string | null;
            after?: string | null;
            iteration?: number | null;
        }>>();
        const subredditName =
            data?.subredditName && data.subredditName.length > 0
                ? data.subredditName
                : context.subredditName;
        let after: string | undefined = data?.after ?? undefined;
        const iteration = data?.iteration ?? 1;
        logger.debug('Starting to preload comments from new posts of r/', subredditName, ' starting at post "', after, '" as iteration ', iteration);

        // Get comment count and compare to target
        let count = await commentCount();
        let postCount = 0;
        const targetCount = await AppSettings.GetCommentCount();
        if (count >= targetCount) {
            logger.info(`Target count already reached: ${count}`);
            return c.json<TaskResponse>({}, 200);
        }

        // Get user ignore list
        const ignoredUsers = await AppSettings.GetUserIgnoreList();
        if (logger.isLogEnabled(LogLevel.Debug)) {
            logger.debug('Target count ', targetCount, ' with ', count,
                ' currently. Ignoring: ', [...ignoredUsers].join(', '));
        }

        // Helper function for processing comments recursively
        const addCommentRecursive = async (comment: Comment) => {
            // Throw exception if long-running
            const runTime = Date.now() - start;
            if (runTime > 15000)
               throw new TimeLimitError(`Max execution time of 15 seconds reached: ${runTime}ms`);

            // Only add comment if not removed or ignored
            if (
                !comment.removed &&
                !comment.spam &&
                !ignoredUsers.has(comment.authorName.toLowerCase())
            ) {
                await addComment(comment, comment.createdAt.getTime());
                ++count;
            }

            // Recursively add replies
            for await (const reply of comment.replies) {
                if (count >= targetCount) return;
                await addCommentRecursive(reply);
            }
        };

        try {
            let hasMore = false;
            do {
                // Get the first batch of 1000 posts
                logger.debug('Processing batch of 1000 new posts. Current count: ', count);
                const postsList = reddit.getNewPosts({
                    subredditName: subredditName,
                    limit: 1000,
                    pageSize: 10,
                    after: after
                });

                // For each post
                for await (const post of postsList) {
                    // Break if target reached
                    if (count >= targetCount) break;

                    // Save post ID for use fetching the next batch (or on job resume)
                    after = post.id;
                    ++postCount;

                    // Skip if post is removed/deleted
                    if (post.removed || post.spam ||
                        post.title.toLowerCase() === '[deleted]' ||
                        post.title.toLowerCase() === '[removed]'
                    ) {
                        continue;
                    }

                    // Add all comments in post recursively
                    for await (const comment of post.comments) {
                        if (count >= targetCount) break;
                        await addCommentRecursive(comment);
                    }
                }

                // Determine if there is another batch to process
                hasMore = postsList.hasMore;

            } while (hasMore && count < targetCount);

        } catch (err) {
            // Determine if the time limit was reached
            if (err instanceof TimeLimitError) {
                logger.warn('Processed ', postCount, ' posts: ', err.message);
                if (iteration < 50) {
                    await scheduler.runJob({
                        name: 'preload',
                        runAt: new Date(Date.now() + 1000 + Math.random() * 3000),
                        data: {
                            subredditName,
                            after: after ?? null,
                            iteration: iteration + 1
                        },
                    });
                } else {
                    logger.warn('Max preload iteration count ', iteration, ' reached.');
                }
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

// ============  Hourly Check ============

jobs.post('/hourly-checks', async (c) => {
    const logger = await Logger.Create('Job - Hourly Checks');
    try {
        await checkAppUpdate();
        return c.json<TaskResponse>({ }, 200);

    } catch (error) {
        logger.error(`Error preloading comments: `, error);
        return c.json<TaskResponse>({ }, 500);
    }
});

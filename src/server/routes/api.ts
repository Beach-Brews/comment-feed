/*!
 * Defines API endpoints from the app client.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { context, reddit, scheduler, cache } from '@devvit/web/server';
import { JsonValue } from '@devvit/web/shared';
import {
    ApiResponse,
    InitCommentFeedResponse,
    CommentListResponse,
    MessageResponse,
    ModCmdRequest,
} from '../../shared/api';
import { getCommentInfoByIds } from '../utils/commentUtils';
import { Logger } from '../utils/Logger';
import { clearAllComments, getCommentIdsForPage } from '../utils/redisUtils';
import { isMod } from '../utils/userUtils';

export const api = new Hono();

api.post('/mod-cmd', async (c) => {
    const logger = await Logger.Create('API - Mod Command');
    try {
        // Throw error if not a mod
        if (!(await isMod()))
            throw new Error(`User ${context.username} is not a mod.`);

        // Get command
        const cmd = await c.req.json<ModCmdRequest>();
        logger.debug('Received mod command: ', cmd);

        switch (cmd.cmd) {
            case 'preload':
                // Schedule job
                await scheduler.runJob({
                    name: 'preload',
                    runAt: new Date(Date.now() + 1000 + Math.random() * 3000),
                });
                logger.info('Scheduled preload job');
                break;

            case 'clear':
                await clearAllComments();
                logger.info('Cleared all comments');
                break;
        }

        return c.json<MessageResponse>(
            {
                code: 200,
                message: 'Preload scheduled',
                result: undefined
            },
            200
        );

    } catch (error) {
        logger.error(`Mod Command Error:`, error);
        return c.json<MessageResponse>(
            {
                code: 500,
                message: error instanceof Error ? error.message : 'Unknown error',
                result: undefined,
            },
            500
        );
    }
});

api.get('/init', async (c) => {
    const logger = await Logger.Create('API - Init');
    try {
        // Determine if user is a mod or not
        const userIsMod = await isMod();

        // Get subreddit info (from cache)
        const result = (await cache(
            async () => {
                const sub = await reddit.getCurrentSubreddit();
                return {
                    subInfo: {
                        name: sub.name,
                        icon: sub.settings.communityIcon ?? null
                    },
                } satisfies InitCommentFeedResponse;
            },
            {
                key: `api:init:subInfo`,
                ttl: 60,
            }
        )) as InitCommentFeedResponse;

        // Only add isMod if actually a mod (security)
        if (userIsMod)
            result.isMod = true;

        return c.json<ApiResponse<InitCommentFeedResponse>>(
            {
                code: 200,
                message: 'Preload scheduled',
                result: result,
            },
            200
        );
    } catch (error) {
        logger.error(`Init API Error:`, error);
        return c.json<MessageResponse>(
            {
                code: 500,
                message: error instanceof Error ? error.message : 'Unknown error',
                result: undefined,
            },
            500
        );
    }
});

type PaginationParams = {
    p?: number | undefined;
    s?: number | undefined;
    f?: boolean | undefined;
};

api.get('/comments', async (c) => {
    const logger = await Logger.Create('API - Comment List');
    try {
        // Determine if user is a mod or not
        const userIsMod = await isMod();

        // Get pagination parameters
        const {
            p: page = 1,
            s: pageSize = 25,
            f: force = false
        } = c.req.query() as unknown as PaginationParams;
        logger.debug(
            'Begin API. Is Mod: ', userIsMod,
            ' | Page: ', page,
            ' | Size: ', pageSize,
            ' | Force: ', force
        );

        // Define cache function
        const fetchData = async () => {
            // Track processing start (performance metrics)
            const start = Date.now();
            logger.debug('Fetching comment data - Time:  ', start);

            // Fetch page data from Redis
            const commentPage = context.userId === undefined
                ? { comments: [], total: 0  }
                : await getCommentIdsForPage(page, pageSize);

            // Fetch comment and user data
            const commentData = await getCommentInfoByIds(commentPage.comments);

            // Log processing time
            const exTime = Date.now() - start;
            logger.debug(`Finished processing ${commentData.comments.length} comments in ${exTime}ms.`);

            // Return result
            return {
                users: commentData.users,
                posts: commentData.posts,
                comments: commentData.comments,
                pagination: {
                    page: page,
                    pageSize: pageSize,
                    total: commentPage.total,
                }
            } satisfies CommentListResponse as JsonValue;
        };

        // Get value from cache, unless mod requested a forced update
        // TODO: Semi-big bug: Next page may return some comments from the previous page when new comments are added and
        // ranks shift
        const cacheResult = force && userIsMod
            ? await fetchData()
            : await cache(fetchData, {
                key: `api:comment:${page}:${pageSize}`,
                ttl: 60
            });

        // Cast result
        const result = cacheResult as CommentListResponse | undefined;

        return c.json<ApiResponse<CommentListResponse>>({
            code: 200,
            message: 'OK',
            result: result ?? undefined,
        });

    } catch (error) {
        logger.error(`Comment List API Error:`, error);
        return c.json<MessageResponse>({
                code: 500,
                message: error instanceof Error
                    ? error.message
                    : 'Unknown error',
                result: undefined
            },
            500
        );
    }
});

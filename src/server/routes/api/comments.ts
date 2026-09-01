/*!
 * Defines API endpoint for fetching comment data pages.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { context, cache } from '@devvit/web/server';
import { JsonValue } from '@devvit/web/shared';
import {
    ApiResponse,
    CommentListResponse,
    MessageResponse,
} from '../../../shared/api';
import { getCommentInfoByIds } from '../../utils/commentUtils';
import { Logger } from '../../utils/Logger';
import { getCommentIdsForPage } from '../../utils/redisUtils';
import { isMod } from '../../utils/userUtils';

const CommentApiParamSchema = z.object({
    p: z.coerce.number().optional().default(1),
    s: z.coerce.number().optional().default(25),
    f: z.coerce.boolean().optional().default(false)
});

export const comments = new Hono();

comments.get('/comments', zValidator('query', CommentApiParamSchema), async (c) => {
    const logger = await Logger.Create('API - Comment List');
    try {
        // Determine if user is a mod or not
        const userIsMod = await isMod();

        // Get pagination parameters
        const {
            p: page = 1,
            s: pageSize = 25,
            f: force = false,
        } = c.req.valid('query');
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
            const commentPage =
                context.userId === undefined
                    ? { comments: [], total: 0 }
                    : await getCommentIdsForPage(page, pageSize);
            logger.debug(
                'Received ',
                commentPage.comments.length,
                ' comments to process'
            );

            // Fetch comment and user data
            const commentData =
                await getCommentInfoByIds(commentPage.comments, userIsMod);

            // Log processing time
            const exTime = Date.now() - start;
            logger.debug(
                `Finished processing ${commentData.comments.length} comments in ${exTime}ms.`
            );

            // Return result
            return {
                users: commentData.users,
                posts: commentData.posts,
                comments: commentData.comments,
                pagination: {
                    page: page,
                    pageSize: pageSize,
                    total: commentPage.total,
                },
            } satisfies CommentListResponse as JsonValue;
        };

        // Get value from cache, unless mod requested a forced update
        // TODO: Semi-big bug: Next page may return some comments from the previous page when new comments are added and
        // ranks shift
        const cacheResult =
            force && userIsMod
                ? await fetchData()
                : await cache(fetchData, {
                      key: `api:comment:${page}:${pageSize}`,
                      ttl: 60,
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
        return c.json<MessageResponse>(
            {
                code: 500,
                message:
                    error instanceof Error ? error.message : 'Unknown error',
                result: undefined,
            },
            500
        );
    }
});

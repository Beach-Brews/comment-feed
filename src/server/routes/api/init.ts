/*!
 * Defines API endpoint used for initializing the app.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { reddit, cache } from '@devvit/web/server';
import { ApiResponse, InitCommentFeedResponse, MessageResponse } from '../../../shared/api';
import { Logger } from '../../utils/Logger';
import { getAppUpdateInfo } from '../../utils/redisUtils';
import { isMod } from '../../utils/userUtils';

export const init = new Hono();

init.get('/init', async (c) => {
    const logger = await Logger.Create('API - Init');
    try {
        // Determine if user is a mod or not
        const userIsMod = await isMod();
        logger.debug('User is mod: ', userIsMod);

        // Get subreddit info (from cache)
        const result = (await cache(
            async () => {
                logger.debug('Cache miss. Getting subreddit info.');
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
                ttl: 300,
            }
        )) as InitCommentFeedResponse;
        logger.debug('Subreddit info: ', result);

        // Only add isMod and update info if actually a mod (security)
        if (userIsMod) {
            result.isMod = true;
            result.updateInfo = await getAppUpdateInfo();
        }

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

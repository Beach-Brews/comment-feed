/*!
 * Defines API endpoints from the app client.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { context, reddit, scheduler } from '@devvit/web/server';
import {
    ApiResponse,
    InitializeHubResponse,
    MessageResponse,
    ModCmdRequest,
} from '../../shared/api';
import { getCommentInfoByIds } from '../utils/commentUtils';
import { Logger } from '../utils/Logger';
import { clearAllComments, getCommentIdsForPage } from '../utils/redisUtils';
import { isMod } from '../utils/userUtils';

export const api = new Hono();

api.post('/hub/mod-cmd', async (c) => {
    const logger = await Logger.Create('API - Hub Mod Command');
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
        logger.error(`Hub Mod Command Error:`, error);
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

api.get('/hub/init', async (c) => {
    const logger = await Logger.Create('API - Hub Init');
    try {
        // TODO: Page parameters in query
        const page = 1;
        const pageSize = 25

        // TODO: Allow mods to force a cache skip
        // TODO: Add cache

        // Get comments for page
        const commentPage = await getCommentIdsForPage(page, pageSize);

        // Get subreddit and comment info
        const [currentSub, commentData] = await Promise.all([
            reddit.getCurrentSubreddit(),
            getCommentInfoByIds(commentPage.comments),
        ]);

        return c.json<ApiResponse<InitializeHubResponse>>({
            code: 200,
            message: 'OK',
            result: {
                users: commentData.users,
                posts: commentData.posts,
                comments: commentData.comments,
                subInfo: {
                    name: currentSub.name,
                    icon: currentSub.settings.communityIcon,
                },
            },
        });
    } catch (error) {
        logger.error(`Hub Init Error:`, error);
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

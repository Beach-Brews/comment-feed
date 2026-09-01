/*!
 * Defines API endpoint for processing various mod commands.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { context, scheduler } from '@devvit/web/server';
import { MessageResponse, ModCmdRequest } from '../../../shared/api';
import { Logger } from '../../utils/Logger';
import { clearAllComments } from '../../utils/redisUtils';
import { isMod } from '../../utils/userUtils';

export const modCmd = new Hono();

modCmd.post('/mod-cmd', async (c) => {
    const logger = await Logger.Create('API - Mod Command');
    try {
        // Throw error if not a mod
        if (!(await isMod()))
            throw new Error(`User ${context.username} is not a mod.`);

        // Get command
        const { cmd, sub } = await c.req.json<ModCmdRequest>();
        logger.debug('Received mod command: ', cmd);

        switch (cmd) {
            case 'preload':
                // Schedule job
                await scheduler.runJob({
                    name: 'preload',
                    runAt: new Date(Date.now() + 1000 + Math.random() * 3000),
                    data: { subredditName: sub && sub.length > 0 ? sub : null },
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

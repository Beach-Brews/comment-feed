/*!
 * Defines API endpoint for creating the comment list post.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context, EntrypointHeight, reddit } from '@devvit/web/server';
import { Logger } from '../utils/Logger';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
    const logger = await Logger.Create('Menu - Create Feed Post');
    try {
        logger.debug('Creating feed post');
        const post = await reddit.submitCustomPost({
            title: `r/${context.subredditName} Comment Feed`,
            textFallback: {
                text: `r/${context.subredditName} Comment Feed`,
            },
            styles: {
                backgroundColor: '#ffffffff',
                backgroundColorDark: '#000000ff',
                height: EntrypointHeight.TALL
            },
        });

        logger.info(`Created new feed post: ${post.id}`);
        return c.json<UiResponse>(
            {
                navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
            },
            200
        );
    } catch (error) {
        logger.error(`Error creating post: `, error);
        return c.json<UiResponse>(
            {
                showToast: 'Failed to create post',
            },
            500
        );
    }
});

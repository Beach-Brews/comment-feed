/*!
 * Defines API endpoint for creating the comment list post.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import type { UiResponse } from '@devvit/web/shared';
import { context, EntrypointHeight, reddit } from '@devvit/web/server';

export const menu = new Hono();

menu.post('/post-create', async (c) => {
    try {
        const post = await reddit.submitCustomPost({
            title: `r/${context.subredditName} Comment List`,
            textFallback: {
                text: `r/${context.subredditName} Comment List`,
            },
            styles: {
                backgroundColor: '#ffffffff',
                backgroundColorDark: '#000000ff',
                height: EntrypointHeight.TALL
            },
        });

        return c.json<UiResponse>(
            {
                navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
            },
            200
        );
    } catch (error) {
        console.error(`Error creating post: ${error}`);
        return c.json<UiResponse>(
            {
                showToast: 'Failed to create post',
            },
            400
        );
    }
});

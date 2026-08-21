/*!
 * Defines API endpoints for the various Devvit triggers.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import type {
    OnAppInstallRequest,
    OnAppUpgradeRequest,
    TriggerResponse,
} from '@devvit/web/shared';
import { context } from '@devvit/web/server';

export const triggers = new Hono();

triggers.post('/on-app-install', async (c) => {
    try {
        const input = await c.req.json<OnAppInstallRequest>();

        // TODO: Pull top 100 "hot" posts, grab all comments and push them into
        // the redis set

        return c.json<TriggerResponse>(
            {
                status: 'success',
                message: `App installed in subreddit ${context.subredditName} with (trigger: ${input.type})`,
            },
            200
        );
    } catch (error) {
        console.error(`Error installing: ${error}`);
        return c.json<TriggerResponse>(
            {
                status: 'error',
                message: 'Failed to install',
            },
            400
        );
    }
});

triggers.post('/on-app-upgrade', async (c) => {
    try {
        const input = await c.req.json<OnAppUpgradeRequest>();

        return c.json<TriggerResponse>(
            {
                status: 'success',
                message: `App upgrade in subreddit ${context.subredditName} with (trigger: ${input.type})`,
            },
            200
        );
    } catch (error) {
        console.error(`Error upgrading: ${error}`);
        return c.json<TriggerResponse>(
            {
                status: 'error',
                message: 'Failed to upgrade',
            },
            400
        );
    }
});

// "onCommentCreate": "/internal/triggers/on-comment-create",
// "onCommentDelete": "/internal/triggers/on-comment-delete",
// "onAutomoderatorFilterComment": "/internal/triggers/on-automoderator-filter-comment",
// "onModAction": "/internal/triggers/on-mod-action"
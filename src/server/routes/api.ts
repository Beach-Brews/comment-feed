/*!
 * Defines API endpoints from the app client.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono } from 'hono';
import { reddit } from '@devvit/web/server';
import type { ApiResponse, InitializeHubResponse } from '../../shared/api';
import { getCommentInfoByIds } from '../utils/commentUtils';

type ErrorResponse = {
    status: 'error';
    message: string;
};

export const api = new Hono();

api.get('/hub/init', async (c) => {
    try {
        // TODO: Allow mods to force a cache skip
        // TODO: Add cache

        // TODO: Get from redis sorted set
        const tempComments = await reddit
            .getCommentsByUser({
                username: 'beach-brews',
                sort: 'new',
                limit: 10,
                pageSize: 10,
            })
            .all();
        const commentIds = tempComments.map((c) => c.id);

        // Get subreddit and comment info
        const [currentSub, commentData] = await Promise.all([
            reddit.getCurrentSubreddit(),
            getCommentInfoByIds(commentIds),
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
        console.error(`Hub Init Error:`, error);
        let errorMessage = 'Unknown error during hub initialization';
        if (error instanceof Error) {
            errorMessage = `Hub initialization failed: ${error.message}`;
        }
        return c.json<ErrorResponse>(
            { status: 'error', message: errorMessage },
            400
        );
    }
});

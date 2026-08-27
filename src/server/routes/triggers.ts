/*!
 * Defines API endpoints for the various Devvit triggers.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Hono, Context } from 'hono';
import type {
    OnAppInstallRequest,
    OnAppUpgradeRequest,
    OnCommentCreateRequest,
    OnCommentDeleteRequest,
    OnAutomoderatorFilterCommentRequest,
    OnModActionRequest,
    TriggerResponse
} from '@devvit/web/shared';
import { context, scheduler, ModActionType } from '@devvit/web/server';
import { Logger } from '../utils/Logger';
import { addComment, removeCommentId } from '../utils/redisUtils';
import { T1 } from '../../shared/types';
import { AppSettings } from '../utils/AppSettings';

export const triggers = new Hono();

type TriggerHandler<TReq> = (logger: Logger, input: TReq) => Promise<string | TriggerResponse>;
const handleTrigger = async <TReq>(c: Context, name: string, handler: TriggerHandler<TReq>) => {
    const logger = await Logger.Create('Trigger - ' + name);
    try {
        const input = await c.req.json<TReq>();
        logger.debug('Trigger request: ', input);

        const result = await handler(logger, input);
        logger.debug('Trigger handler returned: ', result);

        if (typeof result === 'string') {
            return c.json<TriggerResponse>({ status: 'success', message: result, }, 200);
        }

        return c.json<TriggerResponse>(result, 400);

    } catch (error) {
        logger.error(`Error processing trigger: `, error);
        return c.json<TriggerResponse>(
            {
                status: 'error',
                message: `Error processing ${name} trigger`,
            },
            500
        );
    }
};

triggers.post('/on-app-install', async (c) => {
    return await handleTrigger<OnAppInstallRequest>(c, 'App Install', async (logger, input) => {
        logger.info(`Beginning install of ${context.appSlug}v${context.appVersion} by u/${input.installer?.name ?? 'unknown'}`);

        await scheduler.runJob({
            name: 'preload',
            runAt: new Date(Date.now() + 1000 + (Math.random() * 3000)),
            data: { subredditName: null }
        });

        logger.info('Install successful');
        return 'Install successful';
    });
});

triggers.post('/on-app-upgrade', async (c) => {
    return await handleTrigger<OnAppUpgradeRequest>(c, 'App Upgrade', async (logger, input) => {
        logger.info(`Beginning upgrade to ${context.appSlug}v${context.appVersion} by u/${input.installer?.name ?? 'unknown'}`);
        return 'Upgrade successful';
    });
});

triggers.post('/on-comment-create', async (c) => {
    return await handleTrigger<OnCommentCreateRequest>(c, 'Comment Create', async (logger, input) => {
        logger.debug('Process comment create: ', input);
        const ignoredUsers = await AppSettings.GetUserIgnoreList();
        if (input?.comment && !ignoredUsers.has(input.comment.author.toLowerCase()) && input?.post && !input.post.spam) {
            await addComment(input.comment);
        }
        return 'Comment Create successful';
    });
});

triggers.post('/on-comment-delete', async (c) => {
    return await handleTrigger<OnCommentDeleteRequest>(c, 'Comment Delete', async (logger, input) => {
        logger.debug('Process comment delete: ', input);
        if (input?.commentId)
            await removeCommentId(input.commentId as T1);
        return 'Comment Delete successful';
    });
});

triggers.post('/on-automoderator-filter-comment', async (c) => {
    return await handleTrigger<OnAutomoderatorFilterCommentRequest>(c, 'Comment Automod Filter', async (logger, input) => {
        logger.debug('Process comment automod filtered: ', input);
        if (input?.comment)
            await removeCommentId(input.comment.id as T1);
        return 'Comment Automod Filtered successful';
    });
});

triggers.post('/on-mod-action', async (c) => {
    return await handleTrigger<OnModActionRequest>(c, 'Mod Action', async (logger, input) => {
        logger.debug('Process mod action: ', input);
        const comment = input?.targetComment;
        if (comment) {
            const action = input.action as ModActionType | undefined;
            switch (action) {
                case 'approvecomment':
                    await addComment(comment);
                    break;

                case 'removecomment':
                case 'spamcomment':
                    await removeCommentId(comment.id as T1);
                    break;
            }
        }
        return 'Mod Action successful';
    });
});

/*!
 * Various helper methods for managing the Redis data.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { CommentV2 } from '@devvit/web/shared';
import { redis, reddit, type Comment, context } from '@devvit/web/server';
import { T1 } from '../../shared/types';
import { AppSettings } from './AppSettings';
import { AppUpdateInfoDto } from '../../shared/api';
import { z } from 'zod';
import { Logger } from './Logger';
import { Constants } from '../constants';

const RedisKeys = {
    CommentSet: () => `com:st`,
    AppUpdateInfo: () => `app:updateInfo`,
};

export const addComment = async (comment: Comment | CommentV2, time?: number): Promise<void> => {
    const key = RedisKeys.CommentSet();
    await redis.zAdd(key, { member: comment.id, score: time ?? Date.now() });
    await redis.zRemRangeByRank(key, 0, -1 * (await AppSettings.GetCommentCount()));
};

export const removeCommentId = async (id: T1): Promise<void> => {
    await redis.zRem(RedisKeys.CommentSet(), [id]);
};

export const hasCommentId = async (id: T1): Promise<boolean> => {
    return await redis.zScore(RedisKeys.CommentSet(), id) !== undefined;
};

export const commentCount = async (): Promise<number> => {
    return await redis.zCard(RedisKeys.CommentSet());
};

export type CommentPage = {
    comments: T1[];
    total: number;
};

export const getCommentIdsForPage = async (
    page: number,
    pageSize: number
): Promise<CommentPage> => {
    const key = RedisKeys.CommentSet();
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;
    return {
        comments: (await redis.zRange(key, start, end, { by: 'rank', reverse: true }))
            .map((m) => m.member as T1),
        total: await redis.zCard(key),
    };
};

export const clearAllComments = async (): Promise<void> => {
    await redis.del(RedisKeys.CommentSet());
};

// ========== App Update ==========

export const appUpdateInfoSchema = z.looseObject({
    latestVersion: z.string().regex(/\d+\.\d+\.\d+(\.\d+)?/),
    urgent: z.boolean().default(false),
    message: z.string().nullish(),
});

export const getAppUpdateInfo = async (): Promise<
    AppUpdateInfoDto | undefined
> => {
    const [update, content] = await redis.hMGet(RedisKeys.AppUpdateInfo(), [
        'update',
        'content',
    ]);
    return update === 'true' && content
        ? ((await appUpdateInfoSchema.parseAsync(
              JSON.parse(content)
          )) satisfies AppUpdateInfoDto)
        : undefined;
};

export const checkAppUpdate = async () => {
    // Create logger
    const logger = await Logger.Create('Task - Check App Update');
    const redisKey = RedisKeys.AppUpdateInfo();
    try {
        // Get value stored in Redis
        const redisVal = await redis.hGetAll(redisKey);
        logger.debug('Existing redis data: ', redisVal);

        // Only check wiki every hour
        const lastCheck = redisVal.time ? parseInt(redisVal.time) : NaN;
        if (!isNaN(lastCheck) && lastCheck > Date.now() - 3600000) {
            logger.debug('Last check less than 1 hour ago. No check needed.');
            return;
        }

        // Read update wiki page from r/CommunitySurvey
        const wikiPage = await reddit.getWikiPage(
            Constants.APP_SUBREDDIT_NAME,
            Constants.APP_UPDATE_WIKI_PATH
        );
        const wikiContent = wikiPage.content;
        logger.debug('Fetched wiki content: ', wikiContent);

        // If empty, print warning
        if (!wikiContent) {
            logger.warn('Update Info Wiki Empty');
            await redis.hSet(redisKey, { 'time': Date.now().toString() });
            return;
        }

        // If redis matches wiki content, no problem!
        if (redisVal.content === wikiContent) {
            logger.debug('Redis value matches wiki content. No update needed.');
            await redis.hSet(redisKey, { 'time': Date.now().toString() });
            return;
        }

        // Parse the wiki page
        const wikiDto = (await appUpdateInfoSchema.parseAsync(
            JSON.parse(wikiContent)
        )) satisfies AppUpdateInfoDto;

        // If latest version in wiki matches the app version, no problem!
        if (wikiDto.latestVersion === context.appVersion) {
            logger.debug(
                `App version ${context.appVersion} matches wiki latestVersion ${wikiDto.latestVersion}`
            );
            await redis.hSet(redisKey, {
                'time': Date.now().toString(),
                'content': wikiContent,
                'update': 'false',
            });
            return;
        }

        // If version string doesn't match, parse out the version number parts (confirm wiki > installed)
        const wikiVersion = wikiDto.latestVersion.match(/^\d+\.\d+\.\d+.*$/)
            ? wikiDto.latestVersion.split('.').map(Number)
            : null;
        const appVersion = context.appVersion.match(/^\d+\.\d+\.\d+.*$/)
            ? context.appVersion.split('.').map(Number)
            : null;

        // If failed to parse the parts, warn and return
        if (!wikiVersion || !appVersion) {
            logger.warn(
                `Failed to parse wiki version '${wikiVersion?.[0]}' or app version '${appVersion?.[0]}' parts`
            );
            return;
        }

        // Check if wiki version is newer
        const compVersion = () => {
            for (let i = 0; i < 3; i++) {
                const wiki = wikiVersion[i] ?? 0;
                const app = appVersion[i] ?? 0;
                if (wiki > app) return true;
                if (wiki < app) return false;
            }
            return false;
        };
        const hasUpdate = compVersion();
        logger.info(
            `Wiki version ${wikiDto.latestVersion} ${hasUpdate ? 'greater than' : 'less than or equal to'} installed version ${context.appVersion}.`
        );

        // Save wiki content to redis
        await redis.hSet(redisKey, {
            'time': Date.now().toString(),
            'content': wikiContent,
            'update': hasUpdate.toString(),
        });
    } catch (e) {
        logger.error('Failed to check update wiki: ', e);

        try {
            await redis.hSet(redisKey, {
                'time': Date.now().toString(),
            });
        } catch (e2) {
            logger.error('Failed to update app update last check time: ', e2);
        }
    }
};

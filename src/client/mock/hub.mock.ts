/*!
 * Mock data responses for testing survey hub locally.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { defineMock } from 'vite-plugin-mock-dev-server';
import {
    ApiResponse,
    CommentDto,
    CommentListResponse,
    InitCommentFeedResponse,
    PostIdToPostInfoMap,
    UserInfoDto,
    UserNameToUserInfoMap,
} from '../../shared/api';
import { genT1, genT3, SampleSubInfo } from './mockData';

// noinspection JSUnusedLocalSymbols
// @ts-expect-error Only for some test cases
const EmptySample: CommentListResponse = {
    users: {},
    posts: {},
    comments: [],
    pagination: {
        page: 1,
        pageSize: 25,
        total: 0
    }
};

const TestPostIds = [genT3(), genT3(), genT3(), genT3(),
    genT3(), genT3(), genT3(), genT3()];
const SampleUsersMap = {
    'User-Name-More-0': {
        snoovatar:
            'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User-Name-More-1': {
        snoovatar:
            'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User-Name-More-2': {
        snoovatar:
            'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User-Name-More-3': {
        snoovatar:
            'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User-Name-More-4': {
        snoovatar:
            'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User-Name-More-5': {
        snoovatar:
            'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
} as Record<string, UserInfoDto>;

// noinspection JSUnusedGlobalSymbols
export default defineMock([
    {
        url: '/api/init',
        method: 'GET',
        body: {
            code: 200,
            message: 'OK',
            result: {
                subInfo: SampleSubInfo,
                isMod: true,
                updateInfo: {
                    latestVersion: '0.1.1',
                    urgent: true,
                    message: 'Update notice goes here!'
                }
            },
        } satisfies ApiResponse<InitCommentFeedResponse>,
    },
    {
        url: '/api/comments',
        method: 'GET',
        delay: 2000,
        body: ({ query }) => {
            const { p = 1, s = 25 } = query;
            const comments: CommentDto[] = [];
            const size = p == 5 ? 10 : s;
            for (let i = 0; i < size; ++i) {
                const reportCount = Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0;
                comments.push({
                    id: genT1(),
                    postId:
                        TestPostIds[
                            Math.floor(Math.random() * TestPostIds.length)
                        ] ?? genT3(),
                    authorName: `User-Name-More-${Math.floor(Math.random() * 15)}`,
                    replyAuthorName:
                        Math.random() < 0.5
                            ? `User-Name-More-${Math.floor(Math.random() * 15)}`
                            : null,
                    body: `Page ${p} Comment ${i} with lots of text that hopefully spans over multiple lines. It's something I need too make sure I test to ensure that I can actually fit all of them in the cards when it spans over multiple lines.`,
                    createdAt: Date.now(),
                    score: Math.floor(Math.random() * 1000),
                    edited: Math.random() > 0.5,
                    locked: Math.random() > 0.5,
                    permalink: '',
                    distinguished: Math.random() > 0.5,
                    distinguishedBy: 'ModeratorName',
                    modInfo: {
                        approved: Math.random() > 0.5,
                        stickied: Math.random() > 0.5,
                        numReports: reportCount,
                        userReportReasons: reportCount > 0 ? ['Test Report Reason'] : [],
                        modReports: reportCount > 0 ? [['Mod Reason', 'Mod Name']] : [],
                        ignoringReports: Math.random() > 0.5,
                        collapsedBecauseCrowdControl: Math.random() > 0.5
                    },
                });
            }
            const users = comments.reduce((m, c) => {
                m[c.authorName] = SampleUsersMap[c.authorName] ?? { snoovatar: undefined };
                return m;
            }, {} as UserNameToUserInfoMap);
            const posts = comments.reduce((m, c) => {
                m[c.postId] = { title: `Post with a title and id ${c.postId} which is longer to make sure it spans over a few lines like it would cause the title to wrap onto lines and cause extra spacing.`};
                return m;
            }, {} as PostIdToPostInfoMap);
            return {
                code: 200,
                message: 'OK',
                result: {
                    users,
                    posts,
                    comments,
                    pagination: {
                        page: p,
                        pageSize: s,
                        total: s*4+10
                    }
                },
            } satisfies ApiResponse<CommentListResponse>
        },
    },
]);

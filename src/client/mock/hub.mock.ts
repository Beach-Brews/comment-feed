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
    'User0': {
        snoovatar: 'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User1': {
        snoovatar: 'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User2': {
        snoovatar: 'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User3': {
        snoovatar: 'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User4': {
        snoovatar: 'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
    },
    'User5': {
        snoovatar: 'https://preview.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878-headshot.png?width=64&height=64&crop=smart&auto=webp&s=b37e8128af3c3fac9c6e6357291d30911a7f735f',
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
                isMod: true
            },
        } satisfies ApiResponse<InitCommentFeedResponse>,
    },
    {
        url: '/api/comments',
        method: 'GET',
        delay: 5000,
        body: ({ query }) => {
            const { p = 1, s = 25 } = query;
            const comments: CommentDto[] = [];
            const size = p == 5 ? 10 : s;
            for (let i = 0; i < size; ++i) {
                comments.push({
                    id: genT1(),
                    postId: TestPostIds[Math.floor(Math.random()*TestPostIds.length)] ?? genT3(),
                    authorName: `User${Math.floor(Math.random()*15)}`,
                    replyAuthorName: Math.random() < .5
                        ? `User${Math.floor(Math.random()*15)}`
                        : null,
                    body: `Page ${p} Comment ${i}`,
                    createdAt: Date.now(),
                    score: Math.floor(Math.random()*1000),
                    edited: false,
                    locked: false,
                    removed: false,
                    spam: false,
                    permalink: ''
                });
            }
            const users = comments.reduce((m, c) => {
                m[c.authorName] = SampleUsersMap[c.authorName] ?? { snoovatar: undefined };
                return m;
            }, {} as UserNameToUserInfoMap);
            const posts = comments.reduce((m, c) => {
                m[c.postId] = { title: `Post with a title and id ${c.postId}`};
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

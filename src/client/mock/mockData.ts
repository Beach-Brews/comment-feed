/*!
 * Mock data responses for testing survey post cards locally.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { CommentDto, UserInfoDto, SubredditInfoDto } from '../../shared/api';

export const SampleUserInfo = {
    username: 'Beach-Brews',
    userId: 't2_ds8dkw924l',
    snoovar:
        'https://i.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878.png',
} satisfies UserInfoDto;

export const SampleSubInfo = {
    name: 'TestingSubName',
    icon: 'https://styles.redditmedia.com/t5_gb360m/styles/communityIcon_m6nsf08mkobg1.png?width=64&height=64&frame=1&auto=webp&crop=64%3A64%2Csmart&s=8a8bcbc4ceb6438f1f573c94b86f0a6e77c8dacc',
} satisfies SubredditInfoDto;

export const SampleCommentList = [
    {
        id: 't1_test',
        post: {
            id: 't3_test',
            title: 'Test Post Title',
        },
        replyTo: null,
        body: 'This is a sample comment',
        user: SampleUserInfo,
        date: Date.now(),
    },
    {
        id: 't1_test',
        post: {
            id: 't3_test',
            title: 'Test Post Title',
        },
        replyTo: null,
        body: 'This is a sample comment',
        user: SampleUserInfo,
        date: Date.now(),
    },
    {
        id: 't1_test',
        post: {
            id: 't3_test',
            title: 'Test Post Title That Is Really Long To See How Line Wrapping Works With Long Post Titles Where People Ramble On About Nothing',
        },
        replyTo: 'Delightful-Peach1832',
        body: 'This is a sample comment. it can span over multiple lines. Dude, does markdown work or what? How is formatted comments displayed to me?',
        user: SampleUserInfo,
        date: Date.now(),
    },
    {
        id: 't1_test',
        post: {
            id: 't3_test',
            title: 'Test Post Title',
        },
        replyTo: null,
        body: 'This is a sample comment',
        user: SampleUserInfo,
        date: Date.now(),
    },
    {
        id: 't1_test',
        post: {
            id: 't3_test',
            title: 'Test Post Title',
        },
        replyTo: null,
        body: 'This is a sample comment',
        user: SampleUserInfo,
        date: Date.now(),
    },
] satisfies CommentDto[];
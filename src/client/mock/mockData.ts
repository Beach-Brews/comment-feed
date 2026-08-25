/*!
 * Mock data responses for testing survey post cards locally.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { CommentDto, UserInfoDto, SubredditInfoDto } from '../../shared/api';
import { T1, T3 } from '../../shared/types';

const genUid = () => {
    return (
        Date.now().toString(36).substring(3) +
        Math.random().toString(36).substring(2, 7)
    );
};
export const genT1 = () => `t1_${genUid()}` as T1;
export const genT3 = () => `t3_${genUid()}` as T3;

export const SampleUserInfo = {
    snoovatar: 'https://i.redd.it/snoovatar/avatars/39b6f849-b2de-4c8f-9c97-4946152dc878.png',
} satisfies UserInfoDto;

export const SampleSubInfo = {
    name: 'TestingSubName',
    icon: 'https://styles.redditmedia.com/t5_gb360m/styles/communityIcon_m6nsf08mkobg1.png?width=64&height=64&frame=1&auto=webp&crop=64%3A64%2Csmart&s=8a8bcbc4ceb6438f1f573c94b86f0a6e77c8dacc',
} satisfies SubredditInfoDto;

export const SampleCommentList = [
    {
        id: genT1(),
        postId: genT3(),
        authorName: 'beach-brews',
        replyAuthorName: null,
        body: 'Hello',
        createdAt: Date.now(),
        score: 12,
        edited: false,
        locked: false,
        removed: false,
        spam: false,
        permalink: 'idk what goes here'
    },
] satisfies CommentDto[];
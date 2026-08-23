/*!
 * Mock data responses for testing survey hub locally.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { defineMock } from 'vite-plugin-mock-dev-server';
import { ApiResponse, CommentListResponse } from '../../shared/api';
import { BrewsSampleComments } from './brewsComments';
import { SampleSubInfo } from './mockData';

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
    },
    subInfo: SampleSubInfo
};

// noinspection JSUnusedGlobalSymbols
export default defineMock([
    {
        url: '/api/comments',
        method: 'GET',
        body: {
            code: 200,
            message: 'OK',
            result: /*EmptySample, */ BrewsSampleComments
        } satisfies ApiResponse<CommentListResponse>,
    },
]);

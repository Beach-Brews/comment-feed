/*!
 * Mock data responses for testing survey hub locally.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { defineMock } from 'vite-plugin-mock-dev-server';
import { ApiResponse, InitializeHubResponse } from '../../shared/api';
import { SampleSubInfo, SampleCommentList } from './mockData';

// noinspection JSUnusedGlobalSymbols
export default defineMock([
    {
        url: '/api/hub/init',
        method: 'GET',
        body: {
            code: 200,
            message: 'OK',
            result: {
                comments: SampleCommentList,
                subInfo: SampleSubInfo
            }
        } satisfies ApiResponse<InitializeHubResponse>
    }
]);

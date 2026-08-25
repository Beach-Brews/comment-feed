/*!
* Renders the shell for the comment feed.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import '../index.css';

import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LoadingSpinner } from './LoadingSpinner';
import { ApiResponse, InitCommentFeedResponse } from '../../shared/api';
import { ListHeader } from './ListHeader';
import { useCommentData } from '../hooks/useCommentData';
import { getWebViewMode } from '@devvit/web/client';
import { InlineCommentList } from './InlineCommentList';
import { ExpandedCommentList } from './ExpandedCommentList';

export const CommentFeed = () => {

    // Initialize feed basic data (subinfo, user status, etc.)
    const [feedInit, setFeedInit] = useState<
        InitCommentFeedResponse | null | undefined
    >(undefined);
    useEffect(() => {
        const initFeed = async () => {
            try {
                const resp = await fetch('/api/init');
                const data = resp.ok
                    ? ((
                          (await resp.json()) as ApiResponse<InitCommentFeedResponse>
                      )?.result ?? null)
                    : null;
                setFeedInit(data);
            } catch (e) {
                console.log('[CommentList] Feed init API error: ', e);
                setFeedInit(null);
            }
        };
        void initFeed();
    }, []);

    // Use the global comment data hook
    const commentDataHook = useCommentData();
    const {
        loading,
        getCurrentIndex,
        pageSize
    } = commentDataHook;

    // Get expanded view state
    const isExpanded = getWebViewMode() === 'expanded';

    // Handle loading or error
    if (!feedInit || loading) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center h-full">
                {feedInit === undefined || loading ? (
                    <>
                        <LoadingSpinner className="size-12" />
                        <div className="text-xl text-center">
                            Loading Comments...
                        </div>
                    </>
                ) : (
                    <>
                        <img
                            className="w-1/2"
                            src="snoo-facepalm.png"
                            alt="Snoo Facepalm"
                        />
                        <div className="text-xl text-center">
                            Sorry, there was an error loading the comment list.
                            Please try again later.
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-hidden">
            <div className="flex flex-col h-full">
                <ListHeader
                    getCurrentIndex={getCurrentIndex}
                    pageSize={pageSize}
                    subInfo={feedInit.subInfo}
                />
                {isExpanded
                    ? (<ExpandedCommentList commentDataHook={commentDataHook} />)
                    : (<InlineCommentList commentDataHook={commentDataHook} />)
                }
            </div>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CommentFeed />
    </StrictMode>
);

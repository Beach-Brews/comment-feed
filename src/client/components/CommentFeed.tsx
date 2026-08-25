/*!
* Renders a list of comments.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import '../index.css';

import {
    StrictMode,
    useState,
    useCallback,
    useEffect,
    Fragment,
} from 'react';
import { createRoot } from 'react-dom/client';
import { LoadingSpinner } from './LoadingSpinner';
import { getWebViewMode } from '@devvit/web/client';
import {
    ApiResponse,
    CommentDto,
    CommentListResponse,
    Pagination
} from '../../shared/api';
import { CommentCard } from './CommentCard';
import { ListPagination } from './ListPagination';
import { ListHeader } from './ListHeader';

type HubPagination = Pagination & {
    comments: CommentDto[];
};

export const CommentList = () => {
    // Initialize the pagination object
    const [pagination, setPagination] = useState<HubPagination>(() => {
        return {
            page: 1,
            pageSize: 2,
            total: 0,
            comments: [],
        };
    });
    const updatePage = (page: number) => {
        setPagination(p => ({...p, page: page}));
    };

    // Helper method for setting the pagination state
    const updatePagination = useCallback(
        (allComments: CommentDto[], total: number, page?: number) => {
            setPagination((p) => {
                page = page ?? p.page;
                return {
                    page: page,
                    pageSize: 2,
                    total: total,
                    comments: allComments.slice((page - 1) * 2, page * 2),
                };
            });
        },
        []
    );

    // Initialize the hub data (comments, sub, etc.)
    const [hubInit, setHubInit] = useState<
        CommentListResponse | null | undefined
    >(undefined);
    useEffect(() => {
        const initHub = async () => {
            try {
                const resp = await fetch('/api/comments');
                const data = resp.ok
                    ? ((
                          (await resp.json()) as ApiResponse<CommentListResponse>
                      )?.result ?? null)
                    : null;
                setHubInit(data);
                if (data?.comments && data.comments.length > 0) {
                    updatePagination(data.comments, data.pagination.total, 1);
                }
            } catch (e) {
                console.log('[CommentList] Comment API error: ', e);
                setHubInit(null);
            }
        };
        void initHub();
    }, [updatePagination]);

    const isExpanded = getWebViewMode() === 'expanded';

    // Handle loading or error
    if (!hubInit) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center h-full">
                {hubInit === undefined ? (
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
                <ListHeader pagination={pagination} subInfo={hubInit.subInfo} />
                {/* No comments */}
                {hubInit.comments.length <= 0 ? (
                    <div className="flex flex-col gap-2 p-2 justify-center items-center border-t border-t-neutral-border">
                        <div className="text-lg text-center text-neutral-content-weak">
                            No comments in feed. Check back soon!
                        </div>
                        <img
                            className="w-1/2"
                            src="snoo-thumbs-up.png"
                            alt="Snoo Thumbs Up"
                        />
                    </div>
                ) : (
                    <>
                        <div className={!isExpanded ? 'flex-1 relative grow h-[0%]' : ''}>
                            <div
                                className={`flex flex-col gap-1 p-2 ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden justify-between h-full'}`}
                            >
                                {pagination.comments.length > 0 ? (
                                    pagination.comments.map((s, i) => (
                                        <Fragment key={'card' + s.id}>
                                            <CommentCard
                                                key={s.id}
                                                comment={s}
                                                post={hubInit.posts[s.postId]}
                                                author={
                                                    hubInit.users[s.authorName]
                                                }
                                            />
                                            {i <
                                                pagination.comments.length -
                                                    1 && (
                                                <div
                                                    id={'sep' + s.id}
                                                    className="h-px shrink-0 w-full bg-neutral-border-weak"
                                                ></div>
                                            )}
                                        </Fragment>
                                    ))
                                ) : (
                                    <div className="text-content-neutral flex flex-col gap-2 items-center">
                                        <div>End of comment feed.</div>
                                        <img
                                            className="w-1/2"
                                            src="snoo-thumbs-up.png"
                                            alt="Snoo Thumbs Up"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        {!isExpanded && (
                            <ListPagination pagination={pagination} updatePage={updatePage} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CommentList />
    </StrictMode>
);

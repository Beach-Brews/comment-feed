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
    MouseEvent,
    Fragment,
} from 'react';
import { createRoot } from 'react-dom/client';
import { SubDefaultIcon } from './CustomIcons';
import { LoadingSpinner } from './LoadingSpinner';
import {
    getWebViewMode,
    requestExpandedMode,
    exitExpandedMode,
} from '@devvit/web/client';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowsPointingOutIcon,
    ArrowsPointingInIcon,
} from '@heroicons/react/24/solid';
import {
    ApiResponse,
    CommentDto,
    CommentListResponse,
    Pagination
} from '../../shared/api';
import { CommentCard } from './CommentCard';

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

    const launchExpanded = useCallback((e: MouseEvent) => {
        if (isExpanded) {
            exitExpandedMode(e.nativeEvent);
            return;
        }

        // @ts-ignore Thanks Xenccc for confirming the hack here :p
        // Rewriting the old path back is smart BTW
        const entrypoints = window.devvit?.entrypoints;
        const originalUrl = entrypoints?.app;

        if (originalUrl) {
            const url = new URL(originalUrl, window.location.href);
            url.searchParams.set('p', pagination.page.toString());
            url.searchParams.set('s', pagination.pageSize.toString());
            entrypoints.app = `${url}`;
        }

        try {
            // Optional parameter object would be cool (primitive only values)
            // requestExpandedMode(e.nativeEvent, 'default', { p: 1, s: 25 });
            requestExpandedMode(e.nativeEvent, 'default');
        } finally {
            if (originalUrl) entrypoints.app = originalUrl;
        }
    }, []);

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
                <div className="flex justify-between items-center gap-2 p-2 border-b border-b-neutral-border">
                    <div className="flex justify-start items-center gap-2">
                        <div className="w-8 h-8 shrink-0 object-contain overflow-hidden rounded-full">
                            {hubInit.subInfo.icon ? (
                                <img
                                    width={32}
                                    height={32}
                                    alt={hubInit.subInfo.name}
                                    src={hubInit.subInfo.icon}
                                />
                            ) : (
                                <SubDefaultIcon />
                            )}
                        </div>
                        <h1 className="text-sm md:text-md lg:text-2xl font-bold">
                            r/{hubInit.subInfo.name} Comments
                        </h1>
                    </div>
                    <button
                        className="rounded-full h-10 p-2 ml-auto font-semibold text-sm cursor-pointer text-center text-neutral-content-strong hover:bg-secondary-background-hovered"
                        onClick={launchExpanded}
                    >
                        {isExpanded ? (
                            <ArrowsPointingInIcon className="size-6" />
                        ) : (
                            <ArrowsPointingOutIcon className="size-6" />
                        )}
                    </button>
                </div>
                {/* No comments */}
                {hubInit && hubInit.comments.length <= 0 ? (
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
                            <div className="text-xs xs:text-base flex justify-between items-center p-2 gap-2 border-t border-t-neutral-border">
                                <div className="flex justify-start items-center gap-1 xs:gap-2"></div>
                                <div className="flex justify-end items-center gap-2">
                                    <div>
                                        {(pagination.page - 1) *
                                            pagination.pageSize +
                                            1}
                                        -
                                        {Math.min(
                                            pagination.page *
                                                pagination.pageSize,
                                            pagination.total
                                        )}{' '}
                                        of&nbsp;{pagination.total}
                                    </div>
                                    <button
                                        disabled={pagination.page <= 1}
                                        onClick={() => {
                                            if (pagination.page > 1)
                                                updatePagination(
                                                    hubInit.comments,
                                                    hubInit.pagination.total,
                                                    pagination.page - 1
                                                );
                                        }}
                                        className="p-2 flex justify-center rounded-full cursor-pointer disabled:pointer-events-none disabled:opacity-50 text-secondary-plain hover:text-secondary-plain-hovered hover:bg-secondary-background-hovered"
                                    >
                                        <ChevronLeftIcon className="size-5" />
                                    </button>
                                    <button
                                        disabled={
                                            pagination.page >=
                                            pagination.total /
                                                pagination.pageSize
                                        }
                                        onClick={() => {
                                            if (
                                                pagination.page <
                                                pagination.total /
                                                    pagination.pageSize
                                            )
                                                updatePagination(
                                                    hubInit.comments,
                                                    hubInit.pagination.total,
                                                    pagination.page + 1
                                                );
                                        }}
                                        className="p-2 flex justify-center rounded-full cursor-pointer disabled:pointer-events-none disabled:opacity-50 text-secondary-plain hover:text-secondary-plain-hovered hover:bg-secondary-background-hovered"
                                    >
                                        <ChevronRightIcon className="size-5" />
                                    </button>
                                </div>
                            </div>
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
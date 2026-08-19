/*!
 * Landing for viewing comments.
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
    MouseEvent
} from 'react';
import { createRoot } from 'react-dom/client';
import { SubDefaultIcon } from '../shared/CustomIcons';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { navigateTo, context } from '@devvit/web/client';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import {
    ApiResponse,
    CommentDto,
    InitializeHubResponse,
    Pagination
} from '../../shared/api';
import { formatRelativeDateTime } from '../shared/dateFormat';

type HubPagination = Pagination & {
    comments: CommentDto[];
};

const openLink = (e: MouseEvent, path: string) => {
    e.stopPropagation();
    e.preventDefault();
    navigateTo(`https://www.reddit.com${path}`);
};

export const CommentHubCard = ({
    comment
}: {
    comment: CommentDto
}) => {
    const { user } = comment;
    const [defaultSnoo] = useState<string>(() => `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${Math.floor(Math.random() * 8)}.png`);
    return (
        <div
            onClick={(e) => {
                openLink(e, `/r/${context.subredditName}/comments/${comment.post.id}/comment/${comment.id}`)
            }}
            className="flex gap-2 p-4 text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-background-hovered"
        >
            <div className="shrink-0 size-8 object-contain overflow-hidden rounded-full">
                <img
                    src={
                        user?.snoovar !== undefined && user.snoovar.length > 0
                            ? user.snoovar
                            : defaultSnoo
                    }
                    alt={user.username}
                />
            </div>
            <div className="flex flex-col gap-2">
                <div className="text-neutral-content-weak">
                    <a
                        href="#"
                        className="link-strong"
                        onClick={(e) =>
                            openLink(e, `/u/${comment.user.username}`)
                        }
                    >
                        {comment.user.username}
                    </a>
                    &nbsp;
                    {comment.replyTo ? (
                        <>
                            replied to&nbsp;
                            <a
                                href="#"
                                className="link-strong"
                                onClick={(e) =>
                                    openLink(e, `/u/${comment.replyTo}`)
                                }
                            >
                                {comment.replyTo}
                            </a>
                        </>
                    ) : (
                        <>commented</>
                    )}
                    &nbsp;
                    {formatRelativeDateTime(comment.date)}
                </div>
                <a
                    href="#"
                    onClick={(e) =>
                        openLink(e,`/r/${context.subredditName}/comments/${comment.post.id}`)
                    }
                    className="text-neutral-content line-clamp-2"
                >
                    {comment.post.title}
                </a>
                <div className="text-neutral-content-strong line-clamp-3">{comment.body}</div>
            </div>
        </div>
    );
};

export const Hub = () => {
    // Initialize the pagination object
    const [pagination, setPagination] = useState<HubPagination>(() => {
        return {
            page: 1,
            pageSize: 3,
            total: 0,
            comments: [],
        };
    });

    // Helper method for setting the pagination state
    const updatePagination = useCallback(
        (allComments: CommentDto[], page?: number) => {
            setPagination((p) => {
                page = page ?? p.page;
                return {
                    page: page,
                    pageSize: 3,
                    total: allComments.length,
                    comments: allComments.slice((page - 1) * 3, page * 3),
                };
            });
        },
        []
    );

    // Initialize the hub data (comments, sub, etc.)
    const [hubInit, setHubInit] = useState<
        InitializeHubResponse | null | undefined
    >(undefined);
    useEffect(() => {
        const initHub = async () => {
            try {
                const resp = await fetch('/api/hub/init');
                const data = resp.ok
                    ? (((await resp.json()) as ApiResponse<InitializeHubResponse>)?.result ?? null)
                    : null;
                setHubInit(data);
                if (data?.comments && data.comments.length > 0) {
                    updatePagination(data.comments);
                }
            } catch (e) {
                console.log('[CommentList] Hub init error: ', e);
                setHubInit(null);
            }
        };
        void initHub();
    }, [updatePagination]);

    // const launchExpanded = useCallback((e: MouseEvent) => {
    //     requestExpandedMode(e.nativeEvent as PointerEvent, 'editor');
    // }, []);

    // Handle loading or error
    if (!hubInit) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center h-full">
                {hubInit === undefined ? (
                    <>
                        <LoadingSpinner className="size-12" />
                        <div className="text-xl text-center">
                            Loading Comment Hub...
                        </div>
                    </>
                ) : (
                    <>
                        <img
                            className="w-1/2"
                            src="snoo-facepalm.png"
                            alt="Snoo Error"
                        />
                        <div className="text-xl text-center">
                            Sorry, there was an error loading the Comment Hub.
                            Please try again later.
                        </div>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="w-full h-screen overflow-auto">
            <div className="container max-w-screen-lg min-h-screen mx-auto flex flex-col relative z-0 h-full">
                <div className="flex justify-between items-center gap-2 p-2">
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
                </div>
                {/* No comments */}
                {hubInit && hubInit.comments.length <= 0 ? (
                    <div className="flex flex-col gap-2 p-2 justify-center items-center border-t border-t-neutral-border">
                        <div className="texf-xl sm:text-2xl text-neutral-content-strong font-bold text-center">
                            There are no comments currently
                        </div>
                        <div className="text-center">Check back soon!</div>
                    </div>
                ) : (
                    <>
                        {/* Pagination + Comment List */}
                        <div className="text-xs xs:text-base flex justify-between items-center p-2 gap-2 border-b border-b-neutral-border">
                            <div className="flex justify-start items-center gap-1 xs:gap-2"></div>
                            <div className="flex justify-end items-center gap-2">
                                <div>
                                    {(pagination.page - 1) *
                                        pagination.pageSize +
                                        1}
                                    -
                                    {Math.min(
                                        pagination.page * pagination.pageSize,
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
                                        pagination.total / pagination.pageSize
                                    }
                                    onClick={() => {
                                        if (
                                            pagination.page <
                                            pagination.total /
                                                pagination.pageSize
                                        )
                                            updatePagination(
                                                hubInit.comments,
                                                pagination.page + 1
                                            );
                                    }}
                                    className="p-2 flex justify-center rounded-full cursor-pointer disabled:pointer-events-none disabled:opacity-50 text-secondary-plain hover:text-secondary-plain-hovered hover:bg-secondary-background-hovered"
                                >
                                    <ChevronRightIcon className="size-5" />
                                </button>
                            </div>
                        </div>
                        <div className="relative grow h-[0%]">
                            <div className="flex flex-col gap-1 p-2 h-full overflow-hidden">
                                {pagination.comments.length > 0 ? (
                                    pagination.comments.map((s) => (
                                        <>
                                            <CommentHubCard key={s.id} comment={s} />
                                            <div id={'sep'+s.id} className="h-px w-full bg-neutral-border-weak"></div>
                                        </>
                                    ))
                                ) : (
                                    <div>There are no comments.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Hub />
    </StrictMode>
);

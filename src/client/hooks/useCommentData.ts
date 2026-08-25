/*!
* Helper hook for managing comment data (downloaded data, not visible comments) in manageable "chunks". Mostly generated
* by ChatGPT with API details and explaination of how I plan to "chunk" the downloaded data, but create "virtual" pages
* for the display.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    UserNameToUserInfoMap,
    PostIdToPostInfoMap,
    CommentDto,
    CommentListResponse, ApiResponse,
} from '../../shared/api';

const DEFAULT_PAGE_SIZE = 25;

type CommentDataState = {
    users: UserNameToUserInfoMap;
    posts: PostIdToPostInfoMap;
    comments: Map<number, CommentDto>;
    total: number;
};

export const useCommentData = (
    initialIndex = 0,
    pageSize = DEFAULT_PAGE_SIZE
) => {
    const [data, setData] = useState<CommentDataState>({
        users: {},
        posts: {},
        comments: new Map(),
        total: 0,
    });

    const indexRef = useRef<number>(initialIndex);
    const getCurrentIndex = () => indexRef.current;
    const setCurrentIndex = (i: number) => indexRef.current = i;

    const [loading, setLoading] = useState(true);

    // Refs let fetchPage/getComments always see the latest cache
    // without recreating callbacks every time data changes.
    const dataRef = useRef(data);
    dataRef.current = data;

    const loadedPagesRef = useRef(new Set<number>());

    // Prevent duplicate requests if two components ask for the
    // same page simultaneously.
    const pendingPagesRef = useRef(
        new Map<number, Promise<CommentListResponse>>()
    );

    const fetchPage = useCallback(
        async (page: number): Promise<CommentListResponse> => {
            if (loadedPagesRef.current.has(page)) {
                const start = (page - 1) * pageSize;

                return {
                    users: dataRef.current.users,
                    posts: dataRef.current.posts,
                    comments: Array.from(
                        { length: pageSize },
                        (_, offset) =>
                            dataRef.current.comments.get(start + offset)
                    ).filter(
                        (comment): comment is CommentDto => !!comment
                    ),
                    pagination: {
                        page,
                        pageSize,
                        total: dataRef.current.total,
                    },
                };
            }

            const pending = pendingPagesRef.current.get(page);
            if (pending)
                return pending;

            const request = fetch(
                `/api/comments?p=${page}&s=${pageSize}`
            )
                .then(async response => {
                    if (!response.ok)
                        throw new Error('Failed to load comments');

                    const result = (await response.json() as ApiResponse<CommentListResponse>).result;
                    if (!result)
                        throw new Error('Failed to load comments');
                    return result;
                })
                .then(result => {
                    const pageStart = (page - 1) * pageSize;

                    setData(previous => {
                        const comments = new Map(previous.comments);

                        result.comments.forEach((comment, index) => {
                            comments.set(pageStart + index, comment);
                        });

                        const next: CommentDataState = {
                            users: {
                                ...previous.users,
                                ...result.users,
                            },

                            posts: {
                                ...previous.posts,
                                ...result.posts,
                            },

                            comments,

                            total: result.pagination.total,
                        };

                        dataRef.current = next;

                        return next;
                    });

                    loadedPagesRef.current.add(page);

                    return result;
                })
                .finally(() => {
                    pendingPagesRef.current.delete(page);
                });

            pendingPagesRef.current.set(page, request);

            return request;
        },
        [pageSize]
    );

    const getComments = useCallback(
        async (
            start: number,
            end: number
        ): Promise<CommentDto[]> => {
            if (start < 0)
                start = 0;

            if (end <= start)
                return [];

            const firstPage = Math.floor(start / pageSize) + 1;
            const lastPage = Math.floor((end - 1) / pageSize) + 1;

            const pages: Promise<CommentListResponse>[] = [];

            for (let page = firstPage; page <= lastPage; page++) {
                if (!loadedPagesRef.current.has(page))
                    pages.push(fetchPage(page));
            }

            if (pages.length)
                await Promise.all(pages);

            const comments: CommentDto[] = [];

            for (
                let index = start;
                index < end && index < dataRef.current.total;
                index++
            ) {
                const comment = dataRef.current.comments.get(index);

                if (comment)
                    comments.push(comment);
            }

            return comments;
        },
        [fetchPage, pageSize]
    );

    const getComment = useCallback(
        async (index: number): Promise<CommentDto | undefined> => {
            return (await getComments(index, index + 1))[0];
        },
        [getComments]
    );

    useEffect(() => {
        const initialPage =
            Math.floor(initialIndex / pageSize) + 1;

        fetchPage(initialPage)
            .finally(() => setLoading(false));
    }, [fetchPage, initialIndex, pageSize]);

    return {
        // Accumulated normalized data
        users: data.users,
        posts: data.posts,
        total: data.total,

        // Navigation position
        getCurrentIndex,
        setCurrentIndex,

        loading,
        pageSize,

        // Data access
        getComment,
        getComments,

        fetchPage,
    };
};

export type CommentDataHook = ReturnType<typeof useCommentData>;

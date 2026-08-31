/*!
 * Renders two comments with a pagination control for the inline view.
 *
 * Author:  u/Beach-Brews
 * License: BSD-3-Clause
 */

import { useEffect, useState } from 'react';
import { CommentCard } from './CommentCard';
import { ListPagination } from './ListPagination';
import { CommentDto, Pagination } from '../../shared/api';
import { LoadingSpinner } from './LoadingSpinner';
import { useCommentFeed } from '../hooks/CommentFeedContextProvider';

export const CommentList = () => {
    const { isExpanded, commentDataHook } = useCommentFeed();
    const { pageSize: dataPageSize } = commentDataHook;
    const pageSize = isExpanded ? dataPageSize : 2;

    const [comments, setComments] = useState<CommentDto[] | undefined>();
    const [pagination, setPagination] = useState<Pagination>(() => ({
        page: Math.floor(commentDataHook.getCurrentIndex() / pageSize) + 1,
        pageSize: pageSize,
        total: commentDataHook.total,
    }));

    const loadComments = async () => {
        const i = commentDataHook.getCurrentIndex();
        const next = await commentDataHook.getComments(i, i + pageSize);
        setComments(next);
        if (dataPageSize - (i % dataPageSize) < 6)
            void commentDataHook.fetchPage(
                Math.floor(i / dataPageSize) + pageSize
            );
    };

    const updatePage = (p: number) => {
        setPagination((s) => ({ ...s, page: p }));
        setComments(undefined);
        commentDataHook.setCurrentIndex((p - 1) * pageSize);
        void loadComments();
    };

    useEffect(() => {
        updatePage(1);
        setPagination(p => ({  ...p, pageSize: pageSize }));
    }, [isExpanded]);

    return (
        <>
            {comments === undefined
                ? (
                    <div className="w-full h-full flex justify-center items-center">
                        <div className="flex flex-col gap-2 items-center">
                            <LoadingSpinner className="size-12" />
                            <div className="text-xl text-center">Loading Comments...</div>
                        </div>
                    </div>
                )
                : (
                    <div className="flex-1 relative grow h-[0%]">
                        <div
                            key={`comment-page-${pagination.page}`}
                            className={`grid grid-cols-1 gap-2 p-2 ${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'} h-full`}
                        >
                            {comments.length > 0 ? (
                                comments.map((s, i) => (
                                    <div
                                        key={'card' + s.id}
                                        className={
                                            i < comments.length - 1
                                                ? `pb-2 border-b border-b-neutral-border-weak`
                                                : ''
                                        }
                                    >
                                        <CommentCard key={s.id} comment={s} />
                                    </div>
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
                )
            }
            <ListPagination
                pagination={pagination}
                updatePage={updatePage}
                loading={comments === undefined}
            />
        </>
    );
};

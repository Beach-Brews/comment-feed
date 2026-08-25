/*!
 * Renders the expanded comment list.
 *
 * Author:  u/Beach-Brews
 * License: BSD-3-Clause
 */

import { Fragment, useEffect, useState } from 'react';
import { CommentCard } from './CommentCard';
import { ListPagination } from './ListPagination';
import { CommentDto, Pagination } from '../../shared/api';
import { CommentDataHook } from '../hooks/useCommentData';
import { LoadingSpinner } from './LoadingSpinner';

export const ExpandedCommentList = ({
    commentDataHook,
}: {
    commentDataHook: CommentDataHook;
}) => {
    const { pageSize } = commentDataHook;
    const [pagination, setPagination] = useState<Pagination>(() => ({
        page: Math.floor(commentDataHook.getCurrentIndex() / pageSize) + 1,
        pageSize: pageSize,
        total: commentDataHook.total,
    }));
    const [comments, setComments] = useState<CommentDto[] | undefined>();

    const loadComments = async () => {
        const i = commentDataHook.getCurrentIndex();
        const next = await commentDataHook.getComments(i, i + pageSize);
        setComments(next);
    };
    const updatePage = (p: number) => {
        setPagination((s) => ({ ...s, page: p }));
        setComments(undefined);
        commentDataHook.setCurrentIndex((p - 1) * pageSize);
        void loadComments();
    };
    useEffect(() => {
        updatePage(1);
    }, []);
    return (
        <>
            <div className="flex-1 relative grow h-[0%]">
                <div className="flex flex-col gap-1 p-2 overflow-y-auto">
                    {comments === undefined ? (
                        <div className="w-full flex flex-col gap2 items-center">
                            <LoadingSpinner className="size-12" />
                            <div className="text-xl text-center">
                                Loading Comments...
                            </div>
                        </div>
                    ) : comments.length > 0 ? (
                        comments.map((s, i) => (
                            <Fragment key={'card' + s.id}>
                                <CommentCard
                                    key={s.id}
                                    comment={s}
                                    post={commentDataHook.posts[s.postId]}
                                    author={commentDataHook.users[s.authorName]}
                                />
                                {i < comments.length - 1 && (
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
            <ListPagination pagination={pagination} updatePage={updatePage} loading={comments === undefined} />
        </>
    );
};

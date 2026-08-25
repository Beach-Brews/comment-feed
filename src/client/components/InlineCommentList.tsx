/*!
 * Renders two comments with a pagination control for the inline view.
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

export const InlineCommentList = ({
    commentDataHook,
}: {
    commentDataHook: CommentDataHook;
}) => {
    const { pageSize } = commentDataHook;
    const [pagination, setPagination] = useState<Pagination>(() => ({
        page: Math.floor(commentDataHook.getCurrentIndex() / 2) + 1,
        pageSize: 2,
        total: commentDataHook.total,
    }));
    const [comments, setComments] = useState<CommentDto[] | undefined>();

    const loadComments = async () => {
        const i = commentDataHook.getCurrentIndex();
        const next = await commentDataHook.getComments(i, i + 2);
        setComments(next);
        if (pageSize - i%pageSize < 6)
            void commentDataHook.fetchPage(Math.floor(i/pageSize)+2);
    };
    const updatePage = (p: number) => {
        setPagination((s) => ({ ...s, page: p }));
        setComments(undefined);
        commentDataHook.setCurrentIndex((p - 1) * 2);
        void loadComments();
    };
    useEffect(() => {
        updatePage(1);
    }, []);
    return (
        <>
            <div className="flex-1 relative grow h-[0%]">
                <div className="flex flex-col gap-1 p-2 overflow-hidden justify-between h-full">
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

/*!
* Renders a single comment.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import { CommentDto, PostInfoDto, UserInfoDto } from '../../shared/api';
import { useState } from 'react';
import { formatRelativeDateTime } from '../utils/dateFormat';
import { DownvoteIcon, UpvoteIcon } from './CustomIcons';
import { openLink } from '../utils/linkUtils';

export const CommentCard = ({
    comment,
    post,
    author,
}: {
    comment: CommentDto;
    post: PostInfoDto | undefined;
    author: UserInfoDto | undefined;
}) => {
    const [defaultSnoo] = useState<string>(
        () =>
            `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${Math.floor(Math.random() * 8)}.png`
    );
    return (
        <div
            onClick={(e) =>
                openLink({
                    event: e,
                    postId: comment.postId,
                    commentId: comment.id,
                })
            }
            className="w-full flex gap-2 p-4 text-sm rounded-xl hover:cursor-pointer hover:bg-neutral-background-hovered"
        >
            <div className="shrink-0 size-8 object-contain overflow-hidden rounded-full">
                <img
                    src={
                        author?.snoovatar !== undefined &&
                        author.snoovatar.length > 0
                            ? author.snoovatar
                            : defaultSnoo
                    }
                    alt={comment.authorName}
                />
            </div>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
                <div className="text-neutral-content-weak">
                    <a
                        href="#"
                        className="link-strong"
                        onClick={(e) =>
                            openLink({ event: e, username: comment.authorName })
                        }
                    >
                        {comment.authorName}
                    </a>
                    &nbsp;
                    {comment.replyAuthorName ? (
                        <>
                            replied to&nbsp;
                            <a
                                href="#"
                                className="link-strong"
                                onClick={(e) =>
                                    openLink({
                                        event: e,
                                        username: comment.replyAuthorName!,
                                    })
                                }
                            >
                                {comment.replyAuthorName}
                            </a>
                        </>
                    ) : (
                        <>commented</>
                    )}
                    &nbsp;
                    {formatRelativeDateTime(comment.createdAt)}
                </div>
                <a
                    href="#"
                    onClick={(e) =>
                        openLink({ event: e, postId: comment.postId })
                    }
                    className="text-neutral-content line-clamp-2"
                >
                    {post?.title ?? '[deleted]'}
                </a>
                <div className="text-neutral-content-strong line-clamp-3">
                    {comment.body}
                </div>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-neutral-content-weakest">
                            <UpvoteIcon />
                            <span className="text-neutral-content-strong">
                                {comment.score}
                            </span>
                            <DownvoteIcon />
                        </div>
                    </div>
                    <div className="flex justify-end items-center gap-2"></div>
                </div>
            </div>
        </div>
    );
};

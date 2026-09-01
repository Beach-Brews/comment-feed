/*!
* Renders a single comment.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import { CommentDto } from '../../shared/api';
import { useState } from 'react';
import { formatRelativeDateTime } from '../utils/dateFormat';
import {
    DownvoteIcon,
    FlagIcon,
    //ModShieldIcon,
    UpvoteIcon,
} from './CustomIcons';
import { linkForThing, openLink } from '../utils/linkUtils';
import { useCommentFeed } from '../hooks/CommentFeedContextProvider';
import { snoovatarForUser } from '../../shared/soonvatarForUser';
import {
    LockClosedIcon,
    PencilIcon,
} from '@heroicons/react/24/outline';

export const CommentCard = ({
    comment,
}: {
    comment: CommentDto;
}) => {
    const { isExpanded, commentDataHook, feedInit } = useCommentFeed();
    const post = commentDataHook.posts[comment.postId];
    const author = commentDataHook.users[comment.authorName];

    const [defaultSnoo] = useState<string>(() => snoovatarForUser(comment.authorName));

    const { modInfo } = comment;

    return (
        <div
            onClick={(e) => openLink(e, { path: comment.permalink })}
            className="w-full flex flex-col gap-2 p-2 text-sm break-words rounded-xl hover:cursor-pointer hover:bg-neutral-background-hovered"
        >
            <div className="flex gap-2 items-center text-neutral-content-weak">
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
                <div className={!isExpanded ? 'line-clamp-2' : ''}>
                    <a
                        href={linkForThing({
                            username: comment.authorName,
                        })}
                        className="link-strong"
                        onClick={(e) =>
                            openLink(e, { username: comment.authorName })
                        }
                    >
                        {comment.authorName}
                    </a>
                    &nbsp;
                    {comment.replyAuthorName ? (
                        <>
                            replied to&nbsp;
                            <a
                                href={linkForThing({
                                    username: comment.replyAuthorName!,
                                })}
                                className="link-strong"
                                onClick={(e) =>
                                    openLink(e, {
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
            </div>
            <a
                href={linkForThing({ postId: comment.postId })}
                onClick={(e) => openLink(e, { postId: comment.postId })}
                className={`text-primary-plain hover:text-primary-plain-hovered underline ${!isExpanded && 'line-clamp-2'}`}
            >
                {post?.title ?? '[deleted]'}
            </a>
            <div
                className={`text-neutral-content-strong ${!isExpanded && 'line-clamp-3'}`}
            >
                {comment.body}
            </div>
            {isExpanded &&
                feedInit.isMod &&
                modInfo &&
                modInfo.numReports > 0 && (
                    <div className="flex">
                        <div className="flex gap-1 px-2 py-1 rounded-md bg-caution-background text-caution-onbackground">
                            <div className="pt-1"><FlagIcon /></div>
                            <div>
                                {modInfo.userReportReasons.map((r, i) =>
                                    <div key={`ur${i}`}>{r}</div>)
                                }
                                {modInfo.modReports.map((r, i) =>
                                    <div key={`ur${i}`}>{r[0]} - {r[1]}</div>)
                                }
                            </div>
                        </div>
                    </div>
                )}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-neutral-content-weakest">
                        <UpvoteIcon />
                        <span className="text-neutral-content-strong">
                            {comment.score}
                        </span>
                        <DownvoteIcon />
                    </div>
                    <a
                        href={linkForThing({ path: comment.permalink })}
                        onClick={(e) =>
                            openLink(e, { path: comment.permalink })
                        }
                        className="text-xs"
                    >
                        permalink
                    </a>
                    {comment.edited && (
                        <PencilIcon className="size-4 stroke-2" />
                    )}
                    {comment.locked && (
                        <LockClosedIcon className="size-4 stroke-2 text-caution-plain" />
                    )}
                </div>
                <div className="flex justify-end items-center gap-4">
                    {feedInit.isMod && (
                        <>
                            {!isExpanded &&
                                modInfo &&
                                modInfo.numReports > 0 && (
                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-caution-background text-caution-onbackground">
                                        <FlagIcon />
                                        {modInfo.numReports}
                                    </div>
                                )}
                            {/*<ModShieldIcon />*/}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

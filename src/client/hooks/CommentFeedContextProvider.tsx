/*!
 * Context provider for the Comment Feed.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { createContext, Dispatch, ReactNode, SetStateAction, useContext } from 'react';
import { CommentDataHook } from './useCommentData';
import { InitCommentFeedResponse } from '../../shared/api';

export type CommentFeedContextProps = {
    feedInit: InitCommentFeedResponse;
    commentDataHook: CommentDataHook;
    isExpanded: boolean;
    setIsExpanded: Dispatch<SetStateAction<boolean>>;
};

const CommentFeedContext = createContext<CommentFeedContextProps | null>(    null);

export const CommentFeedProvider = ({
    context,
    children
}: {
    context: CommentFeedContextProps;
    children: ReactNode;
}) => {
    return (
        <CommentFeedContext.Provider value={context}>
            {children}
        </CommentFeedContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCommentFeed = () => {
    const ctx = useContext(CommentFeedContext);
    if (!ctx)
        throw new Error('useCommentFeed must be used within CommentFeedProvider');
    return ctx;
};

/*!
 * Renders a pagination control.
 *
 * Author:  u/Beach-Brews
 * License: BSD-3-Clause
 */

import {
    ArrowsPointingInIcon,
    ArrowsPointingOutIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/solid';
import { Pagination } from '../../shared/api';
import { Dispatch, MouseEvent, SetStateAction } from 'react';
import {
    exitExpandedMode,
    requestExpandedMode,
} from '@devvit/web/client';

export const ListPagination = ({
    pagination,
    updatePage,
    loading,
    isExpanded,
    setIsExpanded,
}: {
    pagination: Pagination;
    updatePage: (page: number) => void;
    loading: boolean;
    isExpanded: boolean;
    setIsExpanded: Dispatch<SetStateAction<boolean>>;
}) => {
    const launchExpanded = (e: MouseEvent) => {
        // If in expanded mode, exit
        if (isExpanded) {
            exitExpandedMode(e.nativeEvent);
            setIsExpanded(false);
            return;
        }

        // @ts-ignore Thanks Xenccc for confirming the hack here :p
        // Rewriting the old path back is smart BTW
        const entrypoints = window.devvit?.entrypoints;
        const originalUrl = entrypoints?.app;

        if (originalUrl) {
            const url = new URL(originalUrl, window.location.href);
            //url.searchParams.set('i', getCurrentIndex().toString());
            //url.searchParams.set('s', pageSize.toString());
            entrypoints.app = `${url}`;
        }

        try {
            // Optional parameter object would be cool (primitive only values)
            // requestExpandedMode(e.nativeEvent, 'default', { p: 1, s: 25 });
            requestExpandedMode(e.nativeEvent, 'default');
            setIsExpanded(true);
        } finally {
            if (originalUrl) entrypoints.app = originalUrl;
        }
    };

    return (
        <div className="text-xs xs:text-base flex justify-between items-center gap-2 border-t border-t-neutral-border">
            <div className="flex justify-start items-center gap-2">
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
            <div className="flex justify-end items-center gap-2">
                <div>
                    {(pagination.page - 1) * pagination.pageSize + 1} -&nbsp;
                    {Math.min(
                        pagination.page * pagination.pageSize,
                        pagination.total
                    )}
                    &nbsp; of {pagination.total}
                </div>
                <button
                    disabled={loading || pagination.page <= 1}
                    onClick={() => {
                        if (!loading && pagination.page > 1)
                            updatePage(pagination.page - 1);
                    }}
                    className="p-2 flex justify-center rounded-full cursor-pointer disabled:pointer-events-none disabled:opacity-50 text-secondary-plain hover:text-secondary-plain-hovered hover:bg-secondary-background-hovered"
                >
                    <ChevronLeftIcon className="size-5" />
                </button>
                <button
                    disabled={
                        loading ||
                        pagination.page >=
                            pagination.total / pagination.pageSize
                    }
                    onClick={() => {
                        if (
                            !loading &&
                            pagination.page <
                                pagination.total / pagination.pageSize
                        )
                            updatePage(pagination.page + 1);
                    }}
                    className="p-2 flex justify-center rounded-full cursor-pointer disabled:pointer-events-none disabled:opacity-50 text-secondary-plain hover:text-secondary-plain-hovered hover:bg-secondary-background-hovered"
                >
                    <ChevronRightIcon className="size-5" />
                </button>
            </div>
        </div>
    );
};

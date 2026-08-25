/*!
* Renders the list header.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

import { useState, useEffect, MouseEvent } from 'react';
import { SubDefaultIcon } from './CustomIcons';
import {
    getWebViewMode,
    requestExpandedMode,
    exitExpandedMode,
    addWebViewModeListener,
    removeWebViewModeListener,
} from '@devvit/web/client';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/solid';
import { SubredditInfoDto } from '../../shared/api';

export const ListHeader = ({
    getCurrentIndex,
    pageSize,
    subInfo,
}: {
    getCurrentIndex: () => number;
    pageSize: number;
    subInfo: SubredditInfoDto;
}) => {
    // Determine expanded mode state
    const [isExpanded, setIsExpanded] = useState<boolean>(
        () => getWebViewMode() === 'expanded'
    );

    // Listen for expand mode change (mostly closed via Reddit native close button)
    useEffect(() => {
        const listener = (newMode: 'expanded' | 'inline') => {
            setIsExpanded(newMode === 'expanded');
        };
        addWebViewModeListener(listener);
        return () => {
            removeWebViewModeListener(listener);
        };
    }, []);

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
            url.searchParams.set('i', getCurrentIndex().toString());
            url.searchParams.set('s', pageSize.toString());
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
        <div className="flex justify-between items-center gap-2 p-2 border-b border-b-neutral-border">
            <div className="flex justify-start items-center gap-2">
                <div className="w-8 h-8 shrink-0 object-contain overflow-hidden rounded-full">
                    {subInfo.icon ? (
                        <img
                            width={32}
                            height={32}
                            alt={subInfo.name}
                            src={subInfo.icon}
                        />
                    ) : (
                        <SubDefaultIcon />
                    )}
                </div>
                <h1 className="text-sm md:text-md lg:text-2xl font-bold">
                    r/{subInfo.name} Comments
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
    );
};

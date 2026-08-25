/*!
 * Renders a pagination control.
 *
 * Author:  u/Beach-Brews
 * License: BSD-3-Clause
 */

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { Pagination } from '../../shared/api';

export const ListPagination = ({
    pagination,
    updatePage,
    loading
}: {
    pagination: Pagination;
    updatePage: (page: number) => void;
    loading: boolean;
}) => {
    return (
        <div className="text-xs xs:text-base flex justify-between items-center p-2 gap-2 border-t border-t-neutral-border">
            <div className="flex justify-start items-center gap-1 xs:gap-2"></div>
            <div className="flex justify-end items-center gap-2">
                <div>
                    {(pagination.page - 1) * pagination.pageSize + 1} -&nbsp;
                    {Math.min(
                        pagination.page * pagination.pageSize,
                        pagination.total
                    )}&nbsp;
                    of {pagination.total}
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
                        pagination.page >= pagination.total / pagination.pageSize
                    }
                    onClick={() => {
                        if (!loading && pagination.page < pagination.total / pagination.pageSize)
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

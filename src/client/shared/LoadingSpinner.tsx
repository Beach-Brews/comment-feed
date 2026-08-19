/*!
* Animated loading spinner.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

export const LoadingSpinner = ({
    barClassName,
    className,
}: {
    barClassName?: string | undefined;
    className?: string | undefined;
}) => {
    className = className ?? 'size-6';
    barClassName = barClassName ?? 'bg-load-bar-color';
    return (
        <div className={`flex items-end gap-1 ${className}`}>
            <div className={`w-1/3 animate-bar1 rounded-sm ${barClassName}`} />
            <div className={`w-1/3 animate-bar2 rounded-sm ${barClassName}`} />
            <div className={`w-1/3 animate-bar3 rounded-sm ${barClassName}`} />
        </div>
    );
};

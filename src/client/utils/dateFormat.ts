/*!
* Helper to format dates. Likely switch to a library in the future.
*
* Author:  u/Beach-Brews
* License: BSD-3-Clause
*/

export const formatDateTime = (date: Date | number | null) => {
    if (!date) return '';
    const d = typeof date == 'number' ? new Date(date) : date;
    return d.toLocaleString([], {year: '2-digit', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric'});
};

export const formatRelativeDateTime = (date: Date | number | null) => {
    if (!date) return '';

    const theDate = typeof date == 'number' ? new Date(date) : date;
    const diff = (theDate.getTime() - Date.now()) / 1000;
    const isFuture = diff > 0;
    const abs = Math.abs(diff);

    // If less than 1 minute, show soon/now
    if (abs < 60)
        return isFuture ? 'very soon' : 'now';

    // If less than 1 hour, show x minutes
    if (abs < 3600)
        return `${Math.floor(abs/60)} min.${isFuture ? '' : ' ago'}`;

    // If less than 24 hours, show x hours
    if (abs < 86400)
        return `${Math.floor(abs/3600)} hr.${isFuture ? '' : ' ago'}`;

    // If less than 30 days, show x days
    if (abs < 2592000)
        return `${Math.floor(abs/86400)} day${abs<172800?'':'s'}${isFuture ? '' : ' ago'}`;

    // If less than 365 days, show x months
    if (abs < 31536000)
        return `${Math.floor(abs/2592000)} mo.${isFuture ? '' : ' ago'}`;

    // Otherwise, show x years
    return `${Math.floor(abs/31536000)} yr.${isFuture ? '' : ' ago'}`;
}

export const formatDate = (date: Date | number | null) => {
    if (!date) return '';
    const d = typeof date == 'number' ? new Date(date) : date;
    return d.toLocaleDateString();
};

export const formatTime = (date: Date | number | null) => {
    if (!date) return '';
    const d = typeof date == 'number' ? new Date(date) : date;
    return d.toLocaleTimeString();
};

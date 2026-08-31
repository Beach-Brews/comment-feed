/*!
 * Helper for generating consistent snoovatars for usernames.
 *
 * Author:  u/Beach-Brews
 * License: BSD-3-Clause
 */

export const snoovatarForUser = (username: string | `t2_${string}`) => {
    let hash = 0;

    for (let i = 0; i < username.length; i++) {
        hash = (hash << 5) - hash + username.charCodeAt(i);
        hash |= 0;
    }

    const idx = (hash >>> 0) & 7;
    return `https://www.redditstatic.com/avatars/defaults/v2/avatar_default_${idx}.png`;
};
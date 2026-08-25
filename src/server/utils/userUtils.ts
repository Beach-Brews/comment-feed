/*!
 * Various helper methods for user related actions.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { context, reddit, User } from '@devvit/web/server';

export const isMod = async (user?: User): Promise<boolean> => {
    user = user ?? await reddit.getCurrentUser();
    if (!user || !context.subredditName) return false;
    const modPermissions = await user.getModPermissionsForSubreddit(context.subredditName);
    return modPermissions.length > 0;
};

export const isBanned = async (username?: string, subredditName?: string): Promise<boolean>  => {
    username = username ?? context.username;
    subredditName = subredditName ?? context.subredditName;
    if (!username || !subredditName) return false;
    const bannedUsers = await reddit.getBannedUsers({subredditName, username}).get(1);
    return bannedUsers.some(u => u.username === username);
};

export const isApproved = async (username?: string, subredditName?: string): Promise<boolean>  => {
    username = username ?? context.username;
    subredditName = subredditName ?? context.subredditName;
    if (!username || !subredditName) return false;
    const approvedUsers = await reddit.getApprovedUsers({subredditName, username}).get(1);
    return approvedUsers.some(u => u.username === username);
};

export const isMuted = async (username?: string, subredditName?: string): Promise<boolean>  => {
    username = username ?? context.username;
    subredditName = subredditName ?? context.subredditName;
    if (!username || !subredditName) return false;
    const approvedUsers = await reddit.getMutedUsers({subredditName, username}).get(1);
    return approvedUsers.some(u => u.username === username);
};

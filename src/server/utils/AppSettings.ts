/*!
 * Helper for receiving app settings.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import { settings } from '@devvit/web/server';

// Represents the log level of the application.
export enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace
}

// An enum of all settings keys (internal AppSettings use only)
enum SettingKeys {
    // Logging level
    LogLevel = 'logLevel',

    // Comment count
    CommentCount = 'commentCount',

    // User ignore list
    UserIgnoreList = 'userIgnoreList'
}

export class AppSettings {

    // Gets the configured log level to reduce the amount of logs
    public static async GetLogLevel(): Promise<LogLevel> {
        const savedLvl = await settings.get<string[]>(SettingKeys.LogLevel);
        const key = savedLvl && savedLvl.length > 0 && savedLvl[0] ? savedLvl[0] : null;
        return (key ? LogLevel[key as keyof typeof LogLevel] : LogLevel.Error) ?? LogLevel.Error;
    }

    // Gets the configured number of comments to track
    public static async GetCommentCount(): Promise<number> {
        return await settings.get<number>(SettingKeys.CommentCount) ?? 1000;
    }

    // Gets the configured list of usernames to ignore
    public static async GetUserIgnoreList(): Promise<Set<string>> {
        const val = await settings.get<string>(SettingKeys.UserIgnoreList);
        const list = val && val.trim().length > 0
            ? val.split(',')
                .map(v => v.trim().toLowerCase())
                .filter(v => v.length > 0)
            : [];
        list.push('automoderator');
        return new Set(list);
    }

}

/*!
 * Helper for receiving app settings.
 *
 * Author: u/Beach-Brews
 * License: BSD-3-Clause
 */

import {settings} from '@devvit/web/server';

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
    CommentCount = 'commentCount'
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

}

# Subreddit Comment Feed

Displays a feed of the latest comments on your subreddit. Selecting a comment links you to the
comment.

Simple!

## Creating the Comment Feed Post

After installing the app, you can create a new Comment Reed post using the "ellipses" menu of the
main subreddit page.

## How Does it Work?

On install, the top 1000 "hot" posts are scanned and all comments added, up to the first 1000
comments. From there, every new comment submitted will be "tracked" by the app. Removed,
spam, and deleted comments are removed from the list.

## Settings

* **Comment Count** - The max number of comments the app tracks at once. Min: 5, Max: 5000, Default: 1000
* **User Ignore List** - A comma separated list of usernames to ignore / filter from the comment feed. Automod comments are automatically filtered. NOTE: Comments for ignored users already tracked by the app will not be removed. As more comments are added by users, the ignored users will eventually "roll off" the tracked list.
* **Log Level** -  Controls the level of log messages. Warn (default) should be used for performance reasons. The app developer may have you change the log level if receiving support.

## Source Code

The source code for Comment Feed is [open source](https://github.com/Beach-Brews/comment-feed).